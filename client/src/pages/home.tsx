import { useState, useRef, useEffect } from "react";
import { SalaryForm } from "@/components/salary-form";
import { SalarySlip, Company } from "@/components/salary-slip";
import { calculateSalary, SalaryInput, SalaryResult } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import { Printer, Download, Plus, Trash2, Building2, Check } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Employee {
  id: string;
  name: string;
  basicSalary: number;
}

export default function Home() {
  const [input, setInput] = useState<SalaryInput>({
    employeeName: "",
    employeeId: "",
    month: "",
    basicSalary: 0,
    late10minCount: 0,
    late30minCount: 0,
    fullDayLeaveCount: 0,
    halfDayLeaveCount: 0,
  });

  const [result, setResult] = useState<SalaryResult>({
    effectiveLate30min: 0,
    extra10minLate: 0,
    extra30minLate: 0,
    leaveDeduction: 0,
    halfDayDeduction: 0,
    lateDeduction: 0,
    totalDeductions: 0,
    netSalary: 0,
  });

  // Employee Management State
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem("employees");
    return saved ? JSON.parse(saved) : [];
  });
  const [newEmployee, setNewEmployee] = useState<Partial<Employee>>({});
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  // Company Management State
  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem("companies");
    return saved ? JSON.parse(saved) : [];
  });
  const [newCompany, setNewCompany] = useState<Partial<Company>>({});
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(() => {
     const saved = localStorage.getItem("selectedCompanyId");
     return saved || "";
  });

  const slipRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    localStorage.setItem("employees", JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem("companies", JSON.stringify(companies));
  }, [companies]);
  
  useEffect(() => {
    localStorage.setItem("selectedCompanyId", selectedCompanyId);
  }, [selectedCompanyId]);

  const handleCalculate = (data: SalaryInput) => {
    setInput(data);
    setResult(calculateSalary(data));
  };

  // --- Employee Handlers ---
  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.id || !newEmployee.basicSalary) {
      toast({ title: "Validation Error", description: "All fields are required", variant: "destructive" });
      return;
    }
    if (employees.some(e => e.id === newEmployee.id)) {
      toast({ title: "Error", description: "Employee ID already exists", variant: "destructive" });
      return;
    }
    setEmployees([...employees, newEmployee as Employee]);
    setNewEmployee({});
    setIsAddEmployeeOpen(false);
    toast({ title: "Success", description: "Employee added successfully" });
  };

  const handleDeleteEmployee = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmployees(employees.filter(emp => emp.id !== id));
    if (selectedEmployeeId === id) setSelectedEmployeeId(null);
    toast({ title: "Deleted", description: "Employee removed" });
  };

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    setInput(prev => ({
      ...prev,
      employeeName: emp.name,
      employeeId: emp.id,
      basicSalary: emp.basicSalary
    }));
  };

  // --- Company Handlers ---
  const handleAddCompany = () => {
    if (!newCompany.name) {
      toast({ title: "Validation Error", description: "Company Name is required", variant: "destructive" });
      return;
    }
    const id = `comp_${Date.now()}`;
    const companyToAdd = { ...newCompany, id } as Company;
    setCompanies([...companies, companyToAdd]);
    setNewCompany({});
    setIsAddCompanyOpen(false);
    setSelectedCompanyId(id); // Auto select new company
    toast({ title: "Success", description: "Company added successfully" });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCompany(prev => ({ ...prev, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- PDF ---
  const handleDownloadPdf = async () => {
    // Create a temporary container for the PDF generation to avoid scaling/layout issues from the preview
    const elementToCapture = slipRef.current;
    if (!elementToCapture) return;

    setIsGenerating(true);
    try {
      // We clone the element to render it at full scale off-screen or in a controlled way
      // Actually, html2canvas works best if the element is visible. 
      // We will use the existing ref but ensure we pass correct options.
      
      const canvas = await html2canvas(elementToCapture, {
        scale: 3, // Higher quality
        useCORS: true, // Important for images (logos)
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 210 * 3.7795275591, // A4 width in pixels approx
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      
      const finalHeight = imgHeight * ratio;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, finalHeight);
      pdf.save(`Salary_Slip_${input.employeeName || 'Employee'}.pdf`);
      toast({ title: "Success", description: "PDF generated successfully." });
    } catch (error) {
      console.error("PDF Generation Error", error);
      toast({ title: "Error", description: "Failed to generate PDF. Please try again.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => window.print();

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans print:p-0 print:bg-white">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
        
        {/* Sidebar: Settings & Employees */}
        <div className="lg:col-span-3 space-y-6 print:hidden">
          
          {/* Company Selector */}
          <div className="space-y-2">
             <div className="flex items-center justify-between">
                <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Company</Label>
                <Dialog open={isAddCompanyOpen} onOpenChange={setIsAddCompanyOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6"><Plus className="w-4 h-4" /></Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Company</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Company Name</Label>
                        <Input 
                          placeholder="Acme Corp" 
                          value={newCompany.name || ""} 
                          onChange={e => setNewCompany({...newCompany, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Logo Image</Label>
                        <Input type="file" accept="image/*" onChange={handleLogoUpload} />
                        {newCompany.logoUrl && (
                          <img src={newCompany.logoUrl} alt="Preview" className="h-12 object-contain mt-2" />
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddCompany}>Save Company</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
             </div>
             
             <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex items-center gap-2">
                      {c.logoUrl ? <img src={c.logoUrl} className="w-4 h-4 object-contain" /> : <Building2 className="w-4 h-4" />}
                      {c.name}
                    </div>
                  </SelectItem>
                ))}
                {companies.length === 0 && <SelectItem value="none" disabled>No companies added</SelectItem>}
              </SelectContent>
             </Select>
          </div>

          {/* Employee List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">Employees</h2>
              <Dialog open={isAddEmployeeOpen} onOpenChange={setIsAddEmployeeOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-1" /> Add</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Employee ID</Label>
                      <Input 
                        placeholder="EMP-001" 
                        value={newEmployee.id || ""} 
                        onChange={e => setNewEmployee({...newEmployee, id: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input 
                        placeholder="John Doe" 
                        value={newEmployee.name || ""} 
                        onChange={e => setNewEmployee({...newEmployee, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Basic Salary</Label>
                      <Input 
                        type="number" 
                        placeholder="50000" 
                        value={newEmployee.basicSalary || ""} 
                        onChange={e => setNewEmployee({...newEmployee, basicSalary: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddEmployee}>Save Employee</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-2 pr-4">
                {employees.length === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-lg">
                    No employees added.
                  </div>
                )}
                {employees.map(emp => (
                  <div 
                    key={emp.id}
                    onClick={() => handleSelectEmployee(emp)}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent group",
                      selectedEmployeeId === emp.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "bg-white border-border"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium text-sm">{emp.name}</div>
                        <div className="text-xs text-muted-foreground">{emp.id}</div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => handleDeleteEmployee(emp.id, e)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Center Column: Input (Hidden on Print) */}
        <div className="lg:col-span-4 space-y-6 print:hidden">
          <div className="mb-4">
             <h1 className="text-xl font-bold text-gray-900 tracking-tight">Attendance Input</h1>
             <p className="text-xs text-muted-foreground">Select an employee and update this month's stats.</p>
          </div>

          <SalaryForm 
            onCalculate={handleCalculate} 
            defaultValues={input}
          />

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleDownloadPdf} 
              className="flex-1" 
              disabled={!input.employeeName || isGenerating}
            >
              {isGenerating ? "Generating..." : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
            <Button 
              variant="secondary" 
              onClick={handlePrint}
              className="flex-1"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print View
            </Button>
          </div>
          
          {/* Rules Summary Card */}
          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-lg text-[10px] text-blue-800 space-y-2">
            <h4 className="font-semibold uppercase tracking-wider mb-2">New Policy Rules</h4>
            <ul className="list-disc list-inside space-y-1 opacity-80">
              <li>10m Allowed: 2 per month</li>
              <li>30m Allowed: 2 per month</li>
              <li><strong>Updated:</strong> Every 2 excess 10min lates = 1 Equivalent 30min Late.</li>
              <li>Deduction: Half day salary for every 30min unit exceeding allowance (2).</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Preview (Visible on Print) */}
        <div className="lg:col-span-5 print:w-full">
          <div className="sticky top-8">
             <div className="flex items-center justify-between mb-4 print:hidden">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Live Preview</h2>
                <div className="text-xs text-muted-foreground">A4 Format</div>
             </div>
             
             <div className="border rounded-lg bg-white shadow-sm overflow-hidden print:border-0 print:shadow-none">
               <div className="bg-white print:p-0 scale-[0.85] origin-top-left transform-gpu md:scale-100">
                 <SalarySlip 
                   ref={slipRef} 
                   input={input} 
                   result={result} 
                   company={selectedCompany}
                 />
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
