export interface SalaryInput {
  employeeName: string;
  employeeId: string;
  month: string;
  basicSalary: number;
  late10minCount: number;
  late30minCount: number;
  late2HourCount?: number;
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
  ALLOWED_10MIN: 3, // allow up to 3 ten-minute lates without converting
  ALLOWED_30MIN: 2, // allow up to 2 thirty-minute lates without converting
  ALLOWED_2H: 1, // allow up to 1 two-hour late without converting
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

  // New unified approach:
  // Convert all late counts into minutes, then into 30-minute units.
  // - 10min lates count as 10 minutes each
  // - 30min lates count as 30 minutes each
  // - 2-hour lates count as 120 minutes each
  // We also compute allowed minutes from the per-category allowances.

  const tenMin = (input.late10minCount || 0) * 10;
  const thirtyMin = (input.late30minCount || 0) * 30;
  const twoHourMin = (input.late2HourCount || 0) * 120;

  const totalLateMinutes = tenMin + thirtyMin + twoHourMin;

  const allowedMinutes = (RULES.ALLOWED_10MIN * 10) + (RULES.ALLOWED_30MIN * 30) + (RULES.ALLOWED_2H * 120);

  const total30MinUnits = Math.floor(totalLateMinutes / 30);
  const allowed30MinUnits = Math.floor(allowedMinutes / 30);

  // Liable units beyond allowed -> each unit corresponds to a 30-minute deduction bucket
  const liable30minUnits = Math.max(0, total30MinUnits - allowed30MinUnits);

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
    // effectiveLate30min: the number of 30-minute units counted (including conversions)
    effectiveLate30min: total30MinUnits,
    // extra10minLate: how many 10-min lates were beyond the allowed per-category allowance
    extra10minLate: Math.max(0, input.late10minCount - RULES.ALLOWED_10MIN),
    // extra30minLate: the number of liable 30-minute units beyond allowed
    extra30minLate: liable30minUnits,
    leaveDeduction,
    halfDayDeduction,
    lateDeduction,
    totalDeductions,
    netSalary
  };
};
