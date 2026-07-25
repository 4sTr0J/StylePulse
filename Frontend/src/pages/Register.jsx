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

const InputField = ({ label, icon, error, type = 'text', placeholder, reg }) => {
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

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const { confirmPassword, ...submitData } = data;

      const response = await axios.post('/api/auth/register', submitData);
      const responseData = response.data;

      if (!responseData?.success) {
        throw new Error(responseData?.message || 'Registration failed. Please try again.');
      }

      const token = responseData.token || responseData.session?.access_token;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(responseData.user));
        toast.success(responseData.message || 'Account created successfully! 🎉');
        navigate('/dashboard');
      } else {
        toast.success('Account created! Please check your email to confirm, then sign in.');
        navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const iconUser = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={17} height={17}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
  const iconMail = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={17} height={17}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  );
  const iconPhone = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={17} height={17}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 16z"/>
    </svg>
  );
  const iconLock = (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={17} height={17}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );

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

      {/* Form Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            width: '100%',
            maxWidth: '440px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
          }}
        >
          <div className="text-center mb-7">
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F7A200, #8B4500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                boxShadow: '0 4px 16px rgba(247,162,0,0.35)',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" width={26} height={26}>
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            </div>
            <h2 style={{ fontSize: '1.7rem', fontWeight: '800', color: '#111', marginBottom: '0.3rem' }}>
              Create Account
            </h2>
            <p style={{ color: '#888', fontSize: '0.93rem' }}>Join StylePulse and start booking</p>
          </div>

          <form id="register-form" onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

            <InputField
              label="Full Name"
              icon={iconUser}
              error={errors.fullName?.message}
              type="text"
              placeholder="e.g. John Doe"
              reg={register('fullName', {
                required: 'Full name is required',
                minLength: { value: 2, message: 'Name must be at least 2 characters' }
              })}
            />

            <InputField
              label="Email Address"
              icon={iconMail}
              error={errors.email?.message}
              type="email"
              placeholder="you@example.com"
              reg={register('email', {
                required: 'Email is required',
                pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }
              })}
            />

            <InputField
              label="Phone Number"
              icon={iconPhone}
              error={errors.phone?.message}
              type="tel"
              placeholder="e.g. 9876543210"
              reg={register('phone', {
                required: 'Phone number is required',
                pattern: { value: /^[0-9]{10,15}$/, message: 'Enter a valid 10-15 digit phone number' }
              })}
            />

            <InputField
              label="Password"
              icon={iconLock}
              error={errors.password?.message}
              type="password"
              placeholder="Min. 6 characters"
              reg={register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
            />

            <InputField
              label="Confirm Password"
              icon={iconLock}
              error={errors.confirmPassword?.message}
              type="password"
              placeholder="Re-enter your password"
              reg={register('confirmPassword', {
                required: 'Please confirm your password',
                validate: value => value === password || 'Passwords do not match'
              })}
            />

            <button
              id="register-btn"
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
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', color: '#666', fontSize: '0.93rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#F7A200', fontWeight: '700', textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;