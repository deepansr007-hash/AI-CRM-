import React, { useState } from 'react';
import { ShieldCheck, Lock, User, RefreshCw, KeyRound } from 'lucide-react';
import { api } from '../services/api.js';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) return;
    try {
      setLoading(true);
      setError(null);
      await api.auth.login(username, password);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (userType) => {
    if (userType === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('sales');
      setPassword('sales123');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #0F172A 0%, #020617 100%)',
      padding: '24px'
    }}>
      
      {/* Login Box Panel */}
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '40px',
        background: 'rgba(15, 23, 42, 0.75)'
      }}>
        
        {/* Brand Brand Logo */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--cyan), var(--primary))',
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)',
            marginBottom: '16px'
          }}>
            <ShieldCheck size={28} color="#fff" />
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.6rem',
            fontWeight: 800,
            color: '#fff',
            letterSpacing: '-0.02em',
            marginBottom: '4px'
          }}>Pulse CRM</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sign in to access AI forecasting analytics</p>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="glass-panel" style={{
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            borderRadius: '8px',
            color: '#fca5a5',
            fontSize: '0.8rem',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="username" className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input 
                id="username"
                name="username"
                type="text" 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                required 
                autoComplete="username"
                className="glass-input" 
                placeholder="Enter username"
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="password" className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input 
                id="password"
                name="password"
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                autoComplete="current-password"
                className="glass-input" 
                placeholder="Enter password"
                style={{ paddingLeft: '42px' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading ? <RefreshCw size={16} className="animate-spin" style={{ animation: 'spin 1.5s infinite linear' }} /> : 'Sign In'}
          </button>
        </form>

        {/* Quick Fill Accounts shortcuts (for testing convenience) */}
        <div style={{
          marginTop: '32px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          paddingTop: '24px'
        }}>
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            marginBottom: '12px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}>
            <KeyRound size={12} color="var(--cyan)" /> Quick-Fill Demo Profiles
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button 
              onClick={() => handleQuickFill('admin')}
              className="btn btn-secondary"
              style={{ padding: '8px 12px', fontSize: '0.75rem' }}
            >
              Admin Controller
            </button>
            <button 
              onClick={() => handleQuickFill('sales')}
              className="btn btn-secondary"
              style={{ padding: '8px 12px', fontSize: '0.75rem' }}
            >
              Sales Manager
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
export default Login;
