import {
  Briefcase,
  Car,
  CircleDollarSign,
  CircleHelp,
  CreditCard,
  Dog,
  Film,
  Gift,
  GraduationCap,
  HandCoins,
  Heart,
  Home,
  Landmark,
  Plane,
  Receipt,
  Scissors,
  Shield,
  ShoppingBag,
  TrendingUp,
  Utensils,
  Tag,
} from "lucide-react";
const icons = {
  Briefcase,
  Car,
  CircleDollarSign,
  CircleHelp,
  CreditCard,
  Dog,
  Film,
  Gift,
  GraduationCap,
  HandCoins,
  Heart,
  Home,
  Landmark,
  Plane,
  Receipt,
  Scissors,
  Shield,
  ShoppingBag,
  TrendingUp,
  Utensils,
  Tag,
};
export function CategoryIcon({ icon, color }: { icon: string; color: string }) {
  const Icon = icons[icon as keyof typeof icons] ?? Tag;
  return (
    <Icon aria-hidden="true" className="size-4 shrink-0" style={{ color }} />
  );
}
