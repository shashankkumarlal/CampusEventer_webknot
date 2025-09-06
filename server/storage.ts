import { 
  users, colleges, events, registrations, attendance, feedback,
  type User, type InsertUser, type College, type InsertCollege,
  type Event, type InsertEvent, type Registration, type InsertRegistration,
  type Attendance, type InsertAttendance, type Feedback, type InsertFeedback
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, count, sql, and, avg, gte, lte } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // College methods
  getColleges(): Promise<College[]>;
  createCollege(college: InsertCollege): Promise<College>;
  
  // Event methods
  getEvents(filters?: { type?: string; search?: string; date?: string }): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent & { createdBy: string }): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event>;
  deleteEvent(id: string): Promise<void>;
  getEventsByCreator(creatorId: string): Promise<Event[]>;
  
  // Registration methods
  getRegistration(eventId: string, studentId: string): Promise<Registration | undefined>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
  deleteRegistration(eventId: string, studentId: string): Promise<void>;
  getRegistrationsByStudent(studentId: string): Promise<(Registration & { event: Event })[]>;
  getRegistrationsByEvent(eventId: string): Promise<(Registration & { student: User })[]>;
  getEventRegistrationCount(eventId: string): Promise<number>;
  
  // Attendance methods
  getAttendance(eventId: string, studentId: string): Promise<Attendance | undefined>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  getAttendanceByEvent(eventId: string): Promise<(Attendance & { student: User })[]>;
  getAttendanceByStudent(studentId: string): Promise<(Attendance & { event: Event })[]>;
  
  // Feedback methods
  getFeedback(eventId: string, studentId: string): Promise<Feedback | undefined>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getFeedbackByEvent(eventId: string): Promise<(Feedback & { student: User })[]>;
  getFeedbackByStudent(studentId: string): Promise<(Feedback & { event: Event })[]>;
  
  // Analytics methods
  getEventPopularity(): Promise<{ eventId: string; title: string; registrationCount: number }[]>;
  getTopStudents(): Promise<{ studentId: string; name: string; attendanceCount: number }[]>;
  getFeedbackAnalytics(): Promise<{ eventId: string; title: string; averageRating: number; feedbackCount: number }[]>;
  
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // College methods
  async getColleges(): Promise<College[]> {
    return await db.select().from(colleges).orderBy(colleges.name);
  }

  async createCollege(college: InsertCollege): Promise<College> {
    const [newCollege] = await db.insert(colleges).values(college).returning();
    return newCollege;
  }

  // Event methods
  async getEvents(filters?: { type?: string; search?: string; date?: string }): Promise<Event[]> {
    let query = db.select().from(events);

    if (filters?.type) {
      query = query.where(eq(events.type, filters.type as any));
    }

    if (filters?.search) {
      query = query.where(
        sql`${events.title} ILIKE ${`%${filters.search}%`} OR ${events.description} ILIKE ${`%${filters.search}%`}`
      );
    }

    if (filters?.date) {
      const targetDate = new Date(filters.date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query = query.where(
        and(
          gte(events.date, targetDate),
          lte(events.date, nextDay)
        )
      );
    }

    return await query.orderBy(events.date);
  }

  async getEvent(id: string): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async createEvent(event: InsertEvent & { createdBy: string }): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  async updateEvent(id: string, event: Partial<InsertEvent>): Promise<Event> {
    const [updatedEvent] = await db
      .update(events)
      .set(event)
      .where(eq(events.id, id))
      .returning();
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  async getEventsByCreator(creatorId: string): Promise<Event[]> {
    return await db
      .select()
      .from(events)
      .where(eq(events.createdBy, creatorId))
      .orderBy(desc(events.createdAt));
  }

  // Registration methods
  async getRegistration(eventId: string, studentId: string): Promise<Registration | undefined> {
    const [registration] = await db
      .select()
      .from(registrations)
      .where(and(eq(registrations.eventId, eventId), eq(registrations.studentId, studentId)));
    return registration || undefined;
  }

  async createRegistration(registration: InsertRegistration): Promise<Registration> {
    const [newRegistration] = await db
      .insert(registrations)
      .values(registration)
      .returning();
    return newRegistration;
  }

  async deleteRegistration(eventId: string, studentId: string): Promise<void> {
    await db
      .delete(registrations)
      .where(and(eq(registrations.eventId, eventId), eq(registrations.studentId, studentId)));
  }

  async getRegistrationsByStudent(studentId: string): Promise<(Registration & { event: Event })[]> {
    return await db
      .select({
        id: registrations.id,
        eventId: registrations.eventId,
        studentId: registrations.studentId,
        registeredAt: registrations.registeredAt,
        event: events,
      })
      .from(registrations)
      .innerJoin(events, eq(registrations.eventId, events.id))
      .where(eq(registrations.studentId, studentId))
      .orderBy(desc(events.date));
  }

  async getRegistrationsByEvent(eventId: string): Promise<(Registration & { student: User })[]> {
    return await db
      .select({
        id: registrations.id,
        eventId: registrations.eventId,
        studentId: registrations.studentId,
        registeredAt: registrations.registeredAt,
        student: users,
      })
      .from(registrations)
      .innerJoin(users, eq(registrations.studentId, users.id))
      .where(eq(registrations.eventId, eventId))
      .orderBy(registrations.registeredAt);
  }

  async getEventRegistrationCount(eventId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(registrations)
      .where(eq(registrations.eventId, eventId));
    return result.count;
  }

  // Attendance methods
  async getAttendance(eventId: string, studentId: string): Promise<Attendance | undefined> {
    const [attendance] = await db
      .select()
      .from(attendance)
      .where(and(eq(attendance.eventId, eventId), eq(attendance.studentId, studentId)));
    return attendance || undefined;
  }

  async createAttendance(attendanceRecord: InsertAttendance): Promise<Attendance> {
    const [newAttendance] = await db
      .insert(attendance)
      .values(attendanceRecord)
      .returning();
    return newAttendance;
  }

  async getAttendanceByEvent(eventId: string): Promise<(Attendance & { student: User })[]> {
    return await db
      .select({
        id: attendance.id,
        eventId: attendance.eventId,
        studentId: attendance.studentId,
        checkinMethod: attendance.checkinMethod,
        checkedInAt: attendance.checkedInAt,
        student: users,
      })
      .from(attendance)
      .innerJoin(users, eq(attendance.studentId, users.id))
      .where(eq(attendance.eventId, eventId))
      .orderBy(attendance.checkedInAt);
  }

  async getAttendanceByStudent(studentId: string): Promise<(Attendance & { event: Event })[]> {
    return await db
      .select({
        id: attendance.id,
        eventId: attendance.eventId,
        studentId: attendance.studentId,
        checkinMethod: attendance.checkinMethod,
        checkedInAt: attendance.checkedInAt,
        event: events,
      })
      .from(attendance)
      .innerJoin(events, eq(attendance.eventId, events.id))
      .where(eq(attendance.studentId, studentId))
      .orderBy(desc(events.date));
  }

  // Feedback methods
  async getFeedback(eventId: string, studentId: string): Promise<Feedback | undefined> {
    const [feedbackRecord] = await db
      .select()
      .from(feedback)
      .where(and(eq(feedback.eventId, eventId), eq(feedback.studentId, studentId)));
    return feedbackRecord || undefined;
  }

  async createFeedback(feedbackRecord: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await db
      .insert(feedback)
      .values(feedbackRecord)
      .returning();
    return newFeedback;
  }

  async getFeedbackByEvent(eventId: string): Promise<(Feedback & { student: User })[]> {
    return await db
      .select({
        id: feedback.id,
        eventId: feedback.eventId,
        studentId: feedback.studentId,
        rating: feedback.rating,
        comment: feedback.comment,
        submittedAt: feedback.submittedAt,
        student: users,
      })
      .from(feedback)
      .innerJoin(users, eq(feedback.studentId, users.id))
      .where(eq(feedback.eventId, eventId))
      .orderBy(desc(feedback.submittedAt));
  }

  async getFeedbackByStudent(studentId: string): Promise<(Feedback & { event: Event })[]> {
    return await db
      .select({
        id: feedback.id,
        eventId: feedback.eventId,
        studentId: feedback.studentId,
        rating: feedback.rating,
        comment: feedback.comment,
        submittedAt: feedback.submittedAt,
        event: events,
      })
      .from(feedback)
      .innerJoin(events, eq(feedback.eventId, events.id))
      .where(eq(feedback.studentId, studentId))
      .orderBy(desc(feedback.submittedAt));
  }

  // Analytics methods
  async getEventPopularity(): Promise<{ eventId: string; title: string; registrationCount: number }[]> {
    return await db
      .select({
        eventId: events.id,
        title: events.title,
        registrationCount: count(registrations.id),
      })
      .from(events)
      .leftJoin(registrations, eq(events.id, registrations.eventId))
      .groupBy(events.id, events.title)
      .orderBy(desc(count(registrations.id)))
      .limit(10);
  }

  async getTopStudents(): Promise<{ studentId: string; name: string; attendanceCount: number }[]> {
    return await db
      .select({
        studentId: users.id,
        name: users.name,
        attendanceCount: count(attendance.id),
      })
      .from(users)
      .leftJoin(attendance, eq(users.id, attendance.studentId))
      .where(eq(users.role, "student"))
      .groupBy(users.id, users.name)
      .orderBy(desc(count(attendance.id)))
      .limit(10);
  }

  async getFeedbackAnalytics(): Promise<{ eventId: string; title: string; averageRating: number; feedbackCount: number }[]> {
    return await db
      .select({
        eventId: events.id,
        title: events.title,
        averageRating: avg(feedback.rating),
        feedbackCount: count(feedback.id),
      })
      .from(events)
      .leftJoin(feedback, eq(events.id, feedback.eventId))
      .groupBy(events.id, events.title)
      .orderBy(desc(avg(feedback.rating)))
      .limit(10);
  }
}

export const storage = new DatabaseStorage();
