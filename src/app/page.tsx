"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  IndianRupee,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Bell,
  FileText,
  Zap,
  Star,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-foreground">
            <ShieldCheck className="size-4 text-background" />
          </div>
          <span className="text-lg font-semibold tracking-tight">CompliEasy</span>
        </Link>
        <div className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">Features</a>
          <a href="#how-it-works" className="transition-colors hover:text-foreground">How it works</a>
          <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex")}>
            Log in
          </Link>
          <Link href="/onboarding" className={buttonVariants({ size: "sm" })}>
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,transparent_0%,transparent_49.5%,hsl(var(--border)/0.3)_49.5%,hsl(var(--border)/0.3)_50.5%,transparent_50.5%,transparent_100%),linear-gradient(to_bottom,transparent_0%,transparent_49.5%,hsl(var(--border)/0.3)_49.5%,hsl(var(--border)/0.3)_50.5%,transparent_50.5%,transparent_100%)] bg-size-[80px_80px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(var(--background))_70%)]" />

      <div className="relative mx-auto max-w-6xl px-4 pt-24 pb-20 sm:px-6 sm:pt-32 sm:pb-28">
        <div className="flex flex-col items-center text-center">
          <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1 text-xs">
            <Zap className="size-3" />
            Built for Indian Startups
          </Badge>

          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Your CA in
            <br />
            <span className="bg-linear-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
              your pocket
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Stop missing deadlines. Stop overpaying CAs. CompliEasy turns GST, TDS, and ROC compliance
            into a simple dashboard — so you can focus on building your startup.
          </p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/onboarding" className={cn(buttonVariants({ size: "lg" }), "h-11 px-6 text-sm")}>
              Start for free
              <ArrowRight className="ml-1 size-4" />
            </Link>
            <Link href="/dashboard" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-6 text-sm")}>
              View demo dashboard
            </Link>
          </div>

          <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-500" />
              No credit card
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-500" />
              Setup in 2 min
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-500" />
              Plain English
            </span>
          </div>
        </div>

        {/* Hero visual — real dashboard screenshot */}
        <div className="relative mx-auto mt-16 max-w-5xl">
          {/* Glow effect behind the image */}
          <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-[radial-gradient(ellipse_at_center,hsl(var(--foreground)/0.06),transparent_70%)]" />
          {/* Border frame */}
          <div className="absolute -inset-px rounded-2xl bg-linear-to-b from-border to-border/20" />
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-background shadow-2xl shadow-black/10">
            {/* Fake browser chrome */}
            <div className="flex items-center gap-1.5 border-b border-border/50 bg-muted/40 px-4 py-3">
              <div className="size-2.5 rounded-full bg-red-400/80" />
              <div className="size-2.5 rounded-full bg-yellow-400/80" />
              <div className="size-2.5 rounded-full bg-emerald-400/80" />
              <div className="mx-3 flex h-5 flex-1 max-w-xs items-center rounded-md bg-background/80 px-3 text-[10px] text-muted-foreground">
                complieeasy.in/dashboard
              </div>
            </div>
            <Image
              src="/assets/Dashboard.png"
              alt="CompliEasy dashboard screenshot"
              width={1280}
              height={720}
              className="w-full object-cover object-top"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}

const features = [
  {
    icon: BarChart3,
    title: "Compliance Health Score",
    description:
      "One glance tells you where you stand. Green, yellow, or red — no jargon, just clarity on every filing.",
  },
  {
    icon: Bell,
    title: "Smart Deadline Alerts",
    description:
      "Never miss GSTR-3B, TDS, or ROC deadlines again. Get nudged before penalties kick in — in plain English.",
  },
  {
    icon: IndianRupee,
    title: "Save on CA Fees",
    description:
      "Handle routine filings yourself. Send only complex tasks to your CA. Startups save ₹40,000+ per year on average.",
  },
  {
    icon: FileText,
    title: "Auto-Fetch Company Data",
    description:
      "Enter your GSTIN and CIN — we pull your company info, filing history, and build your compliance calendar automatically.",
  },
  {
    icon: ShieldCheck,
    title: "Built for Indian Law",
    description:
      "Covers GST, TDS, ROC, and startup exemptions under the Indian Companies Act. No US-centric compliance noise.",
  },
  {
    icon: Zap,
    title: "One-Click CA Requests",
    description:
      "Need your CA? Send a structured request with pre-filled details — no more WhatsApp back-and-forth.",
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="text-center">
        <Badge variant="outline" className="mb-4">Features</Badge>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Everything a founder needs.
          <br />
          <span className="text-muted-foreground">Nothing they don&apos;t.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          We stripped away the complexity. What&apos;s left is a tool that feels like a dashboard — not a tax form.
        </p>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="group relative transition-all hover:shadow-md hover:shadow-black/5">
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-foreground group-hover:text-background">
                <feature.icon className="size-5" />
              </div>
              <CardTitle className="text-base">{feature.title}</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
}

const steps = [
  {
    step: "01",
    title: "Connect your business",
    description: "Enter your GSTIN and CIN. We auto-fetch your company details, registration dates, and directors.",
  },
  {
    step: "02",
    title: "See your calendar",
    description: "Your compliance calendar is built instantly — every GST, TDS, and ROC deadline, color-coded by urgency.",
  },
  {
    step: "03",
    title: "Stay compliant",
    description: "File returns, track progress, and loop in your CA only when needed. All from one clean dashboard.",
  },
];

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="border-y border-border/50 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="text-center">
          <Badge variant="outline" className="mb-4">How it works</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            From zero to compliant in 2 minutes
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            No 30-page forms. No accountant jargon. Just three simple steps.
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.step} className="relative flex flex-col items-center text-center">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-foreground text-sm font-bold text-background">
                {step.step}
              </div>
              {i < steps.length - 1 && (
                <div className="absolute top-6 left-[calc(50%+32px)] hidden h-px w-[calc(100%-64px)] bg-border sm:block" />
              )}
              <h3 className="text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <div className="flex items-center justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="size-5 fill-amber-400 text-amber-400" />
          ))}
        </div>
        <blockquote className="mt-6 text-xl font-medium leading-relaxed tracking-tight sm:text-2xl">
          &ldquo;I used to pay ₹15,000/month for my CA to file basic GST returns. Now I handle
          it myself in 10 minutes — and only call my CA for the complicated stuff.&rdquo;
        </blockquote>
        <div className="mt-6">
          <p className="font-medium">Priya Sharma</p>
          <p className="text-sm text-muted-foreground">Founder, NexaBuild Technologies</p>
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="border-y border-border/50 bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="text-center">
          <Badge variant="outline" className="mb-4">Pricing</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Pick a plan that fits your stage. Upgrade or downgrade anytime — no lock-ins.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 overflow-visible pt-4 sm:grid-cols-3">
          {/* Starter */}
          <Card className="relative flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">Starter</CardTitle>
              <CardDescription>Solo founders &amp; idea stage</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-4">
              <div>
                <span className="text-4xl font-bold">₹1,499</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <Separator />
              <ul className="flex-1 space-y-3 text-sm">
                {[
                  "GST filing dashboard",
                  "Smart deadline alerts",
                  "1 company",
                  "CA request (2/month)",
                  "Email support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/onboarding" className={cn(buttonVariants({ variant: "outline" }), "mt-auto w-full")}>
                Get started
              </Link>
            </CardContent>
          </Card>

          {/* Growth — highlighted */}
          <Card className="relative flex flex-col ring-2 ring-foreground mt-0">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
              <Badge className="px-3 shadow-sm">Most Popular</Badge>
            </div>
            <CardHeader className="pt-7">
              <CardTitle className="text-lg">Growth</CardTitle>
              <CardDescription>Early-stage funded startups</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-4">
              <div>
                <span className="text-4xl font-bold">₹3,999</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <Separator />
              <ul className="flex-1 space-y-3 text-sm">
                {[
                  "Everything in Starter",
                  "TDS + ROC modules",
                  "Up to 3 companies",
                  "CA request (10/month)",
                  "Compliance health score",
                  "Priority support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/onboarding" className={cn(buttonVariants(), "mt-auto w-full")}>
                Start free trial
              </Link>
            </CardContent>
          </Card>

          {/* Scale */}
          <Card className="relative flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">Scale</CardTitle>
              <CardDescription>Series A &amp; beyond</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col space-y-4">
              <div>
                <span className="text-4xl font-bold">₹9,999</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <Separator />
              <ul className="flex-1 space-y-3 text-sm">
                {[
                  "Everything in Growth",
                  "Unlimited companies",
                  "Dedicated CA manager",
                  "Unlimited CA requests",
                  "Custom compliance reports",
                  "SLA-backed support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/onboarding" className={cn(buttonVariants({ variant: "outline" }), "mt-auto w-full")}>
                Talk to us
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="relative overflow-hidden rounded-2xl bg-foreground px-6 py-16 text-center text-background sm:px-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_50%)]" />
        <h2 className="relative text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to simplify compliance?
        </h2>
        <p className="relative mx-auto mt-4 max-w-md text-base text-background/70">
          Join 2,000+ Indian startups that stopped worrying about deadlines and started building.
        </p>
        <div className="relative mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/onboarding"
            className={cn(buttonVariants({ size: "lg" }), "h-11 bg-background px-6 text-sm text-foreground hover:bg-background/90")}
          >
            Get started for free
            <ArrowRight className="ml-1 size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-foreground">
            <ShieldCheck className="size-3 text-background" />
          </div>
          <span className="font-medium text-foreground">CompliEasy</span>
        </div>
        <p>© 2026 CompliEasy. Made for Indian startups, with love.</p>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialSection />
        <PricingSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
