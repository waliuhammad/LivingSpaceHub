import React, { useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import productsData from '../../data/products.json';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';

export default function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Flatten products from categories
  const allProducts = productsData.map(p => ({ ...p, categoryName: p.category }));

  const filteredProducts = allProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.categoryName === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <AdminPageHeader 
        titlePrefix="Store" 
        titleAccent="Inventory" 
        subtitle="Manage your products and stock"
      >
        <button className="bg-[#5A5A40] text-white px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-[#4a4a35] transition-colors">
          <Plus size={16} />
          New Product
        </button>
      </AdminPageHeader>

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
            {Array.from(new Set(productsData.map(p => p.category))).map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
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
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{product.name}</div>
                        <div className="text-xs text-gray-400">ID: {product.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold tracking-wider">
                      {product.categoryName}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    ${product.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <span className="text-xs font-medium text-gray-600">42 in stock</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-[#5A5A40] hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No products found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
