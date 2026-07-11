const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/;

export function parseDateOnly(value: string): Date {
  const match = DATE_ONLY_PATTERN.exec(value);

  if (!match) {
    return new Date(Number.NaN);
  }

  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function toDateInputValue(value: string | Date): string {
  if (typeof value === "string") {
    return DATE_ONLY_PATTERN.exec(value)?.[0] ?? "";
  }

  if (Number.isNaN(value.getTime())) {
    return "";
  }

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
