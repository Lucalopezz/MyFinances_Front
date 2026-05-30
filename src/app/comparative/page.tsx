import ComparativeContent from "@/components/comparative/Content";
import { getSixMonthComparison } from "@/services/dashboard.service";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Comparative() {
  const sixMonthData = await getSixMonthComparison();

  return <ComparativeContent sixMonthData={sixMonthData} />;
}
