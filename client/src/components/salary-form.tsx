import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SalaryInput } from "@/lib/calculations";
import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

const formSchema = z.object({
  employeeName: z.string().min(2, "Name is required"),
  employeeId: z.string().min(1, "ID is required"),
  month: z.string().min(1, "Month is required"),
  basicSalary: z.coerce.number().min(0, "Salary must be positive"),
  late10minCount: z.coerce.number().min(0),
  late30minCount: z.coerce.number().min(0),
  fullDayLeaveCount: z.coerce.number().min(0),
});

interface SalaryFormProps {
  onCalculate: (data: SalaryInput) => void;
}

export function SalaryForm({ onCalculate }: SalaryFormProps) {
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
    },
  });

  // Watch for changes to auto-calculate
  const values = form.watch();

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.basicSalary !== undefined) { // Only if basic fields are present
        // We need to cast because partial updates might happen, but our schema ensures types
         onCalculate(value as SalaryInput);
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch, onCalculate]);

  return (
    <Card className="w-full h-full border-0 shadow-none bg-transparent">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl font-semibold tracking-tight text-primary">Employee Details</CardTitle>
        <CardDescription>Enter attendance and salary information.</CardDescription>
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
                      <Input placeholder="John Doe" {...field} data-testid="input-name" />
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
                      <Input placeholder="EMP-001" {...field} data-testid="input-id" />
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
                      <Input placeholder="November 2025" {...field} data-testid="input-month" />
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
                      <Input type="number" {...field} data-testid="input-salary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
               <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Attendance Records</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="late10minCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>10min Lates</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} data-testid="input-late10" />
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
                      <FormLabel>30min Lates</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} data-testid="input-late30" />
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
                        <Input type="number" min="0" {...field} data-testid="input-leaves" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => form.reset()}
              data-testid="button-reset"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Form
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
