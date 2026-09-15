import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PageLoader from './components/PageLoader';
import CustomCursor from './components/CustomCursor';

// Admin imports
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import RequireRole from './components/admin/RequireRole';
import { can } from './lib/roles';

// Pages are code-split so each route only downloads what it needs
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Cart = lazy(() => import('./pages/Cart'));
const Login = lazy(() => import('./pages/Login'));
const FAQ = lazy(() => import('./pages/FAQ'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderConfirmation = lazy(() => import('./pages/OrderConfirmation'));
const Account = lazy(() => import('./pages/Account'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const TrackOrder = lazy(() => import('./pages/TrackOrder'));

const Overview = lazy(() => import('./pages/admin/Overview'));
const Products = lazy(() => import('./pages/admin/Products'));
const Categories = lazy(() => import('./pages/admin/Categories'));
const Orders = lazy(() => import('./pages/admin/Orders'));
const Transactions = lazy(() => import('./pages/admin/Transactions'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const Messages = lazy(() => import('./pages/admin/Messages'));
const Team = lazy(() => import('./pages/admin/Team'));
const Customers = lazy(() => import('./pages/admin/Customers'));
const Coupons = lazy(() => import('./pages/admin/Coupons'));
const Reviews = lazy(() => import('./pages/admin/Reviews'));
const Content = lazy(() => import('./pages/admin/Content'));

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <CustomCursor />
      <Routes>
        {/* Standalone Authentication pages (No Navbar & No Footer) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Login />} />
        <Route path="/register" element={<Login />} />

        {/* Admin Dashboard Pages (Protected Route with AdminLayout) */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Overview />} />
            <Route path="products" element={<RequireRole allow={can.manageCatalog}><Products /></RequireRole>} />
            <Route path="categories" element={<RequireRole allow={can.manageCatalog}><Categories /></RequireRole>} />
            <Route path="orders" element={<Orders />} />
            <Route path="transactions" element={<RequireRole allow={can.viewTransactions}><Transactions /></RequireRole>} />
            <Route path="settings" element={<RequireRole allow={can.manageSettings}><Settings /></RequireRole>} />
            <Route path="messages" element={<Messages />} />
            <Route path="team" element={<RequireRole allow={can.manageTeam}><Team /></RequireRole>} />
            <Route path="customers" element={<RequireRole allow={can.viewCustomers}><Customers /></RequireRole>} />
            <Route path="coupons" element={<RequireRole allow={can.manageCoupons}><Coupons /></RequireRole>} />
            <Route path="reviews" element={<RequireRole allow={can.moderateReviews}><Reviews /></RequireRole>} />
            <Route path="content" element={<RequireRole allow={can.manageContent}><Content /></RequireRole>} />
          </Route>
        </Route>

        {/* Main Pages with Navbar & Footer Layout */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-confirmation" element={<OrderConfirmation />} />
          <Route path="account" element={<Account />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="track-order" element={<TrackOrder />} />
          <Route path="faq" element={<FAQ />} />
          <Route path="privacy" element={<PrivacyPolicy />} />
          <Route path="admin-login" element={<AdminLogin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
