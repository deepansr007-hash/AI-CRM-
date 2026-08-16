# 📅 Pulse CRM : Intelligent Sales & Customer Suite

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/AI Engine-Python%20%2B%20XGBoost-3776AB.svg)](https://www.python.org/)

**Pulse CRM** is a comprehensive, full-stack enterprise digital platform for intelligent lead scoring, customer retention management, deal tracking, and AI-assisted customer communication. Designed and implemented with modern decoupled architecture (Express.js, React 19 + Vite, Python ML Engine) and modern, responsive visual glassmorphism UI design aesthetics.

---

## 💻 DEMO AND GITHUB REPOSITORY LINKS

> [!IMPORTANT]
> **GitHub Repository:** [https://github.com/deepansr007-hash/AI-CRM-.git](https://github.com/deepansr007-hash/AI-CRM-.git)  
> **MongoDB URI:** `mongodb+srv://deepan:124UCS022@cluster0.ryhui3i.mongodb.net/?appName=Cluster0`

### 🔑 Pre-configured Accounts:
- **Admin Controller:** Username: `admin` | Password: `admin123` (Full system access & ML model monitoring)
- **Sales Manager:** Username: `sales` | Password: `sales123` (Deals management & lead interactions)

---

## 1. PROJECT ARCHITECTURE

### TECHNICAL ARCHITECTURE
The application follows a decoupled multi-tier architecture:

```text
+-----------------------------------------------------------------------------------+
|                                 FRONTEND LAYER                                    |
|  - React 19 + Vite SPA                                                            |
|  - Modern Responsive Glassmorphism Design Tokens & CSS System                     |
|  - Custom Auth & Navigation Routing                                               |
|  - Lucide React Iconography & Recharts Telemetry Visualizations                   |
|  - Pages: Dashboard, Lead Scorer, Deals Tracker, Customer Retention,              |
|         AI Monitoring, Login                                                      |
+-----------------------------------------+-----------------------------------------+
                                          | REST API (HTTP / JSON / JWT)
                                          v
+-----------------------------------------------------------------------------------+
|                                 BACKEND LAYER                                     |
|  - Node.js & Express.js REST API Server                                           |
|  - JWT Authentication & Bcrypt Hashing Middleware                                 |
|  - SQLite3 / MongoDB Database Adapter Integration                                 |
|  - Controllers: authController, leadController, dealController,                   |
|                 customerController, aiController                                  |
+-----------------------------------------+-----------------------------------------+
                                          | REST / Python Subprocess
                                          v
+-----------------------------------------------------------------------------------+
|                                AI ENGINE LAYER                                    |
|  - Python Flask Microservice & ML Model Registry                                  |
|  - XGBoost Classifier (Lead Scoring v2.1.4)                                       |
|  - Random Forest & Logistic Regression Ensemble (Churn Risk v1.8.8)               |
|  - Smart Email Responder Generation Wizard                                        |
+-----------------------------------------------------------------------------------+
```

---

## 2. DATA SCHEMA & ER DIAGRAM

```text
+-------------------+       1:N       +-------------------+
|       USERS       | <-------------> |       LEADS       |
| - id              |                 | - id              |
| - username        |                 | - name, email     |
| - password_hash   |                 | - score           |
| - role            |                 | - status          |
+-------------------+                 +-------------------+
          |                                     |
          | 1:N                                 | 1:1
          v                                     v
+-------------------+                 +-------------------+
|       DEALS       |                 |     CUSTOMERS     |
| - id              |                 | - id              |
| - title, amount   |                 | - company_name    |
| - stage           |                 | - churn_risk      |
+-------------------+                 +-------------------+
```

---

## 3. FEATURES

- 🎯 **AI Lead Scoring**: Real-time evaluation of prospects' conversion probability (0-99%) powered by ML XGBoost scoring models.
- 📉 **AI Churn Prediction**: Automated client retention risk analysis dynamically updated based on interaction logs and activity patterns.
- ✉️ **Smart AI Email Wizard**: Instant automated email responder generation tailored to prospect profile data and sales status.
- 📊 **Interactive Deals Kanban**: Dynamic pipeline management allowing seamless tracking and movement across sales pipeline stages.
- 🛡️ **Unified Admin Console**: Monitor system telemetry, model retraining status, user roles, and platform analytics.

---

## 4. ROLES AND RESPONSIBILITIES

- **Sales Manager (User)**: Browse leads, view AI conversion probabilities, update deal stages, generate smart AI emails, and track customer health metrics.
- **Admin Controller**: Access the administrative console, inspect model retraining parameters, manage user accounts, and oversee system performance.

---

## 5. USER FLOW

```text
[ Visitor / Agent ]
       |
       v
[ Login Page ] ---> Authenticate Credentials (admin / sales)
       |
       v
[ Pulse CRM Dashboard ]
       |
       +---> [ Lead Scorer ] --------------> Run XGBoost AI Lead Evaluation
       |
       +---> [ Deals Tracker ] ------------> Manage Pipeline & Stage Movements
       |
       +---> [ Customer Retention ] -------> Check Churn Risk & Generate AI Email
       |
       +---> [ AI Monitoring ] ------------> Inspect Retraining & System Health
```

---

## 🛠️ GETTING STARTED

### 1. Clone the Repository
```bash
git clone https.github.com/deepansr007-hash/AI-CRM-.git
cd AI-CRM-
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Launch Development Servers
```bash
npm run dev
```

*Frontend will run on `http://localhost:5173` | Backend API running on `http://localhost:5000`*

---

## 📄 LICENSE

This project is licensed under the **MIT License**.
