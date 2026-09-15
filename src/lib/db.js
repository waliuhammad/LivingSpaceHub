import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { STAFF_ROLES } from './roles';

/* ───────────────────────── helpers ───────────────────────── */

const snapToList = (snap) => snap.docs.map((d) => ({ id: d.id, ...d.data() }));

export function toDate(value) {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  return new Date(value);
}

export const DEFAULT_SETTINGS = {
  shippingFee: 0,
  freeShippingThreshold: 0,
  heroImage: '',
  heroImagePublicId: '',
  jazzcash: { accountName: '', accountNumber: '' },
  easypaisa: { accountName: '', accountNumber: '' },
};

/** Shipping rule shared by the cart, checkout and firestore.rules. Based on the subtotal before discounts. */
export function calcShipping(subtotal, settings) {
  const fee = Number(settings?.shippingFee) || 0;
  const threshold = Number(settings?.freeShippingThreshold) || 0;
  if (subtotal <= 0) return 0;
  if (threshold > 0 && subtotal >= threshold) return 0;
  return fee;
}

/** Discount rule shared by checkout and firestore.rules. Returns 0 if the coupon doesn't apply. */
export function calcDiscount(subtotal, coupon) {
  if (!coupon || !coupon.active) return 0;
  const expires = toDate(coupon.expiresAt);
  if (expires && expires <= new Date()) return 0;
  if (subtotal < (Number(coupon.minSubtotal) || 0)) return 0;
  return coupon.type === 'percent' ? Math.floor((subtotal * coupon.value) / 100) : Math.min(coupon.value, subtotal);
}

export const PAYMENT_METHODS = {
  cod: 'Cash on Delivery',
  jazzcash: 'JazzCash',
  easypaisa: 'EasyPaisa',
};

export const ORDER_STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
export const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded'];

/** Every status except Cancelled holds the ordered stock (it is taken the moment an order is placed). */
const STOCK_HELD_STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered'];

/** Thrown by placeOrder when an item sold out between loading the page and checking out. */
export class OutOfStockError extends Error {
  constructor(items) {
    super(`Not enough stock for: ${items.map((i) => i.name).join(', ')}`);
    this.name = 'OutOfStockError';
    this.items = items;
  }
}

/* ───────────────────────── products ───────────────────────── */

export async function fetchProducts() {
  return snapToList(await getDocs(collection(db, 'products')));
}

export async function fetchProduct(id) {
  const snap = await getDoc(doc(db, 'products', String(id)));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export function subscribeProducts(onData, onError) {
  return onSnapshot(query(collection(db, 'products'), orderBy('createdAt', 'desc')), (s) => onData(snapToList(s)), onError);
}

function cleanOptions(options) {
  return (options || [])
    .map((o) => ({
      name: String(o.name || '').trim(),
      values: (Array.isArray(o.values) ? o.values : String(o.values || '').split(','))
        .map((v) => String(v).trim())
        .filter(Boolean),
    }))
    .filter((o) => o.name && o.values.length)
    .slice(0, 4);
}

function productPayload(data) {
  return {
    name: data.name.trim(),
    price: Number(data.price),
    category: data.category,
    description: (data.description || '').trim(),
    image: data.image || '',
    imagePublicId: data.imagePublicId || '',
    images: (data.images || []).filter((img) => img?.url).slice(0, 8),
    options: cleanOptions(data.options),
    details: (data.details || []).map((d) => String(d).trim()).filter(Boolean).slice(0, 10),
    shippingInfo: (data.shippingInfo || '').trim(),
    careInfo: (data.careInfo || '').trim(),
    stock: Math.max(0, Math.floor(Number(data.stock) || 0)),
    featured: Boolean(data.featured),
    active: data.active !== false,
    updatedAt: serverTimestamp(),
  };
}

export async function saveProduct(id, data) {
  if (id) {
    await updateDoc(doc(db, 'products', id), productPayload(data));
    return id;
  }
  const ref = await addDoc(collection(db, 'products'), { ...productPayload(data), createdAt: serverTimestamp() });
  return ref.id;
}

export async function setProductWithId(id, data) {
  await setDoc(doc(db, 'products', String(id)), { ...productPayload(data), createdAt: serverTimestamp() });
}

export const deleteProduct = (id) => deleteDoc(doc(db, 'products', id));

/** All Cloudinary public ids a product references (main image + gallery). */
export function productImageIds(product) {
  return [product?.imagePublicId, ...(product?.images || []).map((i) => i.publicId)].filter(Boolean);
}

/* ───────────────────────── categories ───────────────────────── */

export async function fetchCategories() {
  return snapToList(await getDocs(query(collection(db, 'categories'), orderBy('sortOrder'))));
}

export function subscribeCategories(onData, onError) {
  return onSnapshot(query(collection(db, 'categories'), orderBy('sortOrder')), (s) => onData(snapToList(s)), onError);
}

export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export async function saveCategory(slug, data) {
  await setDoc(
    doc(db, 'categories', slug),
    {
      label: data.label.trim(),
      subtitle: (data.subtitle || '').trim(),
      image: data.image || '',
      imagePublicId: data.imagePublicId || '',
      sortOrder: Number(data.sortOrder) || 0,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export const deleteCategory = (slug) => deleteDoc(doc(db, 'categories', slug));

/* ───────────────────────── settings ───────────────────────── */

const settingsRef = () => doc(db, 'settings', 'store');

function withDefaults(data) {
  return {
    ...DEFAULT_SETTINGS,
    ...data,
    jazzcash: { ...DEFAULT_SETTINGS.jazzcash, ...data?.jazzcash },
    easypaisa: { ...DEFAULT_SETTINGS.easypaisa, ...data?.easypaisa },
  };
}

export async function fetchSettings() {
  const snap = await getDoc(settingsRef());
  return withDefaults(snap.exists() ? snap.data() : {});
}

export function subscribeSettings(onData, onError) {
  return onSnapshot(settingsRef(), (s) => onData(withDefaults(s.exists() ? s.data() : {})), onError);
}

export async function saveSettings(partial) {
  await setDoc(settingsRef(), { ...partial, updatedAt: serverTimestamp() }, { merge: true });
}

/* ───────────────────────── editable content ───────────────────────── */

const contentRef = () => doc(db, 'content', 'site');

export function subscribeContent(onData, onError) {
  return onSnapshot(contentRef(), (s) => onData(s.exists() ? s.data() : {}), onError);
}

export async function saveContent(partial) {
  await setDoc(contentRef(), { ...partial, updatedAt: serverTimestamp() }, { merge: true });
}

/* ───────────────────────── coupons ───────────────────────── */

export const normalizeCouponCode = (code) => String(code || '').trim().toUpperCase();

export async function fetchCoupon(code) {
  const clean = normalizeCouponCode(code);
  if (!/^[A-Z0-9_-]{3,30}$/.test(clean)) return null;
  const snap = await getDoc(doc(db, 'coupons', clean));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export function subscribeCoupons(onData, onError) {
  return onSnapshot(query(collection(db, 'coupons'), orderBy('code')), (s) => onData(snapToList(s)), onError);
}

export async function saveCoupon(data) {
  const code = normalizeCouponCode(data.code);
  await setDoc(doc(db, 'coupons', code), {
    code,
    type: data.type,
    value: Number(data.value),
    minSubtotal: Number(data.minSubtotal) || 0,
    active: Boolean(data.active),
    expiresAt: data.expiresAt ? Timestamp.fromDate(new Date(`${data.expiresAt}T23:59:59`)) : null,
    description: (data.description || '').trim(),
    updatedAt: serverTimestamp(),
  });
}

export const deleteCoupon = (code) => deleteDoc(doc(db, 'coupons', code));

/* ───────────────────────── orders ───────────────────────── */

function generateOrderNumber() {
  const now = new Date();
  const ymd = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase().padEnd(5, '0');
  return `LSH-${ymd}-${rand}`;
}

export const phoneLast4 = (phone) => String(phone || '').replace(/\D/g, '').slice(-4);

/** Public tracking document id: order number + last 4 digits of the customer's phone. */
export const trackingIdFor = (orderNumber, phone) => `${orderNumber}_${phoneLast4(phone)}`;

/** Quantity per product id (option variants of one product share its stock). */
function quantitiesByProduct(items) {
  return items.reduce((acc, i) => {
    const id = String(i.productId || i.id);
    return { ...acc, [id]: (acc[id] || 0) + Number(i.quantity) };
  }, {});
}

/**
 * Create an order, take its items out of stock and write its public tracking record — all in one
 * transaction, so two customers can't both buy the last piece.
 * Prices come from the live product catalog passed in by the caller, not the cart in localStorage.
 */
export async function placeOrder({ customer, notes, items, payment, settings, coupon, userId }) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = calcShipping(subtotal, settings);
  const discount = calcDiscount(subtotal, coupon);
  const orderRef = doc(collection(db, 'orders'));
  const order = {
    orderNumber: generateOrderNumber(),
    customer: {
      name: customer.name.trim(),
      email: (customer.email || '').trim().toLowerCase(),
      phone: customer.phone.trim(),
      address: customer.address.trim(),
      city: customer.city.trim(),
    },
    notes: (notes || '').trim(),
    items: items.map((i) => ({
      productId: String(i.productId || i.id),
      name: i.name,
      price: Number(i.price),
      quantity: Number(i.quantity),
      image: i.image || '',
      options: i.options || {},
    })),
    subtotal,
    shipping,
    discount,
    couponCode: discount > 0 ? coupon.code : '',
    total: subtotal + shipping - discount,
    payment: {
      method: payment.method,
      status: 'Pending',
      reference: payment.method === 'cod' ? '' : (payment.reference || '').trim(),
    },
    status: 'Pending',
    userId: userId || null,
    stockLines: quantitiesByProduct(items),
    stockDeducted: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await runTransaction(db, async (tx) => {
    const stockUpdates = [];
    const shortages = [];
    for (const [productId, qty] of Object.entries(order.stockLines)) {
      const productRef = doc(db, 'products', productId);
      const snap = await tx.get(productRef);
      const stock = snap.exists() ? Number(snap.data().stock) || 0 : 0;
      if (!snap.exists() || stock < qty) {
        shortages.push({ productId, name: snap.exists() ? snap.data().name : 'An item', available: stock });
      } else {
        stockUpdates.push({ productRef, stock: stock - qty });
      }
    }
    if (shortages.length) throw new OutOfStockError(shortages);

    tx.set(orderRef, order);
    for (const { productRef, stock } of stockUpdates) {
      tx.update(productRef, { stock, stockOrderId: orderRef.id, updatedAt: serverTimestamp() });
    }
    writeTracking(tx);
  });
  return { ...order, id: orderRef.id, createdAt: new Date() };

  function writeTracking(tx) {
    tx.set(doc(db, 'orderTracking', trackingIdFor(order.orderNumber, order.customer.phone)), {
      orderNumber: order.orderNumber,
      orderId: orderRef.id,
      status: 'Pending',
      paymentStatus: 'Pending',
      paymentMethod: order.payment.method,
      total: order.total,
      itemCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
      city: order.customer.city,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
}

export function subscribeOrders(onData, onError) {
  return onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (s) => onData(snapToList(s)), onError);
}

export async function fetchMyOrders(uid) {
  return snapToList(await getDocs(query(collection(db, 'orders'), where('userId', '==', uid), orderBy('createdAt', 'desc'))));
}

export async function fetchTracking(orderNumber, phone) {
  const number = String(orderNumber || '').trim().toUpperCase();
  if (!/^LSH-\d{6}-[A-Z0-9]{5}$/.test(number) || phoneLast4(phone).length !== 4) return null;
  const snap = await getDoc(doc(db, 'orderTracking', trackingIdFor(number, phone)));
  return snap.exists() ? snap.data() : null;
}

/**
 * Change an order's status. Cancelling puts the order's stock back; moving a cancelled (or an old,
 * pre-stock-tracking) order back to an active status takes it out again.
 * Returns { stockChanged: 'deducted' | 'restored' | null }.
 */
export async function setOrderStatus(orderId, status) {
  return runTransaction(db, async (tx) => {
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await tx.get(orderRef);
    if (!orderSnap.exists()) throw new Error('Order not found.');
    const order = orderSnap.data();

    const deduct = STOCK_HELD_STATUSES.includes(status) && !order.stockDeducted;
    const restore = status === 'Cancelled' && order.stockDeducted;

    const trackingRef = doc(db, 'orderTracking', trackingIdFor(order.orderNumber, order.customer.phone));
    const trackingSnap = await tx.get(trackingRef);

    // All reads must happen before any writes in a transaction
    const productUpdates = [];
    if (deduct || restore) {
      for (const [productId, qty] of Object.entries(order.stockLines || quantitiesByProduct(order.items))) {
        const productRef = doc(db, 'products', productId);
        const productSnap = await tx.get(productRef);
        if (!productSnap.exists()) continue; // product deleted since the order was placed
        const current = Number(productSnap.data().stock) || 0;
        productUpdates.push({ productRef, stock: deduct ? Math.max(0, current - qty) : current + qty });
      }
    }

    for (const { productRef, stock } of productUpdates) {
      tx.update(productRef, { stock, stockOrderId: orderId, updatedAt: serverTimestamp() });
    }
    tx.update(orderRef, {
      status,
      updatedAt: serverTimestamp(),
      ...(deduct ? { stockDeducted: true } : restore ? { stockDeducted: false } : {}),
    });
    if (trackingSnap.exists()) {
      tx.update(trackingRef, { status, updatedAt: serverTimestamp() });
    }
    return { stockChanged: deduct ? 'deducted' : restore ? 'restored' : null };
  });
}

export async function updatePaymentStatus(order, status) {
  const batch = writeBatch(db);
  batch.update(doc(db, 'orders', order.id), {
    'payment.status': status,
    'payment.updatedAt': serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  const trackingRef = doc(db, 'orderTracking', trackingIdFor(order.orderNumber, order.customer.phone));
  const trackingSnap = await getDoc(trackingRef);
  if (trackingSnap.exists()) batch.update(trackingRef, { paymentStatus: status, updatedAt: serverTimestamp() });
  await batch.commit();
}

/** Customer cancels their own Pending order; the stock it took goes back on the shelf. */
export async function cancelMyOrder(order) {
  await runTransaction(db, async (tx) => {
    const orderRef = doc(db, 'orders', order.id);
    const snap = await tx.get(orderRef);
    if (!snap.exists() || snap.data().status !== 'Pending') throw new Error('This order can no longer be cancelled.');
    const current = snap.data();
    const trackingRef = doc(db, 'orderTracking', trackingIdFor(current.orderNumber, current.customer.phone));
    const trackingSnap = await tx.get(trackingRef);

    const restores = [];
    if (current.stockDeducted && current.stockLines) {
      for (const [productId, qty] of Object.entries(current.stockLines)) {
        const productRef = doc(db, 'products', productId);
        const productSnap = await tx.get(productRef);
        if (productSnap.exists()) restores.push({ productRef, stock: (Number(productSnap.data().stock) || 0) + qty });
      }
    }

    tx.update(orderRef, { status: 'Cancelled', stockDeducted: false, updatedAt: serverTimestamp() });
    for (const { productRef, stock } of restores) {
      tx.update(productRef, { stock, stockOrderId: order.id, updatedAt: serverTimestamp() });
    }
    if (trackingSnap.exists()) tx.update(trackingRef, { status: 'Cancelled', updatedAt: serverTimestamp() });
  });
}

/** Admin deletes an order. If it was still holding stock (not cancelled), that stock is returned first. */
export async function deleteOrder(order) {
  if (order.stockDeducted && order.status !== 'Cancelled') {
    await setOrderStatus(order.id, 'Cancelled');
  }
  const batch = writeBatch(db);
  batch.delete(doc(db, 'orders', order.id));
  batch.delete(doc(db, 'orderTracking', trackingIdFor(order.orderNumber, order.customer.phone)));
  await batch.commit();
}

/* ───────────────────────── reviews ───────────────────────── */

export function subscribeProductReviews(productId, onData, onError) {
  return onSnapshot(
    query(collection(db, 'products', String(productId), 'reviews'), orderBy('updatedAt', 'desc')),
    (s) => onData(snapToList(s)),
    onError
  );
}

export async function saveReview(product, user, { rating, comment, name }) {
  const ref = doc(db, 'products', String(product.id), 'reviews', user.uid);
  const existing = await getDoc(ref);
  await setDoc(ref, {
    rating: Number(rating),
    comment: comment.trim(),
    name: name.trim(),
    productId: String(product.id),
    productName: product.name,
    createdAt: existing.exists() ? existing.data().createdAt : serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export const deleteReview = (productId, uid) => deleteDoc(doc(db, 'products', String(productId), 'reviews', uid));

export function subscribeAllReviews(onData, onError) {
  return onSnapshot(
    query(collectionGroup(db, 'reviews'), orderBy('updatedAt', 'desc')),
    (s) => onData(s.docs.map((d) => ({ id: d.id, uid: d.id, ...d.data() }))),
    onError
  );
}

export function summarizeRatings(reviews) {
  if (!reviews.length) return { average: 0, count: 0 };
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return { average: Math.round((total / reviews.length) * 10) / 10, count: reviews.length };
}

/* ───────────────────────── messages & newsletter ───────────────────────── */

export async function sendContactMessage({ name, email, subject, message }) {
  const ref = await addDoc(collection(db, 'messages'), {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject.trim(),
    message: message.trim(),
    isRead: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export function subscribeMessages(onData, onError) {
  return onSnapshot(query(collection(db, 'messages'), orderBy('createdAt', 'desc')), (s) => onData(snapToList(s)), onError);
}

export const setMessageRead = (id, isRead) => updateDoc(doc(db, 'messages', id), { isRead });
export const deleteMessage = (id) => deleteDoc(doc(db, 'messages', id));

/** Returns 'subscribed' or 'exists'. Doc id is the email so duplicates are rejected by the rules. */
export async function subscribeToNewsletter(email) {
  const clean = email.trim().toLowerCase();
  try {
    await setDoc(doc(db, 'subscribers', clean), { email: clean, createdAt: serverTimestamp() });
    return 'subscribed';
  } catch (err) {
    // Writing to an existing doc counts as an update, which the rules deny.
    if (err.code === 'permission-denied') return 'exists';
    throw err;
  }
}

export function subscribeSubscribers(onData, onError) {
  return onSnapshot(query(collection(db, 'subscribers'), orderBy('createdAt', 'desc')), (s) => onData(snapToList(s)), onError);
}

export const deleteSubscriber = (id) => deleteDoc(doc(db, 'subscribers', id));

/* ───────────────────────── users, wishlist, customers & team ───────────────────────── */

export async function createUserProfile(uid, { name, email, wishlist = [] }) {
  await setDoc(doc(db, 'users', uid), {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: '',
    role: 'customer',
    wishlist: wishlist.slice(0, 200),
    createdAt: serverTimestamp(),
  });
}

/** onData(profile, fromCache) — the first call may come from the offline cache and be out of date. */
export function subscribeUserProfile(uid, onData, onError) {
  return onSnapshot(
    doc(db, 'users', uid),
    { includeMetadataChanges: true },
    (s) => onData(s.exists() ? { id: s.id, ...s.data() } : null, s.metadata.fromCache),
    onError
  );
}

export async function updateOwnProfile(uid, { name, phone }) {
  await updateDoc(doc(db, 'users', uid), { name: name.trim(), phone: phone.trim() });
}

export const addToWishlist = (uid, productIds) => updateDoc(doc(db, 'users', uid), { wishlist: arrayUnion(...productIds.map(String)) });
export const removeFromWishlist = (uid, productId) => updateDoc(doc(db, 'users', uid), { wishlist: arrayRemove(String(productId)) });

export function subscribeTeam(onData, onError) {
  return onSnapshot(query(collection(db, 'users'), where('role', 'in', STAFF_ROLES)), (s) => onData(snapToList(s)), onError);
}

export function subscribeCustomers(onData, onError) {
  return onSnapshot(query(collection(db, 'users'), where('role', '==', 'customer')), (s) => onData(snapToList(s)), onError);
}

export async function findUserByEmail(email) {
  const snap = await getDocs(query(collection(db, 'users'), where('email', '==', email.trim().toLowerCase()), limit(1)));
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export const setUserRole = (uid, role) => updateDoc(doc(db, 'users', uid), { role });
export const setUserBlocked = (uid, blocked) => updateDoc(doc(db, 'users', uid), { blocked });

export async function countUsers() {
  const snap = await getCountFromServer(collection(db, 'users'));
  return snap.data().count;
}

/* ───────────────────────── backup ───────────────────────── */

function serialize(value) {
  if (value instanceof Timestamp) return { __timestamp: value.toDate().toISOString() };
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, serialize(v)]));
  return value;
}

/** Admin-only: every collection as JSON (restore with scripts/restore.mjs). */
export async function exportAllData() {
  const collections = ['products', 'categories', 'settings', 'content', 'coupons', 'orders', 'orderTracking', 'messages', 'subscribers', 'users'];
  const data = { exportedAt: new Date().toISOString(), collections: {} };
  for (const name of collections) {
    const snap = await getDocs(collection(db, name));
    data.collections[name] = Object.fromEntries(snap.docs.map((d) => [d.id, serialize(d.data())]));
  }
  const reviews = await getDocs(collectionGroup(db, 'reviews'));
  data.collections.reviews = Object.fromEntries(reviews.docs.map((d) => [d.ref.path, serialize(d.data())]));
  return data;
}
