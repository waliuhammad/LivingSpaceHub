import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Circle, Loader2, PackageSearch, XCircle } from 'lucide-react';
import { fetchTracking, PAYMENT_METHODS, toDate } from '../lib/db';
import { formatDate, formatPrice } from '../lib/format';
import { useStore } from '../context/StoreContext';
import useSeo from '../hooks/useSeo';

const STEPS = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];
const STEP_LABELS = { Pending: 'Order received', Confirmed: 'Confirmed', Shipped: 'On the way', Delivered: 'Delivered' };

export default function TrackOrder() {
  const [params] = useSearchParams();
  const { content } = useStore();
  const [orderNumber, setOrderNumber] = useState(params.get('order') || '');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useSeo({ title: 'Track Your Order', description: 'Check the status of your Living Space Hub order with your order number and phone number.' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setBusy(true);
    try {
      const tracking = await fetchTracking(orderNumber, phone);
      if (tracking) setResult(tracking);
      else setError('We could not find an order with that order number and phone number. Please check both and try again.');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const currentStep = result ? STEPS.indexOf(result.status) : -1;
  const whatsapp = content.contact.whatsapp.replace(/\D/g, '');

  return (
    <div className="min-h-[80vh] bg-[#F5F2ED] py-16 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <PackageSearch className="w-10 h-10 text-[#5A5A40] mx-auto mb-3" />
          <h1 className="font-serif text-4xl font-bold text-stone-900 mb-2">Track Your Order</h1>
          <p className="text-sm text-stone-500">Enter the order number from your confirmation and the phone number you ordered with.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200/60 space-y-4">
          <div>
            <label htmlFor="t-order" className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">Order Number</label>
            <input
              id="t-order"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
              placeholder="LSH-260915-ABCDE"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/30"
            />
          </div>
          <div>
            <label htmlFor="t-phone" className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">Phone Number</label>
            <input
              id="t-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="03XX XXXXXXX"
              className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/30"
            />
          </div>
          <button type="submit" disabled={busy} className="w-full py-3.5 rounded-full bg-[#5A5A40] text-white text-sm font-bold uppercase tracking-wider disabled:opacity-60 flex items-center justify-center gap-2">
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            Track Order
          </button>
          {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
        </form>

        {result && (
          <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200/60 mt-6" aria-live="polite">
            <div className="flex flex-wrap justify-between gap-2 mb-6">
              <div>
                <p className="font-mono font-bold text-stone-900">{result.orderNumber}</p>
                <p className="text-xs text-stone-500">
                  Placed {formatDate(toDate(result.createdAt))} • {result.itemCount} item{result.itemCount === 1 ? '' : 's'} • {result.city}
                </p>
              </div>
              <p className="font-bold text-[#5A5A40]">{formatPrice(result.total)}</p>
            </div>

            {result.status === 'Cancelled' ? (
              <div className="flex items-center gap-3 text-red-700 bg-red-50 rounded-xl p-4">
                <XCircle className="w-5 h-5" />
                <p className="text-sm font-semibold">This order was cancelled.</p>
              </div>
            ) : (
              <ol className="space-y-4">
                {STEPS.map((step, index) => {
                  const done = index <= currentStep;
                  return (
                    <li key={step} className="flex items-center gap-3">
                      {done ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <Circle className="w-5 h-5 text-stone-300" />}
                      <span className={`text-sm ${done ? 'font-semibold text-stone-900' : 'text-stone-400'}`}>{STEP_LABELS[step]}</span>
                    </li>
                  );
                })}
              </ol>
            )}

            <p className="text-sm text-stone-600 mt-6 pt-4 border-t border-stone-100">
              Payment: {PAYMENT_METHODS[result.paymentMethod]} — <span className="font-semibold">{result.paymentStatus === 'Paid' || (result.paymentMethod === 'cod' && result.status === 'Delivered' && result.paymentStatus === 'Pending') ? 'Received' : result.paymentStatus}</span>
            </p>
            <p className="text-xs text-stone-500 mt-3">
              Need to change or cancel this order?{' '}
              {whatsapp ? (
                <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hello, I have a question about order ${result.orderNumber}.`)}`} target="_blank" rel="noreferrer" className="underline font-semibold text-[#5A5A40]">
                  Message us on WhatsApp
                </a>
              ) : (
                <Link to="/contact" className="underline font-semibold text-[#5A5A40]">Contact us</Link>
              )}
              .
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
