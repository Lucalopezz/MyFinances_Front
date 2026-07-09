import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusBadgeTone = "green" | "red" | "yellow" | "blue";

interface StatusBadgeProps {
  children: React.ReactNode;
  tone: StatusBadgeTone;
}

const toneClasses: Record<StatusBadgeTone, string> = {
  green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  yellow:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
};

export function StatusBadge({ children, tone }: StatusBadgeProps) {
  return <Badge className={cn(toneClasses[tone])}>{children}</Badge>;
}
