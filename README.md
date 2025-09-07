# CampusEventer 🎓  
**Your All-in-One Campus Events Platform with AI-powered Assistance**  

A modern platform to manage campus events efficiently with an intelligent chatbot assistant powered by GROQ API.

![CampusEventer Demo](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

---

## 🚀 Journey: From Idea to MVP

CampusEventer started with a vision to create a comprehensive event management system for educational institutions. The development journey included:

- Planning the MVP using ChatGPT with clear requirements and user flows.  
- Structuring the application with separate frontend and backend components.  
- Choosing a scalable tech stack for better developer experience.  
- Building the initial Frontend UI on Replit.  

**ChatGPT Shared Chats for MVP Planning:**  
- [Chat 1](https://chatgpt.com/share/68bd4173-8b8c-8005-afef-0f675bc41781)  
- [Chat 2](https://chatgpt.com/share/68bd4188-46d0-8005-bd86-208dad818710)  
- [Chat 3](https://chatgpt.com/share/68bd419a-8dac-8005-ad07-f32ff96b1f0e)  

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Vite  
- **Backend:** Node.js, Express  
- **Database:** SQLite (PostgreSQL-compatible)  
- **AI:** GROQ API  
- **Styling:** Tailwind CSS  
- **State Management:** React Query  

---

## 🏗 Development Phases

### 1. Laying the Foundation
- Set up project structure with separate `client` and `server` directories.  
- Implemented authentication for students and admins.  
- Created initial database schema for all features.

### 2. Building Core Features
- CRUD operations for events.  
- Registration and attendance tracking.  
- Capacity management and waitlisting.  

### 3. User Experience
- Developed responsive UI with Tailwind CSS.  
- Added smooth animations and real-time updates.  

### 4. AI Integration
- Added an intelligent chatbot for event assistance using GROQ API.  
- Implemented personalized event recommendations.  
- Set up analytics for event performance tracking.  

> GROQ API was chosen after testing multiple AI APIs — it offered faster performance and better tokenization for efficient chunking.

---

## 🌐 Technical Implementation

### Frontend
- React + TypeScript for type safety.  
- Vite for fast development and builds.  
- State management using React Query.  
- Responsive design with Tailwind CSS.  

### Backend
- Node.js + Express for API server.  
- SQLite database with PostgreSQL compatibility.  
- Secure authentication using JWT.  
- Input validation & sanitization across APIs.  

### AI Components
- Integrated GROQ API for NLP tasks.  
- Modular AI services for different features.  
- Feedback analysis and reporting.

---

## ⚡ Project Summary (via Windsurf)

**Work Completed**  
- Full-stack event management platform set up.  
- Database migrated from SQLite to PostgreSQL.  
- Session storage implemented with PostgreSQL.  
- Docker setup for development and production.  
- Comprehensive README & documentation created.  

**Troubleshooting**  
- Resolved database connection issues.  
- Verified Node.js environment and tested APIs.  

**Next Steps**  
- Verify database migration.  
- Test all API endpoints.  
- Deploy to staging environment.  
- Set up CI/CD pipeline.

## 📂 Project Structure
CampusEventer/
├── .github/                 # GitHub workflows and actions
│   └── workflows/
│       └── ci-cd.yml        # CI/CD pipeline configuration
│
├── .vscode/                 # VSCode settings
│   └── settings.json        # Workspace settings
│
├── client/                  # Frontend React application
│   ├── public/              # Static assets
│   └── src/                 # Source code
│       ├── assets/          # Images, fonts, etc.
│       ├── components/      # Reusable UI components
│       ├── hooks/           # Custom React hooks
│       ├── pages/           # Application pages
│       ├── services/        # API service calls
│       ├── styles/          # Global styles
│       ├── types/           # TypeScript type definitions
│       ├── App.tsx          # Main App component
│       └── main.tsx         # Application entry point
│
├── server/                  # Backend Express server
│   ├── config/             # Configuration files
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Custom middleware
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   ├── utils/              # Helper functions
│   ├── app.js              # Express application
│   └── server.js           # Server entry point
│
├── shared/                 # Shared code between frontend and backend
│   ├── types/              # Shared TypeScript types
│   └── utils/              # Shared utility functions
│
├── tests/                  # Test files
│   ├── unit/               # Unit tests
│   └── integration/        # Integration tests
│
├── .dockerignore           # Docker ignore file
├── .env.example            # Example environment variables
├── .eslintrc.js            # ESLint configuration
├── .gitignore             # Git ignore file
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile              # Docker configuration
├── package.json            # Project dependencies and scripts
├── README.md               # Project documentation
└── tsconfig.json          # TypeScript configuration

## 📦 Prerequisites

- Node.js 16+  
- npm or yarn  
- GROQ API Key  

**Demo Video:** [Google Drive Link](https://drive.google.com/file/d/1kpeAI9BMoR6W2cX4_pNtJSA0ysqxcX6w/view?usp=sharing)

---

## 🚀 Getting Started

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/CampusEventer.git
cd CampusEventer
```
2. **Install dependencies**
   npm install          # Root
cd server && npm install
cd ../client && npm install

3. **Environment Setup**
   Copy .env.example to .env
Update environment variables in .env

4. **Start Development Servers**
   npm run dev

**Environment Variables**
# Server
PORT=5000
NODE_ENV=development

# GROQ API
GROQ_API_KEY=your-groq-api-key

# Session
SESSION_SECRET=your-session-secret

## Design Document
1. Data to Track

**Events**: Title, description, type, date, time, duration, location, capacity, organizer, status, metadata

**Users**: Students (ID, name, email, college, year, department), Admins (ID, role, permissions)

**Registrations**: Event ID, Student ID, timestamp, status, check-in method

**Attendance**: Event ID, Student ID, check-in/out timestamps, method

**Feedback**: Event ID, Student ID, rating, comments, timestamp

2. **Database Schema (ER Diagram)**
<img width="645" height="665" alt="image" src="https://github.com/user-attachments/assets/ac98321f-85df-4453-93df-c267a43da01c" />

3. **API Design**

Events:

GET /api/events - List all events

GET /api/events/:id - Event details

POST /api/events - Create event (Admin)

PUT /api/events/:id - Update event (Admin)

DELETE /api/events/:id - Cancel event (Admin)


Registrations:

GET /api/registrations - List registrations (Admin)

POST /api/events/:eventId/register - Register

DELETE /api/registrations/:id - Cancel


Attendance:

POST /api/events/:eventId/check-in - Check-in

POST /api/events/:eventId/check-out - Check-out

GET /api/events/:eventId/attendance - List


Feedback:

POST /api/events/:eventId/feedback - Submit

GET /api/events/:eventId/feedback - Event feedback

GET /api/students/:studentId/feedback - Student feedback


Reports:

GET /api/reports/events - Event stats

GET /api/reports/students - Participation

GET /api/reports/feedback - Feedback analysis

4. **Workflows**

Registration Flow:

sequenceDiagram
    participant Student
    participant Frontend
    participant Backend
    participant Database

    Student->>Frontend: Browse events
    Frontend->>Backend: GET /api/events
    Backend->>Database: Query events
    Database-->>Backend: Return events
    Backend-->>Frontend: Return events
    Frontend->>Student: Display events
    
    Student->>Frontend: Select & register
    Frontend->>Backend: POST /api/events/:id/register
    Backend->>Database: Check capacity
    Database-->>Backend: Available slots
    Backend->>Database: Create registration
    Database-->>Backend: Confirmation
    Backend-->>Frontend: Success response
    Frontend->>Student: Show confirmation

Attendance Flow:
sequenceDiagram
    participant Student
    participant Admin
    participant Frontend
    participant Backend
    participant Database

    Student->>Frontend: Show QR code
    Admin->>Frontend: Scan QR code
    Frontend->>Backend: POST /api/events/:id/check-in
    Backend->>Database: Verify registration
    Database-->>Backend: Registration details
    Backend->>Database: Record attendance
    Database-->>Backend: Confirmation
    Backend-->>Frontend: Attendance confirmed
    Frontend->>Admin: Show success message
    Frontend->>Student: Show check-in confirmation

## 5. Assumptions & Edge Cases

Each event has one organizer

Students can register only once per event

Attendance is marked at the venue

Feedback submitted after event completion

Edge Cases Handled:

Duplicate registrations → Return 409 Conflict

Event full → Show "Event Full" or add to waitlist

Missing feedback → Send reminders, allow late submission

Cancelled events → Notify students, update status

Late arrivals → Manual admin check-in

Multiple check-ins → Prevent duplicates, log suspicious activity

## 6. Scaling Analysis

System Scale:

Colleges: 50

Students per college: 500

Events per semester per college: 20

Total students: 25,000

Total events/semester: 1,000

**Database & Performance:**

Single PostgreSQL DB with indexes

UUID v7 for PKs (unique & time-sortable)

Logical partitioning by college_id

Read replicas & Redis caching for performance

Growth Projection:

Year 1: 1,000 events/semester

Year 3: 4,000 events/semester

Storage: ~1MB/event → 4GB/year

Database Options:

Option 1: Single DB with College Context
```
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    college_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    UNIQUE(college_id, id)
);
```
Option 2: Separate Schemas per College
```
CREATE SCHEMA college_1;
CREATE TABLE college_1.events (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL
);
```
## 🤝 Contributing

Fork the repository

Create a feature branch: git checkout -b feature/AmazingFeature

Commit changes: git commit -m 'Add AmazingFeature'

Push branch: git push origin feature/AmazingFeature

Open a Pull Request

## 📄 License

This project is licensed under the MIT License — see LICENSE
.

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [GROQ](https://www.groq.com/)
- [Replit](https://replit.com/)

## 🎬 Demo

Frontend deployed on Netlify: https://extraordinary-monstera-c6e86e.netlify.app/auth

Full web app (local) demo video: [Google Drive Link](https://drive.google.com/file/d/1kpeAI9BMoR6W2cX4_pNtJSA0ysqxcX6w/view?usp=sharing)

<div align="center"> Made with ❤️ by Shashank Kumar Lal | Reva University | SRN: R22EP052 | B.Tech ECM </div> ```


