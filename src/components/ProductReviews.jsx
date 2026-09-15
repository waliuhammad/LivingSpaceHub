import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { deleteReview, saveReview, toDate } from '../lib/db';
import { formatDate } from '../lib/format';

export function Stars({ value, size = 'w-4 h-4' }) {
  return (
    <span className="inline-flex" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`${size} ${i < Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
      ))}
    </span>
  );
}

/** Reviews list + write/edit form. `reviews` comes from the parent's live subscription. */
export default function ProductReviews({ product, reviews, summary }) {
  const { user, profile, emailVerified, isStaff, isBlocked, resendVerification, refreshUser } = useAuth();
  const mine = useMemo(() => reviews.find((r) => r.id === user?.uid), [reviews, user]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (mine) {
      setRating(mine.rating);
      setComment(mine.comment);
    }
  }, [mine]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setBusy(true);
    try {
      await saveReview(product, user, { rating, comment, name: profile?.name || user.email.split('@')[0] });
      setMessage(mine ? 'Your review was updated.' : 'Thanks for your review!');
    } catch (err) {
      setMessage(err.code === 'permission-denied' ? 'Please verify your email address before reviewing.' : 'Could not save your review. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (review) => {
    if (!window.confirm('Delete this review?')) return;
    await deleteReview(product.id, review.id).catch((err) => window.alert(err.message));
    if (review.id === user?.uid) {
      setComment('');
      setRating(5);
    }
  };

  const handleCheckVerified = async () => {
    const verified = await refreshUser();
    setMessage(verified ? '' : 'Still not verified — open the link in the email we sent you.');
  };

  return (
    <section className="border-t border-stone-200/80 pt-16 mb-20" id="reviews">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#C86D51] font-semibold">Customer Reviews</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-800 mb-4">What people say</h2>
          {summary.count > 0 ? (
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl font-bold text-stone-900">{summary.average.toFixed(1)}</span>
              <div>
                <Stars value={summary.average} />
                <p className="text-xs text-stone-500">Based on {summary.count} review{summary.count === 1 ? '' : 's'}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-stone-500 mb-6">No reviews yet. Be the first to share your thoughts.</p>
          )}

          {!user ? (
            <p className="text-sm text-stone-600">
              <Link to="/login" state={{ from: `/product/${product.id}` }} className="font-semibold text-[#5A5A40] underline">Sign in</Link> to write a review.
            </p>
          ) : isBlocked ? (
            <p className="text-sm text-stone-500">Reviews are disabled for this account.</p>
          ) : !emailVerified ? (
            <div className="text-sm text-stone-600 bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
              <p>Verify your email address to write a review.</p>
              <div className="flex gap-3">
                <button type="button" onClick={() => resendVerification().then(() => setMessage('Verification email sent.'))} className="text-xs font-semibold text-[#5A5A40] underline">
                  Resend email
                </button>
                <button type="button" onClick={handleCheckVerified} className="text-xs font-semibold text-[#5A5A40] underline">
                  I've verified
                </button>
              </div>
              {message && <p className="text-xs">{message}</p>}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200/80 p-5 space-y-4">
              <p className="text-sm font-bold text-stone-800">{mine ? 'Edit your review' : 'Write a review'}</p>
              <div className="flex gap-1" role="radiogroup" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => setRating(n)}>
                    <Star className={`w-6 h-6 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`} />
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="How do you like it?"
                className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/30"
              />
              <button type="submit" disabled={busy} className="w-full py-2.5 rounded-full bg-[#5A5A40] text-white text-sm font-semibold disabled:opacity-60">
                {busy ? 'Saving…' : mine ? 'Update Review' : 'Submit Review'}
              </button>
              {message && <p className="text-xs text-stone-600">{message}</p>}
            </form>
          )}
        </div>

        <div className="lg:col-span-2 space-y-4">
          {reviews.map((review) => (
            <article key={review.id} className="bg-white rounded-2xl border border-stone-200/80 p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="font-semibold text-stone-900 text-sm">{review.name}</p>
                  <p className="text-xs text-stone-400">{formatDate(toDate(review.updatedAt))}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Stars value={review.rating} />
                  {(review.id === user?.uid || isStaff) && (
                    <button onClick={() => handleDelete(review)} className="p-1 text-stone-400 hover:text-red-600" aria-label="Delete review">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              {review.comment && <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">{review.comment}</p>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
