#!/usr/bin/env node
/**
 * Promote an existing website account to a staff role.
 * Use this once to create the first administrator; after that, admins manage roles in Admin → Team & Roles.
 *
 * 1. Sign up on the website (/signup) with the email you want to use.
 * 2. Firebase console → Project settings → Service accounts → Generate new private key.
 *    Save it in the project root as service-account.json (it is gitignored — never commit it).
 * 3. npm run make-admin -- you@example.com            (role defaults to admin)
 *    npm run make-admin -- someone@example.com manager
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const ROLES = ['admin', 'manager', 'support', 'customer'];
const [email, role = 'admin'] = process.argv.slice(2);

if (!email || !ROLES.includes(role)) {
  console.error('Usage: npm run make-admin -- <email> [admin|manager|support|customer]');
  process.exit(1);
}

const keyPath = resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS || 'service-account.json');
if (!existsSync(keyPath)) {
  console.error(`Service account key not found at ${keyPath}.\nDownload it from Firebase console → Project settings → Service accounts.`);
  process.exit(1);
}

initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, 'utf8'))) });

try {
  const user = await getAuth().getUserByEmail(email);
  const ref = getFirestore().collection('users').doc(user.uid);
  const snap = await ref.get();
  if (snap.exists) {
    await ref.update({ role });
  } else {
    await ref.set({
      name: user.displayName || email.split('@')[0],
      email: user.email.toLowerCase(),
      phone: '',
      role,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  console.log(`✔ ${email} is now "${role}". Sign in at /admin-login.`);
} catch (err) {
  if (err.code === 'auth/user-not-found') {
    console.error(`No account for ${email}. Sign up on the website first, then run this again.`);
  } else {
    console.error(err.message);
  }
  process.exit(1);
}
