import React from 'react';
import './Footer.css';

export default function Footer() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">

      {/* TOP SECTION */}
      <div className="footer__inner">

        {/* LEFT — Brand */}
        <div className="footer__brand">
          <div className="footer__logo">
            <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="#2bb5a0"/>
              <rect x="6" y="9" width="16" height="11" rx="2" fill="white" opacity="0.9"/>
              <rect x="9" y="6" width="10" height="6" rx="1.5" fill="white" opacity="0.6"/>
              <rect x="9" y="14" width="10" height="2" rx="1" fill="#2bb5a0"/>
              <rect x="9" y="17" width="7" height="2" rx="1" fill="#2bb5a0"/>
              <circle cx="20" cy="12" r="2" fill="#1f8a79"/>
            </svg>
            <span>PrintEase</span>
          </div>
          <p className="footer__desc">
            Streamlining campus printing and bookstore operations through smart automation and role-based access.
          </p>
        </div>

        {/* RIGHT — Quick Links */}
        <div className="footer__col">
          <h4>Quick Links</h4>
          <ul>
            <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</button></li>
            <li><button onClick={() => scrollTo('features')}>Features</button></li>
            <li><button onClick={() => scrollTo('about')}>About</button></li>
          </ul>
        </div>

      </div>

      {/* DIVIDER */}
      <div className="footer__divider">
        <hr />
      </div>

      {/* BOTTOM — Copyright */}
      <div className="footer__bottom">
        <span>© 2026 PrintEase. All rights reserved.</span>
      </div>

    </footer>
  );
}
