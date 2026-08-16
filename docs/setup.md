# AI CRM Enterprise System Setup Guide

Follow these steps to initialize and launch the multi-layered CRM platform on your local machine.

## Prerequisites
- **Node.js**: v18.0.0 or higher (v24.0.0 recommended)
- **NPM**: v9.0.0 or higher
- **Python**: v3.10.0 or higher (required only if running the standalone Python intelligence microservice)

---

## Standard Run (Local Development)

### 1. Install Workspace Dependencies
Run the unified installer script from the root workspace:
```bash
npm run install:all
```
This automatically initiates package installations within both the `/backend` and `/frontend` folders.

### 2. Start Services Concurrently
From the root workspace directory, run:
```bash
npm run dev
```
This boots both nodes concurrently:
- **Express Backend**: Listening on `http://localhost:5000` (autodetects SQLite or runs fallback database)
- **React Frontend**: Serves Vite app on `http://localhost:5173`

---

## Standalone Python AI Engine Service (Optional)

If you wish to run the real Python predictive models rather than the local Express fallback estimators:

### 1. Install Dependencies
```bash
cd ai-engine
pip install flask
```

### 2. Launch Inference Service
```bash
python inference/app.py
```
*Port mapping: Defaults to `8000`. The Express server automatically routes data payloads here if online.*

---

## Logins for Sandbox Testing
Use these pre-populated credentials on the portal page:

| Username | Password | Role / Access level |
| :--- | :--- | :--- |
| **admin** | `admin123` | Master Controller (Retraining active) |
| **sales** | `sales123` | Sales Agent (Read/Write CRM profiles) |
