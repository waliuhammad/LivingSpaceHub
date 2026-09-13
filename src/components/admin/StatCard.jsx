import React from 'react';

export default function StatCard({ icon: Icon, color, badge, label, value }) {
  const colorMap = {
    green: 'bg-green-100 text-green-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
    amber: 'bg-amber-100 text-amber-700',
    gray: 'bg-gray-100 text-gray-700',
  };

  const iconClass = colorMap[color] || colorMap.gray;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${iconClass}`}>
          <Icon size={22} strokeWidth={2} />
        </div>
        {badge && (
          <div className="bg-gray-50 border border-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md">
            {badge}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">{label}</h3>
        <div className="text-3xl font-bold text-gray-900">{value}</div>
      </div>
    </div>
  );
}
