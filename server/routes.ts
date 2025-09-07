import express, { type Request, Response, type Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { db } from "./db";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { ChatbotService } from "./chatbot-service";
import type { User } from "../shared/schema";

// Custom event creation schema that matches frontend data
const createEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  eventDate: z.string().min(1, "Event date is required"),
  eventTime: z.string().min(1, "Event time is required"),
  location: z.string().min(1, "Location is required"),
  maxCapacity: z.union([z.string(), z.number()]).transform(val => typeof val === 'string' ? parseInt(val) : val),
  college: z.string().min(1, "College is required"),
  organizer: z.string().optional(),
  requirements: z.string().optional(),
  tags: z.string().optional(),
  imageUrl: z.string().optional(),
}).transform(data => ({
  ...data,
  // Handle empty strings as undefined
  description: data.description?.trim() || undefined,
  organizer: data.organizer?.trim() || undefined,
  requirements: data.requirements?.trim() || undefined,
  tags: data.tags?.trim() || undefined,
  imageUrl: data.imageUrl?.trim() || undefined,
}));

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Initialize chatbot service
  const chatbotService = new ChatbotService();

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Middleware to check admin role
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Events routes
  app.get("/api/events", async (req, res) => {
    try {
      const { search, date } = req.query;
      const events = await storage.getEvents({
        search: search as string,
        date: date as string,
      });
      
      // Get registration counts for each event
      const eventsWithCounts = await Promise.all(
        events.map(async (event) => {
          const registrationCount = await storage.getEventRegistrationCount(event.id);
          return { ...event, registrationCount };
        })
      );
      
      res.json(eventsWithCounts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const registrationCount = await storage.getEventRegistrationCount(event.id);
      res.json({ ...event, registrationCount });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  app.post("/api/events", requireAdmin, async (req, res) => {
    try {
      console.log("Raw request body:", JSON.stringify(req.body, null, 2));
      
      // Parse date properly from frontend form data
      let eventDate;
      
      // Frontend sends 'date' and 'time' fields, not 'eventDate' and 'eventTime'
      if (req.body.date) {
        if (req.body.time) {
          // Combine date and time properly
          // Frontend date is already a Date object or ISO string, time is HH:MM format
          const dateStr = req.body.date instanceof Date ? req.body.date.toISOString().split('T')[0] : req.body.date.split('T')[0];
          eventDate = new Date(`${dateStr}T${req.body.time}`);
        } else {
          // Just date provided
          eventDate = new Date(req.body.date);
        }
        
        // Validate the parsed date
        if (isNaN(eventDate.getTime())) {
          console.error("Invalid date provided:", req.body.date, req.body.time);
          eventDate = new Date(); // Fallback to current date
        }
      } else if (req.body.eventDate) {
        // Fallback for old format
        if (req.body.eventTime) {
          eventDate = new Date(`${req.body.eventDate}T${req.body.eventTime}`);
        } else {
          eventDate = new Date(req.body.eventDate);
        }
        
        if (isNaN(eventDate.getTime())) {
          console.error("Invalid date provided:", req.body.eventDate, req.body.eventTime);
          eventDate = new Date();
        }
      } else {
        eventDate = new Date(); // Default to current date
      }

      const eventData = {
        title: req.body.title || "Untitled Event",
        description: req.body.description || null,
        date: eventDate,
        location: req.body.location || "TBD",
        capacity: req.body.maxCapacity ? parseInt(req.body.maxCapacity) : (req.body.capacity ? parseInt(req.body.capacity) : 50),
        registrationDeadline: null,
        status: "upcoming" as const,
        imageUrl: req.body.imageUrl || null,
        tags: req.body.type ? JSON.stringify([req.body.type]) : (req.body.tags || null),
        requirements: req.body.requirements || null,
        collegeId: req.body.college || "default",
        createdBy: (req.user as User).id,
      };

      console.log("Event data to create:", JSON.stringify(eventData, null, 2));

      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Event creation error:", error);
      res.status(500).json({ message: "Failed to create event", error: error.message });
    }
  });

  app.put("/api/events/:id", requireAdmin, async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const validatedData = req.body;
      const updatedEvent = await storage.updateEvent(req.params.id, validatedData);
      res.json(updatedEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", requireAdmin, async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      await storage.deleteEvent(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete event" });
    }
  });

  // Registration routes
  app.post("/api/events/:id/register", requireAuth, async (req, res) => {
    try {
      const eventId = req.params.id;
      const studentId = (req.user as User).id;

      // Check if event exists
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Check if already registered
      const existingRegistration = await storage.getRegistration(eventId, studentId);
      if (existingRegistration) {
        return res.status(400).json({ message: "Already registered for this event" });
      }

      // Check capacity
      const registrationCount = await storage.getEventRegistrationCount(eventId);
      if (registrationCount >= event.capacity) {
        return res.status(400).json({ message: "Event is at full capacity" });
      }

      const registration = await storage.createRegistration({ eventId, studentId });
      res.status(201).json(registration);
    } catch (error) {
      res.status(500).json({ message: "Failed to register for event" });
    }
  });

  app.delete("/api/events/:id/register", requireAuth, async (req, res) => {
    try {
      const eventId = req.params.id;
      const studentId = (req.user as User).id;

      const registration = await storage.getRegistration(eventId, studentId);
      if (!registration) {
        return res.status(404).json({ message: "Registration not found" });
      }

      await storage.deleteRegistration(eventId, studentId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to cancel registration" });
    }
  });

  app.get("/api/events/:id/registrations", requireAdmin, async (req, res) => {
    try {
      const registrations = await storage.getRegistrationsByEvent(req.params.id);
      res.json(registrations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  // Student registrations
  app.get("/api/my-registrations", requireAuth, async (req, res) => {
    try {
      const studentId = (req.user as User).id;
      const registrations = await storage.getRegistrationsByStudent(studentId);
      res.json(registrations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  // Attendance routes
  app.post("/api/events/:id/attendance", requireAuth, async (req, res) => {
    try {
      const eventId = req.params.id;
      const studentId = (req.user as User).id;
      const { checkinMethod = "manual" } = req.body;

      // Check if registered
      const registration = await storage.getRegistration(eventId, studentId);
      if (!registration) {
        return res.status(400).json({ message: "Must be registered to check in" });
      }

      // Check if already checked in
      const existingAttendance = await storage.getAttendance(eventId, studentId);
      if (existingAttendance) {
        return res.status(400).json({ message: "Already checked in for this event" });
      }

      const attendance = await storage.createAttendance({
        eventId,
        studentId,
        checkinMethod,
      });

      res.status(201).json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Failed to check in" });
    }
  });

  app.get("/api/events/:id/attendance", requireAdmin, async (req, res) => {
    try {
      const attendance = await storage.getAttendanceByEvent(req.params.id);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.get("/api/my-attendance", requireAuth, async (req, res) => {
    try {
      const studentId = (req.user as User).id;
      const attendance = await storage.getAttendanceByStudent(studentId);
      res.json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  // Feedback routes
  app.post("/api/events/:id/feedback", requireAuth, async (req, res) => {
    try {
      const eventId = req.params.id;
      const studentId = (req.user as User).id;

      // Check if attended
      const attendance = await storage.getAttendance(eventId, studentId);
      if (!attendance) {
        return res.status(400).json({ message: "Must attend event to provide feedback" });
      }

      // Check if already provided feedback
      const existingFeedback = await storage.getFeedback(eventId, studentId);
      if (existingFeedback) {
        return res.status(400).json({ message: "Feedback already submitted for this event" });
      }

      const validatedData = {
        ...req.body,
        eventId,
        studentId,
      };

      const feedback = await storage.createFeedback(validatedData);
      res.status(201).json(feedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid feedback data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  app.get("/api/events/:id/feedback", requireAdmin, async (req, res) => {
    try {
      const feedback = await storage.getFeedbackByEvent(req.params.id);
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  app.get("/api/my-feedback", requireAuth, async (req, res) => {
    try {
      const studentId = (req.user as User).id;
      const feedback = await storage.getFeedbackByStudent(studentId);
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  // Analytics/Reports routes
  app.get("/api/reports/popularity", requireAdmin, async (req, res) => {
    try {
      const popularity = await storage.getEventPopularity();
      res.json(popularity);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event popularity" });
    }
  });

  app.get("/api/reports/top-students", requireAdmin, async (req, res) => {
    try {
      const topStudents = await storage.getTopStudents();
      res.json(topStudents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch top students" });
    }
  });

  app.get("/api/reports/feedback", requireAdmin, async (req, res) => {
    try {
      const feedbackAnalytics = await storage.getFeedbackAnalytics();
      res.json(feedbackAnalytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch feedback analytics" });
    }
  });

  // Colleges route
  app.get("/api/colleges", async (req, res) => {
    try {
      const colleges = await storage.getColleges();
      res.json(colleges);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch colleges" });
    }
  });

  // Chatbot routes
  app.post("/api/chatbot/chat", async (req, res) => {
    try {
      const { message, conversation_id } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      const response = await chatbotService.chat(message, conversation_id);
      res.json(response);
    } catch (error) {
      console.error("Chatbot error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/chatbot/conversation/:id", async (req, res) => {
    try {
      const conversationId = req.params.id;
      const history = chatbotService.getConversationHistory(conversationId);
      res.json({ conversation_id: conversationId, messages: history });
    } catch (error) {
      console.error("Get conversation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/chatbot/conversation/:id", async (req, res) => {
    try {
      const conversationId = req.params.id;
      const success = chatbotService.clearConversation(conversationId);
      
      if (success) {
        res.json({ message: "Conversation cleared successfully" });
      } else {
        res.status(404).json({ message: "Conversation not found" });
      }
    } catch (error) {
      console.error("Clear conversation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/chatbot/health", async (req, res) => {
    res.json({ status: "healthy", service: "chatbot" });
  });

  const httpServer = createServer(app);
  return httpServer;
}
