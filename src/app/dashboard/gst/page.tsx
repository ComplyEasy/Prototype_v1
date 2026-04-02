import Navbar from "@/components/Navbar";
import GSTDashboard from "@/components/gst/GSTDashboard";

export const metadata = {
  title: "GST Compliance | CompliEasy",
};

export default function GSTPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GSTDashboard />
      </main>
    </div>
  );
}
