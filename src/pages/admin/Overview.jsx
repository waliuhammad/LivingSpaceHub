import React from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StatCard from '../../components/admin/StatCard';
import SummaryPanel from '../../components/admin/SummaryPanel';
import { mockSalesData, mockOrders, mockTransactions, mockUsers } from '../../data/mockAdminData';
import productsData from '../../data/products.json';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, Package, Users } from 'lucide-react';

export default function Overview() {
  const totalRevenue = mockTransactions.filter(t => t.status === 'Settled').reduce((sum, t) => sum + t.amount, 0);
  const totalOrders = mockOrders.length;
  const totalProducts = productsData.length;
  const totalUsers = mockUsers.length;

  return (
    <div>
      <AdminPageHeader 
        titlePrefix="Store" 
        titleAccent="Insights" 
        subtitle="Dashboard overview and key metrics" 
        statusLabel="DATABASE: CONNECTED"
      >
        <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
          <div className="bg-blue-100 text-blue-700 p-1.5 rounded-lg">
            <DollarSign size={16} />
          </div>
          <div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">TOTAL REVENUE</div>
            <div className="text-xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</div>
          </div>
        </div>
      </AdminPageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={DollarSign} color="blue" badge="LIVE" label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} />
        <StatCard icon={ShoppingBag} color="green" badge="LIVE" label="Total Orders" value={totalOrders} />
        <StatCard icon={Package} color="amber" badge="100% STOCKED" label="Products" value={totalProducts} />
        <StatCard icon={Users} color="purple" badge="ACTIVE" label="Registered Users" value={totalUsers} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
          <h3 className="font-serif font-bold text-lg mb-6 text-gray-900">Last 7 Days Sales</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockSalesData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#111827', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }} />
                <Line type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#5A5A40" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="orders" name="Orders" stroke="#D4A373" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="lg:col-span-1 h-[400px]">
          <SummaryPanel 
            title="Store Summary" 
            rows={[
              { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, color: 'text-[#D4A373]' },
              { label: 'Total Orders', value: totalOrders.toString() },
              { label: 'Total Products', value: totalProducts.toString() },
              { label: 'Registered Users', value: totalUsers.toString() },
              { label: 'Stock Level', value: 'Healthy', color: 'text-green-400' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
