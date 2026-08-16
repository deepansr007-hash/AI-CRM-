import bcrypt from 'bcryptjs';

// Pre-hashed passwords for faster/error-free launch
// admin123 -> $2a$10$Z3sC7Zis2P9W4fI1.sA0eeL8x.LhXfU16S.R33fepqMxtE0Z20vA.
// sales123 -> $2a$10$GhyH5w2aV6z6M6aXk07eQe1rE92Z1.J33sepqMxtE0Z20vA.1232a

export const mockUsers = [
  {
    id: 1,
    username: "admin",
    password: bcrypt.hashSync("admin123", 10),
    email: "admin@aicrm.com",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150"
  },
  {
    id: 2,
    username: "sales",
    password: bcrypt.hashSync("sales123", 10),
    email: "sales@aicrm.com",
    role: "sales",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
  }
];

export const mockLeads = [
  {
    id: 1,
    name: "Sarah Jenkins",
    email: "sarah.jenkins@lumina-tech.io",
    phone: "+1-555-0199",
    company: "Lumina Tech Solutions",
    status: "proposal",
    value: 48000.0,
    source: "Inbound Search",
    ai_score: 92,
    ai_reasons: "High engagement on website pricing page, downloaded whitepaper on security, matches Ideal Customer Profile (ICP) for enterprise tier.",
    ai_next_steps: "Send customized security compliance packet; schedule follow-up presentation for executive team.",
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(), // 5 days ago
    updated_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString()
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "mchen@vertex-retail.com",
    phone: "+1-555-0142",
    company: "Vertex Retail Group",
    status: "contacted",
    value: 29000.0,
    source: "LinkedIn Outreach",
    ai_score: 68,
    ai_reasons: "Responded to cold message; company size is rapid growth (150+ staff); pain point related to outdated CRM scales, but decision authority is unconfirmed.",
    ai_next_steps: "Call back to confirm budget authority and verify technical stack compatibility.",
    created_at: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString()
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    email: "e.rodriguez@biopharm-global.com",
    phone: "+1-555-0187",
    company: "BioPharm Global Inc",
    status: "new",
    value: 85000.0,
    source: "Webinar Attendee",
    ai_score: 87,
    ai_reasons: "Director of CRM systems attended full 60-min AI in Operations webinar. Visited product integration page 4 times in the past 24 hours.",
    ai_next_steps: "Send personalized email with webinar recording link and invite to custom 1-on-1 demo.",
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: 4,
    name: "David Kross",
    email: "david@kross-logistics.de",
    phone: "+49-89-98213",
    company: "Kross Logistics SE",
    status: "qualified",
    value: 62000.0,
    source: "Referral",
    ai_score: 81,
    ai_reasons: "Introduced by existing client. Active project timeline of 60 days. System must support multi-currency and GDPR compliance natively.",
    ai_next_steps: "Align with EMEA agent; draft tailored pilot agreement covering GDPR hosting conditions.",
    created_at: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24 * 6).toISOString()
  },
  {
    id: 5,
    name: "Aisha Patel",
    email: "apatel@quantum-finance.co.uk",
    phone: "+44-20-7946-0925",
    company: "Quantum Financial Systems",
    status: "won",
    value: 120000.0,
    source: "Partner Channel",
    ai_score: 95,
    ai_reasons: "Completed successfully. Final signed agreement, initial retainer paid. High affinity to upgrade in Q4 to advanced AI workflow package.",
    ai_next_steps: "Handover to Customer Success department; set up automated onboarding email sequences.",
    created_at: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString()
  },
  {
    id: 6,
    name: "Robert Vance",
    email: "rvance@vancerefrigeration.com",
    phone: "+1-555-0105",
    company: "Vance Refrigeration",
    status: "lost",
    value: 15000.0,
    source: "Cold Email",
    ai_score: 24,
    ai_reasons: "Expressed budget constraints (< $5k total). Disengaged from initial demo midway. Competency is aligned towards local manual tools.",
    ai_next_steps: "Add to low-priority nurture list; send automatic bi-monthly business tips newsletter.",
    created_at: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
  }
];

export const mockCustomers = [
  {
    id: 1,
    lead_id: 5,
    name: "Aisha Patel",
    email: "apatel@quantum-finance.co.uk",
    phone: "+44-20-7946-0925",
    company: "Quantum Financial Systems",
    status: "active",
    churn_probability: 0.04,
    ai_insights: "Ideal user adoption rate. Active seats: 95/100. Frequent use of reporting metrics. Recommend offering advanced analytics expansion option.",
    LTV: 120000.0,
    last_interaction: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hrs ago
    created_at: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString()
  },
  {
    id: 2,
    lead_id: null,
    name: "Gregory House",
    email: "ghouse@princeton-plainsboro.org",
    phone: "+1-555-0815",
    company: "Princeton-Plainsboro Diagnostics",
    status: "at_risk",
    churn_probability: 0.62,
    ai_insights: "Declining daily active usage (-45% over the past 30 days). Primary user admin departed company last week. Support tickets open for > 5 days without response.",
    LTV: 94000.0,
    last_interaction: new Date(Date.now() - 3600000 * 24 * 8).toISOString(), 
    created_at: new Date(Date.now() - 3600000 * 24 * 180).toISOString(), // 6 months ago
    updated_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString()
  },
  {
    id: 3,
    lead_id: null,
    name: "Marcus Aurelius",
    email: "marcus@rome-holdings.it",
    phone: "+39-06-6982",
    company: "Rome Holdings Corp",
    status: "active",
    churn_probability: 0.12,
    ai_insights: "Steady growth, system health status looks excellent. However, custom reports load speed has hit threshold due to huge database size. Recommended tuning index queries.",
    LTV: 245000.0,
    last_interaction: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 365).toISOString(), // 1 yr ago
    updated_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: 4,
    lead_id: null,
    name: "Janice Litman",
    email: "janice@ohmygod-studios.com",
    phone: "+1-555-0909",
    company: "OMG Marketing Agency",
    status: "churned",
    churn_probability: 0.98,
    ai_insights: "Formally cancelled service subscription due to acquisition by larger company using Salesforce. Clean account database exported safely.",
    LTV: 35000.0,
    last_interaction: new Date(Date.now() - 3600000 * 24 * 45).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 120).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24 * 45).toISOString()
  }
];

export const mockDeals = [
  {
    id: 1,
    lead_id: 1,
    title: "Enterprise Licensing Agreement",
    value: 48000.0,
    stage: "negotiation",
    close_rate: 0.85,
    ai_probability: 0.88,
    close_date: new Date(Date.now() + 3600000 * 24 * 15).toISOString().split('T')[0], // 15 days in future
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24 * 1).toISOString()
  },
  {
    id: 2,
    lead_id: 2,
    title: "Retail CRM Integration Pilot",
    value: 29000.0,
    stage: "demo",
    close_rate: 0.40,
    ai_probability: 0.52,
    close_date: new Date(Date.now() + 3600000 * 24 * 45).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24 * 4).toISOString()
  },
  {
    id: 3,
    lead_id: 3,
    title: "BioPharm Global Custom Solution",
    value: 85000.0,
    stage: "discovery",
    close_rate: 0.20,
    ai_probability: 0.76,
    close_date: new Date(Date.now() + 3600000 * 24 * 60).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: 4,
    lead_id: 4,
    title: "Kross Logistics Multi-Country Setup",
    value: 62000.0,
    stage: "contract",
    close_rate: 0.90,
    ai_probability: 0.94,
    close_date: new Date(Date.now() + 3600000 * 24 * 8).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24 * 6).toISOString()
  }
];

export const mockInteractions = [
  {
    id: 1,
    parent_type: "lead",
    parent_id: 1,
    type: "email",
    direction: "outgoing",
    description: "Sent enterprise security specification files and answered compliance questions on encryption standards.",
    date: new Date(Date.now() - 3600000 * 24 * 1).toISOString()
  },
  {
    id: 2,
    parent_type: "lead",
    parent_id: 1,
    type: "call",
    direction: "incoming",
    description: "Sarah called to elaborate on the user count. They might require 140 seats instead of 100 on initial setup. Requested updated quote.",
    date: new Date(Date.now() - 3600000 * 24 * 2).toISOString()
  },
  {
    id: 3,
    parent_type: "lead",
    parent_id: 2,
    type: "meeting",
    direction: "outgoing",
    description: "Conducted initial pipeline demo. Stated interest in integration with their logistics database. Decision-maker was not present.",
    date: new Date(Date.now() - 3600000 * 24 * 4).toISOString()
  },
  {
    id: 4,
    parent_type: "customer",
    parent_id: 1,
    type: "call",
    direction: "outgoing",
    description: "Onboarding kick-off call with Aisha and the support manager. Set milestone calendar.",
    date: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 5,
    parent_type: "customer",
    parent_id: 2,
    type: "email",
    direction: "outgoing",
    description: "Sent support follow-up alerting about multiple open tickets and checking if they need a dedicated trainer.",
    date: new Date(Date.now() - 3600000 * 24 * 5).toISOString()
  }
];

export const mockMetrics = [
  {
    model_name: "lead_scoring_xgb",
    version: "v2.1.4",
    accuracy: 0.942,
    precision: 0.915,
    recall: 0.938,
    f1_score: 0.926,
    last_trained: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    status: "active"
  },
  {
    model_name: "churn_predictor_ensemble",
    version: "v1.8.8",
    accuracy: 0.884,
    precision: 0.822,
    recall: 0.891,
    f1_score: 0.855,
    last_trained: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    status: "active"
  },
  {
    model_name: "sales_forecaster_lstm",
    version: "v3.0.1",
    accuracy: 0.911,
    precision: 0.895,
    recall: 0.904,
    f1_score: 0.899,
    last_trained: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    status: "active"
  }
];
