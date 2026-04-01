import { AlertTriangle, Info, Lightbulb, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface NotificationItem {
  id: string;
  type: "urgent" | "warning" | "info" | "tip";
  message: string;
  time: string;
}

interface NotificationPanelProps {
  notifications: NotificationItem[];
}

const ICON_MAP = {
  urgent: { icon: AlertTriangle, className: "text-destructive", bg: "bg-destructive/10" },
  warning: { icon: AlertCircle, className: "text-yellow-600", bg: "bg-yellow-50" },
  info: { icon: Info, className: "text-blue-600", bg: "bg-blue-50" },
  tip: { icon: Lightbulb, className: "text-green-600", bg: "bg-green-50" },
};

export default function NotificationPanel({ notifications }: NotificationPanelProps) {
  return (
    <ScrollArea className="h-[calc(100vh-80px)]">
      <div className="flex flex-col divide-y">
        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
            <Info className="h-8 w-8 opacity-40" />
            <p className="text-sm">No notifications</p>
          </div>
        )}
        {notifications.map((n: NotificationItem) => {
          const { icon: Icon, className, bg } = ICON_MAP[n.type];
          return (
            <div key={n.id} className="flex gap-3 px-6 py-4 hover:bg-muted/40 transition-colors">
              <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bg}`}>
                <Icon className={`h-4 w-4 ${className}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm leading-snug">{n.message}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{n.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
