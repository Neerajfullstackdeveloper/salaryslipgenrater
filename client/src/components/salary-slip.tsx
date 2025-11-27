import { SalaryInput, SalaryResult } from "@/lib/calculations";
import { forwardRef } from "react";

export interface Company {
  id: string;
  name: string;
  logoUrl?: string;
}

interface SalarySlipProps {
  input: SalaryInput;
  result: SalaryResult;
  company?: Company;
}

export const SalarySlip = forwardRef<HTMLDivElement, SalarySlipProps>(({ input, result, company }, ref) => {
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
      className="bg-white text-black p-10 max-w-[210mm] mx-auto shadow-none print:shadow-none font-serif"
      style={{ minHeight: '200mm' }} 
    >
      {/* Border Container */}
      <div className="border-2 border-gray-800 h-full p-6 flex flex-col justify-between relative">
        
        <div>
          {/* Header with Company Info */}
          <div className="flex items-center justify-between border-b-2 border-gray-800 pb-6 mb-8">
            <div className="flex items-center gap-4">
               {company?.logoUrl ? (
                 <img src={company.logoUrl} alt="Logo" className="h-16 w-16 object-contain" />
               ) : (
                 <div className="h-16 w-16 bg-gray-100 flex items-center justify-center border border-gray-200 text-gray-400 text-xs">
                   NO LOGO
                 </div>
               )}
               <div>
                 <h2 className="text-xl font-bold uppercase tracking-wide">{company?.name || "Company Name"}</h2>
                 <p className="text-xs text-gray-500 font-sans">Salary Slip / Pay Advice</p>
               </div>
            </div>
            <div className="text-right">
              <h1 className="text-3xl font-bold uppercase tracking-widest text-gray-900">Salary Slip</h1>
              <p className="text-gray-600 font-sans text-sm uppercase tracking-wide mt-1">{input.month || "Month Year"}</p>
            </div>
          </div>

          {/* Employee Info Table */}
          <div className="mb-8">
            <table className="w-full text-sm font-sans">
              <tbody>
                <tr>
                  <td className="w-1/4 py-2 font-bold text-gray-600 uppercase text-xs">Employee Name</td>
                  <td className="w-1/4 py-2 font-bold border-b border-gray-300" data-testid="slip-name">{input.employeeName || "—"}</td>
                  <td className="w-1/4 py-2 font-bold text-gray-600 uppercase text-xs pl-8">Designation</td>
                  <td className="w-1/4 py-2 border-b border-gray-300">Employee</td>
                </tr>
                <tr>
                  <td className="w-1/4 py-2 font-bold text-gray-600 uppercase text-xs">Employee ID</td>
                  <td className="w-1/4 py-2 border-b border-gray-300" data-testid="slip-id">{input.employeeId || "—"}</td>
                  <td className="w-1/4 py-2 font-bold text-gray-600 uppercase text-xs pl-8">Bank Account</td>
                  <td className="w-1/4 py-2 border-b border-gray-300">XXXX-XXXX</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Earnings & Deductions Table */}
          <div className="border border-gray-800 mb-8">
            <div className="grid grid-cols-2 bg-gray-100 border-b border-gray-800">
              <div className="p-3 font-bold uppercase text-xs tracking-wider text-center border-r border-gray-800">Earnings</div>
              <div className="p-3 font-bold uppercase text-xs tracking-wider text-center">Deductions</div>
            </div>
            
            <div className="grid grid-cols-2 font-sans text-sm min-h-[200px]">
              {/* Earnings Column */}
              <div className="border-r border-gray-800 p-4 space-y-2">
                <div className="flex justify-between">
                  <span>Basic Salary</span>
                  <span className="font-mono">{currencyFormatter.format(input.basicSalary)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>HRA</span>
                  <span className="font-mono">₹0</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Special Allowance</span>
                  <span className="font-mono">₹0</span>
                </div>
              </div>

              {/* Deductions Column */}
              <div className="p-4 space-y-2">
                <div className="flex justify-between text-red-600">
                  <span>Late Deductions</span>
                  <span className="font-mono">{currencyFormatter.format(result.lateDeduction)}</span>
                </div>
                
                {result.extra30minLate > 0 && (
                  <div className="text-[10px] text-gray-500 pl-2 italic">
                     Excess 30m Units: {numberFormatter.format(result.extra30minLate)}
                     <br/>
                     (Includes {result.extra10minLate/2} units from {result.extra10minLate*2} excess 10m lates)
                  </div>
                )}
                
                <div className="flex justify-between text-red-600 mt-2">
                  <span>Leave Deductions</span>
                  <span className="font-mono">{currencyFormatter.format(result.leaveDeduction)}</span>
                </div>
                {result.leaveDeduction > 0 && (
                  <div className="text-[10px] text-gray-500 pl-2 italic">
                    Unpaid Days: {input.fullDayLeaveCount > 1 ? input.fullDayLeaveCount - 1 : 0}
                  </div>
                )}
                
                <div className="flex justify-between text-red-600 mt-2">
                  <span>Half Day Deductions</span>
                  <span className="font-mono">{currencyFormatter.format(result.halfDayDeduction)}</span>
                </div>
              </div>
            </div>

            {/* Totals Row */}
            <div className="grid grid-cols-2 border-t border-gray-800 bg-gray-50">
               <div className="p-3 flex justify-between border-r border-gray-800">
                 <span className="font-bold text-sm">Total Earnings</span>
                 <span className="font-mono font-bold" data-testid="slip-basic">{currencyFormatter.format(input.basicSalary)}</span>
               </div>
               <div className="p-3 flex justify-between text-red-700">
                 <span className="font-bold text-sm">Total Deductions</span>
                 <span className="font-mono font-bold" data-testid="slip-deductions">{currencyFormatter.format(result.totalDeductions)}</span>
               </div>
            </div>
          </div>

          {/* Attendance Summary Box */}
          <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-sm text-xs font-sans">
            <h4 className="font-bold uppercase mb-2 text-gray-500">Attendance Summary</h4>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="font-bold">{input.late10minCount}</div>
                <div className="text-gray-500">10m Lates</div>
              </div>
              <div>
                <div className="font-bold">{input.late30minCount}</div>
                <div className="text-gray-500">30m Lates</div>
              </div>
              <div>
                <div className="font-bold">{input.fullDayLeaveCount}</div>
                <div className="text-gray-500">Full Leaves</div>
              </div>
              <div>
                <div className="font-bold">{input.halfDayLeaveCount}</div>
                <div className="text-gray-500">Half Leaves</div>
              </div>
            </div>
            <div className="mt-2 text-[10px] text-gray-400 text-center border-t border-dashed pt-1">
              Allowed: 2x 10m, 2x 30m, 1x Full Leave
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div>
           <div className="flex items-center justify-between bg-black text-white p-4 mb-12">
             <span className="font-bold uppercase tracking-widest text-sm">Net Pay</span>
             <span className="font-mono text-2xl font-bold" data-testid="slip-net">{currencyFormatter.format(result.netSalary)}</span>
           </div>

           <div className="flex justify-between items-end text-sm font-sans">
             <div className="text-center">
               <div className="border-t border-black w-40 pt-2">Employee Signature</div>
             </div>
             <div className="text-center">
               <div className="border-t border-black w-40 pt-2">Director Signature</div>
               {company?.name && <div className="text-xs text-gray-500 mt-1">{company.name}</div>}
             </div>
           </div>
           
           <div className="text-center text-[10px] text-gray-400 mt-8 uppercase tracking-widest">
             Computer Generated Salary Slip
           </div>
        </div>
      </div>
    </div>
  );
});

SalarySlip.displayName = "SalarySlip";
