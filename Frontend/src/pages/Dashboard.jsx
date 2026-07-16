import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { supabase, closeLoginAudit } from '../lib/supabaseClient';
import axios from '../API/axios';

const SERVICES = [
  { name: 'Haircut & Styling', price: '$50', duration: '45 mins', icon: '✂️' },
  { name: 'Hair Coloring', price: '$95', duration: '90 mins', icon: '🎨' },
  { name: 'Facial & Skincare', price: '$75', duration: '60 mins', icon: '✨' },
  { name: 'Nail Art & Manicure', price: '$45', duration: '45 mins', icon: '💅' },
  { name: 'Massage Therapy', price: '$110', duration: '75 mins', icon: '💆' },
];

const STYLISTS = [
  { name: 'Alex Rivers', specialty: 'Hair Artisan', avatar: 'A' },
  { name: 'Sarah Jenkins', specialty: 'Skincare Specialist', avatar: 'S' },
  { name: 'Michael Chen', specialty: 'Master Stylist', avatar: 'M' },
  { name: 'Elena Rostova', specialty: 'Nail Artist', avatar: 'E' },
];

const AMBER = '#F7A200';
const AMBER_DARK = '#E08C00';
const DARK_BG = '#1a0800';

const StatCard = ({ icon, label, value, color }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '1.1rem 1.3rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.9rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    border: '1px solid #f0f0f0',
  }}>
    <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '0.72rem', color: '#999', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#111' }}>{value}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({ service: '', stylist: '', date: '', time: '' });
  const [booking, setBooking] = useState(false);
  const [loadingAppts, setLoadingAppts] = useState(true);

  const fetchAppointments = async (userId) => {
    setLoadingAppts(true);
    try {
      const stored = localStorage.getItem(`appointments_${userId}`);
      if (stored) {
        setAppointments(JSON.parse(stored));
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error.message);
      setAppointments([]);
    }
    setLoadingAppts(false);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('user');
    if (!token || !stored) {
      toast.error('Please sign in to continue.');
      navigate('/login');
      return;
    }
    try { 
      const parsedUser = JSON.parse(stored);
      setUser(parsedUser); 
      fetchAppointments(parsedUser.id);
    }
    catch { navigate('/login'); }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
      await closeLoginAudit(storedUser);
      await supabase.auth.signOut();
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.warn('Logout warning:', error.message);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
      navigate('/login');
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!form.service || !form.stylist || !form.date || !form.time) {
      toast.error('Please fill all booking fields');
      return;
    }
    const svc = SERVICES.find(s => s.name === form.service);
    const newApp = {
      id: crypto.randomUUID(),
      user_id: user.id,
      service: form.service,
      stylist: form.stylist,
      date: form.date,
      time: form.time,
      price: svc?.price || '$60',
      status: 'Confirmed',
      icon: svc?.icon || '💇',
    };
    
    setBooking(true);
    
    try {
      setAppointments(prev => {
        const sorted = [newApp, ...prev].sort((a,b) => new Date(a.date) - new Date(b.date));
        localStorage.setItem(`appointments_${user.id}`, JSON.stringify(sorted));
        return sorted;
      });
      toast.success('Appointment booked! 🎉');
      setForm({ service: '', stylist: '', date: '', time: '' });
    } catch (error) {
      toast.error('Failed to book appointment: ' + error.message);
    } finally {
      setBooking(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      setAppointments(prev => {
        const updated = prev.filter(a => a.id !== id);
        localStorage.setItem(`appointments_${user.id}`, JSON.stringify(updated));
        return updated;
      });
      toast.success('Appointment cancelled');
    } catch (error) {
      toast.error('Failed to cancel appointment: ' + error.message);
    }
  };

  const displayName = user?.fullName || user?.user_metadata?.fullName || user?.email?.split('@')[0] || 'Guest';
  const initial = displayName[0]?.toUpperCase();

  const selStyle = {
    width: '100%',
    padding: '0.75rem 0.9rem',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '0.9rem',
    color: '#222',
    backgroundColor: '#fafafa',
    outline: 'none',
    cursor: 'pointer',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.35rem',
  };

  if (!user) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EBEBEB' }}>
      <div style={{ width: 44, height: 44, border: `3px solid ${AMBER}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
    </div>
  );

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/logo.png" alt="StylePulse Logo" style={{ height: '50px', objectFit: 'contain', mixBlendMode: 'screen' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: `linear-gradient(135deg, ${AMBER}, #8B4500)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '800', color: 'white', fontSize: '1rem',
            }}>
              {initial}
            </div>
            <div style={{ display: 'none', flexDirection: 'column' }} className="hidden sm:flex">
              <span style={{ color: 'white', fontSize: '0.85rem', fontWeight: '600' }}>{displayName}</span>
              <span style={{ color: AMBER, fontSize: '0.72rem' }}>Customer</span>
            </div>
          </div>
          <Link
            to="/profile"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'none',
              padding: '0.45rem 0.85rem',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={15} height={15}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            Profile
          </Link>
          <button
            id="logout-btn"
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              backgroundColor: 'rgba(247,162,0,0.12)',
              border: `1px solid rgba(247,162,0,0.25)`,
              borderRadius: '8px',
              padding: '0.45rem 0.85rem',
              color: AMBER,
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = AMBER; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(247,162,0,0.12)'; e.currentTarget.style.color = AMBER; }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={15} height={15}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1rem 3rem' }}>

        {/* Welcome Banner */}
        <div style={{
          background: `linear-gradient(120deg, #C97000 0%, #8B4500 50%, ${DARK_BG} 100%)`,
          borderRadius: '20px',
          padding: '2rem 2.5rem',
          marginBottom: '2rem',
          boxShadow: '0 8px 32px rgba(140,70,0,0.35)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '160px', height: '160px', borderRadius: '50%', backgroundColor: 'rgba(247,162,0,0.1)' }} />
          <div style={{ position: 'absolute', right: '60px', bottom: '-30px', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(247,162,0,0.07)' }} />
          <h1 style={{ color: 'white', fontSize: '1.7rem', fontWeight: '800', marginBottom: '0.4rem' }}>
            Welcome back, <span style={{ color: AMBER }}>{displayName}</span>!
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', maxWidth: '480px' }}>
            Your beauty journey continues. Book a session, track appointments, and indulge in premium styling services.
          </p>
        </div>

        {/* Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <StatCard icon="📅" label="Active Bookings" value={appointments.length} color={AMBER} />
          <StatCard icon="⭐" label="Member Tier" value="Platinum" color="#8B4500" />
          <StatCard icon="🎁" label="Loyalty Points" value="450 pts" color="#C97000" />
          <StatCard icon="📍" label="Preferred Salon" value="Downtown" color="#1a0800" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }} className="dashboard-grid">

          {/* Appointments Column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#111' }}>
                📅 Upcoming Appointments
              </h2>
              <button
                id="new-booking-btn"
                onClick={() => setBooking(true)}
                style={{
                  backgroundColor: AMBER,
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.5rem 1.1rem',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 3px 12px rgba(247,162,0,0.3)',
                }}
              >
                + Book Now
              </button>
            </div>

            {loadingAppts ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#999' }}>Loading appointments...</div>
            ) : appointments.length === 0 ? (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '3rem',
                textAlign: 'center',
                border: '2px dashed #ddd',
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✂️</div>
                <p style={{ color: '#999', fontWeight: '500' }}>No appointments yet.</p>
                <p style={{ color: '#bbb', fontSize: '0.85rem', marginTop: '0.25rem' }}>Use the form to book your first session!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {appointments.map(app => (
                  <div
                    key={app.id}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      padding: '1.2rem 1.4rem',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
                      border: '1px solid #f0f0f0',
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flex: 1 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: '12px',
                        background: 'linear-gradient(135deg, #F7A200, #8B4500)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.3rem', flexShrink: 0,
                      }}>
                        {app.icon}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: '#111', fontSize: '0.97rem', marginBottom: '0.25rem' }}>{app.service}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.7rem', fontSize: '0.82rem', color: '#777' }}>
                          <span>👤 {app.stylist}</span>
                          <span>📅 {app.date}</span>
                          <span>🕐 {app.time}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                      <span style={{ fontWeight: '800', fontSize: '1.05rem', color: '#111' }}>{app.price}</span>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        padding: '0.2rem 0.7rem',
                        borderRadius: '999px',
                        backgroundColor: app.status === 'Confirmed' ? '#dcfce7' : '#fef3c7',
                        color: app.status === 'Confirmed' ? '#16a34a' : '#d97706',
                      }}>
                        {app.status}
                      </span>
                      <button
                        onClick={() => handleCancel(app.id)}
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: '600',
                          padding: '0.3rem 0.8rem',
                          borderRadius: '8px',
                          border: '1px solid #fca5a5',
                          backgroundColor: 'transparent',
                          color: '#ef4444',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#ef4444'; }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Booking Form Column */}
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#111', marginBottom: '1rem' }}>
              ✨ Book a Session
            </h2>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0,0,0,0.09)',
              border: '1px solid #f0f0f0',
            }}>
              <form id="booking-form" onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>Service</label>
                  <select value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value }))} style={selStyle}>
                    <option value="">Choose service...</option>
                    {SERVICES.map(s => (
                      <option key={s.name} value={s.name}>{s.icon} {s.name} — {s.price}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Stylist</label>
                  <select value={form.stylist} onChange={e => setForm(f => ({ ...f, stylist: e.target.value }))} style={selStyle}>
                    <option value="">Choose specialist...</option>
                    {STYLISTS.map(s => (
                      <option key={s.name} value={s.name}>{s.name} — {s.specialty}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                    min={new Date().toISOString().split('T')[0]}
                    style={selStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Time</label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                    style={selStyle}
                  />
                </div>

                {/* Service Preview */}
                {form.service && (
                  <div style={{
                    backgroundColor: '#fff8ed',
                    border: `1px solid ${AMBER}40`,
                    borderRadius: '12px',
                    padding: '0.9rem',
                  }}>
                    {(() => {
                      const s = SERVICES.find(sv => sv.name === form.service);
                      return s ? (
                        <div style={{ fontSize: '0.85rem', color: '#555' }}>
                          <span style={{ fontSize: '1.1rem' }}>{s.icon}</span>&nbsp;
                          <strong style={{ color: '#111' }}>{s.name}</strong>
                          <span style={{ marginLeft: '0.5rem', color: AMBER, fontWeight: '700' }}>{s.price}</span>
                          <span style={{ marginLeft: '0.5rem', color: '#999' }}>• {s.duration}</span>
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

                <button
                  id="confirm-booking-btn"
                  type="submit"
                  disabled={booking}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    background: booking ? '#ccc' : `linear-gradient(135deg, ${AMBER}, #C97000)`,
                    color: booking ? '#666' : 'white',
                    fontWeight: '700',
                    fontSize: '0.95rem',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: booking ? 'not-allowed' : 'pointer',
                    boxShadow: booking ? 'none' : '0 4px 16px rgba(247,162,0,0.35)',
                    marginTop: '0.25rem',
                  }}
                >
                  {booking ? 'Booking...' : 'Confirm Appointment'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <footer style={{
        background: DARK_BG,
        color: 'rgba(255,255,255,0.4)',
        textAlign: 'center',
        padding: '1.2rem',
        fontSize: '0.82rem',
      }}>
        © 2026 StylePulse. Elevating your aesthetic experience.
      </footer>

      <style>{`
        @media (max-width: 700px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
