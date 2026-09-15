import { getDoc, doc } from 'firebase/firestore';
import starterProducts from '../data/products.json';
import { db } from './firebase';
import { DEFAULT_SETTINGS, saveCategory, saveSettings, setProductWithId } from './db';
import { isCloudinaryConfigured, uploadImage } from './cloudinary';

const STARTER_CATEGORIES = [
  { slug: 'living', label: 'Living Room', subtitle: 'Artful Comfort', image: 'https://images.pexels.com/photos/5008417/pexels-photo-5008417.jpeg' },
  { slug: 'bedroom', label: 'Bedroom', subtitle: 'Serene Sanctuaries', image: 'https://images.pexels.com/photos/35128596/pexels-photo-35128596.jpeg' },
  { slug: 'decor', label: 'Decor & Accents', subtitle: 'Functional Craft', image: 'https://images.pexels.com/photos/29250292/pexels-photo-29250292.jpeg' },
  { slug: 'office', label: 'Workspace', subtitle: 'Inspiring Workspaces', image: 'https://images.pexels.com/photos/28715052/pexels-photo-28715052.jpeg' },
];

/** Copy a remote image into Cloudinary; keep the original URL if Cloudinary can't fetch it. */
async function toCloudinary(url, folder) {
  if (!isCloudinaryConfigured) return { url, publicId: '' };
  try {
    return await uploadImage(url, { folder });
  } catch (err) {
    console.warn(`Kept original image URL (Cloudinary import failed: ${err.message})`, url);
    return { url, publicId: '' };
  }
}

/**
 * One-time import of the original static catalog into Firestore, with images moved to Cloudinary.
 * Safe to re-run: documents are written with fixed ids, so it overwrites rather than duplicates.
 */
export async function importStarterCatalog(onProgress = () => {}) {
  const total = STARTER_CATEGORIES.length + starterProducts.length + 1;
  let done = 0;
  const tick = (label) => onProgress({ done: ++done, total, label });

  const settingsSnap = await getDoc(doc(db, 'settings', 'store'));
  if (!settingsSnap.exists()) {
    await saveSettings(DEFAULT_SETTINGS);
  }
  tick('Store settings');

  for (const [index, cat] of STARTER_CATEGORIES.entries()) {
    const image = await toCloudinary(cat.image, 'categories');
    await saveCategory(cat.slug, { ...cat, image: image.url, imagePublicId: image.publicId, sortOrder: index });
    tick(cat.label);
  }

  // Run product imports a few at a time to keep it quick without hammering Cloudinary
  const queue = starterProducts.map((p, index) => ({ p, index }));
  const worker = async () => {
    while (queue.length) {
      const { p, index } = queue.shift();
      const image = await toCloudinary(p.image, 'products');
      await setProductWithId(p.id, {
        name: p.name,
        price: p.price,
        category: p.category,
        description: '',
        image: image.url,
        imagePublicId: image.publicId,
        stock: 25,
        featured: index < 4,
        active: true,
      });
      tick(p.name);
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));
}
