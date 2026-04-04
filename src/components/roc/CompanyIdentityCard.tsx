import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Building2, MapPin, Calendar, RefreshCw, Pencil } from "lucide-react";

type CompanyData = {
  cin: string;
  company_name: string;
  company_status: string;
  company_category: string;
  class_of_company: string;
  roc_code: string;
  date_of_incorporation: string;
  registered_address: string;
};

function fmt(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-green-100 text-green-800 border-green-200",
  "Strike Off": "bg-red-100 text-red-800 border-red-200",
  "Under Process of Striking Off": "bg-orange-100 text-orange-800 border-orange-200",
  Amalgamated: "bg-gray-100 text-gray-700 border-gray-200",
  Dissolved: "bg-gray-100 text-gray-700 border-gray-200",
};

export function CompanyIdentityCard({ company }: { company: CompanyData }) {
  const statusClass =
    STATUS_COLORS[company.company_status] ?? "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
              <Building2 className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold leading-tight">
                {company.company_name}
              </CardTitle>
              <p className="text-xs font-mono text-muted-foreground mt-0.5">{company.cin}</p>
            </div>
          </div>
          <Badge variant="outline" className={statusClass}>
            {company.company_status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Category</p>
            <p className="font-medium">{company.company_category}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Class</p>
            <p className="font-medium">{company.class_of_company}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">RoC Office</p>
            <p className="font-medium">{company.roc_code}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Incorporated</p>
            <p className="font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              {fmt(company.date_of_incorporation)}
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex items-start gap-2 text-sm">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-muted-foreground">{company.registered_address}</p>
        </div>

        <div className="flex gap-2 pt-1">
          <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs">
            <RefreshCw className="h-3 w-3" />
            Verify on MCA
          </Button>
          <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs">
            <Pencil className="h-3 w-3" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
