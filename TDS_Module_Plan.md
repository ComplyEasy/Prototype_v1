# TDS Module — Frontend Plan

**Source:** Sandbox.co.in TDS API Stack  
**Covers:** TDS Calculator, Return Preparation (Form 24Q / 26Q / 27Q), Compliance E-filing, Form 16 / 16A Certificate Management, TDS Analytics  
**Stack:** Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui  
**Route:** `/dashboard/tds`

---

## 1. What is TDS?

**Tax Deducted at Source (TDS)** is a mechanism for collecting Income Tax at the time a payment is made. The person responsible for making a specified payment (the **deductor**) deducts tax at a prescribed rate before releasing the amount to the recipient (the **deductee**) and deposits it with the Government.

TDS applies to:
- **Salary** — monthly payroll deductions under Section 192
- **Professional fees** — consultants, lawyers, architects (Section 194J)
- **Contractor payments** — sub-contracts, labour contracts (Section 194C)
- **Rent** — commercial/industrial premises above threshold (Section 194I)
- **Interest** — bank interest, inter-company interest (Section 194A)
- **Dividends** — Section 194
- **Commission & brokerage** — Section 194H
- **Payments to non-residents** — Section 195 / Form 27Q

### Deductor's Ongoing Obligations
1. Deduct tax at the correct rate on applicable payments
2. Deposit TDS with the Government within prescribed due dates
3. Issue TDS certificates (Form 16 or Form 16A) to deductees
4. File quarterly TDS returns (Form 24Q / 26Q / 27Q) accurately and on time

> Failure to comply can result in interest under Section 201, penalties under Section 271C, and demands/notices from tax authorities.

---

## 2. Key Entities & Identifiers

| Entity | Description | Key Identifier |
|--------|-------------|----------------|
| **Deductor / Payer** | Company or individual deducting TDS | TAN (Tax Deduction Account Number, e.g. `AHMA09719B`) |
| **Deductee / Payee** | Employee or vendor receiving the payment | PAN (e.g. `XXXPX1234A`) |
| **Challan** | Proof of TDS deposit with bank | BSR Code + Challan Serial + Paid Date |
| **Form 27A** | Control chart filed alongside e-TDS return | Generated at e-filing |
| **ARN / Receipt Number** | Acknowledgement of filed return | 15-digit receipt number |

### TAN (Tax Deduction Account Number)
The TAN is the primary identity of the deductor — equivalent to GSTIN in the GST module. All TDS filings are identified by `TAN + Financial Year + Quarter + Form`.

---

## 3. TDS Forms & Quarters

### Return Forms

| Form | Covers | Payment Type |
|------|--------|--------------|
| **Form 24Q** | Salary payments to resident employees | Section 192 |
| **Form 26Q** | Non-salary payments to residents | 194A, 194C, 194H, 194I, 194J, etc. |
| **Form 27Q** | Payments to non-residents (NRIs / foreign companies) | Section 195 |

### Certificate Forms

| Form | Issued To | After Filing |
|------|-----------|--------------|
| **Form 16** | Employees | Form 24Q |
| **Form 16A** | Vendors / contractors | Form 26Q or 27Q |

### Quarter Reference

| Quarter | Period | TDS Return Due Date |
|---------|--------|---------------------|
| Q1 | April – June | 31 July |
| Q2 | July – September | 31 October |
| Q3 | October – December | 31 January |
| Q4 | January – March | 31 May |

> **TDS Deposit Deadline:** 7th of the following month (30th April for March deductions).

---

## 4. API Architecture (Sandbox)

The Sandbox TDS API suite is split into four categories:

```
┌─────────────────────────────────────────────────────────────────┐
│                   Sandbox TDS API Stack                         │
├──────────────┬──────────────┬──────────────┬────────────────────┤
│  Calculator  │   Reports    │  Compliance  │     Analytics      │
│  API         │   API        │  API         │     API            │
│              │              │              │                    │
│ Compute TDS  │ Generate TXT │ CSI Download │ Potential Notices  │
│ for salary & │ for 24Q/26Q/ │ FVU Package  │ 206AB Check        │
│ non-salary   │ 27Q returns  │ E-file       │ Reconciliation     │
│ payments     │ (job-based)  │ Form 16/16A  │ insights           │
└──────────────┴──────────────┴──────────────┴────────────────────┘
```

### Job-Based Async Workflow (Reports & Compliance)
Long-running tasks (TXT generation, FVU, e-filing, certificate generation) use a **submit → poll / webhook** pattern:
```
1. POST (submit job)  → returns job_id + upload URL (json_url / txt_url / fvu_url)
2. PUT (upload data)  → upload Sheet JSON / FVU ZIP to pre-signed S3 URL (no auth headers)
3. GET (poll job)     → check status: created → queued → succeeded / failed
4. Download artifacts → txt_url, fvu_url, receipt_url, form27a_url, form16_url, form16a_url
```

---

## 5. TDS Calculator Data Structure

### Non-Salary Payment Response
Used for real-time TDS computation per vendor/contractor payment:

| Field | Type | Description |
|-------|------|-------------|
| `deductee_type` | string | `company` / `individual` |
| `is_pan_available` | boolean | PAN status of deductee |
| `is_206ab_applicable` | boolean | Whether higher rate under §206AB applies |
| `is_pan_operative` | boolean | Whether PAN is operative (not inoperative) |
| `residential_status` | string | `resident` / `non_resident` |
| `section` | string | Section code, e.g. `194C`, `194J`, `194I` |
| `code` | string | Short code, e.g. `94C`, `94J`, `94I` |
| `category` | string | e.g. `contractual_payment`, `professional_fee` |
| `nature_of_payment` | string | e.g. `tender_fees`, `technical_services` |
| `credit_amount` | number | Payment amount (₹) |
| `credit_date` | number | EPOCH timestamp |
| `deduction_rate` | number | Applicable TDS rate (%) |
| `threshold_amount` | number | Threshold above which TDS applies (₹) |
| `due_date` | number | Challan deposit due date (EPOCH) |
| `deduction_amount` | number | TDS amount to be deducted (₹) |

### Salary Payment (Sync)
For single-employee real-time computation. Returns computed TDS with full breakdown.

### Salary Payment (Async Job)
For bulk payroll. Submit job → upload workbook → poll / webhook → download computed workbook.

---

## 6. Form 24Q Data Structure (Salary TDS)

Form 24Q is filed quarterly. The **Sheet JSON workbook** for Form 24Q contains these sheets:

### Deductor / Payer Sheet
| Field | Description |
|-------|-------------|
| `name` | Company / deductor name |
| `tan` | TAN of the deductor (e.g. `AHMA09719B`) |
| `pan` | PAN of the deductor |
| `gstin` | GSTIN (optional) |
| `branch` | Branch name |
| `street`, `area`, `city`, `state`, `postal_code` | Address |
| `email`, `mobile` | Contact details |
| **Responsible Person** | `name`, `pan`, `designation`, address, contact |

### Payee (Employee) Sheet
| Field | Description |
|-------|-------------|
| `sr_no` | Serial number |
| `pan` | Employee PAN (or `PANNOTAVBL` / `PANAPPLIED` / `PANINVALID`) |
| `name` | Employee name |
| `opting_new_regime` | Whether opted for 115BAC new tax regime |
| `employee_category` | `general` / `women` / `senior_citizen` / `super_senior_citizen` |
| `is_pan_operative` | PAN operative status |

### Challan Sheet
| Field | Description |
|-------|-------------|
| `challan_serial` | Bank challan number |
| `bsr_code` | Bank BSR code |
| `paid_date_epoch` | Challan payment date |
| `minor_head` | Minor head (200 = TDS payable by taxpayer, 400 = TDS regular assessment) |
| `tds_amount` | Income Tax component |
| `surcharge` | Surcharge amount |
| `health_and_education_cess` | Education cess |
| `interest` | Late deduction interest |
| `late_filing_fees` | Penalty for late filing |
| `other_penalty` | Other penalties |
| `utilized_amount` | Challan amount used in previous returns |

### Payment Sheet (Salary)
| Field | Description |
|-------|-------------|
| `payee_sr_no` | Links payment to payee |
| `challan_serial` + `bsr_code` | Links payment to challan |
| `nature_of_payment` | TDS section (e.g. `192`) |
| `payment_amount` | Gross salary paid (₹) |
| `payment_date_epoch` | Date of salary credit |
| `tds_amount` | TDS deducted |
| `surcharge`, `health_and_education_cess` | Components |
| `deduction_date_epoch` | Date TDS was deducted |

### Salary Detail Sheet (Q4 only — Section 192)
Full salary computation including:
- `gross_salary_from_previous_employers` — salary from previous employer in same FY
- `salary_as_per_provisions_contained_in_section_17_1` — gross salary
- `value_of_perquisites_us_17_2` — perquisites value
- `profits_in_lieu_of_salary_us_17_3` — VRS, notice pay, etc.
- `house_rent_allowance_us_10_13_a` — HRA exempt
- `standard_deduction_us_16_ia` — standard deduction (₹50,000)
- `entertainment_allowance_us_16_ii`, `tax_on_employment_us_16_iii`
- `income_from_house_property_reported_by_employee_offered_for_tds`
- Chapter VI-A deductions: `80C`, `80CCC`, `80CCD_1`, `80CCD_1B`, `80CCD_2`, `80D`, `80E`, `80G`, etc.
- `rebate_us_87_a`, `relief_us_89`
- `income_tax_payable`, `tds_on_salary`
- Rent/lender PAN for landlords if rent > ₹1L/year

---

## 7. Form 26Q Data Structure (Non-Salary TDS)

Identical structure to 24Q **except** no Salary Detail sheet, and Payment fields differ:

### Payment Sheet (Non-Salary)
| Field | Description |
|-------|-------------|
| `nature_of_payment` | TDS section code: `194C`, `194J`, `194I`, `194A`, `194H`, etc. |
| `payment_amount` | Amount paid (₹) |
| `tds_amount`, `surcharge`, `health_and_education_cess` | Tax components |
| `reason_for_lower_deduction` | If lower/nil deduction: NIL cert under §197, threshold, etc. |
| `certificate_number` | AO certificate number (§197) |
| §194N fields | Cash withdrawal specific fields for banks |

### Common Non-Salary Sections (Form 26Q)

| Section | Payment Type | Standard Rate |
|---------|-------------|---------------|
| 194A | Interest (non-bank) | 10% |
| 194C | Contractor payments | 1% (Ind/HUF) / 2% (Others) |
| 194D | Insurance commission | 5% |
| 194G | Commission on lottery | 5% |
| 194H | Commission / brokerage | 5% |
| 194I(a) | Rent (plant & machinery) | 2% |
| 194I(b) | Rent (land/building) | 10% |
| 194J(a) | Technical services | 2% |
| 194J(b) | Professional services | 10% |
| 194LA | Compensation on compulsory acquisition | 10% |
| 194Q | Purchase of goods (above ₹50L) | 0.1% |
| 194N | Cash withdrawal (above ₹1 Cr) | 2% |

---

## 8. Form 27Q Data Structure (NRI Payments)

For payments to non-residents. Payee fields include additional:
- `tax_identification_number` — tax ID in payee's jurisdiction
- `country` — country of residence (enum)
- `nri` — boolean
- `permanent_establishment_in_india` — boolean
- `applicability_of_tds_rate_under_dtaa` — whether DTAA rate applies
- `nature_of_remittance` — nature of payment
- `form_15ca_acknowledgement_number` — Form 15CA reference
- `grossing_up_indicator` — Y/N

---

## 9. Analytics: Potential Notices

The **Potential Notices API** analyzes return data before filing to identify compliance risks.

### Default Types

| Notice Type | Description |
|------------|-------------|
| `short_payment` | Challan deposited < TDS deducted |
| `short_deduction` | TDS deducted < TDS as per IT Act |
| `late_payment` | Challan deposited after due date |
| `late_deduction` | TDS deducted after payment date |
| `late_filing_fee_u/s_234E` | Return filed after quarterly due date |

### Analytics Output per Payment
- `notice` — notice type (if any)
- `notice_reason` — reason text
- `tds_rate` — rate used in return
- `tds_rate_as_per_it_act` — correct rate per IT Act
- `tds_amount_payable_as_per_it_act` — correct amount
- `additional_tds_to_be_deducted` — shortfall
- `interest_payable` — penalty interest

### Analytics Output per Challan
- `challan_available` — amount available after prior utilization
- `utilized_amount_in_payments` — amount used in this quarter's payments
- `short_payment` — deficit amount
- `challan_due_date` — when challan should have been deposited
- `interest_payable` — interest on late payment
- `additional_tds_to_be_deposited` — total deficit + interest

---

## 10. Filing Workflows

### Pre-Filing: Potential Notice Check (Optional but Recommended)
```
1. POST /tds/analytics/potential-notices
   Body: { tan, financial_year, form, quarter }
   → Returns: job_id, json_url

2. PUT {json_url} — upload Sheet JSON workbook

3. GET /tds/analytics/potential-notices?job_id={id}
   → Poll until succeeded
   → potential_notice_report_url (XLSX) with detected issues

4. Review & fix issues in source data
```

### Form 24Q / 26Q Filing Workflow
```
Step 1: Prepare Phase (TDS Reports API)
─────────────────────────────────────
1. [Optional] Run Potential Notices analysis
   Fix any short_deduction, short_payment issues

2. POST /tds/reports/txt
   Body: { tan, financial_year, form: "24Q"/"26Q", quarter,
           previous_receipt_number? }  ← omit for original return
   → Returns: job_id, json_url

3. PUT {json_url} — upload final Sheet JSON workbook

4. GET /tds/reports/txt?job_id={id}
   → Poll until txt_url available
   → Download .TXT file (FVU input)

Step 2: Compliance Phase (TDS Compliance API)
─────────────────────────────────────────────
5. POST /tds/compliance/csi/otp
   → Initiate CSI download OTP (TRACES authentication)

6. POST /tds/compliance/csi/otp/verify
   → Verify OTP → get CSI file URL (challan reconciliation data)

7. POST /tds/compliance/fvu  (Submit FVU job)
   Body: { tan, financial_year, form, quarter }
   → Returns: job_id, txt_url, csi_url

8. PUT {txt_url} — upload TXT file from Step 4
   PUT {csi_url} — upload CSI file from Step 6

9. GET /tds/compliance/fvu?job_id={id}
   → Poll: created → queued → succeeded/failed
   → On success: fvu_url (ZIP containing validated FVU + Form 27A)
   → On failure: validation_url (FVU error report)

10. POST /tds/compliance/efile (Submit e-file job)
    Body: { tan, financial_year, form, quarter }
    → Returns: job_id, fvu_url

11. PUT {fvu_url} — upload FVU ZIP from Step 9

12. GET /tds/compliance/efile?job_id={id}
    → Poll: created → queued → succeeded/failed
    → On success: receipt_url, form27a_url, receipt_number
    → On failure: message (TIN-FC error codes)
```

### Certificate Generation (Post-Filing)

#### Form 16 (after Form 24Q)
```
1. POST /tds/compliance/certificate  (Submit job)
   Body: { tan, form: "24Q", financial_year, quarter, traces_credentials }
   → Returns: job_id

2. GET /tds/compliance/certificate?job_id={id}
   → Poll: created → queued → in_progress → succeeded/failed
   → On success: form16_url (ZIP of all employee Form 16 PDFs)
```

#### Form 16A (after Form 26Q / 27Q)
```
1. POST /tds/compliance/certificate  (Submit job)
   Body: { tan, form: "26Q"/"27Q", financial_year, quarter, traces_credentials }
   → Returns: job_id

2. GET /tds/compliance/certificate?job_id={id}
   → Poll until succeeded
   → On success: form16a_url (ZIP of all deductee Form 16A PDFs)
```

> **TRACES Credentials** required for certificate generation: TAN login credentials stored securely at deductor level.

---

## 11. Page Layout Plan

### Route: `/dashboard/tds`

```
┌─────────────────────────────────────────────────────────────────┐
│  TDS Compliance                    [FY: ▼ FY 2025-26] [Q: ▼ Q4] │
│  TAN: AHMA09719B · Acme Technologies Pvt Ltd                    │
├─────────────────────────────────────────────────────────────────┤
│  [Calculator] [Form 24Q] [Form 26Q] [Certificates] [History]   │
├─────────────────────────────────────────────────────────────────┤
│  (Tab content below)                                            │
└─────────────────────────────────────────────────────────────────┘
```

### Calculator Tab
```
┌─────────────────────────────────────────────────────────────────┐
│  TDS Calculator          [● Non-Salary]  [○ Salary]             │
├──────────────────────────┬──────────────────────────────────────┤
│  Deductee Details        │  Result                              │
│  PAN:  [____________]    │  Section: 194J(b)                    │
│  Type: [Company ▼]       │  Category: Professional Services     │
│  Resident: [Y/N ▼]       │  Rate: 10%                           │
│  Section: [194J ▼]       │  ─────────────────────────────       │
│  Payment ₹: [_______]    │  Payment Amount: ₹1,00,000           │
│  Date: [__/__/____]      │  TDS to Deduct: ₹10,000              │
│                          │  Net Payable: ₹90,000                │
│  [Calculate TDS]         │  Deposit By: 07 May 2026             │
│                          │  ⚠️ 206AB: Not Applicable            │
└──────────────────────────┴──────────────────────────────────────┘
```

### Form 24Q Tab (Salary TDS)
```
┌─────────────────────────────────────────────────────────────────┐
│  Form 24Q — Q4 FY 2025-26   Status: ● Draft   Due: 31 May 2026  │
│  [Run Notice Check]  [Generate TXT]  [File Return →]            │
├─────────────────────────────────────────────────────────────────┤
│  Sub-tabs: [Employees] [Challans] [Payments] [Salary Details]   │
├─────────────────────────────────────────────────────────────────┤
│  Summary bar: Employees: 12  │  Total TDS: ₹4,82,000            │
│               Challans: 4   │  Deposited: ₹4,82,000             │
├─────────────────────────────────────────────────────────────────┤
│  [Employee table / Challan table / Payment table — by sub-tab]  │
└─────────────────────────────────────────────────────────────────┘
```

### Form 26Q Tab (Non-Salary TDS)
```
┌─────────────────────────────────────────────────────────────────┐
│  Form 26Q — Q4 FY 2025-26   Status: ● Filed   ARN: 12345...     │
│  [Run Notice Check]  [Generate TXT]  [File Return →]            │
├─────────────────────────────────────────────────────────────────┤
│  Sub-tabs: [Deductees] [Challans] [Payments]                    │
├─────────────────────────────────────────────────────────────────┤
│  Summary bar: Deductees: 28  │  Sections: 194C, 194J, 194I      │
│               Total TDS: ₹1,28,500  │  Challans: 3             │
├─────────────────────────────────────────────────────────────────┤
│  PAN | Name | Section | Payment ₹ | TDS ₹ | Deposit By | Status │
└─────────────────────────────────────────────────────────────────┘
```

### Certificates Tab
```
┌─────────────────────────────────────────────────────────────────┐
│  TDS Certificates           FY: FY 2025-26                      │
├──────────────────────────┬──────────────────────────────────────┤
│  Form 16 (Salary)        │  Form 16A (Non-Salary)               │
│  Based on: Form 24Q      │  Based on: Form 26Q / 27Q            │
│  Q4 must be filed first  │  Any quarter                         │
│                          │                                       │
│  Prerequisite: ✅ Filed  │  Prerequisite: ✅ Filed              │
│  [Generate Form 16 →]    │  [Generate Form 16A →]               │
│                          │                                       │
│  Status: ● Ready          │  Status: ⏳ In Progress             │
│  [Download ZIP (12)]     │  ETA: ~2 minutes                     │
└──────────────────────────┴──────────────────────────────────────┘
```

### Filing History Tab
```
┌─────────────────────────────────────────────────────────────────┐
│  Form  | Quarter    | Filed On   | Status    | Receipt No.      │
│  ──────────────────────────────────────────────────────         │
│  24Q   | Q3 FY25-26 | 28 Jan 26  | ✅ Filed  | 123456789... [↓] │
│  26Q   | Q3 FY25-26 | 28 Jan 26  | ✅ Filed  | 123456790... [↓] │
│  24Q   | Q4 FY25-26 | —          | ⚠️ Pending | — [File →]      │
│  26Q   | Q4 FY25-26 | —          | ⚠️ Pending | — [File →]      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 12. Filing Wizard Screens

### TDS Filing Wizard (shared for 24Q / 26Q / 27Q)

```
Step 1: Deductor Details Review
  ─ Confirm / edit TAN, PAN, name, address, responsible person

Step 2: Return Data Review
  ─ Review employee/deductee list, challans, payments
  ─ Totals validation: Sum of payments vs challan amounts

Step 3: Potential Notice Check (optional)
  ─ Submit analytics job
  ─ Show notice summary: short_payment / short_deduction / late_payment
  ─ Display penalty estimates
  ─ [Continue anyway] or [Go back to fix]

Step 4: Generate TXT File
  ─ Submit TDS Reports job
  ─ Show progress: Submitted → Processing → Ready
  ─ [Download TXT for offline review]

Step 5: CSI Download
  ─ Generate OTP via TRACES for deductor TAN
  ─ Enter OTP to retrieve CSI file
  ─ Show: challan reconciliation summary

Step 6: Generate FVU
  ─ Submit FVU job (TXT + CSI)
  ─ Show progress: Submitted → Processing → Validating → Ready / Failed
  ─ On failure: show FVU validation errors + [Download error report]
  ─ On success: [Download FVU ZIP] [Download Form 27A]

Step 7: E-File Return
  ─ Upload FVU ZIP to TRACES/TIN-FC
  ─ Show progress: Submitting → Filed
  ─ On success: show receipt number, [Download Acknowledgement]
  ─ On failure: show TIN-FC error message

Step 8: Confirmation
  ─ Return status: Filed ✅
  ─ Receipt number + ARN
  ─ [Proceed to Generate Form 16/16A]
```

---

## 13. Frontend Components to Build

### Page-level

| Component | File | Purpose |
|-----------|------|---------|
| `TDSPage` | `src/app/dashboard/tds/page.tsx` | Route entry, FY + Quarter state |
| `TDSDashboard` | `src/components/tds/TDSDashboard.tsx` | Header + tab container |

### Calculator Components

| Component | File | Purpose |
|-----------|------|---------|
| `TDSCalculatorTab` | `src/components/tds/TDSCalculatorTab.tsx` | Tab orchestrator (salary vs non-salary toggle) |
| `NonSalaryCalculator` | `src/components/tds/NonSalaryCalculator.tsx` | Input form + instant result card |
| `SalaryCalculator` | `src/components/tds/SalaryCalculator.tsx` | Salary input form (sync) |
| `TDSResultCard` | `src/components/tds/TDSResultCard.tsx` | Result display: section, rate, amount, due date, 206AB flag |

### Form 24Q Components (Salary TDS)

| Component | File | Purpose |
|-----------|------|---------|
| `Form24QTab` | `src/components/tds/Form24QTab.tsx` | Tab orchestrator, sub-tabs |
| `EmployeeTable` | `src/components/tds/EmployeeTable.tsx` | Paginated employee list with PAN, name, regime, category |
| `EmployeeDrawer` | `src/components/tds/EmployeeDrawer.tsx` | Add/edit employee details |
| `ChallanTable` | `src/components/tds/ChallanTable.tsx` | Reusable challan records table |
| `ChallanDrawer` | `src/components/tds/ChallanDrawer.tsx` | Add/edit challan (BSR code, amount, date) |
| `PaymentTable24Q` | `src/components/tds/PaymentTable24Q.tsx` | Salary payment records per employee |
| `SalaryDetailPanel` | `src/components/tds/SalaryDetailPanel.tsx` | Q4 only — all §192 salary fields (Chapter VI-A deductions) |
| `FilingWizard24Q` | `src/components/tds/FilingWizard24Q.tsx` | 8-step filing modal/sheet |

### Form 26Q Components (Non-Salary TDS)

| Component | File | Purpose |
|-----------|------|---------|
| `Form26QTab` | `src/components/tds/Form26QTab.tsx` | Tab orchestrator, sub-tabs |
| `DeducteeTable` | `src/components/tds/DeducteeTable.tsx` | Vendor/contractor list with PAN, 206AB flag |
| `DeducteeDrawer` | `src/components/tds/DeducteeDrawer.tsx` | Add/edit deductee with section selector |
| `PaymentTable26Q` | `src/components/tds/PaymentTable26Q.tsx` | Non-salary payment records with section, rate, lower-deduction reason |
| `FilingWizard26Q` | `src/components/tds/FilingWizard26Q.tsx` | 8-step filing modal/sheet |

### Analytics Components

| Component | File | Purpose |
|-----------|------|---------|
| `PotentialNoticesPanel` | `src/components/tds/PotentialNoticesPanel.tsx` | Notice check summary: short_payment, short_deduction, interest estimates |
| `NoticeDetailTable` | `src/components/tds/NoticeDetailTable.tsx` | Row-level notice breakdown per payment / challan |

### Certificate Components

| Component | File | Purpose |
|-----------|------|---------|
| `CertificatesTab` | `src/components/tds/CertificatesTab.tsx` | Form 16 + Form 16A side-by-side |
| `CertificateJobCard` | `src/components/tds/CertificateJobCard.tsx` | Per-form job status + download button |
| `TRACESCredentialsModal` | `src/components/tds/TRACESCredentialsModal.tsx` | Secure TRACES login input for cert generation |

### Shared TDS Components

| Component | File | Purpose |
|-----------|------|---------|
| `TDSPeriodSelector` | `src/components/tds/TDSPeriodSelector.tsx` | FY + Quarter dual selector |
| `ReturnStatusBadge` | `src/components/tds/ReturnStatusBadge.tsx` | Filed / Draft / Pending / Processing |
| `JobProgressTracker` | `src/components/tds/JobProgressTracker.tsx` | Async job: submitted → queued → succeeded/failed + loading bar |
| `FilingHistoryTable` | `src/components/tds/FilingHistoryTable.tsx` | History tab: all quarters, all forms |
| `TDSSummaryBar` | `src/components/tds/TDSSummaryBar.tsx` | Summary strip: employee/deductee count, total TDS, challan status |

---

## 14. Mock Data Structure

### `src/data/tds.json`

```json
{
  "deductor": {
    "tan": "AHMA09719B",
    "pan": "AABCT1332L",
    "name": "Acme Technologies Pvt Ltd",
    "branch": "Head Office",
    "gstin": "27AABCU9603R1ZX",
    "address": {
      "street": "4th Floor, Tower B",
      "area": "Bandra Kurla Complex",
      "city": "Mumbai",
      "state": "MH",
      "postal_code": "400051"
    },
    "email": "finance@acmetech.in",
    "mobile": "9820000001",
    "responsible_person": {
      "name": "Priya Sharma",
      "pan": "BXYPS1234A",
      "designation": "Finance Manager"
    }
  },
  "periods": [
    {
      "financial_year": "FY 2025-26",
      "quarter": "Q4",
      "label": "Q4 FY 2025-26 (Jan–Mar 2026)",
      "form24q": {
        "status": "draft",
        "dueDate": "2026-05-31",
        "filedDate": null,
        "receiptNumber": null,
        "totalEmployees": 12,
        "totalTDS": 482000,
        "totalChallans": 4,
        "challansDeposited": 482000
      },
      "form26q": {
        "status": "draft",
        "dueDate": "2026-05-31",
        "filedDate": null,
        "receiptNumber": null,
        "totalDeductees": 28,
        "totalTDS": 128500,
        "totalChallans": 3,
        "challansDeposited": 128500
      }
    },
    {
      "financial_year": "FY 2025-26",
      "quarter": "Q3",
      "label": "Q3 FY 2025-26 (Oct–Dec 2025)",
      "form24q": {
        "status": "filed",
        "dueDate": "2026-01-31",
        "filedDate": "2026-01-28",
        "receiptNumber": "123456789012345"
      },
      "form26q": {
        "status": "filed",
        "dueDate": "2026-01-31",
        "filedDate": "2026-01-28",
        "receiptNumber": "123456789012346"
      }
    }
  ],
  "employees": [
    {
      "id": "emp_001",
      "pan": "BAAPR1234A",
      "name": "Arun Mehta",
      "employee_category": "general",
      "opting_new_regime": true,
      "is_pan_operative": true,
      "monthly_salary": 150000,
      "annual_tds": 84000
    },
    {
      "id": "emp_002",
      "pan": "CAASP5678B",
      "name": "Sunita Patil",
      "employee_category": "women",
      "opting_new_regime": false,
      "is_pan_operative": true,
      "monthly_salary": 95000,
      "annual_tds": 42000
    }
  ],
  "challans24Q": [
    {
      "challan_serial": "00012",
      "bsr_code": "0510308",
      "paid_date": "2026-02-07",
      "minor_head": "200",
      "tds_amount": 120500,
      "surcharge": 0,
      "health_and_education_cess": 0,
      "interest": 0,
      "late_filing_fees": 0,
      "other_penalty": 0
    }
  ],
  "deductees": [
    {
      "id": "ded_001",
      "pan": "DAASC2468C",
      "name": "Code Crafters Pvt Ltd",
      "is_206ab_applicable": false,
      "is_pan_operative": true,
      "payments": [
        {
          "section": "194J",
          "code": "94JB",
          "nature": "professional_services",
          "payment_amount": 500000,
          "tds_amount": 50000,
          "payment_date": "2026-02-15",
          "deduction_date": "2026-02-15"
        }
      ]
    },
    {
      "id": "ded_002",
      "pan": "EAASC3579D",
      "name": "Build & Fix Contractors",
      "is_206ab_applicable": false,
      "is_pan_operative": true,
      "payments": [
        {
          "section": "194C",
          "code": "94C",
          "nature": "contractual_payment",
          "payment_amount": 300000,
          "tds_amount": 6000,
          "payment_date": "2026-01-20",
          "deduction_date": "2026-01-20"
        }
      ]
    }
  ],
  "certificates": {
    "form16": {
      "FY 2024-25": {
        "status": "available",
        "generated_date": "2025-07-15",
        "download_url": "/mock/form16_fy2425.zip"
      }
    },
    "form16a": {
      "FY 2024-25 Q4": {
        "status": "available",
        "generated_date": "2025-07-10",
        "download_url": "/mock/form16a_q4fy2425.zip"
      }
    }
  }
}
```

---

## 15. 206AB / 206CCA Compliance Check

Section 206AB requires **higher TDS rate** (twice the normal rate or 5%, whichever is higher) for **specified persons** — those who have not filed ITR for both preceding years AND aggregate TDS/TCS was ≥ ₹50,000 per year.

### UI Treatment
- Every **deductee PAN** lookup in the non-salary payment drawer should trigger a 206AB check
- Display a badge on the row: `206AB: Applicable (5%)` vs `206AB: Not Applicable`
- **Calculator result** clearly calls out if 206AB applies and shows adjusted rate

### API Response Fields
| Field | Description |
|-------|-------------|
| `pan` | Deductee PAN (masked) |
| `name` | Deductee name (masked) |
| `financial_year` | Current FY |
| `specified_person_us_206ab_&_206cca` | `y` = higher rate applies, `n` = normal rate |
| `pan_status` | `operative` / `inoperative` / `na` |
| `pan_allotment_date` | PAN issued date |

> If `pan_status = inoperative`, deduct TDS at **20%** (Section 206AA).

---

## 16. Deadline Calendar (TDS-Specific)

| Due Date | Obligation |
|----------|-----------|
| 7th of each month | Deposit TDS deducted in previous month (except March) |
| 30 April | Deposit TDS deducted in March |
| 31 July | File Q1 TDS returns (24Q, 26Q, 27Q) |
| 31 October | File Q2 TDS returns |
| 31 January | File Q3 TDS returns |
| 31 May | File Q4 TDS returns |
| 15 June | Issue Form 16A for Q4 |
| 15 June | Issue Form 16 for FY (salary) |

> These deadlines map directly to the `DeadlineCard` component on the main dashboard.

---

## 17. Relationship with Other Modules

| Module | Relationship |
|--------|-------------|
| **GST** | Deductee GSTIN links to GST module vendor master. Payments subject to both TDS and GST can be cross-referenced. |
| **Dashboard** | Main dashboard `DeadlineCard` shows TDS deposit deadlines and quarterly filing due dates. `HealthScoreGauge` factors in TDS compliance status (returns filed, challans up-to-date). |
| **Onboarding** | TAN and responsible person details collected during onboarding flow, pre-populating the TDS deductor fields. |

---

## 18. Key UI States & Error Handling

### Job Status States

| Status | UI Representation |
|--------|-----------------|
| `created` | Grey badge — "Submitted" |
| `queued` | Yellow badge — "Queued" with spinner |
| `in_progress` | Blue badge — "Processing" with progress bar |
| `succeeded` | Green badge — "Ready" with download button |
| `failed` | Red badge — "Failed" with error detail + retry |

### Common Error Scenarios
| Scenario | UI Handling |
|----------|------------|
| PAN not available (`PANNOTAVBL`) | Warn: TDS deducted at 20% under §206AA |
| Challan amount < TDS deducted | Block filing → show short-payment notice |
| FVU validation failure | Show validation_url download link + error summary |
| TRACES credentials invalid | Re-prompt credentials modal |
| TIN-FC: duplicate filing | Show error: "Original return already filed for this period" |
| 206AB applicable | Show rate override badge on payment row |

---

## 19. Security Considerations

- **TRACES credentials** are not stored in `data/*.json` mock files — only referenced by job responses
- **TAN** is the primary deductor identifier; validate `[A-Z]{4}[0-9]{5}[A-Z]` pattern before API calls
- **PAN** inputs validated against pattern `[A-Z]{5}[0-9]{4}[A-Z]` at form boundary
- **Salary details** (Section 17, Chapter VI-A deductions) must not be exposed in client-side logs
- S3 pre-signed URLs from job responses are **time-limited** — download immediately on `succeeded`
- §206AB check response includes **masked PAN and name** — do not unmask in UI
