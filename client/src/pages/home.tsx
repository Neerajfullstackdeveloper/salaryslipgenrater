import { useState, useRef } from "react";
import { SalaryForm } from "@/components/salary-form";
import { SalarySlip } from "@/components/salary-slip";
import { calculateSalary, SalaryInput, SalaryResult } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [input, setInput] = useState<SalaryInput>({
    employeeName: "",
    employeeId: "",
    month: "",
    basicSalary: 0,
    late10minCount: 0,
    late30minCount: 0,
    fullDayLeaveCount: 0,
  });

  const [result, setResult] = useState<SalaryResult>({
    effectiveLate30min: 0,
    extra10minLate: 0,
    extra30minLate: 0,
    leaveDeduction: 0,
    lateDeduction: 0,
    totalDeductions: 0,
    netSalary: 0,
  });

  const slipRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCalculate = (data: SalaryInput) => {
    setInput(data);
    setResult(calculateSalary(data));
  };

  const handleDownloadPdf = async () => {
    if (!slipRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(slipRef.current, {
        scale: 2, // Higher resolution
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
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 30;

      // pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, (canvas.height * pdfWidth) / canvas.width);
      // Better fitting
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, (canvas.height * pdfWidth) / canvas.width);
      
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
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-12 font-sans print:p-0 print:bg-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
        
        {/* Left Column: Input & Controls (Hidden on Print) */}
        <div className="lg:col-span-5 space-y-6 print:hidden">
          <div className="mb-8">
             <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payroll Admin</h1>
             <p className="text-muted-foreground">Generate and manage employee salary slips.</p>
          </div>

          <SalaryForm onCalculate={handleCalculate} />

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
          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-lg text-xs text-blue-800 space-y-2 mt-8">
            <h4 className="font-semibold uppercase tracking-wider mb-2">Policy Rules</h4>
            <ul className="list-disc list-inside space-y-1 opacity-80">
              <li>10m Allowed: 2 per month</li>
              <li>30m Allowed: 2 per month</li>
              <li>Full Day Allowed: 1 per month</li>
              <li>4 x 10m Lates = 1 x 30m Late (Effective)</li>
              <li>Deduction: Half day salary for every excess 30m late</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Preview (Visible on Print) */}
        <div className="lg:col-span-7 print:w-full">
          <div className="sticky top-8">
             <div className="flex items-center justify-between mb-4 print:hidden">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Live Preview</h2>
                <div className="text-xs text-muted-foreground">A4 Format</div>
             </div>
             
             <div className="border rounded-lg bg-white shadow-sm overflow-hidden print:border-0 print:shadow-none">
               {/* Wrapper to ensure white background for PDF generation */}
               <div className="p-8 md:p-12 bg-white print:p-0">
                 <SalarySlip ref={slipRef} input={input} result={result} />
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
