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
  // effective_late_30min = late_30min_count + (late_10min_count / 4)
  const effectiveLate30min = input.late30minCount + (input.late10minCount / 4);

  // extra_10min_late_after_allowance
  const extra10minLate = Math.max(0, input.late10minCount - RULES.ALLOWED_10MIN);

  // extra_30min_late_after_allowance = effective_late_30min - allowed_30min
  // Note: The allowed_30min applies to the base count, but the effective calculation merges them.
  // Based on user prompt: "if employee enter two 10 mints lates,two 30 minutes late and 1 full day late then it should not calculate"
  // This implies the allowances are strict thresholds before deduction logic kicks in.
  
  // Let's assume the effective calculation is for EXCESS lates.
  // However, the original formula was specific. Let's stick to the deduction logic but ensure thresholds are respected.
  
  // If inputs are exactly the allowance, the extras should be 0.
  // Input: 2 (10m), 2 (30m). 
  // effectiveLate30min = 2 + (2/4) = 2.5.
  // extra30minLate = 2.5 - 2 = 0.5. -> This would cause a deduction if we use effective blindly against the allowance.
  
  // Let's refine based on standard interpretation:
  // Usually, you convert excess 10mins to 30mins, then add to excess 30mins.
  
  const excess10min = Math.max(0, input.late10minCount - RULES.ALLOWED_10MIN);
  const excess30min = Math.max(0, input.late30minCount - RULES.ALLOWED_30MIN);
  
  // Conversion rule: 4 late_10min = 1 late_30min
  // We take the excess 10mins, convert to 30mins units.
  const convertedFrom10 = excess10min / 4;
  
  // Total effective excess 30min units
  const totalExcess30min = excess30min + convertedFrom10;

  const oneDaySalary = input.basicSalary / 30;
  const halfDaySalary = oneDaySalary / 2;

  // Leave Deduction: (full_day_leave_count - allowed_full_day_leave) * (basic_salary / 30)
  const extraLeaves = Math.max(0, input.fullDayLeaveCount - RULES.ALLOWED_FULL_DAY);
  const leaveDeduction = extraLeaves * oneDaySalary;
  
  // Half Day Leave Deduction: No allowance mentioned for half days, assuming direct deduction
  // Formula: half_day_count * half_day_salary
  const halfDayDeduction = input.halfDayLeaveCount * halfDaySalary;

  // Late Deduction: totalExcess30min * half_day_salary
  // "late_30min_to_halfday_conversion": "If late_30min exceeds allowed_30min then half day salary deduction"
  const lateDeduction = totalExcess30min * halfDaySalary;

  const totalDeductions = leaveDeduction + halfDayDeduction + lateDeduction;
  const netSalary = input.basicSalary - totalDeductions;

  return {
    effectiveLate30min: input.late30minCount + (input.late10minCount/4), // raw effective for display
    extra10minLate: excess10min,
    extra30minLate: totalExcess30min,
    leaveDeduction,
    halfDayDeduction,
    lateDeduction,
    totalDeductions,
    netSalary
  };
};
