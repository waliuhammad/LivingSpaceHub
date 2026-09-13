import React from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { mockUsers } from '../../data/mockAdminData';
import { User, CheckCircle, XCircle } from 'lucide-react';

export default function Team() {
  return (
    <div>
      <AdminPageHeader
        titlePrefix="Store"
        titleAccent="Team"
        subtitle="Manage your team and roles"
      />

      <div className="mt-8 overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {mockUsers.map(user => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.joined).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
