import { type ReactNode } from "react";
import { type LucideIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ConfigCardProps {
  children: ReactNode;
  description: string;
  icon: LucideIcon;
  title: string;
  actions?: ReactNode;
  className?: string;
}

export function ConfigCard({
  actions,
  children,
  className,
  description,
  icon: Icon,
  title,
}: ConfigCardProps) {
  return (
    <Card
      className={cn(
        "border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white",
        className,
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-blue-50 text-blue-700 dark:bg-blue-800/50 dark:text-blue-300">
              <Icon className="size-5" />
            </div>
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          {actions}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
