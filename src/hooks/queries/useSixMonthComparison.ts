"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { MonthlyComparisonDto } from "./useMonthlyComparison";

function getLastSixMonthsDates() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  const months = [];
  
  // Gerar os últimos 6 meses (incluindo o atual)
  for (let i = 0; i < 6; i++) {
    // Calcular o mês (0-11) e ano
    let targetMonth = currentMonth - i;
    let targetYear = currentYear;
    
    // Ajuste para meses anteriores ao atual ano
    while (targetMonth < 0) {
      targetMonth += 12;
      targetYear -= 1;
    }
    
    // Criar datas de início e fim do mês
    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);
    
    months.push({
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
      label: new Date(targetYear, targetMonth, 1).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    });
  }
  
  return months;
}

async function fetchSixMonthComparison() {
  try {
    const monthsData = getLastSixMonthsDates();
    
    // Fazer as requisições para cada mês
    const monthPromises = monthsData.map(month => 
      api.get<MonthlyComparisonDto[]>("dashboard/monthly-comparison", {
        params: {
          startDate: month.startDate,
          endDate: month.endDate,
        },
      }).then(response => ({
        ...response.data[0] || {
          month: month.startDate.slice(0, 7),
          totalExpenses: 0,
          totalIncomes: 0,
        },
        label: month.label
      }))
    );
    
    const results = await Promise.all(monthPromises);
    
    // Inverter os resultados para mostrar do mês mais antigo para o mais recente
    return results.reverse();
  } catch (error) {
    console.error("Error fetching six month comparison:", error);
    throw error;
  }
}

export function useSixMonthComparison() {
  return useQuery({
    queryKey: ["sixMonthComparison"],
    queryFn: fetchSixMonthComparison,
    staleTime: 1000 * 60 * 5,
  });
}