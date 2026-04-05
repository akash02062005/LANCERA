# Lancera — AI-Powered Freelancer Marketplace

> AI + Reverse Auction + Freelance = Smart Hiring System  
> Built by Green Sync Innovators | Hack Wise 2.0 | Table 07

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Setup MongoDB
Start MongoDB locally or update `backend/.env` with your MongoDB URI.

### 2. Start the App
```bash
# Double-click start.bat OR run manually:

# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

### 3. Open
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Tailwind CSS + Framer Motion |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose) |
| AI/LLM | OSM API (OpenAI-compatible) |
| Real-Time | Socket.io |
| Payments | Razorpay (test mode) |
| Auth | JWT + bcrypt + OTP |

## Key Features
1. **Reverse Auction Bidding** — Freelancers bid DOWN in live auction
2. **AI Quiz Vetting** — 5 questions, 7 sec each, generated from project
3. **Closed Community Circle** — Private bidding with invite codes
4. **Smart Bid Feedback** — HIGH/FAIR/LOW + winning % before submitting
5. **AI Best Freelancer Tag** — Weighted recommendation score
6. **Project Health Status** — Green/Yellow/Red AI monitoring
7. **Phase-wise Payments** — Milestone-based with remove/replace
8. **AI Project Creation** — Auto description, budget, skills, phases
9. **SaaS Subscription** — Flat fee, no commission

## API Endpoints
- `POST /api/auth/signup` — Register
- `POST /api/auth/verify-otp` — Verify email
- `POST /api/auth/login` — Login
- `GET /api/projects` — Browse projects
- `POST /api/projects` — Create project
- `POST /api/projects/ai/description` — AI generate description
- `POST /api/bidding/join/:id` — Join bidding
- `GET /api/bidding/quiz/:id/start` — Get AI quiz
- `POST /api/bidding/bid/:id` — Place bid
- `GET /api/bidding/feedback/:id` — Smart bid feedback

## Environment Variables (backend/.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lancera
JWT_SECRET=lancera_jwt_secret_key_2024_hackathon
OSM_API_KEY=osm_yAf11sOG77tZzWbd19NiXFATr6sOhgRztCX6mBzS
OSM_BASE_URL=https://api.osmapi.com/v1
RAZORPAY_KEY_ID=rzp_test_lancera
CLIENT_URL=http://localhost:3000
```
