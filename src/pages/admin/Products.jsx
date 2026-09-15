import React, { useMemo, useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import Modal, { fieldClass, labelClass, primaryBtn, secondaryBtn } from '../../components/admin/Modal';
import ImageUploader from '../../components/admin/ImageUploader';
import GalleryUploader from '../../components/admin/GalleryUploader';
import useLiveQuery from '../../hooks/useLiveQuery';
import { deleteProduct, productImageIds, saveProduct, subscribeCategories, subscribeProducts } from '../../lib/db';
import { deleteCloudinaryImages } from '../../lib/api';
import { optimizeImage } from '../../lib/cloudinary';
import { formatPrice } from '../../lib/format';
import { Search, Plus, Edit2, Trash2, Star, EyeOff, DownloadCloud, Loader2 } from 'lucide-react';

const EMPTY_PRODUCT = {
  name: '',
  price: '',
  category: '',
  description: '',
  image: '',
  imagePublicId: '',
  images: [],
  options: [],
  details: [],
  shippingInfo: '',
  careInfo: '',
  stock: 0,
  featured: false,
  active: true,
};

export default function Products() {
  const { data: products, loading, error } = useLiveQuery(subscribeProducts);
  const { data: categories } = useLiveQuery(subscribeCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editing, setEditing] = useState(null); // null | { id?, ...fields }
  const [importState, setImportState] = useState(null);

  const categoryLabel = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.label])), [categories]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(product.id);
      deleteCloudinaryImages(productImageIds(product));
    } catch (err) {
      window.alert(`Could not delete product: ${err.message}`);
    }
  };

  const handleImport = async () => {
    if (!window.confirm('Import the 47 starter products and 4 categories? Images are copied to Cloudinary, which takes a minute or two.')) return;
    setImportState({ done: 0, total: 1, label: 'Starting…' });
    try {
      const { importStarterCatalog } = await import('../../lib/seed');
      await importStarterCatalog(setImportState);
      setImportState(null);
    } catch (err) {
      setImportState(null);
      window.alert(`Import stopped: ${err.message}`);
    }
  };

  return (
    <div>
      <AdminPageHeader titlePrefix="Store" titleAccent="Inventory" subtitle="Manage your products and stock">
        <button onClick={() => setEditing({ ...EMPTY_PRODUCT, category: categories[0]?.id || '' })} className={primaryBtn}>
          <Plus size={16} />
          New Product
        </button>
      </AdminPageHeader>

      {importState && (
        <div className="mb-6 bg-white border border-gray-200 rounded-2xl p-4 flex items-center gap-4">
          <Loader2 className="animate-spin text-[#5A5A40]" size={20} />
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900">Importing catalog… {importState.done}/{importState.total}</p>
            <p className="text-xs text-gray-500 truncate">{importState.label}</p>
            <div className="h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-[#5A5A40] transition-all" style={{ width: `${(importState.done / importState.total) * 100}%` }} />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40]"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40] bg-white"
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-4 font-semibold">Product</th>
                <th className="px-6 py-4 font-semibold">Category</th>
                <th className="px-6 py-4 font-semibold">Price</th>
                <th className="px-6 py-4 font-semibold">Stock</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => {
                const stock = Number(product.stock) || 0;
                return (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {product.image && <img src={optimizeImage(product.image, 96)} alt={product.name} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 flex items-center gap-2">
                            {product.name}
                            {product.featured && <Star size={14} className="text-amber-500 fill-amber-400" aria-label="Featured" />}
                            {product.active === false && <EyeOff size={14} className="text-gray-400" aria-label="Hidden" />}
                          </div>
                          <div className="text-xs text-gray-400">ID: {product.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold tracking-wider">
                        {categoryLabel[product.category] || product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${stock === 0 ? 'bg-red-500' : stock <= 5 ? 'bg-amber-500' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(100, (stock / 50) * 100)}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${stock === 0 ? 'text-red-600' : 'text-gray-600'}`}>
                          {stock === 0 ? 'Out of stock' : `${stock} in stock`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditing(product)} className="p-2 text-gray-400 hover:text-[#5A5A40] hover:bg-gray-100 rounded-lg transition-colors" aria-label={`Edit ${product.name}`}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleDelete(product)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" aria-label={`Delete ${product.name}`}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!loading && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    {error ? (
                      'Could not load products.'
                    ) : products.length === 0 ? (
                      <div className="space-y-3">
                        <p>Your catalog is empty.</p>
                        <button onClick={handleImport} disabled={Boolean(importState)} className={`${primaryBtn} mx-auto`}>
                          <DownloadCloud size={16} />
                          Import starter catalog
                        </button>
                      </div>
                    ) : (
                      'No products found matching your search.'
                    )}
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400">Loading products…</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && <ProductForm initial={editing} categories={categories} onClose={() => setEditing(null)} />}
    </div>
  );
}

function ProductForm({ initial, categories, onClose }) {
  const [form, setForm] = useState({
    ...EMPTY_PRODUCT,
    ...initial,
    images: initial.images || [],
    options: (initial.options || []).map((o) => ({ name: o.name, values: o.values.join(', ') })),
    details: initial.details || [],
  });
  const [uploaded, setUploaded] = useState([]); // public ids uploaded in this session
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const trackUpload = (publicId) => publicId && setUploaded((list) => [...list, publicId]);

  const setOption = (index, key, value) =>
    setForm((f) => ({ ...f, options: f.options.map((o, i) => (i === index ? { ...o, [key]: value } : o)) }));

  // Close without saving: remove images uploaded in this session that the saved product doesn't use
  const handleCancel = () => {
    const keep = new Set(productImageIds(initial));
    deleteCloudinaryImages(uploaded.filter((id) => !keep.has(id)));
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.category) {
      setError('Create a category first, then assign it to the product.');
      return;
    }
    setSaving(true);
    try {
      await saveProduct(initial.id || null, {
        ...form,
        options: form.options.map((o) => ({ name: o.name, values: o.values.split(',') })),
      });
      // Delete Cloudinary images that are no longer used (replaced or removed, including this session's discarded uploads)
      const used = new Set([form.imagePublicId, ...form.images.map((i) => i.publicId)].filter(Boolean));
      deleteCloudinaryImages([...productImageIds(initial), ...uploaded].filter((id) => !used.has(id)));
      onClose();
    } catch (err) {
      setError(err.code === 'permission-denied' ? 'You do not have permission to edit products.' : err.message);
      setSaving(false);
    }
  };

  return (
    <Modal
      title={initial.id ? 'Edit Product' : 'New Product'}
      onClose={handleCancel}
      wide
      footer={
        <>
          <button type="button" onClick={handleCancel} className={secondaryBtn}>Cancel</button>
          <button type="submit" form="product-form" disabled={saving} className={primaryBtn}>
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? 'Saving…' : 'Save Product'}
          </button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="p-name" className={labelClass}>Name</label>
            <input id="p-name" required maxLength={200} value={form.name} onChange={set('name')} className={fieldClass} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="p-price" className={labelClass}>Price (Rs.)</label>
              <input id="p-price" type="number" required min="0" step="1" value={form.price} onChange={set('price')} className={fieldClass} />
            </div>
            <div>
              <label htmlFor="p-stock" className={labelClass}>Stock</label>
              <input id="p-stock" type="number" required min="0" step="1" value={form.stock} onChange={set('stock')} className={fieldClass} />
            </div>
          </div>
          <div>
            <label htmlFor="p-category" className={labelClass}>Category</label>
            <select id="p-category" required value={form.category} onChange={set('category')} className={fieldClass}>
              <option value="" disabled>Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="p-desc" className={labelClass}>Description</label>
            <textarea id="p-desc" rows={4} maxLength={3000} value={form.description} onChange={set('description')} className={fieldClass} placeholder="Leave blank to use a default description for the category." />
          </div>

          <fieldset className="space-y-2">
            <legend className={labelClass}>Options (e.g. Colour, Size)</legend>
            {form.options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <input value={option.name} onChange={(e) => setOption(index, 'name', e.target.value)} placeholder="Colour" aria-label={`Option ${index + 1} name`} className={`${fieldClass} w-1/3`} maxLength={30} />
                <input value={option.values} onChange={(e) => setOption(index, 'values', e.target.value)} placeholder="Oak, Walnut, White" aria-label={`Option ${index + 1} values`} className={fieldClass} />
                <button type="button" onClick={() => setForm((f) => ({ ...f, options: f.options.filter((_, i) => i !== index) }))} className="px-2 text-gray-400 hover:text-red-600" aria-label="Remove option">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {form.options.length < 4 && (
              <button type="button" onClick={() => setForm((f) => ({ ...f, options: [...f.options, { name: '', values: '' }] }))} className="text-sm font-medium text-[#5A5A40] hover:underline">
                + Add option
              </button>
            )}
            <p className="text-xs text-gray-500">Separate values with commas. Customers must pick one of each. Stock is shared across options.</p>
          </fieldset>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.featured} onChange={set('featured')} className="accent-[#5A5A40]" />
            Featured (shown in Trending Products on the homepage)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.active} onChange={set('active')} className="accent-[#5A5A40]" />
            Visible in the shop
          </label>
        </div>

        <div className="space-y-5">
          <ImageUploader
            label="Main Image"
            folder="products"
            value={form.image}
            onChange={({ url, publicId }) => {
              setForm((f) => ({ ...f, image: url, imagePublicId: publicId }));
              trackUpload(publicId);
            }}
          />
          <GalleryUploader images={form.images} onChange={(images) => setForm((f) => ({ ...f, images }))} onUploaded={trackUpload} />

          <details className="rounded-xl border border-gray-200 p-4" open={Boolean(form.details.length || form.shippingInfo || form.careInfo)}>
            <summary className="text-sm font-bold text-gray-700 cursor-pointer">Product page tabs (optional)</summary>
            <p className="text-xs text-gray-500 mt-1 mb-3">Leave blank to use the store-wide text from Admin → Content.</p>
            <div className="space-y-3">
              <div>
                <label htmlFor="p-details" className="block text-xs font-semibold text-gray-600 mb-1">Product details (one per line)</label>
                <textarea id="p-details" rows={3} value={form.details.join('\n')} onChange={(e) => setForm((f) => ({ ...f, details: e.target.value.split('\n') }))} className={fieldClass} />
              </div>
              <div>
                <label htmlFor="p-shipping" className="block text-xs font-semibold text-gray-600 mb-1">Shipping &amp; returns</label>
                <textarea id="p-shipping" rows={2} maxLength={1000} value={form.shippingInfo} onChange={set('shippingInfo')} className={fieldClass} />
              </div>
              <div>
                <label htmlFor="p-care" className="block text-xs font-semibold text-gray-600 mb-1">Care &amp; maintenance</label>
                <textarea id="p-care" rows={2} maxLength={1000} value={form.careInfo} onChange={set('careInfo')} className={fieldClass} />
              </div>
            </div>
          </details>

          {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        </div>
      </form>
    </Modal>
  );
}
