import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Home.css';

const features = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="10" fill="#e6f7f5"/>
        <rect x="8" y="12" width="16" height="12" rx="2.5" fill="#2bb5a0"/>
        <rect x="11" y="8" width="10" height="7" rx="2" fill="#68c9b8"/>
        <rect x="11" y="17" width="10" height="2" rx="1" fill="white"/>
        <rect x="11" y="20" width="7" height="2" rx="1" fill="white"/>
        <circle cx="22" cy="15" r="2.5" fill="#1f8a79"/>
      </svg>
    ),
    title: 'Smart Print Requests',
    desc: 'Upload documents, choose print settings — copies, layout, binding — and submit in seconds. No queues, no confusion.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="10" fill="#fff4e6"/>
        <circle cx="16" cy="16" r="8" fill="#f5a623" opacity="0.15"/>
        <path d="M16 9v7l4 4" stroke="#f5a623" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="16" cy="16" r="7" stroke="#f5a623" strokeWidth="2"/>
      </svg>
    ),
    title: 'Token Queue Tracking',
    desc: 'Get a unique token. Know when it\'s ready.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="10" fill="#e8f0fe"/>
        <rect x="8" y="14" width="16" height="10" rx="2" fill="#4285f4" opacity="0.8"/>
        <path d="M12 14v-3a4 4 0 018 0v3" stroke="#4285f4" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="16" cy="19" r="2" fill="white"/>
      </svg>
    ),
    title: 'Secure QR Payments',
    desc: 'Auto-calculated costs with instant QR-based digital payment. Fully transparent.',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="10" fill="#ffeaea"/>
        <rect x="8" y="10" width="7" height="9" rx="1.5" fill="#e53935" opacity="0.7"/>
        <rect x="17" y="13" width="7" height="9" rx="1.5" fill="#e53935" opacity="0.5"/>
        <rect x="8" y="21" width="16" height="2" rx="1" fill="#e53935"/>
        <path d="M16 8v6M13 11l3-3 3 3" stroke="#e53935" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Bookstore & Inventory',
    desc: 'Prebook record books and observation books before stock runs out. Get notified when items are restocked.',
  },
];

// Intersection Observer hook for scroll animations
function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed');
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return ref;
}

function FeatureCard({ icon, title, desc, delay }) {
  const ref = useScrollReveal();
  return (
    <div className="feature-card scroll-reveal" ref={ref} style={{ '--delay': `${delay}ms` }}>
      <div className="feature-card__icon">{icon}</div>
      <h3 className="feature-card__title">{title}</h3>
      <p className="feature-card__desc">{desc}</p>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const aboutRef = useScrollReveal();
  const featuresHeadRef = useScrollReveal();

  return (
    <div className="home">
      <Navbar />

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero__bg">
          {/* Animated SVG background */}
          <div className="hero__glow hero__glow--1" />
          <div className="hero__glow hero__glow--2" />
          <div className="hero__glow hero__glow--3" />
          <div className="hero__dots" />
        </div>

        <div className="hero__content">
          {/*<div className="hero__badge">🎓 Built for SJCET Campus</div>*/}
          <h1 className="hero__headline">
            Campus Printing,<br />
            <span className="hero__headline--accent">Reimagined.</span>
          </h1>
          <p className="hero__sub">
            PrintEase makes campus printing and bookstore access simple and stress-free.No waiting. No mix-ups. Just quick, easy service.
          </p>
          <div className="hero__cta">
            <button className="btn-primary" onClick={() => navigate('/welcome')}>
              Get Started →
            </button>
            <button className="btn-ghost" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
              See Features
            </button>
          </div>

          {/* Floating stats */}
          <div className="hero__stats">
            <div className="hero__stat">
              <span className="hero__stat-num">Zero</span>
              <span className="hero__stat-label">Waiting</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-num">Easy</span>
              <span className="hero__stat-label">Submit</span>
            </div>
            <div className="hero__stat-divider" />
            <div className="hero__stat">
              <span className="hero__stat-num">3</span>
              <span className="hero__stat-label">User Roles</span>
            </div>
          </div>
        </div>

        {/* Hero illustration — Isometric printing workspace */}
        <div className="hero__visual">
          <svg className="iso-scene" viewBox="0 0 520 480" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="deskGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#d4eeea"/>
                <stop offset="100%" stopColor="#b8e0da"/>
              </linearGradient>
              <linearGradient id="monitorGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1a2e35"/>
                <stop offset="100%" stopColor="#0f1e24"/>
              </linearGradient>
              <linearGradient id="screenGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1f6b60"/>
                <stop offset="100%" stopColor="#2bb5a0"/>
              </linearGradient>
              <linearGradient id="printerGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2c3e44"/>
                <stop offset="100%" stopColor="#1a2e35"/>
              </linearGradient>
              <linearGradient id="floorGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#e6f7f5" stopOpacity="0.7"/>
                <stop offset="100%" stopColor="#c8ede9" stopOpacity="0.3"/>
              </linearGradient>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#2bb5a0" floodOpacity="0.18"/>
              </filter>
              <filter id="softShadow">
                <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000" floodOpacity="0.12"/>
              </filter>
            </defs>

            {/* ── FLOOR ELLIPSE ── */}
            <ellipse cx="260" cy="390" rx="210" ry="70" fill="url(#floorGrad)"/>
            <ellipse cx="260" cy="390" rx="190" ry="58" fill="rgba(43,181,160,0.07)"/>

            {/* ── DESK SURFACE (isometric top face) ── */}
            {/* Top face of desk */}
            <polygon points="80,270 260,195 440,270 260,345" fill="url(#deskGrad)" filter="url(#softShadow)"/>
            {/* Left face of desk */}
            <polygon points="80,270 80,310 260,385 260,345" fill="#a8d8d2"/>
            {/* Right face of desk */}
            <polygon points="260,345 260,385 440,310 440,270" fill="#8fcdc6"/>

            {/* ── MONITOR BASE ── */}
            <polygon points="215,260 260,240 305,260 260,280" fill="#8fcdc6"/>
            <polygon points="215,260 215,270 260,290 260,280" fill="#7abdb6"/>
            <polygon points="260,280 260,290 305,270 305,260" fill="#6db0a9"/>
            {/* Stand neck */}
            <polygon points="250,240 270,232 270,258 250,266" fill="#5a9e97"/>

            {/* ── MONITOR BACK ── */}
            <polygon points="170,145 260,108 350,145 350,230 260,267 170,230" fill="#243b44"/>

            {/* ── MONITOR SCREEN ── */}
            <polygon points="182,153 260,118 338,153 338,222 260,257 182,222" fill="url(#screenGrad)"/>

            {/* Screen content - document being designed */}
            <polygon points="195,160 260,128 325,160 325,215 260,247 195,215" fill="#1a4f47"/>
            {/* Document on screen */}
            <polygon points="215,163 260,143 305,163 305,210 260,230 215,210" fill="white" opacity="0.9"/>
            {/* Print icon on doc */}
            <polygon points="237,172 260,162 283,172 283,185 260,195 237,185" fill="#2bb5a0" opacity="0.8"/>
            <polygon points="243,185 260,177 277,185 277,198 260,206 243,198" fill="#e6f7f5" opacity="0.7"/>
            {/* toolbar lines on screen */}
            <line x1="210" y1="157" x2="310" y2="157" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
            <polygon points="215,152 220,150 220,157 215,159" fill="rgba(255,100,100,0.6)"/>
            <polygon points="222,149 227,147 227,154 222,156" fill="rgba(255,190,50,0.6)"/>
            <polygon points="229,146 234,144 234,151 229,153" fill="rgba(43,181,160,0.6)"/>

            {/* ── KEYBOARD ── */}
            <polygon points="190,295 260,268 330,295 330,310 260,337 190,310" fill="#c8e6e2" filter="url(#softShadow)"/>
            <polygon points="190,295 190,310 260,337 260,322" fill="#a8cec9"/>
            <polygon points="260,322 260,337 330,310 330,295" fill="#9ac4be"/>
            {/* Key rows */}
            {[0,1,2].map(row => (
              [0,1,2,3,4,5].map(col => (
                <polygon key={`key-${row}-${col}`}
                  points={`${198+col*18+row*5},${298-row*7+col*3} ${208+col*18+row*5},${294-row*7+col*3} ${208+col*18+row*5},${300-row*7+col*3} ${198+col*18+row*5},${304-row*7+col*3}`}
                  fill="white" opacity="0.5"
                />
              ))
            ))}

            {/* ── MOUSE ── */}
            <ellipse cx="348" cy="302" rx="16" ry="11" fill="#b8ddd9" transform="rotate(-20,348,302)" filter="url(#softShadow)"/>
            <ellipse cx="348" cy="302" rx="15" ry="10" fill="#cce8e4" transform="rotate(-20,348,302)"/>
            <line x1="348" y1="295" x2="348" y2="309" stroke="rgba(43,181,160,0.4)" strokeWidth="1" transform="rotate(-20,348,302)"/>

            {/* ── PRINTER (right side) ── */}
            {/* Printer body top face */}
            <polygon points="355,228 420,200 445,215 380,243" fill="#3a5560"/>
            {/* Printer front face */}
            <polygon points="355,228 355,268 380,283 380,243" fill="url(#printerGrad)"/>
            {/* Printer right face */}
            <polygon points="380,243 380,283 445,255 445,215" fill="#2c3e44"/>
            {/* Paper slot */}
            <polygon points="362,222 418,196 424,200 368,226" fill="#1a2e35"/>
            {/* Paper coming out */}
            <polygon points="370,208 410,191 418,196 378,213" fill="white" opacity="0.9"/>
            <polygon points="373,202 406,187 410,191 377,206" fill="white"/>
            {/* Ink cartridge colors */}
            <rect x="432" y="220" width="6" height="16" rx="2" fill="#2bb5a0" transform="rotate(30,432,228)"/>
            <rect x="438" y="224" width="6" height="14" rx="2" fill="#f5a623" transform="rotate(30,441,231)"/>
            <rect x="444" y="228" width="6" height="12" rx="2" fill="#e53935" transform="rotate(30,447,234)"/>
            {/* Printer button */}
            <circle cx="375" cy="255" r="4" fill="#2bb5a0" opacity="0.8"/>
            <circle cx="375" cy="255" r="2.5" fill="#1f8a79"/>

            {/* ── PENCIL CUP / STATIONERY ── */}
            <polygon points="148,258 165,250 173,255 156,263" fill="#b8ddd9"/>
            <polygon points="148,258 148,278 156,283 156,263" fill="#9ac4be"/>
            <polygon points="156,263 156,283 173,275 173,255" fill="#88b8b2"/>
            {/* Pencils */}
            <line x1="153" y1="250" x2="156" y2="270" stroke="#f5a623" strokeWidth="3" strokeLinecap="round"/>
            <line x1="158" y1="247" x2="161" y2="268" stroke="#e53935" strokeWidth="3" strokeLinecap="round"/>
            <line x1="163" y1="248" x2="165" y2="269" stroke="#2bb5a0" strokeWidth="3" strokeLinecap="round"/>
            <line x1="167" y1="250" x2="169" y2="271" stroke="#4285f4" strokeWidth="3" strokeLinecap="round"/>
            {/* Tips */}
            <polygon points="151,247 155,250 153,250" fill="#ffd54f"/>
            <polygon points="156,244 160,247 158,247" fill="#ffb3b3"/>
            <polygon points="161,245 165,248 163,248" fill="#80cbc4"/>

            {/* ── DOCUMENT / PRINTED PHOTO ── */}
            <polygon points="290,278 340,256 350,262 300,284" fill="white" filter="url(#softShadow)"/>
            <polygon points="290,278 290,284 300,290 300,284" fill="#e8f0ee"/>
            <polygon points="300,284 300,290 350,268 350,262" fill="#dce8e6"/>
            {/* Photo print content */}
            <polygon points="294,279 338,258 346,262 302,283" fill="#e6f7f5"/>
            <ellipse cx="315" cy="271" rx="10" ry="7" fill="#2bb5a0" opacity="0.5" transform="rotate(-25,315,271)"/>
            <ellipse cx="330" cy="268" rx="6" ry="4" fill="#f5a623" opacity="0.4" transform="rotate(-25,330,268)"/>

            {/* ── WORKER FIGURES ── */}

            {/* Worker 1 — at monitor left, holding ladder */}
            <g className="iso-worker" style={{animation:'workerBob 3s ease-in-out infinite'}}>
              {/* Body */}
              <ellipse cx="175" cy="205" rx="8" ry="11" fill="#e53935"/>
              {/* Head */}
              <circle cx="175" cy="192" r="7" fill="#f0d5b8"/>
              {/* Hair */}
              <ellipse cx="175" cy="188" rx="7" ry="4" fill="#5d4037"/>
              {/* Legs */}
              <rect x="171" y="214" width="4" height="12" rx="2" fill="#1a237e"/>
              <rect x="177" y="214" width="4" height="12" rx="2" fill="#1a237e"/>
              {/* Arm holding */}
              <line x1="183" y1="204" x2="192" y2="200" stroke="#e53935" strokeWidth="3" strokeLinecap="round"/>
            </g>

            {/* Ladder near monitor */}
            <line x1="192" y1="180" x2="192" y2="230" stroke="#8fcdc6" strokeWidth="2.5"/>
            <line x1="200" y1="175" x2="200" y2="225" stroke="#8fcdc6" strokeWidth="2.5"/>
            <line x1="192" y1="188" x2="200" y2="185" stroke="#8fcdc6" strokeWidth="1.5"/>
            <line x1="192" y1="198" x2="200" y2="195" stroke="#8fcdc6" strokeWidth="1.5"/>
            <line x1="192" y1="208" x2="200" y2="205" stroke="#8fcdc6" strokeWidth="1.5"/>
            <line x1="192" y1="218" x2="200" y2="215" stroke="#8fcdc6" strokeWidth="1.5"/>

            {/* Worker 2 — at printer right */}
            <g className="iso-worker" style={{animation:'workerBob 3s 1s ease-in-out infinite'}}>
              <ellipse cx="442" cy="248" rx="7" ry="10" fill="#e53935"/>
              <circle cx="442" cy="236" r="6" fill="#f0d5b8"/>
              <ellipse cx="442" cy="233" rx="6" ry="3.5" fill="#3e2723"/>
              <rect x="438" y="256" width="4" height="11" rx="2" fill="#1a237e"/>
              <rect x="443" y="256" width="4" height="11" rx="2" fill="#1a237e"/>
              <line x1="435" y1="247" x2="428" y2="242" stroke="#e53935" strokeWidth="2.5" strokeLinecap="round"/>
            </g>

            {/* Ladder near printer */}
            <line x1="452" y1="218" x2="452" y2="258" stroke="#8fcdc6" strokeWidth="2"/>
            <line x1="459" y1="214" x2="459" y2="254" stroke="#8fcdc6" strokeWidth="2"/>
            <line x1="452" y1="225" x2="459" y2="222" stroke="#8fcdc6" strokeWidth="1.5"/>
            <line x1="452" y1="235" x2="459" y2="232" stroke="#8fcdc6" strokeWidth="1.5"/>
            <line x1="452" y1="245" x2="459" y2="242" stroke="#8fcdc6" strokeWidth="1.5"/>

            {/* Worker 3 — at tablet/drawing pad bottom center */}
            <g className="iso-worker" style={{animation:'workerBob 3s 0.5s ease-in-out infinite'}}>
              <ellipse cx="295" cy="328" rx="7" ry="9" fill="#e53935"/>
              <circle cx="295" cy="317" r="6" fill="#f0d5b8"/>
              <ellipse cx="295" cy="314" rx="6" ry="3" fill="#4e342e"/>
              <rect x="291" y="335" width="4" height="11" rx="2" fill="#1a237e"/>
              <rect x="297" y="335" width="4" height="11" rx="2" fill="#1a237e"/>
              {/* Arm with stylus */}
              <line x1="288" y1="326" x2="278" y2="322" stroke="#e53935" strokeWidth="2.5" strokeLinecap="round"/>
              <line x1="278" y1="322" x2="272" y2="320" stroke="#888" strokeWidth="2" strokeLinecap="round"/>
            </g>

            {/* Drawing tablet */}
            <polygon points="245,325 295,303 320,318 270,340" fill="#243b44" filter="url(#softShadow)"/>
            <polygon points="245,325 245,330 270,345 270,340" fill="#1a2e35"/>
            <polygon points="270,340 270,345 320,323 320,318" fill="#162028"/>
            {/* Tablet surface */}
            <polygon points="250,324 293,304 316,317 273,337" fill="#2c3e44"/>
            {/* Stylus mark */}
            <line x1="270" y1="322" x2="288" y2="315" stroke="#2bb5a0" strokeWidth="1.5" opacity="0.6"/>

            {/* ── CD / DISC ── */}
            <ellipse cx="155" cy="330" rx="22" ry="14" fill="#c8e6e2" transform="rotate(-10,155,330)" filter="url(#softShadow)"/>
            <ellipse cx="155" cy="330" rx="18" ry="11" fill="url(#screenGrad)" opacity="0.5" transform="rotate(-10,155,330)"/>
            <ellipse cx="155" cy="330" rx="5" ry="3" fill="white" transform="rotate(-10,155,330)"/>

            {/* Small CD */}
            <ellipse cx="185" cy="350" rx="16" ry="10" fill="#b8ddd9" transform="rotate(-10,185,350)"/>
            <ellipse cx="185" cy="350" rx="12" ry="7.5" fill="#2bb5a0" opacity="0.35" transform="rotate(-10,185,350)"/>
            <ellipse cx="185" cy="350" rx="3.5" ry="2.5" fill="white" transform="rotate(-10,185,350)"/>

            {/* ── FLOATING PAPER SHEET (top right) ── */}
            <g style={{animation:'paperFloat 4s ease-in-out infinite'}}>
              <polygon points="390,155 430,138 438,144 398,161" fill="white" opacity="0.95" filter="url(#softShadow)"/>
              <line x1="398" y1="150" x2="430" y2="137" stroke="#2bb5a0" strokeWidth="1" opacity="0.4"/>
              <line x1="398" y1="155" x2="426" y2="143" stroke="#2bb5a0" strokeWidth="1" opacity="0.3"/>
            </g>

            {/* Worker 4 — tiny, far left on ground */}
            <g style={{animation:'workerBob 3s 1.5s ease-in-out infinite'}}>
              <ellipse cx="108" cy="355" rx="5" ry="7" fill="#e53935" opacity="0.7"/>
              <circle cx="108" cy="347" r="5" fill="#f0d5b8" opacity="0.7"/>
              <rect x="105" y="361" width="3" height="8" rx="1.5" fill="#1a237e" opacity="0.7"/>
              <rect x="109" y="361" width="3" height="8" rx="1.5" fill="#1a237e" opacity="0.7"/>
            </g>

          </svg>

          {/* Floating badge */}
          {/*<div className="hero__float-badge">
            <span>✅</span>
            <span>Print job ready!</span>
          </div>*/}
     
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="features" id="features">
        <div className="features__inner">
          <div className="section-head scroll-reveal" ref={featuresHeadRef}>
            <span className="section-tag">Features</span>
            <h2 className="section-title">Everything your campus needs</h2>
            <p className="section-sub">From document upload to bookstore prebooking — PrintEase handles it all in one place.</p>
          </div>
          <div className="features__grid">
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section className="about" id="about">
        <div className="about__inner scroll-reveal" ref={aboutRef}>
          <div className="about__text">
            <span className="section-tag">About</span>
            <h2 className="section-title" style={{textAlign:'left'}}>Why PrintEase?</h2>
            <p className="about__desc">
              College printing services and campus bookstores are essential — yet most colleges still rely on manual, error-prone processes. PrintEase is built to fix that.
            </p>
            <p className="about__desc">
              You can upload documents, track print jobs, make digital payments, and prebook bookstore materials — all from one clean interface. Administrators get a powerful dashboard to manage everything in real-time.
            </p>
            <div className="about__pills">
              <span>🖨️ Automated Printing</span>
              <span>📚 Bookstore Module</span>
              <span>⚡ Fast-Track Requests</span>
              <span>🔐 Role-Based Access</span>
              <span>📊 Revenue Reports</span>
            </div>
          </div>
          <div className="about__visual">
            <div className="about__card-stack">
              <div className="about__card about__card--back">
                <div className="about__card-line" />
                <div className="about__card-line" style={{width:'60%'}} />
                <div className="about__card-line" style={{width:'80%'}} />
              </div>
              <div className="about__card about__card--front">
                <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px'}}>
                  <div style={{width:'36px',height:'36px',borderRadius:'10px',background:'#e6f7f5',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'18px'}}>🖨️</div>
                  <div>
                    <div style={{fontWeight:'700',fontSize:'14px',color:'#1a2e35'}}>Print Request</div>
                    <div style={{fontSize:'12px',color:'#8aacaa'}}>Submitted ·</div>
                  </div>
                </div>
                <div className="about__progress">
                  <div className="about__progress-step about__progress-step--done">Upload</div>
                  <div className="about__progress-line about__progress-line--done" />
                  <div className="about__progress-step about__progress-step--done">Paid</div>
                  <div className="about__progress-line about__progress-line--done" />
                  <div className="about__progress-step about__progress-step--active">Printing</div>
                  <div className="about__progress-line" />
                  <div className="about__progress-step">Done</div>
                </div>
                <div style={{marginTop:'16px',padding:'10px',background:'#e6f7f5',borderRadius:'8px',fontSize:'12px',color:'#1f8a79',fontWeight:'600'}}>
                  🟢 Your job is printing now 
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="cta-banner">
        <div className="cta-banner__inner">
          <h2>Ready to simplify your campus experience?</h2>
          <p>Join students and faculty already using PrintEase.</p>
          <button className="btn-primary btn-primary--large" onClick={() => navigate('/welcome')}>
            Get Started Now →
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
