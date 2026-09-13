import React from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { mockMessages } from '../../data/mockAdminData';
import { CheckCircle, Circle } from 'lucide-react';

export default function Messages() {
  return (
    <div>
      <AdminPageHeader
        titlePrefix="Store"
        titleAccent="Inbox"
        subtitle="Manage incoming customer messages"
      />

      <div className="mt-8 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Read</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {mockMessages.map(msg => (
              <tr key={msg.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{msg.sender}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{msg.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 truncate max-w-xs" title={msg.subject}>{msg.subject}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(msg.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {msg.isRead ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
