import { parseDateOnly } from "@/utils/date";

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export const formatSignedCurrency = (
  value: number,
  sign?: "+" | "-",
): string => {
  return sign ? `${sign} ${formatCurrency(value)}` : formatCurrency(value);
};

export const formatShortDate = (value?: string | Date): string => {
  if (!value) return "-";

  const date = value instanceof Date ? value : parseDateOnly(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export const formatPercentage = (value = 0): string => {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  }).format(value) + "%";
};

export const formatMonthLabel = (value?: string): string => {
  if (!value) return "Mês atual";

  const normalizedValue = value.length === 7 ? `${value}-01` : value;
  const date = new Date(`${normalizedValue}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "Mês atual";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);
};

export const formatDateRange = (start?: string, end?: string): string => {
  if (!start || !end) return "Período mensal";

  const startDate = new Date(`${start.slice(0, 10)}T00:00:00`);
  const endDate = new Date(`${end.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "Período mensal";
  }

  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return `${formatter.format(startDate)} a ${formatter.format(endDate)}`;
};

export const formatTimeAgo = (date?: Date) => {
  if (!date) return "Agora";
  
  const now = new Date();
  const createdAt = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return "Agora";
  if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h atrás`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d atrás`;
};
