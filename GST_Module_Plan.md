# GST Module — Frontend Plan

**Source:** Sandbox.co.in GST Compliance API  
**Covers:** GSTR-1 and GSTR-3B full filing workflows  
**Stack:** Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui  
**Route:** `/dashboard/gst`

---

## 1. What Are These Returns?

### GSTR-1
A **monthly or quarterly return** reporting all **outward supplies (sales)**. Every invoice issued to registered buyers (B2B), unregistered buyers (B2C), exports, credit/debit notes, advance receipts, and HSN summaries must be reported here. The data flows downstream — GSTR-2B of the buyer is auto-populated from your GSTR-1.

> **Due date:** 11th of the following month (monthly filers).

### GSTR-3B
A **monthly or quarterly self-declaration summary return** where the taxpayer:
- Declares total outward tax liability (aggregated, not invoice-by-invoice)
- Claims Input Tax Credit (ITC) on purchases
- Offsets liability using available ITC + cash ledger balance
- Pays any remaining tax using cash

> GSTR-1 must be filed **before** GSTR-3B for the same period. GSTR-3B must reconcile with GSTR-1.

---

## 2. GSTR-1 Data Structure

### Filing Metadata
| Field | API Key | UI Description |
|-------|---------|----------------|
| Filing Period | `fp` | e.g., "112023" (Nov 2023) |
| GSTIN | `gstin` | Auto-populated from onboarding |
| Gross Turnover (annual) | `gt` | Numeric input (₹) |
| Current Period Gross Turnover | `cur_gt` | Numeric input (₹) |

### Table Sections (all correspond to official GSTR-1 tables)

| API Key | GSTR-1 Table | Description | UI Treatment |
|---------|-------------|-------------|--------------|
| `b2b` | 4A, 4B, 6B, 6C | B2B invoices — sales to GST-registered buyers (all values) | Paginated data table with add-invoice drawer |
| `b2ba` | 9A | Amendments to B2B invoices | Separate amendment table |
| `b2cl` | 5A, 5B | B2C Large — inter-state sales to unregistered buyers **> ₹2.5L** | Data table |
| `b2cla` | 9A | Amendments to B2C Large | Separate amendment table |
| `b2cs` | 7 | B2C Small — intrastate + inter-state ≤ ₹2.5L (rate-wise consolidated, not invoice-by-invoice) | Rate-wise summary form (no invoice list) |
| `b2csa` | 10 | Amendments to B2C Small | Amendment form |
| `exp` | 6A | Export invoices (with/without payment, SEZ) | Data table |
| `expa` | 9A | Amendments to exports | Separate table |
| `cdnr` | 9B | Credit/Debit notes issued to registered persons | Data table (type: credit/debit, linked invoice) |
| `cdnra` | 9C | Amendments to CDNR | Separate table |
| `cdnur` | 9B | Credit/Debit notes issued to unregistered persons | Data table |
| `cdnura` | 9C | Amendments to CDNUR | Separate table |
| `nil` | 8A–8D | Nil-rated, exempt, and non-GST outward supplies | Simple 4-row summary form |
| `hsn` | 12 | HSN-wise summary of all outward supplies | HSN table (code, description, UQC, qty, value, tax) |
| `at` | 11A | Advance received (tax payable, invoice not yet issued) | Data table |
| `ata` | 11A | Amendments to advances | Separate table |
| `txpd` | 11B | Advance tax adjusted against invoices issued | Data table |
| `txpda` | 11B | Amendments to advance adjustments | Separate table |
| `doc_issue` | 13 | Document series summary (invoice serial numbers issued) | Form with series ranges |
| `ecom` | 14 | Supplies via e-commerce operators | Data table |
| `ecoma` | 14A | Amendments to e-commerce supplies | Separate table |

### B2B Invoice Fields (most detailed / primary table)
Each entry in `b2b` contains:
```
Receiver GSTIN
Invoice Number
Invoice Date
Invoice Value (₹)
Place of Supply (State code)
Whether Reverse Charge (Y/N)
Invoice Type (Regular / SEZ with payment / SEZ without payment / Deemed Export)
Rate (%)
Taxable Value (₹)
IGST (₹)
CGST (₹)
SGST/UTGST (₹)
Cess (₹)
```

### B2CL Invoice Fields
```
Invoice Number
Invoice Date
Invoice Value (₹)
Place of Supply (State code)
Rate (%)
Taxable Value (₹)
IGST (₹)
Cess (₹)
```

### CDN Fields (Credit/Debit Note)
```
Receiver GSTIN (for CDNR)
Credit/Debit Note Number
Note Date
Note Type (Credit / Debit)
Place of Supply
Supply Type
Note Value (₹)
Rate (%)
Taxable Value (₹)
IGST / CGST / SGST / Cess
```

### HSN Summary Fields
```
HSN Code
Description
UQC (Unit of Quantity Code)
Total Quantity
Total Value (₹)
Rate (%)
Total Taxable Value (₹)
IGST / CGST / SGST / Cess
```

---

## 3. GSTR-3B Data Structure

Unlike GSTR-1, GSTR-3B is a **summary return** — no individual invoices, only aggregated totals per category.

### Section 3.1 — Outward and Inward Supplies (`sup_details`)
Summary of all outward supply categories:

| Row | Description | Columns |
|-----|-------------|---------|
| (a) | Outward taxable supplies (other than zero-rated, nil, and exempt) | Taxable Value, IGST, CGST, SGST/UTGST, Cess |
| (b) | Outward taxable supplies (zero-rated) | Taxable Value, IGST, Cess |
| (c) | Other outward supplies (nil-rated, exempt) | Taxable Value |
| (d) | Inward supplies liable to reverse charge (nature of supply) | Taxable Value, IGST, CGST, SGST/UTGST, Cess |
| (e) | Non-GST outward supplies | Taxable Value |

> **UI:** Editable grid/table, one row per category. Columns match tax heads.

### Section 3.2 — Inter-State Supplies (`inter_sup`)
Supplies to unregistered, composition dealers, and UIN holders:
```
Supplies to unregistered persons (state-wise)
Supplies to composition taxable persons (state-wise)
Supplies to UIN holders (state-wise)
Each row: Place of Supply, Taxable Value, IGST amount
```

> **UI:** Collapsible section or secondary table, often less frequently used.

### Section 4 — ITC Eligibility (`itc_elg`)

| Sub-section | Description | Tax Heads |
|-------------|-------------|-----------|
| 4A | ITC available (IGST, CGST, SGST) | Import of goods / Import of services / Others |
| 4B | ITC reversed (as per rules) | Rule 42 / Rule 43 / Others |
| 4C | Net ITC available (4A − 4B) | Auto-calculated |
| 4D | ITC ineligible (blocked under Sec 17(5)) | IGST / CGST / SGST |

> **UI:** Table with sub-rows and auto-calculated totals. Read-only for 4C.

### Section 5 — Inward Supplies (Reverse Charge) (`inward_sup`)
```
From registered suppliers: Taxable Value, IGST, CGST, SGST, Cess
From unregistered suppliers: Taxable Value, IGST, CGST, SGST, Cess
```

> **UI:** Two-row summary table.

### Section 5.1 — Interest and Late Fee (`intr_ltfee`)
```
Interest on IGST, CGST, SGST (if any)
Late fee on IGST, CGST, SGST (system computed by GST portal)
```

> **UI:** Read-only summary card / info row (values mostly auto-populated by portal).

### Section 6 — Tax Payment (`tx_pmt`) — populated after liability offset
```
IGST: Tax payable, Paid via ITC (IGST), Paid via cash
CGST: Tax payable, Paid via ITC (IGST credit), Paid via ITC (CGST), Paid via cash
SGST: Tax payable, Paid via ITC (IGST credit), Paid via ITC (SGST), Paid via cash
Cess: Tax payable, Paid via ITC (Cess), Paid via cash
```

> **UI:** Tax payment summary table — shown after offset step in the filing wizard.

### Ledger Balances (separate API — `ledgers/bal`)
```
Cash ledger: IGST balance, CGST balance, SGST balance, Cess balance
ITC ledger: IGST ITC, CGST ITC, SGST ITC, Cess ITC
Liability ledger: IGST liability, CGST liability, SGST liability, Cess liability
```

> **UI:** Balance cards shown before the offset step — "Available ITC" and "Cash Balance".

---

## 4. Filing Workflows

### GSTR-1 Filing Steps
```
1. Authenticate (OTP → Taxpayer Session, 6-hour validity)
2. Save Data (POST all invoice sections)
3. Poll Return Status (check for validation errors)
4. Proceed to File (POST /new-proceed?is_nil=N)
5. Get Summary (GET summary with sec_sum + chksum)
6. Generate EVC OTP (POST /evc/otp with PAN)
7. File Return (POST /file with OTP, sec_sum, chksum)
8. Verify Status (poll until confirmed)
```

### GSTR-3B Filing Steps
```
1. Authenticate (OTP → Taxpayer Session, 6-hour validity)
2. Get Existing Data (GET to review what's already saved)
3. Save Data (POST sup_details, itc_elg, inward_sup, inter_sup, intr_ltfee)
4. Poll Return Status
5. Get Ledger Balance (GET /ledgers/bal)
6. Offset Liability (POST /offset-liability with pdcash + pditc)
7. Poll Status
8. Get Updated Details (GET to retrieve tx_pmt)
9. Generate EVC OTP (POST /evc/otp?gstr=gstr-3b with PAN)
10. File Return (POST /file with OTP and full payload including tx_pmt)
11. Verify Status
```

> **Key difference:** GSTR-3B has the additional Ledger → Offset Liability loop before filing.

> **Prerequisite:** GSTR-1 must be filed before GSTR-3B for the same period.

---

## 5. Page Layout Plan

### Route: `/dashboard/gst`

```
┌─────────────────────────────────────────────────────────────┐
│  GST Compliance                              [Period: ▼ Nov 2024] │
│  GSTIN: 27AABCU9603R1ZX · Acme Technologies Pvt Ltd         │
├─────────────────────────────────────────────────────────────┤
│  [GSTR-1]  [GSTR-3B]  [Filing History]                      │
├─────────────────────────────────────────────────────────────┤
│  (Tab content below)                                        │
└─────────────────────────────────────────────────────────────┘
```

### GSTR-1 Tab Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Status: ● Draft   Due: 11 Dec 2024   [File GSTR-1 →]       │
├──────┬────────┬────────┬────────┬────────┬────────┬────────┤
│ B2B  │ B2CL  │ B2CS  │ Exports│  CDN   │  HSN   │ Nil    │
├─────────────────────────────────────────────────────────────┤
│  Summary bar: Taxable ₹X  │  IGST ₹X  │  CGST ₹X  │ SGST ₹X │
├─────────────────────────────────────────────────────────────┤
│  [Invoice table with search + Add Invoice button]           │
│  GSTIN | Invoice No. | Date | Value | Rate | Tax | Actions  │
│  ──────────────────────────────────────────────────         │
│  29AAAC… | INV-001 | 01/11 | ₹1,20,000 | 18% | ₹21,600 | ✏️ 🗑 │
└─────────────────────────────────────────────────────────────┘
```

### GSTR-3B Tab Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Status: ● Not Started   Due: 20 Dec 2024   [File GSTR-3B →] │
├─────────────────────────────────────────────────────────────┤
│  ITC Available: ₹45,200  │  Cash Balance: ₹12,000  │  Liability: ₹58,400 │
├─────────────────────────────────────────────────────────────┤
│  ▼ 3.1 Outward Supplies [editable summary table]            │
│  ▼ 3.2 Inter-State Supplies                                 │
│  ▼ 4. ITC Eligibility [with auto-calculated net ITC]        │
│  ▼ 5. Inward Supplies (Reverse Charge)                      │
│  ▼ 5.1 Interest & Late Fee [read-only]                      │
│  ▼ 6. Tax Payment Summary [appears after offset step]       │
└─────────────────────────────────────────────────────────────┘
```

### Filing History Tab Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Return | Period  | Filed On   | Status  | ARN              │
│  ────────────────────────────────────────────────────       │
│  GSTR-1 | Oct 2024 | 10 Nov 24 | ✅ Filed | AA27... [View]  │
│  GSTR-3B | Oct 2024 | 18 Nov 24 | ✅ Filed | AA27... [View]  │
│  GSTR-1 | Nov 2024 | —         | ⚠️ Pending | —             │
│  GSTR-3B | Nov 2024 | —         | 🔒 Blocked | —            │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Frontend Components to Build

### Page-level
| Component | File | Purpose |
|-----------|------|---------|
| `GSTPage` | `src/app/dashboard/gst/page.tsx` | Route entry, period state |
| `GSTDashboard` | `src/components/gst/GSTDashboard.tsx` | Header + tab container |

### GSTR-1 Components
| Component | File | Purpose |
|-----------|------|---------|
| `GSTR1Tab` | `src/components/gst/GSTR1Tab.tsx` | Tab orchestrator, sub-tabs |
| `InvoiceTable` | `src/components/gst/InvoiceTable.tsx` | Reusable table for B2B/B2CL/CDN/EXP |
| `InvoiceDrawer` | `src/components/gst/InvoiceDrawer.tsx` | Add/edit invoice side drawer |
| `B2CSSummary` | `src/components/gst/B2CSSummary.tsx` | Rate-wise consolidated form (no invoices) |
| `NilSupplySummary` | `src/components/gst/NilSupplySummary.tsx` | 4-row nil/exempt/non-GST form |
| `HSNSummaryTable` | `src/components/gst/HSNSummaryTable.tsx` | HSN-wise summary table |
| `GSTR1Summary` | `src/components/gst/GSTR1Summary.tsx` | Top summary bar (totals) |
| `FilingWizardGSTR1` | `src/components/gst/FilingWizardGSTR1.tsx` | 8-step filing flow modal/sheet |

### GSTR-3B Components
| Component | File | Purpose |
|-----------|------|---------|
| `GSTR3BTab` | `src/components/gst/GSTR3BTab.tsx` | Tab orchestrator, section accordion |
| `OutwardSuppliesTable` | `src/components/gst/OutwardSuppliesTable.tsx` | Section 3.1 editable grid |
| `InterStateSuppliesTable` | `src/components/gst/InterStateSuppliesTable.tsx` | Section 3.2 |
| `ITCEligibilityTable` | `src/components/gst/ITCEligibilityTable.tsx` | Section 4 with auto-calculated net |
| `InwardSuppliesTable` | `src/components/gst/InwardSuppliesTable.tsx` | Section 5 reverse charge |
| `LedgerBalanceCard` | `src/components/gst/LedgerBalanceCard.tsx` | ITC + cash + liability summary |
| `LiabilityOffsetPanel` | `src/components/gst/LiabilityOffsetPanel.tsx` | Allocate ITC vs cash per tax head |
| `TaxPaymentSummary` | `src/components/gst/TaxPaymentSummary.tsx` | Section 6 — post-offset read-only |
| `FilingWizardGSTR3B` | `src/components/gst/FilingWizardGSTR3B.tsx` | 11-step filing flow modal/sheet |

### Shared GST Components
| Component | File | Purpose |
|-----------|------|---------|
| `PeriodSelector` | `src/components/gst/PeriodSelector.tsx` | Month/year dropdown |
| `ReturnStatusBadge` | `src/components/gst/ReturnStatusBadge.tsx` | Filed / Draft / Pending / Blocked |
| `EVCOTPModal` | `src/components/gst/EVCOTPModal.tsx` | OTP entry dialog for filing |
| `FilingHistoryTable` | `src/components/gst/FilingHistoryTable.tsx` | History tab table |

---

## 7. Mock Data Structure

### `src/data/gst.json`
```json
{
  "periods": [
    {
      "year": 2024,
      "month": 11,
      "label": "November 2024",
      "gstr1": {
        "status": "draft",
        "dueDate": "2024-12-11",
        "filedDate": null,
        "arn": null,
        "totals": {
          "taxableValue": 1250000,
          "igst": 112500,
          "cgst": 45000,
          "sgst": 45000,
          "cess": 0
        }
      },
      "gstr3b": {
        "status": "blocked",
        "dueDate": "2024-12-20",
        "filedDate": null,
        "arn": null
      }
    },
    {
      "year": 2024,
      "month": 10,
      "label": "October 2024",
      "gstr1": {
        "status": "filed",
        "dueDate": "2024-11-11",
        "filedDate": "2024-11-10",
        "arn": "AA270824073155R"
      },
      "gstr3b": {
        "status": "filed",
        "dueDate": "2024-11-20",
        "filedDate": "2024-11-18",
        "arn": "AA270824073156S"
      }
    }
  ],
  "ledger": {
    "cash": { "igst": 8000, "cgst": 2000, "sgst": 2000, "cess": 0 },
    "itc": {
      "igst": 38500,
      "cgst": 12000,
      "sgst": 12000,
      "cess": 0
    },
    "liability": {
      "igst": 112500,
      "cgst": 45000,
      "sgst": 45000,
      "cess": 0
    }
  }
}
```

### `src/data/invoices.json`
```json
{
  "b2b": [
    {
      "id": "inv_001",
      "receiverGstin": "07AAGCM8702N1Z3",
      "receiverName": "Metro Distributors Pvt Ltd",
      "invoiceNumber": "INV-2024-001",
      "invoiceDate": "2024-11-03",
      "invoiceValue": 141600,
      "placeOfSupply": "07",
      "reverseCharge": false,
      "invoiceType": "Regular",
      "items": [
        {
          "rate": 18,
          "taxableValue": 120000,
          "igst": 21600,
          "cgst": 0,
          "sgst": 0,
          "cess": 0
        }
      ]
    },
    {
      "id": "inv_002",
      "receiverGstin": "19AAHCS4321B1ZV",
      "receiverName": "Sunrise Tech Solutions",
      "invoiceNumber": "INV-2024-002",
      "invoiceDate": "2024-11-10",
      "invoiceValue": 236000,
      "placeOfSupply": "19",
      "reverseCharge": false,
      "invoiceType": "Regular",
      "items": [
        {
          "rate": 18,
          "taxableValue": 200000,
          "igst": 36000,
          "cgst": 0,
          "sgst": 0,
          "cess": 0
        }
      ]
    }
  ],
  "b2cl": [
    {
      "id": "b2cl_001",
      "invoiceNumber": "INV-2024-010",
      "invoiceDate": "2024-11-15",
      "invoiceValue": 310000,
      "placeOfSupply": "06",
      "rate": 18,
      "taxableValue": 262712,
      "igst": 47288,
      "cess": 0
    }
  ],
  "b2cs": [
    {
      "rate": 18,
      "placeOfSupply": "27",
      "taxableValue": 150000,
      "cgst": 13500,
      "sgst": 13500,
      "cess": 0
    },
    {
      "rate": 12,
      "placeOfSupply": "27",
      "taxableValue": 80000,
      "cgst": 4800,
      "sgst": 4800,
      "cess": 0
    }
  ],
  "cdnr": [
    {
      "id": "cdn_001",
      "receiverGstin": "07AAGCM8702N1Z3",
      "noteNumber": "CN-2024-001",
      "noteDate": "2024-11-20",
      "noteType": "Credit",
      "placeOfSupply": "07",
      "noteValue": 11800,
      "rate": 18,
      "taxableValue": 10000,
      "igst": 1800,
      "cgst": 0,
      "sgst": 0,
      "cess": 0
    }
  ],
  "hsn": [
    {
      "hsnCode": "998314",
      "description": "IT consulting and support services",
      "uqc": "OTH",
      "quantity": 1,
      "totalValue": 532712,
      "rate": 18,
      "taxableValue": 532712,
      "igst": 104888,
      "cgst": 18300,
      "sgst": 18300,
      "cess": 0
    }
  ],
  "gstr3b": {
    "sup_details": {
      "osup_det": { "txval": 532712, "iamt": 104888, "camt": 18300, "samt": 18300, "csamt": 0 },
      "osup_zero": { "txval": 0, "iamt": 0, "csamt": 0 },
      "osup_nil_exmp": { "txval": 0 },
      "isup_rev": { "txval": 0, "iamt": 0, "camt": 0, "samt": 0, "csamt": 0 },
      "osup_nongst": { "txval": 0 }
    },
    "itc_elg": {
      "itc_avl": [
        { "ty": "IMPG", "iamt": 0, "camt": 0, "samt": 0, "csamt": 0 },
        { "ty": "IMPS", "iamt": 0, "camt": 0, "samt": 0, "csamt": 0 },
        { "ty": "ISRC", "iamt": 38500, "camt": 12000, "samt": 12000, "csamt": 0 },
        { "ty": "ISD", "iamt": 0, "camt": 0, "samt": 0, "csamt": 0 },
        { "ty": "OTH", "iamt": 0, "camt": 0, "samt": 0, "csamt": 0 }
      ],
      "itc_rev": [
        { "ty": "RUL42", "iamt": 0, "camt": 0, "samt": 0, "csamt": 0 },
        { "ty": "RUL43", "iamt": 0, "camt": 0, "samt": 0, "csamt": 0 },
        { "ty": "OTH", "iamt": 0, "camt": 0, "samt": 0, "csamt": 0 }
      ],
      "itc_net": { "iamt": 38500, "camt": 12000, "samt": 12000, "csamt": 0 },
      "itc_inelg": [
        { "ty": "RUL17-5", "iamt": 0, "camt": 0, "samt": 0, "csamt": 0 },
        { "ty": "OTH", "iamt": 0, "camt": 0, "samt": 0, "csamt": 0 }
      ]
    },
    "inward_sup": {
      "isup_details": [
        { "ty": "GST", "txval": 0, "iamt": 0, "camt": 0, "samt": 0, "csamt": 0 },
        { "ty": "NONGST", "txval": 0, "iamt": 0, "camt": 0, "samt": 0, "csamt": 0 }
      ]
    },
    "intr_ltfee": {
      "intr_details": [
        { "ty": "3B", "iamt": 0, "camt": 0, "samt": 0, "csamt": 0 }
      ]
    }
  }
}
```

---

## 8. Status Values & Their UI Treatment

| Status | Badge Color | Description |
|--------|-------------|-------------|
| `filed` | Green | Return filed, ARN received |
| `draft` | Blue | Data saved but not filed |
| `pending` | Amber | Due soon, not yet started |
| `blocked` | Gray | GSTR-1 not filed — GSTR-3B cannot proceed |
| `overdue` | Red | Past due date, not filed |
| `processing` | Purple | Submitted, awaiting GST portal confirmation |

---

## 9. Key UX Decisions

### Period Selector
- Default to current month
- Disable future months
- Show status badge inline in the dropdown per period

### Nil Return Path
- Separate "File Nil Return" CTA when user has no invoices
- Simplified flow — skip Save Data, go straight to Proceed → EVC → File

### Filing Wizard Design
- Multi-step sheet/drawer (not modal — too much content)
- Step indicator at top
- Each step shows a status: pending / in-progress / done / error
- Status polling shown as animated progress with "Processing..." text
- OTP input as the final step with countdown timer (OTPs expire in ~10 min)
- On error: show GST portal error codes translated to plain English

### GSTR-3B Liability Offset UI
- Show three balance columns side by side: **ITC Available** | **Cash Available** | **Liability**
- For each tax head (IGST/CGST/SGST): slider or input for "Pay from ITC" and "Pay from Cash"
- Auto-calculate remaining liability in real time
- Warn if cash < remaining liability

### Reconciliation Warning
- Cross-check GSTR-3B totals against GSTR-1 totals
- Show a warning banner if values diverge significantly

---

## 10. Implementation Order

1. `src/data/gst.json` and `src/data/invoices.json` — mock data
2. `src/app/dashboard/gst/page.tsx` — route with period state
3. `GSTDashboard.tsx` — header + Tabs shell
4. `FilingHistoryTable.tsx` — simplest tab (read-only table)
5. `GSTR1Tab.tsx` + `InvoiceTable.tsx` + `GSTR1Summary.tsx` — B2B table first
6. `GSTR3BTab.tsx` + section tables (`OutwardSuppliesTable`, `ITCEligibilityTable`)
7. `LedgerBalanceCard.tsx` + `LiabilityOffsetPanel.tsx`
8. `FilingWizardGSTR1.tsx` and `FilingWizardGSTR3B.tsx` — filing flow sheets
9. `EVCOTPModal.tsx` — OTP entry with timer
10. Polish: status badges, reconciliation warning, nil return path
