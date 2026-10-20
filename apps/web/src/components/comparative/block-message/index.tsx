import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BlockMessageProps {
  title: string;
  message: string;
  tone?: "error" | "empty";
}

export default function BlockMessage({
  title,
  message,
  tone = "empty",
}: BlockMessageProps) {
  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-xl text-[#1F2937] dark:text-white">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={
            tone === "error"
              ? "rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
              : "rounded-lg border border-dashed p-6 text-center text-sm text-gray-500 dark:text-gray-400"
          }
        >
          {message}
        </div>
      </CardContent>
    </Card>
  );
}
