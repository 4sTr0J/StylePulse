import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#EBEBEB' }}>
      
      {/* Hero Header — Orange/Dark Brown Gradient */}
      <div
        className="relative flex flex-col items-center justify-center"
        style={{
          background: 'linear-gradient(160deg, #C97000 0%, #8B4500 45%, #1a0500 100%)',
          minHeight: '55vh',
          paddingTop: '3rem',
          paddingBottom: '3rem',
        }}
      >
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, rgba(247,162,0,0.18) 0%, transparent 65%)',
          }}
        />

        {/* Logo Mark */}
        <div className="relative z-10 flex flex-col items-center">
          <img src="/logo.png" alt="StylePulse Logo" style={{ width: 'auto', height: '220px', objectFit: 'contain', mixBlendMode: 'screen' }} />
        </div>
      </div>

      {/* Content Section — Light Gray */}
      <div
        className="flex-1 flex flex-col items-center justify-center px-6"
        style={{ backgroundColor: '#EBEBEB', paddingTop: '3.5rem', paddingBottom: '3.5rem' }}
      >
        {/* Headline */}
        <h2
          className="text-center font-bold mb-4"
          style={{ fontSize: '1.9rem', color: '#111', lineHeight: 1.25 }}
        >
          Your{' '}
          <span style={{ color: '#F7A200' }}>Ultimate Salon</span>
          <br />
          Booking App
        </h2>

        {/* Sub-text */}
        <p
          className="text-center max-w-xs mb-10"
          style={{ color: '#555', fontSize: '0.97rem', lineHeight: 1.65 }}
        >
          Discover a world of beauty at your fingertips with StylePulse, the ultimate
          salon booking app
        </p>

        {/* CTA Button */}
        <Link
          to="/register"
          id="get-started-btn"
          className="mb-8"
          style={{
            display: 'inline-block',
            backgroundColor: '#F7A200',
            color: 'white',
            fontWeight: '700',
            fontSize: '1rem',
            padding: '0.9rem 2.8rem',
            borderRadius: '999px',
            boxShadow: '0 4px 20px rgba(247,162,0,0.4)',
            transition: 'all 0.25s',
            textDecoration: 'none',
            letterSpacing: '0.02em',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#E08C00';
            e.currentTarget.style.boxShadow = '0 6px 28px rgba(247,162,0,0.55)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#F7A200';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(247,162,0,0.4)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Let's Get Started
        </Link>

        {/* Sign In Link */}
        <p style={{ color: '#555', fontSize: '0.93rem' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            id="signin-link"
            style={{ color: '#888', textDecoration: 'underline', fontWeight: '500' }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Home;