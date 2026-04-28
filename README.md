# SmartFlow AI - Intelligent Collaborative Workspace

SmartFlow AI is a high-performance Full-Stack application designed for team collaboration, featuring real-time synchronization and AI-driven automation. This project is built as part of the **Trends in Technology W2026** course.

## 🚀 Tech Stack

- **Frontend:** React.js / Next.js (Modern Frontend Framework)
- **Backend:** Node.js & Express.js
- **Database:** MongoDB (NoSQL)
- **Real-time:** Socket.io (WebSockets)
- **Security:** JWT (JSON Web Tokens) & Bcrypt (Password Hashing)
- **Deployment:** Hosted on **Render** (Web Service & Static Site)

---

## 👥 Team Responsibilities (Full-Stack Division)

Both members act as Full-Stack Developers, managing their assigned features from the Database layer to the User Interface.

### 👤 Person 1: Identity & Workspace Infrastructure

_Focus: Secure access, core organizational data, and real-time synchronization._

- **Authentication System:** Implement secure Signup and Login using **JWT** and **Bcrypt** hashing.
- **Workspace Module (CRUD 1):** Develop the full CRUD logic for Workspaces (Create, Read, Update, Delete).
- **Real-time Engine:** Set up the **Socket.io** server to broadcast live updates when workspaces are modified.
- **Middleware & Security:** Create protected routes to ensure only authenticated users can access workspace data.
- **Deployment:** Manage the deployment of the Web Service (API) and Database connection on **Render**.

### 👤 Person 2: Task Intelligence & Analytics

_Focus: AI-driven workflows, task management, and data visualization._

- **Task Management (CRUD 2):** Develop the full CRUD logic for Tasks within workspaces, including status and priority tracking.
- **AI Integration:** Connect with OpenAI/Gemini API to automate task generation and sub-task breakdown from natural language descriptions.
- **WebSocket Notifications:** Implement real-time notification events (e.g., `notification:new`) when tasks are created or assigned.
- **Data Dashboard:** Build a visual interface to track project progress using charts and analytics (Recharts/Chart.js).
- **Documentation:** Manage the repository structure and technical README documentation.

---

## 📅 Development Roadmap

### Phase 1: Architecture & Auth (Week 1-2)

- Collaborative design of MongoDB Schemas (User, Workspace, Task).
- **Person 1:** Setup Express server, JWT Authentication, and Signup/Login routes.
- **Person 2:** Setup React/Next.js environment and design the Dashboard layout.

### Phase 2: Feature Development (Week 3-4)

- **Person 1:** Build Workspace CRUD and initialize Socket.io event broadcasting.
- **Person 2:** Build Task CRUD and integrate the AI API for "Smart Task Generation."

### Phase 3: Integration & Deployment (Week 5)

- Finalize WebSocket event handling for real-time collaborative updates.
- **Deployment:** Deploy the Backend (Web Service) and Frontend (Static Site) to **Render**.
- **Final Polish:** Ensure all passwords are hashed and all routes are protected.

---

## 🛠 Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/yourusername/smartflow-ai.git](https://github.com/yourusername/smartflow-ai.git)
   ```
