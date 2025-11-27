import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEmployeeSchema, insertCompanySchema, insertSalarySlipSchema } from "@shared/schema";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Employee Routes
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employees" });
    }
  });

  app.get("/api/employees/:id", async (req, res) => {
    try {
      const employee = await storage.getEmployee(parseInt(req.params.id));
      if (!employee) {
        return res.status(404).json({ error: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch employee" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const validated = insertEmployeeSchema.parse(req.body);
      
      // Check for duplicate employeeId
      const existing = await storage.getEmployeeByEmployeeId(validated.employeeId);
      if (existing) {
        return res.status(400).json({ error: "Employee ID already exists" });
      }
      
      const employee = await storage.createEmployee(validated);
      res.status(201).json(employee);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create employee" });
    }
  });

  app.patch("/api/employees/:id", async (req, res) => {
    try {
      const employee = await storage.updateEmployee(parseInt(req.params.id), req.body);
      res.json(employee);
    } catch (error) {
      res.status(500).json({ error: "Failed to update employee" });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      await storage.deleteEmployee(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete employee" });
    }
  });

  // Company Routes
  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch companies" });
    }
  });

  app.get("/api/companies/:id", async (req, res) => {
    try {
      const company = await storage.getCompany(parseInt(req.params.id));
      if (!company) {
        return res.status(404).json({ error: "Company not found" });
      }
      res.json(company);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch company" });
    }
  });

  app.post("/api/companies", async (req, res) => {
    try {
      const validated = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(validated);
      res.status(201).json(company);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create company" });
    }
  });

  app.patch("/api/companies/:id", async (req, res) => {
    try {
      const company = await storage.updateCompany(parseInt(req.params.id), req.body);
      res.json(company);
    } catch (error) {
      res.status(500).json({ error: "Failed to update company" });
    }
  });

  app.delete("/api/companies/:id", async (req, res) => {
    try {
      await storage.deleteCompany(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete company" });
    }
  });

  // Salary Slip Routes
  app.get("/api/salary-slips", async (req, res) => {
    try {
      const employeeId = req.query.employeeId ? parseInt(req.query.employeeId as string) : undefined;
      const slips = await storage.getSalarySlips(employeeId);
      res.json(slips);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch salary slips" });
    }
  });

  app.post("/api/salary-slips", async (req, res) => {
    try {
      const validated = insertSalarySlipSchema.parse(req.body);
      const slip = await storage.createSalarySlip(validated);
      res.status(201).json(slip);
    } catch (error: any) {
      res.status(400).json({ error: error.message || "Failed to create salary slip" });
    }
  });

  return httpServer;
}
