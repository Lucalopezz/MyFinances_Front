import DashboardContent from "@/components/dashboard/content";
import {
  getDashboardSummary,
  getMonthlyComparison,
} from "@/actions/dashboard/dashboard";

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
