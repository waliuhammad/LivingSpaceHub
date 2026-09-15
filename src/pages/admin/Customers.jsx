import React, { useMemo, useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StatusPill from '../../components/admin/StatusPill';
import useLiveQuery from '../../hooks/useLiveQuery';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../lib/roles';
import { setUserBlocked, subscribeCustomers, subscribeOrders, toDate } from '../../lib/db';
import { formatPrice } from '../../lib/format';
import { Ban, Download, Search, ShieldCheck } from 'lucide-react';
import Papa from 'papaparse';

export default function Customers() {
  const { data: customers, loading } = useLiveQuery(subscribeCustomers);
  const { data: orders } = useLiveQuery(subscribeOrders);
  const { role } = useAuth();
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const stats = useMemo(() => {
    const map = {};
    for (const order of orders) {
      if (!order.userId) continue;
      const s = (map[order.userId] ||= { count: 0, spent: 0, last: null });
      s.count += 1;
      if (order.status !== 'Cancelled') s.spent += order.total;
      const date = toDate(order.createdAt);
      if (date && (!s.last || date > s.last)) s.last = date;
    }
    return map;
  }, [orders]);

  const guestOrders = orders.filter((o) => !o.userId).length;

  const q = search.toLowerCase();
  const rows = customers
    .filter((c) => !q || [c.name, c.email, c.phone].filter(Boolean).some((v) => v.toLowerCase().includes(q)))
    .sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0));

  const toggleBlock = async (customer) => {
    const blocking = !customer.blocked;
    if (blocking && !window.confirm(`Block ${customer.name}? They will not be able to place orders or write reviews while signed in.`)) return;
    setError('');
    try {
      await setUserBlocked(customer.id, blocking);
    } catch (err) {
      setError(err.code === 'permission-denied' ? 'Only administrators can block customers.' : err.message);
    }
  };

  const exportCSV = () => {
    const csv = Papa.unparse(
      rows.map((c) => ({
        Name: c.name,
        Email: c.email,
        Phone: c.phone || '',
        Joined: toDate(c.createdAt)?.toLocaleDateString('en-PK') || '',
        Orders: stats[c.id]?.count || 0,
        Spent_PKR: stats[c.id]?.spent || 0,
        Blocked: c.blocked ? 'yes' : 'no',
      }))
    );
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <AdminPageHeader titlePrefix="Store" titleAccent="Customers" subtitle="Registered customer accounts and their order history">
        <button onClick={exportCSV} className="bg-gray-900 text-white px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-black transition-colors">
          <Download size={16} /> Export CSV
        </button>
      </AdminPageHeader>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Registered</p>
          <p className="text-xl font-bold text-gray-900">{customers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">With orders</p>
          <p className="text-xl font-bold text-gray-900">{customers.filter((c) => stats[c.id]).length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Guest orders</p>
          <p className="text-xl font-bold text-gray-900">{guestOrders}</p>
        </div>
      </div>

      {error && <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-2" role="alert">{error}</p>}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, email or phone…"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40]"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                <th className="px-6 py-3 font-semibold">Customer</th>
                <th className="px-6 py-3 font-semibold">Joined</th>
                <th className="px-6 py-3 font-semibold">Orders</th>
                <th className="px-6 py-3 font-semibold">Spent</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                {can.blockCustomers(role) && <th className="px-6 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4 text-sm">
                    <p className="font-bold text-gray-900">{c.name}</p>
                    <p className="text-gray-500">{c.email}{c.phone ? ` • ${c.phone}` : ''}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{toDate(c.createdAt)?.toLocaleDateString('en-PK') || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {stats[c.id]?.count || 0}
                    {stats[c.id]?.last && <span className="block text-xs text-gray-400">last {stats[c.id].last.toLocaleDateString('en-PK')}</span>}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">{formatPrice(stats[c.id]?.spent || 0)}</td>
                  <td className="px-6 py-4">{c.blocked ? <StatusPill status="Blocked" /> : <StatusPill status="Active" />}</td>
                  {can.blockCustomers(role) && (
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => toggleBlock(c)}
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg ${c.blocked ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100' : 'text-red-600 bg-red-50 hover:bg-red-100'}`}
                      >
                        {c.blocked ? <ShieldCheck size={14} /> : <Ban size={14} />}
                        {c.blocked ? 'Unblock' : 'Block'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">{loading ? 'Loading…' : 'No customers found.'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-4 text-center">Blocking stops a signed-in account from ordering and reviewing. Someone could still check out as a guest — decline those orders from the Orders page.</p>
    </div>
  );
}
