import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import ScrollToTop from './ScrollToTop';
import { AnimatePresence } from 'framer-motion';
import PageLoader from './PageLoader';

export default function Layout() {
  const location = useLocation();
  
  return (
    <div className="flex flex-col min-h-screen">
      <ScrollToTop />
      <Header />
      <AnimatePresence mode="wait">
        <main key={location.pathname} className="flex-1">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </main>
      </AnimatePresence>
      <Footer />
    </div>
  );
}
