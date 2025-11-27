import { useState, useRef, useEffect } from "react";
import { SalaryForm } from "@/components/salary-form";
import { SalarySlip } from "@/components/salary-slip";
import { calculateSalary, SalaryInput, SalaryResult } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import { Printer, Download, Plus, User, Trash2, Edit2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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

  const slipRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    localStorage.setItem("employees", JSON.stringify(employees));
  }, [employees]);

  const handleCalculate = (data: SalaryInput) => {
    setInput(data);
    setResult(calculateSalary(data));
  };

  const handleAddEmployee = () => {
    if (!newEmployee.name || !newEmployee.id || !newEmployee.basicSalary) {
      toast({ title: "Validation Error", description: "All fields are required", variant: "destructive" });
      return;
    }
    
    // Check for duplicate ID
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
    if (selectedEmployeeId === id) {
      setSelectedEmployeeId(null);
      // Optional: Reset form
    }
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

  const handleDownloadPdf = async () => {
    if (!slipRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(slipRef.current, {
        scale: 2,
        logging: false,
        backgroundColor: "#ffffff"
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = canvas.width;
      const ratio = pdfWidth / imgWidth;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, canvas.height * ratio);
      pdf.save(`Salary_Slip_${input.employeeName || 'Employee'}.pdf`);
      
      toast({
        title: "Success",
        description: "Salary slip PDF generated successfully.",
      });
    } catch (error) {
      console.error("PDF Generation Error", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans print:p-0 print:bg-white">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
        
        {/* Sidebar: Employee List (Hidden on Print) */}
        <div className="lg:col-span-3 space-y-4 print:hidden">
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

          <ScrollArea className="h-[calc(100vh-200px)]">
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
              data-testid="button-pdf"
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
              data-testid="button-print"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print View
            </Button>
          </div>
          
          {/* Rules Summary Card */}
          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-lg text-[10px] text-blue-800 space-y-2">
            <h4 className="font-semibold uppercase tracking-wider mb-2">Policy Rules</h4>
            <ul className="list-disc list-inside space-y-1 opacity-80">
              <li>10m Allowed: 2 per month</li>
              <li>30m Allowed: 2 per month</li>
              <li>Full Day Allowed: 1 per month</li>
              <li>Excess 10m converts to 30m (4:1 ratio)</li>
              <li>Deduction: Half day salary for every excess 30m late</li>
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
                 <SalarySlip ref={slipRef} input={input} result={result} />
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
