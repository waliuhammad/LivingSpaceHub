import React, { useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import Modal, { fieldClass, labelClass, primaryBtn, secondaryBtn } from '../../components/admin/Modal';
import useLiveQuery from '../../hooks/useLiveQuery';
import { useAuth } from '../../context/AuthContext';
import { findUserByEmail, setUserRole, subscribeTeam, toDate } from '../../lib/db';
import { ROLE_LABELS, STAFF_ROLES } from '../../lib/roles';
import { User, UserPlus, Loader2 } from 'lucide-react';

const ROLE_HELP = {
  admin: 'Everything, including settings, team and deleting orders.',
  manager: 'Products, categories, orders, transactions and messages.',
  support: 'Orders and customer messages.',
};

export default function Team() {
  const { data: team, loading } = useLiveQuery(subscribeTeam);
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const changeRole = async (member, role) => {
    if (role === 'customer' && !window.confirm(`Remove ${member.name} from the team? They will keep their customer account.`)) return;
    setError('');
    try {
      await setUserRole(member.id, role);
    } catch (err) {
      setError(err.code === 'permission-denied' ? 'Only administrators can change roles.' : err.message);
    }
  };

  return (
    <div>
      <AdminPageHeader titlePrefix="Store" titleAccent="Team" subtitle="Manage your team and roles">
        <button onClick={() => setAdding(true)} className={primaryBtn}>
          <UserPlus size={16} />
          Add Member
        </button>
      </AdminPageHeader>

      {error && <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-2" role="alert">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {STAFF_ROLES.map((r) => (
          <div key={r} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <p className="text-sm font-bold text-gray-900">{ROLE_LABELS[r]}</p>
            <p className="text-xs text-gray-500 mt-1">{ROLE_HELP[r]}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
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
            {team.map((member) => {
              const isSelf = member.id === user?.uid;
              return (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      {member.name}
                      {isSelf && <span className="text-xs text-gray-400">(you)</span>}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{member.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {isSelf ? (
                      ROLE_LABELS[member.role]
                    ) : (
                      <select value={member.role} onChange={(e) => changeRole(member, e.target.value)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white" aria-label={`Role for ${member.name}`}>
                        {STAFF_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                        <option value="customer">Remove from team</option>
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{toDate(member.createdAt)?.toLocaleDateString('en-PK') || '—'}</td>
                </tr>
              );
            })}
            {team.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-12 text-center text-gray-500">{loading ? 'Loading…' : 'No team members.'}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {adding && <AddMemberModal onClose={() => setAdding(false)} />}
    </div>
  );
}

function AddMemberModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('support');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const member = await findUserByEmail(email);
      if (!member) {
        setError('No account found with that email. Ask them to sign up at /signup first, then add them here.');
        setBusy(false);
        return;
      }
      await setUserRole(member.id, role);
      onClose();
    } catch (err) {
      setError(err.code === 'permission-denied' ? 'You cannot change this account (you cannot change your own role).' : err.message);
      setBusy(false);
    }
  };

  return (
    <Modal
      title="Add Team Member"
      onClose={onClose}
      footer={
        <>
          <button type="button" onClick={onClose} className={secondaryBtn}>Cancel</button>
          <button type="submit" form="member-form" disabled={busy} className={primaryBtn}>
            {busy && <Loader2 size={16} className="animate-spin" />}
            Add to Team
          </button>
        </>
      }
    >
      <form id="member-form" onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">The person must already have an account on the website. Their account is upgraded to the role you choose.</p>
        <div>
          <label htmlFor="m-email" className={labelClass}>Account Email</label>
          <input id="m-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} />
        </div>
        <div>
          <label htmlFor="m-role" className={labelClass}>Role</label>
          <select id="m-role" value={role} onChange={(e) => setRole(e.target.value)} className={fieldClass}>
            {STAFF_ROLES.map((r) => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
          <p className="text-xs text-gray-500 mt-1">{ROLE_HELP[role]}</p>
        </div>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      </form>
    </Modal>
  );
}
