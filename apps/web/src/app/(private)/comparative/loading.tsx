import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingBlock({ height = "h-72" }: { height?: string }) {
  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <Skeleton className="h-6 w-52" />
      </CardHeader>
      <CardContent>
        <Skeleton className={`${height} w-full`} />
      </CardContent>
    </Card>
  );
}

export default function ComparativeLoading() {
  return (
    <div className="p-4 sm:p-6">
      <Skeleton className="h-8 w-80 max-w-full" />
      <Skeleton className="mt-2 h-4 w-64 max-w-full" />

      <div className="my-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Card key={index} className="bg-white dark:bg-gray-800">
            <CardContent className="flex items-center justify-between pt-6">
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-24" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LoadingBlock />
        <LoadingBlock />
      </div>
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LoadingBlock height="h-48" />
        <LoadingBlock height="h-48" />
      </div>
      <LoadingBlock height="h-80" />
    </div>
  );
}
