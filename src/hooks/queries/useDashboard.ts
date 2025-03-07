"use client";

import api from "@/utils/api";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface Period {
  start: string;
  end: string;
}

interface FinancialSummary {
  balance: number;
  totalIncomes: number;
  totalExpenses: number;
  period: Period;
}

function getCurrentYearDates(): { startDate: string; endDate: string } {
  const currentYear = new Date().getFullYear();
  const startDate = `${currentYear}-01-01`;
  const endDate = `${currentYear}-12-31`;
  return { startDate, endDate };
}

async function fetchDashboard(
  startDate: string,
  endDate: string
): Promise<FinancialSummary> {
  try {
    const response = await api.get<FinancialSummary>("/dashboard/", {
      params: { startDate, endDate },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message || "Erro ao buscar dados do dashboard"
      );
    }
    throw new Error("Erro ao buscar dados do dashboard");
  }
}

export function useDashboard() {
  const { startDate, endDate } = getCurrentYearDates();

  return useQuery<FinancialSummary, Error>({
    queryKey: ["dashboard", startDate, endDate],
    queryFn: () => fetchDashboard(startDate, endDate),
    placeholderData: (previousData) => previousData,
  });
}
