import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = ["student", "admin"] as const;
export const eventStatusEnum = ["upcoming", "active", "completed", "cancelled"] as const;
export const checkinMethodEnum = ["manual", "qr", "self"] as const;

// Tables
export const users = sqliteTable("users", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: userRoleEnum }).notNull().default("student"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  collegeId: text("college_id"),
});

export const colleges = sqliteTable("colleges", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  name: text("name").notNull().unique(),
  location: text("location").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export const events = sqliteTable("events", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  title: text("title").notNull(),
  description: text("description"),
  date: integer("date", { mode: "timestamp" }).notNull(),
  location: text("location").notNull(),
  capacity: integer("capacity").notNull(),
  registrationDeadline: integer("registration_deadline", { mode: "timestamp" }),
  status: text("status", { enum: eventStatusEnum }).notNull().default("upcoming"),
  imageUrl: text("image_url"),
  tags: text("tags"), // JSON string of tags array
  requirements: text("requirements"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
  createdBy: text("created_by").notNull(),
  collegeId: text("college_id").notNull(),
});

export const registrations = sqliteTable("registrations", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  eventId: text("event_id").notNull(),
  studentId: text("student_id").notNull(),
  registeredAt: integer("registered_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export const attendance = sqliteTable("attendance", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  eventId: text("event_id").notNull(),
  studentId: text("student_id").notNull(),
  checkinMethod: text("checkin_method", { enum: checkinMethodEnum }).notNull().default("manual"),
  checkedInAt: integer("checked_in_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

export const feedback = sqliteTable("feedback", {
  id: text("id").primaryKey().default(sql`(lower(hex(randomblob(16))))`),
  eventId: text("event_id").notNull(),
  studentId: text("student_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  submittedAt: integer("submitted_at", { mode: "timestamp" }).default(sql`(unixepoch())`).notNull(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  college: one(colleges, {
    fields: [users.collegeId],
    references: [colleges.id],
  }),
  eventsCreated: many(events),
  registrations: many(registrations),
  attendance: many(attendance),
  feedback: many(feedback),
}));

export const collegesRelations = relations(colleges, ({ many }) => ({
  users: many(users),
  events: many(events),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, {
    fields: [events.createdBy],
    references: [users.id],
  }),
  college: one(colleges, {
    fields: [events.collegeId],
    references: [colleges.id],
  }),
  registrations: many(registrations),
  attendance: many(attendance),
  feedback: many(feedback),
}));

export const registrationsRelations = relations(registrations, ({ one }) => ({
  event: one(events, {
    fields: [registrations.eventId],
    references: [events.id],
  }),
  student: one(users, {
    fields: [registrations.studentId],
    references: [users.id],
  }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  event: one(events, {
    fields: [attendance.eventId],
    references: [events.id],
  }),
  student: one(users, {
    fields: [attendance.studentId],
    references: [users.id],
  }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  event: one(events, {
    fields: [feedback.eventId],
    references: [events.id],
  }),
  student: one(users, {
    fields: [feedback.studentId],
    references: [users.id],
  }),
}));

// Zod schemas for validation and type inference
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertCollegeSchema = createInsertSchema(colleges);
export const selectCollegeSchema = createSelectSchema(colleges);
export const insertEventSchema = createInsertSchema(events);
export const selectEventSchema = createSelectSchema(events);
export const insertRegistrationSchema = createInsertSchema(registrations);
export const selectRegistrationSchema = createSelectSchema(registrations);
export const insertAttendanceSchema = createInsertSchema(attendance);
export const selectAttendanceSchema = createSelectSchema(attendance);
export const insertFeedbackSchema = createInsertSchema(feedback);
export const selectFeedbackSchema = createSelectSchema(feedback);

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type College = typeof colleges.$inferSelect;
export type InsertCollege = typeof colleges.$inferInsert;
export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
export type Registration = typeof registrations.$inferSelect;
export type InsertRegistration = typeof registrations.$inferInsert;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = typeof attendance.$inferInsert;
export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = typeof feedback.$inferInsert;
