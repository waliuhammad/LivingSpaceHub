import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import useLiveQuery from '../../hooks/useLiveQuery';
import { deleteReview, subscribeAllReviews, summarizeRatings, toDate } from '../../lib/db';
import { Stars } from '../../components/ProductReviews';
import { ExternalLink, Trash2 } from 'lucide-react';

export default function Reviews() {
  const { data: reviews, loading, error } = useLiveQuery(subscribeAllReviews);
  const [filter, setFilter] = useState('all');
  const summary = summarizeRatings(reviews);

  const shown = reviews.filter((r) => (filter === 'low' ? r.rating <= 2 : true));

  const handleDelete = async (review) => {
    if (!window.confirm(`Delete ${review.name}'s review of "${review.productName}"?`)) return;
    await deleteReview(review.productId, review.uid).catch((err) => window.alert(err.message));
  };

  return (
    <div>
      <AdminPageHeader titlePrefix="Store" titleAccent="Reviews" subtitle="Moderate product reviews from verified customers" />

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="bg-white px-5 py-3 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
          <span className="text-2xl font-bold text-gray-900">{summary.count ? summary.average.toFixed(1) : '—'}</span>
          <div>
            <Stars value={summary.average} />
            <p className="text-xs text-gray-500">{summary.count} reviews across all products</p>
          </div>
        </div>
        <div className="flex gap-2">
          {[
            ['all', 'All'],
            ['low', '1–2 stars'],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id)}
              className={`px-4 py-2 rounded-full text-sm font-bold border ${filter === id ? 'bg-[#5A5A40] border-[#5A5A40] text-white' : 'bg-white border-gray-200 text-gray-700'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {loading && <p className="text-center text-gray-400 py-12">Loading reviews…</p>}
        {!loading && error && <p className="text-center text-red-600 py-12">Could not load reviews.</p>}
        {!loading && !error && shown.length === 0 && <p className="text-center text-gray-500 py-12">No reviews to show.</p>}
        {shown.map((review) => (
          <article key={`${review.productId}-${review.uid}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <Stars value={review.rating} />
                <span className="text-sm font-bold text-gray-900">{review.name}</span>
                <span className="text-xs text-gray-400">{toDate(review.updatedAt)?.toLocaleDateString('en-PK')}</span>
              </div>
              <Link to={`/product/${review.productId}`} target="_blank" className="inline-flex items-center gap-1 text-xs font-semibold text-[#5A5A40] hover:underline mb-2">
                {review.productName} <ExternalLink size={12} />
              </Link>
              {review.comment ? <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.comment}</p> : <p className="text-sm text-gray-400 italic">No comment</p>}
            </div>
            <button onClick={() => handleDelete(review)} className="self-start p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg" aria-label="Delete review">
              <Trash2 size={18} />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
