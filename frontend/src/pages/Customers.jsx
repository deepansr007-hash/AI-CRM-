import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  RefreshCw, 
  AlertTriangle, 
  Percent, 
  MessageSquare, 
  Plus,
  Mail,
  Copy,
  Check,
  Send,
  Calendar,
  X,
  UserPlus
} from 'lucide-react';
import { api } from '../services/api.js';

export function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected customer states
  const [selectedCust, setSelectedCust] = useState(null);
  const [selectedCustDetails, setSelectedCustDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Modal to add client record
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'active',
    LTV: ''
  });
  const [adding, setAdding] = useState(false);

  // Interaction logs details form
  const [interactionForm, setInteractionForm] = useState({
    type: 'note',
    direction: 'outgoing',
    description: ''
  });
  const [submittingInteraction, setSubmittingInteraction] = useState(false);

  // AI draft email wizard states
  const [showEmailWizard, setShowEmailWizard] = useState(false);
  const [emailContext, setEmailContext] = useState('lead_nurturing');
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [draftEmail, setDraftEmail] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await api.customers.list();
      setCustomers(data);
      if (data.length > 0 && !selectedCust) {
        selectCustAction(data[0]);
      }
      setError(null);
    } catch (e) {
      console.error('[Customers] Fetch error:', e.message);
      setError('Could not retrieve customer database.');
    } finally {
      setLoading(false);
    }
  };

  const selectCustAction = async (cust) => {
    try {
      setSelectedCust(cust);
      setLoadingDetails(true);
      const data = await api.customers.get(cust.id);
      setSelectedCustDetails(data);
    } catch (e) {
      console.error('[Customers] Detail fetch error:', e.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleAddInputChange = (e) => {
    const { name, value } = e.target;
    setAddForm(prev => ({ ...prev, [name]: value }));
  };

  const submitAddCustomer = async (e) => {
    e.preventDefault();
    try {
      setAdding(true);
      await api.customers.create(addForm);
      setShowAddModal(false);
      await fetchCustomers();
    } catch (err) {
      alert('Error creating customer: ' + err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleInteractionChange = (e) => {
    const { name, value } = e.target;
    setInteractionForm(prev => ({ ...prev, [name]: value }));
  };

  const submitInteraction = async (e) => {
    e.preventDefault();
    if (!interactionForm.description.trim()) return;
    try {
      setSubmittingInteraction(true);
      const res = await api.customers.addInteraction(selectedCust.id, interactionForm);
      
      // Update locally selected customer details, which triggers churn probability updates
      setSelectedCustDetails(prev => ({
        ...prev,
        churn_probability: res.churn_probability,
        ai_insights: res.ai_insights,
        interactions: [
          {
            id: Date.now(),
            parent_type: 'customer',
            parent_id: selectedCust.id,
            type: interactionForm.type,
            direction: interactionForm.direction,
            description: interactionForm.description,
            date: new Date().toISOString()
          },
          ...(prev.interactions || [])
        ]
      }));

      // Update customers list index
      setCustomers(prev => prev.map(c => 
        c.id === selectedCust.id 
          ? { ...c, churn_probability: res.churn_probability, ai_insights: res.ai_insights, last_interaction: new Date().toISOString() } 
          : c
      ));

      setInteractionForm(prev => ({ ...prev, description: '' }));
    } catch (err) {
      alert("Error adding interaction history: " + err.message);
    } finally {
      setSubmittingInteraction(false);
    }
  };

  const loadAI智能Email = async () => {
    try {
      setLoadingEmail(true);
      const payload = await api.customers.generateEmail(selectedCust.id, emailContext);
      setDraftEmail(payload);
      setCopied(false);
    } catch (err) {
      alert('Failed to generate smart script email: ' + err.message);
    } finally {
      setLoadingEmail(false);
    }
  };

  useEffect(() => {
    if (showEmailWizard && selectedCust) {
      loadAI智能Email();
    }
  }, [showEmailWizard, emailContext]);

  const copyToClipboard = () => {
    if (!draftEmail) return;
    const fullText = `Subject: ${draftEmail.subject}\n\n${draftEmail.body}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Color mappings for risk probability gauge
  const getRiskColor = (prob) => {
    if (prob >= 0.6) return 'var(--color-danger)';
    if (prob >= 0.2) return 'var(--color-warning)';
    return 'var(--color-success)';
  };

  const getRiskBg = (prob) => {
    if (prob >= 0.6) return 'var(--color-danger-bg)';
    if (prob >= 0.2) return 'var(--color-warning-bg)';
    return 'var(--color-success-bg)';
  };

  const filteredCustomers = customers.filter(cust => {
    const matchesSearch = 
      cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cust.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || cust.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '30px', alignItems: 'start' }}>
      
      {/* LEFT: Customer List */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        
        {/* Header toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700 }}>Client Retention Engine</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Churn probability estimation and customer logs</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <UserPlus size={16} /> Add Client
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="glass-input"
              style={{ paddingLeft: '42px' }}
            />
          </div>

          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="glass-input"
            style={{ width: 'fit-content', minWidth: '150px' }}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="at_risk">At Risk</option>
            <option value="churned">Cancelled</option>
          </select>
        </div>

        {/* Content list Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--primary)', animation: 'spin 1.5s infinite linear' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading customer accounts...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
            <Users size={40} style={{ marginBottom: '12px' }} />
            <p>No customer records found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredCustomers.map(cust => {
              const isSelected = selectedCust && selectedCust.id === cust.id;
              const probPercent = Math.round(cust.churn_probability * 100);
              
              return (
                <div 
                  key={cust.id}
                  onClick={() => selectCustAction(cust)}
                  className={`glass-panel interactive-card`}
                  style={{
                    padding: '18px 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderLeft: `4px solid ${getRiskColor(cust.churn_probability)}`,
                    background: isSelected ? 'rgba(255, 255, 255, 0.03)' : 'var(--bg-glass-card)'
                  }}
                >
                  <div>
                    <h4 style={{ fontWeight: 600, color: '#fff', fontSize: '1rem' }}>{cust.name}</h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginRight: '16px' }}>{cust.company}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--cyan)', fontWeight: 500 }}>LTV: ${cust.LTV.toLocaleString()}</span>
                  </div>

                  {/* Churn index indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Churn Risk</span>
                      <div style={{ fontWeight: 700, color: getRiskColor(cust.churn_probability), fontSize: '0.95rem' }}>
                        {probPercent}%
                      </div>
                    </div>
                    
                    <span className={`badge badge-${
                      cust.status === 'active' ? 'success' :
                      cust.status === 'at_risk' ? 'warning' : 'danger'
                    }`}>
                      {cust.status === 'at_risk' ? 'at risk' : cust.status}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* RIGHT: Selected Customer Details & Churn Telemetry panel */}
      <div>
        {selectedCust ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'sticky', top: '100px' }}>
            
            {/* Churn assessment panel */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <span className="badge badge-warning" style={{ marginBottom: '8px' }}>Forecasting telemetry</span>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem' }}>{selectedCust.name}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{selectedCust.email}</p>
                </div>
                
                <div style={{
                  background: getRiskBg(selectedCust.churn_probability),
                  border: `1px solid ${getRiskColor(selectedCust.churn_probability)}`,
                  padding: '8px 12px',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', uppercase: 'true' }}>Churn probability</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: getRiskColor(selectedCust.churn_probability) }}>
                    {(selectedCust.churn_probability * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {loadingDetails ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px' }}>
                  <RefreshCw size={18} className="animate-spin" style={{ color: 'var(--primary)', animation: 'spin 1.5s infinite linear' }} />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* AI insights block */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                    <h5 style={{ fontSize: '0.85rem', color: 'var(--coral)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <AlertTriangle size={14} /> Churn Rationale & Insights
                    </h5>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                      {selectedCustDetails?.ai_insights || 'No warning telemetry loaded.'}
                    </p>
                  </div>

                  {/* Smart Email Generator Button */}
                  <button className="btn btn-secondary" style={{ width: '100%', gap: '8px' }} onClick={() => setShowEmailWizard(true)}>
                    <Mail size={14} /> Draft AI Agent Response
                  </button>

                </div>
              )}
            </div>

            {/* Interaction history panel */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1rem', marginBottom: '16px' }}>Interaction logs</h4>
              
              {/* Add Interaction Log */}
              <form onSubmit={submitInteraction} style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {/* Type */}
                  <select name="type" value={interactionForm.type} onChange={handleInteractionChange} className="glass-input" style={{ flex: 1, padding: '8px' }}>
                    <option value="note">Internal note</option>
                    <option value="call">Call log</option>
                    <option value="email">Email outbound</option>
                    <option value="meeting">Video Demo Meeting</option>
                  </select>
                  <select name="direction" value={interactionForm.direction} onChange={handleInteractionChange} className="glass-input" style={{ flex: 1, padding: '8px' }}>
                    <option value="outgoing">Outgoing</option>
                    <option value="incoming">Incoming</option>
                  </select>
                </div>
                <textarea 
                  name="description" 
                  value={interactionForm.description}
                  onChange={handleInteractionChange}
                  placeholder="Type summary details (e.g. called client about setup errors...)" 
                  rows={2}
                  required
                  className="glass-input"
                  style={{ fontSize: '0.8rem', resize: 'none' }}
                />
                <button type="submit" disabled={submittingInteraction} className="btn btn-primary" style={{ padding: '8px', fontSize: '0.8rem' }}>
                  {submittingInteraction ? 'Logging event...' : 'Save and recalculate churn'}
                </button>
              </form>

              {/* Interaction List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
                {selectedCustDetails?.interactions?.map((log) => (
                  <div key={log.id} style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.02)', paddingBottom: '10px', gap: '10px', alignItems: 'flex-start' }}>
                    <div style={{
                      background: log.type === 'call' ? 'rgba(16,185,129,0.1)' : log.type === 'email' ? 'rgba(59,130,246,0.1)' : 'rgba(245,158,11,0.1)',
                      padding: '6px',
                      borderRadius: '6px'
                    }}>
                      <MessageSquare size={13} color={log.type==='call'?'var(--color-success)':log.type==='email'?'var(--color-info)':'var(--color-warning)'} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{log.type} ({log.direction})</span>
                        <span>{new Date(log.date).toLocaleDateString()}</span>
                      </div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>{log.description}</p>
                    </div>
                  </div>
                ))}
                {selectedCustDetails?.interactions?.length === 0 && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>No interactions recorded yet.</p>
                )}
              </div>

            </div>

          </div>
        ) : (
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Users size={32} style={{ margin: '0 auto 12px' }} />
            <p>Select a client profile to view retention telemetrics & smart tools.</p>
          </div>
        )}
      </div>

      {/* ADD CUSTOMER MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content">
            <button className="modal-close" onClick={() => setShowAddModal(false)}>
              <X size={20} />
            </button>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '24px' }}>
              Add Active Customer Account
            </h3>
            <form onSubmit={submitAddCustomer}>
              <div className="form-group">
                <label className="form-label">Client Name *</label>
                <input type="text" name="name" required value={addForm.name} onChange={handleAddInputChange} className="glass-input" placeholder="e.g. Jeff Bezos" />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input type="email" name="email" required value={addForm.email} onChange={handleAddInputChange} className="glass-input" placeholder="e.g. jeff@amazon.com" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Phone Channel</label>
                  <input type="text" name="phone" value={addForm.phone} onChange={handleAddInputChange} className="glass-input" placeholder="e.g. +1-555-0815" />
                </div>
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input type="text" name="company" value={addForm.company} onChange={handleAddInputChange} className="glass-input" placeholder="e.g. Amazon Inc" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Customer Status</label>
                  <select name="status" value={addForm.status} onChange={handleAddInputChange} className="glass-input">
                    <option value="active">Active (Onboarded)</option>
                    <option value="at_risk">At Risk (Proactive Warning)</option>
                    <option value="churned">Cancelled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Lifetime Value / ARR ($)</label>
                  <input type="number" name="LTV" value={addForm.LTV} onChange={handleAddInputChange} className="glass-input" placeholder="e.g. 150000" />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" disabled={adding} className="btn btn-primary">
                  {adding ? 'Creating...' : 'Assess & Onboard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI SMART EMAIL DRAFT WIZARD MODAL */}
      {showEmailWizard && selectedCust && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content" style={{ maxWidth: '650px' }}>
            <button className="modal-close" onClick={() => setShowEmailWizard(false)}>
              <X size={20} />
            </button>
            
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Send size={18} color="var(--primary)" /> Smart AI Email Assistant
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Select target context email. AI generates custom template based on client's usage telemetry.
            </p>

            <div className="form-group">
              <label className="form-label">Target Template Context</label>
              <select 
                value={emailContext} 
                onChange={e => setEmailContext(e.target.value)} 
                className="glass-input"
              >
                <option value="lead_nurturing">Standard Lead Nurturing & Callback invitation</option>
                <option value="retention_save">At-Risk Retention checkup & Engineering support offer</option>
              </select>
            </div>

            {loadingEmail ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '180px', gap: '12px' }}>
                <RefreshCw size={20} className="animate-spin" style={{ color: 'var(--primary)', animation: 'spin 1.5s infinite linear' }} />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Drafting email script...</p>
              </div>
            ) : draftEmail ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Generated Fields summary */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Subject line</span>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{draftEmail.subject}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Email Template Body</span>
                    <pre style={{ 
                      fontSize: '0.8rem', 
                      color: 'var(--text-secondary)', 
                      whiteSpace: 'pre-wrap', 
                      fontFamily: 'var(--font-body)',
                      lineHeight: 1.5,
                      marginTop: '8px'
                    }}>{draftEmail.body}</pre>
                  </div>
                </div>

                {/* Wizard toolbar */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button className="btn btn-secondary" onClick={() => loadAI智能Email()}>
                    <RefreshCw size={14} /> Regenerate
                  </button>
                  <button className="btn btn-primary" onClick={copyToClipboard} style={{ gap: '8px' }}>
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Copied script!' : 'Copy to clipboard'}
                  </button>
                </div>

              </div>
            ) : null}

          </div>
        </div>
      )}

    </div>
  );
}
export default Customers;
