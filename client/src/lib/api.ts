import type { Employee, Company, InsertEmployee, InsertCompany } from "@shared/schema";

const API_BASE = "/api";

// Employee API
export const employeeApi = {
  getAll: async (): Promise<Employee[]> => {
    const res = await fetch(`${API_BASE}/employees`);
    if (!res.ok) throw new Error("Failed to fetch employees");
    return res.json();
  },

  create: async (employee: InsertEmployee): Promise<Employee> => {
    const res = await fetch(`${API_BASE}/employees`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(employee),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to create employee");
    }
    return res.json();
  },

  update: async (id: number, data: Partial<InsertEmployee>): Promise<Employee> => {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update employee");
    return res.json();
  },

  delete: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/employees/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete employee");
  },
};

// Company API
export const companyApi = {
  getAll: async (): Promise<Company[]> => {
    const res = await fetch(`${API_BASE}/companies`);
    if (!res.ok) throw new Error("Failed to fetch companies");
    return res.json();
  },

  create: async (company: InsertCompany): Promise<Company> => {
    const res = await fetch(`${API_BASE}/companies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(company),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to create company");
    }
    return res.json();
  },

  update: async (id: number, data: Partial<InsertCompany>): Promise<Company> => {
    const res = await fetch(`${API_BASE}/companies/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update company");
    return res.json();
  },

  delete: async (id: number): Promise<void> => {
    const res = await fetch(`${API_BASE}/companies/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete company");
  },
};
