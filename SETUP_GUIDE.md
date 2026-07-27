# EcoVision AI – Complete Setup Guide

## System Architecture

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────────┐
│   React Frontend    │────▶│  Node.js Backend     │────▶│  Python AI Engine   │
│   Port 5173 (dev)   │     │  Port 5000           │     │  Port 8000          │
│   Vite + Tailwind   │     │  Express + MongoDB   │     │  FastAPI + YOLOv8   │
└─────────────────────┘     └──────────────────────┘     └─────────────────────┘
                                      │                           │
                                      ▼                           ▼
                            ┌──────────────────┐       ┌──────────────────┐
                            │    MongoDB        │       │    Redis         │
                            │    Port 27017     │       │    Port 6379     │
                            └──────────────────┘       └──────────────────┘
```

---

## OPTION 1: Quick Start (Frontend Only – No Database Required)

**The frontend works 100% standalone with built-in mock APIs.**

### Prerequisites
- Node.js 18+ (https://nodejs.org)

### Steps
```bash
# 1. Install dependencies (already done if you cloned this)
npm install

# 2. Start the frontend dev server
npm run dev

# 3. Open in browser
# http://localhost:5173
```

**That's it!** All pages work with mocked data. No MongoDB, no Python, no Redis needed.

---

## OPTION 2: Frontend + Backend (Full Stack)

### Prerequisites
- Node.js 18+
- MongoDB 7.0+ (local or Atlas cloud)

### Step 1: Install MongoDB

**Option A – MongoDB Atlas (Easiest, Free Cloud)**
1. Go to https://www.mongodb.com/atlas
2. Create a free account → Create a free M0 cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string

**Option B – Local MongoDB**
- **macOS:** `brew install mongodb-community@7.0 && brew services start mongodb-community@7.0`
- **Windows:** Download from https://www.mongodb.com/try/download/community
- **Ubuntu:** `sudo apt install mongodb-org && sudo systemctl start mongod`

### Step 2: Configure Environment

Edit the `.env` file in the project root:

```env
# If using MongoDB Atlas, replace this line:
MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ecovision_ai?retryWrites=true&w=majority

# If using local MongoDB, keep the default:
MONGO_URI=mongodb://localhost:27017/ecovision_ai
```

### Step 3: Run

```bash
# Terminal 1 – Start the backend
npm run dev:server

# Terminal 2 – Start the frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/v1/health
- Swagger Docs: http://localhost:5000/api/docs

### What works without MongoDB?
The backend starts in **fallback mode** – all APIs return mock data if MongoDB is unavailable. You will see a warning in the console but everything still functions.

---

## OPTION 3: Full Stack + AI Engine (Complete System)

### Prerequisites
- Node.js 18+
- Python 3.10+ (https://www.python.org)
- MongoDB 7.0+
- pip (comes with Python)

### Step 1: Setup Backend (same as Option 2)

```bash
# .env is already configured with defaults
npm run dev:server
```

### Step 2: Setup AI Engine

```bash
# Navigate to AI engine directory
cd ai-engine

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install minimal dependencies (no GPU required)
pip install fastapi uvicorn pydantic pydantic-settings python-multipart httpx structlog numpy Pillow scikit-learn

# Start the AI Engine
python main.py
```

The AI Engine will start on http://localhost:8000

- AI Docs: http://localhost:8000/docs
- AI Health: http://localhost:8000/api/v1/health

### Step 3: Start Frontend

```bash
# In the project root (separate terminal)
npm run dev
```

### Step 4: Verify Integration

1. Open http://localhost:5173
2. Navigate to **AI Ops** tab in the navigation bar
3. You should see live GPU metrics, model info, training charts
4. Go to **Scanner** → upload or scan an image → predictions come from the AI Engine

---

## OPTION 4: Docker (Everything in One Command)

### Prerequisites
- Docker Desktop (https://www.docker.com/products/docker-desktop)

### Steps

```bash
# Build and start everything
docker-compose up --build

# Or run in background
docker-compose up --build -d
```

This starts:
| Service | URL | Purpose |
|---------|-----|---------|
| Frontend + Backend | http://localhost:5000 | Full-stack app |
| AI Engine | http://localhost:8000 | Python AI microservice |
| MongoDB | localhost:27017 | Database |
| Mongo Express | http://localhost:8081 | DB admin GUI |
| Redis | localhost:6379 | Cache |

To stop: `docker-compose down`

---

## Environment Variables Reference

### Required `.env` Values (minimum to run)

| Variable | Default | When to Change |
|----------|---------|----------------|
| `MONGO_URI` | `mongodb://localhost:27017/ecovision_ai` | When using Atlas cloud or custom MongoDB |
| `JWT_SECRET` | Pre-set | Change in production for security |
| `PORT` | `5000` | If port 5000 is in use |

### Optional `.env` Values

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_GOOGLE_MAPS_API_KEY` | Empty | Enables real Google Maps (get free key at https://console.cloud.google.com) |
| `OPENAI_API_KEY` | `mock-openai-key` | Enables real OpenAI GPT-4 Vision for waste detection |
| `GEMINI_API_KEY` | `mock-gemini-key` | Enables Google Gemini Vision |
| `AI_ENGINE_URL` | `http://localhost:8000` | Points backend to AI microservice |
| `VITE_AI_ENGINE_URL` | `http://localhost:8000` | Points frontend AI Ops dashboard to AI engine |
| `REDIS_URL` | `redis://localhost:6379` | Optional caching (app works without it) |
| `SMTP_HOST/USER/PASS` | Mailtrap defaults | For real email sending (Mailtrap, SendGrid, etc.) |
| `CLOUDINARY_*` or `AWS_*` | Empty | For cloud image storage instead of local |

### AI Engine `.env` (ai-engine/.env)

| Variable | Default | Purpose |
|----------|---------|---------|
| `AI_PORT` | `8000` | AI service port |
| `AI_USE_GPU` | `false` | Set `true` if you have NVIDIA GPU + CUDA |
| `AI_BACKEND_URL` | `http://localhost:5000` | Backend communication |
| `AI_MONGO_URI` | `mongodb://localhost:27017/ecovision_ai_engine` | AI data storage |

---

## Running Commands Quick Reference

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start frontend only (port 5173) |
| `npm run dev:server` | Start backend only (port 5000) |
| `npm run dev:all` | Start backend + frontend together |
| `npm run build` | Build frontend for production |
| `npm run start:prod` | Build frontend + start backend serving it |
| `cd ai-engine && python main.py` | Start AI engine (port 8000) |
| `docker-compose up --build` | Start everything via Docker |

---

## Troubleshooting

### "MongoDB Connection Failed"
- **Cause:** MongoDB is not running or connection string is wrong
- **Fix:** The app works without MongoDB (mock mode). Or install MongoDB/use Atlas.
- **Check:** Run `mongosh` in terminal. If it connects, MongoDB is running.

### "EADDRINUSE port 5000"
- **Cause:** Another app is using port 5000 (common on macOS with AirPlay)
- **Fix:** Change `PORT=5001` in `.env`, then update `VITE_API_URL=http://localhost:5001/api/v1`

### "Python: ModuleNotFoundError"
- **Cause:** Python dependencies not installed
- **Fix:** `cd ai-engine && pip install fastapi uvicorn pydantic pydantic-settings python-multipart numpy Pillow`

### "AI Ops Dashboard shows simulated data"
- **Expected behavior!** When the AI Engine (port 8000) is not running, the dashboard uses built-in simulation data that looks identical to live data.

### "Cannot find module tsx"
- **Fix:** `npx tsx server/index.ts` (npx downloads it automatically)

### "Google Maps shows fallback map"
- **Expected!** Without `VITE_GOOGLE_MAPS_API_KEY`, a beautiful simulated map renders instead.

### Docker build fails with OOM
- **Fix:** Increase Docker Desktop memory to 4GB+ in Settings → Resources

---

## Production Deployment Checklist

1. Change all secrets in `.env` (JWT_SECRET, REFRESH_TOKEN_SECRET, COOKIE_SECRET)
2. Set `NODE_ENV=production`
3. Use MongoDB Atlas or managed MongoDB with authentication
4. Set up Redis (AWS ElastiCache, Upstash, or Railway)
5. Configure Cloudinary or AWS S3 for image uploads
6. Set real SMTP credentials (SendGrid, AWS SES, etc.)
7. Enable HTTPS with reverse proxy (Nginx, Caddy)
8. Set rate limits appropriate for your traffic

---

## Tech Stack Summary

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite, Tailwind CSS 4, TypeScript, Framer Motion, Three.js, Recharts, Zustand, TanStack Query, React Hook Form, Zod |
| **Backend** | Node.js, Express 5, MongoDB/Mongoose, Socket.IO, JWT, Bcrypt, Helmet, Winston, Multer, Swagger |
| **AI Engine** | Python, FastAPI, YOLOv8, PyTorch, TensorFlow, OpenCV, NumPy, Pandas, Pillow, Scikit-Learn |
| **DevOps** | Docker, Docker Compose, GitHub Actions ready, Kubernetes ready |
