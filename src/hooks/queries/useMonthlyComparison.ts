"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import api from "@/utils/api";

interface MonthlyComparisonDto {
  month: string; // Formato "YYYY-MM"
  totalExpenses: number;
  totalIncomes: number;
  percentageChange?: number; 
}


function getCurrentAndPreviousMonthDates(): {
  currentMonth: { startDate: string; endDate: string };
  previousMonth: { startDate: string; endDate: string };
} {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; 

  // Mês atual
  const currentStartDate = `${currentYear}-${String(currentMonth).padStart(
    2,
    "0"
  )}-01`;
  const currentEndDate = new Date(currentYear, currentMonth, 0)
    .toISOString()
    .split("T")[0];

  // Mês anterior
  const previousMonthDate = new Date(now);
  previousMonthDate.setMonth(now.getMonth() - 1); 
  const previousYear = previousMonthDate.getFullYear();
  const previousMonth = previousMonthDate.getMonth() + 1;
  const previousStartDate = `${previousYear}-${String(previousMonth).padStart(
    2,
    "0"
  )}-01`;
  const previousEndDate = new Date(previousYear, previousMonth, 0)
    .toISOString()
    .split("T")[0];

  return {
    currentMonth: { startDate: currentStartDate, endDate: currentEndDate },
    previousMonth: { startDate: previousStartDate, endDate: previousEndDate },
  };
}

async function fetchMonthlyComparison(

): Promise<{
  currentMonth: MonthlyComparisonDto;
  previousMonth: MonthlyComparisonDto;
}> {
  try {
    const { currentMonth, previousMonth } = getCurrentAndPreviousMonthDates();

    // Busca os dados do mês atual
    const currentMonthResponse = await api.get<MonthlyComparisonDto[]>(
      "dashboard/monthly-comparison",
      {
        params: {
          startDate: currentMonth.startDate,
          endDate: currentMonth.endDate,

        },
      }
    );

    // Busca os dados do mês anterior
    const previousMonthResponse = await api.get<MonthlyComparisonDto[]>(
      "dashboard/monthly-comparison",
      {
        params: {
          startDate: previousMonth.startDate,
          endDate: previousMonth.endDate,

        },
      }
    );

    console.log("currentMonthResponse", currentMonthResponse.data);
    console.log("previousMonthResponse", previousMonthResponse.data);

    return {
      currentMonth: currentMonthResponse.data[0] || {
        month: currentMonth.startDate.slice(0, 7),
        totalExpenses: 0,
        totalIncomes: 0,
      },
      previousMonth: previousMonthResponse.data[0] || {
        month: previousMonth.startDate.slice(0, 7),
        totalExpenses: 0,
        totalIncomes: 0,
      },
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(
        error.response.data.message ||
          "Erro ao buscar dados de comparação mensal"
      );
    }
    throw new Error("Erro ao buscar dados de comparação mensal");
  }
}


export function useMonthlyComparison() {
  return useQuery({
    queryKey: ["monthlyComparison"], 
    queryFn: () => fetchMonthlyComparison(), 
    placeholderData: (previousData) => previousData, 
  });
}
