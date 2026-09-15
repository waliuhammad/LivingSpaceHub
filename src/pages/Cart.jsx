import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useStore } from '../context/StoreContext';
import { calcShipping } from '../lib/db';

function formatRs(amount) {
  return `Rs.${Math.round(amount).toLocaleString('en-PK')}`;
}

export default function Cart() {
  const { cart, removeItem, updateQuantity, subtotal } = useCart();
  const { settings } = useStore();
  const [localQtys, setLocalQtys] = useState({});
  const navigate = useNavigate();

  /* ── helpers ── */
  const getQty = (item) =>
    localQtys[item.id] !== undefined ? localQtys[item.id] : item.quantity;

  const handleQtyChange = (id, val) => {
    const n = parseInt(val, 10);
    setLocalQtys((prev) => ({ ...prev, [id]: isNaN(n) || n < 1 ? 1 : n }));
  };

  const handleUpdate = () => {
    Object.entries(localQtys).forEach(([id, qty]) => {
      updateQuantity(id, qty);
    });
    setLocalQtys({});
  };

  const shipping = calcShipping(subtotal, settings);
  const total = subtotal + shipping;

  const handleCheckout = () => {
    handleUpdate();
    navigate('/checkout');
  };

  /* ── empty state ── */
  const isEmpty = cart.length === 0;

  return (
    <div
      style={{ backgroundColor: '#F2EDE8', minHeight: '100vh', fontFamily: "'Cormorant Garamond', 'Georgia', serif" }}
    >
      {/* page title */}
      <div style={{ textAlign: 'center', paddingTop: '3rem', paddingBottom: '1.5rem' }}>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', 'Georgia', serif",
            fontSize: '2.8rem',
            fontWeight: '700',
            color: '#1a1a1a',
            margin: 0,
            letterSpacing: '-0.01em',
          }}
        >
          Your Bag
        </h1>
        <p style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: '#888', fontFamily: 'sans-serif' }}>
          Review{' '}
          <span style={{ color: '#5A7A5A', textDecoration: 'underline', cursor: 'default' }}>your</span>{' '}
          selected pieces.
        </p>
      </div>

      {/* layout */}
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 1.5rem 4rem',
          display: 'grid',
          gridTemplateColumns: isEmpty ? '1fr 320px' : '1fr 320px',
          gap: '1.5rem',
          alignItems: 'start',
        }}
      >
        {/* ── LEFT: cart table ── */}
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          {isEmpty ? (
            /* empty state */
            <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              {/* bag silhouette */}
              <div style={{ marginBottom: '1.2rem' }}>
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#ccc"
                  strokeWidth="1.2"
                  style={{ margin: '0 auto', display: 'block' }}
                >
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '0.4rem',
                }}
              >
                Your bag is empty
              </p>
              <p style={{ fontSize: '0.82rem', color: '#999', fontFamily: 'sans-serif', marginBottom: '1.6rem' }}>
                Looks like you haven't added anything yet.
              </p>
              <Link
                to="/shop"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#4A5D3A',
                  color: '#fff',
                  padding: '0.65rem 2rem',
                  borderRadius: '999px',
                  fontFamily: 'sans-serif',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                }}
              >
                GO SHOP
              </Link>
            </div>
          ) : (
            <>
              {/* table header */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 160px 120px 40px',
                  padding: '0.75rem 1.5rem',
                  borderBottom: '1px solid #eee',
                  backgroundColor: '#fafafa',
                }}
              >
                {['PRODUCT', 'QUANTITY', 'PRICE', ''].map((h) => (
                  <span
                    key={h}
                    style={{
                      fontFamily: 'sans-serif',
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      letterSpacing: '0.08em',
                      color: '#555',
                      textAlign: h === 'QUANTITY' || h === 'PRICE' ? 'center' : 'left',
                    }}
                  >
                    {h}
                  </span>
                ))}
              </div>

              {/* rows */}
              {cart.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 160px 120px 40px',
                    alignItems: 'center',
                    padding: '1.1rem 1.5rem',
                    borderBottom: '1px solid #f2f2f2',
                  }}
                >
                  {/* product */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://placehold.co/80x80/EADEC9/2C362B?text=${encodeURIComponent(item.name)}`;
                      }}
                      style={{
                        width: '72px',
                        height: '72px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        border: '1px solid #eee',
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <p
                        style={{
                          fontFamily: "'Cormorant Garamond', Georgia, serif",
                          fontSize: '1rem',
                          fontWeight: '700',
                          color: '#1a1a1a',
                          margin: 0,
                        }}
                      >
                        {item.name}
                      </p>
                      {item.category && (
                        <p
                          style={{
                            fontFamily: 'sans-serif',
                            fontSize: '0.72rem',
                            color: '#C8844A',
                            margin: '0.2rem 0 0',
                            textTransform: 'capitalize',
                          }}
                        >
                          {item.category}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* quantity input */}
                  <div style={{ textAlign: 'center' }}>
                    <input
                      type="number"
                      min="1"
                      value={getQty(item)}
                      onChange={(e) => handleQtyChange(item.id, e.target.value)}
                      style={{
                        width: '64px',
                        padding: '0.4rem 0.5rem',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontFamily: 'sans-serif',
                        fontSize: '0.85rem',
                        textAlign: 'center',
                        color: '#333',
                        outline: 'none',
                      }}
                    />
                  </div>

                  {/* price */}
                  <div style={{ textAlign: 'center' }}>
                    <span
                      style={{
                        fontFamily: 'sans-serif',
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        color: '#1a1a1a',
                      }}
                    >
                      {formatRs(item.price * getQty(item))}
                    </span>
                  </div>

                  {/* remove */}
                  <div style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => removeItem(item.id)}
                      title="Remove"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#e05252',
                        fontSize: '1.1rem',
                        lineHeight: 1,
                        padding: '0.2rem',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}

              {/* update bag */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem 1.5rem' }}>
                <button
                  onClick={handleUpdate}
                  style={{
                    padding: '0.5rem 1.4rem',
                    border: '1px solid #999',
                    borderRadius: '4px',
                    backgroundColor: '#fff',
                    fontFamily: 'sans-serif',
                    fontSize: '0.78rem',
                    color: '#444',
                    cursor: 'pointer',
                    letterSpacing: '0.02em',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#f5f5f5')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = '#fff')}
                >
                  Update Bag
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── RIGHT: Order Summary ── */}
        <div
          style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '1.6rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          <h2
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '1.3rem',
              fontWeight: '700',
              color: '#1a1a1a',
              marginTop: 0,
              marginBottom: '1.2rem',
            }}
          >
            Order Summary
          </h2>

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '1rem' }}>
            <Row label="Subtotal" value={formatRs(subtotal)} />
            <Row
              label="Shipping"
              value={shipping === 0 ? <span style={{ color: '#5A7A5A', fontWeight: '600' }}>Free</span> : formatRs(shipping)}
            />
            {shipping > 0 && settings.freeShippingThreshold > 0 && (
              <p style={{ fontFamily: 'sans-serif', fontSize: '0.72rem', color: '#888', margin: '0 0 0.5rem' }}>
                Add {formatRs(settings.freeShippingThreshold - subtotal)} more for free shipping.
              </p>
            )}
          </div>

          <div
            style={{
              borderTop: '1px solid #e8e8e8',
              marginTop: '1rem',
              paddingTop: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontFamily: 'sans-serif', fontSize: '0.9rem', fontWeight: '700', color: '#1a1a1a' }}>
              Total
            </span>
            <span style={{ fontFamily: 'sans-serif', fontSize: '0.9rem', fontWeight: '700', color: '#4A7A9B' }}>
              {formatRs(total)}
            </span>
          </div>

          {!isEmpty && (
            <button
              onClick={handleCheckout}
              style={{
                display: 'block',
                width: '100%',
                marginTop: '1.4rem',
                padding: '0.9rem',
                backgroundColor: '#4A5D3A',
                color: '#fff',
                border: 'none',
                borderRadius: '999px',
                fontFamily: 'sans-serif',
                fontSize: '0.75rem',
                fontWeight: '700',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#3a4d2a')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#4A5D3A')}
            >
              Proceed to Checkout
            </button>
          )}

          <p
            style={{
              textAlign: 'center',
              fontFamily: 'sans-serif',
              fontSize: '0.7rem',
              color: '#aaa',
              marginTop: '0.8rem',
              marginBottom: 0,
            }}
          >
            Cash on Delivery, JazzCash &amp; EasyPaisa accepted
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.65rem',
      }}
    >
      <span style={{ fontFamily: 'sans-serif', fontSize: '0.82rem', color: '#555' }}>{label}</span>
      <span style={{ fontFamily: 'sans-serif', fontSize: '0.82rem', color: '#1a1a1a', fontWeight: '500' }}>
        {value}
      </span>
    </div>
  );
}
