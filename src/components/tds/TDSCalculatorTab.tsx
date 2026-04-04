"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NonSalaryCalculator } from "@/components/tds/NonSalaryCalculator";
import { SalaryCalculator } from "@/components/tds/SalaryCalculator";

export function TDSCalculatorTab() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-foreground">TDS Calculator</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Estimate TDS liability for payments before deduction and challan deposit.
        </p>
      </div>

      <Tabs defaultValue="non-salary">
        <TabsList className="h-9 bg-muted/50">
          <TabsTrigger value="non-salary" className="text-xs px-4">
            Non-Salary Payments
          </TabsTrigger>
          <TabsTrigger value="salary" className="text-xs px-4">
            Salary (§192)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="non-salary" className="mt-5">
          <NonSalaryCalculator />
        </TabsContent>
        <TabsContent value="salary" className="mt-5">
          <SalaryCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
