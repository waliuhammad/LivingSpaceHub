import React from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import productsData from '../../data/products.json';
import { Plus, Tag, Trash2, Edit2 } from 'lucide-react';

export default function Categories() {
  const categoriesMap = productsData.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});

  const categories = Object.entries(categoriesMap).map(([category, products], index) => ({
    id: index + 1,
    category,
    products
  }));

  return (
    <div>
      <AdminPageHeader 
        titlePrefix="Store" 
        titleAccent="Categories" 
        subtitle="Manage product categories and collections"
      >
        <button className="bg-[#5A5A40] text-white px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-[#4a4a35] transition-colors">
          <Plus size={16} />
          New Category
        </button>
      </AdminPageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center">
                <Tag size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{cat.category}</h3>
                <p className="text-gray-500 text-sm">{cat.products.length} Products</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 text-gray-400 hover:text-[#5A5A40] hover:bg-gray-100 rounded-lg transition-colors">
                <Edit2 size={18} />
              </button>
              <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" onClick={() => window.confirm('Are you sure you want to delete this category?')}>
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
