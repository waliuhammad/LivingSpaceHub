/**
 * Security rules tests — run against the Firestore emulator:
 *   npm run test:rules      (needs Java 11+ for the emulator)
 */
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, test } from 'node:test';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import {
  addDoc,
  collection,
  collectionGroup,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

let env;

const USERS = {
  admin: { uid: 'u-admin', email: 'admin@test.com', role: 'admin' },
  manager: { uid: 'u-manager', email: 'manager@test.com', role: 'manager' },
  support: { uid: 'u-support', email: 'support@test.com', role: 'support' },
  alice: { uid: 'u-alice', email: 'alice@test.com', role: 'customer' },
  bob: { uid: 'u-bob', email: 'bob@test.com', role: 'customer' },
  mallory: { uid: 'u-mallory', email: 'mallory@test.com', role: 'customer', blocked: true },
};

const guestDb = () => env.unauthenticatedContext().firestore();
const dbAs = (key, { verified = true } = {}) =>
  env.authenticatedContext(USERS[key].uid, { email: USERS[key].email, email_verified: verified }).firestore();

const product = (overrides = {}) => ({ name: 'Lamp', price: 1000, category: 'decor', description: '', image: '', imagePublicId: '', stock: 5, featured: false, active: true, ...overrides });

function order(overrides = {}) {
  return {
    orderNumber: 'LSH-260915-ABCDE',
    customer: { name: 'Alice', email: 'alice@test.com', phone: '0300-1234567', address: 'House 1, Street 2', city: 'Peshawar' },
    notes: '',
    items: [{ productId: 'p1', name: 'Lamp', price: 1000, quantity: 2, image: '', options: {} }],
    stockLines: { p1: 2 },
    subtotal: 2000,
    shipping: 250,
    discount: 0,
    couponCode: '',
    total: 2250,
    payment: { method: 'cod', status: 'Pending', reference: '' },
    status: 'Pending',
    userId: null,
    stockDeducted: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...overrides,
  };
}

const tracking = (orderId, overrides = {}) => ({
  orderNumber: 'LSH-260915-ABCDE',
  orderId,
  status: 'Pending',
  paymentStatus: 'Pending',
  paymentMethod: 'cod',
  total: 2250,
  itemCount: 2,
  city: 'Peshawar',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  ...overrides,
});

/** Place an order the way the website does: order + stock decrement + tracking in one batch. */
function placeOrderBatch(db, { orderId = 'o-new', data = order(), stock = { p1: 3 }, trackingId = 'LSH-260915-ABCDE_4567', withTracking = true } = {}) {
  const batch = writeBatch(db);
  batch.set(doc(db, 'orders', orderId), data);
  for (const [productId, newStock] of Object.entries(stock)) {
    batch.update(doc(db, 'products', productId), { stock: newStock, stockOrderId: orderId, updatedAt: serverTimestamp() });
  }
  if (withTracking) batch.set(doc(db, 'orderTracking', trackingId), tracking(orderId, { total: data.total, paymentMethod: data.payment.method }));
  return batch.commit();
}

async function seed(fn) {
  await env.withSecurityRulesDisabled(async (ctx) => fn(ctx.firestore()));
}

before(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-living-space-hub',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  });
});

after(async () => {
  await env.cleanup();
});

beforeEach(async () => {
  await env.clearFirestore();
  await seed(async (db) => {
    for (const u of Object.values(USERS)) {
      await setDoc(doc(db, 'users', u.uid), { name: u.uid, email: u.email, phone: '', role: u.role, wishlist: [], ...(u.blocked ? { blocked: true } : {}), createdAt: new Date() });
    }
    await setDoc(doc(db, 'settings', 'store'), { shippingFee: 250, freeShippingThreshold: 5000 });
    await setDoc(doc(db, 'products', 'p1'), product());
    await setDoc(doc(db, 'products', 'p2'), product({ name: 'Rug', stock: 10 }));
    await setDoc(doc(db, 'orders', 'alice-order'), { ...order({ userId: USERS.alice.uid }), createdAt: new Date(), updatedAt: new Date() });
    await setDoc(doc(db, 'coupons', 'SAVE10'), { code: 'SAVE10', type: 'percent', value: 10, minSubtotal: 1000, active: true, expiresAt: null });
    await setDoc(doc(db, 'coupons', 'OLD'), { code: 'OLD', type: 'fixed', value: 500, minSubtotal: 0, active: true, expiresAt: Timestamp.fromDate(new Date('2020-01-01')) });
    await setDoc(doc(db, 'coupons', 'OFF'), { code: 'OFF', type: 'fixed', value: 500, minSubtotal: 0, active: false, expiresAt: null });
  });
});

describe('catalog', () => {
  test('anyone can read products, categories, settings and content', async () => {
    await assertSucceeds(getDoc(doc(guestDb(), 'products', 'p1')));
    await assertSucceeds(getDocs(collection(guestDb(), 'categories')));
    await assertSucceeds(getDoc(doc(guestDb(), 'settings', 'store')));
    await assertSucceeds(getDoc(doc(guestDb(), 'content', 'site')));
  });

  test('guests, customers and support cannot edit products', async () => {
    await assertFails(setDoc(doc(guestDb(), 'products', 'x'), product()));
    await assertFails(setDoc(doc(dbAs('alice'), 'products', 'x'), product()));
    await assertFails(setDoc(doc(dbAs('support'), 'products', 'x'), product()));
    await assertFails(updateDoc(doc(dbAs('support'), 'products', 'p1'), { price: 1 }));
  });

  test('managers and admins can create, edit and delete products', async () => {
    await assertSucceeds(setDoc(doc(dbAs('manager'), 'products', 'x'), product({ images: [{ url: 'u', publicId: 'p' }], options: [{ name: 'Colour', values: ['Oak'] }] })));
    await assertSucceeds(updateDoc(doc(dbAs('admin'), 'products', 'x'), { price: 900 }));
    await assertSucceeds(deleteDoc(doc(dbAs('manager'), 'products', 'x')));
  });

  test('invalid product data is rejected', async () => {
    await assertFails(setDoc(doc(dbAs('admin'), 'products', 'x'), product({ price: -1 })));
    await assertFails(setDoc(doc(dbAs('admin'), 'products', 'x'), product({ stock: 1.5 })));
  });

  test('only admins change settings and site content', async () => {
    await assertFails(setDoc(doc(dbAs('manager'), 'settings', 'store'), { shippingFee: 0 }, { merge: true }));
    await assertSucceeds(setDoc(doc(dbAs('admin'), 'settings', 'store'), { shippingFee: 0 }, { merge: true }));
    await assertFails(setDoc(doc(dbAs('manager'), 'content', 'site'), { footerTagline: 'x' }));
    await assertSucceeds(setDoc(doc(dbAs('admin'), 'content', 'site'), { footerTagline: 'x' }));
  });
});

describe('stock', () => {
  test('placing an order takes exactly the ordered quantity out of stock', async () => {
    await assertSucceeds(placeOrderBatch(guestDb()));
  });

  test('stock cannot be taken by a different amount, or without a new order', async () => {
    await assertFails(placeOrderBatch(guestDb(), { stock: { p1: 1 } })); // took 4, ordered 2
    await assertFails(placeOrderBatch(guestDb(), { stock: { p2: 8 } })); // product not in the order
    await assertFails(updateDoc(doc(guestDb(), 'products', 'p1'), { stock: 0, stockOrderId: 'alice-order', updatedAt: serverTimestamp() })); // old order
    await assertFails(updateDoc(doc(guestDb(), 'products', 'p1'), { stock: 4 }));
  });

  test('a fake order cannot increase stock or push it below zero', async () => {
    await assertFails(placeOrderBatch(guestDb(), { data: order({ stockLines: { p1: -5 } }), stock: { p1: 10 } }));
    await assertFails(placeOrderBatch(guestDb(), { data: order({ stockLines: { p1: 9 } }), stock: { p1: -4 } }));
  });

  test('a customer cancelling their own Pending order returns exactly its stock', async () => {
    const db = dbAs('alice');
    const batch = writeBatch(db);
    batch.update(doc(db, 'orders', 'alice-order'), { status: 'Cancelled', stockDeducted: false, updatedAt: serverTimestamp() });
    batch.update(doc(db, 'products', 'p1'), { stock: 7, stockOrderId: 'alice-order', updatedAt: serverTimestamp() });
    await assertSucceeds(batch.commit());
  });

  test('cancelling cannot return more than the order took, and others cannot cancel it', async () => {
    const alice = dbAs('alice');
    const tooMuch = writeBatch(alice);
    tooMuch.update(doc(alice, 'orders', 'alice-order'), { status: 'Cancelled', stockDeducted: false, updatedAt: serverTimestamp() });
    tooMuch.update(doc(alice, 'products', 'p1'), { stock: 50, stockOrderId: 'alice-order', updatedAt: serverTimestamp() });
    await assertFails(tooMuch.commit());

    const bob = dbAs('bob');
    const notMine = writeBatch(bob);
    notMine.update(doc(bob, 'orders', 'alice-order'), { status: 'Cancelled', stockDeducted: false, updatedAt: serverTimestamp() });
    notMine.update(doc(bob, 'products', 'p1'), { stock: 7, stockOrderId: 'alice-order', updatedAt: serverTimestamp() });
    await assertFails(notMine.commit());
  });

  test('staff can adjust stock while processing orders', async () => {
    await assertSucceeds(updateDoc(doc(dbAs('support'), 'products', 'p1'), { stock: 9, stockOrderId: 'alice-order', updatedAt: serverTimestamp() }));
  });
});

describe('orders', () => {
  test('a guest can place a valid Cash on Delivery order', async () => {
    await assertSucceeds(addDoc(collection(guestDb(), 'orders'), order()));
  });

  test('a signed-in customer can place an order linked to themselves, not someone else', async () => {
    await assertSucceeds(addDoc(collection(dbAs('alice'), 'orders'), order({ userId: USERS.alice.uid })));
    await assertFails(addDoc(collection(dbAs('alice'), 'orders'), order({ userId: USERS.bob.uid })));
    await assertFails(addDoc(collection(guestDb(), 'orders'), order({ userId: USERS.bob.uid })));
  });

  test('blocked customers cannot place orders', async () => {
    await assertFails(addDoc(collection(dbAs('mallory'), 'orders'), order({ userId: USERS.mallory.uid })));
  });

  test('shipping must match store settings', async () => {
    await assertFails(addDoc(collection(guestDb(), 'orders'), order({ shipping: 0, total: 2000 })));
    await assertSucceeds(addDoc(collection(guestDb(), 'orders'), order({ subtotal: 6000, shipping: 0, total: 6000 })));
    await assertFails(addDoc(collection(guestDb(), 'orders'), order({ subtotal: 6000, shipping: 250, total: 6250 })));
  });

  test('orders with no settings doc ship free', async () => {
    await seed((db) => deleteDoc(doc(db, 'settings', 'store')));
    await assertSucceeds(addDoc(collection(guestDb(), 'orders'), order({ shipping: 0, total: 2000 })));
  });

  test('tampered orders are rejected', async () => {
    const cases = [
      order({ total: 1 }),
      order({ status: 'Delivered' }),
      order({ stockDeducted: false }),
      order({ payment: { method: 'cod', status: 'Paid', reference: '' } }),
      order({ payment: { method: 'bitcoin', status: 'Pending', reference: '' } }),
      order({ payment: { method: 'jazzcash', status: 'Pending', reference: '' } }),
      order({ items: [] }),
      order({ createdAt: new Date('2020-01-01') }),
      { ...order(), isAdminOverride: true },
    ];
    for (const bad of cases) {
      await assertFails(addDoc(collection(guestDb(), 'orders'), bad));
    }
  });

  test('JazzCash / EasyPaisa orders need a transaction ID', async () => {
    await assertSucceeds(addDoc(collection(guestDb(), 'orders'), order({ payment: { method: 'easypaisa', status: 'Pending', reference: '0123456789' } })));
  });

  test('customers read only their own orders; guests read none', async () => {
    await assertSucceeds(getDoc(doc(dbAs('alice'), 'orders', 'alice-order')));
    await assertSucceeds(getDocs(query(collection(dbAs('alice'), 'orders'), where('userId', '==', USERS.alice.uid))));
    await assertFails(getDoc(doc(dbAs('bob'), 'orders', 'alice-order')));
    await assertFails(getDocs(collection(dbAs('bob'), 'orders')));
    await assertFails(getDoc(doc(guestDb(), 'orders', 'alice-order')));
  });

  test('staff update status / payment status only', async () => {
    await assertSucceeds(getDocs(collection(dbAs('support'), 'orders')));
    await assertSucceeds(updateDoc(doc(dbAs('support'), 'orders', 'alice-order'), { status: 'Shipped', updatedAt: serverTimestamp() }));
    await assertSucceeds(updateDoc(doc(dbAs('manager'), 'orders', 'alice-order'), { 'payment.status': 'Paid', 'payment.updatedAt': serverTimestamp() }));
    await assertFails(updateDoc(doc(dbAs('manager'), 'orders', 'alice-order'), { total: 1 }));
    await assertFails(updateDoc(doc(dbAs('manager'), 'orders', 'alice-order'), { 'payment.reference': 'forged' }));
    await assertFails(updateDoc(doc(dbAs('manager'), 'orders', 'alice-order'), { status: 'Lost' }));
  });

  test('customers may only cancel their own Pending orders; only admins delete', async () => {
    await assertFails(updateDoc(doc(dbAs('alice'), 'orders', 'alice-order'), { status: 'Delivered', updatedAt: serverTimestamp() }));
    await assertFails(updateDoc(doc(dbAs('bob'), 'orders', 'alice-order'), { status: 'Cancelled', stockDeducted: false, updatedAt: serverTimestamp() }));
    await seed((db) => updateDoc(doc(db, 'orders', 'alice-order'), { status: 'Shipped' }));
    await assertFails(updateDoc(doc(dbAs('alice'), 'orders', 'alice-order'), { status: 'Cancelled', stockDeducted: false, updatedAt: serverTimestamp() }));
    await assertFails(deleteDoc(doc(dbAs('manager'), 'orders', 'alice-order')));
    await assertSucceeds(deleteDoc(doc(dbAs('admin'), 'orders', 'alice-order')));
  });
});

describe('coupons', () => {
  test('customers can look up a code but not list all codes', async () => {
    await assertSucceeds(getDoc(doc(guestDb(), 'coupons', 'SAVE10')));
    await assertFails(getDocs(collection(guestDb(), 'coupons')));
    await assertSucceeds(getDocs(collection(dbAs('support'), 'coupons')));
  });

  test('a valid coupon discount is accepted', async () => {
    await assertSucceeds(addDoc(collection(guestDb(), 'orders'), order({ couponCode: 'SAVE10', discount: 200, total: 2050 })));
  });

  test('wrong, expired, inactive, unknown or under-minimum coupons are rejected', async () => {
    await assertFails(addDoc(collection(guestDb(), 'orders'), order({ couponCode: 'SAVE10', discount: 1000, total: 1250 })));
    await assertFails(addDoc(collection(guestDb(), 'orders'), order({ couponCode: 'OLD', discount: 500, total: 1750 })));
    await assertFails(addDoc(collection(guestDb(), 'orders'), order({ couponCode: 'OFF', discount: 500, total: 1750 })));
    await assertFails(addDoc(collection(guestDb(), 'orders'), order({ couponCode: 'NOPE', discount: 100, total: 2150 })));
    await assertFails(
      addDoc(collection(guestDb(), 'orders'), order({ items: [{ productId: 'p1', name: 'Lamp', price: 500, quantity: 1 }], subtotal: 500, total: 700, couponCode: 'SAVE10', discount: 50 }))
    );
    await assertFails(addDoc(collection(guestDb(), 'orders'), order({ couponCode: '', discount: 100, total: 2150 })));
  });

  test('managers create coupons; customers cannot', async () => {
    const coupon = { code: 'EID20', type: 'percent', value: 20, minSubtotal: 0, active: true, expiresAt: null };
    await assertFails(setDoc(doc(dbAs('alice'), 'coupons', 'EID20'), coupon));
    await assertFails(setDoc(doc(dbAs('manager'), 'coupons', 'EID20'), { ...coupon, value: 150 }));
    await assertSucceeds(setDoc(doc(dbAs('manager'), 'coupons', 'EID20'), coupon));
  });
});

describe('order tracking', () => {
  test('the tracking record is written with its order and read by order number + phone', async () => {
    await assertSucceeds(placeOrderBatch(guestDb()));
    await assertSucceeds(getDoc(doc(guestDb(), 'orderTracking', 'LSH-260915-ABCDE_4567')));
    await assertFails(getDocs(collection(guestDb(), 'orderTracking')));
  });

  test('tracking must match its order (phone digits, total, city)', async () => {
    await assertFails(placeOrderBatch(guestDb(), { trackingId: 'LSH-260915-ABCDE_9999' }));
    await assertFails(placeOrderBatch(guestDb(), { trackingId: 'LSH-999999-ZZZZZ_4567' }));
    const db = guestDb();
    const batch = writeBatch(db);
    batch.set(doc(db, 'orders', 'o2'), order());
    batch.update(doc(db, 'products', 'p1'), { stock: 3, stockOrderId: 'o2', updatedAt: serverTimestamp() });
    batch.set(doc(db, 'orderTracking', 'LSH-260915-ABCDE_4567'), tracking('o2', { total: 1 }));
    await assertFails(batch.commit());
  });

  test('only staff update tracking status', async () => {
    await placeOrderBatch(guestDb());
    await assertFails(updateDoc(doc(guestDb(), 'orderTracking', 'LSH-260915-ABCDE_4567'), { status: 'Delivered', updatedAt: serverTimestamp() }));
    await assertSucceeds(updateDoc(doc(dbAs('support'), 'orderTracking', 'LSH-260915-ABCDE_4567'), { status: 'Shipped', updatedAt: serverTimestamp() }));
  });
});

describe('reviews', () => {
  const review = (o = {}) => ({ rating: 5, comment: 'Lovely', name: 'Alice', productId: 'p1', productName: 'Lamp', createdAt: serverTimestamp(), updatedAt: serverTimestamp(), ...o });
  const reviewRef = (db, uid) => doc(db, 'products', 'p1', 'reviews', uid);

  test('verified customers write one review under their own id', async () => {
    await assertSucceeds(setDoc(reviewRef(dbAs('alice'), USERS.alice.uid), review()));
    await assertSucceeds(setDoc(reviewRef(dbAs('alice'), USERS.alice.uid), review({ rating: 4 })));
    await assertFails(setDoc(reviewRef(dbAs('alice'), USERS.bob.uid), review()));
  });

  test('unverified, blocked, signed-out and invalid reviews are rejected', async () => {
    await assertFails(setDoc(reviewRef(dbAs('bob', { verified: false }), USERS.bob.uid), review()));
    await assertFails(setDoc(reviewRef(dbAs('mallory'), USERS.mallory.uid), review()));
    await assertFails(setDoc(reviewRef(guestDb(), 'anyone'), review()));
    await assertFails(setDoc(reviewRef(dbAs('alice'), USERS.alice.uid), review({ rating: 6 })));
    await assertFails(setDoc(reviewRef(dbAs('alice'), USERS.alice.uid), review({ productId: 'p2' })));
  });

  test('anyone reads reviews (including collection group); staff can delete', async () => {
    await seed((db) => setDoc(reviewRef(db, USERS.bob.uid), review({ name: 'Bob' })));
    await assertSucceeds(getDocs(collection(guestDb(), 'products', 'p1', 'reviews')));
    await assertSucceeds(getDocs(collectionGroup(dbAs('support'), 'reviews')));
    await assertFails(deleteDoc(reviewRef(dbAs('alice'), USERS.bob.uid)));
    await assertSucceeds(deleteDoc(reviewRef(dbAs('support'), USERS.bob.uid)));
  });
});

describe('messages and newsletter', () => {
  const message = (o = {}) => ({ name: 'A', email: 'a@b.com', subject: 'Hi', message: 'Hello', isRead: false, createdAt: serverTimestamp(), ...o });

  test('anyone can send a contact message, only staff can read it', async () => {
    await assertSucceeds(addDoc(collection(guestDb(), 'messages'), message()));
    await assertFails(addDoc(collection(guestDb(), 'messages'), message({ isRead: true })));
    await assertFails(getDocs(collection(dbAs('alice'), 'messages')));
    await assertSucceeds(getDocs(collection(dbAs('support'), 'messages')));
  });

  test('subscribing twice cannot overwrite; subscriber list is staff-only', async () => {
    const ref = (db) => doc(db, 'subscribers', 'a@b.com');
    await assertSucceeds(setDoc(ref(guestDb()), { email: 'a@b.com', createdAt: serverTimestamp() }));
    await assertFails(setDoc(ref(guestDb()), { email: 'a@b.com', createdAt: serverTimestamp() }));
    await assertFails(setDoc(doc(guestDb(), 'subscribers', 'x@y.com'), { email: 'other@y.com', createdAt: serverTimestamp() }));
    await assertFails(getDocs(collection(guestDb(), 'subscribers')));
    await assertSucceeds(getDocs(collection(dbAs('manager'), 'subscribers')));
  });
});

describe('users, wishlist and roles', () => {
  const newUser = { uid: 'u-new', email: 'new@test.com' };
  const newDb = () => env.authenticatedContext(newUser.uid, { email: newUser.email }).firestore();
  const profile = (o = {}) => ({ name: 'New', email: newUser.email, phone: '', role: 'customer', wishlist: ['p1'], createdAt: serverTimestamp(), ...o });

  test('users sign up as customers only, with their own email', async () => {
    await assertFails(setDoc(doc(newDb(), 'users', newUser.uid), profile({ role: 'admin' })));
    await assertFails(setDoc(doc(newDb(), 'users', newUser.uid), profile({ email: 'someone@else.com' })));
    await assertFails(setDoc(doc(newDb(), 'users', newUser.uid), profile({ blocked: false })));
    await assertFails(setDoc(doc(newDb(), 'users', 'u-other'), profile()));
    await assertSucceeds(setDoc(doc(newDb(), 'users', newUser.uid), profile()));
  });

  test('customers edit their name, phone and wishlist — never role or blocked', async () => {
    await assertSucceeds(updateDoc(doc(dbAs('alice'), 'users', USERS.alice.uid), { name: 'Alice B', phone: '0300', wishlist: ['p1', 'p2'] }));
    await assertFails(updateDoc(doc(dbAs('alice'), 'users', USERS.alice.uid), { role: 'admin' }));
    await assertFails(updateDoc(doc(dbAs('mallory'), 'users', USERS.mallory.uid), { blocked: false }));
    await assertFails(getDoc(doc(dbAs('alice'), 'users', USERS.bob.uid)));
  });

  test('admins change other users’ roles and block them; managers cannot; nobody changes their own', async () => {
    await assertSucceeds(updateDoc(doc(dbAs('admin'), 'users', USERS.bob.uid), { role: 'support' }));
    await assertSucceeds(updateDoc(doc(dbAs('admin'), 'users', USERS.alice.uid), { blocked: true }));
    await assertFails(updateDoc(doc(dbAs('admin'), 'users', USERS.admin.uid), { role: 'customer' }));
    await assertFails(updateDoc(doc(dbAs('manager'), 'users', USERS.alice.uid), { role: 'manager' }));
    await assertFails(updateDoc(doc(dbAs('manager'), 'users', USERS.bob.uid), { blocked: true }));
    await assertFails(updateDoc(doc(dbAs('admin'), 'users', USERS.bob.uid), { role: 'superuser' }));
  });

  test('staff can list customers; customers cannot list users', async () => {
    await assertSucceeds(getDocs(query(collection(dbAs('manager'), 'users'), where('role', '==', 'customer'))));
    await assertSucceeds(getDocs(query(collection(dbAs('admin'), 'users'), where('email', '==', USERS.bob.email))));
    await assertFails(getDocs(collection(dbAs('alice'), 'users')));
  });
});
