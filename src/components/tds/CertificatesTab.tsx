"use client";

import { CertificateJobCard } from "@/components/tds/CertificateJobCard";
import tdsData from "@/data/tds.json";

type CertificatesTabProps = {
  form24qFiled: boolean;
  form26qFiled: boolean;
  selectedPeriod: string;
};

export function CertificatesTab({
  form24qFiled,
  form26qFiled,
  selectedPeriod,
}: CertificatesTabProps) {
  const certs = tdsData.certificates;

  // Find existing Form 16 for FY
  const fy = selectedPeriod.split("|")[0] ?? "";
  const existingForm16 = certs.form16.find((c) => c.financial_year === fy) ?? null;

  // Find existing Form 16A for the current period
  const quarter = selectedPeriod.split("|")[1] ?? "";
  const existingForm16A =
    certs.form16a.find((c) => c.financial_year === fy && c.quarter === quarter) ?? null;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-foreground">TDS Certificates</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Generate and download Form 16 (salary) and Form 16A (non-salary) certificates via
          TRACES. You must be logged into the TRACES portal with deductor credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Form 16 — annual, only after Q4 is filed */}
        <CertificateJobCard
          formType="16"
          title="Form 16"
          subtitle="Salary TDS Certificate (§192) — Annual, issued to employees"
          period={`${fy} · Annual`}
          prerequisiteMet={form24qFiled && quarter === "Q4"}
          prerequisiteLabel={
            quarter !== "Q4"
              ? "Form 16 is generated only after Q4 Form 24Q is filed"
              : form24qFiled
              ? "Form 24Q Q4 filed ✓"
              : "Form 24Q Q4 must be filed first"
          }
          existingRecord={
            existingForm16
              ? {
                  generated_date: existingForm16.generated_date,
                  count: existingForm16.employee_count,
                }
              : null
          }
        />

        {/* Form 16A — quarterly */}
        <CertificateJobCard
          formType="16A"
          title="Form 16A"
          subtitle="Non-Salary TDS Certificate (§194 series) — Per quarter, issued to deductees"
          period={`${quarter} ${fy}`}
          prerequisiteMet={form26qFiled}
          prerequisiteLabel={
            form26qFiled
              ? `Form 26Q ${quarter} filed ✓`
              : `Form 26Q ${quarter} must be filed first`
          }
          existingRecord={
            existingForm16A
              ? {
                  generated_date: existingForm16A.generated_date,
                  count: existingForm16A.deductee_count,
                }
              : null
          }
        />
      </div>

      <p className="text-xs text-muted-foreground border rounded-md px-3 py-2.5 bg-muted/30">
        Certificates are fetched from TRACES using a background job. You will receive a download link once the job
        is complete. Processing typically takes 2–10 minutes depending on the number of employees / deductees.
      </p>
    </div>
  );
}
