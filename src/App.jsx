import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Login from './pages/Login';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AdminLogin from './pages/AdminLogin';

// Admin imports
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import Overview from './pages/admin/Overview';
import Products from './pages/admin/Products';
import Categories from './pages/admin/Categories';
import Orders from './pages/admin/Orders';
import Transactions from './pages/admin/Transactions';
import Settings from './pages/admin/Settings';
import Messages from './pages/admin/Messages';
import Team from './pages/admin/Team';

export default function App() {
  return (
    <Routes>
      {/* Standalone Authentication pages (No Navbar & No Footer) */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Login />} />
      <Route path="/register" element={<Login />} />

      {/* Admin Dashboard Pages (Protected Route with AdminLayout) */}
      <Route path="/admin" element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Overview />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="orders" element={<Orders />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="settings" element={<Settings />} />
          <Route path="messages" element={<Messages />} />
          <Route path="team" element={<Team />} />
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
        <Route path="faq" element={<FAQ />} />
        <Route path="privacy" element={<PrivacyPolicy />} />
        <Route path="admin-login" element={<AdminLogin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
