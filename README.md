# Ploom - Smart Collaborative Workspace

Ploom is a full-stack collaborative platform designed to streamline team workflows through real-time synchronization and AI-driven automation. This project demonstrates a robust integration of modern web technologies, secure authentication, and scalable cloud deployment.

## 🚀 Tech Stack

- **Frontend:** React.js / Next.js
- **Backend:** Node.js & Express.js
- **Database:** MongoDB
- **Real-time:** Socket.io (WebSockets)
- **Security:** JSON Web Tokens (JWT) & Bcrypt hashing
- **Deployment:** Render

---

## ✨ Key Features

### 1. Secure Authentication

- User Registration and Login system.
- Secure password storage using Bcrypt hashing.
- Protected API routes using JWT middleware to ensure data privacy.

### 2. Workspace & Task Management (Full CRUD)

- **Workspaces:** Create, read, update, and delete collaborative environments.
- **Tasks:** Full CRUD operations for individual tasks, including status tracking and descriptions.
- **Data Integrity:** Implementation of 3 distinct data models (User, Workspace, Task).

### 3. Real-time Collaboration

- Instant data synchronization across all connected clients.
- Implementation of multiple WebSocket events for live updates such as task movements and status changes.

### 4. AI-Powered Automation

- Integrated AI assistant to automatically generate task lists from natural language descriptions.
- Intelligent project summarization to track team progress efficiently.

---

## 🛠 Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)
- Gemini API Key (for AI features)

### 1. Clone & Install
```bash
# Clone the repo
git clone <your-repo-url>
cd ploom

# Install Backend dependencies
cd backend
npm install

# Install Frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_key
CLIENT_URL=http://localhost:3000
```

### 3. Run Locally
```bash
# Start backend (from /backend)
npm run dev

# Start frontend (from /frontend)
npm run dev
```

---

## ☁️ Deployment

This project is configured for **Render**. 
1. Push your code to GitHub.
2. Connect your repository to Render using the provided `render.yaml` file.
3. Once connected, **any future pushes to GitHub will automatically trigger a new deployment**, rebuilding and updating your app instantly.

