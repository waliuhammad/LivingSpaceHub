import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { isFirebaseConfigured } from './lib/firebase';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

if (!isFirebaseConfigured) {
  root.render(
    <div style={{ fontFamily: 'sans-serif', padding: '3rem', maxWidth: 640, margin: '0 auto' }}>
      <h1>Site configuration missing</h1>
      <p>
        Firebase environment variables were not set when this site was built. Copy <code>.env.example</code> to{' '}
        <code>.env</code>, fill in your Firebase and Cloudinary values, and run <code>npm run build</code> again.
      </p>
    </div>
  );
} else {
  // Imported lazily so a misconfigured build shows the message above instead of crashing.
  const [{ AuthProvider }, { StoreProvider }, { CartProvider }, { WishlistProvider }, { default: App }] = await Promise.all([
    import('./context/AuthContext'),
    import('./context/StoreContext'),
    import('./context/CartContext'),
    import('./context/WishlistContext'),
    import('./App.jsx'),
  ]);

  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <StoreProvider>
            <WishlistProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </WishlistProvider>
          </StoreProvider>
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
}
