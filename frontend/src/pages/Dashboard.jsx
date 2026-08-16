import React, { useEffect, useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  BrainCircuit, 
  PlusCircle, 
  RefreshCw, 
  ExternalLink,
  Users2,
  AlertOctagon,
  CheckCircle2,
  CircleDot
} from 'lucide-react';
import { api } from '../services/api.js';

export function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.dashboard.getStats();
      setStats(data);
      setError(null);
    } catch (e) {
      console.error('[Dashboard] Stats fetch error:', e.message);
      setError('Could not retrieve dashboard statistics. Ensure SQL API server is active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', gap: '12px' }}>
        <RefreshCw size={24} className="animate-spin" style={{ color: 'var(--primary)', animation: 'spin 1.5s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Compiling intelligence aggregates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', borderColor: 'var(--color-danger)' }}>
        <AlertOctagon size={48} color="var(--color-danger)" style={{ margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--text-primary)', marginBottom: '16px', fontWeight: 600 }}>{error}</p>
        <button className="btn btn-secondary" onClick={fetchStats}>
          <RefreshCw size={14} /> Retry Connection
        </button>
      </div>
    );
  }

  const { kpis, charts, aiModelsStats, recentActivity } = stats;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* 1. KPIs Aggregated Metrics Cards */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        
        {/* KPI: Leads AI scoring index */}
        <div className="glass-panel interactive-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', marginBottom: '8px' }}>Leads Assessment</p>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, margin: '4px 0' }}>{kpis.totalLeads}</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <BrainCircuit size={14} /> Avg score: {kpis.averageLeadScore}%
            </p>
          </div>
          <div style={{ background: 'rgba(99, 102, 241, 0.12)', padding: '16px', borderRadius: '12px' }}>
            <BrainCircuit size={28} color="var(--primary)" />
          </div>
        </div>

        {/* KPI: Revenue Retention (ARR/LTV) */}
        <div className="glass-panel interactive-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', marginBottom: '8px' }}>Active Customers & ARR</p>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, margin: '4px 0' }}>
              ${kpis.totalArr.toLocaleString()}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--cyan)' }}>
              {kpis.activeCustomers} Clients under CS management
            </p>
          </div>
          <div style={{ background: 'rgba(6, 182, 212, 0.12)', padding: '16px', borderRadius: '12px' }}>
            <Users2 size={28} color="var(--cyan)" />
          </div>
        </div>

        {/* KPI: Sales weighted pipeline */}
        <div className="glass-panel interactive-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', marginBottom: '8px' }}>Deals weighted pipeline</p>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, margin: '4px 0' }}>
              ${kpis.weightedPipeline.toLocaleString()}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Raw pipeline: ${kpis.pipelineValue.toLocaleString()}
            </p>
          </div>
          <div style={{ background: 'rgba(244, 63, 94, 0.12)', padding: '16px', borderRadius: '12px' }}>
            <TrendingUp size={28} color="var(--coral)" />
          </div>
        </div>

      </section>

      {/* 2. Advanced Analytics Charts */}
      <section style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Deal stages area progression */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '24px' }}>Deals pipeline size by stage</h4>
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.dealsByStage}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="stage" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v)=>`$${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-glass)', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff', fontWeight: 600 }}
                  formatter={(value)=> [`$${value.toLocaleString()}`, 'Pipeline Value']}
                />
                <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Churn risk breakdown pie */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '16px' }}>Retention Risk Breakdown</h4>
          <div style={{ flex: 1, position: 'relative', minHeight: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts.crmCustomerHealth}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {charts.crmCustomerHealth.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-glass)', borderRadius: '8px' }}
                  formatter={(v)=>[v, 'Customers']}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Display labels legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
              {charts.crmCustomerHealth.map((row, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: row.color }}></span>
                    <span style={{ color: 'var(--text-secondary)' }}>{row.name}</span>
                  </div>
                  <span style={{ fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </section>

      {/* 3. Bottom Activities & AI Models monitoring grids */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(430px, 1fr))', gap: '24px' }}>
        
        {/* Activity feed logs list */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '24px' }}>Recent activities log</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recentActivity.map((log) => {
              let dotColor = 'var(--color-info)';
              if (log.severity === 'warning') dotColor = 'var(--color-warning)';
              if (log.severity === 'error') dotColor = 'var(--color-danger)';
              return (
                <div key={log.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ marginTop: '5px' }}>
                    <CircleDot size={12} color={dotColor} fill={dotColor} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                      <span style={{ fontWeight: 600, color: 'var(--cyan)', marginRight: '6px' }}>[{log.category}]</span> 
                      {log.message}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
            {recentActivity.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '16px' }}>
                No events recorded.
              </p>
            )}
          </div>
        </div>

        {/* AI ML Models Registry & performance checklist */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, marginBottom: '20px' }}>Active AI model registry</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {aiModelsStats.map((model) => (
              <div key={model.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div>
                    <h5 style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{model.model_name}</h5>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Version {model.version} | Fitted {new Date(model.last_trained).toLocaleDateString()}</span>
                  </div>
                  <span className="badge badge-success">
                    <CheckCircle2 size={12} /> {model.status}
                  </span>
                </div>
                
                {/* Accuracy meter bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    <span>Target Accuracy Score</span>
                    <span style={{ fontWeight: 600, color: 'var(--cyan)' }}>{(model.accuracy * 100).toFixed(1)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${model.accuracy * 100}%`, height: '100%', background: 'linear-gradient(to right, var(--primary), var(--cyan))', borderRadius: '3px' }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

    </div>
  );
}
export default Dashboard;
