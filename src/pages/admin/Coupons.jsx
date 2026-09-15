import React, { useMemo, useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import Modal, { fieldClass, labelClass, primaryBtn, secondaryBtn } from '../../components/admin/Modal';
import StatusPill from '../../components/admin/StatusPill';
import useLiveQuery from '../../hooks/useLiveQuery';
import { deleteCoupon, normalizeCouponCode, saveCoupon, subscribeCoupons, subscribeOrders, toDate } from '../../lib/db';
import { formatPrice } from '../../lib/format';
import { Edit2, Loader2, Plus, Trash2 } from 'lucide-react';

const EMPTY = { code: '', type: 'percent', value: 10, minSubtotal: 0, active: true, expiresAt: '', description: '' };

export default function Coupons() {
  const { data: coupons, loading } = useLiveQuery(subscribeCoupons);
  const { data: orders } = useLiveQuery(subscribeOrders);
  const [editing, setEditing] = useState(null);

  const usage = useMemo(() => {
    const map = {};
    for (const o of orders) {
      if (!o.couponCode || o.status === 'Cancelled') continue;
      const u = (map[o.couponCode] ||= { uses: 0, discount: 0 });
      u.uses += 1;
      u.discount += o.discount || 0;
    }
    return map;
  }, [orders]);

  const statusOf = (c) => {
    if (!c.active) return 'Inactive';
    const expires = toDate(c.expiresAt);
    return expires && expires <= new Date() ? 'Expired' : 'Active';
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Delete coupon ${c.code}? Past orders keep their discount.`)) return;
    await deleteCoupon(c.code).catch((err) => window.alert(err.message));
  };

  return (
    <div>
      <AdminPageHeader titlePrefix="Store" titleAccent="Coupons" subtitle="Discount codes customers can enter at checkout">
        <button onClick={() => setEditing({ ...EMPTY })} className={primaryBtn}>
          <Plus size={16} /> New Coupon
        </button>
      </AdminPageHeader>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
              <th className="px-6 py-3 font-semibold">Code</th>
              <th className="px-6 py-3 font-semibold">Discount</th>
              <th className="px-6 py-3 font-semibold">Min. order</th>
              <th className="px-6 py-3 font-semibold">Expires</th>
              <th className="px-6 py-3 font-semibold">Used</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50/50">
                <td className="px-6 py-4">
                  <p className="font-mono font-bold text-gray-900">{c.code}</p>
                  {c.description && <p className="text-xs text-gray-500">{c.description}</p>}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{c.type === 'percent' ? `${c.value}% off` : `${formatPrice(c.value)} off`}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{c.minSubtotal ? formatPrice(c.minSubtotal) : '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{toDate(c.expiresAt)?.toLocaleDateString('en-PK') || 'Never'}</td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {usage[c.code]?.uses || 0}×
                  {usage[c.code] && <span className="block text-xs text-gray-400">{formatPrice(usage[c.code].discount)} given</span>}
                </td>
                <td className="px-6 py-4"><StatusPill status={statusOf(c)} /></td>
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <button
                    onClick={() => setEditing({ ...c, expiresAt: toDate(c.expiresAt)?.toISOString().slice(0, 10) || '' })}
                    className="p-2 text-gray-400 hover:text-[#5A5A40]"
                    aria-label={`Edit ${c.code}`}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(c)} className="p-2 text-gray-400 hover:text-red-600" aria-label={`Delete ${c.code}`}>
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">{loading ? 'Loading…' : 'No coupons yet.'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && <CouponForm initial={editing} existing={coupons.map((c) => c.code)} onClose={() => setEditing(null)} />}
    </div>
  );
}

function CouponForm({ initial, existing, onClose }) {
  const isNew = !initial.id;
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const code = normalizeCouponCode(form.code);
    if (!/^[A-Z0-9_-]{3,30}$/.test(code)) {
      setError('Code must be 3–30 characters: letters, numbers, - or _.');
      return;
    }
    if (isNew && existing.includes(code)) {
      setError('A coupon with this code already exists.');
      return;
    }
    if (form.type === 'percent' && (Number(form.value) <= 0 || Number(form.value) > 100)) {
      setError('Percentage must be between 1 and 100.');
      return;
    }
    setSaving(true);
    try {
      await saveCoupon({ ...form, code });
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Modal
      title={isNew ? 'New Coupon' : `Edit ${initial.code}`}
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className={secondaryBtn}>Cancel</button>
          <button type="submit" form="coupon-form" disabled={saving} className={primaryBtn}>
            {saving && <Loader2 size={16} className="animate-spin" />}
            Save Coupon
          </button>
        </>
      }
    >
      <form id="coupon-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="cp-code" className={labelClass}>Code</label>
          <input id="cp-code" required disabled={!isNew} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className={`${fieldClass} font-mono uppercase`} placeholder="EID20" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="cp-type" className={labelClass}>Type</label>
            <select id="cp-type" value={form.type} onChange={set('type')} className={fieldClass}>
              <option value="percent">Percentage off</option>
              <option value="fixed">Fixed amount off (Rs.)</option>
            </select>
          </div>
          <div>
            <label htmlFor="cp-value" className={labelClass}>{form.type === 'percent' ? 'Percent' : 'Amount (Rs.)'}</label>
            <input id="cp-value" type="number" required min="1" max={form.type === 'percent' ? 100 : undefined} value={form.value} onChange={set('value')} className={fieldClass} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="cp-min" className={labelClass}>Minimum order (Rs.)</label>
            <input id="cp-min" type="number" min="0" value={form.minSubtotal} onChange={set('minSubtotal')} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="cp-exp" className={labelClass}>Expires on</label>
            <input id="cp-exp" type="date" value={form.expiresAt} onChange={set('expiresAt')} className={fieldClass} />
          </div>
        </div>
        <div>
          <label htmlFor="cp-desc" className={labelClass}>Note (admin only)</label>
          <input id="cp-desc" maxLength={120} value={form.description} onChange={set('description')} className={fieldClass} placeholder="Eid campaign on Instagram" />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.active} onChange={set('active')} className="accent-[#5A5A40]" /> Active
        </label>
        <p className="text-xs text-gray-500">The discount applies to the product subtotal (not shipping). Shipping is still worked out from the subtotal before the discount.</p>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      </form>
    </Modal>
  );
}
