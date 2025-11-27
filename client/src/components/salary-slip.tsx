import { SalaryInput, SalaryResult } from "@/lib/calculations";
import { forwardRef } from "react";
import { Separator } from "@/components/ui/separator";

interface SalarySlipProps {
  input: SalaryInput;
  result: SalaryResult;
}

export const SalarySlip = forwardRef<HTMLDivElement, SalarySlipProps>(({ input, result }, ref) => {
  const currencyFormatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  const numberFormatter = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div 
      ref={ref} 
      className="bg-white text-black p-8 max-w-[210mm] mx-auto shadow-none print:shadow-none"
      style={{ minHeight: '200mm' }} // A4 approximate height constraint if needed
    >
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-black pb-6">
        <h1 className="font-serif text-3xl font-bold mb-2 uppercase tracking-wider">Salary Slip</h1>
        <p className="text-sm text-gray-600 font-sans">Confidential Document</p>
      </div>

      {/* Employee Info Grid */}
      <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-8 font-sans text-sm">
        <div className="flex justify-between border-b border-gray-200 pb-1">
          <span className="text-gray-500 font-medium">Employee Name</span>
          <span className="font-bold uppercase" data-testid="slip-name">{input.employeeName || "—"}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-1">
          <span className="text-gray-500 font-medium">Employee ID</span>
          <span className="font-bold" data-testid="slip-id">{input.employeeId || "—"}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-1">
          <span className="text-gray-500 font-medium">Pay Period</span>
          <span className="font-bold" data-testid="slip-month">{input.month || "—"}</span>
        </div>
        <div className="flex justify-between border-b border-gray-200 pb-1">
          <span className="text-gray-500 font-medium">Generated On</span>
          <span className="font-bold">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {/* Earnings Section */}
      <div className="mb-6">
        <h3 className="font-bold text-sm uppercase tracking-wider mb-3 bg-gray-100 p-2">Earnings</h3>
        <div className="flex justify-between items-center px-2 py-1">
          <span className="font-medium">Basic Salary</span>
          <span className="font-mono font-bold" data-testid="slip-basic">{currencyFormatter.format(input.basicSalary)}</span>
        </div>
      </div>

      {/* Deductions Section */}
      <div className="mb-6">
        <h3 className="font-bold text-sm uppercase tracking-wider mb-3 bg-gray-100 p-2">Deductions & Attendance</h3>
        
        <div className="space-y-2 px-2 text-sm">
           {/* Attendance Summary */}
           <div className="grid grid-cols-3 gap-4 text-xs text-gray-500 mb-4">
              <div className="bg-gray-50 p-2 rounded">
                <div className="uppercase tracking-wider mb-1">10m Lates</div>
                <div className="font-mono text-lg text-black">{input.late10minCount}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="uppercase tracking-wider mb-1">30m Lates</div>
                <div className="font-mono text-lg text-black">{input.late30minCount}</div>
              </div>
               <div className="bg-gray-50 p-2 rounded">
                <div className="uppercase tracking-wider mb-1">Leaves</div>
                <div className="font-mono text-lg text-black">{input.fullDayLeaveCount}</div>
              </div>
           </div>

           <div className="flex justify-between items-center py-1 border-b border-dashed border-gray-200">
            <span className="text-gray-600">Effective 30m Lates (Calculated)</span>
            <span className="font-mono">{numberFormatter.format(result.effectiveLate30min)}</span>
           </div>
           
           <div className="flex justify-between items-center py-1 border-b border-dashed border-gray-200">
            <span className="text-gray-600">Deductible 30m Lates (Excess)</span>
            <span className="font-mono">{numberFormatter.format(result.extra30minLate)}</span>
           </div>

           <div className="flex justify-between items-center py-1 mt-4 text-red-600">
            <span>Late Deduction Amount</span>
            <span className="font-mono font-medium">- {currencyFormatter.format(result.lateDeduction)}</span>
           </div>
           
           <div className="flex justify-between items-center py-1 text-red-600">
            <span>Leave Deduction Amount</span>
            <span className="font-mono font-medium">- {currencyFormatter.format(result.leaveDeduction)}</span>
           </div>
        </div>

        <div className="flex justify-between items-center mt-4 px-2 pt-2 border-t border-black">
          <span className="font-bold">Total Deductions</span>
          <span className="font-mono font-bold text-red-700" data-testid="slip-deductions">{currencyFormatter.format(result.totalDeductions)}</span>
        </div>
      </div>

      {/* Net Pay */}
      <div className="mt-8 border-t-2 border-black pt-4">
        <div className="flex justify-between items-end px-2">
          <div>
            <div className="text-sm text-gray-500 uppercase tracking-wider mb-1">Net Salary Payable</div>
            <div className="text-xs text-gray-400">Transferred to account ending ****</div>
          </div>
          <div className="text-3xl font-mono font-bold" data-testid="slip-net">
            {currencyFormatter.format(result.netSalary)}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-20 pt-8 border-t border-gray-200 flex justify-between text-xs text-gray-400 font-sans">
        <div>
          <p>Authorized Signatory</p>
          <div className="h-12"></div> {/* Space for signature */}
          <p>HR Department</p>
        </div>
        <div className="text-right">
          <p>This is a computer-generated document.</p>
          <p>No signature is required.</p>
        </div>
      </div>
    </div>
  );
});

SalarySlip.displayName = "SalarySlip";
