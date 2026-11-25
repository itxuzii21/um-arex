import { Award, CheckCircle2, Clock, Gem, Package, Scissors, ScrollText, ShieldCheck, Sparkles, Truck } from "lucide-react";
import type { ContentIcon } from "../data/content";

const icons = {
  shield: ShieldCheck,
  truck: Truck,
  clock: Clock,
  award: Award,
  gem: Gem,
  scissors: Scissors,
  scroll: ScrollText,
  package: Package,
  check: CheckCircle2,
  sparkles: Sparkles,
};

export default function ContentIcon({ name, size = 20 }: { name: ContentIcon; size?: number }) {
  const Icon = icons[name] || Sparkles;
  return <Icon size={size} />;
}
