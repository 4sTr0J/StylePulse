import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

const AMBER = '#F7A200';
const DARK_BG = '#1a0800';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (!token || !storedUser) {
      toast.error('Please sign in to view your profile.');
      navigate('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setFormData({
        fullName: parsedUser.fullName || parsedUser.user_metadata?.fullName || '',
        email: parsedUser.email || '',
        phone: parsedUser.phone || parsedUser.user_metadata?.phone || ''
      });
    } catch (err) {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // If they are a Supabase user, update Supabase auth metadata
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { error } = await supabase.auth.updateUser({
          data: { fullName: formData.fullName, phone: formData.phone }
        });
        
        if (error) throw error;
        
        // Also update users table
        await supabase.from('users').update({
          full_name: formData.fullName,
          phone: formData.phone
        }).eq('id', user.id);
      }
      
      // Update local storage
      const updatedUser = { ...user, fullName: formData.fullName, phone: formData.phone };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success('Profile updated successfully! ✨');
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EBEBEB' }}>
      <div style={{ width: 44, height: 44, border: `3px solid ${AMBER}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

  const displayName = user.fullName || user.email?.split('@')[0];
  const initial = displayName[0]?.toUpperCase();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F2F2F2', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Navbar */}
      <nav style={{
        background: `linear-gradient(90deg, ${DARK_BG} 0%, #3d1200 100%)`,
        padding: '0 1.5rem',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 20px rgba(0,0,0,0.3)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
          <img src="/logo.png" alt="StylePulse Logo" style={{ height: '50px', objectFit: 'contain', mixBlendMode: 'screen' }} />
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/dashboard" style={{ color: AMBER, textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem' }}>
            Back to Dashboard
          </Link>
        </div>
      </nav>

      <main style={{ maxWidth: '700px', margin: '2rem auto', padding: '0 1rem' }}>
        
        {/* Profile Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '120px',
            background: `linear-gradient(135deg, ${AMBER}, #8B4500)`
          }} />
          
          <div style={{ position: 'relative', zIndex: 10, marginTop: '2rem' }}>
            <div style={{
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              border: '4px solid white'
            }}>
              <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${AMBER}, #8B4500)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: '800',
                color: 'white'
              }}>
                {initial}
              </div>
            </div>
            
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111', marginBottom: '0.2rem' }}>
              {displayName}
            </h1>
            <p style={{ color: '#888', fontSize: '0.95rem' }}>{user.role === 'customer' ? 'Premium Member' : 'StylePulse User'}</p>
          </div>

          <form onSubmit={handleSave} style={{ marginTop: '2.5rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#555', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  style={{
                    width: '100%', padding: '0.8rem', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '0.95rem',
                    outline: 'none', transition: 'border-color 0.2s', backgroundColor: '#fafafa'
                  }}
                  onFocus={e => e.target.style.borderColor = AMBER}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#555', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{
                    width: '100%', padding: '0.8rem', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '0.95rem',
                    outline: 'none', transition: 'border-color 0.2s', backgroundColor: '#fafafa'
                  }}
                  onFocus={e => e.target.style.borderColor = AMBER}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: '#555', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                style={{
                  width: '100%', padding: '0.8rem', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '0.95rem',
                  backgroundColor: '#f3f4f6', color: '#888', cursor: 'not-allowed'
                }}
              />
              <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.4rem' }}>Email cannot be changed.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: loading ? '#f5c842' : AMBER,
                color: 'white',
                fontWeight: '700',
                fontSize: '1rem',
                border: 'none',
                borderRadius: '14px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(247,162,0,0.3)',
                transition: 'all 0.2s',
                marginTop: '1rem'
              }}
            >
              {loading ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Profile;
