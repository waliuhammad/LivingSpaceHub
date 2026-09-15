/**
 * Security rules tests — run against the Firestore emulator:
 *   npm run test:rules      (needs Java 11+ for the emulator)
 */
import { readFileSync } from 'node:fs';
import { after, before, beforeEach, describe, test } from 'node:test';
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { addDoc, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, deleteDoc, where } from 'firebase/firestore';

let env;

const USERS = {
  admin: { uid: 'u-admin', email: 'admin@test.com', role: 'admin' },
  manager: { uid: 'u-manager', email: 'manager@test.com', role: 'manager' },
  support: { uid: 'u-support', email: 'support@test.com', role: 'support' },
  alice: { uid: 'u-alice', email: 'alice@test.com', role: 'customer' },
  bob: { uid: 'u-bob', email: 'bob@test.com', role: 'customer' },
};

const guestDb = () => env.unauthenticatedContext().firestore();
const dbAs = (key) => env.authenticatedContext(USERS[key].uid, { email: USERS[key].email }).firestore();

const product = (overrides = {}) => ({ name: 'Lamp', price: 1000, category: 'decor', description: '', image: '', imagePublicId: '', stock: 5, featured: false, active: true, ...overrides });

function order(overrides = {}) {
  return {
    orderNumber: 'LSH-260915-ABCDE',
    customer: { name: 'Alice', email: 'alice@test.com', phone: '03001234567', address: 'House 1, Street 2', city: 'Peshawar' },
    notes: '',
    items: [{ productId: 'p1', name: 'Lamp', price: 1000, quantity: 2, image: '' }],
    subtotal: 2000,
    shipping: 250,
    total: 2250,
    payment: { method: 'cod', status: 'Pending', reference: '' },
    status: 'Pending',
    userId: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...overrides,
  };
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
      await setDoc(doc(db, 'users', u.uid), { name: u.uid, email: u.email, phone: '', role: u.role, createdAt: new Date() });
    }
    await setDoc(doc(db, 'settings', 'store'), { shippingFee: 250, freeShippingThreshold: 5000 });
    await setDoc(doc(db, 'products', 'p1'), product());
    await setDoc(doc(db, 'orders', 'alice-order'), { ...order({ userId: USERS.alice.uid }), createdAt: new Date(), updatedAt: new Date() });
  });
});

describe('catalog', () => {
  test('anyone can read products, categories and settings', async () => {
    await assertSucceeds(getDoc(doc(guestDb(), 'products', 'p1')));
    await assertSucceeds(getDocs(collection(guestDb(), 'categories')));
    await assertSucceeds(getDoc(doc(guestDb(), 'settings', 'store')));
  });

  test('guests, customers and support cannot write products', async () => {
    await assertFails(setDoc(doc(guestDb(), 'products', 'x'), product()));
    await assertFails(setDoc(doc(dbAs('alice'), 'products', 'x'), product()));
    await assertFails(setDoc(doc(dbAs('support'), 'products', 'x'), product()));
  });

  test('managers and admins can create, edit and delete products', async () => {
    await assertSucceeds(setDoc(doc(dbAs('manager'), 'products', 'x'), product()));
    await assertSucceeds(updateDoc(doc(dbAs('admin'), 'products', 'x'), { price: 900 }));
    await assertSucceeds(deleteDoc(doc(dbAs('manager'), 'products', 'x')));
  });

  test('invalid product data is rejected', async () => {
    await assertFails(setDoc(doc(dbAs('admin'), 'products', 'x'), product({ price: -1 })));
    await assertFails(setDoc(doc(dbAs('admin'), 'products', 'x'), product({ stock: 1.5 })));
  });

  test('only admins can change settings', async () => {
    await assertFails(setDoc(doc(dbAs('manager'), 'settings', 'store'), { shippingFee: 0 }, { merge: true }));
    await assertSucceeds(setDoc(doc(dbAs('admin'), 'settings', 'store'), { shippingFee: 0 }, { merge: true }));
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

  test('shipping must match store settings', async () => {
    await assertFails(addDoc(collection(guestDb(), 'orders'), order({ shipping: 0, total: 2000 })));
    // Above the free-shipping threshold shipping must be 0
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

  test('staff can list orders and update status / payment status only', async () => {
    await assertSucceeds(getDocs(collection(dbAs('support'), 'orders')));
    await assertSucceeds(updateDoc(doc(dbAs('support'), 'orders', 'alice-order'), { status: 'Shipped', updatedAt: serverTimestamp() }));
    await assertSucceeds(updateDoc(doc(dbAs('manager'), 'orders', 'alice-order'), { 'payment.status': 'Paid', 'payment.updatedAt': serverTimestamp() }));
    await assertFails(updateDoc(doc(dbAs('manager'), 'orders', 'alice-order'), { total: 1 }));
    await assertFails(updateDoc(doc(dbAs('manager'), 'orders', 'alice-order'), { 'payment.reference': 'forged' }));
    await assertFails(updateDoc(doc(dbAs('manager'), 'orders', 'alice-order'), { status: 'Lost' }));
  });

  test('customers cannot update orders; only admins delete', async () => {
    await assertFails(updateDoc(doc(dbAs('alice'), 'orders', 'alice-order'), { status: 'Delivered' }));
    await assertFails(deleteDoc(doc(dbAs('manager'), 'orders', 'alice-order')));
    await assertSucceeds(deleteDoc(doc(dbAs('admin'), 'orders', 'alice-order')));
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

describe('users and roles', () => {
  const newUser = { uid: 'u-new', email: 'new@test.com' };
  const newDb = () => env.authenticatedContext(newUser.uid, { email: newUser.email }).firestore();
  const profile = (o = {}) => ({ name: 'New', email: newUser.email, phone: '', role: 'customer', createdAt: serverTimestamp(), ...o });

  test('users sign up as customers only, with their own email', async () => {
    await assertFails(setDoc(doc(newDb(), 'users', newUser.uid), profile({ role: 'admin' })));
    await assertFails(setDoc(doc(newDb(), 'users', newUser.uid), profile({ email: 'someone@else.com' })));
    await assertFails(setDoc(doc(newDb(), 'users', 'u-other'), profile()));
    await assertSucceeds(setDoc(doc(newDb(), 'users', newUser.uid), profile()));
  });

  test('customers edit their name/phone but never their role', async () => {
    await assertSucceeds(updateDoc(doc(dbAs('alice'), 'users', USERS.alice.uid), { name: 'Alice B', phone: '0300' }));
    await assertFails(updateDoc(doc(dbAs('alice'), 'users', USERS.alice.uid), { role: 'admin' }));
    await assertFails(getDoc(doc(dbAs('alice'), 'users', USERS.bob.uid)));
  });

  test('admins change other users’ roles but not their own; managers cannot', async () => {
    await assertSucceeds(updateDoc(doc(dbAs('admin'), 'users', USERS.bob.uid), { role: 'support' }));
    await assertFails(updateDoc(doc(dbAs('admin'), 'users', USERS.admin.uid), { role: 'customer' }));
    await assertFails(updateDoc(doc(dbAs('manager'), 'users', USERS.alice.uid), { role: 'manager' }));
    await assertFails(updateDoc(doc(dbAs('admin'), 'users', USERS.bob.uid), { role: 'superuser' }));
  });

  test('staff can look up users (team page); customers cannot list users', async () => {
    await assertSucceeds(getDocs(query(collection(dbAs('admin'), 'users'), where('email', '==', USERS.bob.email))));
    await assertFails(getDocs(collection(dbAs('alice'), 'users')));
  });
});
