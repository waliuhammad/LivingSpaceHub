import React, { useState } from 'react';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import useLiveQuery from '../../hooks/useLiveQuery';
import { deleteMessage, deleteSubscriber, setMessageRead, subscribeMessages, subscribeSubscribers, toDate } from '../../lib/db';
import { CheckCircle, Circle, Download, Mail, Trash2 } from 'lucide-react';
import Papa from 'papaparse';

export default function Messages() {
  const [tab, setTab] = useState('inbox');
  const { data: messages, loading } = useLiveQuery(subscribeMessages);
  const { data: subscribers, loading: subsLoading } = useLiveQuery(subscribeSubscribers);
  const [openId, setOpenId] = useState(null);

  const unread = messages.filter((m) => !m.isRead).length;

  const toggleOpen = (msg) => {
    const opening = openId !== msg.id;
    setOpenId(opening ? msg.id : null);
    if (opening && !msg.isRead) setMessageRead(msg.id, true).catch(console.error);
  };

  const handleDelete = (msg) => {
    if (window.confirm(`Delete the message from ${msg.name}?`)) deleteMessage(msg.id).catch((err) => window.alert(err.message));
  };

  const exportSubscribers = () => {
    const csv = Papa.unparse(subscribers.map((s) => ({ Email: s.email, Subscribed: toDate(s.createdAt)?.toLocaleString('en-PK') || '' })));
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <AdminPageHeader titlePrefix="Store" titleAccent="Inbox" subtitle="Customer messages and newsletter subscribers">
        {tab === 'subscribers' && subscribers.length > 0 && (
          <button onClick={exportSubscribers} className="bg-gray-900 text-white px-5 py-2.5 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-black transition-colors">
            <Download size={16} /> Export CSV
          </button>
        )}
      </AdminPageHeader>

      <div className="flex gap-2 mb-6">
        {[
          ['inbox', `Messages${unread ? ` (${unread} new)` : ''}`],
          ['subscribers', `Subscribers (${subscribers.length})`],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 rounded-full text-sm font-bold border ${tab === id ? 'bg-[#5A5A40] border-[#5A5A40] text-white' : 'bg-white border-gray-200 text-gray-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'inbox' ? (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Read</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sender</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {messages.map((msg) => (
                <React.Fragment key={msg.id}>
                  <tr className={`hover:bg-gray-50 transition-colors cursor-pointer ${msg.isRead ? '' : 'font-semibold'}`} onClick={() => toggleOpen(msg)}>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMessageRead(msg.id, !msg.isRead).catch(console.error);
                        }}
                        aria-label={msg.isRead ? 'Mark as unread' : 'Mark as read'}
                      >
                        {msg.isRead ? <CheckCircle className="w-5 h-5 text-green-500" /> : <Circle className="w-5 h-5 text-gray-400" />}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {msg.name}
                      <div className="text-xs text-gray-500 font-normal">{msg.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate" title={msg.subject}>{msg.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-normal">{toDate(msg.createdAt)?.toLocaleDateString('en-PK') || '—'}</td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <a href={`mailto:${msg.email}?subject=${encodeURIComponent(`Re: ${msg.subject}`)}`} onClick={(e) => e.stopPropagation()} className="inline-flex p-2 text-gray-400 hover:text-[#5A5A40]" aria-label="Reply by email">
                        <Mail size={16} />
                      </a>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(msg); }} className="p-2 text-gray-400 hover:text-red-600" aria-label="Delete message">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                  {openId === msg.id && (
                    <tr className="bg-gray-50/60">
                      <td />
                      <td colSpan="4" className="px-6 py-4 text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {messages.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">{loading ? 'Loading…' : 'No messages yet.'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {subscribers.map((s) => (
                <tr key={s.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{s.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{toDate(s.createdAt)?.toLocaleDateString('en-PK') || '—'}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => window.confirm(`Remove ${s.email}?`) && deleteSubscriber(s.id).catch((err) => window.alert(err.message))}
                      className="p-2 text-gray-400 hover:text-red-600"
                      aria-label={`Remove ${s.email}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {subscribers.length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-gray-500">{subsLoading ? 'Loading…' : 'No subscribers yet.'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
