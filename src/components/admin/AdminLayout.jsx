import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import CustomCursor from '../CustomCursor';
import { AnimatePresence } from 'framer-motion';

export default function AdminLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-full bg-[#f9f8f5] overflow-hidden font-sans">
      <CustomCursor />
      <AdminSidebar />
      <AnimatePresence mode="wait">
        <main key={location.pathname} className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </AnimatePresence>
    </div>
  );
}
