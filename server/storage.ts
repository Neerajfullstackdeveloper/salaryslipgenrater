import { 
  type User, 
  type InsertUser,
  type Employee,
  type InsertEmployee,
  type Company,
  type InsertCompany,
  type SalarySlip,
  type InsertSalarySlip,
  users,
  employees,
  companies,
  salarySlips
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Employee methods
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: number): Promise<Employee | undefined>;
  getEmployeeByEmployeeId(employeeId: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: number, employee: Partial<InsertEmployee>): Promise<Employee>;
  deleteEmployee(id: number): Promise<void>;
  
  // Company methods
  getCompanies(): Promise<Company[]>;
  getCompany(id: number): Promise<Company | undefined>;
  createCompany(company: InsertCompany): Promise<Company>;
  updateCompany(id: number, company: Partial<InsertCompany>): Promise<Company>;
  deleteCompany(id: number): Promise<void>;
  
  // Salary Slip methods (for history)
  getSalarySlips(employeeId?: number): Promise<SalarySlip[]>;
  createSalarySlip(slip: InsertSalarySlip): Promise<SalarySlip>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Employee methods
  async getEmployees(): Promise<Employee[]> {
    return await db.select().from(employees);
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.id, id));
    return employee || undefined;
  }

  async getEmployeeByEmployeeId(employeeId: string): Promise<Employee | undefined> {
    const [employee] = await db.select().from(employees).where(eq(employees.employeeId, employeeId));
    return employee || undefined;
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const [employee] = await db.insert(employees).values(insertEmployee).returning();
    return employee;
  }

  async updateEmployee(id: number, updateData: Partial<InsertEmployee>): Promise<Employee> {
    const [employee] = await db.update(employees).set(updateData).where(eq(employees.id, id)).returning();
    return employee;
  }

  async deleteEmployee(id: number): Promise<void> {
    await db.delete(employees).where(eq(employees.id, id));
  }

  // Company methods
  async getCompanies(): Promise<Company[]> {
    return await db.select().from(companies);
  }

  async getCompany(id: number): Promise<Company | undefined> {
    const [company] = await db.select().from(companies).where(eq(companies.id, id));
    return company || undefined;
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const [company] = await db.insert(companies).values(insertCompany).returning();
    return company;
  }

  async updateCompany(id: number, updateData: Partial<InsertCompany>): Promise<Company> {
    const [company] = await db.update(companies).set(updateData).where(eq(companies.id, id)).returning();
    return company;
  }

  async deleteCompany(id: number): Promise<void> {
    await db.delete(companies).where(eq(companies.id, id));
  }

  // Salary Slip methods
  async getSalarySlips(employeeId?: number): Promise<SalarySlip[]> {
    if (employeeId) {
      return await db.select().from(salarySlips).where(eq(salarySlips.employeeId, employeeId));
    }
    return await db.select().from(salarySlips);
  }

  async createSalarySlip(insertSlip: InsertSalarySlip): Promise<SalarySlip> {
    const [slip] = await db.insert(salarySlips).values(insertSlip).returning();
    return slip;
  }
}

export const storage = new DatabaseStorage();
