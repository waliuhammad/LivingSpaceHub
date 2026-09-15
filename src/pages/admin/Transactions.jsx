import React, { useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StatusPill from '../../components/admin/StatusPill';
import useLiveQuery from '../../hooks/useLiveQuery';
import { isPaymentReceived, PAYMENT_METHODS, subscribeOrders, toDate } from '../../lib/db';
import { formatPrice } from '../../lib/format';
import { Download, Search, Copy, CheckCircle2 } from 'lucide-react';
import Papa from 'papaparse';

/** Payments ledger — one row per order, based on its payment method and status. */
export default function Transactions() {
  const { data: orders, loading } = useLiveQuery(subscribeOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [copiedId, setCopiedId] = useState(null);

  const txns = orders
    .filter((o) => o.status !== 'Cancelled' || o.payment?.status === 'Paid' || o.payment?.status === 'Refunded')
    .map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customer: o.customer?.name || '',
      phone: o.customer?.phone || '',
      method: o.payment?.method,
      reference: o.payment?.reference || '',
      amount: Number(o.total) || 0,
      // A delivered Cash on Delivery order counts as paid even if nobody updated its payment status
      status: isPaymentReceived(o) ? 'Paid' : o.payment?.status || 'Pending',
      date: toDate(o.createdAt),
    }));

  const q = searchTerm.toLowerCase();
  const filteredTxns = txns.filter(
    (t) =>
      (methodFilter === 'all' || t.method === methodFilter) &&
      (t.orderNumber.toLowerCase().includes(q) || t.customer.toLowerCase().includes(q) || t.reference.toLowerCase().includes(q))
  );

  const sum = (list) => list.reduce((s, t) => s + t.amount, 0);
  const received = sum(txns.filter((t) => t.status === 'Paid'));
  const pending = sum(txns.filter((t) => t.status === 'Pending'));
  const paidCount = txns.filter((t) => t.status === 'Paid').length;
  const avgOrder = paidCount ? received / paidCount : 0;

  const exportCSV = () => {
    const csv = Papa.unparse(
      filteredTxns.map((t) => ({
        Order: t.orderNumber,
        Customer: t.customer,
        Phone: t.phone,
        Method: PAYMENT_METHODS[t.method] || t.method,
        Transaction_ID: t.reference,
        Amount_PKR: t.amount,
        Status: t.status,
        Date: t.date ? t.date.toLocaleString('en-PK') : '',
      }))
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div>
      <AdminPageHeader titlePrefix="Store" titleAccent="Ledger" subtitle="Payments across Cash on Delivery, JazzCash and EasyPaisa">
        <button onClick={exportCSV} className="bg-gray-900 text-white px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-black transition-colors">
          <Download size={16} />
          Export CSV
        </button>
      </AdminPageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Stat label="Total Volume" value={formatPrice(sum(txns))} />
        <Stat label="Received" value={formatPrice(received)} tone="text-green-600" />
        <Stat label="Awaiting Payment" value={formatPrice(pending)} tone="text-amber-600" />
        <Stat label="Avg Paid Order" value={formatPrice(avgOrder)} />
      </div>

      <div className="bg-[#111827] rounded-2xl shadow-sm overflow-hidden text-gray-300">
        <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#1f2937]">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Order #, customer or TID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#111827] border border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] text-white placeholder-gray-500"
            />
          </div>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-4 py-2 bg-[#111827] border border-gray-700 rounded-xl text-sm text-white"
          >
            <option value="all">All methods</option>
            {Object.entries(PAYMENT_METHODS).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1f2937] text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                <th className="px-6 py-4 font-semibold">Order</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Method / TID</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredTxns.map((txn) => (
                <tr key={txn.id} className="hover:bg-[#1f2937]/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-sm text-[#D4A373]">{txn.orderNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-200">{txn.customer}</td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    <div>{PAYMENT_METHODS[txn.method]}</div>
                    {txn.reference && (
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-gray-200">{txn.reference}</span>
                        <button onClick={() => copyToClipboard(txn.reference)} className="text-gray-500 hover:text-gray-300 transition-colors" aria-label="Copy transaction ID">
                          {copiedId === txn.reference ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400 whitespace-nowrap">{txn.date ? txn.date.toLocaleDateString('en-PK') : '—'}</td>
                  <td className="px-6 py-4 font-bold text-white whitespace-nowrap">{formatPrice(txn.amount)}</td>
                  <td className="px-6 py-4">
                    <StatusPill status={txn.status} />
                  </td>
                </tr>
              ))}
              {filteredTxns.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    {loading ? 'Loading…' : 'No transactions found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-4">Mark payments as Paid from the Orders page once cash is collected or a TID is verified.</p>
    </div>
  );
}

function Stat({ label, value, tone = 'text-gray-500' }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
      <p className={`${tone} text-xs font-bold uppercase tracking-wider mb-1`}>{label}</p>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
