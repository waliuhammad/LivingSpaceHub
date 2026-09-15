import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import PageLoader from '../components/PageLoader';
import useSeo from '../hooks/useSeo';

export default function Wishlist() {
  const { ids } = useWishlist();
  const { getProduct, loading } = useStore();
  const { user } = useAuth();
  useSeo({ title: 'Wishlist', noindex: true });

  if (loading) return <PageLoader />;

  const products = ids.map(getProduct).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-stone-500">Saved for later</p>
        <h1 className="font-serif text-4xl font-bold text-stone-900 mb-2">Your Wishlist</h1>
        {!user && products.length > 0 && (
          <p className="text-sm text-stone-500 mb-8">
            <Link to="/login" state={{ from: '/wishlist' }} className="underline font-semibold text-[#5A5A40]">Sign in</Link> to keep your wishlist on every device.
          </p>
        )}

        {products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-stone-200/80 my-12 max-w-lg mx-auto">
            <Heart className="w-10 h-10 text-rose-300 mx-auto mb-4" />
            <h2 className="font-serif text-xl font-bold text-stone-800 mb-2">Nothing saved yet</h2>
            <p className="text-stone-500 text-sm mb-6">Tap the heart on any product to save it here.</p>
            <Link to="/shop" className="px-6 py-3 bg-[#5A5A40] text-white rounded-full text-sm font-semibold">Browse the shop</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
