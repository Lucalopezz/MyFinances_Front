import ComparativeContent from "@/components/comparative/Content";
import { getSixMonthComparison } from "@/services/dashboard.service";

export default async function Comparative() {
  const sixMonthData = await getSixMonthComparison();

  return <ComparativeContent sixMonthData={sixMonthData} />;
}
