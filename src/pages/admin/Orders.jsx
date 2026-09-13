import React, { useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import StatusPill from '../../components/admin/StatusPill';
import { mockOrders } from '../../data/mockAdminData';
import { ChevronDown, ChevronUp, Package, MapPin, CreditCard, MessageCircle } from 'lucide-react';

export default function Orders() {
  const [expandedOrders, setExpandedOrders] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(mockOrders.length / itemsPerPage);
  const paginatedOrders = mockOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


  const toggleOrder = (id) => {
    setExpandedOrders(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const statusCounts = mockOrders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <AdminPageHeader 
        titlePrefix="Store" 
        titleAccent="Orders" 
        subtitle="Process and track customer orders"
      />

      <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="bg-white border border-gray-200 px-4 py-2 rounded-full flex items-center gap-2 whitespace-nowrap shadow-sm">
            <span className="text-sm font-bold text-gray-700 uppercase">{status}</span>
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold">{count}</span>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {paginatedOrders.map(order => (
          <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div 
              className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
              onClick={() => toggleOrder(order.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                  <Package size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-gray-900">{order.id}</h3>
                    <StatusPill status={order.status} />
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} • {order.items.length} items
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="font-bold text-gray-900">${order.total.toFixed(2)}</p>
                </div>
                <div className="text-gray-400">
                  {expandedOrders[order.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>
            </div>

            {expandedOrders[order.id] && (
              <div className="border-t border-gray-100 bg-gray-50/30 p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Order Items</h4>
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-gray-900"><span className="text-gray-500 mr-2">{item.quantity}x</span>{item.name}</span>
                        <span className="font-medium text-gray-900">${item.price.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Customer Details</h4>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-2 text-sm">
                      <p className="font-bold text-gray-900">{order.customer.name}</p>
                      <p className="text-gray-500">{order.customer.email}</p>
                      
                      <div className="flex items-start gap-2 mt-3 pt-3 border-t border-gray-100">
                        <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-600 leading-tight">{order.customer.address}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <CreditCard size={16} className="text-gray-400 flex-shrink-0" />
                        <p className="text-gray-600">Paid via {order.paymentMethod}</p>
                      </div>
                    </div>
                  </div>

                  <a 
                    href={`https://wa.me/${order.customer.phone.replace(/\D/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-lg transition-colors"
                  >
                    <MessageCircle size={16} />
                    Contact on WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
              <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-2 py-1 text-gray-700">Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
