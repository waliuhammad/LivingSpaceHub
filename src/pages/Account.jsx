import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchMyOrders, PAYMENT_METHODS, toDate, updateOwnProfile } from '../lib/db';
import { formatDate, formatPrice } from '../lib/format';
import StatusPill from '../components/admin/StatusPill';
import PageLoader from '../components/PageLoader';

export default function Account() {
  const { user, profile, loading, logout, isStaff } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState(null);
  const [ordersError, setOrdersError] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [saveState, setSaveState] = useState('');

  useEffect(() => {
    if (!user) return;
    fetchMyOrders(user.uid)
      .then(setOrders)
      .catch((err) => {
        console.error('Could not load orders', err);
        setOrdersError(true);
        setOrders([]);
      });
  }, [user]);

  useEffect(() => {
    if (profile) setForm({ name: profile.name || '', phone: profile.phone || '' });
  }, [profile]);

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: '/account' }} />;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveState('saving');
    try {
      await updateOwnProfile(user.uid, form);
      setSaveState('saved');
      setTimeout(() => setSaveState(''), 2500);
    } catch (err) {
      console.error(err);
      setSaveState('error');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-stone-500">My Account</p>
            <h1 className="font-serif text-4xl font-bold text-stone-900">Hello, {profile?.name?.split(' ')[0] || 'there'}</h1>
          </div>
          <div className="flex gap-3">
            {isStaff && (
              <Link to="/admin" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-stone-900 text-white text-sm font-semibold">
                <LayoutDashboard className="w-4 h-4" /> Admin Panel
              </Link>
            )}
            <button onClick={handleLogout} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-stone-300 text-stone-700 text-sm font-semibold hover:bg-white">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200/60 space-y-4">
            <h2 className="font-serif text-xl font-bold text-stone-900">Profile</h2>
            <div>
              <label htmlFor="acc-name" className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">Name</label>
              <input id="acc-name" required maxLength={100} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/30" />
            </div>
            <div>
              <label htmlFor="acc-phone" className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">Phone</label>
              <input id="acc-phone" type="tel" maxLength={20} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/30" />
            </div>
            <p className="text-xs text-stone-500">Email: {user.email}</p>
            <button type="submit" disabled={saveState === 'saving'} className="w-full py-2.5 rounded-full bg-[#5A5A40] text-white text-sm font-semibold disabled:opacity-60">
              {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved ✓' : 'Save Profile'}
            </button>
            {saveState === 'error' && <p className="text-xs text-red-600">Could not save. Please try again.</p>}
          </form>

          <section className="lg:col-span-2 space-y-4">
            <h2 className="font-serif text-xl font-bold text-stone-900">My Orders</h2>
            {orders === null ? (
              <PageLoader />
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-stone-200/60">
                <Package className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-600 text-sm mb-4">{ordersError ? 'Could not load your orders right now.' : "You haven't placed any orders yet."}</p>
                <Link to="/shop" className="text-sm font-semibold text-[#5A5A40] underline">Start shopping</Link>
              </div>
            ) : (
              orders.map((order) => (
                <article key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200/60">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="font-mono font-bold text-stone-900">{order.orderNumber}</p>
                      <p className="text-xs text-stone-500">{formatDate(toDate(order.createdAt))} • {PAYMENT_METHODS[order.payment?.method]}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusPill status={order.status} />
                      {order.payment?.status === 'Paid' && <StatusPill status="Paid" />}
                    </div>
                  </div>
                  <ul className="text-sm text-stone-700 space-y-1 mb-3">
                    {order.items.map((item) => (
                      <li key={item.productId} className="flex justify-between">
                        <span><span className="text-stone-400">{item.quantity}×</span> {item.name}</span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-right font-bold text-stone-900 border-t border-stone-100 pt-3">Total {formatPrice(order.total)}</p>
                </article>
              ))
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
