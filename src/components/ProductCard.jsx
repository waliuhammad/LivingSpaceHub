import React, { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Eye, Heart, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../lib/products';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleAdd = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }, [addItem, product]);

  const handleToggleLike = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked((prev) => !prev);
  }, []);

  const fallbackImg = `https://placehold.co/500x500/F5F2ED/5A5A40?text=${encodeURIComponent(product.name.slice(0, 15))}`;

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col border border-stone-200/80">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-[#F5F2ED]">
        <img
          src={imgError ? fallbackImg : product.image}
          alt={product.name}
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Hover Action Overlay Icons */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={handleAdd}
            className="w-11 h-11 rounded-full bg-white text-stone-800 hover:bg-[#5A5A40] hover:text-white flex items-center justify-center shadow-lg transition-all duration-200 transform hover:scale-110"
            title="Add to Cart"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              navigate(`/product/${product.id}`);
            }}
            className="w-11 h-11 rounded-full bg-white text-stone-800 hover:bg-[#5A5A40] hover:text-white flex items-center justify-center shadow-lg transition-all duration-200 transform hover:scale-110"
            title="View Details"
          >
            <Eye className="w-5 h-5" />
          </button>

          <button
            onClick={handleToggleLike}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 transform hover:scale-110 ${
              isLiked
                ? 'bg-rose-500 text-white'
                : 'bg-white text-stone-800 hover:bg-rose-500 hover:text-white'
            }`}
            title="Add to Wishlist"
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Toast Alert */}
        {showToast && (
          <div className="absolute top-3 right-3 bg-[#5A5A40] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-fade-in z-10">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Added</span>
          </div>
        )}
      </div>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <Link to={`/product/${product.id}`} className="block group-hover:text-[#5A5A40] transition-colors">
          <h3 className="font-serif text-sm font-bold text-stone-800 line-clamp-1 leading-snug mb-1">
            {product.name}
          </h3>
        </Link>
        <p className="font-sans font-bold text-[#5A5A40] text-sm">
          {formatPrice(product.price)}
        </p>
      </div>
    </div>
  );
}
