import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth.js';
import { Layout } from './layouts/Layout.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Leads } from './pages/Leads.jsx';
import { Deals } from './pages/Deals.jsx';
import { Customers } from './pages/Customers.jsx';
import { Reports } from './pages/Reports.jsx';
import { Login } from './pages/Login.jsx';
import { RefreshCw } from 'lucide-react';

export function App() {
  const { user, token, checking, isAuthenticated } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');

  if (checking) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        gap: '12px'
      }}>
        <RefreshCw size={28} className="animate-spin" style={{ color: 'var(--primary)', animation: 'spin 1.5s infinite linear' }} />
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)', fontSize: '0.9rem' }}>
          Establishing secure environment session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  // Current main view tab dispatcher
  const renderActiveView = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'leads':
        return <Leads />;
      case 'deals':
        return <Deals />;
      case 'customers':
        return <Customers />;
      case 'reports':
        return <Reports user={user} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentTab={currentTab} setCurrentTab={setCurrentTab} user={user}>
      {renderActiveView()}
    </Layout>
  );
}
export default App;
