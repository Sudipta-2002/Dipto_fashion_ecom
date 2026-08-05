# Full-Stack React Project

This project is organized into two main parts: **`frontend`** and **`backend`**.

## 📁 Directory Structure

```
ECOM/
├── backend/            # Express Node.js Server
│   ├── .env            # Environment variables (PORT=5000)
│   ├── server.js       # Main server entry point
│   └── package.json    # Backend dependencies (express, cors, dotenv)
├── frontend/           # React App (built with Vite)
│   ├── src/            # React components & styles
│   ├── index.html      # HTML entry point
│   └── package.json    # Frontend dependencies (react, react-dom)
├── package.json        # Root package file for running both servers together
└── README.md
```

---

## 🚀 Getting Started

### 1. Install All Dependencies

From the root project directory:
```bash
npm run install:all
```
*(Or navigate into `frontend` and `backend` folders separately and run `npm install` inside each).*

---

### 2. Run the Application

You can start both frontend and backend concurrently from the root folder:

```bash
npm start
```

This will run:
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`

---

### 🏃 Running Parts Individually

If you prefer to run them in separate terminal windows:

#### Start Backend Only:
```bash
npm run dev:backend
# OR
cd backend
npm run dev
```

#### Start Frontend Only:
```bash
npm run dev:frontend
# OR
cd frontend
npm run dev
```

---

## 🔗 API Endpoints (Backend)

- `GET /api/health` - Health check status
- `GET /api/data` - Sample dataset for React frontend
