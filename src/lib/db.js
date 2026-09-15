import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getCountFromServer,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
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

/** Shipping rule shared by the cart, checkout and firestore.rules. */
export function calcShipping(subtotal, settings) {
  const fee = Number(settings?.shippingFee) || 0;
  const threshold = Number(settings?.freeShippingThreshold) || 0;
  if (subtotal <= 0) return 0;
  if (threshold > 0 && subtotal >= threshold) return 0;
  return fee;
}

export const PAYMENT_METHODS = {
  cod: 'Cash on Delivery',
  jazzcash: 'JazzCash',
  easypaisa: 'EasyPaisa',
};

export const ORDER_STATUSES = ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
export const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded'];

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

function productPayload(data) {
  return {
    name: data.name.trim(),
    price: Number(data.price),
    category: data.category,
    description: (data.description || '').trim(),
    image: data.image || '',
    imagePublicId: data.imagePublicId || '',
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

/* ───────────────────────── orders ───────────────────────── */

function generateOrderNumber() {
  const now = new Date();
  const ymd = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `LSH-${ymd}-${rand}`;
}

/**
 * Create an order. Prices come from the live product catalog passed in by the caller,
 * not from the (possibly stale) cart stored in localStorage.
 */
export async function placeOrder({ customer, notes, items, payment, settings, userId }) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = calcShipping(subtotal, settings);
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
      productId: String(i.id),
      name: i.name,
      price: Number(i.price),
      quantity: Number(i.quantity),
      image: i.image || '',
    })),
    subtotal,
    shipping,
    total: subtotal + shipping,
    payment: {
      method: payment.method,
      status: 'Pending',
      reference: payment.method === 'cod' ? '' : (payment.reference || '').trim(),
    },
    status: 'Pending',
    userId: userId || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const ref = await addDoc(collection(db, 'orders'), order);
  return { ...order, id: ref.id, createdAt: new Date() };
}

export function subscribeOrders(onData, onError) {
  return onSnapshot(query(collection(db, 'orders'), orderBy('createdAt', 'desc')), (s) => onData(snapToList(s)), onError);
}

export async function fetchMyOrders(uid) {
  return snapToList(await getDocs(query(collection(db, 'orders'), where('userId', '==', uid), orderBy('createdAt', 'desc'))));
}

export async function updateOrderStatus(id, status) {
  await updateDoc(doc(db, 'orders', id), { status, updatedAt: serverTimestamp() });
}

export async function updatePaymentStatus(id, status) {
  await updateDoc(doc(db, 'orders', id), {
    'payment.status': status,
    'payment.updatedAt': serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export const deleteOrder = (id) => deleteDoc(doc(db, 'orders', id));

/* ───────────────────────── messages & newsletter ───────────────────────── */

export async function sendContactMessage({ name, email, subject, message }) {
  await addDoc(collection(db, 'messages'), {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    subject: subject.trim(),
    message: message.trim(),
    isRead: false,
    createdAt: serverTimestamp(),
  });
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

/* ───────────────────────── users & team ───────────────────────── */

export async function createUserProfile(uid, { name, email }) {
  await setDoc(doc(db, 'users', uid), {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: '',
    role: 'customer',
    createdAt: serverTimestamp(),
  });
}

export function subscribeUserProfile(uid, onData, onError) {
  return onSnapshot(doc(db, 'users', uid), (s) => onData(s.exists() ? { id: s.id, ...s.data() } : null), onError);
}

export async function updateOwnProfile(uid, { name, phone }) {
  await updateDoc(doc(db, 'users', uid), { name: name.trim(), phone: phone.trim() });
}

export function subscribeTeam(onData, onError) {
  return onSnapshot(query(collection(db, 'users'), where('role', 'in', STAFF_ROLES)), (s) => onData(snapToList(s)), onError);
}

export async function findUserByEmail(email) {
  const snap = await getDocs(query(collection(db, 'users'), where('email', '==', email.trim().toLowerCase()), limit(1)));
  return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() };
}

export const setUserRole = (uid, role) => updateDoc(doc(db, 'users', uid), { role });

export async function countUsers() {
  const snap = await getCountFromServer(collection(db, 'users'));
  return snap.data().count;
}
