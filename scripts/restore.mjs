#!/usr/bin/env node
/**
 * Restore a backup made by `npm run backup` or Admin → Settings → Download Backup.
 *
 *   npm run restore -- backups/backup-2026-09-15.json            (dry run: shows what would change)
 *   npm run restore -- backups/backup-2026-09-15.json --yes      (writes to the live database)
 *
 * Documents in the backup overwrite the current ones with the same id. Documents created after
 * the backup are left untouched (nothing is deleted).
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

const [file, flag] = process.argv.slice(2);
if (!file || !existsSync(file)) {
  console.error('Usage: npm run restore -- <backup.json> [--yes]');
  process.exit(1);
}
const keyPath = resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS || 'service-account.json');
if (!existsSync(keyPath)) {
  console.error(`Service account key not found at ${keyPath}.`);
  process.exit(1);
}

initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, 'utf8'))) });
const db = getFirestore();
const backup = JSON.parse(readFileSync(file, 'utf8'));

function deserialize(value) {
  if (value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 1 && '__timestamp' in value) {
    return Timestamp.fromDate(new Date(value.__timestamp));
  }
  if (Array.isArray(value)) return value.map(deserialize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deserialize(v)]));
  return value;
}

const writes = [];
for (const [collection, docs] of Object.entries(backup.collections || {})) {
  for (const [id, data] of Object.entries(docs)) {
    // Reviews are stored by full path (products/<id>/reviews/<uid>)
    const ref = collection === 'reviews' ? db.doc(id) : db.collection(collection).doc(id);
    writes.push({ ref, data: deserialize(data) });
  }
  console.log(`  ${collection}: ${Object.keys(docs).length} documents`);
}

console.log(`Backup from ${backup.exportedAt}: ${writes.length} documents in total.`);
if (flag !== '--yes') {
  console.log('Dry run only. Re-run with --yes to write these documents to the live database.');
  process.exit(0);
}

for (let i = 0; i < writes.length; i += 400) {
  const batch = db.batch();
  writes.slice(i, i + 400).forEach(({ ref, data }) => batch.set(ref, data));
  await batch.commit();
}
console.log(`✔ Restored ${writes.length} documents.`);
