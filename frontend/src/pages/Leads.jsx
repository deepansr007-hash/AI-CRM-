import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Brain, 
  RefreshCw, 
  ChevronRight, 
  AlertCircle,
  HelpCircle,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { api } from '../services/api.js';

export function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected Lead for AI details panel
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedLeadDetails, setSelectedLeadDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'new',
    value: '',
    source: 'Inbound Search'
  });
  const [submitting, setSubmitting] = useState(false);
  const [rescoringId, setRescoringId] = useState(null);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await api.leads.list();
      setLeads(data);
      if (data.length > 0 && !selectedLead) {
        selectLeadAction(data[0]);
      }
      setError(null);
    } catch (e) {
      console.error('[Leads] Fetch error:', e.message);
      setError('Could not retrieve leads from backend.');
    } finally {
      setLoading(false);
    }
  };

  const selectLeadAction = async (lead) => {
    try {
      setSelectedLead(lead);
      setLoadingDetails(true);
      const details = await api.leads.get(lead.id);
      setSelectedLeadDetails(details);
    } catch (e) {
      console.error('[Leads] Fetch details error:', e.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const openCreateModal = () => {
    setFormData({
      id: '',
      name: '',
      email: '',
      phone: '',
      company: '',
      status: 'new',
      value: '',
      source: 'Inbound Search'
    });
    setModalMode('create');
    setShowModal(true);
  };

  const openEditModal = (lead, e) => {
    e.stopPropagation();
    setFormData({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone || '',
      company: lead.company || '',
      status: lead.status,
      value: lead.value || '',
      source: lead.source || 'Inbound Search'
    });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (modalMode === 'create') {
        await api.leads.create(formData);
      } else {
        await api.leads.update(formData.id, formData);
      }
      setShowModal(false);
      await fetchLeads();
      // Reset details check
      if (selectedLead && formData.id === selectedLead.id) {
        const updated = leads.find(l => l.id === selectedLead.id);
        if (updated) selectLeadAction(updated);
      }
    } catch (err) {
      alert(err.message || 'Error saving lead records.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLead = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this lead?')) return;
    try {
      await api.leads.delete(id);
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead(null);
        setSelectedLeadDetails(null);
      }
      await fetchLeads();
    } catch (err) {
      alert(err.message || 'Failed to remove lead.');
    }
  };

  const handleRescore = async (id, e) => {
    e.stopPropagation();
    try {
      setRescoringId(id);
      const res = await api.leads.rescore(id);
      
      // Update local leads Array
      setLeads(prev => prev.map(l => l.id === id ? { ...l, ai_score: res.ai_score } : l));
      
      if (selectedLead && selectedLead.id === id) {
        setSelectedLeadDetails(prev => ({
          ...prev,
          ai_score: res.ai_score,
          ai_reasons: res.ai_reasons,
          ai_next_steps: res.ai_next_steps
        }));
      }
    } catch (err) {
      alert('Error run lead classifier: ' + err.message);
    } finally {
      setRescoringId(null);
    }
  };

  // Score styling helpers
  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--color-success)';
    if (score >= 50) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'var(--color-success-bg)';
    if (score >= 50) return 'var(--color-warning-bg)';
    return 'var(--color-danger-bg)';
  };

  // Filter and search computation
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '30px', alignItems: 'start' }}>
      
      {/* LEFT: Leads Directory */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        
        {/* Header Tools */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700 }}>Leads Scorer Console</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>AI conversion probability & score index metrics</p>
          </div>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} /> Add Lead
          </button>
        </div>

        {/* Filter Toolbar */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          
          {/* Search bar */}
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
            <input 
              type="text" 
              placeholder="Search leads, companies..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="glass-input"
              style={{ paddingLeft: '42px' }}
            />
          </div>

          {/* Status selector */}
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="glass-input" 
            style={{ width: 'fit-content', minWidth: '150px' }}
          >
            <option value="all">All Stages</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="won">Won / Success</option>
            <option value="lost">Lost</option>
          </select>
        </div>

        {/* Leads Table List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading directory profiles...</p>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <FileSpreadsheet size={40} style={{ marginBottom: '12px' }} />
            <p>No leads found matching your settings.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px 16px' }}>Lead Label</th>
                  <th style={{ padding: '12px 16px' }}>Est Value</th>
                  <th style={{ padding: '12px 16px' }}>Stage</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>AI Score</th>
                  <th style={{ padding: '12px 16px', textSquare: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map(lead => {
                  const isSelected = selectedLead && selectedLead.id === lead.id;
                  return (
                    <tr 
                      key={lead.id}
                      onClick={() => selectLeadAction(lead)}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.02)',
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(255,255,255,0.02)' : 'transparent',
                        transition: 'background 0.2s'
                      }}
                      className="lead-table-row"
                    >
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{lead.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{lead.company || lead.email}</div>
                      </td>
                      <td style={{ padding: '16px', fontWeight: 500 }}>
                        ${lead.value ? lead.value.toLocaleString() : '0'}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span className={`badge badge-${
                          lead.status === 'won' ? 'success' : 
                          lead.status === 'lost' ? 'danger' : 
                          lead.status === 'proposal' ? 'info' : 'warning'
                        }`}>
                          {lead.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                          background: getScoreBg(lead.ai_score),
                          color: getScoreColor(lead.ai_score)
                        }}>
                          {lead.ai_score}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn btn-secondarybtn-icon" 
                            style={{ padding: '6px', background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}
                            onClick={(e) => openEditModal(lead, e)}
                            title="Edit details"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            className="btn btn-secondarybtn-icon" 
                            style={{ padding: '6px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', animation: rescoringId === lead.id ? 'spin 1.5s infinite linear' : 'none' }}
                            onClick={(e) => handleRescore(lead.id, e)}
                            title="Recalculate lead score"
                          >
                            <RefreshCw size={14} />
                          </button>
                          <button 
                            className="btn btn-secondarybtn-icon" 
                            style={{ padding: '6px', background: 'transparent', border: 'none', color: '#fca5a5' }}
                            onClick={(e) => handleDeleteLead(lead.id, e)}
                            title="Delete lead"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RIGHT: AI Telemetry & Insights panel */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '100px' }}>
        
        {/* Panel wrapper */}
        {selectedLead ? (
          <div className="glass-panel" style={{ padding: '28px', borderLeft: `4px solid ${getScoreColor(selectedLead.ai_score)}` }}>
            
            {/* Header info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div>
                <span className="badge badge-info" style={{ marginBottom: '8px' }}>AI Assessment Profiler</span>
                <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem' }}>{selectedLead.name}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{selectedLead.company || 'Enterprise'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Score Index</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: getScoreColor(selectedLead.ai_score) }}>{selectedLead.ai_score}%</div>
              </div>
            </div>

            {loadingDetails ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '150px' }}>
                <RefreshCw size={20} className="animate-spin" style={{ color: 'var(--primary)', animation: 'spin 1.5s infinite linear' }} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* 1. Modeling explanation text */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                  <h5 style={{ fontSize: '0.85rem', color: 'var(--cyan)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Brain size={14} /> Conversion Rationale
                  </h5>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {selectedLeadDetails?.ai_reasons || 'Evaluating CRM events stream metrics to determine client purchase affinity...'}
                  </p>
                </div>

                {/* 2. AI suggestions list */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                  <h5 style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <ChevronRight size={14} /> Recommended Next Steps
                  </h5>
                  <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedLeadDetails?.ai_next_steps ? (
                      selectedLeadDetails.ai_next_steps.split(';').map((step, idx) => (
                        <li key={idx} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                          {step.trim()}
                        </li>
                      ))
                    ) : (
                      <li style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Log emails/calls touchpoints to trigger action planning recommendations.</li>
                    )}
                  </ul>
                </div>

                {/* 3. Basic demographic grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Email address</span>
                    <p style={{ fontWeight: 500, color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden' }}>{selectedLead.email}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Phone channel</span>
                    <p style={{ fontWeight: 500, color: '#fff' }}>{selectedLead.phone || 'Unavailable'}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Lead referral source</span>
                    <p style={{ fontWeight: 500, color: '#fff' }}>{selectedLead.source}</p>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Lead added</span>
                    <p style={{ fontWeight: 500, color: '#fff' }}>{new Date(selectedLead.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

              </div>
            )}

          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <HelpCircle size={32} style={{ margin: '0 auto 12px' }} />
            <p>Select a lead record to load mathematical ML telemetry predictions.</p>
          </div>
        )}
      </div>

      {/* CREATE/EDIT MODAL OVERLAY */}
      {showModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>
              <X size={20} />
            </button>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '24px' }}>
              {modalMode === 'create' ? 'Add New Client Prospect' : 'Modify Prospect Details'}
            </h3>

            <form onSubmit={handleFormSubmit}>
              
              <div className="form-group">
                <label htmlFor="lead-name" className="form-label">Full Name *</label>
                <input 
                  id="lead-name"
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                  className="glass-input" 
                  placeholder="e.g. Sandra Bullock"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label htmlFor="lead-email" className="form-label">Email Address *</label>
                  <input 
                    id="lead-email"
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleInputChange} 
                    required 
                    className="glass-input"
                    placeholder="e.g. sandra@bully.com"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lead-phone" className="form-label">Phone Number</label>
                  <input 
                    id="lead-phone"
                    type="text" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    className="glass-input"
                    placeholder="e.g. +1-415-555-0199"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label htmlFor="lead-company" className="form-label">Company Name</label>
                  <input 
                    id="lead-company"
                    type="text" 
                    name="company" 
                    value={formData.company} 
                    onChange={handleInputChange} 
                    className="glass-input"
                    placeholder="e.g. Hollywood Tech Inc"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lead-value" className="form-label">Est Contract Value ($)</label>
                  <input 
                    id="lead-value"
                    type="number" 
                    name="value" 
                    value={formData.value} 
                    onChange={handleInputChange} 
                    className="glass-input"
                    placeholder="e.g. 50000"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Lead Channel Source</label>
                  <select name="source" value={formData.source} onChange={handleInputChange} className="glass-input">
                    <option value="LinkedIn Outreach">LinkedIn Outreach</option>
                    <option value="Inbound Search">Inbound Search</option>
                    <option value="Webinar Attendee">Webinar Attendee</option>
                    <option value="Cold Email">Cold Email</option>
                    <option value="Referral">Referral</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Active CRM Stage</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="glass-input">
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="proposal">Proposal</option>
                    <option value="won">Won / Transferred</option>
                    <option value="lost">Lost</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? 'Calculating ML features...' : modalMode === 'create' ? 'Compile & Save Lead' : 'Commit Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
export default Leads;
