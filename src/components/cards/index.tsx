import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

type SummaryCardLayout = "default" | "inline";

interface SummaryCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  isLoading?: boolean;
  content?: ReactNode;
  children?: ReactNode;
  icon?: ReactNode;
  className?: string;
  contentClassName?: string;
  valueClassName?: string;
  layout?: SummaryCardLayout;
}

export function SummaryCard({
  title,
  subtitle,
  isLoading = false,
  content,
  children,
  icon,
  className,
  contentClassName,
  valueClassName,
  layout = "default",
}: SummaryCardProps) {
  const hasChildren = children !== undefined && children !== null;
  const cardContent = children ?? content;

  if (layout === "inline") {
    return (
      <Card className={cn("bg-white dark:bg-gray-800", className)}>
        <CardContent className={cn("pt-6", contentClassName)}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">{title}</p>
              {isLoading ? (
                <Skeleton className="mt-2 h-8 w-24" />
              ) : (
                <h3
                  className={cn(
                    "text-2xl font-bold text-gray-900 dark:text-white",
                    valueClassName,
                  )}
                >
                  {cardContent}
                </h3>
              )}
            </div>
            {icon}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg text-[#1F2937] dark:text-white">
          {title}
        </CardTitle>
        {subtitle ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        ) : null}
      </CardHeader>
      <CardContent className={contentClassName}>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : hasChildren ? (
          children
        ) : (
          <p className={cn("text-2xl font-semibold", valueClassName)}>
            {content}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default SummaryCard;
