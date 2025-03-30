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

function getCurrentAndPreviousMonthDates() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  // Mês atual
  const currentStartDate = new Date(currentYear, currentMonth, 1);
  const currentEndDate = new Date(currentYear, currentMonth + 1, 0);

  // Mês anterior
  const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const previousStartDate = new Date(previousYear, previousMonth, 1);
  const previousEndDate = new Date(previousYear, previousMonth + 1, 0);

  return {
    currentMonth: {
      startDate: currentStartDate.toISOString().split("T")[0],
      endDate: currentEndDate.toISOString().split("T")[0],
    },
    previousMonth: {
      startDate: previousStartDate.toISOString().split("T")[0],
      endDate: previousEndDate.toISOString().split("T")[0],
    },
  };
}

async function fetchMonthlyComparison() {
  try {
    const { currentMonth, previousMonth } = getCurrentAndPreviousMonthDates();

    const [currentResponse, previousResponse] = await Promise.all([
      api.get<MonthlyComparisonDto[]>("dashboard/monthly-comparison", {
        params: {
          startDate: currentMonth.startDate,
          endDate: currentMonth.endDate,
        },
      }),
      api.get<MonthlyComparisonDto[]>("dashboard/monthly-comparison", {
        params: {
          startDate: previousMonth.startDate,
          endDate: previousMonth.endDate,
        },
      }),
    ]);

    return {
      currentMonth: currentResponse.data[0] || {
        month: currentMonth.startDate.slice(0, 7),
        totalExpenses: 0,
        totalIncomes: 0,
      },
      previousMonth: previousResponse.data[0] || {
        month: previousMonth.startDate.slice(0, 7),
        totalExpenses: 0,
        totalIncomes: 0,
      },
    };
  } catch (error) {
    console.error("Error fetching monthly comparison:", error);
    throw error;
  }
}

export function useMonthlyComparison() {
  return useQuery({
    queryKey: ["monthlyComparison"],
    queryFn: fetchMonthlyComparison,
    staleTime: 1000 * 60 * 5,
  });
}
