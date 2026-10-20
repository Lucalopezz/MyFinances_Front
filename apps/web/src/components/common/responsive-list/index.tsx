import { Fragment, type ReactNode } from "react";

import { Table, TableBody } from "@/components/ui/table";

interface ResponsiveListProps<TItem> {
  items: TItem[];
  getKey: (item: TItem) => string;
  renderDesktopRow: (item: TItem) => ReactNode;
  renderMobileCard: (item: TItem) => ReactNode;
  emptyState?: ReactNode;
}

export function ResponsiveList<TItem>({
  items,
  getKey,
  renderDesktopRow,
  renderMobileCard,
  emptyState,
}: ResponsiveListProps<TItem>) {
  if (items.length === 0) {
    return emptyState ? <>{emptyState}</> : null;
  }

  return (
    <>
      <div className="hidden rounded-lg border border-gray-300 shadow-sm dark:border-gray-700 md:block">
        <div className="max-h-[calc(100vh-300px)] overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <Table>
            <TableBody>
              {items.map((item) => (
                <Fragment key={getKey(item)}>
                  {renderDesktopRow(item)}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="space-y-3 md:hidden">
        {items.map((item) => (
          <Fragment key={getKey(item)}>{renderMobileCard(item)}</Fragment>
        ))}
      </div>
    </>
  );
}
