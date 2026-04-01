# ComplianceOS — Product Requirements Document
### Frontend Prototype | Next.js | April 2026

---

## Overview

**Product:** ComplianceOS — Compliance Management SaaS for Indian Startups  
**Target User:** Non-technical startup founder with no compliance knowledge, fully dependent on CAs  
**Goal:** Make compliance simple, reduce CA dependency, save money  
**Prototype Scope:** Frontend only (Next.js, mock data, no live APIs)  
**Design North Star:** Every screen must feel like a dashboard, not a tax form

---

## Core Design Principles

- **Plain English everywhere** — always pair jargon with a human label (e.g., "GSTR-3B — your monthly GST return")
- **Visual status** — Red / Yellow / Green indicators instead of raw numbers wherever possible
- **One primary action per screen** — "File Now", "Send to CA", "Download"
- **Mobile-aware layout** — founders check phones; all screens must be responsive

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| Data | Static mock JSON files |
| Auth | UI-only, hardcoded user session (no real auth) |

---

## Project Structure

```
c:\Prototype_v1\
├── app\                        # Next.js App Router pages
│   ├── page.tsx                # Landing page
│   ├── login\page.tsx
│   ├── signup\page.tsx
│   ├── onboarding\page.tsx
│   ├── dashboard\page.tsx
│   ├── calendar\page.tsx
│   ├── gst\page.tsx
│   ├── tds\page.tsx
│   ├── roc\page.tsx
│   ├── exemptions\page.tsx
│   └── ca-requests\page.tsx
├── components\                 # Shared UI components
│   ├── HealthScoreGauge.tsx
│   ├── DeadlineCard.tsx
│   ├── ModuleTabLayout.tsx
│   ├── CARequestTimeline.tsx
│   └── ComplianceCalendar.tsx
├── data\                       # Mock JSON
│   ├── company.json
│   ├── filings.json
│   ├── deadlines.json
│   ├── exemptions.json
│   └── ca-requests.json
└── styles\
    └── globals.css
```

---

## Modules & Phases

---

### Phase 1 — Core Shell

#### 1. Auth & Landing — `/`  `/login`  `/signup`

**What it does:** Entry point for new and returning users.

**Screens:**
- **Landing (`/`):** Marketing page — headline *"Your CA in your pocket"*, 3-feature highlights, primary CTA to Sign Up
- **Login (`/login`):** Email + password fields, Google OAuth button (mocked), link to signup
- **Signup (`/signup`):** Name, email, password, company name, CTA to start onboarding

---

#### 2. Smart Onboarding — `/onboarding`

**What it does:** Connects the startup's GSTIN and CIN, auto-fetches company data (mocked), and sets up the compliance calendar.

**UI Flow (3-step wizard):**
1. **Step 1 — GSTIN:** Single input field → on submit, mock fetch shows *"Found: Acme Pvt Ltd, GST Registered since 2022"*
2. **Step 2 — CIN:** Single input → mock fetch shows company type, incorporation date, director names
3. **Step 3 — Review:** Summary card of pulled data → *"Looks right? Let's build your calendar"* CTA

**Look & Feel:**
- One field at a time (Turbo Tax-style)
- Progress bar at top (Step 1 of 3)
- Success animations on each fetch
- Skip option if data is unavailable

---

#### 3. Main Dashboard — `/dashboard`

**What it does:** Central hub showing overall compliance health and upcoming actions.

**Layout:**
- **Top bar:** Greeting (*"Hey Rahul, here's where you stand today"*), notification bell, profile avatar
- **Center — Health Score Widget:** Large circular gauge (0–100), color-coded:
  - 🔴 Red: 0–39 (Urgent attention needed)
  - 🟡 Yellow: 40–69 (Some issues)
  - 🟢 Green: 70–100 (You're in good shape)
  - 3 sub-rings inside: GST score / TDS score / ROC score
- **Module Cards (3 cards):** GST | TDS | ROC — each shows next deadline + status pill + quick action button
- **Right Panel:** Upcoming deadlines (next 30 days), notification feed with mock alerts (*"GST due in 3 days"*)

---

#### 4. Compliance Calendar — `/calendar`

**What it does:** Full visual calendar of all compliance deadlines, personalized to the company.

**Layout:**
- Month view (default) with toggle to List view
- Color-coded events:
  - 🔵 Blue — GST filings
  - 🟠 Orange — TDS payments
  - 🟣 Purple — ROC/MCA21 filings
  - ⚫ Gray — CA review deadlines
- Click any event → side drawer opens with:
  - What it is (plain English description)
  - Due date + countdown
  - Current status pill
  - Primary action button (File / Prepare / Send to CA)

---

### Phase 2 — Tax Automation Modules

#### 5. GST Module — `/gst`

**What it does:** Auto-prepares GST returns using data pulled from integrations, enables one-tap filing.

**Tabs:** GSTR-1 | GSTR-3B | Filing History

**Per Tab:**
- Period selector (month/quarter dropdown)
- Integration status badges: *Razorpay ✓ Connected* | *Zoho ✓ Connected* (mocked)
- Auto-prep status indicator: *"Data pulled, ready to review"*
- Line-item preview table (mock data): invoice number, amount, tax, status
- **"Review & File"** primary CTA button
- One-tap e-filing confirmation modal (mocked success state)

**Filing History Tab:**
- Table: Period | Form | Filed On | Status | Acknowledgement No. | Download
- Status pills: Filed / Pending / Overdue

---

#### 6. TDS Module — `/tds`

**What it does:** Auto-detects TDS obligations from outgoing payments, manages challan payments, and generates Form 16A/16B.

**Sections:**

**Detected Payments:**
- Table: Vendor Name | Payment Amount | TDS Rate | TDS Amount | Status (Deducted / Pending)
- Filter by: month, vendor, status

**Challan 281 Dashboard:**
- Summary card: Total TDS Payable | Paid | Pending (with color indicators)
- Monthly bar chart of TDS liability (Recharts)
- **"Pay Now"** CTA (mocked)

**Documents:**
- Table: Vendor | Form Type (16A/16B) | Period | Generated On | Download
- Download button per row (mock PDF)

---

### Phase 3 — Compliance & Awareness

#### 7. ROC / MCA21 Module — `/roc`

**What it does:** Tracks Ministry of Corporate Affairs filing requirements and provides ready-to-use templates.

**Filing Tracker Table:**
| Filing | Plain English Label | Due Date | Status | Action |
|---|---|---|---|---|
| MGT-7 | Annual Return | 60 days after AGM | Upcoming | Prepare Filing |
| AOC-4 | Financial Statements | 30 days after AGM | Pending | Send to CA |
| DIR-3 KYC | Director KYC | 30 Sept every year | Filed | View |

- Click any row → detail drawer with filing requirements and document checklist

**Board Resolution Templates:**
- Card library: Appointment of Director, Loan Approval, Change of Address, etc.
- Click card → preview PDF modal
- Buttons: Download | Send to CA

---

#### 8. Tax Exemptions — `/exemptions`

**What it does:** Surfaces all tax exemption schemes the startup may be eligible for, in plain language.

**Layout:** Responsive card grid

**Each Card Contains:**
- Scheme name (e.g., *80IAC — Income Tax Holiday*)
- One-line benefit (e.g., *"100% tax exemption for 3 consecutive years"*)
- Eligibility badge: *"You likely qualify"* (green) / *"Check eligibility"* (yellow) / *"Not applicable"* (gray)
- Expandable *"Learn More"* section with eligibility criteria and how to apply
- **"Apply with CA Help"** button → triggers CA request workflow

**Schemes to Include (mock):**
- Section 80IAC — Income Tax Holiday
- DPIIT Recognition
- Startup India Registration
- Section 56 Angel Tax Exemption
- Section 54GB — Capital Gains Exemption
- ESOP Tax Benefits

---

### Phase 4 — CA Layer

#### 9. CA Review Workflow — `/ca-requests`

**What it does:** Connects the founder with an in-house CA for document review, audit, and signing. Full workflow from request to signed delivery.

**Main List View:**
- Table of all CA requests: Document Name | Type | Assigned CA | Status | Last Updated | Action
- Status pipeline (visual stepper):
  ```
  Submitted → Under Review → Revision Requested → Signed → Delivered
  ```
- **"New Request"** button (primary CTA, top right)

**New Request Flow (wizard):**
1. Select document type (GST Filing / ROC Filing / Tax Exemption Application / Other)
2. Choose document: pick from auto-generated docs OR upload manually
3. Add notes for the CA (optional text area)
4. Submit → confirmation screen with request ID and estimated turnaround

**Request Detail View:**
- Full status timeline (vertical stepper with timestamps)
- Assigned CA profile card: name, photo avatar, qualification (e.g., *CA, ICAI*), specialization
- Comments / notes thread between founder and CA (mock messages)
- Document preview panel
- **"Download Signed Document"** button (active only when status = Delivered)

---

## Mock Data Files

| File | Contents |
|---|---|
| `data/company.json` | Company name, GSTIN, CIN, directors, registration date |
| `data/filings.json` | Past GST filings, TDS challans, ROC filings with status |
| `data/deadlines.json` | All upcoming deadlines with type, date, status |
| `data/exemptions.json` | All scheme cards with eligibility flags |
| `data/ca-requests.json` | Sample CA requests with timeline events and messages |

---

## Notification System (Mock)

The notification bell on the dashboard should show live-feeling mock alerts:

- *"GSTR-3B for March is due in 3 days"* — 🔴 Urgent
- *"Your CA has reviewed the MGT-7 filing"* — 🟢 Info
- *"TDS for Q4 is pending payment"* — 🟡 Warning
- *"80IAC application: You may qualify!"* — 🔵 Tip

---

## Constraints & Decisions

| Decision | Detail |
|---|---|
| No live API calls | All data is static mock JSON |
| No real auth | Login flow is UI-only, hardcoded user session |
| CA layer | Full UI flow (not a placeholder) |
| Excluded from prototype | Payment gateway, notifications backend, mobile app, real GSP e-filing |

---

## Phase Delivery Checklist

### Phase 1
- [ ] Landing, Login, Signup screens
- [ ] Onboarding 3-step wizard with mock fetch
- [ ] Dashboard with Health Score gauge + module cards
- [ ] Compliance Calendar with color-coded mock events

### Phase 2
- [ ] GST module with 3 tabs and mock filing data
- [ ] TDS module with 3 sections and mock payment data

### Phase 3
- [ ] ROC module filing tracker and template library
- [ ] Tax Exemptions card grid with expand/collapse

### Phase 4
- [ ] CA Requests list with status pipeline
- [ ] New Request wizard (4 steps)
- [ ] Request detail with timeline, CA profile, comments, download

---

*Document version: 1.0 | Date: April 1, 2026*
