import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  RefreshCw, 
  AlertCircle, 
  Calendar, 
  DollarSign, 
  ArrowLeftRight, 
  ChevronRight,
  ChevronLeft,
  X,
  FileMinus,
  Edit2,
  Trash
} from 'lucide-react';
import { api } from '../services/api.js';

export function Deals() {
  const [deals, setDeals] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modals management
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [formData, setFormData] = useState({
    id: '',
    lead_id: '',
    title: '',
    value: '',
    stage: 'discovery',
    close_date: ''
  });
  const [saving, setSaving] = useState(false);

  const fetchDealsAndLeads = async () => {
    try {
      setLoading(true);
      const [dealsList, leadsList] = await Promise.all([
        api.deals.list(),
        api.leads.list()
      ]);
      setDeals(dealsList);
      setLeads(leadsList.filter(l => l.status !== 'lost'));
      setError(null);
    } catch (e) {
      console.error('[Deals] Fetch error:', e.message);
      setError('Could not retrieve deals data from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealsAndLeads();
  }, []);

  const stages = [
    { key: 'discovery', label: 'Discovery' },
    { key: 'demo', label: 'Demo / Pitch' },
    { key: 'negotiation', label: 'Negotiation' },
    { key: 'contract', label: 'Contracting' },
    { key: 'won', label: 'Won / Settled' },
    { key: 'lost', label: 'Lost / Closed' }
  ];

  // Helper values calculation per stage
  const getStageStats = (stageKey) => {
    const stageDeals = deals.filter(d => d.stage === stageKey);
    const count = stageDeals.length;
    const value = stageDeals.reduce((sum, d) => sum + d.value, 0);
    return { count, value };
  };

  // Change stage API call
  const changeDealStage = async (dealId, nextStage) => {
    try {
      const deal = deals.find(d => d.id === dealId);
      if (!deal) return;
      await api.deals.update(dealId, { ...deal, stage: nextStage });
      // Refresh list
      await fetchDealsAndLeads();
    } catch (err) {
      alert('Error updating stage: ' + err.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setFormData({
      id: '',
      lead_id: leads[0]?.id || '',
      title: '',
      value: '',
      stage: 'discovery',
      close_date: new Date(Date.now() + 3600000 * 24 * 30).toISOString().split('T')[0] // 30 days default future
    });
    setModalMode('create');
    setShowModal(true);
  };

  const openEditModal = (deal) => {
    setFormData({
      id: deal.id,
      lead_id: deal.lead_id || '',
      title: deal.title,
      value: deal.value,
      stage: deal.stage,
      close_date: deal.close_date || ''
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (modalMode === 'create') {
        await api.deals.create(formData);
      } else {
        await api.deals.update(formData.id, formData);
      }
      setShowModal(false);
      await fetchDealsAndLeads();
    } catch (err) {
      alert(err.message || 'Error processing deal.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDeal = async (id) => {
    if (!window.confirm('Delete this deal permanently?')) return;
    try {
      await api.deals.delete(id);
      await fetchDealsAndLeads();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const stageKeys = stages.map(s => s.key);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '12px' }}>
        <RefreshCw size={24} className="animate-spin" style={{ color: 'var(--primary)', animation: 'spin 1.5s infinite linear' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Mapping CRM pipeline board...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', borderColor: 'var(--color-danger)' }}>
        <AlertCircle size={48} color="var(--color-danger)" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>{error}</p>
        <button className="btn btn-secondary" onClick={fetchDealsAndLeads}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Upper description / aggregation header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700 }}>Sales Pipeline Tracker</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Pipeline stages coordinate conversion probability</p>
        </div>
        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} /> New Deal Opportunity
        </button>
      </div>

      {/* Kanban Board Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '16px',
        overflowX: 'auto',
        paddingBottom: '20px',
        minHeight: '70vh',
        alignItems: 'stretch'
      }}>
        {stages.map((stage) => {
          const stats = getStageStats(stage.key);
          const stageDeals = deals.filter(d => d.stage === stage.key);
          const stageIdx = stageKeys.indexOf(stage.key);
          
          return (
            <div 
              key={stage.key} 
              style={{
                background: 'rgba(255, 255, 255, 0.01)',
                border: '1px solid var(--border-glass)',
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                minWidth: '220px'
              }}
            >
              
              {/* Stage Header Info */}
              <div style={{
                borderBottom: '1px solid var(--border-glass)',
                paddingBottom: '10px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <h4 style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>{stage.label}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '8px' }}>
                    {stats.count}
                  </span>
                </h4>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Total: ${stats.value.toLocaleString()}
                </div>
              </div>

              {/* Deal Cards Container */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {stageDeals.map((deal) => {
                  const prob = Math.round(deal.ai_probability * 100);
                  
                  return (
                    <div 
                      key={deal.id} 
                      className="glass-panel"
                      style={{
                        padding: '16px',
                        background: 'var(--bg-glass-card)',
                        borderLeft: `3px solid ${
                          prob >= 80 ? 'var(--color-success)' :
                          prob >= 40 ? 'var(--color-warning)' : 'var(--color-danger)'
                        }`
                      }}
                    >
                      <h5 style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px', color: '#fff' }}>{deal.title}</h5>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>{deal.lead_company || deal.lead_name || 'Generic Client'}</p>
                      
                      {/* Deal Value */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--cyan)', marginBottom: '12px' }}>
                        <DollarSign size={13} />
                        {deal.value.toLocaleString()}
                      </div>

                      {/* AI rating probability */}
                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '8px', marginBottom: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                          <span>AI Probability</span>
                          <span style={{ fontWeight: 600, color: '#fff' }}>{prob}%</span>
                        </div>
                        <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${prob}%`,
                            height: '100%',
                            background: prob >= 80 ? 'var(--color-success)' : prob >= 40 ? 'var(--color-warning)' : 'var(--color-danger)',
                            borderRadius: '2px'
                          }}></div>
                        </div>
                      </div>

                      {/* Closing calendar */}
                      {deal.close_date && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                          <Calendar size={12} />
                          <span>Est close: {deal.close_date}</span>
                        </div>
                      )}

                      {/* Moving stage buttons & edit actions */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '8px' }}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button 
                            onClick={() => openEditModal(deal)} 
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            title="Edit"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteDeal(deal.id)}
                            style={{ background: 'transparent', border: 'none', color: '#fca5a5', cursor: 'pointer' }}
                            title="Delete opportunity"
                          >
                            <Trash size={12} />
                          </button>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {stageIdx > 0 && (
                            <button 
                              onClick={() => changeDealStage(deal.id, stageKeys[stageIdx - 1])}
                              style={{ padding: '2px 4px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}
                            >
                              <ChevronLeft size={12} />
                            </button>
                          )}
                          {stageIdx < stageKeys.length - 1 && (
                            <button 
                              onClick={() => changeDealStage(deal.id, stageKeys[stageIdx + 1])}
                              style={{ padding: '2px 4px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', borderRadius: '4px', color: '#fff', cursor: 'pointer' }}
                            >
                              <ChevronRight size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
                {stageDeals.length === 0 && (
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px dashed rgba(255,255,255,0.03)',
                    borderRadius: '12px',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    padding: '24px 0',
                    textAlign: 'center'
                  }}>
                    <FileMinus size={18} style={{ marginBottom: '6px' }} />
                    No active deals
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* CREATE DEAL MODAL OVERLAY */}
      {showModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>
              <X size={20} />
            </button>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '24px' }}>
              {modalMode === 'create' ? 'Register New Deal Opportunity' : 'Update Opportunity Record'}
            </h3>

            <form onSubmit={handleFormSubmit}>
              
              <div className="form-group">
                <label className="form-label">Deal Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  value={formData.title} 
                  onChange={handleInputChange} 
                  required 
                  className="glass-input" 
                  placeholder="e.g. Enterprise Setup 120 seats"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Associated Lead Account</label>
                <select name="lead_id" value={formData.lead_id} onChange={handleInputChange} className="glass-input">
                  <option value="">No Active Account Connection (Independent Deal)</option>
                  {leads.map(lead => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name} ({lead.company || 'Private Address'})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Valuation Deal Value ($) *</label>
                  <input 
                    type="number" 
                    name="value" 
                    value={formData.value} 
                    onChange={handleInputChange} 
                    required 
                    className="glass-input"
                    placeholder="e.g. 45000"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Target Completion Date</label>
                  <input 
                    type="date" 
                    name="close_date" 
                    value={formData.close_date} 
                    onChange={handleInputChange} 
                    className="glass-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Active Progression Stage</label>
                <select name="stage" value={formData.stage} onChange={handleInputChange} className="glass-input">
                  {stages.map(st => (
                    <option key={st.key} value={st.key}>{st.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  {saving ? 'Registering Deal...' : modalMode === 'create' ? 'Create Opportunity' : 'Update Record'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
export default Deals;
