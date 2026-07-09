import ComparativeContent from "@/components/comparative/content";
import { getSixMonthComparison } from "@/actions/dashboard/dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Comparative() {
  const sixMonthData = await getSixMonthComparison();

  return <ComparativeContent sixMonthData={sixMonthData} />;
}
