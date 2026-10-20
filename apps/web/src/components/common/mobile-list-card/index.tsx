import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface MobileListCardProps {
  title: ReactNode;
  meta?: ReactNode;
  amount?: ReactNode;
  children?: ReactNode;
  footerLeft?: ReactNode;
  actions?: ReactNode;
  amountClassName?: string;
}

export function MobileListCard({
  title,
  meta,
  amount,
  children,
  footerLeft,
  actions,
  amountClassName,
}: MobileListCardProps) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="truncate font-medium text-gray-900 dark:text-gray-100">
            {title}
          </div>
          {meta ? (
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {meta}
            </div>
          ) : null}
        </div>
        {amount ? (
          <div
            className={cn(
              "shrink-0 text-right text-lg font-semibold",
              amountClassName,
            )}
          >
            {amount}
          </div>
        ) : null}
      </div>

      {children ? <div className="mt-3">{children}</div> : null}

      {(footerLeft || actions) ? (
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="min-w-0">{footerLeft}</div>
          {actions ? (
            <div className="flex shrink-0 gap-2">{actions}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
