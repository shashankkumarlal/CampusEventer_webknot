# CampusEventer CampusEventer: Your All-in-One Campus Events Platform 🎓

A modern campus event management platform with an AI-powered chatbot assistant.

![CampusEventer Demo](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

## 🚀 The Beginning: From Idea to MVP

- My journey with CampusEventer started with a simple yet powerful vision: to create a comprehensive event management platform for educational institutions. I began by:

Planning the MVP using ChatGPT with clear requirements and user flows 
Structuring the application with separate frontend and backend components
Choosing the right tech stack for scalability and developer experience
and then Creating the basic Frontend UI on Replit using the MVP prompt.
## Chatgpt shared chat :
https://chatgpt.com/share/68bd4173-8b8c-8005-afef-0f675bc41781
https://chatgpt.com/share/68bd4188-46d0-8005-bd86-208dad818710
https://chatgpt.com/share/68bd419a-8dac-8005-ad07-f32ff96b1f0e

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: Node.js, Express
- **Database**: SQLite
- **AI**: GROQ API
- **Styling**: Tailwind CSS
- **State Management**: React Query

##  Development Phases:
1. Laying the Foundation
Set up the project structure with separate client and server directories
Implemented core authentication flows for both students and administrators
Created the initial database schema to support all required features

2. Building Core Features
Event Management System
Created CRUD operations for events
Implemented registration and attendance tracking
Added capacity management and waitlisting

3. User Experience
Developed responsive UI components with Tailwind CSS
Added smooth animations and transitions
Implemented real-time updates for event status changes

# I personally felt of integrating an AI CHATBOT using Groq api , GROQ because i have tested many other APIs and felt groq is the fastest and provides more and better tokenization comparatively so chunking is made a lot efficient.

4. AI Integration
Added an intelligent chatbot for event assistance
Implemented recommendation systems for personalized event suggestions
Set up analytics for event performance tracking

## 🚀 Technical Implementation
-Frontend
Built with React and TypeScript for type safety
Used Vite for fast development and building
Implemented state management with React Query
Styled with Tailwind CSS for responsive design

-Backend
Node.js with Express for the API server
SQLite database (with PostgreSQL compatibility)
Secure authentication with JWT
Input validation and sanitization throughout

-AI Components
Integrated with GROQ API for natural language processing
Created modular AI services for different functionalities
Implemented feedback analysis and reporting

 ## Most of the development was done using Windsurf 
 **THE share chat option is not available on Windsurf hence attaching the chat referencing the chat summary by WINDSURF**
 -CampusEventer Project Summary:
 
🛠️ Technical Work Done
Project Setup
Created a full-stack event management platform
Set up the project structure with separate client and server directories
Database Migration
Migrated from SQLite to PostgreSQL
Updated database configuration and connection handling
Implemented session storage with PostgreSQL
Development Environment
Set up development and production configurations
Created Docker configuration for containerization
Implemented environment variable management
Documentation
Created comprehensive README with setup instructions
Documented project structure and architecture
Added code comments and API documentation

🔍 Troubleshooting
Addressed database connection issues
Verified Node.js environment setup
Tested API endpoints and database queries

🚀 Next Steps
Complete database migration verification
Test all API endpoints
Deploy to a staging environment
Set up CI/CD pipeline
📋 Project Structure
CampusEventer/
├── client/          # React frontend
├── server/          # Node.js/Express backend
├── shared/          # Shared TypeScript types
├── .github/         # GitHub workflows
└── docker/          # Docker configuration

💡 Key Learnings
Database migration best practices
Environment configuration management
Debugging distributed systems
Containerization with Docker
 
## 🔄 The Development Process
**Initial Prototyping**
-Built basic UI components
-Set up the development environment
-Created mock APIs for frontend development
**Core Functionality**
-Implemented user authentication
-Built event management features
-Created registration and attendance systems
**Enhancements**
-Added real-time updates
-Implemented analytics and reporting
-Optimized performance
**Testing & Debugging**
=Manually tested all user flows
-Fixed edge cases and improved error handling
-Optimized database queries

## 📦 Prerequisites

- Node.js 16+
- npm or yarn
- GROQ API Key

## DRIVE LINK TO THE DEMO VIDEO :
https://drive.google.com/file/d/1kpeAI9BMoR6W2cX4_pNtJSA0ysqxcX6w/view?usp=sharing

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/CampusEventer.git
   cd CampusEventer
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update the environment variables in `.env`

4. **Start Development Servers**
   ```bash
   # In root directory
   npm run dev
   ```

## 🌐 Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=5000
NODE_ENV=development

# GROQ API
GROQ_API_KEY=your-groq-api-key

# Session
SESSION_SECRET=your-session-secret
```

## 📂 Project Structure

```
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
```

**TESTING**
   ```bash
# Run all tests
npm test

# Run client tests
npm run test:client

# Run server tests
npm run test:server
   ```

**Production Build**
   ```bash
# Build both client and server
npm run build

# Start in production mode
npm run start:prod
   ```
## Design Document
**1. Data to Track**
-Events
Event Details: Title, description, type (workshop/hackathon/seminar), date, time, duration
Location: Physical/Virtual, capacity, organizer details
Status: Upcoming/Ongoing/Completed/Cancelled
Metadata: Created at, last updated, created by

-Users
Students: ID, name, email, college, year, department
Admins: ID, name, email, role, permissions
Authentication: Hashed passwords, last login

-Registrations
Event ID
Student ID
Registration timestamp
Status (registered/attended/cancelled)
Check-in method (manual)

-Attendance
Event ID
Student ID
Check-in timestamp
Check-out timestamp (if applicable)
Attendance method (manual)

-Feedback
Event ID
Student ID
Rating (1-5)
Comments
Submission timestamp

**2. Database Schema** ER Diagram:
+-------------+       +----------------+       +-------------+
|   Events    |       |  Registrations |       |  Students  |
+-------------+       +----------------+       +-------------+
| PK: id      |<----->| PK: id         |<----->| PK: id     |
| title       |       | FK: event_id   |       | name       |
| description |       | FK: student_id |       | email      |
| type        |       | status         |       | college_id |
| start_time  |       | registered_at  |       | department |
| end_time    |       | attended       |       | year       |
| location    |       +----------------+       +------------+
| capacity    |                  |
| status      |                  |
| created_by  |                  v
+-------------+       +-------------+       +-------------+
                      | Attendance  |       |  Feedback   |
                      +-------------+       +-------------+
                      | PK: id      |       | PK: id      |
                      | event_id    |<----->| event_id    |
                      | student_id  |       | student_id  |
                      | check_in    |       | rating      |
                      | check_out   |       | comment     |
                      | method      |       | submitted_at|
                      +-------------+       +-------------+
**3. API Design**
-Events:
GET /api/events - List all events (with filters)
GET /api/events/:id - Get event details
POST /api/events - Create new event (Admin)
PUT /api/events/:id - Update event (Admin)
DELETE /api/events/:id - Cancel event (Admin)

-Registrations:
GET /api/registrations - List all registrations (Admin)
POST /api/events/:eventId/register - Register for event
DELETE /api/registrations/:id - Cancel registration

-Attendance:
POST /api/events/:eventId/check-in - Check in student
POST /api/events/:eventId/check-out - Check out student
GET /api/events/:eventId/attendance - Get attendance list

-Feedback:
POST /api/events/:eventId/feedback - Submit feedback
GET /api/events/:eventId/feedback - Get event feedback (Admin)
GET /api/students/:studentId/feedback - Get student's feedback

-Reports:
GET /api/reports/events - Event statistics
GET /api/reports/students - Student participation
GET /api/reports/feedback - Feedback analysis

**4. Workflows**
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
    
    Student->>Frontend: Select event & register
    Frontend->>Backend: POST /api/events/:id/register
    Backend->>Database: Check capacity
    Database-->>Backend: Available slots
    Backend->>Database: Create registration
    Database-->>Backend: Confirmation
    Backend-->>Frontend: Success response
    Frontend->>Student: Show registration confirmation
    
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
    
**5. Assumptions & Edge Cases**
Assumptions:
-Each event has a single organizer
-Students can only register once per event
-Attendance is marked at the event venue
-Feedback can only be submitted after event completion

Edge Cases Handled:
-Duplicate Registrations
-Scenario: Student tries to register for the same event twice
-Handling:
Check existing registrations before creating new one
Return 409 Conflict if already registered

Event Capacity:
-Scenario: Event reaches maximum capacity
-Handling:
Show "Event Full" status
Add to waitlist if implemented
Reject new registrations

Missing Feedback:
-Scenario: Student attends but doesn't provide feedback
-Handling:
Send reminder emails
Show pending feedback in dashboard
Allow late submissions

Cancelled Events:
-Scenario: Event is cancelled after registrations
-Handling:
Notify all registered students
Update event status
Prevent new registrations
Allow feedback collection for cancelled events

Late Arrivals:
-Scenario: Student arrives after check-in closes
-Handling:
Allow manual check-in by admin
Mark as "Late" in attendance
Configurable check-in window

Multiple Check-ins:
-Scenario: Student checks in multiple times
-Handling:
Prevent duplicate check-ins
Log all check-in attempts
Alert for suspicious activity

## 6 Scaling Analysis for CampusEventer:
System Scale
Colleges: 50
Students per college: 500
Events per college per semester: 20
Total students: 25,000
Total events per semester: 1,000

**1. Database Design**
Single PostgreSQL database with proper indexing
College-scoped unique IDs for events
Composite indexes on (college_id, id) for efficient querying
**2. ID Structure**
Use UUID v7 for all primary keys
Benefits:
Globally unique
Time-sortable
No coordination needed between instances
**3. Data Partitioning**
Logical partitioning by college_id in application code
Physical partitioning by college_id if table grows beyond 10M rows
**4. API Design**
GET /api/colleges/{collegeId}/events
GET /api/colleges/{collegeId}/events/{eventId}
**5. Performance Considerations**
Read Replicas: For analytics and reporting
Caching Layer: Redis for frequently accessed data
Connection Pooling: To handle concurrent connections
**6. Growth Projections**
Year 1: 50 colleges × 20 events = 1,000 events/semester
Year 3: 200 colleges × 20 events = 4,000 events/semester
Storage: ~1MB/event → 4GB/year (easily manageable)

AND TO ORGANIZE DATA WE CAN HAVE 2 OPTIONS :
Option 1: Single Database with College Context:
   ```bash
-- Events table
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    college_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    -- other fields
    UNIQUE(college_id, id)  -- For college-scoped uniqueness
);
   ```
Option 2: Separate Schemas per College:
   ```bash
-- For each college
CREATE SCHEMA college_1;
CREATE TABLE college_1.events (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    -- other fields
);
   ```
## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [GROQ](https://www.groq.com/)
- [Replit](https://replit.com/)

---

## The web app is working and the screen recording is attached below : However due to time constraints the web app was not deployed perfectly on Netlify | ONLY THE FRONTEND IS DEPLOYED ON NETLIFY bearing this URL: https://extraordinary-monstera-c6e86e.netlify.app/auth
The Real working Webapp Demo is shown in the following video WHICH IS BEING RUN LOCALLY ON LOCALHOAST AND CAN BE RUN BY DOWNLOADING THE GITHUB REPO AND ALL THE REQUIRMENTS . 
## DRIVE LINK TO THE DEMO VIDEO :
https://drive.google.com/file/d/1kpeAI9BMoR6W2cX4_pNtJSA0ysqxcX6w/view?usp=sharing

<div align="center">
  Made with ❤️ Shashank Kumar Lal | Reva Univeristy | SRN : R22EP052 | btech ECM
</div>
