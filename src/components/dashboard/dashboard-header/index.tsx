import { formatDateRange, formatMonthLabel } from "@/utils/formatters";

interface DashboardHeaderProps {
  period: {
    start: string;
    end: string;
  };
}

const DashboardHeader = ({ period }: DashboardHeaderProps) => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-[#1F2937] dark:text-white">
        Visão geral
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Resumo de {formatMonthLabel(period.start)} (
        {formatDateRange(period.start, period.end)})
      </p>
    </div>
  );
};

export default DashboardHeader;
