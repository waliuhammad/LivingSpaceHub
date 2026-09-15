import { auth } from './firebase';

/**
 * Calls to the small PHP API that runs on Hostinger next to the site (public/api/*.php).
 * It sends emails and deletes Cloudinary images — work that needs secrets which must not be in
 * the browser. All calls are best-effort: the store keeps working if the API is unavailable
 * (e.g. on localhost, where there is no PHP).
 */
async function post(path, body, { withAuth = false } = {}) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (withAuth && auth.currentUser) {
      headers.Authorization = `Bearer ${await auth.currentUser.getIdToken()}`;
    }
    const res = await fetch(`/api/${path}`, { method: 'POST', headers, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) console.warn(`API ${path} failed (${res.status})`, data.error || '');
    return { ok: res.ok, ...data };
  } catch (err) {
    console.warn(`API ${path} unavailable`, err.message);
    return { ok: false };
  }
}

/** Order confirmation email to the customer + new-order alert to the store. */
export const notifyOrderPlaced = (orderId) => post('order-placed.php', { orderId });

/** Status-change email (Confirmed / Shipped / Delivered / Cancelled) to the customer. Staff only. */
export const notifyOrderStatus = (orderId) => post('order-status.php', { orderId }, { withAuth: true });

/** New contact-form message alert to the store. */
export const notifyContactMessage = (messageId) => post('contact-message.php', { messageId });

/** Delete images from Cloudinary once nothing uses them. Catalog staff only. */
export function deleteCloudinaryImages(publicIds) {
  const ids = [...new Set((publicIds || []).filter(Boolean))];
  if (ids.length === 0) return Promise.resolve({ ok: true });
  return post('cloudinary-delete.php', { publicIds: ids }, { withAuth: true });
}
