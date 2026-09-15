const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const isCloudinaryConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

/**
 * Upload an image to Cloudinary using the unsigned upload preset.
 * `source` is a File from an <input type="file">, or a remote image URL (used when importing the starter catalog).
 * Resolves to { url, publicId }.
 */
export function uploadImage(source, { folder = 'products', onProgress } = {}) {
  if (!isCloudinaryConfigured) {
    return Promise.reject(new Error('Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.'));
  }
  if (source instanceof File) {
    if (!ALLOWED_TYPES.includes(source.type)) {
      return Promise.reject(new Error('Please choose a JPG, PNG, WebP or AVIF image.'));
    }
    if (source.size > MAX_BYTES) {
      return Promise.reject(new Error('Image must be 5 MB or smaller.'));
    }
  }

  const body = new FormData();
  body.append('file', source);
  body.append('upload_preset', UPLOAD_PRESET);
  body.append('folder', `living-space-hub/${folder}`);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`);
    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }
    xhr.onload = () => {
      let data = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        // fall through to the error below
      }
      if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
        resolve({ url: data.secure_url, publicId: data.public_id });
      } else {
        reject(new Error(data.error?.message || `Image upload failed (${xhr.status}).`));
      }
    };
    xhr.onerror = () => reject(new Error('Network error while uploading image.'));
    xhr.send(body);
  });
}

/**
 * Add Cloudinary delivery transformations (auto format/quality, resize) to a Cloudinary URL.
 * Non-Cloudinary URLs are returned unchanged.
 */
export function optimizeImage(url, width) {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  const transforms = ['f_auto', 'q_auto', width ? `w_${width}` : null, width ? 'c_limit' : null].filter(Boolean).join(',');
  return url.replace('/upload/', `/upload/${transforms}/`);
}
