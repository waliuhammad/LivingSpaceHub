import React, { useRef, useState } from 'react';
import { Image as ImageIcon, Loader2, Upload } from 'lucide-react';
import { isCloudinaryConfigured, optimizeImage, uploadImage } from '../../lib/cloudinary';

/** Uploads an image to Cloudinary and reports { url, publicId } back to the form. */
export default function ImageUploader({ value, onChange, folder, label = 'Image', aspect = 'aspect-square' }) {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState('');

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setProgress(0);
    try {
      const result = await uploadImage(file, { folder, onProgress: setProgress });
      onChange(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setProgress(null);
    }
  };

  return (
    <div>
      <span className="block text-sm font-bold text-gray-700 mb-1.5">{label}</span>
      <div className={`relative ${aspect} w-full max-w-xs rounded-xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50`}>
        {value ? (
          <img src={optimizeImage(value, 600)} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <ImageIcon size={32} />
            <span className="text-xs mt-2">No image</span>
          </div>
        )}
        {progress !== null && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-sm">
            <Loader2 className="animate-spin mb-2" size={24} />
            {progress}%
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={handleFile} />
      <button
        type="button"
        disabled={progress !== null || !isCloudinaryConfigured}
        onClick={() => inputRef.current?.click()}
        className="mt-3 inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
      >
        <Upload size={16} />
        {value ? 'Replace image' : 'Upload image'}
      </button>
      <p className="text-xs text-gray-500 mt-1.5">JPG, PNG, WebP or AVIF, up to 5 MB.</p>
      {!isCloudinaryConfigured && <p className="text-xs text-amber-700 mt-1">Cloudinary is not configured for this build.</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
