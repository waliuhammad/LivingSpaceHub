import React, { useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StatusPill from '../../components/admin/StatusPill';
import { mockTransactions } from '../../data/mockAdminData';
import { Download, Search, RefreshCw, Copy, CheckCircle2 } from 'lucide-react';
import Papa from 'papaparse';

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const filteredTxns = mockTransactions.filter(t => 
    t.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRevenue = mockTransactions.reduce((sum, t) => sum + t.amount, 0);
  const settled = mockTransactions.filter(t => t.status === 'Settled').reduce((sum, t) => sum + t.amount, 0);
  const pending = mockTransactions.filter(t => t.status === 'Pending').reduce((sum, t) => sum + t.amount, 0);
  const avgOrder = totalRevenue / (mockTransactions.length || 1);

  const exportCSV = () => {
    const csv = Papa.unparse(mockTransactions.map(t => ({
      Transaction_ID: t.id,
      Order_ID: t.orderId,
      Customer: t.customer,
      Method: t.method,
      Amount: t.amount,
      Status: t.status,
      Date: new Date(t.date).toLocaleString()
    })));
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div>
      <AdminPageHeader 
        titlePrefix="Store" 
        titleAccent="Ledger" 
        subtitle="Manage payments and financial records"
      >
        <button 
          onClick={exportCSV}
          className="bg-gray-900 text-white px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-black transition-colors"
        >
          <Download size={16} />
          Export CSV
        </button>
      </AdminPageHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Volume</p>
          <p className="text-xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-green-600 text-xs font-bold uppercase tracking-wider mb-1">Settled</p>
          <p className="text-xl font-bold text-gray-900">${settled.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">Pending</p>
          <p className="text-xl font-bold text-gray-900">${pending.toLocaleString()}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Avg Order</p>
          <p className="text-xl font-bold text-gray-900">${avgOrder.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-[#111827] rounded-2xl shadow-sm overflow-hidden text-gray-300">
        <div className="p-4 border-b border-gray-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#1f2937]">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search reference or customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#111827] border border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 focus:border-[#D4A373] text-white placeholder-gray-500"
            />
          </div>
          <button className="p-2.5 bg-[#111827] border border-gray-700 rounded-xl hover:bg-gray-800 transition-colors self-end sm:self-auto">
            <RefreshCw size={18} className="text-gray-400" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1f2937] text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                <th className="px-6 py-4 font-semibold">Txn Ref</th>
                <th className="px-6 py-4 font-semibold">Order</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Method</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredTxns.map(txn => (
                <tr key={txn.id} className="hover:bg-[#1f2937]/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-gray-200">{txn.id}</span>
                      <button 
                        onClick={() => copyToClipboard(txn.id)}
                        className="text-gray-500 hover:text-gray-300 transition-colors"
                      >
                        {copiedId === txn.id ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#D4A373] hover:underline cursor-pointer">
                    {txn.orderId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-200">
                    {txn.customer}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {txn.method}
                  </td>
                  <td className="px-6 py-4 font-bold text-white">
                    ${txn.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill status={txn.status} />
                  </td>
                </tr>
              ))}
              {filteredTxns.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    No transactions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
