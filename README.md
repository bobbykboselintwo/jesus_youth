# ✝ KCYM VITAMIN C PAROPPADY registration Web App

A modern, full-stack student registration web application for KCYM VITAMIN C PAROPPADY registration, featuring a **React.js (Vite)** frontend and a **Python FastAPI** backend connected to **MongoDB**.

---

## 🎨 Visual Identity & Color System
The app adheres strictly to the **60 / 30 / 5 / 5 Rule**:
- **🔴 Red (60%)**: Primary brand identity — App background gradient, sticky header, progress bar, primary CTA navigation buttons (`#991b1b`, `#dc2626`).
- **⚪🟡 White & Sacred Gold (30%)**: Card surfaces, warm ivory page background, input fields, interactive chip highlights, success celebration (`#ffffff`, `#fffdf7`, `#f59e0b`).
- **🟣 Liturgical Purple (5%)**: Consent card selection state, focus highlights (`#6d28d9`).
- **⚫ Black Ink Text**: Typography, body text, form field labels for mobile readability (`#0a0a0a`, `#171717`).

---

## 🏗 Architecture Overview

```
Jesus Youth/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application, CORS middleware, lifespan
│   │   ├── config.py            # Settings (MONGODB_URL, DB_NAME, CORS)
│   │   ├── database.py          # Motor Async MongoDB client setup
│   │   ├── models.py            # Pydantic schemas for 28 student attributes
│   │   └── routes/
│   │       └── registration.py  # POST /api/register, GET /api/registrations, GET /api/export-csv
│   ├── requirements.txt         # fastapi, uvicorn, motor, pydantic, python-dotenv
│   └── .env.example             # MONGODB_URL template
├── src/                         # React Frontend (Vite)
│   ├── App.jsx                  # Wizard state manager & API submit handler
│   ├── components/              # 5-step form wizard components & Admin Dashboard
│   ├── index.css                # 44 CSS design tokens
│   └── App.css                  # Mobile-first styles
└── README.md
```

---

## 🐍 Python FastAPI + MongoDB Setup

### 1. Configure MongoDB Connection String
Copy `backend/.env.example` to `backend/.env`:
```bash
cp backend/.env.example backend/.env
```
Edit `backend/.env` and paste your MongoDB connection string (Atlas or local):
```env
MONGODB_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
DB_NAME=jesuyouth
PORT=8000
```

### 2. Install Dependencies & Start FastAPI Server
```bash
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start Uvicorn server
uvicorn app.main:app --reload --port 8000
```
FastAPI documentation will be available at:
- **Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## ⚛ React.js Frontend Setup

```bash
# 1. Install frontend dependencies
npm install

# 2. Configure API Endpoint in .env
cp .env.example .env
# Edit .env:
# VITE_API_BASE_URL=http://localhost:8000

# 3. Start React Development Server
npm run dev

# 4. Production Build
npm run build
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/register` | Submit student registration. Validates 28 fields, checks for duplicate phone/email, and saves to MongoDB. |
| `GET` | `/api/registrations` | Fetch registrations with optional search filtering (`?q=name_or_parish`). |
| `GET` | `/api/export-csv` | Direct download of all registrations as a formatted CSV file. |
| `GET` | `/api/health` | Service health check. |
