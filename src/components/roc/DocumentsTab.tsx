"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EntityLockerModal } from "@/components/roc/EntityLockerModal";
import {
  FileText,
  Download,
  Send,
  Link2,
  CheckCircle2,
  Upload,
  ScrollText,
  CreditCard,
} from "lucide-react";

type CompanyDocument = {
  id: string;
  title: string;
  plain_label: string;
  status: "Available" | "Not Uploaded";
  source: string;
};

type BoardResolutionTemplate = {
  id: string;
  title: string;
  description: string;
  requires_mgt14: boolean;
};

type DocumentsTabProps = {
  documents: CompanyDocument[];
  boardResolutionTemplates: BoardResolutionTemplate[];
};

const DOC_ICONS: Record<string, React.ReactNode> = {
  "doc-coi":   <ScrollText className="h-5 w-5 text-violet-600" />,
  "doc-moa":   <FileText className="h-5 w-5 text-violet-600" />,
  "doc-aoa":   <FileText className="h-5 w-5 text-violet-600" />,
  "doc-pan":   <CreditCard className="h-5 w-5 text-violet-600" />,
  "doc-inc20a":<FileText className="h-5 w-5 text-violet-600" />,
  "doc-mgt7":  <FileText className="h-5 w-5 text-violet-600" />,
  "doc-aoc4":  <FileText className="h-5 w-5 text-violet-600" />,
};

function DocumentCard({
  doc,
  onEntityLockerClick,
}: {
  doc: CompanyDocument;
  onEntityLockerClick: () => void;
}) {
  const available = doc.status === "Available";

  return (
    <Card className={`border ${available ? "" : "border-dashed border-muted-foreground/30"}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {DOC_ICONS[doc.id] ?? <FileText className="h-5 w-5 text-violet-600" />}
            <div>
              <p className="text-sm font-semibold leading-tight">{doc.title}</p>
              <p className="text-xs text-muted-foreground">{doc.plain_label}</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={
              available
                ? "text-[10px] bg-green-50 text-green-700 border-green-200 shrink-0"
                : "text-[10px] bg-gray-50 text-gray-500 border-gray-200 shrink-0"
            }
          >
            {available ? (
              <><CheckCircle2 className="h-2.5 w-2.5 mr-0.5 inline" /> Available</>
            ) : (
              "Not Uploaded"
            )}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {available ? (
            <>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                <Download className="h-3 w-3" /> Download
              </Button>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                <Send className="h-3 w-3" /> Send to CA
              </Button>
            </>
          ) : (
            <>
              {doc.source === "EntityLocker" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs gap-1 text-violet-600 border-violet-300"
                  onClick={onEntityLockerClick}
                >
                  <Link2 className="h-3 w-3" /> Fetch from EntityLocker
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                  <Upload className="h-3 w-3" /> Upload
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function BoardResolutionCard({ template }: { template: BoardResolutionTemplate }) {
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <>
      <Card className="hover:border-violet-300 transition-colors">
        <CardContent className="p-4 space-y-3">
          <div>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold leading-tight">{template.title}</p>
              {template.requires_mgt14 && (
                <Badge
                  variant="outline"
                  className="text-[10px] bg-violet-50 text-violet-700 border-violet-200 shrink-0"
                >
                  MGT-14 req.
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{template.description}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => setPreviewOpen(true)}
            >
              Preview
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
              <Download className="h-3 w-3" /> Download .docx
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-violet-600">
              <Send className="h-3 w-3" /> Send to CA
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">{template.title}</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground space-y-3 max-h-80 overflow-y-auto pr-1">
            <p className="font-medium text-foreground">BOARD RESOLUTION</p>
            <p>
              <strong>RESOLVED THAT</strong> pursuant to the provisions of the Companies Act,
              2013, and subject to such approvals as may be required, the Board hereby
              approves <span className="text-violet-700 italic">[{template.title}]</span> with
              effect from the date hereof.
            </p>
            <p>
              <strong>FURTHER RESOLVED THAT</strong> [Director Name], Director of the
              Company, be and is hereby authorized, severally, to do all acts, deeds, matters
              and things as may be necessary, proper, desirable or expedient to give effect to
              the above resolution.
            </p>
            <p className="text-xs italic text-muted-foreground">
              [This is a template. Fill in the highlighted fields before signing and
              submitting.]
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-3.5 w-3.5" /> Download .docx
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-violet-600 hover:bg-violet-700"
              onClick={() => setPreviewOpen(false)}
            >
              <Send className="h-3.5 w-3.5" /> Send to CA for Signing
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function DocumentsTab({ documents, boardResolutionTemplates }: DocumentsTabProps) {
  const [entityLockerOpen, setEntityLockerOpen] = useState(false);
  const [fetchedDocs, setFetchedDocs] = useState<Set<string>>(new Set());

  function handleEntityLockerSuccess() {
    const newSet = new Set(fetchedDocs);
    documents
      .filter((d) => d.source === "EntityLocker")
      .forEach((d) => newSet.add(d.id));
    setFetchedDocs(newSet);
  }

  const resolvedDocs = documents.map((d) =>
    fetchedDocs.has(d.id) ? { ...d, status: "Available" as const } : d
  );

  return (
    <div className="space-y-8">
      {/* Company Documents */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold">Company Documents</h3>
            <p className="text-xs text-muted-foreground">
              Official documents you should always have accessible.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 text-xs text-violet-600 border-violet-300"
            onClick={() => setEntityLockerOpen(true)}
          >
            <Link2 className="h-3 w-3" />
            Connect EntityLocker
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {resolvedDocs.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onEntityLockerClick={() => setEntityLockerOpen(true)}
            />
          ))}
        </div>
      </div>

      {/* Board Resolution Templates */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold">Board Resolution Templates</h3>
          <p className="text-xs text-muted-foreground">
            Ready-to-use templates for common board decisions. Download, fill in the blanks,
            and get signed.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {boardResolutionTemplates.map((t) => (
            <BoardResolutionCard key={t.id} template={t} />
          ))}
        </div>
      </div>

      <EntityLockerModal
        open={entityLockerOpen}
        onOpenChange={setEntityLockerOpen}
        onSuccess={handleEntityLockerSuccess}
      />
    </div>
  );
}
