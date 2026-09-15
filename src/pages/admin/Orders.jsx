import React, { useMemo, useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StatusPill from '../../components/admin/StatusPill';
import useLiveQuery from '../../hooks/useLiveQuery';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../lib/roles';
import {
  deleteOrder,
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  setOrderStatus,
  subscribeOrders,
  toDate,
  updatePaymentStatus,
} from '../../lib/db';
import { notifyOrderStatus } from '../../lib/api';
import { formatPrice } from '../../lib/format';
import { ChevronDown, ChevronUp, Package, MapPin, CreditCard, MessageCircle, Search, Trash2, Phone, Mail } from 'lucide-react';

const ITEMS_PER_PAGE = 10;

/** Pakistani mobile numbers: 03XX… → 923XX… for wa.me links */
function whatsappNumber(phone) {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.startsWith('0')) return `92${digits.slice(1)}`;
  return digits;
}

export default function Orders() {
  const { data: orders, loading, error } = useLiveQuery(subscribeOrders);
  const { role } = useAuth();
  const [expanded, setExpanded] = useState({});
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');

  const statusCounts = useMemo(
    () => orders.reduce((acc, o) => ({ ...acc, [o.status]: (acc[o.status] || 0) + 1 }), {}),
    [orders]
  );

  const filtered = orders.filter((o) => {
    if (statusFilter !== 'All' && o.status !== statusFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return [o.orderNumber, o.customer?.name, o.customer?.phone, o.customer?.email, o.payment?.reference]
      .filter(Boolean)
      .some((v) => v.toLowerCase().includes(q));
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const run = async (fn) => {
    setActionError('');
    setNotice('');
    try {
      await fn();
    } catch (err) {
      setActionError(err.code === 'permission-denied' ? 'You do not have permission to do that.' : err.message);
    }
  };

  const handleStatus = (order, status) =>
    run(async () => {
      const { stockChanged } = await setOrderStatus(order.id, status);
      const stockNote = stockChanged === 'deducted' ? ' Stock was reduced.' : stockChanged === 'restored' ? ' Stock was restored.' : '';
      const emailNote = order.customer?.email && ['Confirmed', 'Shipped', 'Delivered', 'Cancelled'].includes(status) ? ' Customer email sent.' : '';
      if (emailNote) notifyOrderStatus(order.id);
      setNotice(`${order.orderNumber} marked ${status}.${stockNote}${emailNote}`);
    });

  const handleDelete = (order) => {
    if (!window.confirm(`Permanently delete order ${order.orderNumber}?`)) return;
    run(() => deleteOrder(order));
  };

  return (
    <div>
      <AdminPageHeader titlePrefix="Store" titleAccent="Orders" subtitle="Process and track customer orders" />

      <div className="flex flex-col lg:flex-row gap-4 justify-between mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['All', ...ORDER_STATUSES].map((status) => (
            <button
              key={status}
              onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
              className={`border px-4 py-2 rounded-full flex items-center gap-2 whitespace-nowrap shadow-sm text-sm font-bold uppercase ${
                statusFilter === status ? 'bg-[#5A5A40] border-[#5A5A40] text-white' : 'bg-white border-gray-200 text-gray-700'
              }`}
            >
              {status}
              <span className={`px-2 py-0.5 rounded-full text-xs ${statusFilter === status ? 'bg-white/20' : 'bg-gray-100 text-gray-600'}`}>
                {status === 'All' ? orders.length : statusCounts[status] || 0}
              </span>
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Order #, name, phone, TID…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 focus:border-[#5A5A40]"
          />
        </div>
      </div>

      {actionError && <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-2" role="alert">{actionError}</p>}
      {notice && <p className="mb-4 text-sm text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2" role="status">{notice}</p>}

      <div className="space-y-4">
        {loading && <p className="text-center text-gray-400 py-12">Loading orders…</p>}
        {!loading && error && <p className="text-center text-red-600 py-12">Could not load orders.</p>}
        {!loading && !error && filtered.length === 0 && <p className="text-center text-gray-500 py-12">No orders found.</p>}

        {paginated.map((order) => {
          const date = toDate(order.createdAt);
          const isOpen = expanded[order.id];
          const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
          return (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                type="button"
                className="w-full text-left p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpanded((prev) => ({ ...prev, [order.id]: !prev[order.id] }))}
                aria-expanded={Boolean(isOpen)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                    <Package size={24} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-900 font-mono">{order.orderNumber}</h3>
                      <StatusPill status={order.status} />
                      <StatusPill status={order.payment?.status === 'Paid' ? 'Paid' : `${PAYMENT_METHODS[order.payment?.method] || ''} · ${order.payment?.status}`} />
                    </div>
                    <p className="text-sm text-gray-500">
                      {order.customer?.name} • {date ? date.toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' }) : '—'} • {itemCount} items
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="font-bold text-gray-900">{formatPrice(order.total)}</p>
                  </div>
                  <div className="text-gray-400">{isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</div>
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 bg-gray-50/30 p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Order Items</h4>
                    <div className="space-y-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm gap-4">
                          <span className="text-gray-900">
                            <span className="text-gray-500 mr-2">{item.quantity}×</span>
                            {item.name}
                            {Object.entries(item.options || {}).map(([k, v]) => (
                              <span key={k} className="text-gray-500"> • {k}: {v}</span>
                            ))}
                          </span>
                          <span className="font-medium text-gray-900 whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <dl className="mt-4 pt-4 border-t border-gray-100 space-y-1 text-sm">
                      <div className="flex justify-between"><dt className="text-gray-500">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
                      <div className="flex justify-between"><dt className="text-gray-500">Shipping</dt><dd>{order.shipping ? formatPrice(order.shipping) : 'Free'}</dd></div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-emerald-700"><dt>Coupon {order.couponCode}</dt><dd>−{formatPrice(order.discount)}</dd></div>
                      )}
                      <div className="flex justify-between font-bold"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
                    </dl>
                    {order.notes && (
                      <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3 text-sm text-amber-900">
                        <span className="font-bold">Customer note:</span> {order.notes}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mt-6">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Order Status
                        <select
                          value={order.status}
                          onChange={(e) => handleStatus(order, e.target.value)}
                          className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white normal-case tracking-normal font-medium text-gray-900"
                        >
                          {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </label>
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Payment Status
                        <select
                          value={order.payment?.status}
                          onChange={(e) => run(() => updatePaymentStatus(order, e.target.value))}
                          className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white normal-case tracking-normal font-medium text-gray-900"
                        >
                          {PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Customer Details</h4>
                      <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-2 text-sm">
                        <p className="font-bold text-gray-900">{order.customer?.name}</p>
                        <p className="flex items-center gap-2 text-gray-600"><Phone size={14} className="text-gray-400" /><a href={`tel:${order.customer?.phone}`} className="hover:underline">{order.customer?.phone}</a></p>
                        {order.customer?.email && (
                          <p className="flex items-center gap-2 text-gray-600"><Mail size={14} className="text-gray-400" /><a href={`mailto:${order.customer.email}`} className="hover:underline">{order.customer.email}</a></p>
                        )}
                        <div className="flex items-start gap-2 mt-3 pt-3 border-t border-gray-100">
                          <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-gray-600 leading-tight">{order.customer?.address}, {order.customer?.city}</p>
                        </div>
                        <div className="flex items-start gap-2 mt-2">
                          <CreditCard size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                          <div className="text-gray-600">
                            <p>{PAYMENT_METHODS[order.payment?.method]} — {order.payment?.status}</p>
                            {order.payment?.reference && <p className="font-mono text-gray-900">TID: {order.payment.reference}</p>}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 pt-2">
                          {order.userId ? 'Registered customer' : 'Guest checkout'} •{' '}
                          {order.stockDeducted ? 'Stock taken from inventory' : order.status === 'Cancelled' ? 'Stock returned' : 'Stock not taken (older order — taken when you confirm)'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <a
                        href={`https://wa.me/${whatsappNumber(order.customer?.phone)}?text=${encodeURIComponent(`Hello ${order.customer?.name}, this is Living Space Hub about your order ${order.orderNumber}.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg transition-colors"
                      >
                        <MessageCircle size={16} />
                        Contact on WhatsApp
                      </a>
                      {can.deleteOrders(role) && (
                        <button onClick={() => handleDelete(order)} className="inline-flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors">
                          <Trash2 size={16} />
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <button onClick={() => setCurrentPage(Math.max(page - 1, 1))} disabled={page === 1} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg disabled:opacity-50">
              Previous
            </button>
            <span className="text-sm text-gray-700">Page {page} of {totalPages}</span>
            <button onClick={() => setCurrentPage(Math.min(page + 1, totalPages))} disabled={page === totalPages} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg disabled:opacity-50">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
