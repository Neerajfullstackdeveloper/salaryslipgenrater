import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SalaryInput } from "@/lib/calculations";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

const formSchema = z.object({
  employeeName: z.string().min(2, "Name is required"),
  employeeId: z.string().min(1, "ID is required"),
  month: z.string().min(1, "Month is required"),
  basicSalary: z.coerce.number().min(0, "Salary must be positive"),
  late10minCount: z.coerce.number().min(0),
  late30minCount: z.coerce.number().min(0),
  fullDayLeaveCount: z.coerce.number().min(0),
  halfDayLeaveCount: z.coerce.number().min(0),
});

interface SalaryFormProps {
  onCalculate: (data: SalaryInput) => void;
  defaultValues?: Partial<SalaryInput>;
}

export function SalaryForm({ onCalculate, defaultValues }: SalaryFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeName: "",
      employeeId: "",
      month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      basicSalary: 0,
      late10minCount: 0,
      late30minCount: 0,
      fullDayLeaveCount: 0,
      halfDayLeaveCount: 0,
      ...defaultValues
    },
  });

  // Update form when defaultValues change (e.g. when selecting a different employee)
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        employeeName: defaultValues.employeeName || "",
        employeeId: defaultValues.employeeId || "",
        month: defaultValues.month || new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
        basicSalary: defaultValues.basicSalary || 0,
        late10minCount: defaultValues.late10minCount || 0,
        late30minCount: defaultValues.late30minCount || 0,
        fullDayLeaveCount: defaultValues.fullDayLeaveCount || 0,
        halfDayLeaveCount: defaultValues.halfDayLeaveCount || 0,
      });
    }
  }, [defaultValues, form]);

  // Watch for changes to auto-calculate
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.basicSalary !== undefined) {
         onCalculate(value as SalaryInput);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, onCalculate]);

  return (
    <Card className="w-full border-0 shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl font-semibold tracking-tight text-primary">Attendance & Salary Details</CardTitle>
        <CardDescription>Edit the current month's records below.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Form {...form}>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="employeeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John Doe"
                        {...field}
                        data-testid="input-name"
                        aria-label="Employee full name"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee ID</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="EMP-001"
                        {...field}
                        data-testid="input-id"
                        aria-label="Employee ID"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Month</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="November 2025"
                        {...field}
                        data-testid="input-month"
                        aria-label="Month"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="basicSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Basic Salary (₹)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        data-testid="input-salary"
                        inputMode="numeric"
                        step={1}
                        min={0}
                        pattern="[0-9]*"
                        aria-label="Basic salary in INR"
                        className="w-full"
                      />
                    </FormControl>
                    <div className="text-xs text-muted-foreground mt-1">Enter the basic salary in whole rupees.</div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
               <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Attendance Records</h3>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="late10minCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>10m Lates</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          {...field}
                          data-testid="input-late10"
                          inputMode="numeric"
                          aria-label="10 minute lates"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="late30minCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>30m Lates</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          {...field}
                          data-testid="input-late30"
                          inputMode="numeric"
                          aria-label="30 minute lates"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fullDayLeaveCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Day Leaves</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          {...field}
                          data-testid="input-leaves"
                          inputMode="numeric"
                          aria-label="Full day leaves"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="halfDayLeaveCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Half Day Leaves</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          {...field}
                          data-testid="input-half-leaves"
                          inputMode="numeric"
                          aria-label="Half day leaves"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => form.reset()}
                data-testid="button-reset"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={() => form.handleSubmit((data) => onCalculate(data as SalaryInput))()}
                data-testid="button-calc"
              >
                Calculate
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
