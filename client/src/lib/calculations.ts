export interface SalaryInput {
  employeeName: string;
  employeeId: string;
  month: string;
  basicSalary: number;
  late10minCount: number;
  late30minCount: number;
  fullDayLeaveCount: number;
  halfDayLeaveCount: number;
}

export interface SalaryResult {
  effectiveLate30min: number;
  extra10minLate: number;
  extra30minLate: number;
  leaveDeduction: number;
  halfDayDeduction: number;
  lateDeduction: number;
  totalDeductions: number;
  netSalary: number;
}

export const RULES = {
  ALLOWED_10MIN: 2,
  ALLOWED_30MIN: 2,
  ALLOWED_FULL_DAY: 1,
};

export const calculateSalary = (input: SalaryInput): SalaryResult => {
  // Rules Recap:
  // 1. Allowed 10min lates: 2
  // 2. Allowed 30min lates: 2
  // 3. Allowed Paid Leaves: 1
  // 4. Conversion: Excess 10min lates convert to 30min lates at a 2:1 ratio.
  //    (2 Excess 10min = 1 Equivalent 30min)
  // 5. Deduction: Any 30min late (Actual or Converted) BEYOND the allowed 2 results in half-day deduction.

  // Step 1: Calculate Excess 10min
  const excess10min = Math.max(0, input.late10minCount - RULES.ALLOWED_10MIN);
  
  // Step 2: Convert Excess 10min to 30min equivalent (2:1 ratio)
  // "four 10min late... one 30min late" -> Excess 10min = 2. Converted = 1.
  const convertedFrom10 = excess10min / 2;
  
  // Step 3: Calculate Total Effective 30min usage
  // We add the actual 30min lates to the converted ones.
  const effectiveLate30minTotal = input.late30minCount + convertedFrom10;
  
  // Step 4: Calculate Liable Units (How many are OVER the limit of 2)
  const liable30minUnits = Math.max(0, effectiveLate30minTotal - RULES.ALLOWED_30MIN);

  const oneDaySalary = input.basicSalary / 30;
  const halfDaySalary = oneDaySalary / 2;

  // Leave Deduction: (full_day_leave_count - allowed_full_day_leave) * (basic_salary / 30)
  const extraLeaves = Math.max(0, input.fullDayLeaveCount - RULES.ALLOWED_FULL_DAY);
  const leaveDeduction = extraLeaves * oneDaySalary;
  
  // Half Day Leave Deduction (assuming these are separate from the late deductions)
  const halfDayDeduction = input.halfDayLeaveCount * halfDaySalary;

  // Late Deduction: liable30minUnits * half_day_salary
  const lateDeduction = liable30minUnits * halfDaySalary;

  const totalDeductions = leaveDeduction + halfDayDeduction + lateDeduction;
  const netSalary = input.basicSalary - totalDeductions;

  return {
    effectiveLate30min: effectiveLate30minTotal,
    extra10minLate: excess10min,
    extra30minLate: liable30minUnits,
    leaveDeduction,
    halfDayDeduction,
    lateDeduction,
    totalDeductions,
    netSalary
  };
};
