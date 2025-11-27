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
  // New Rule: "if emploee take four 10 min it is only alowd to take one 30min late"
  // Interpretation: 
  // Base Allowed 10min: 2
  // Base Allowed 30min: 2
  // Excess 10min are converted to 30min consumption.
  // 4 total 10min = 2 excess 10min.
  // If 2 excess 10min reduces allowed 30min to 1 (from 2), it means 2 excess 10min = 1 equivalent 30min.
  // Ratio: 2 Excess 10min -> 1 Effective 30min.
  
  const excess10min = Math.max(0, input.late10minCount - RULES.ALLOWED_10MIN);
  const excess30min = Math.max(0, input.late30minCount - RULES.ALLOWED_30MIN); // This is just the raw excess from the 30min bucket
  
  // Convert excess 10min to 30min units (Ratio 2:1)
  const convertedFrom10 = excess10min / 2;
  
  // Effective 30min used for deduction calculation
  // We take the Actual 30min count and add the converted amount from 10min lates.
  // Then we check against the ALLOWED_30MIN.
  // Formula: (Actual30 + (Excess10 / 2)) - Allowed30
  // Wait, checking Scenario A: 
  // Input: 4x 10min, 1x 30min.
  // Excess10 = 2. Converted = 1.
  // Total Effective 30min Load = 1 (Actual) + 1 (Converted) = 2.
  // Allowed = 2.
  // Excess = 2 - 2 = 0. No Deduction. Correct.
  
  // Scenario B: 2x 10min, 2x 30min.
  // Excess10 = 0. Converted = 0.
  // Total Effective = 2 (Actual) + 0 = 2.
  // Allowed = 2.
  // Excess = 0. No Deduction. Correct.
  
  // Scenario C (Implicit): 4x 10min, 2x 30min.
  // Excess10 = 2. Converted = 1.
  // Total Effective = 2 (Actual) + 1 (Converted) = 3.
  // Allowed = 2.
  // Excess = 3 - 2 = 1. Deduction of 1 half day. Correct.

  const effectiveLate30minTotal = input.late30minCount + convertedFrom10;
  
  // Calculate how many 30min units are liable for deduction
  const liable30minUnits = Math.max(0, effectiveLate30minTotal - RULES.ALLOWED_30MIN);

  const oneDaySalary = input.basicSalary / 30;
  const halfDaySalary = oneDaySalary / 2;

  // Leave Deduction: (full_day_leave_count - allowed_full_day_leave) * (basic_salary / 30)
  const extraLeaves = Math.max(0, input.fullDayLeaveCount - RULES.ALLOWED_FULL_DAY);
  const leaveDeduction = extraLeaves * oneDaySalary;
  
  // Half Day Leave Deduction
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
