import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  ComparativeBlock,
  SemesterSummary,
} from "@/models/dashboard.model";
import { formatCurrency, formatPercentage } from "@/utils/formatters";
import { ArrowRightLeft } from "lucide-react";
import BlockMessage from "../block-message";

interface PreviousSemesterComparisonProps {
  currentSummary: ComparativeBlock<SemesterSummary>;
  previousSummary: ComparativeBlock<SemesterSummary>;
  currentPeriodLabel: string;
  previousPeriodLabel: string;
}

export default function PreviousSemesterComparison({
  currentSummary,
  previousSummary,
  currentPeriodLabel,
  previousPeriodLabel,
}: PreviousSemesterComparisonProps) {
  const current = currentSummary.data;
  const previous = previousSummary.data;
  const error = currentSummary.error ?? previousSummary.error;
  const hasPreviousData = Boolean(
    previous &&
      (previous.totalIncomes !== 0 ||
        previous.totalExpenses !== 0 ||
        previous.balance !== 0),
  );

  if (error) {
    return (
      <BlockMessage
        title="Comparativo com semestre anterior"
        message={error}
        tone="error"
      />
    );
  }

  if (!hasPreviousData || !current || !previous) {
    return (
      <BlockMessage
        title="Comparativo com semestre anterior"
        message="Não há dados disponíveis para o semestre anterior."
      />
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-[#1F2937] dark:text-white">
          <ArrowRightLeft className="h-5 w-5" /> Comparativo com o semestre
          anterior
        </CardTitle>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Atual: {currentPeriodLabel} · Anterior: {previousPeriodLabel}
        </p>
      </CardHeader>
      <CardContent className="space-y-3 overflow-x-auto text-sm">
        <div className="grid min-w-[360px] grid-cols-[1fr_auto_auto] gap-4 border-b pb-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Indicador</span>
          <span>Atual</span>
          <span>Anterior</span>
        </div>
        <div className="grid min-w-[360px] grid-cols-[1fr_auto_auto] gap-4">
          <span className="text-gray-500 dark:text-gray-400">Receitas</span>
          <strong>{formatCurrency(current.totalIncomes)}</strong>
          <strong>{formatCurrency(previous.totalIncomes)}</strong>
        </div>
        <div className="grid min-w-[360px] grid-cols-[1fr_auto_auto] gap-4">
          <span className="text-gray-500 dark:text-gray-400">Despesas</span>
          <strong>{formatCurrency(current.totalExpenses)}</strong>
          <strong>{formatCurrency(previous.totalExpenses)}</strong>
        </div>
        <div className="grid min-w-[360px] grid-cols-[1fr_auto_auto] gap-4 border-t pt-3">
          <span className="text-gray-500 dark:text-gray-400">Saldo</span>
          <strong>{formatCurrency(current.balance)}</strong>
          <strong>{formatCurrency(previous.balance)}</strong>
        </div>
        <div className="grid min-w-[360px] grid-cols-[1fr_auto_auto] gap-4">
          <span className="text-gray-500 dark:text-gray-400">
            Taxa de economia
          </span>
          <strong>{formatPercentage(current.economyRate)}</strong>
          <strong>{formatPercentage(previous.economyRate)}</strong>
        </div>
      </CardContent>
    </Card>
  );
}
