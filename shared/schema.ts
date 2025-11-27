import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Employees Table
export const employees = pgTable("employees", {
  id: serial("id").primaryKey(),
  employeeId: text("employee_id").notNull().unique(),
  name: text("name").notNull(),
  basicSalary: integer("basic_salary").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
});

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

// Companies Table
export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

// Salary Slips Table (for historical tracking)
export const salarySlips = pgTable("salary_slips", {
  id: serial("id").primaryKey(),
  employeeId: integer("employee_id").notNull().references(() => employees.id),
  companyId: integer("company_id").references(() => companies.id),
  month: text("month").notNull(),
  basicSalary: integer("basic_salary").notNull(),
  late10minCount: integer("late_10min_count").notNull().default(0),
  late30minCount: integer("late_30min_count").notNull().default(0),
  fullDayLeaveCount: integer("full_day_leave_count").notNull().default(0),
  halfDayLeaveCount: integer("half_day_leave_count").notNull().default(0),
  totalDeductions: integer("total_deductions").notNull(),
  netSalary: integer("net_salary").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSalarySlipSchema = createInsertSchema(salarySlips).omit({
  id: true,
  createdAt: true,
});

export type InsertSalarySlip = z.infer<typeof insertSalarySlipSchema>;
export type SalarySlip = typeof salarySlips.$inferSelect;
