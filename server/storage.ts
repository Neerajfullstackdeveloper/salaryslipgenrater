import { 
  type User, 
  type InsertUser,
  type Employee,
  type InsertEmployee,
  type Company,
  type InsertCompany,
  type SalarySlip,
  type InsertSalarySlip,
} from "@shared/schema";

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
  // This class is no longer used — the app runs on InMemoryStorage only.
  // Kept here for reference but will throw if instantiated.
  constructor() {
    throw new Error("DatabaseStorage is no longer supported. Use InMemoryStorage instead.");
  }

  async getUser(_id: string): Promise<User | undefined> {
    throw new Error("Not implemented");
  }
  async getUserByUsername(_username: string): Promise<User | undefined> {
    throw new Error("Not implemented");
  }
  async createUser(_user: InsertUser): Promise<User> {
    throw new Error("Not implemented");
  }
  async getEmployees(): Promise<Employee[]> {
    throw new Error("Not implemented");
  }
  async getEmployee(_id: number): Promise<Employee | undefined> {
    throw new Error("Not implemented");
  }
  async getEmployeeByEmployeeId(_employeeId: string): Promise<Employee | undefined> {
    throw new Error("Not implemented");
  }
  async createEmployee(_insertEmployee: InsertEmployee): Promise<Employee> {
    throw new Error("Not implemented");
  }
  async updateEmployee(_id: number, _updateData: Partial<InsertEmployee>): Promise<Employee> {
    throw new Error("Not implemented");
  }
  async deleteEmployee(_id: number): Promise<void> {
    throw new Error("Not implemented");
  }
  async getCompanies(): Promise<Company[]> {
    throw new Error("Not implemented");
  }
  async getCompany(_id: number): Promise<Company | undefined> {
    throw new Error("Not implemented");
  }
  async createCompany(_insertCompany: InsertCompany): Promise<Company> {
    throw new Error("Not implemented");
  }
  async updateCompany(_id: number, _updateData: Partial<InsertCompany>): Promise<Company> {
    throw new Error("Not implemented");
  }
  async deleteCompany(_id: number): Promise<void> {
    throw new Error("Not implemented");
  }
  async getSalarySlips(_employeeId?: number): Promise<SalarySlip[]> {
    throw new Error("Not implemented");
  }
  async createSalarySlip(_insertSlip: InsertSalarySlip): Promise<SalarySlip> {
    throw new Error("Not implemented");
  }
}

class InMemoryStorage implements IStorage {
  private users: User[] = [];
  private employees: Employee[] = [];
  private companies: Company[] = [];
  private salarySlips: SalarySlip[] = [];

  private userIdCounter = 0;
  private employeeIdCounter = 0;
  private companyIdCounter = 0;
  private salarySlipIdCounter = 0;

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const created: any = { ...user, id: `${++this.userIdCounter}` };
    this.users.push(created);
    return created;
  }

  // Employee methods
  async getEmployees(): Promise<Employee[]> {
    return [...this.employees];
  }

  async getEmployee(id: number): Promise<Employee | undefined> {
    return this.employees.find(e => e.id === id);
  }

  async getEmployeeByEmployeeId(employeeId: string): Promise<Employee | undefined> {
    return this.employees.find(e => e.employeeId === employeeId);
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const created: any = { ...insertEmployee, id: ++this.employeeIdCounter };
    this.employees.push(created);
    return created;
  }

  async updateEmployee(id: number, updateData: Partial<InsertEmployee>): Promise<Employee> {
    const idx = this.employees.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Employee not found');
    this.employees[idx] = { ...this.employees[idx], ...updateData } as Employee;
    return this.employees[idx];
  }

  async deleteEmployee(id: number): Promise<void> {
    this.employees = this.employees.filter(e => e.id !== id);
  }

  // Company methods
  async getCompanies(): Promise<Company[]> {
    return [...this.companies];
  }

  async getCompany(id: number): Promise<Company | undefined> {
    return this.companies.find(c => c.id === id);
  }

  async createCompany(insertCompany: InsertCompany): Promise<Company> {
    const created: any = { ...insertCompany, id: ++this.companyIdCounter };
    this.companies.push(created);
    return created;
  }

  async updateCompany(id: number, updateData: Partial<InsertCompany>): Promise<Company> {
    const idx = this.companies.findIndex(c => c.id === id);
    if (idx === -1) throw new Error('Company not found');
    this.companies[idx] = { ...this.companies[idx], ...updateData } as Company;
    return this.companies[idx];
  }

  async deleteCompany(id: number): Promise<void> {
    this.companies = this.companies.filter(c => c.id !== id);
  }

  // Salary Slip methods
  async getSalarySlips(employeeId?: number): Promise<SalarySlip[]> {
    if (employeeId) return this.salarySlips.filter(s => s.employeeId === employeeId);
    return [...this.salarySlips];
  }

  async createSalarySlip(insertSlip: InsertSalarySlip): Promise<SalarySlip> {
    const created: any = { ...insertSlip, id: ++this.salarySlipIdCounter };
    this.salarySlips.push(created);
    return created;
  }
}

export const storage = new InMemoryStorage();
