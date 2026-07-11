import ComparativeContent from "@/components/comparative/content";
import { getSemesterComparison } from "@/actions/dashboard/dashboard";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Comparative() {
  const comparison = await getSemesterComparison();

  return <ComparativeContent comparison={comparison} />;
}
