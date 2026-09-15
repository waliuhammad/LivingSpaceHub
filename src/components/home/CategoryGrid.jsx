import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { optimizeImage } from '../../lib/cloudinary';

const fallbackCategories = [
  {
    id: 'living',
    title: 'Living Room',
    subtitle: 'Artful Comfort',
    image: 'https://images.pexels.com/photos/5008417/pexels-photo-5008417.jpeg',
  },
  {
    id: 'bedroom',
    title: 'Bedroom',
    subtitle: 'Serene Sanctuaries',
    image: 'https://images.pexels.com/photos/35128596/pexels-photo-35128596.jpeg',
  },
  {
    id: 'decor',
    title: 'Decor',
    subtitle: 'Functional Craft',
    image: 'https://images.pexels.com/photos/29250292/pexels-photo-29250292.jpeg',
  },
  {
    id: 'office',
    title: 'Office',
    subtitle: 'Inspiring Workspaces',
    image: 'https://images.pexels.com/photos/28715052/pexels-photo-28715052.jpeg',
  },
];

export default function CategoryGrid() {
  const { categories: storeCategories } = useStore();
  const categories = storeCategories.length
    ? storeCategories
        .filter((c) => c.image)
        .slice(0, 4)
        .map((c) => ({ id: c.id, title: c.label, subtitle: c.subtitle, image: optimizeImage(c.image, 800) }))
    : fallbackCategories;
  const [hasIntersected, setHasIntersected] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const sectionRef = React.useRef(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
          // Show spinner for a fraction of a second, then load cards
          setTimeout(() => {
            setIsLoading(false);
          }, 600);
        }
      },
      { threshold: 0.15 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, [hasIntersected]);

  return (
    <section id="featured-categories" ref={sectionRef} className="py-20 bg-white border-b border-stone-200/50 min-h-[500px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div 
          className="text-center mb-14 transition-all duration-700 ease-out"
          style={{
            opacity: hasIntersected ? 1 : 0,
            transform: hasIntersected ? 'translateY(0)' : 'translateY(40px)',
          }}
        >
          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900">
            Shop by Category
          </h2>
          <div className="mx-auto bg-[#5A5A40] mt-4 w-16 h-1 rounded-full" />
        </div>

        {/* Loading Spinner */}
        {hasIntersected && isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-stone-200 border-t-[#5A5A40] rounded-full animate-spin" />
          </div>
        )}

        {/* 4-Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {!isLoading &&
            categories.map((cat, index) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.id}`}
                className="group relative h-80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-1.5"
                style={{
                  opacity: 0,
                  animation: `fadeUp 0.8s cubic-bezier(0.5, 0, 0, 1) forwards`,
                  animationDelay: `${index * 0.15}s`,
                }}
              >
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                {/* Category Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 text-white">
                  <h3 className="font-serif text-2xl font-bold group-hover:text-[#D4A373] transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-xs uppercase tracking-wider text-stone-300 font-medium mt-1">
                    {cat.subtitle}
                  </p>
                </div>
              </Link>
            ))}
        </div>
      </div>
      
      <style>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
