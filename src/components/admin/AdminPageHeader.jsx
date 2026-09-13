import React from 'react';

export default function AdminPageHeader({ titlePrefix, titleAccent, subtitle, statusLabel, statusColor = 'green', children }) {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 font-serif">
            {titlePrefix} <span className="text-[#D4A373]">{titleAccent}</span>
          </h1>
          {statusLabel && (
            <div className={`px-2.5 py-1 rounded-full border flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider
              ${statusColor === 'green' ? 'bg-green-50 border-green-200 text-green-700' : ''}
              ${statusColor === 'blue' ? 'bg-blue-50 border-blue-200 text-blue-700' : ''}
              ${statusColor === 'amber' ? 'bg-amber-50 border-amber-200 text-amber-700' : ''}
            `}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusColor === 'green' ? 'bg-green-500' : statusColor === 'blue' ? 'bg-blue-500' : 'bg-amber-500'}`}></span>
              {statusLabel}
            </div>
          )}
        </div>
        {subtitle && (
          <p className="text-gray-500 italic text-sm">{subtitle}</p>
        )}
      </div>
      
      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </div>
  );
}
