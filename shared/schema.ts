import { z } from "zod";

// User schema
export const insertUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = InsertUser & { id: string };

// Employee schema
export const insertEmployeeSchema = z.object({
  employeeId: z.string().min(1),
  name: z.string().min(1),
  basicSalary: z.number().int().positive(),
});

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = InsertEmployee & { id: number; createdAt: Date };

// Company schema
export const insertCompanySchema = z.object({
  name: z.string().min(1),
  logoUrl: z.string().optional().nullable(),
});

export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = InsertCompany & { id: number; createdAt: Date };

// Salary Slip schema
export const insertSalarySlipSchema = z.object({
  employeeId: z.number().int().positive(),
  companyId: z.number().int().positive().optional().nullable(),
  month: z.string().min(1),
  basicSalary: z.number().int().positive(),
  late10minCount: z.number().int().nonnegative().default(0),
  late30minCount: z.number().int().nonnegative().default(0),
  fullDayLeaveCount: z.number().int().nonnegative().default(0),
  halfDayLeaveCount: z.number().int().nonnegative().default(0),
  totalDeductions: z.number().int().nonnegative(),
  netSalary: z.number().int().nonnegative(),
});

export type InsertSalarySlip = z.infer<typeof insertSalarySlipSchema>;
export type SalarySlip = InsertSalarySlip & { id: number; createdAt: Date };

// Re-export table references (no longer needed but kept for compatibility)
export const users = null;
export const employees = null;
export const companies = null;
export const salarySlips = null;
