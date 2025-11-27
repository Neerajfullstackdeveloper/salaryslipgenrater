import { useState, useRef } from "react";
import { SalaryForm } from "@/components/salary-form";
import { SalarySlip } from "@/components/salary-slip";
import { calculateSalary, SalaryInput, SalaryResult } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import { Printer, Download, Plus, Trash2, Building2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { employeeApi, companyApi } from "@/lib/api";
import type { Employee, Company, InsertEmployee, InsertCompany } from "@shared/schema";

export default function Home() {
  const [input, setInput] = useState<SalaryInput>({
    employeeName: "",
    employeeId: "",
    month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
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

  const [newEmployee, setNewEmployee] = useState<Partial<InsertEmployee>>({});
  const [isAddEmployeeOpen, setIsAddEmployeeOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);

  const [newCompany, setNewCompany] = useState<Partial<InsertCompany>>({});
  const [isAddCompanyOpen, setIsAddCompanyOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);

  const slipRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  // Fetch employees
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: employeeApi.getAll,
  });

  // Fetch companies
  const { data: companies = [], isLoading: companiesLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: companyApi.getAll,
  });

  // Employee mutations
  const createEmployeeMutation = useMutation({
    mutationFn: employeeApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setNewEmployee({});
      setIsAddEmployeeOpen(false);
      toast({ title: "Success", description: "Employee added successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create employee", variant: "destructive" });
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: employeeApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast({ title: "Deleted", description: "Employee removed" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete employee", variant: "destructive" });
    },
  });

  // Company mutations
  const createCompanyMutation = useMutation({
    mutationFn: companyApi.create,
    onSuccess: (newCompany) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      setNewCompany({});
      setIsAddCompanyOpen(false);
      setSelectedCompanyId(newCompany.id);
      toast({ title: "Success", description: "Company added successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create company", variant: "destructive" });
    },
  });

  const deleteCompanyMutation = useMutation({
    mutationFn: companyApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast({ title: "Deleted", description: "Company removed" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete company", variant: "destructive" });
    },
  });

  const handleCalculate = (data: SalaryInput) => {
    setInput(data);
    setResult(calculateSalary(data));
  };

  // --- Employee Handlers ---
  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.employeeId || !newEmployee.basicSalary) {
      toast({ title: "Validation Error", description: "All fields are required", variant: "destructive" });
      return;
    }
    createEmployeeMutation.mutate(newEmployee as InsertEmployee);
  };

  const handleDeleteEmployee = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedEmployeeId === id) setSelectedEmployeeId(null);
    deleteEmployeeMutation.mutate(id);
  };

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployeeId(emp.id);
    setInput(prev => ({
      ...prev,
      employeeName: emp.name,
      employeeId: emp.employeeId,
      basicSalary: emp.basicSalary
    }));
  };

  // --- Company Handlers ---
  const handleAddCompany = () => {
    if (!newCompany.name) {
      toast({ title: "Validation Error", description: "Company Name is required", variant: "destructive" });
      return;
    }
    createCompanyMutation.mutate(newCompany as InsertCompany);
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
    const elementToCapture = slipRef.current;
    if (!elementToCapture) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(elementToCapture, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: 210 * 3.7795275591,
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
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
                      <Button onClick={handleAddCompany} disabled={createCompanyMutation.isPending}>
                        {createCompanyMutation.isPending ? "Saving..." : "Save Company"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
             </div>
             
             <Select 
               value={selectedCompanyId?.toString() || ""} 
               onValueChange={(value) => setSelectedCompanyId(value ? parseInt(value) : null)}
             >
              <SelectTrigger>
                <SelectValue placeholder={companiesLoading ? "Loading..." : "Select Company"} />
              </SelectTrigger>
              <SelectContent>
                {companies.map(c => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    <div className="flex items-center gap-2">
                      {c.logoUrl ? <img src={c.logoUrl} className="w-4 h-4 object-contain" alt="" /> : <Building2 className="w-4 h-4" />}
                      {c.name}
                    </div>
                  </SelectItem>
                ))}
                {companies.length === 0 && !companiesLoading && (
                  <SelectItem value="none" disabled>No companies added</SelectItem>
                )}
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
                        value={newEmployee.employeeId || ""} 
                        onChange={e => setNewEmployee({...newEmployee, employeeId: e.target.value})}
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
                    <Button onClick={handleAddEmployee} disabled={createEmployeeMutation.isPending}>
                      {createEmployeeMutation.isPending ? "Saving..." : "Save Employee"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-2 pr-4">
                {employeesLoading && (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    Loading employees...
                  </div>
                )}
                {!employeesLoading && employees.length === 0 && (
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
                        <div className="text-xs text-muted-foreground">{emp.employeeId}</div>
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

        {/* Center Column: Input */}
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

        {/* Right Column: Preview */}
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
