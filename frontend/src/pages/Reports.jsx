import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  FileText, 
  Terminal,
  Server
} from 'lucide-react';
import { api } from '../services/api.js';

export function Reports({ user }) {
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Training progress indicator state
  const [trainingModelName, setTrainingModelName] = useState(null);
  const [trainingMessage, setTrainingMessage] = useState('');

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await api.dashboard.getStats();
      setMetrics(data.aiModelsStats);
      setError(null);
    } catch (e) {
      console.error('[Reports] Error loading metrics:', e.message);
      setError('Could not access telemetry metrics from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleRetrain = async (modelName) => {
    if (user.role !== 'admin') {
      alert('Security violation: Sales accounts do not have execution authority to train core network weights.');
      return;
    }
    
    try {
      setTrainingModelName(modelName);
      setTrainingMessage('Spawning Python fit child processes. Loading features...');
      
      // Simulating step timers for visual feedback
      setTimeout(() => {
        setTrainingMessage('Optimizing hyper-parameters. Adjusting gradient estimators...');
      }, 1000);

      const res = await api.dashboard.retrainModel(modelName);
      
      setTimeout(() => {
        // Update local status
        setMetrics(prev => prev.map(m => 
          m.model_name === modelName 
            ? { ...m, accuracy: res.metrics.accuracy, precision: res.metrics.precision, last_trained: res.metrics.last_trained } 
            : m
        ));
        setTrainingModelName(null);
        setTrainingMessage('');
        alert(`${modelName} retrained successfully. Performance improved.`);
      }, 2000);

    } catch (err) {
      alert('Failed: ' + err.message);
      setTrainingModelName(null);
      setTrainingMessage('');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '12px' }}>
        <RefreshCw size={24} className="animate-spin" style={{ color: 'var(--primary)', animation: 'spin 1.5s infinite linear' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Retrieving pipeline model parameters...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* 1. Header description */}
      <div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700 }}>AI Inference Telemetry</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Monitor validation accuracy, parameters and train classification weights</p>
      </div>

      {/* Security alert context badge for non-admin accounts */}
      {user && user.role !== 'admin' && (
        <div className="glass-panel" style={{ 
          padding: '16px 24px', 
          background: 'rgba(239, 68, 68, 0.05)', 
          borderLeft: '4px solid var(--color-danger)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <ShieldAlert size={20} color="var(--color-danger)" />
          <div style={{ fontSize: '0.8rem', color: '#fba5a5' }}>
            <strong>Security Warning:</strong> Your account is registered under a <strong>{user.role}</strong> role. Weights retraining execution triggers are deactivated. Contact CRM architecture admins to request updates.
          </div>
        </div>
      )}

      {/* 2. Models Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {metrics.map((model) => {
          const isTraining = trainingModelName === model.model_name;
          
          return (
            <div key={model.id} className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
              
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h4 style={{ fontWeight: 600, color: '#fff', fontSize: '1.1rem' }}>{model.model_name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--cyan)' }}>Running ver: {model.version}</span>
                </div>
                <span className="badge badge-success">
                  <CheckCircle2 size={12} /> {model.status}
                </span>
              </div>

              {/* Progress overlay during train */}
              {isTraining && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(15, 19, 26, 0.95)',
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px',
                  textAlign: 'center',
                  gap: '12px'
                }}>
                  <RefreshCw size={24} className="animate-spin" style={{ color: 'var(--primary)', animation: 'spin 1.5s infinite linear' }} />
                  <p style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 500 }}>{trainingMessage}</p>
                </div>
              )}

              {/* Parameters metrics values */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: '20px 0', padding: '16px', background: 'rgba(255,255,255,0.01)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Fit Accuracy</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-success)' }}>
                    {(model.accuracy * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>F1 Metric</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--cyan)' }}>
                    {(model.f1_score * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Precision rate</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {(model.precision * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Recall rate</span>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {(model.recall * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              {/* Training logs info footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Last trained: {new Date(model.last_trained).toLocaleString()}
                </span>
                
                <button 
                  disabled={user.role !== 'admin'}
                  onClick={() => handleRetrain(model.model_name)}
                  className={`btn ${user.role === 'admin' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '8px 16px', fontSize: '0.8rem', opacity: user.role === 'admin' ? 1 : 0.6 }}
                >
                  <RefreshCw size={12} /> Refit weights
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* 3. System execution specs */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <Server size={18} color="var(--primary)" /> Inference Server Specifications
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', fontSize: '0.85rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.01)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Execution Platform</span>
            <p style={{ fontWeight: 600, marginTop: '4px', color: '#fff' }}>Windows Core Python Engine</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.01)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <span style={{ color: 'var(--text-muted)' }}>GPU Hardware acceleration</span>
            <p style={{ fontWeight: 600, marginTop: '4px', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              CUDA Active (Mock)
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.01)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Model Storage Format</span>
            <p style={{ fontWeight: 600, marginTop: '4px', color: '#fff' }}>ONNX / Safetensors</p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.01)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Active API Port</span>
            <p style={{ fontWeight: 600, marginTop: '4px', color: 'var(--cyan)' }}>8000 (Python Inference)</p>
          </div>
        </div>
      </div>

    </div>
  );
}
export default Reports;
