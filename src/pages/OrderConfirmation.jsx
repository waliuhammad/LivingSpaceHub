import React, { useEffect } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { PAYMENT_METHODS } from '../lib/db';
import { formatPrice } from '../lib/format';
import { useAuth } from '../context/AuthContext';

export default function OrderConfirmation() {
  const { state } = useLocation();
  const { user } = useAuth();
  const order = state?.order;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!order) return <Navigate to="/shop" replace />;

  return (
    <div className="min-h-[80vh] bg-[#F5F2ED] py-16 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border border-stone-200/60 p-8 sm:p-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900 mb-2">Thank you for your order!</h1>
          <p className="text-stone-500 text-sm">
            Your order number is <span className="font-mono font-bold text-stone-900">{order.orderNumber}</span>.
            <br />
            {order.payment.method === 'cod'
              ? 'We will call you to confirm, then dispatch your order. Please keep the cash ready on delivery.'
              : `We will verify your ${PAYMENT_METHODS[order.payment.method]} payment (TID ${order.payment.reference}) and dispatch your order.`}
          </p>
        </div>

        <ul className="divide-y divide-stone-100 border-y border-stone-100 mb-6">
          {order.items.map((item) => (
            <li key={item.productId} className="py-3 flex justify-between text-sm">
              <span className="text-stone-700">
                <span className="text-stone-400 mr-2">{item.quantity}×</span>
                {item.name}
              </span>
              <span className="font-semibold text-stone-900">{formatPrice(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <dl className="space-y-2 text-sm mb-8">
          <div className="flex justify-between"><dt className="text-stone-500">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-stone-500">Shipping</dt><dd>{order.shipping ? formatPrice(order.shipping) : 'Free'}</dd></div>
          <div className="flex justify-between font-bold text-base"><dt>Total</dt><dd className="text-[#5A5A40]">{formatPrice(order.total)}</dd></div>
          <div className="flex justify-between pt-3"><dt className="text-stone-500">Payment</dt><dd>{PAYMENT_METHODS[order.payment.method]}</dd></div>
          <div className="flex justify-between gap-6"><dt className="text-stone-500">Deliver to</dt><dd className="text-right">{order.customer.name}, {order.customer.address}, {order.customer.city}</dd></div>
        </dl>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/shop" className="px-6 py-3 bg-[#5A5A40] text-white rounded-full text-sm font-semibold text-center">
            Continue Shopping
          </Link>
          {user && (
            <Link to="/account" className="px-6 py-3 border border-stone-300 text-stone-800 rounded-full text-sm font-semibold text-center">
              View My Orders
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
