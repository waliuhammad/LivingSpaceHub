import React, { useMemo, useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import Modal, { fieldClass, labelClass, primaryBtn, secondaryBtn } from '../../components/admin/Modal';
import ImageUploader from '../../components/admin/ImageUploader';
import useLiveQuery from '../../hooks/useLiveQuery';
import { deleteProduct, saveProduct, subscribeCategories, subscribeProducts } from '../../lib/db';
import { optimizeImage } from '../../lib/cloudinary';
import { formatPrice } from '../../lib/format';
import { Search, Plus, Edit2, Trash2, Star, EyeOff, DownloadCloud, Loader2 } from 'lucide-react';

const EMPTY_PRODUCT = { name: '', price: '', category: '', description: '', image: '', imagePublicId: '', stock: 0, featured: false, active: true };

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
  const [form, setForm] = useState({ ...EMPTY_PRODUCT, ...initial });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.category) {
      setError('Create a category first, then assign it to the product.');
      return;
    }
    setSaving(true);
    try {
      await saveProduct(initial.id || null, form);
      onClose();
    } catch (err) {
      setError(err.code === 'permission-denied' ? 'You do not have permission to edit products.' : err.message);
      setSaving(false);
    }
  };

  return (
    <Modal
      title={initial.id ? 'Edit Product' : 'New Product'}
      onClose={onClose}
      wide
      footer={
        <>
          <button type="button" onClick={onClose} className={secondaryBtn}>Cancel</button>
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
            <textarea id="p-desc" rows={5} maxLength={3000} value={form.description} onChange={set('description')} className={fieldClass} placeholder="Leave blank to use a default description for the category." />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.featured} onChange={set('featured')} className="accent-[#5A5A40]" />
            Featured (shown in Trending Products on the homepage)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={form.active} onChange={set('active')} className="accent-[#5A5A40]" />
            Visible in the shop
          </label>
        </div>
        <div>
          <ImageUploader
            label="Product Image"
            folder="products"
            value={form.image}
            onChange={({ url, publicId }) => setForm((f) => ({ ...f, image: url, imagePublicId: publicId }))}
          />
          {error && <p className="text-sm text-red-600 mt-4" role="alert">{error}</p>}
        </div>
      </form>
    </Modal>
  );
}
