import React, { useEffect, useMemo, useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StatCard from '../../components/admin/StatCard';
import SummaryPanel from '../../components/admin/SummaryPanel';
import useLiveQuery from '../../hooks/useLiveQuery';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../lib/roles';
import { countUsers, subscribeOrders, subscribeProducts, toDate } from '../../lib/db';
import { formatPrice } from '../../lib/format';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Banknote, ShoppingBag, Package, Users } from 'lucide-react';

const dayKey = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export default function Overview() {
  const { data: orders, error: ordersError } = useLiveQuery(subscribeOrders);
  const { data: products } = useLiveQuery(subscribeProducts);
  const { role } = useAuth();
  const [userCount, setUserCount] = useState(null);

  useEffect(() => {
    countUsers().then(setUserCount).catch(() => setUserCount(null));
  }, []);

  const stats = useMemo(() => {
    const live = orders.filter((o) => o.status !== 'Cancelled');
    const revenue = live.filter((o) => o.payment?.status === 'Paid').reduce((s, o) => s + o.total, 0);
    const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
    const outOfStock = products.filter((p) => (Number(p.stock) || 0) === 0).length;
    const lowStock = products.filter((p) => {
      const s = Number(p.stock) || 0;
      return s > 0 && s <= 5;
    }).length;

    // Last 7 days, oldest first
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - (6 - i));
      return { key: dayKey(d), name: d.toLocaleDateString('en-PK', { weekday: 'short' }), revenue: 0, orders: 0 };
    });
    const byKey = Object.fromEntries(days.map((d) => [d.key, d]));
    live.forEach((o) => {
      const date = toDate(o.createdAt);
      const bucket = date && byKey[dayKey(date)];
      if (bucket) {
        bucket.orders += 1;
        bucket.revenue += o.total;
      }
    });

    return { revenue, pendingOrders, outOfStock, lowStock, days };
  }, [orders, products]);

  const stockLabel = stats.outOfStock ? `${stats.outOfStock} out of stock` : stats.lowStock ? `${stats.lowStock} running low` : 'Healthy';

  return (
    <div>
      <AdminPageHeader
        titlePrefix="Store"
        titleAccent="Insights"
        subtitle="Dashboard overview and key metrics"
        statusLabel={ordersError ? 'DATABASE: ERROR' : 'DATABASE: CONNECTED'}
        statusColor={ordersError ? 'amber' : 'green'}
      >
        {can.viewTransactions(role) && (
          <div className="bg-white border border-gray-200 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
            <div className="bg-blue-100 text-blue-700 p-1.5 rounded-lg">
              <Banknote size={16} />
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">REVENUE RECEIVED</div>
              <div className="text-xl font-bold text-gray-900">{formatPrice(stats.revenue)}</div>
            </div>
          </div>
        )}
      </AdminPageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Banknote} color="blue" badge="PAID" label="Revenue Received" value={formatPrice(stats.revenue)} />
        <StatCard icon={ShoppingBag} color="green" badge={`${stats.pendingOrders} PENDING`} label="Total Orders" value={orders.length} />
        <StatCard icon={Package} color="amber" badge={stats.outOfStock ? `${stats.outOfStock} SOLD OUT` : 'IN STOCK'} label="Products" value={products.length} />
        <StatCard icon={Users} color="purple" badge="ACCOUNTS" label="Registered Users" value={userCount ?? '—'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
          <h3 className="font-serif font-bold text-lg mb-6 text-gray-900">Last 7 Days Sales</h3>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.days} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                <YAxis yAxisId="revenue" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis yAxisId="orders" orientation="right" allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) => (name === 'Revenue (Rs.)' ? formatPrice(value) : value)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#111827', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '14px' }} />
                <Line yAxisId="revenue" type="monotone" dataKey="revenue" name="Revenue (Rs.)" stroke="#5A5A40" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line yAxisId="orders" type="monotone" dataKey="orders" name="Orders" stroke="#D4A373" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-1 h-[400px]">
          <SummaryPanel
            title="Store Summary"
            rows={[
              { label: 'Revenue Received', value: formatPrice(stats.revenue), color: 'text-[#D4A373]' },
              { label: 'Pending Orders', value: String(stats.pendingOrders) },
              { label: 'Total Products', value: String(products.length) },
              { label: 'Registered Users', value: userCount === null ? '—' : String(userCount) },
              { label: 'Stock Level', value: stockLabel, color: stats.outOfStock ? 'text-red-400' : stats.lowStock ? 'text-amber-400' : 'text-green-400' },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
