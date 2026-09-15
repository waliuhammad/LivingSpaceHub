import React, { useRef, useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import { isCloudinaryConfigured, optimizeImage, uploadImage } from '../../lib/cloudinary';

/** Extra product photos: [{ url, publicId }]. Uploads go to Cloudinary; order is the display order. */
export default function GalleryUploader({ images, onChange, onUploaded, max = 7, folder = 'products' }) {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  const handleFiles = async (e) => {
    const files = [...(e.target.files || [])].slice(0, max - images.length);
    e.target.value = '';
    if (!files.length) return;
    setError('');
    let next = [...images];
    for (const [index, file] of files.entries()) {
      setProgress(`${index + 1}/${files.length}`);
      try {
        const result = await uploadImage(file, { folder });
        next = [...next, result];
        onChange(next);
        onUploaded?.(result.publicId);
      } catch (err) {
        setError(err.message);
      }
    }
    setProgress(null);
  };

  return (
    <div>
      <span className="block text-sm font-bold text-gray-700 mb-1.5">More Photos ({images.length}/{max})</span>
      <div className="grid grid-cols-4 gap-2">
        {images.map((img, index) => (
          <div key={img.url} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
            <img src={optimizeImage(img.url, 200)} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, i) => i !== index))}
              className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-80 hover:opacity-100"
              aria-label={`Remove photo ${index + 1}`}
            >
              <X size={12} />
            </button>
          </div>
        ))}
        {images.length < max && (
          <button
            type="button"
            disabled={progress !== null || !isCloudinaryConfigured}
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 flex flex-col items-center justify-center text-xs disabled:opacity-50"
          >
            {progress ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            {progress || 'Add'}
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={handleFiles} />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
