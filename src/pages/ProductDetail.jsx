import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getDescription, getRelatedProducts, formatPrice, isInStock } from '../lib/products';
import { useStore } from '../context/StoreContext';
import { optimizeImage } from '../lib/cloudinary';
import PageLoader from '../components/PageLoader';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');
  const [imgError, setImgError] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  const { getProduct, products, settings, loading } = useStore();
  const product = getProduct(id);

  useEffect(() => {
    window.scrollTo(0, 0);
    setQuantity(1);
    setImgError(false);
  }, [id]);

  if (loading) return <PageLoader />;

  if (!product) {
    return (
      <div className="min-h-[70vh] bg-[#FDFBF7] flex flex-col items-center justify-center text-center px-4">
        <div className="w-16 h-16 bg-[#F5EBE6] text-[#C86D51] rounded-2xl flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-stone-800 mb-2">Product Not Found</h2>
        <p className="text-stone-500 text-sm mb-6 max-w-md">
          The product you are looking for does not exist or has been removed from our catalog.
        </p>
        <Link
          to="/shop"
          className="px-6 py-3 bg-[#4A5D4E] text-white rounded-xl text-sm font-semibold shadow-md hover:bg-[#3B4A3E] transition-all"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  const stock = Number(product.stock) || 0;
  const inStock = isInStock(product);
  const description = getDescription(product);
  const freeShippingNote =
    !settings.shippingFee
      ? 'On all orders'
      : settings.freeShippingThreshold > 0
        ? `On orders over ${formatPrice(settings.freeShippingThreshold)}`
        : `Flat ${formatPrice(settings.shippingFee)} shipping`;

  const handleAddToCart = () => {
    if (!inStock) return;
    addItem(product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const relatedProducts = getRelatedProducts(products, product, 4);
  const fallbackImg = `https://placehold.co/800x800/EADEC9/2C362B?text=${encodeURIComponent(product.name)}`;

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-10 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#4A5D4E] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-fade-in border border-emerald-400/30">
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span className="text-sm font-medium">Added {quantity} × "{product.name}" to cart!</span>
          <Link to="/cart" className="ml-2 text-xs font-semibold uppercase tracking-wider underline text-stone-100 hover:text-white">
            View Cart
          </Link>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-stone-500 mb-8 overflow-x-auto scrollbar-none">
          <Link to="/" className="hover:text-stone-900 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <Link to="/shop" className="hover:text-stone-900 transition-colors">Shop</Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <Link
            to={`/shop?category=${product.category}`}
            className="capitalize hover:text-stone-900 transition-colors"
          >
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="text-stone-800 font-semibold truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 mb-20">
          {/* Left Column: Image Showcase */}
          <div className="lg:col-span-7">
            <div className="relative aspect-square rounded-3xl overflow-hidden bg-stone-100 border border-stone-200/80 shadow-md group">
              <img
                src={imgError || !product.image ? fallbackImg : optimizeImage(product.image, 1200)}
                alt={product.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-stone-800 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm border border-white/50">
                {product.category}
              </span>
            </div>
          </div>

          {/* Right Column: Product Details & Actions */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-800 leading-tight mb-3">
                {product.name}
              </h1>

              {/* Price & Rating */}
              <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-stone-200/80">
                <span className="text-3xl font-bold text-[#5A5A40]">
                  {formatPrice(product.price)}
                </span>
                <div className="flex items-center gap-1.5 bg-stone-100 px-3 py-1.5 rounded-full">
                  <div className="flex text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-stone-700 ml-1">4.9</span>
                  <span className="text-xs text-stone-400">(42 reviews)</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-stone-600 leading-relaxed text-sm sm:text-base mb-8">
                {description}
              </p>

              {/* Value Badges */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="bg-white p-3 rounded-2xl border border-stone-200/80 text-center">
                  <Truck className="w-5 h-5 text-[#5A5A40] mx-auto mb-1.5" />
                  <span className="block text-xs font-semibold text-stone-800">{settings.shippingFee && !settings.freeShippingThreshold ? 'Delivery' : 'Free Delivery'}</span>
                  <span className="block text-[10px] text-stone-400">{freeShippingNote}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-stone-200/80 text-center">
                  <ShieldCheck className="w-5 h-5 text-[#5A5A40] mx-auto mb-1.5" />
                  <span className="block text-xs font-semibold text-stone-800">2-Year Warranty</span>
                  <span className="block text-[10px] text-stone-400">Full coverage</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-stone-200/80 text-center">
                  <RotateCcw className="w-5 h-5 text-[#5A5A40] mx-auto mb-1.5" />
                  <span className="block text-xs font-semibold text-stone-800">30-Day Return</span>
                  <span className="block text-[10px] text-stone-400">Hassle free</span>
                </div>
              </div>

              {/* Quantity Selector & Add to Cart */}
              <div className="space-y-4 mb-8">
                <label className="block text-xs uppercase tracking-wider font-semibold text-stone-500">
                  Select Quantity:
                  <span className={`ml-2 normal-case tracking-normal ${inStock ? 'text-emerald-700' : 'text-red-600'}`}>
                    {inStock ? (stock <= 5 ? `Only ${stock} left` : 'In stock') : 'Out of stock'}
                  </span>
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-stone-300 bg-white rounded-xl shadow-sm overflow-hidden">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="p-3 text-stone-600 hover:bg-stone-100 disabled:opacity-40 transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-stone-800 text-sm">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                      disabled={quantity >= stock}
                      className="p-3 text-stone-600 hover:bg-stone-100 transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    className="disabled:opacity-50 disabled:pointer-events-none flex-1 py-3.5 px-6 bg-[#5A5A40] hover:bg-[#484833] text-white font-semibold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {inStock ? `Add to Cart • ${formatPrice(product.price * quantity)}` : 'Out of Stock'}
                  </button>
                </div>
              </div>

              {/* Details Tabs */}
              <div className="border-t border-stone-200/80 pt-6">
                <div className="flex gap-6 border-b border-stone-200 mb-4">
                  {['details', 'shipping', 'care'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-2 text-xs font-semibold uppercase tracking-wider transition-all border-b-2 ${
                        activeTab === tab
                          ? 'border-[#4A5D4E] text-[#4A5D4E]'
                          : 'border-transparent text-stone-400 hover:text-stone-600'
                      }`}
                    >
                      {tab === 'details' && 'Product Details'}
                      {tab === 'shipping' && 'Shipping & Returns'}
                      {tab === 'care' && 'Care & Maintenance'}
                    </button>
                  ))}
                </div>

                <div className="text-xs sm:text-sm text-stone-600 leading-relaxed min-h-[80px]">
                  {activeTab === 'details' && (
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4A5D4E]" />
                        Crafted from sustainably sourced solid hardwood & natural fibers.
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4A5D4E]" />
                        Hand-finished by master artisans for organic texture.
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#4A5D4E]" />
                        Designed in California, ethically produced.
                      </li>
                    </ul>
                  )}
                  {activeTab === 'shipping' && (
                    <p>
                      Standard shipping takes 3–5 business days. White-glove delivery available at checkout for larger furniture pieces. Enjoy 30-day hassle-free returns on all items.
                    </p>
                  )}
                  {activeTab === 'care' && (
                    <p>
                      Dust regularly with a dry microfibre cloth. For wood surfaces, use damp cloth with mild soap; avoid harsh chemical cleaners. Keep away from direct sunlight.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-stone-200/80 pt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#C86D51] font-semibold">
                  Complete Your Look
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-800">
                  You May Also Like
                </h2>
              </div>
              <Link
                to={`/shop?category=${product.category}`}
                className="text-xs uppercase tracking-wider font-semibold text-[#4A5D4E] hover:underline"
              >
                View More {product.category} →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
