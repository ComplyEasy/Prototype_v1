"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Loader2,
  Building2,
  FileText,
  ArrowRight,
  ChevronRight,
} from "lucide-react";
import mockData from "@/data/company.json";

type GSTINData = typeof mockData.gstin;
type CINData = typeof mockData.cin;

const TOTAL_STEPS = 3;

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
              className={`h-0.5 w-12 transition-all duration-500 ${
                i + 1 < current ? "bg-green-500" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────── Step 1: GSTIN */
function GSTINStep({
  onNext,
}: {
  onNext: (data: GSTINData) => void;
}) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState<GSTINData | null>(null);
  const [error, setError] = useState("");

  const isValidGSTIN = (v: string) =>
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v);

  function handleFetch() {
    if (!isValidGSTIN(value.toUpperCase())) {
      setError("Please enter a valid 15-character GSTIN (e.g. 27AABCU9603R1ZX)");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setFetched(mockData.gstin);
    }, 1800);
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
            onClick={() => onNext(mockData.gstin)}
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
              <div className="font-medium">{fetched.type} ({fetched.filingFrequency})</div>
              <div className="text-muted-foreground">State</div>
              <div className="font-medium">{fetched.state}</div>
            </div>
          </div>

          <Button className="w-full" onClick={() => onNext(fetched)}>
            Looks right — continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────── Step 2: CIN */
function CINStep({
  onNext,
}: {
  onNext: (data: CINData) => void;
}) {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState<CINData | null>(null);
  const [error, setError] = useState("");

  const isValidCIN = (v: string) =>
    /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/.test(v);

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
            onClick={() => onNext(mockData.cin)}
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

          <Button className="w-full" onClick={() => onNext(fetched)}>
            Looks right — continue
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────── Step 3: Review */
function ReviewStep({
  gstin,
  cin,
  onConfirm,
}: {
  gstin: GSTINData;
  cin: CINData;
  onConfirm: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h2 className="text-2xl font-semibold tracking-tight">
          Everything looks good! 🎉
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          We&apos;ve pulled your business details. Review them below, then
          we&apos;ll build your personalised 12-month compliance calendar.
        </p>
      </div>

      <div className="space-y-3">
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
          </div>
        </div>

        {/* MCA Summary */}
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
  const [gstinData, setGSTINData] = useState<GSTINData | null>(null);
  const [cinData, setCINData] = useState<CINData | null>(null);

  const progress = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  const stepLabels = ["GST Identity", "Company Details", "Review & Confirm"];

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
      <div className="w-full max-w-md bg-background rounded-2xl border shadow-lg p-6 sm:p-8 space-y-6">
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
          <GSTINStep
            onNext={(data) => {
              setGSTINData(data);
              setStep(2);
            }}
          />
        )}
        {step === 2 && (
          <CINStep
            onNext={(data) => {
              setCINData(data);
              setStep(3);
            }}
          />
        )}
        {step === 3 && gstinData && cinData && (
          <ReviewStep
            gstin={gstinData}
            cin={cinData}
            onConfirm={() => router.push("/dashboard")}
          />
        )}
      </div>

      {/* Footer */}
      <p className="mt-6 text-xs text-muted-foreground text-center">
        Your data is never shared without your consent.{" "}
        <a href="#" className="underline underline-offset-2 hover:text-foreground transition-colors">
          Privacy Policy
        </a>
      </p>
    </div>
  );
}
