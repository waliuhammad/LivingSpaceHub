import React, { useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { Save, Image as ImageIcon, Truck, Check } from 'lucide-react';

export default function Settings() {
  const [shipping, setShipping] = useState({
    threshold: 150,
    fee: 15
  });

  const [saved, setSaved] = useState('');

  const handleSave = (section) => {
    setSaved(section);
    setTimeout(() => setSaved(''), 3000);
  };

  return (
    <div>
      <AdminPageHeader 
        titlePrefix="Store" 
        titleAccent="Configuration" 
        subtitle="Manage global store settings and content"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Shipping Settings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Truck size={20} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Shipping Rules</h3>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Free Shipping Threshold ($)</label>
              <input 
                type="number" 
                value={shipping.threshold}
                onChange={e => setShipping({...shipping, threshold: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40]"
              />
              <p className="text-xs text-gray-500 mt-2">Orders above this amount qualify for free shipping.</p>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Standard Shipping Fee ($)</label>
              <input 
                type="number" 
                value={shipping.fee}
                onChange={e => setShipping({...shipping, fee: Number(e.target.value)})}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40]"
              />
              <p className="text-xs text-gray-500 mt-2">Flat rate applied to orders below the threshold.</p>
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
            <button 
              onClick={() => handleSave('shipping')}
              className="bg-[#5A5A40] text-white px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-[#4a4a35] transition-colors"
            >
              {saved === 'shipping' ? <Check size={16} /> : <Save size={16} />}
              {saved === 'shipping' ? 'Saved!' : 'Save Configuration'}
            </button>
          </div>
        </div>

        {/* Hero Banner Images */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <ImageIcon size={20} />
            </div>
            <h3 className="font-bold text-gray-900 text-lg">Hero Banner Images</h3>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="p-4 border-2 border-dashed border-gray-200 rounded-xl text-center bg-gray-50">
              <ImageIcon size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm font-bold text-gray-700 mb-1">Upload new background</p>
              <p className="text-xs text-gray-500 mb-4">PNG, JPG up to 5MB (1920x1080 recommended)</p>
              <input type="file" id="hero-upload" className="hidden" />
              <label htmlFor="hero-upload" className="inline-block bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-50">
                Browse Files
              </label>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Image</h4>
              <div className="relative rounded-xl overflow-hidden h-32 group">
                <img src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace" alt="Hero Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="text-white text-sm font-medium bg-red-600/80 px-3 py-1.5 rounded-lg hover:bg-red-600">Remove</button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
            <button 
              onClick={() => handleSave('hero')}
              className="bg-[#5A5A40] text-white px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-[#4a4a35] transition-colors"
            >
              {saved === 'hero' ? <Check size={16} /> : <Save size={16} />}
              {saved === 'hero' ? 'Saved!' : 'Save Images'}
            </button>
          </div>
        </div>
      </div>
      
      <p className="text-center text-sm text-gray-400">All configuration changes go live immediately upon saving.</p>
    </div>
  );
}
