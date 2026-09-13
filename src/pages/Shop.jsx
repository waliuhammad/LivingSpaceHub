import React, { useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, X, SlidersHorizontal, ChevronLeft, ChevronRight, PackageX } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SectionHeading from '../components/SectionHeading';
import { getAllProducts, sortProducts } from '../lib/products';
import PageTransition, { itemVariants } from '../components/PageTransition';
import { motion } from 'framer-motion';

const ITEMS_PER_PAGE = 24;

const CATEGORIES = [
  { id: 'all', label: 'All Products' },
  { id: 'living', label: 'Living Room' },
  { id: 'bedroom', label: 'Bedroom' },
  { id: 'decor', label: 'Decor & Accents' },
  { id: 'office', label: 'Workspace' },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'default';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, currentCategory, searchQuery, currentSort]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value && value !== 'all' && value !== 'default' && value !== '1') {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Always reset to page 1 on filter change
    if (key !== 'page') {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  // Filter & Sort products
  const filteredProducts = useMemo(() => {
    let list = getAllProducts();

    if (currentCategory && currentCategory !== 'all') {
      list = list.filter((p) => p.category === currentCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return sortProducts(list, currentSort);
  }, [currentCategory, searchQuery, currentSort]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, safePage]);

  const startIndex = (safePage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(safePage * ITEMS_PER_PAGE, filteredProducts.length);

  return (
    <PageTransition className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-10 text-center md:text-left">
          <SectionHeading
            eyebrow="Our Collection"
            title="Curated Home Living"
            description="Explore our thoughtfully designed collection of handcrafted furniture, textiles, and decorative accents for every corner of your sanctuary."
          />
        </motion.div>

        {/* Filter Controls Bar */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200/80 mb-10 space-y-6">
          {/* Top Row: Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => updateParam('search', e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => updateParam('search', '')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <label htmlFor="sort" className="text-xs uppercase tracking-wider font-semibold text-stone-500 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Sort:
              </label>
              <select
                id="sort"
                value={currentSort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#4A5D4E]/30 focus:border-[#4A5D4E] transition-all cursor-pointer"
              >
                <option value="default">Featured</option>
                <option value="low_high">Price: Low to High</option>
                <option value="high_low">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-t border-stone-100 pt-4">
            {CATEGORIES.map((cat) => {
              const isActive = currentCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => updateParam('category', cat.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-[#4A5D4E] text-white shadow-md shadow-[#4A5D4E]/20'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70 hover:text-stone-900'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Results Metadata Bar */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 px-1">
          <p className="text-sm text-stone-500 font-medium">
            {filteredProducts.length > 0 ? (
              <>
                Showing <span className="font-semibold text-stone-800">{startIndex}–{endIndex}</span> of{' '}
                <span className="font-semibold text-stone-800">{filteredProducts.length}</span> products
              </>
            ) : (
              'No matching products'
            )}
          </p>

          {(currentCategory !== 'all' || searchQuery || currentSort !== 'default') && (
            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold uppercase tracking-wider text-[#C86D51] hover:text-[#B35C42] underline underline-offset-4"
            >
              Clear all filters
            </button>
          )}
        </motion.div>

        {/* Product Grid */}
        {paginatedProducts.length > 0 ? (
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        ) : (
          /* Empty State */
          <motion.div variants={itemVariants} className="bg-white rounded-3xl p-12 text-center shadow-sm border border-stone-200/80 my-12 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-[#F5EBE6] text-[#C86D51] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <PackageX className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-800 mb-2">No Products Found</h3>
            <p className="text-stone-500 text-sm mb-6 leading-relaxed">
              We couldn't find any items matching your current filters or search term. Try adjusting your search query or reset your selection.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-3 bg-[#4A5D4E] text-white rounded-xl text-sm font-semibold shadow-md hover:bg-[#3B4A3E] transition-all"
            >
              Reset All Filters
            </button>
          </motion.div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <motion.div variants={itemVariants} className="flex justify-center items-center gap-2 mt-12">
            <button
              onClick={() => updateParam('page', (safePage - 1).toString())}
              disabled={safePage === 1}
              className="p-2.5 rounded-xl border border-stone-200 bg-white text-stone-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 transition-all"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isActive = pageNum === safePage;
              return (
                <button
                  key={pageNum}
                  onClick={() => updateParam('page', pageNum.toString())}
                  className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-[#4A5D4E] text-white shadow-md shadow-[#4A5D4E]/20'
                      : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => updateParam('page', (safePage + 1).toString())}
              disabled={safePage === totalPages}
              className="p-2.5 rounded-xl border border-stone-200 bg-white text-stone-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 transition-all"
              aria-label="Next Page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
