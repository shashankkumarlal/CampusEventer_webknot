# Campus Event Management Platform

## Overview

This is a full-stack Campus Event Management Platform MVP built with React, Express, and PostgreSQL. The application enables colleges to manage campus events with role-based access for students and administrators. Students can discover, register for, and provide feedback on events, while administrators can create events, manage registrations, and track attendance with comprehensive analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design tokens and dark theme
- **Animations**: Framer Motion for smooth UI transitions
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for full-stack type safety
- **Authentication**: Passport.js with local strategy and secure password hashing (scrypt)
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful API with role-based access control middleware
- **Validation**: Zod schemas shared between client and server

### Database Design
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Comprehensive relational design with proper foreign key constraints
- **Tables**: Users, colleges, events, registrations, attendance, and feedback
- **Migrations**: Automated schema management with drizzle-kit

### Authentication & Authorization
- **Authentication Method**: Username/password with secure password hashing
- **Session Management**: Server-side sessions stored in PostgreSQL
- **Role-Based Access**: Student and admin roles with protected routes
- **Security Features**: Input validation, CSRF protection, and secure session configuration

### Key Features
- **Event Management**: Create, update, and delete events with capacity limits
- **Registration System**: Prevent duplicate registrations with real-time validation
- **Attendance Tracking**: Multiple check-in methods (manual, QR, self-service)
- **Feedback System**: Post-event rating and comment collection
- **Analytics Dashboard**: Event popularity and attendance visualizations using Recharts
- **Responsive Design**: Mobile-first approach with adaptive layouts

### Data Flow
- Client-side forms use React Hook Form with Zod validation
- API requests handled through TanStack Query for caching and synchronization
- Server validates all inputs and enforces business rules
- Database operations use Drizzle ORM with proper transaction handling
- Real-time UI updates through optimistic updates and cache invalidation

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database queries and schema management

### UI & Styling
- **Radix UI**: Accessible component primitives for complex UI elements
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Framer Motion**: Animation library for enhanced user experience
- **Recharts**: Chart library for data visualization in admin dashboard

### Development Tools
- **Vite**: Fast build tool with HMR for development
- **TypeScript**: Static type checking across the entire stack
- **Replit Integration**: Development environment optimization with runtime error handling

### Validation & Forms
- **Zod**: Schema validation library shared between client and server
- **React Hook Form**: Performant form library with built-in validation
- **@hookform/resolvers**: Zod integration for form validation

### Authentication
- **Passport.js**: Authentication middleware with local strategy
- **connect-pg-simple**: PostgreSQL session store for Express sessions
- **Crypto (Node.js)**: Secure password hashing with scrypt algorithm