import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const socialLinks = [
  {
    key: 'instagram',
    label: 'Instagram',
    svg: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    key: 'pinterest',
    label: 'Pinterest',
    svg: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    key: 'facebook',
    label: 'Facebook',
    svg: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    key: 'twitter',
    label: 'Twitter',
    svg: (
      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const { content } = useStore();
  const { contact, social } = content;
  const socials = socialLinks.filter(({ key }) => social[key]);
  return (
    <footer
      style={{
        backgroundColor: '#1A1A1A',
        color: '#ffffff',
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 400,
        fontSize: '16px',
        lineHeight: '26px',
        letterSpacing: '0px',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0px 12px',
          paddingTop: '4rem',
          paddingBottom: '2rem',
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">

          {/* Brand */}
          <div className="lg:col-span-4">
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: '1.2rem',
                letterSpacing: '0.15em',
                color: '#ffffff',
                marginBottom: '1rem',
              }}
            >
              LIVING SPACE HUB
            </h3>
            <p
              style={{
                fontSize: '14px',
                lineHeight: '26px',
                color: '#a8a8a8',
                marginBottom: '1.5rem',
                maxWidth: '280px',
              }}
            >
              {content.footerTagline}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {socials.map(({ key, svg, label }) => (
                <a
                  key={label}
                  href={social[key]}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#2e2e2e',
                    color: '#cccccc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.2s, color 0.2s',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#5A5A40';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2e2e2e';
                    e.currentTarget.style.color = '#cccccc';
                  }}
                >
                  {svg}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 lg:ml-auto">
            <h5
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: '16px',
                color: '#ffffff',
                marginBottom: '1rem',
                lineHeight: '26px',
              }}
            >
              Quick Links
            </h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { label: 'Home', to: '/' },
                { label: 'Shop', to: '/shop' },
                { label: 'About Us', to: '/about' },
                { label: 'Contact', to: '/contact' },
                { label: 'Admin Panel', to: '/admin' },
              ].map(({ label, to }) => (
                <li key={to} style={{ marginBottom: '0.6rem' }}>
                  <Link
                    to={to}
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '26px',
                      color: '#a8a8a8',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#a8a8a8')}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="lg:col-span-2">
            <h5
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: '16px',
                color: '#ffffff',
                marginBottom: '1rem',
                lineHeight: '26px',
              }}
            >
              Support
            </h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { label: 'FAQs', to: '/faq' },
                { label: 'Track Order', to: '/track-order' },
                { label: 'Privacy Policy', to: '/privacy' },
              ].map(({ label, to }) => (
                <li key={label} style={{ marginBottom: '0.6rem' }}>
                  <Link
                    to={to}
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: '14px',
                      fontWeight: 400,
                      lineHeight: '26px',
                      color: '#a8a8a8',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#a8a8a8')}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-4">
            <h5
              style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 700,
                fontSize: '16px',
                color: '#ffffff',
                marginBottom: '1rem',
                lineHeight: '26px',
              }}
            >
              Contact Info
            </h5>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <MapPin style={{ width: '16px', height: '16px', color: '#D4A373', flexShrink: 0, marginTop: '4px' }} />
                <span style={{ fontSize: '14px', lineHeight: '26px', color: '#a8a8a8' }}>
                  {contact.addressLines.map((line, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <br />}
                      {line}
                    </React.Fragment>
                  ))}
                </span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                <Phone style={{ width: '16px', height: '16px', color: '#D4A373', flexShrink: 0 }} />
                <a
                  href={`tel:${contact.phone.replace(/\s/g, '')}`}
                  style={{ fontSize: '14px', lineHeight: '26px', color: '#a8a8a8', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#a8a8a8')}
                >
                  {contact.phone}
                </a>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Mail style={{ width: '16px', height: '16px', color: '#D4A373', flexShrink: 0 }} />
                <a
                  href={`mailto:${contact.email}`}
                  style={{ fontSize: '14px', lineHeight: '26px', color: '#a8a8a8', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#a8a8a8')}
                >
                  {contact.email}
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <hr
          style={{
            border: 'none',
            borderTop: '1px solid #2e2e2e',
            marginTop: '4rem',
            marginBottom: '1.5rem',
          }}
        />

        {/* Copyright */}
        <div
          style={{
            textAlign: 'center',
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 400,
            fontSize: '16px',
            lineHeight: '26px',
            color: '#ffffff',
            padding: '0px 12px',
          }}
        >
          <p style={{ margin: 0 }}>© {new Date().getFullYear()} Living Space Hub. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
}
