"use client";
import { Card, CardContent } from "@/components/ui/card";

export function LoadingState() {
  return (
    <div className="flex items-center justify-center h-64">
      <Card className="w-80 bg-[#F3F4F6] dark:bg-[#1F2937] text-[#1F2937] dark:text-white h-20 flex flex-col items-center justify-center">
        <CardContent className="flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#10B981] border-t-transparent rounded-full animate-spin"></div>
        </CardContent>
      </Card>
    </div>
  );
}
