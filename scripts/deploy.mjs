#!/usr/bin/env node
/**
 * Upload the production build (dist/) to Hostinger over FTP.
 *
 *   cp .env.deploy.example .env.deploy   # fill in FTP details from hPanel → Files → FTP Accounts
 *   npm run deploy                        # builds, then uploads
 *
 * Upload order avoids a broken site mid-deploy: new hashed assets go up first, index.html and
 * .htaccess last. Stale files are removed only from the remote assets/ folder (which this
 * build owns) — nothing else in public_html is deleted.
 */
import { existsSync, readdirSync, statSync } from 'node:fs';
import { basename, join, posix, relative, sep } from 'node:path';
import { Client } from 'basic-ftp';

if (!existsSync('.env.deploy')) {
  console.error('Missing .env.deploy — copy .env.deploy.example and fill in your Hostinger FTP details.');
  process.exit(1);
}
process.loadEnvFile('.env.deploy');

const { FTP_HOST, FTP_USER, FTP_PASSWORD, FTP_PORT = '21', FTP_REMOTE_DIR = '/public_html', FTP_SECURE = 'true' } = process.env;
if (!FTP_HOST || !FTP_USER || !FTP_PASSWORD) {
  console.error('FTP_HOST, FTP_USER and FTP_PASSWORD must be set in .env.deploy.');
  process.exit(1);
}

const DIST = 'dist';
if (!existsSync(join(DIST, 'index.html'))) {
  console.error('dist/index.html not found. Run `npm run build` first.');
  process.exit(1);
}

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? listFiles(full) : [full];
  });
}

const toRemote = (localPath) => posix.join(FTP_REMOTE_DIR, relative(DIST, localPath).split(sep).join('/'));

const files = listFiles(DIST);
const isEntry = (f) => ['index.html', '.htaccess'].includes(relative(DIST, f));
const ordered = [...files.filter((f) => !isEntry(f)), ...files.filter(isEntry)];

const client = new Client(30_000);
try {
  await client.access({ host: FTP_HOST, user: FTP_USER, password: FTP_PASSWORD, port: Number(FTP_PORT), secure: FTP_SECURE !== 'false' });
  console.log(`Connected to ${FTP_HOST}. Uploading ${ordered.length} files to ${FTP_REMOTE_DIR}…`);

  for (const file of ordered) {
    const remote = toRemote(file);
    await client.ensureDir(posix.dirname(remote));
    await client.uploadFrom(file, posix.basename(remote));
    console.log(`  ↑ ${remote}`);
  }

  // Prune old hashed build files from assets/
  const remoteAssets = posix.join(FTP_REMOTE_DIR, 'assets');
  const keep = new Set(files.filter((f) => relative(DIST, f).startsWith(`assets${sep}`)).map((f) => basename(f)));
  await client.cd(remoteAssets);
  for (const entry of await client.list()) {
    if (entry.isFile && !keep.has(entry.name)) {
      await client.remove(entry.name);
      console.log(`  ✕ ${posix.join(remoteAssets, entry.name)}`);
    }
  }

  console.log('✔ Deploy complete.');
} catch (err) {
  console.error(`Deploy failed: ${err.message}`);
  process.exitCode = 1;
} finally {
  client.close();
}
