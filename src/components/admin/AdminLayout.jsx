import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { AnimatePresence } from 'framer-motion';
import PageLoader from '../PageLoader';

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-full bg-[#f9f8f5] overflow-hidden font-sans">
      <AdminSidebar />
      <AnimatePresence mode="wait">
        <main key={location.pathname} className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-6xl mx-auto">
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </AnimatePresence>
    </div>
  );
}
