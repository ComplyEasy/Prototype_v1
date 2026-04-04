# ROC / MCA21 Module — Frontend Plan

**Source:** Sandbox.co.in MCA APIs (Company Master Data, Director Master Data, EntityLocker)
**Covers:** Company profile verification, Director KYC management, ROC filing tracker, board resolution templates, filing history
**Stack:** Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui
**Route:** `/dashboard/roc`

---

## 1. What is ROC / MCA21?

The **Ministry of Corporate Affairs (MCA)** runs **MCA21**, an e-governance portal through which every company and LLP registered in India files statutory returns, reports events, and maintains regulatory records with the **Registrar of Companies (RoC)**.

Under the **Companies Act 2013**, a Private Limited Company has a continuous stream of mandatory filings — annual returns, financial statements, director KYC, auditor appointments, and event-based forms for changes in shareholding, directors, or registered address. Missing deadlines attracts **compound late fees (₹100/day per form) and Section-level disqualification of directors**.

> **CompliEasy's role:** Show founders exactly what needs to be filed, when, who is responsible, and what documents are needed — without them having to read the Act.

---

## 2. Key Entities & Identifiers

| Entity | Description | Identifier |
|--------|-------------|------------|
| **Company** | Private Ltd entity registered under Companies Act 2013 | CIN (Corporate Identification Number) |
| **Director** | Individual authorized to manage the company | DIN (Director Identification Number) |
| **Registrar of Companies** | Regional regulatory authority where the company is registered | RoC Code (e.g., `RoC-Bangalore`) |
| **AGM** | Annual General Meeting — triggers annual filing deadlines | Date on which AGM is held each year |
| **Statutory Auditor** | CA firm that signs off on annual accounts | Firm registration number + PAN |
| **Charge** | A security interest / lien on company assets (e.g., a bank loan) | Charge ID |
| **SRN** | Service Request Number — MCA's acknowledgement of a filed form | Auto-generated on filing |

### CIN Format

```
U 74110 KA 2021 PTC 123456
│  │     │   │    │    └── Sequential number
│  │     │   │    └── Company type (PTC = Private, PLC = Public, LLC = LLP)
│  │     │   └── Year of incorporation
│  │     └── State code
│  └── NIC activity code
└── Listed (L) or Unlisted (U)
```

---

## 3. ROC Filing Calendar

### Annual Mandatory Filings

| Form | Plain English | Due Date | Statutory Section |
|------|--------------|----------|-------------------|
| **MGT-7** | Annual Return | 60 days after AGM | Section 92 |
| **MGT-7A** | Annual Return (Small Co / OPC) | 60 days after AGM | Section 92 |
| **AOC-4** | Financial Statements | 30 days after AGM | Section 137 |
| **ADT-1** | Appointment of Statutory Auditor | 15 days from AGM | Section 139 |
| **DIR-3 KYC** | Director KYC (annual) | 30 September every year | Section 164 |

### AGM Rules (triggers most annual filing deadlines)

| Company Type | AGM Deadline | Default FY End |
|---|---|---|
| First financial year | 9 months from incorporation | — |
| Subsequent years | 6 months from financial year end | March 31 → AGM by Sept 30 |
| OPC (One Person Company) | 9 months from financial year end | March 31 → AGM by Dec 31 |

> **Practical default for startups:** Financial year ends March 31. AGM by September 30. MGT-7 by November 29. AOC-4 by October 30.

### Event-Based Filings

| Form | Trigger Event | Due |
|------|--------------|-----|
| **DIR-12** | Director appointment / resignation / change | 30 days of event |
| **INC-22** | Change of registered office (within same city) | 30 days of change |
| **MGT-14** | Board resolutions (capital, borrowing, investment) | 30 days of passing |
| **SH-7** | Increase in authorized share capital | 30 days of passing resolution |
| **PAS-3** | Return of allotment — new share issuance | 30 days of allotment |
| **CHG-1** | Creation or modification of a charge | 30 days of creation |
| **ADT-3** | Resignation of Statutory Auditor | 30 days of resignation |

---

## 4. API Architecture (Sandbox)

### Available Sandbox MCA APIs

| API | Method + Endpoint | Purpose |
|-----|-------------------|---------|
| **Company Master Data** | `POST /mca/company/master-data/search` | Fetch full company profile from CIN |
| **Director Master Data** | `GET /mca/directors/:din` | Fetch director profile + all appointments |
| **EntityLocker — Initiate** | `POST /entitylocker/session` | Generate consent link for document access |
| **EntityLocker — Fetch Docs** | `GET /entitylocker/documents` | Retrieve Certificate of Incorporation, MoA, AoA |

> **Note:** Sandbox does not offer ROC filing submission APIs. All form filing workflows (MGT-7, AOC-4, etc.) are handed off to **CA via the CA Request workflow** or exported as draft packages. The Sandbox MCA APIs power the **data layer** (company verification, director lookup) while the **compliance tracker is powered by mock data**.

---

### 4a. Company Master Data API

**Request:**
```json
{
  "cin": "U74110KA2021PTC123456",
  "consent": "Y",
  "reason": "ROC compliance management for CompliEasy"
}
```

**Response Data Groups:**

| Group | Key Fields | UI Usage |
|-------|-----------|----------|
| Company Profile | `company_name`, `cin`, `company_status`, `company_category`, `company_subcategory`, `class_of_company`, `roc_code`, `date_of_incorporation` | Company Identity Card |
| Capital Structure | `authorized_capital`, `paidup_capital` | Capital Structure Panel |
| Registered Address | `registered_address`, `state`, `pin_code` | Company info sidebar |
| Compliance Indicators | `active_compliance`, `date_of_last_agm`, `date_of_balance_sheet` | Compliance Health Bar |
| Directors | `directors[]` — `name`, `din`, `pan`, `designation`, `begin_date` | Directors Tab table |
| Signatories | `signatories[]` — `name`, `designation`, `begin_date` | Signatories tab |
| Charges | `charges[]` — `charge_amount`, `date_of_creation`, `status` | Charges Panel |

**Company Status Values:** `Active` | `Strike Off` | `Under Process of Striking Off` | `Amalgamated` | `Dissolved`

---

### 4b. Director Master Data API

**Request:**
```
GET /mca/directors/03272782?consent=Y&reason=Director+KYC+verification
```

**Response Fields:**

| Field | Description | UI Usage |
|-------|-------------|----------|
| `name` | Director full legal name | Director row |
| `din` | DIN | Verified badge / link |
| `date_of_birth` | Date of birth | Director profile drawer |
| `nationality` | Indian / Foreign | Profile drawer |
| `appointments[]` | All current & past appointments | Other directorships list |
| `appointments[].company_name` | Name of the entity | Appointment row |
| `appointments[].cin_llpin` | CIN or LLPIN | Clickable identifier |
| `appointments[].designation` | Director / MD / Partner | Designation badge |
| `appointments[].begin_date` | Appointment date | Tenure display |
| `appointments[].end_date` | Cessation date (null if active) | Active / Resigned badge |

---

### 4c. EntityLocker API (Consent-Based Document Fetch)

**Flow:**
```
1. POST /entitylocker/session  → returns session_link (share with authorized rep)
2. Authorized rep logs in & grants consent in the EntityLocker portal
3. GET /entitylocker/documents → returns verified documents as PDF or JSON
```

**Available Documents via EntityLocker:**

| Document | Use |
|----------|-----|
| Certificate of Incorporation | Primary identity document of the company |
| Company Master Data (from MCA) | Auto-fill company profile |
| GSTIN Certificate | Cross-validates GST registration |
| Udyam Certificate | MSME status verification |
| Business PAN | Company PAN confirmation |

> **Prototype implementation:** EntityLocker fetch is mocked. A "Connect Documents" button triggers a modal showing the consent flow steps. On mock confirmation, documents appear as downloadable cards.

---

## 5. Frontend Screens Breakdown

### Route: `/dashboard/roc`

**Tabs:**
1. **Overview** — Company snapshot + compliance health at a glance
2. **Filing Tracker** — All ROC forms with deadlines, statuses, and actions
3. **Directors** — Director list, DIN verification, DIR-3 KYC status
4. **Documents** — Company documents + board resolution templates
5. **Filing History** — Past filed returns and receipts

---

### Tab 1 — Overview

#### A. ROC Summary Bar (top strip, always visible)

Four stat chips in a horizontal row:

| Chip | Value | Logic |
|------|-------|-------|
| Overdue Forms | 0 | Red if > 0 |
| Due This Month | 2 | Orange if > 0 |
| Directors (KYC Pending) | 1 | Yellow if > 0 |
| Company Status | Active | Green / Red |

---

#### B. Company Identity Card

Full-width card auto-populated from CIN set during onboarding:

| Label | Value |
|-------|-------|
| Company Name | Acme Technologies Private Limited |
| CIN | U74110KA2021PTC123456 |
| Company Status | **Active** (green badge) |
| Date of Incorporation | March 15, 2021 |
| RoC Office | RoC-Bangalore |
| Company Category | Company Limited by Shares |
| Class | Private |
| Registered Address | 42, 4th Floor, Koramangala, Bangalore — 560034 |

**Actions:** `Verify on MCA` (triggers Company Master Data API, mocked) · `Edit` (stub)

---

#### C. Compliance Health Snapshot

Three status cards in a row (red / yellow / green):

| Card | Data Point | Status Logic |
|------|-----------|-------------|
| Last AGM | Sept 28, 2024 | Green if held by Sept 30; Yellow if 1–30 days late; Red if > 30 days late or not held |
| Last Balance Sheet (AOC-4) | Oct 15, 2024 | Green if filed on time; Yellow / Red based on delay |
| Director KYC (DIR-3) | 2 of 3 filed | Green if all done; Yellow if any pending; Red if deadline passed |

---

#### D. Capital Structure Panel

Two-column grid card:

| Field | Value |
|-------|-------|
| Authorized Capital | ₹10,00,000 |
| Paid-up Capital | ₹4,98,000 |
| Shares Issued | 4,980 (@ ₹100 face value) |
| Utilization | 49.8% (progress bar) |

---

#### E. Charges Panel

Collapsible section at the bottom of Overview:
- **No charges:** "No active charges on this company — clear!" badge (green)
- **If charges exist:** Table with `Charge ID | Amount (₹) | Creation Date | Status (Active / Satisfied)`

---

### Tab 2 — Filing Tracker

#### Header Controls

- **Financial Year dropdown:** FY 2025-26 / FY 2024-25 / FY 2023-24
- **Status filter pills:** All | Upcoming | Pending | Filed | Overdue
- **"+ Add Custom Reminder"** button (mocked)

---

#### Filing Tracker Table

| Column | Description |
|--------|-------------|
| Form | MGT-7, AOC-4, etc. (monospace badge, clickable) |
| Plain English | "Annual Return", "Financial Statements", etc. |
| Due Date | Computed: AGM date + offset, or fixed calendar date (DIR-3 KYC) |
| Countdown | "Due in 18 days" / "3 days overdue" |
| Status | Filed · Upcoming · Pending · Overdue · CA Pending |
| Filed On | Date (if applicable) |
| SRN | Service Request Number (if filed) |
| Action | Context-sensitive CTA button |

**Status Badge Color Scheme:**

| Status | Color | Meaning |
|--------|-------|---------|
| Filed | Green | Return submitted successfully |
| Upcoming | Blue | Due date > 30 days away |
| Pending | Yellow | Due within 30 days, not yet filed |
| Overdue | Red | Past due date, not filed |
| CA Pending | Gray | Sent to CA, awaiting action |

**Action Button Logic:**

| Status | Button Label | Action |
|--------|-------------|--------|
| Upcoming / Pending | Send to CA | Opens CA Request workflow |
| Upcoming / Pending | Download Checklist | Generates doc checklist PDF (mock) |
| Overdue | File Now — Urgent | Opens CA Request with urgency flag |
| Filed | View Receipt | Opens SRN detail modal |
| CA Pending | Track Request | Links to `/dashboard/ca-requests` |

---

#### Filing Detail Drawer (slide-in from right on row click)

- **Form title** (e.g., `MGT-7 — Annual Return`)
- **Statutory reference:** Section 92, Companies Act 2013
- **Plain English description:** What this form covers and why it matters
- **Due Date** + countdown chip
- **Status badge**
- **Document checklist** (checkboxes):
  - Checkbox items vary per form (see mock data)
  - Example for MGT-7: Annual Report · Shareholder register · Minutes of AGM · Board resolution
- **Late fee warning** (if overdue): "₹100/day late fee applies under Section 403"
- **"Requires CA sign-off"** notice pill (where applicable)
- **Primary CTA:** `Send to CA` or `Mark as Filed` or `View Receipt`

---

### Tab 3 — Directors

#### Director Summary Bar

Four chips: **Total Directors: 3** · **KYC Filed: 2** · **KYC Pending: 1** · **Resigned This Year: 0**

---

#### Directors Table

| Column | Description |
|--------|-------------|
| Name | Full name |
| DIN | Displayed with `Verified` badge (green) or `Unverified` (gray) |
| Designation | Managing Director · Director · Whole-time Director · Independent Director |
| Appointment Date | From `begin_date` |
| DIR-3 KYC | Filed (green) · Pending (yellow) · Overdue (red) |
| Last Filed | Date of last DIR-3 KYC submission |
| Action | `View Profile` · `Initiate DIR-3 KYC` (if pending) |

---

#### Director Profile Drawer (on row click)

- Director name + DIN
- Designation badge
- Appointment date
- DIR-3 KYC last filed: Sept 15, 2024 · Next due: Sept 30, 2025
- **Other Directorships** (from Director Master Data API): List of other companies/LLPs with designation + tenure
- **"Initiate DIR-3 KYC"** button → opens mocked e-filing confirmation modal

---

#### Add Director Panel

`+ Add Director` button (top right of tab) opens a dialog:
1. Name + DIN input fields
2. On submit: mock-fetches Director Master Data → shows populated profile card
3. Designation selector + appointment date picker
4. `Save Director` → adds to table

---

### Tab 4 — Documents

Split into two sections:

#### A. Company Documents

Card grid (3 cols desktop, 1 col mobile):

| Document | Plain English | Source |
|----------|--------------|--------|
| Certificate of Incorporation | Your birth certificate as a company | EntityLocker / Upload |
| Memorandum of Association (MoA) | Your company's purpose charter | EntityLocker / Upload |
| Articles of Association (AoA) | Your company rulebook | EntityLocker / Upload |
| PAN Card | Company Permanent Account Number | EntityLocker / Upload |
| INC-20A | Certificate of Commencement of Business | EntityLocker / Upload |
| Latest MGT-7 | Last filed Annual Return | Filing History |
| Latest AOC-4 | Last filed Financial Statements | Filing History |

Each card layout:
- Document icon + title + plain English subtitle
- Status: `Available` (green) · `Not Uploaded` (gray)
- `Download` button · `Send to CA` button
- `Fetch from EntityLocker` link (if not yet fetched — triggers mock consent flow)

#### EntityLocker Connect Flow (Modal)
When "Fetch from EntityLocker" is clicked:
1. **Step 1 — Generate Link:** "We'll generate a secure link for your authorized representative" → `Generate Link` button
2. **Step 2 — Authorize:** Display mock link + QR code · "Share this with the authorized signatory of your company"
3. **Step 3 — Confirmed:** Skip to success state showing documents fetched

---

#### B. Board Resolution Templates

Section header: *"Ready-to-use templates for common board decisions. Download, fill in the blanks, and get signed."*

Card grid (3 cols desktop):

| Template | When Used |
|----------|-----------|
| Appointment of Director | Adding a new director to the board |
| Resignation of Director | Director stepping down formally |
| Opening a New Bank Account | Authorizing a new business bank account |
| Change of Authorized Signatory | Updating who can sign cheques and agreements |
| Taking a Business Loan | Formally approving borrowing from a bank/NBFC |
| Change of Registered Office | Moving your company's official address |
| Issue of Shares (Equity) | Allotting new shares to investors or employees |
| Appointment of Statutory Auditor | Onboarding or changing your CA firm |
| Adoption of Financial Statements | Signing off on annual accounts at AGM |
| Declaration of Dividend | Approving distribution of profits to shareholders |
| ESOP Grant | Authorizing employee stock option grant |
| Increase in Authorized Capital | Expanding share capital before a fundraise |

Each card:
- Title + one-line description
- `Preview` button → opens modal with template body text (mock)
- `Download .docx` button
- `Send to CA for Signing` button → triggers CA Request workflow

---

### Tab 5 — Filing History

**Table:**

| Column | Description |
|--------|-------------|
| Form | MGT-7, AOC-4, DIR-3 KYC, etc. |
| Financial Year | FY 2024-25, FY 2023-24, etc. |
| Filed On | Date of submission |
| SRN | Service Request Number |
| Filed By | Founder / CA Partner |
| Mode | Online (MCA21) / Offline |
| Status | Successful · Processing · Failed |
| Action | Download Receipt |

**Filter controls:** FY selector · Form type dropdown · Status filter

---

## 6. Mock Data Structure

### `src/data/roc.json`

```json
{
  "company": {
    "cin": "U74110KA2021PTC123456",
    "company_name": "Acme Technologies Private Limited",
    "company_status": "Active",
    "company_category": "Company limited by Shares",
    "company_subcategory": "Non-govt company",
    "class_of_company": "Private",
    "roc_code": "RoC-Bangalore",
    "date_of_incorporation": "2021-03-15",
    "date_of_last_agm": "2024-09-28",
    "date_of_balance_sheet": "2024-03-31",
    "active_compliance": "Active",
    "authorized_capital": 1000000,
    "paidup_capital": 498000,
    "shares_issued": 4980,
    "face_value_per_share": 100,
    "registered_address": "42, 4th Floor, Koramangala, Bangalore - 560034, Karnataka",
    "email": "compliance@acmetechnologies.in",
    "charges": []
  },
  "directors": [
    {
      "din": "03272782",
      "name": "Rahul Mehta",
      "pan": "ABRPM1234C",
      "designation": "Managing Director",
      "begin_date": "2021-03-15",
      "din_verified": true,
      "dir3_kyc_status": "Filed",
      "dir3_kyc_last_filed": "2024-09-15",
      "dir3_kyc_next_due": "2025-09-30",
      "other_directorships": 2
    },
    {
      "din": "07654321",
      "name": "Priya Sharma",
      "pan": "BKRPS5678D",
      "designation": "Director",
      "begin_date": "2022-06-01",
      "din_verified": true,
      "dir3_kyc_status": "Pending",
      "dir3_kyc_last_filed": "2023-09-20",
      "dir3_kyc_next_due": "2025-09-30",
      "other_directorships": 0
    },
    {
      "din": "09876543",
      "name": "Ankit Jain",
      "pan": "CFGAJ9012E",
      "designation": "Director",
      "begin_date": "2023-01-10",
      "din_verified": false,
      "dir3_kyc_status": "Filed",
      "dir3_kyc_last_filed": "2024-08-30",
      "dir3_kyc_next_due": "2025-09-30",
      "other_directorships": 1
    }
  ],
  "filings": [
    {
      "id": "aoc4-fy2425",
      "form": "AOC-4",
      "plain_label": "Financial Statements",
      "description": "Submit your Balance Sheet, Profit & Loss account, and auditor's report to the Ministry of Corporate Affairs.",
      "section": "Section 137, Companies Act 2013",
      "financial_year": "FY 2024-25",
      "due_date": "2024-10-28",
      "agm_date": "2024-09-28",
      "offset_days": 30,
      "status": "Filed",
      "filed_on": "2024-10-15",
      "srn": "G87654321",
      "filed_by": "CA Partner",
      "requires_ca": true,
      "late_fee_per_day": 100,
      "documents_required": [
        "Balance Sheet (signed by Director)",
        "Profit & Loss Account",
        "Auditor's Report",
        "Board Resolution adopting financials",
        "Cash Flow Statement"
      ]
    },
    {
      "id": "mgt7-fy2425",
      "form": "MGT-7",
      "plain_label": "Annual Return",
      "description": "A snapshot of your company's structure as on March 31 — directors, shareholders, share capital, meetings held during the year.",
      "section": "Section 92, Companies Act 2013",
      "financial_year": "FY 2024-25",
      "due_date": "2024-11-29",
      "agm_date": "2024-09-28",
      "offset_days": 60,
      "status": "Filed",
      "filed_on": "2024-11-10",
      "srn": "G12345678",
      "filed_by": "CA Partner",
      "requires_ca": true,
      "late_fee_per_day": 100,
      "documents_required": [
        "List of shareholders with holdings",
        "List of directors with DIN",
        "Minutes of AGM",
        "Board resolution authorizing filing"
      ]
    },
    {
      "id": "adt1-fy2425",
      "form": "ADT-1",
      "plain_label": "Auditor Appointment",
      "description": "Formally notify the MCA of your statutory auditor's appointment or reappointment for the next 5 years.",
      "section": "Section 139, Companies Act 2013",
      "financial_year": "FY 2024-25",
      "due_date": "2024-10-13",
      "agm_date": "2024-09-28",
      "offset_days": 15,
      "status": "Filed",
      "filed_on": "2024-10-05",
      "srn": "G99887766",
      "filed_by": "CA Partner",
      "requires_ca": false,
      "late_fee_per_day": 100,
      "documents_required": [
        "Auditor's consent letter",
        "Board resolution appointing auditor"
      ]
    },
    {
      "id": "dir3kyc-fy2425",
      "form": "DIR-3 KYC",
      "plain_label": "Director KYC",
      "description": "Annual identity verification for all directors. Every director with a DIN must file this by September 30.",
      "section": "Section 164, Companies Act 2013",
      "financial_year": "FY 2024-25",
      "due_date": "2024-09-30",
      "agm_date": null,
      "offset_days": null,
      "status": "Pending",
      "filed_on": null,
      "srn": null,
      "filed_by": null,
      "requires_ca": false,
      "late_fee_per_day": 5000,
      "documents_required": [
        "Aadhaar card (self-attested)",
        "PAN card (self-attested)",
        "Mobile number linked to Aadhaar",
        "Personal email ID"
      ]
    },
    {
      "id": "aoc4-fy2526",
      "form": "AOC-4",
      "plain_label": "Financial Statements",
      "description": "Submit your Balance Sheet, Profit & Loss account, and auditor's report to the Ministry of Corporate Affairs.",
      "section": "Section 137, Companies Act 2013",
      "financial_year": "FY 2025-26",
      "due_date": "2025-10-30",
      "agm_date": null,
      "offset_days": 30,
      "status": "Upcoming",
      "filed_on": null,
      "srn": null,
      "filed_by": null,
      "requires_ca": true,
      "late_fee_per_day": 100,
      "documents_required": [
        "Balance Sheet (signed by Director)",
        "Profit & Loss Account",
        "Auditor's Report",
        "Board Resolution adopting financials",
        "Cash Flow Statement"
      ]
    },
    {
      "id": "mgt7-fy2526",
      "form": "MGT-7",
      "plain_label": "Annual Return",
      "description": "A snapshot of your company's structure as on March 31 — directors, shareholders, share capital, meetings held during the year.",
      "section": "Section 92, Companies Act 2013",
      "financial_year": "FY 2025-26",
      "due_date": "2025-11-29",
      "agm_date": null,
      "offset_days": 60,
      "status": "Upcoming",
      "filed_on": null,
      "srn": null,
      "filed_by": null,
      "requires_ca": true,
      "late_fee_per_day": 100,
      "documents_required": [
        "List of shareholders with holdings",
        "List of directors with DIN",
        "Minutes of AGM",
        "Board resolution authorizing filing"
      ]
    },
    {
      "id": "dir3kyc-fy2526",
      "form": "DIR-3 KYC",
      "plain_label": "Director KYC",
      "description": "Annual identity verification for all directors. Every director with a DIN must file this by September 30.",
      "section": "Section 164, Companies Act 2013",
      "financial_year": "FY 2025-26",
      "due_date": "2025-09-30",
      "agm_date": null,
      "offset_days": null,
      "status": "Upcoming",
      "filed_on": null,
      "srn": null,
      "filed_by": null,
      "requires_ca": false,
      "late_fee_per_day": 5000,
      "documents_required": [
        "Aadhaar card (self-attested)",
        "PAN card (self-attested)",
        "Mobile number linked to Aadhaar",
        "Personal email ID"
      ]
    }
  ],
  "filingHistory": [
    {
      "id": "hist-aoc4-fy2425",
      "form": "AOC-4",
      "plain_label": "Financial Statements",
      "financial_year": "FY 2024-25",
      "filed_on": "2024-10-15",
      "srn": "G87654321",
      "filed_by": "CA Partner",
      "mode": "Online (MCA21)",
      "status": "Successful"
    },
    {
      "id": "hist-mgt7-fy2425",
      "form": "MGT-7",
      "plain_label": "Annual Return",
      "financial_year": "FY 2024-25",
      "filed_on": "2024-11-10",
      "srn": "G12345678",
      "filed_by": "CA Partner",
      "mode": "Online (MCA21)",
      "status": "Successful"
    },
    {
      "id": "hist-adt1-fy2425",
      "form": "ADT-1",
      "plain_label": "Auditor Appointment",
      "financial_year": "FY 2024-25",
      "filed_on": "2024-10-05",
      "srn": "G99887766",
      "filed_by": "CA Partner",
      "mode": "Online (MCA21)",
      "status": "Successful"
    },
    {
      "id": "hist-aoc4-fy2324",
      "form": "AOC-4",
      "plain_label": "Financial Statements",
      "financial_year": "FY 2023-24",
      "filed_on": "2023-10-12",
      "srn": "F55443322",
      "filed_by": "CA Partner",
      "mode": "Online (MCA21)",
      "status": "Successful"
    },
    {
      "id": "hist-mgt7-fy2324",
      "form": "MGT-7",
      "plain_label": "Annual Return",
      "financial_year": "FY 2023-24",
      "filed_on": "2023-11-20",
      "srn": "F11223344",
      "filed_by": "CA Partner",
      "mode": "Online (MCA21)",
      "status": "Successful"
    }
  ],
  "boardResolutionTemplates": [
    { "id": "br-appt-dir", "title": "Appointment of Director", "description": "Adding a new director to the board", "requires_mgr14": true },
    { "id": "br-resign-dir", "title": "Resignation of Director", "description": "Director stepping down formally", "requires_mgr14": false },
    { "id": "br-bank-acct", "title": "Opening a New Bank Account", "description": "Authorizing a new business bank account", "requires_mgr14": false },
    { "id": "br-auth-sig", "title": "Change of Authorized Signatory", "description": "Updating who can sign cheques and agreements", "requires_mgr14": false },
    { "id": "br-loan", "title": "Taking a Business Loan", "description": "Formally approving borrowing from a bank or NBFC", "requires_mgr14": true },
    { "id": "br-address", "title": "Change of Registered Office", "description": "Moving your company's official address", "requires_mgr14": false },
    { "id": "br-shares", "title": "Issue of Shares (Equity)", "description": "Allotting new shares to investors or employees", "requires_mgr14": true },
    { "id": "br-auditor", "title": "Appointment of Statutory Auditor", "description": "Onboarding or changing your CA firm", "requires_mgr14": false },
    { "id": "br-financials", "title": "Adoption of Financial Statements", "description": "Signing off on annual accounts at the AGM", "requires_mgr14": false },
    { "id": "br-dividend", "title": "Declaration of Dividend", "description": "Approving distribution of profits to shareholders", "requires_mgr14": true },
    { "id": "br-esop", "title": "ESOP Grant", "description": "Authorizing an employee stock option grant", "requires_mgr14": true },
    { "id": "br-auth-cap", "title": "Increase in Authorized Capital", "description": "Expanding share capital before a fundraise", "requires_mgr14": true }
  ]
}
```

---

## 7. Component Breakdown

### New Files: `src/components/roc/`

| Component | Description |
|-----------|-------------|
| `ROCDashboard.tsx` | Main layout — tab switcher, passes data to child tabs |
| `ROCSummaryBar.tsx` | Top strip with 4 stat chips (overdue, due soon, KYC pending, status) |
| `CompanyIdentityCard.tsx` | Company profile card populated from CIN data |
| `ComplianceHealthBar.tsx` | Three-card row (AGM · AOC-4 · DIR-3 KYC) |
| `CapitalStructurePanel.tsx` | Authorized vs paid-up capital with progress bar |
| `ChargesPanel.tsx` | Collapsible table of active charges on company |
| `FilingTrackerTable.tsx` | Full ROC filings table with filters and CTAs |
| `FilingDetailDrawer.tsx` | Slide-in drawer — form details, doc checklist, action |
| `ROCPeriodSelector.tsx` | Financial Year dropdown (FY 2025-26, FY 2024-25, …) |
| `ROCStatusBadge.tsx` | Standardized status pill (Filed · Upcoming · Pending · Overdue · CA Pending) |
| `DirectorTable.tsx` | Directors list with DIN + KYC status per row |
| `DirectorProfileDrawer.tsx` | Director detail panel — appointments, KYC history |
| `DirectorSummaryBar.tsx` | Four chips summary at top of Directors tab |
| `DocumentCard.tsx` | Single company document card (download, EntityLocker fetch) |
| `EntityLockerModal.tsx` | 3-step mock consent flow for EntityLocker document fetch |
| `BoardResolutionCard.tsx` | Resolution template card (preview + download + send to CA) |
| `BoardResolutionPreviewModal.tsx` | Modal with template text and download button |
| `ROCFilingHistoryTable.tsx` | Past filings table with filters |

### New Page File

`src/app/dashboard/roc/page.tsx` — imports `ROCDashboard`, passes mock data from `data/roc.json`

---

## 8. Navigation & Health Score Integration

### Main Dashboard Updates

- ROC `ModuleCard` on `/dashboard` already exists in PRD spec. Ensure it surfaces:
  - Next ROC deadline (e.g., "DIR-3 KYC — due Sept 30")
  - Status pill (color-coded)
  - `View ROC` CTA linking to `/dashboard/roc`

### Health Score Gauge

ROC sub-score formula (mock calculation, 0–100):

| Factor | Points |
|--------|--------|
| All annual filings on time (MGT-7, AOC-4, ADT-1) | +40 |
| All director DIR-3 KYC filed | +30 |
| Company status = Active (no strike-off risk) | +20 |
| No overdue event-based forms | +10 |

- Score < 40 → Red
- Score 40–69 → Yellow
- Score 70–100 → Green

### Compliance Calendar

ROC events appear in **purple** (`violet-500`) on the calendar:
- MGT-7 due date
- AOC-4 due date
- ADT-1 due date
- DIR-3 KYC deadline (Sept 30)
- Any upcoming event-based form deadlines

---

## 9. UX / Design Rules

| Rule | Detail |
|------|--------|
| **Color theme** | Purple / violet (`violet-600` primary, `violet-100` background tints) — consistent with calendar color coding |
| **Jargon policy** | Every form code (MGT-7, AOC-4) **must** display plain English label beside it in all contexts |
| **CIN empty state** | If CIN not set during onboarding: "Connect your CIN first — it'll take 30 seconds" with a CTA to `/onboarding` |
| **Mobile layout** | Director table collapses to stacked cards · Filing Tracker shows Form + Status + Due Date only (remaining columns in drawer) |
| **Drawer pattern** | All detail views use `Sheet` (shadcn/ui) from the right, consistent with GST and TDS modules |
| **Deadlines** | Display both absolute date and relative countdown ("Oct 30, 2025 · Due in 18 days") |
| **CA hand-off** | Any form marked `requires_ca: true` must show a "Requires CA Certification" notice in the detail drawer |
| **Late fee warning** | If status = Overdue, show a red notice: "₹X/day late fee is accruing — act now" |

---

## 10. Implementation Sequence

| Step | Task | Files Affected |
|------|------|----------------|
| 1 | Create `src/data/roc.json` with full mock dataset | `data/roc.json` |
| 2 | Build `ROCStatusBadge` and `ROCPeriodSelector` (shared primitives) | `components/roc/` |
| 3 | Build `CompanyIdentityCard`, `ComplianceHealthBar`, `CapitalStructurePanel`, `ChargesPanel` | `components/roc/` |
| 4 | Build `ROCSummaryBar` and wire Overview tab | `components/roc/` |
| 5 | Build `FilingTrackerTable` + `FilingDetailDrawer` | `components/roc/` |
| 6 | Build `DirectorTable` + `DirectorProfileDrawer` + `DirectorSummaryBar` | `components/roc/` |
| 7 | Build `DocumentCard` + `EntityLockerModal` + `BoardResolutionCard` + `BoardResolutionPreviewModal` | `components/roc/` |
| 8 | Build `ROCFilingHistoryTable` | `components/roc/` |
| 9 | Assemble `ROCDashboard.tsx` with all tabs | `components/roc/ROCDashboard.tsx` |
| 10 | Create `src/app/dashboard/roc/page.tsx` | `app/dashboard/roc/page.tsx` |
| 11 | Update `HealthScoreGauge` to include ROC sub-score | `components/HealthScoreGauge.tsx` |
| 12 | Update main Dashboard module cards | `app/dashboard/page.tsx` |
