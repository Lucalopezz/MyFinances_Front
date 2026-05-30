import DashboardContent from "@/components/dashboard/Content";
import {
  getDashboardSummary,
  getMonthlyComparison,
} from "@/services/dashboard.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const [dashboardData, monthlyComparison] = await Promise.all([
    getDashboardSummary(),
    getMonthlyComparison(),
  ]);

  return (
    <DashboardContent
      dashboardData={dashboardData}
      monthlyComparison={monthlyComparison}
    />
  );
}
