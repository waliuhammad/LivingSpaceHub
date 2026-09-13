import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../ProductCard';
import { getAllProducts } from '../../lib/products';
import useReveal from '../../hooks/useReveal';

export default function TrendingProducts() {
  const sectionRef = useReveal();
  const all = getAllProducts();
  // Get products matching livingspaceshub.com featured ids or top items
  const trending = [
    all.find((p) => p.id === 3) || all[0],
    all.find((p) => p.id === 4) || all[1],
    all.find((p) => p.id === 5) || all[2],
    all.find((p) => p.id === 18) || all[3],
  ].filter(Boolean);

  return (
    <section ref={sectionRef} className="py-20 bg-[#F5F2ED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 reveal">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-semibold text-stone-500">
              New Arrivals
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-1">
              Trending Products
            </h2>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 font-bold text-sm text-stone-900 hover:text-[#5A5A40] transition-colors"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 4 Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {trending.map((product, index) => (
            <div key={product.id} className="reveal" style={{ transitionDelay: `${index * 0.1}s` }}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
