# 🚀 Lancera — AI-Powered Freelancer Marketplace

Lancera is an innovative, AI-driven freelancer marketplace built around a **Reverse Auction** system. Designed to optimize hiring for clients and provide fair opportunities for freelancers, Lancera integrates intelligent AI vetting, smart bidding feedback, and a closed community ecosystem. 

> **Hackathon Details**: Built by *Green Sync Innovators* for *Hack Wise 2.0* (Table 07)

---

## 🌟 Key Features

*   **📉 Reverse Auction Bidding**: A unique live auction system where freelancers bid down to offer competitive rates, ensuring cost-effective hiring.
*   **🧠 AI Quiz Vetting**: Automated 5-question AI-generated quizzes (7 seconds each) based on project requirements to dynamically verify freelancer skills before they can bid.
*   **🔒 Closed Community Circle**: Private, high-quality project bidding restricted via invite codes.
*   **💡 Smart Bid Feedback**: Real-time feedback (HIGH/FAIR/LOW) and winning probability calculations provided to freelancers before submitting a bid.
*   **🏆 AI Best Freelancer Tag**: Weighted recommendation scores to highlight the most qualified candidates for clients.
*   **🚦 Project Health Status**: AI-monitored project health dashboards with Green/Yellow/Red indicators.
*   **💳 Phase-wise Payments**: Milestone-based secure payment gateways with remove/replace functionality.
*   **🤖 AI Project Creation**: Automatic generation of project descriptions, required skills, budget estimates, and phases using AI.
*   **📦 SaaS Subscription Model**: A flat-fee subscription system with zero commission per project.

---

## 🛠️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18, Tailwind CSS, Framer Motion | Dynamic, responsive UI with smooth animations. |
| **Backend** | Node.js, Express.js | High-performance scalable REST API. |
| **Database** | MongoDB (Mongoose) | Flexible NoSQL document database. |
| **AI/LLM** | OSM API (OpenAI-compatible) | Powers AI project generation and quiz vetting. |
| **Real-Time** | Socket.io | Live reverse auction WebSocket pipelines. |
| **Payments** | Razorpay | Seamless financial processing (Test Mode). |
| **Auth** | JWT, bcrypt, OTP | Secure encrypted sessions and email verification. |

---

## 🚀 Quick Start & Installation

### 📋 Prerequisites
*   **Node.js 18 or higher**
*   **MongoDB** (Local instance or Atlas connection string)

### 📥 Setup Instructions

1.  **Configure Environment Variables**: Update `backend/.env` with your MongoDB URI and API keys.
    ```env
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/lancera
    JWT_SECRET=your_jwt_secret_key
    OSM_API_KEY=your_osm_api_key
    OSM_BASE_URL=https://api.osmapi.com/v1
    RAZORPAY_KEY_ID=your_razorpay_test_key
    CLIENT_URL=http://localhost:3000
    ```

2.  **Start the Application**:
    You can simply double-click `start.bat` on Windows, OR run manually:

    **Terminal 1 (Backend)**:
    ```bash
    cd backend
    npm install
    npm run dev
    ```

    **Terminal 2 (Frontend)**:
    ```bash
    cd frontend
    npm install
    npm start
    ```

3.  **Access the Application**:
    *   **Frontend UI**: `http://localhost:3000`
    *   **Backend API**: `http://localhost:5000/api`
    *   **Health Check**: `http://localhost:5000/api/health`

---

## 📡 Core API Endpoints

*   `POST /api/auth/signup` — Register User
*   `POST /api/auth/verify-otp` — Verify Email OTP
*   `POST /api/auth/login` — Authenticate & get JWT
*   `GET /api/projects` — Browse Active Projects
*   `POST /api/projects` — Create New Project
*   `POST /api/projects/ai/description` — AI Generate Description
*   `POST /api/bidding/join/:id` — Join Bidding Room
*   `GET /api/bidding/quiz/:id/start` — Initiate AI Vetting Quiz
*   `POST /api/bidding/bid/:id` — Place Reverse Bid
*   `GET /api/bidding/feedback/:id` — Get Smart Bid Feedback
