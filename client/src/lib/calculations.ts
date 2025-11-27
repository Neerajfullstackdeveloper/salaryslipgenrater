export interface SalaryInput {
  employeeName: string;
  employeeId: string;
  month: string;
  basicSalary: number;
  late10minCount: number;
  late30minCount: number;
  fullDayLeaveCount: number;
}

export interface SalaryResult {
  effectiveLate30min: number;
  extra10minLate: number;
  extra30minLate: number;
  leaveDeduction: number;
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
  const extra30minLate = Math.max(0, effectiveLate30min - RULES.ALLOWED_30MIN);

  const oneDaySalary = input.basicSalary / 30;
  const halfDaySalary = oneDaySalary / 2;

  // Leave Deduction: (full_day_leave_count - allowed_full_day_leave) * (basic_salary / 30)
  const extraLeaves = Math.max(0, input.fullDayLeaveCount - RULES.ALLOWED_FULL_DAY);
  const leaveDeduction = extraLeaves * oneDaySalary;

  // Late Deduction: extra_30min_late_after_allowance * ((basic_salary / 30) / 2)
  const lateDeduction = extra30minLate * halfDaySalary;

  const totalDeductions = leaveDeduction + lateDeduction;
  const netSalary = input.basicSalary - totalDeductions;

  return {
    effectiveLate30min,
    extra10minLate,
    extra30minLate,
    leaveDeduction,
    lateDeduction,
    totalDeductions,
    netSalary
  };
};
