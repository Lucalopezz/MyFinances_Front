import {
  getFinancialCalendar,
  getRecurringIncomes,
} from "@/actions/calendar/calendar";
import { CalendarContent } from "@/components/calendar/calendar-content";
import { currentDay } from "@/components/calendar/calendar-utils";
export const dynamic = "force-dynamic";
export default async function CalendarPage() {
  const month = currentDay().slice(0, 7);
  const [calendar, incomes] = await Promise.allSettled([
    getFinancialCalendar(month),
    getRecurringIncomes(),
  ]);
  return (
    <CalendarContent
      initialMonth={month}
      initialData={calendar.status === "fulfilled" ? calendar.value : undefined}
      initialIncomes={
        incomes.status === "fulfilled" ? incomes.value : undefined
      }
    />
  );
}
