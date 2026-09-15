import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, Banknote, ChevronRight, Loader2, Smartphone, Tag, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { calcDiscount, calcShipping, fetchCoupon, OutOfStockError, placeOrder, PAYMENT_METHODS } from '../lib/db';
import { notifyOrderPlaced } from '../lib/api';
import useSeo from '../hooks/useSeo';
import { formatPrice } from '../lib/format';
import { optimizeImage } from '../lib/cloudinary';
import PageLoader from '../components/PageLoader';

const inputClass =
  'w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/30 focus:border-[#5A5A40]';
const labelClass = 'block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { getProduct, settings, loading, reload } = useStore();
  const { user, profile, isBlocked } = useAuth();
  useSeo({ title: 'Checkout', noindex: true });

  const [form, setForm] = useState({ name: '', phone: '', email: '', city: '', address: '', notes: '' });
  const [method, setMethod] = useState('cod');
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Prefill from the signed-in customer's profile
  useEffect(() => {
    if (profile) {
      setForm((f) => ({
        ...f,
        name: f.name || profile.name || '',
        email: f.email || profile.email || '',
        phone: f.phone || profile.phone || '',
      }));
    }
  }, [profile]);

  // Re-price the cart against the live catalog. Stock is shared by all option variants of a product.
  const lines = useMemo(() => {
    const wanted = cart.reduce((acc, i) => ({ ...acc, [i.productId]: (acc[i.productId] || 0) + i.quantity }), {});
    return cart.map((item) => {
      const product = getProduct(item.productId);
      const stock = Number(product?.stock) || 0;
      return {
        ...item,
        price: product ? product.price : item.price,
        name: product ? product.name : item.name,
        image: product ? product.image : item.image,
        problem: !product
          ? 'No longer available'
          : stock < wanted[item.productId]
            ? stock === 0
              ? 'Out of stock'
              : `Only ${stock} in stock`
            : null,
      };
    });
  }, [cart, getProduct]);

  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const shipping = calcShipping(subtotal, settings);
  const discount = calcDiscount(subtotal, coupon);
  const total = subtotal + shipping - discount;

  const applyCoupon = async (e) => {
    e?.preventDefault();
    setCouponMessage('');
    if (!couponInput.trim()) return;
    setCheckingCoupon(true);
    try {
      const found = await fetchCoupon(couponInput);
      if (!found || !found.active) {
        setCoupon(null);
        setCouponMessage('This code is not valid.');
      } else if (found.expiresAt && found.expiresAt.toDate() <= new Date()) {
        setCoupon(null);
        setCouponMessage('This code has expired.');
      } else if (subtotal < (found.minSubtotal || 0)) {
        setCoupon(null);
        setCouponMessage(`Spend at least ${formatPrice(found.minSubtotal)} to use this code.`);
      } else {
        setCoupon(found);
        setCouponInput('');
      }
    } catch {
      setCouponMessage('Could not check the code. Please try again.');
    } finally {
      setCheckingCoupon(false);
    }
  };
  const hasProblems = lines.some((l) => l.problem);

  const walletOptions = [
    { id: 'jazzcash', account: settings.jazzcash },
    { id: 'easypaisa', account: settings.easypaisa },
  ].filter((w) => w.account?.accountNumber);

  const selectedWallet = walletOptions.find((w) => w.id === method);

  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isBlocked) {
      setError('This account cannot place orders. Please contact us for help.');
      return;
    }
    if (hasProblems) {
      setError('Some items in your bag need attention before you can place the order.');
      return;
    }
    if (coupon && calcDiscount(subtotal, coupon) === 0) {
      setError('Your coupon no longer applies to this order. Remove it to continue.');
      return;
    }
    if (!/^[0-9+\-\s]{7,20}$/.test(form.phone.trim())) {
      setError('Please enter a valid phone number.');
      return;
    }
    if (method !== 'cod' && reference.trim().length < 4) {
      setError(`Please enter the transaction ID (TID) from your ${PAYMENT_METHODS[method]} payment.`);
      return;
    }

    setSubmitting(true);
    try {
      const order = await placeOrder({
        customer: form,
        notes: form.notes,
        items: lines,
        payment: { method, reference },
        settings,
        coupon,
        userId: user?.uid,
      });
      notifyOrderPlaced(order.id); // confirmation + store alert emails (best-effort)
      clearCart();
      navigate('/order-confirmation', { replace: true, state: { order } });
    } catch (err) {
      console.error('Order failed', err);
      if (err instanceof OutOfStockError) {
        reload(); // refresh stock so the bag shows what's left
        setError(
          `Sorry — ${err.items.map((i) => (i.available > 0 ? `only ${i.available} of "${i.name}" left` : `"${i.name}" just sold out`)).join('; ')}. Please update your bag.`
        );
        setSubmitting(false);
        return;
      }
      setError(
        coupon && err.code === 'permission-denied'
          ? 'We could not apply your coupon. Remove it and try again.'
          : 'We could not place your order. Please check your details and try again, or contact us on WhatsApp.'
      );
      setSubmitting(false);
    }
  };

  if (loading) return <PageLoader />;

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] bg-[#F5F2ED] flex flex-col items-center justify-center text-center px-4">
        <h1 className="font-serif text-3xl font-bold text-stone-900 mb-2">Your bag is empty</h1>
        <p className="text-stone-500 text-sm mb-6">Add a few pieces before checking out.</p>
        <Link to="/shop" className="px-6 py-3 bg-[#5A5A40] text-white rounded-full text-sm font-semibold">
          Go Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2ED] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-6">
          <Link to="/cart" className="hover:text-stone-900">Bag</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-stone-800 font-semibold">Checkout</span>
        </nav>
        <h1 className="font-serif text-4xl font-bold text-stone-900 mb-8">Checkout</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* ── Left: delivery + payment ── */}
          <div className="lg:col-span-3 space-y-6">
            <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200/60">
              <h2 className="font-serif text-xl font-bold text-stone-900 mb-5">Delivery Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="co-name" className={labelClass}>Full Name *</label>
                  <input id="co-name" name="name" required maxLength={100} value={form.name} onChange={update} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="co-phone" className={labelClass}>Phone / WhatsApp *</label>
                  <input id="co-phone" name="phone" type="tel" required placeholder="03XX XXXXXXX" value={form.phone} onChange={update} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="co-email" className={labelClass}>Email (for order updates)</label>
                  <input id="co-email" name="email" type="email" maxLength={120} value={form.email} onChange={update} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="co-city" className={labelClass}>City *</label>
                  <input id="co-city" name="city" required maxLength={60} value={form.city} onChange={update} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="co-address" className={labelClass}>Full Address *</label>
                  <textarea id="co-address" name="address" required minLength={5} maxLength={300} rows={3} value={form.address} onChange={update} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="co-notes" className={labelClass}>Order Notes</label>
                  <textarea id="co-notes" name="notes" maxLength={500} rows={2} placeholder="Delivery instructions, preferred time…" value={form.notes} onChange={update} className={inputClass} />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200/60">
              <h2 className="font-serif text-xl font-bold text-stone-900 mb-5">Payment Method</h2>
              <div className="space-y-3">
                <PaymentOption id="cod" checked={method === 'cod'} onChange={setMethod} icon={Banknote} title="Cash on Delivery" subtitle="Pay in cash when your order arrives." />
                {walletOptions.map((w) => (
                  <PaymentOption
                    key={w.id}
                    id={w.id}
                    checked={method === w.id}
                    onChange={setMethod}
                    icon={Smartphone}
                    title={PAYMENT_METHODS[w.id]}
                    subtitle="Send payment now and enter the transaction ID."
                  />
                ))}
              </div>

              {selectedWallet && (
                <div className="mt-5 rounded-xl bg-[#F5F2ED] border border-stone-200 p-5 space-y-4">
                  <div className="text-sm text-stone-700 space-y-1">
                    <p>
                      Send <strong>{formatPrice(total)}</strong> to this {PAYMENT_METHODS[method]} account:
                    </p>
                    <p className="font-mono text-base font-bold text-stone-900">{selectedWallet.account.accountNumber}</p>
                    {selectedWallet.account.accountName && <p className="text-stone-600">Account title: {selectedWallet.account.accountName}</p>}
                  </div>
                  <div>
                    <label htmlFor="co-ref" className={labelClass}>Transaction ID (TID) *</label>
                    <input id="co-ref" required maxLength={40} value={reference} onChange={(e) => setReference(e.target.value)} placeholder="e.g. 012345678901" className={inputClass} />
                    <p className="text-xs text-stone-500 mt-2">We confirm your payment manually, then dispatch the order.</p>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* ── Right: summary ── */}
          <aside className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200/60 lg:sticky lg:top-28">
            <h2 className="font-serif text-xl font-bold text-stone-900 mb-5">Order Summary</h2>
            <ul className="divide-y divide-stone-100 mb-5">
              {lines.map((l) => (
                <li key={l.id} className="py-3 flex gap-3">
                  <img src={optimizeImage(l.image, 120)} alt="" className="w-14 h-14 rounded-lg object-cover bg-stone-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-900 truncate">{l.name}</p>
                    <p className="text-xs text-stone-500">
                      Qty {l.quantity}
                      {Object.entries(l.options || {}).map(([k, v]) => ` • ${k}: ${v}`).join('')}
                    </p>
                    {l.problem && <p className="text-xs font-semibold text-red-600">{l.problem}</p>}
                  </div>
                  <p className="text-sm font-semibold text-stone-900">{formatPrice(l.price * l.quantity)}</p>
                </li>
              ))}
            </ul>

            <dl className="space-y-2 text-sm border-t border-stone-100 pt-4">
              <div className="flex justify-between"><dt className="text-stone-600">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-stone-600">Shipping</dt><dd>{shipping === 0 ? 'Free' : formatPrice(shipping)}</dd></div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <dt className="flex items-center gap-1">
                    Discount ({coupon.code})
                    <button type="button" onClick={() => setCoupon(null)} aria-label="Remove coupon" className="p-0.5 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
                  </dt>
                  <dd>−{formatPrice(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between text-base font-bold border-t border-stone-100 pt-3 mt-3"><dt>Total</dt><dd className="text-[#5A5A40]">{formatPrice(total)}</dd></div>
            </dl>

            {!coupon && (
              <div className="mt-5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && applyCoupon(e)}
                      placeholder="Coupon code"
                      aria-label="Coupon code"
                      maxLength={30}
                      className="w-full pl-9 pr-3 py-2.5 border border-stone-200 rounded-xl text-sm uppercase focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/30"
                    />
                  </div>
                  <button type="button" onClick={applyCoupon} disabled={checkingCoupon} className="px-4 rounded-xl border border-stone-300 text-sm font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-60">
                    {checkingCoupon ? '…' : 'Apply'}
                  </button>
                </div>
                {couponMessage && <p className="text-xs text-red-600 mt-2">{couponMessage}</p>}
              </div>
            )}

            {error && (
              <div className="mt-5 flex gap-2 items-start rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-700" role="alert">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {hasProblems && (
              <Link to="/cart" className="block text-center text-xs font-semibold text-[#C86D51] underline mt-4">
                Update your bag
              </Link>
            )}

            <button
              type="submit"
              disabled={submitting || hasProblems}
              className="mt-6 w-full py-4 rounded-full bg-[#5A5A40] hover:bg-[#484833] text-white font-bold text-xs tracking-[0.1em] uppercase shadow-md transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? 'Placing Order…' : `Place Order • ${formatPrice(total)}`}
            </button>
          </aside>
        </form>
      </div>
    </div>
  );
}

function PaymentOption({ id, checked, onChange, icon: Icon, title, subtitle }) {
  return (
    <label
      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
        checked ? 'border-[#5A5A40] bg-[#5A5A40]/5' : 'border-stone-200 hover:border-stone-300'
      }`}
    >
      <input type="radio" name="payment" value={id} checked={checked} onChange={() => onChange(id)} className="accent-[#5A5A40]" />
      <Icon className="w-5 h-5 text-[#5A5A40]" />
      <span>
        <span className="block text-sm font-bold text-stone-900">{title}</span>
        <span className="block text-xs text-stone-500">{subtitle}</span>
      </span>
    </label>
  );
}
