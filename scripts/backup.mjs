#!/usr/bin/env node
/**
 * Download a full backup of the Firestore database to backups/<date>.json.
 *
 *   npm run backup
 *
 * Uses service-account.json (project root) or GOOGLE_APPLICATION_CREDENTIALS. Run it weekly, or
 * schedule it with Windows Task Scheduler. Backups contain customer details — keep them private.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const keyPath = resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS || 'service-account.json');
if (!existsSync(keyPath)) {
  console.error(`Service account key not found at ${keyPath}.`);
  process.exit(1);
}
initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, 'utf8'))) });
const db = getFirestore();

function serialize(value) {
  if (value instanceof Timestamp) return { __timestamp: value.toDate().toISOString() };
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, serialize(v)]));
  return value;
}

const data = { exportedAt: new Date().toISOString(), collections: {} };
for (const collection of await db.listCollections()) {
  const snap = await collection.get();
  data.collections[collection.id] = Object.fromEntries(snap.docs.map((d) => [d.id, serialize(d.data())]));
  console.log(`  ${collection.id}: ${snap.size}`);
}
const reviews = await db.collectionGroup('reviews').get();
data.collections.reviews = Object.fromEntries(reviews.docs.map((d) => [d.ref.path, serialize(d.data())]));
console.log(`  reviews: ${reviews.size}`);

mkdirSync('backups', { recursive: true });
const file = `backups/backup-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`;
writeFileSync(file, JSON.stringify(data, null, 2));
console.log(`✔ Saved ${file}`);
