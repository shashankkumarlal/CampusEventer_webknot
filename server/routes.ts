import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { 
  insertEventSchema, insertRegistrationSchema, 
  insertAttendanceSchema, insertFeedbackSchema,
  type Event, type User
} from "@shared/schema";
import { z } from "zod";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

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
      const { type, search, date } = req.query;
      const events = await storage.getEvents({
        type: type as string,
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
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent({
        ...validatedData,
        createdBy: (req.user as User).id,
      });
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.put("/api/events/:id", requireAdmin, async (req, res) => {
    try {
      const event = await storage.getEvent(req.params.id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const validatedData = insertEventSchema.partial().parse(req.body);
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
      if (registrationCount >= event.maxCapacity) {
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

      const validatedData = insertFeedbackSchema.parse({
        ...req.body,
        eventId,
        studentId,
      });

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

  const httpServer = createServer(app);
  return httpServer;
}
