import React from 'react';

export default function StatusPill({ status }) {
  const getStyle = () => {
    switch (status.toLowerCase()) {
      case 'shipped':
      case 'delivered':
      case 'settled':
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-amber-100 text-amber-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-full ${getStyle()}`}>
      {status}
    </span>
  );
}
