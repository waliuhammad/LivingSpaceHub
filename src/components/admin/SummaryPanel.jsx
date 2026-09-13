import React from 'react';

export default function SummaryPanel({ title = "Store Summary", rows }) {
  return (
    <div className="bg-[#111827] text-white p-6 rounded-2xl shadow-sm h-full flex flex-col">
      <h3 className="font-serif font-bold text-lg mb-6">{title}</h3>
      <div className="flex-1 flex flex-col justify-between gap-4">
        {rows.map((row, idx) => (
          <div key={idx} className="flex justify-between items-center border-b border-gray-800 pb-3 last:border-0 last:pb-0">
            <span className="text-gray-400 text-sm">{row.label}</span>
            <span className={`font-bold ${row.color || 'text-white'}`}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
