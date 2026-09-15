import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Heart, LayoutDashboard, LogOut, MailWarning, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { cancelMyOrder, fetchMyOrders, PAYMENT_METHODS, toDate, updateOwnProfile } from '../lib/db';
import { formatDate, formatPrice } from '../lib/format';
import StatusPill from '../components/admin/StatusPill';
import PageLoader from '../components/PageLoader';
import useSeo from '../hooks/useSeo';

export default function Account() {
  const { user, profile, loading, logout, isStaff, isBlocked, emailVerified, resendVerification, refreshUser } = useAuth();
  const { count: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [orders, setOrders] = useState(null);
  const [ordersError, setOrdersError] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [saveState, setSaveState] = useState('');
  const [verifyMessage, setVerifyMessage] = useState('');
  useSeo({ title: 'My Account', noindex: true });

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

  const handleCancel = async (order) => {
    if (!window.confirm(`Cancel order ${order.orderNumber}?`)) return;
    try {
      await cancelMyOrder(order);
      setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, status: 'Cancelled' } : o)));
    } catch (err) {
      console.error(err);
      window.alert('This order can no longer be cancelled online. Please contact us.');
    }
  };

  const handleResend = async () => {
    try {
      await resendVerification();
      setVerifyMessage('Verification email sent — check your inbox and spam folder.');
    } catch {
      setVerifyMessage('Please wait a minute before requesting another email.');
    }
  };

  const handleCheckVerified = async () => {
    const verified = await refreshUser();
    setVerifyMessage(verified ? '' : 'Not verified yet — click the link in the email first.');
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-stone-500">My Account</p>
            <h1 className="font-serif text-4xl font-bold text-stone-900">Hello, {profile?.name?.split(' ')[0] || 'there'}</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/wishlist" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-stone-300 text-stone-700 text-sm font-semibold hover:bg-white">
              <Heart className="w-4 h-4" /> Wishlist ({wishlistCount})
            </Link>
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

        {!emailVerified && (
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">
            <MailWarning className="w-5 h-5 flex-shrink-0" />
            <p className="flex-1">
              Please verify your email address ({user.email}). We sent you a link when you signed up.
              {verifyMessage && <span className="block text-xs mt-1">{verifyMessage}</span>}
            </p>
            <div className="flex gap-3">
              <button onClick={handleResend} className="font-semibold underline">Resend email</button>
              <button onClick={handleCheckVerified} className="font-semibold underline">I've verified</button>
            </div>
          </div>
        )}

        {isBlocked && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-800">
            This account has been restricted and cannot place new orders. Please <Link to="/contact" className="underline font-semibold">contact us</Link> if you think this is a mistake.
          </div>
        )}

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
            <p className="text-xs text-stone-500">Email: {user.email} {emailVerified && <span className="text-emerald-700">(verified)</span>}</p>
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
                    {order.items.map((item, idx) => (
                      <li key={idx} className="flex justify-between gap-4">
                        <span>
                          <span className="text-stone-400">{item.quantity}×</span> {item.name}
                          {Object.entries(item.options || {}).map(([k, v]) => (
                            <span key={k} className="text-stone-400"> • {k}: {v}</span>
                          ))}
                        </span>
                        <span className="whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-3">
                    {order.status === 'Pending' ? (
                      <button onClick={() => handleCancel(order)} className="text-xs font-semibold text-red-600 hover:underline">Cancel order</button>
                    ) : (
                      <span />
                    )}
                    <p className="font-bold text-stone-900">
                      {order.discount > 0 && <span className="text-xs font-normal text-emerald-700 mr-2">−{formatPrice(order.discount)} ({order.couponCode})</span>}
                      Total {formatPrice(order.total)}
                    </p>
                  </div>
                </article>
              ))
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
