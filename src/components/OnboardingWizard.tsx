"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle2,
  Loader2,
  Building2,
  FileText,
  ArrowRight,
  ChevronRight,
  User,
} from "lucide-react";
import mockData from "@/data/company.json";

type GSTINData = typeof mockData.gstin;
type CINData = typeof mockData.cin;

interface ProfileData {
  name: string;
  role: string;
  phone: string;
}

interface GSTINResult {
  data: GSTINData;
  tan: string;
}

interface CINResult {
  data: CINData;
  pan: string;
  industry: string;
  annualTurnover: string;
  agmDate: string;
}

const TOTAL_STEPS = 4;

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 justify-center mb-2">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
              i + 1 < current
                ? "bg-green-500 text-white"
                : i + 1 === current
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {i + 1 < current ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
          </div>
          {i < TOTAL_STEPS - 1 && (
            <div
              className={`h-0.5 w-10 transition-all duration-500 ${
                i + 1 < current ? "bg-green-500" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────── Step 1: Profile */
function ProfileStep({ onNext }: { onNext: (data: ProfileData) => void }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<
    Partial<Record<"name" | "role" | "phone", string>>
  >({});

  const isValidPhone = (v: string) => /^[6-9]\d{9}$/.test(v);

  function handleNext() {
    const errs: typeof errors = {};
    if (!name.trim()) errs.name = "Please enter your name.";
    if (!role) errs.role = "Please select your role.";
    if (!phone.trim()) errs.phone = "Please enter your phone number.";
    else if (!isValidPhone(phone))
      errs.phone = "Enter a valid 10-digit Indian mobile number.";
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onNext({ name: name.trim(), role, phone });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight">
          Welcome! Let&apos;s set up your profile
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Tell us a little about yourself so we can personalise your compliance
          experience.
        </p>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Full Name</label>
          <Input
            placeholder="e.g. Rahul Sharma"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErrors((p) => ({ ...p, name: undefined }));
            }}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </div>

        {/* Role */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Your Role</label>
          <Select
            value={role}
            onValueChange={(v) => {
              if (v) setRole(v);
              setErrors((p) => ({ ...p, role: undefined }));
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your designation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Founder">Founder</SelectItem>
              <SelectItem value="Co-Founder">Co-Founder</SelectItem>
              <SelectItem value="CFO">CFO</SelectItem>
              <SelectItem value="Finance Manager">Finance Manager</SelectItem>
              <SelectItem value="CA">CA (Chartered Accountant)</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-xs text-destructive">{errors.role}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Mobile Number</label>
          <div className="flex gap-2">
            <span className="flex items-center px-3 rounded-md border bg-muted text-sm text-muted-foreground select-none">
              +91
            </span>
            <Input
              placeholder="98765 43210"
              value={phone}
              maxLength={10}
              onChange={(e) => {
                setPhone(e.target.value.replace(/\D/g, ""));
                setErrors((p) => ({ ...p, phone: undefined }));
              }}
              className="font-mono"
            />
          </div>
          {errors.phone && (
            <p className="text-xs text-destructive">{errors.phone}</p>
          )}
          <p className="text-xs text-muted-foreground">
            We&apos;ll send deadline reminders to this number.
          </p>
        </div>

        <Button className="w-full" onClick={handleNext}>
          Continue
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────── Step 2: GSTIN */
function GSTINStep({ onNext }: { onNext: (result: GSTINResult) => void }) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState<GSTINData | null>(null);
  const [error, setError] = useState("");
  const [tan, setTan] = useState("");
  const [tanError, setTanError] = useState("");

  const isValidGSTIN = (v: string) =>
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);

  const isValidTAN = (v: string) => /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/.test(v);

  function handleFetch() {
    if (!isValidGSTIN(value.toUpperCase())) {
      setError(
        "Please enter a valid 15-character GSTIN (e.g. 27AABCU9603R1ZX)"
      );
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setFetched(mockData.gstin);
    }, 1800);
  }

  function handleNext() {
    if (tan && !isValidTAN(tan.toUpperCase())) {
      setTanError("Enter a valid 10-character TAN (e.g. MUMD12345A)");
      return;
    }
    onNext({ data: fetched!, tan: tan.toUpperCase() });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight">
          Let&apos;s find your business
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Enter your GST Identification Number (GSTIN). We&apos;ll use this to
          pull your filing history and build your compliance calendar.
        </p>
      </div>

      {!fetched ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">GSTIN</label>
            <Input
              placeholder="e.g. 27AABCU9603R1ZX"
              value={value}
              onChange={(e) => {
                setValue(e.target.value.toUpperCase());
                setError("");
              }}
              maxLength={15}
              className="font-mono tracking-widest text-base uppercase"
              onKeyDown={(e) => e.key === "Enter" && handleFetch()}
              disabled={loading}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">
              Your 15-character GST registration number — found on your GST
              certificate.
            </p>
          </div>

          <Button
            className="w-full"
            onClick={handleFetch}
            disabled={loading || value.length < 15}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching from GSTN…
              </>
            ) : (
              <>
                Find My Business
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <button
            className="w-full text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors py-1"
            onClick={() => onNext({ data: mockData.gstin, tan: "" })}
          >
            I don&apos;t have a GSTIN yet — skip this step
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 p-4 space-y-3">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold text-sm">Business found!</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="text-muted-foreground">Business Name</div>
              <div className="font-medium">{fetched.businessName}</div>
              <div className="text-muted-foreground">GST Status</div>
              <div>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0">
                  {fetched.status}
                </Badge>
              </div>
              <div className="text-muted-foreground">Registered Since</div>
              <div className="font-medium">{fetched.registrationDate}</div>
              <div className="text-muted-foreground">Filing Type</div>
              <div className="font-medium">
                {fetched.type} ({fetched.filingFrequency})
              </div>
              <div className="text-muted-foreground">State</div>
              <div className="font-medium">{fetched.state}</div>
            </div>
          </div>

          {/* TAN */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              TAN —{" "}
              <span className="font-normal text-muted-foreground">
                Tax Deduction Account Number
              </span>
            </label>
            <Input
              placeholder="e.g. MUMD12345A"
              value={tan}
              onChange={(e) => {
                setTan(e.target.value.toUpperCase());
                setTanError("");
              }}
              maxLength={10}
              className="font-mono tracking-widest text-base uppercase"
            />
            {tanError && (
              <p className="text-xs text-destructive">{tanError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              10-character TAN used for TDS filings. Found on your TDS
              certificate or traces.tdscpc.gov.in.
            </p>
          </div>

          <Button className="w-full" onClick={handleNext}>
            Looks right — continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <button
            className="w-full text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors py-1"
            onClick={() => onNext({ data: fetched, tan: "" })}
          >
            Skip TAN for now
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────── Step 3: CIN */
function CINStep({ onNext }: { onNext: (result: CINResult) => void }) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState<CINData | null>(null);
  const [error, setError] = useState("");
  const [pan, setPan] = useState("");
  const [panError, setPanError] = useState("");
  const [industry, setIndustry] = useState("");
  const [annualTurnover, setAnnualTurnover] = useState("");
  const [agmDate, setAgmDate] = useState("");

  const isValidCIN = (v: string) =>
    /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/.test(v);

  const isValidPAN = (v: string) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v);

  function handleFetch() {
    if (!isValidCIN(value.toUpperCase())) {
      setError(
        "Please enter a valid 21-character CIN (e.g. U72900MH2022PTC378659)"
      );
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setFetched(mockData.cin);
    }, 1800);
  }

  function handleNext() {
    if (pan && !isValidPAN(pan.toUpperCase())) {
      setPanError("Enter a valid 10-character PAN (e.g. AABCU9603R)");
      return;
    }
    onNext({
      data: fetched!,
      pan: pan.toUpperCase(),
      industry,
      annualTurnover,
      agmDate,
    });
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight">
          Now, let&apos;s find your company
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Enter your Corporate Identification Number (CIN) from MCA21. This
          helps us track your ROC filings and director obligations.
        </p>
      </div>

      {!fetched ? (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">CIN</label>
            <Input
              placeholder="e.g. U72900MH2022PTC378659"
              value={value}
              onChange={(e) => {
                setValue(e.target.value.toUpperCase());
                setError("");
              }}
              maxLength={21}
              className="font-mono tracking-widest text-base uppercase"
              onKeyDown={(e) => e.key === "Enter" && handleFetch()}
              disabled={loading}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">
              Your 21-character company number — found on your Certificate of
              Incorporation.
            </p>
          </div>

          <Button
            className="w-full"
            onClick={handleFetch}
            disabled={loading || value.length < 21}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Fetching from MCA21…
              </>
            ) : (
              <>
                Fetch Company Details
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          <button
            className="w-full text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors py-1"
            onClick={() =>
              onNext({
                data: mockData.cin,
                pan: "",
                industry: "",
                annualTurnover: "",
                agmDate: "",
              })
            }
          >
            I don&apos;t have a CIN yet — skip this step
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 p-4 space-y-3">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-semibold text-sm">Company found!</span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <div className="text-muted-foreground">Company Type</div>
              <div className="font-medium">{fetched.companyType}</div>
              <div className="text-muted-foreground">Incorporated On</div>
              <div className="font-medium">{fetched.incorporationDate}</div>
              <div className="text-muted-foreground">State</div>
              <div className="font-medium">{fetched.registeredState}</div>
              <div className="text-muted-foreground">Directors</div>
              <div className="font-medium space-y-0.5">
                {fetched.directors.map((d) => (
                  <div key={d.din}>{d.name}</div>
                ))}
              </div>
            </div>
          </div>

          {/* PAN */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              PAN —{" "}
              <span className="font-normal text-muted-foreground">
                Permanent Account Number
              </span>
            </label>
            <Input
              placeholder="e.g. AABCU9603R"
              value={pan}
              onChange={(e) => {
                setPan(e.target.value.toUpperCase());
                setPanError("");
              }}
              maxLength={10}
              className="font-mono tracking-widest text-base uppercase"
            />
            {panError && (
              <p className="text-xs text-destructive">{panError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Company PAN — required for income tax filings and 80IAC exemptions.
            </p>
          </div>

          {/* Industry */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Industry / Nature of Business
            </label>
            <Select value={industry} onValueChange={(v) => { if (v) setIndustry(v); }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IT Services">IT Services</SelectItem>
                <SelectItem value="SaaS / Software">SaaS / Software</SelectItem>
                <SelectItem value="E-Commerce">E-Commerce</SelectItem>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Consulting">Consulting</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Helps us surface relevant exemptions (e.g. DPIIT, 80IAC).
            </p>
          </div>

          {/* Annual Turnover */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Annual Turnover (last FY)
            </label>
            <Select value={annualTurnover} onValueChange={(v) => { if (v) setAnnualTurnover(v); }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select turnover range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="<₹20L">Below ₹20 Lakhs</SelectItem>
                <SelectItem value="₹20L–₹1.5Cr">
                  ₹20 Lakhs – ₹1.5 Crore
                </SelectItem>
                <SelectItem value="₹1.5Cr–₹5Cr">
                  ₹1.5 Crore – ₹5 Crore
                </SelectItem>
                <SelectItem value=">₹5Cr">Above ₹5 Crore</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Determines your GST filing frequency and composition eligibility.
            </p>
          </div>

          {/* AGM Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Last AGM Date{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <Input
              type="date"
              value={agmDate}
              onChange={(e) => setAgmDate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Annual General Meeting date — used to calculate MGT-7 and AOC-4
              deadlines.
            </p>
          </div>

          <Button className="w-full" onClick={handleNext}>
            Looks right — continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>

          <button
            className="w-full text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors py-1"
            onClick={() =>
              onNext({
                data: fetched,
                pan: "",
                industry: "",
                annualTurnover: "",
                agmDate: "",
              })
            }
          >
            Skip extra details for now
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────── Step 4: Review */
function ReviewStep({
  profile,
  gstinResult,
  cinResult,
  onConfirm,
}: {
  profile: ProfileData;
  gstinResult: GSTINResult;
  cinResult: CINResult;
  onConfirm: () => void;
}) {
  const gstin = gstinResult.data;
  const cin = cinResult.data;

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight">
          Everything looks good! 🎉
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          We&apos;ve pulled your details. Review them below, then we&apos;ll
          build your personalised 12-month compliance calendar.
        </p>
      </div>

      <div className="space-y-3">
        {/* Profile Summary */}
        <div className="rounded-xl border p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            <User className="h-4 w-4" />
            Your Profile
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="text-muted-foreground">Name</div>
            <div className="font-medium">{profile.name}</div>
            <div className="text-muted-foreground">Role</div>
            <div className="font-medium">{profile.role}</div>
            <div className="text-muted-foreground">Phone</div>
            <div className="font-medium">+91 {profile.phone}</div>

          </div>
        </div>

        {/* GST Summary */}
        <div className="rounded-xl border p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            <FileText className="h-4 w-4" />
            GST Details
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="text-muted-foreground">Business Name</div>
            <div className="font-medium">{gstin.businessName}</div>
            <div className="text-muted-foreground">GSTIN</div>
            <div className="font-mono text-xs font-medium">{gstin.number}</div>
            <div className="text-muted-foreground">Status</div>
            <Badge className="w-fit bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-0 text-xs">
              {gstin.status}
            </Badge>
            <div className="text-muted-foreground">Filing Freq.</div>
            <div className="font-medium">{gstin.filingFrequency}</div>
            {gstinResult.tan && (
              <>
                <div className="text-muted-foreground">TAN</div>
                <div className="font-mono text-xs font-medium">
                  {gstinResult.tan}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Company Summary */}
        <div className="rounded-xl border p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            <Building2 className="h-4 w-4" />
            Company Details
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="text-muted-foreground">Company Type</div>
            <div className="font-medium">{cin.companyType}</div>
            <div className="text-muted-foreground">CIN</div>
            <div className="font-mono text-xs font-medium">{cin.number}</div>
            <div className="text-muted-foreground">Incorporated</div>
            <div className="font-medium">{cin.incorporationDate}</div>
            {cinResult.pan && (
              <>
                <div className="text-muted-foreground">PAN</div>
                <div className="font-mono text-xs font-medium">
                  {cinResult.pan}
                </div>
              </>
            )}
            {cinResult.industry && (
              <>
                <div className="text-muted-foreground">Industry</div>
                <div className="font-medium">{cinResult.industry}</div>
              </>
            )}
            {cinResult.annualTurnover && (
              <>
                <div className="text-muted-foreground">Turnover</div>
                <div className="font-medium">{cinResult.annualTurnover}</div>
              </>
            )}
            <div className="text-muted-foreground">Directors</div>
            <div className="font-medium space-y-0.5">
              {cin.directors.map((d) => (
                <div key={d.din}>{d.name}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Button className="w-full h-12 text-base" onClick={onConfirm}>
        Build My Compliance Calendar
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
    </div>
  );
}

/* ─────────────────────────────────────────── Main Wizard */
export default function OnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [gstinResult, setGSTINResult] = useState<GSTINResult | null>(null);
  const [cinResult, setCINResult] = useState<CINResult | null>(null);

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  const stepLabels = [
    "Your Profile",
    "GST Identity",
    "Company Details",
    "Review & Confirm",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex flex-col items-center justify-center p-4">
      {/* Logo */}
      <div className="mb-8 text-center">
        <span className="text-2xl font-bold tracking-tight">
          Compli<span className="text-primary">Easy</span>
        </span>
        <p className="text-xs text-muted-foreground mt-1">
          Compliance made simple for Indian startups
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl bg-background rounded-2xl border shadow-lg p-6 sm:p-10 space-y-6">
        {/* Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-muted-foreground">
              Step {step} of {TOTAL_STEPS} — {stepLabels[step - 1]}
            </span>
            <span className="text-xs text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-1.5" />
          <StepIndicator current={step} />
        </div>

        {/* Step Content */}
        {step === 1 && (
          <ProfileStep
            onNext={(data) => {
              setProfileData(data);
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <GSTINStep
            onNext={(result) => {
              setGSTINResult(result);
              setStep(3);
            }}
          />
        )}
        {step === 3 && (
          <CINStep
            onNext={(result) => {
              setCINResult(result);
              setStep(4);
            }}
          />
        )}
        {step === 4 && profileData && gstinResult && cinResult && (
          <ReviewStep
            profile={profileData}
            gstinResult={gstinResult}
            cinResult={cinResult}
            onConfirm={() => router.push("/dashboard")}
          />
        )}
      </div>

      {/* Footer */}
      <p className="mt-6 text-xs text-muted-foreground text-center">
        Your data is never shared without your consent.{" "}
        <a
          href="#"
          className="underline underline-offset-2 hover:text-foreground transition-colors"
        >
          Privacy Policy
        </a>
      </p>
    </div>
  );
}
