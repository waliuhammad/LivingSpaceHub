import React, { useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import Modal, { fieldClass, labelClass, primaryBtn, secondaryBtn } from '../../components/admin/Modal';
import ImageUploader from '../../components/admin/ImageUploader';
import useLiveQuery from '../../hooks/useLiveQuery';
import { deleteCategory, saveCategory, slugify, subscribeCategories, subscribeProducts } from '../../lib/db';
import { optimizeImage } from '../../lib/cloudinary';
import { deleteCloudinaryImages } from '../../lib/api';
import { Plus, Tag, Trash2, Edit2, Loader2 } from 'lucide-react';

export default function Categories() {
  const { data: categories, loading } = useLiveQuery(subscribeCategories);
  const { data: products } = useLiveQuery(subscribeProducts);
  const [editing, setEditing] = useState(null);

  const countFor = (slug) => products.filter((p) => p.category === slug).length;

  const handleDelete = async (cat) => {
    const count = countFor(cat.id);
    if (count > 0) {
      window.alert(`"${cat.label}" still has ${count} product(s). Move or delete them first.`);
      return;
    }
    if (!window.confirm(`Delete the "${cat.label}" category?`)) return;
    try {
      await deleteCategory(cat.id);
      deleteCloudinaryImages([cat.imagePublicId]);
    } catch (err) {
      window.alert(`Could not delete category: ${err.message}`);
    }
  };

  return (
    <div>
      <AdminPageHeader titlePrefix="Store" titleAccent="Categories" subtitle="Manage product categories and collections">
        <button onClick={() => setEditing({ label: '', subtitle: '', image: '', imagePublicId: '', sortOrder: categories.length })} className={primaryBtn}>
          <Plus size={16} />
          New Category
        </button>
      </AdminPageHeader>

      {loading ? (
        <p className="text-gray-400 text-center py-12">Loading categories…</p>
      ) : categories.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No categories yet. Create one, or import the starter catalog from the Products page.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center group">
              <div className="flex items-center gap-4">
                {cat.image ? (
                  <img src={optimizeImage(cat.image, 96)} alt="" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center">
                    <Tag size={24} />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{cat.label}</h3>
                  <p className="text-gray-500 text-sm">
                    {countFor(cat.id)} Products • <span className="font-mono text-xs">{cat.id}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                <button onClick={() => setEditing(cat)} className="p-2 text-gray-400 hover:text-[#5A5A40] hover:bg-gray-100 rounded-lg transition-colors" aria-label={`Edit ${cat.label}`}>
                  <Edit2 size={18} />
                </button>
                <button onClick={() => handleDelete(cat)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" aria-label={`Delete ${cat.label}`}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && <CategoryForm initial={editing} existingIds={categories.map((c) => c.id)} onClose={() => setEditing(null)} />}
    </div>
  );
}

function CategoryForm({ initial, existingIds, onClose }) {
  const isNew = !initial.id;
  const [form, setForm] = useState(initial);
  const [uploaded, setUploaded] = useState([]);

  const handleCancel = () => {
    deleteCloudinaryImages(uploaded.filter((id) => id !== initial.imagePublicId));
    onClose();
  };
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const slug = isNew ? slugify(form.label) : initial.id;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!slug) {
      setError('Please enter a name.');
      return;
    }
    if (isNew && existingIds.includes(slug)) {
      setError('A category with this name already exists.');
      return;
    }
    setSaving(true);
    try {
      await saveCategory(slug, form);
      deleteCloudinaryImages([initial.imagePublicId, ...uploaded].filter((id) => id && id !== form.imagePublicId));
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isNew ? 'New Category' : 'Edit Category'}
      onClose={handleCancel}
      footer={
        <>
          <button type="button" onClick={handleCancel} className={secondaryBtn}>Cancel</button>
          <button type="submit" form="category-form" disabled={saving} className={primaryBtn}>
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? 'Saving…' : 'Save Category'}
          </button>
        </>
      }
    >
      <form id="category-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="c-label" className={labelClass}>Name</label>
          <input id="c-label" required maxLength={60} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className={fieldClass} />
          <p className="text-xs text-gray-500 mt-1">URL key: <span className="font-mono">{slug || '—'}</span>{!isNew && ' (fixed)'}</p>
        </div>
        <div>
          <label htmlFor="c-subtitle" className={labelClass}>Tagline</label>
          <input id="c-subtitle" maxLength={80} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className={fieldClass} placeholder="e.g. Serene Sanctuaries" />
        </div>
        <div>
          <label htmlFor="c-order" className={labelClass}>Display Order</label>
          <input id="c-order" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} className={fieldClass} />
        </div>
        <ImageUploader
          label="Cover Image (homepage)"
          folder="categories"
          aspect="aspect-[4/5]"
          value={form.image}
          onChange={({ url, publicId }) => {
            setForm((f) => ({ ...f, image: url, imagePublicId: publicId }));
            setUploaded((list) => [...list, publicId]);
          }}
        />
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      </form>
    </Modal>
  );
}
