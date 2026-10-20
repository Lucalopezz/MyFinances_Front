import { ProjectionCard } from "@/components/calendar/projection-card";
import type { DailyProjection } from "@/models/calendar.model";
export function ForecastCard({ forecast }: { forecast: DailyProjection }) {
  return (
    <div className="mb-6">
      <ProjectionCard projection={forecast} compact />
    </div>
  );
}
