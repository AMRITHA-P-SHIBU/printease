import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">

        {/* LEFT — Logo */}
        <div className="navbar__logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="navbar__logo-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="#2bb5a0"/>
              <rect x="6" y="9" width="16" height="11" rx="2" fill="white" opacity="0.9"/>
              <rect x="9" y="6" width="10" height="6" rx="1.5" fill="white" opacity="0.6"/>
              <rect x="9" y="14" width="10" height="2" rx="1" fill="#2bb5a0"/>
              <rect x="9" y="17" width="7" height="2" rx="1" fill="#2bb5a0"/>
              <circle cx="20" cy="12" r="2" fill="#1f8a79"/>
            </svg>
          </div>
          <div className="navbar__logo-text">
            <span className="navbar__brand">PrintEase</span>
            <span className="navbar__slogan">Smart Printing Made Simple</span>
          </div>
        </div>

        {/* CENTER — Links */}
        <ul className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          <li><button onClick={() => { setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</button></li>
          <li><button onClick={() => scrollTo('features')}>Features</button></li>
          <li><button onClick={() => scrollTo('about')}>About</button></li>
        </ul>

        {/* RIGHT — CTA */}
        <div className="navbar__right">
          {/* combine navbar__login for layout tweaks with the shared btn-primary style */}
          <button className="navbar__login btn-primary" onClick={() => navigate('/welcome')}>Login</button>
        </div>

        {/* Hamburger */}
        <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
