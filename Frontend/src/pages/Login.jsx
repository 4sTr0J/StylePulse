import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import axios from '../API/axios';
import { supabase, saveProfileToSupabase, recordLoginAudit } from '../lib/supabaseClient';

const EyeIcon = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={18} height={18}>
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </>
    )}
  </svg>
);

const InputField = ({ label, icon, error, type = 'text', placeholder, register: reg }) => {
  const [showPass, setShowPass] = useState(false);
  const isPass = type === 'password';
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '600', color: '#555', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <span style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: '#aaa', lineHeight: 0 }}>
          {icon}
        </span>
        <input
          type={isPass && showPass ? 'text' : type}
          {...reg}
          placeholder={placeholder}
          style={{
            width: '100%',
            paddingLeft: '2.6rem',
            paddingRight: isPass ? '2.8rem' : '1rem',
            paddingTop: '0.8rem',
            paddingBottom: '0.8rem',
            border: `2px solid ${error ? '#ef4444' : '#e5e7eb'}`,
            borderRadius: '12px',
            fontSize: '0.95rem',
            color: '#222',
            backgroundColor: '#fafafa',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={e => {
            e.target.style.borderColor = '#F7A200';
            e.target.style.boxShadow = '0 0 0 3px rgba(247,162,0,0.15)';
          }}
          onBlur={e => {
            e.target.style.borderColor = error ? '#ef4444' : '#e5e7eb';
            e.target.style.boxShadow = 'none';
          }}
        />
        {isPass && (
          <button
            type="button"
            onClick={() => setShowPass(v => !v)}
            style={{ position: 'absolute', right: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: '#999', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 0 }}
          >
            <EyeIcon open={showPass} />
          </button>
        )}
      </div>
      {error && <p style={{ fontSize: '0.78rem', color: '#ef4444', marginTop: '0.25rem' }}>{error}</p>}
    </div>
  );
};

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const response = await axios.post('/api/auth/login', data);
      const responseData = response.data;

      if (!responseData?.success) {
        throw new Error(responseData?.message || 'Login failed. Please check your credentials.');
      }

      const token = responseData.token || responseData.session?.access_token;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(responseData.user));
        toast.success(responseData.message || 'Welcome back! 🎉');
        navigate('/dashboard');
      } else {
        toast.error('Login failed: No session returned.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#EBEBEB' }}>
      {/* Top brand strip */}
      <div
        style={{
          background: 'linear-gradient(160deg, #C97000 0%, #8B4500 45%, #1a0500 100%)',
          padding: '1.8rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/logo.png" alt="StylePulse Logo" style={{ height: '70px', objectFit: 'contain', mixBlendMode: 'screen' }} />
        </Link>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
          }}
        >
          <div className="text-center mb-7">
            <h2 style={{ fontSize: '1.7rem', fontWeight: '800', color: '#111', marginBottom: '0.3rem' }}>
              Welcome Back
            </h2>
            <p style={{ color: '#888', fontSize: '0.93rem' }}>Sign in to continue your beauty journey</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <InputField
              label="Email Address"
              error={errors.email?.message}
              type="email"
              placeholder="you@example.com"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={17} height={17}>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              }
              reg={register('email', {
                required: 'Email is required',
                pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }
              })}
            />

            <InputField
              label="Password"
              error={errors.password?.message}
              type="password"
              placeholder="Enter your password"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={17} height={17}>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              }
              reg={register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <a href="#" style={{ fontSize: '0.83rem', color: '#F7A200', fontWeight: '600' }}>
                Forgot password?
              </a>
            </div>

            <button
              id="login-btn"
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.9rem',
                backgroundColor: loading ? '#f5c842' : '#F7A200',
                color: 'white',
                fontWeight: '700',
                fontSize: '1rem',
                border: 'none',
                borderRadius: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(247,162,0,0.35)',
                transition: 'all 0.2s',
                marginTop: '0.5rem',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#666', fontSize: '0.93rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#F7A200', fontWeight: '700', textDecoration: 'none' }}>
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;