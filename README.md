# Enterprise AI-Augmented CRM System

State of the art Customer Relationship Management dashboard augmented with XGBoost lead scoring, churn prediction forecasting models, and automated email generation.

---

## 🌟 Key Functional Features
1. **Glassmorphism Dark UI**: Dashboard built with vanilla CSS tokens, Outfit typography, and Recharts Area/Gradient analytics.
2. **AI Lead Scoring**: Real-time evaluation of prospects' conversion probability (0-99%) using pipeline metrics and sources features.
3. **AI Churn Prediction**: Real-time evaluation of client retention risk, dynamically recalculated upon adding interactions.
4. **Smart AI Email Drafts**: Dynamic mail responder copy-wizard suggesting custom outreach based on customer statistics.
5. **Kanban Tracker Board**: Fully interactive pipeline manager allowing quick deal movements across stages.
6. **AI Telemetry Console**: Model registries monitoring with direct fits retraining (Admin privilege).

---

## 📂 System Directory Layout
- `/backend`: Express REST API Gateway, SQL SQLite handlers, and logger middlewares.
- `/frontend`: Vite React SPA dashboard, CSS styles setup, and client SDK services.
- `/ai-engine`: Python Flask intelligence microservice, ML XGBoost pipelines, and registry.
- `/database`: Migrations SQL schemas, SQL queries references, and seeder setups.
- `/docs`: Architecture mappings, setups files, and specifications.

---

## 🚀 Speed Run Settings

### 1. Install Workspace Packages
From root workspace:
```bash
npm run install:all
```

### 2. Launch Concurrently
```bash
npm run dev
```

*Port map: API Gateway running on `http://localhost:5000` | Frontend running on `http://localhost:5173`*

---

## 🔑 Demo Sandbox Accounts
- **Admin**: Username: `admin` | Password: `admin123` ( Retraining active )
- **Sales Agent**: Username: `sales` | Password: `sales123` ( Read/Write only )
