import {
  Award,
  BadgeCheck,
  Brain,
  CalendarCheck,
  CalendarRange,
  Compass,
  Crown,
  Flame,
  Footprints,
  Gem,
  Hourglass,
  Library,
  Medal,
  Rocket,
  Swords,
  Timer,
  TrendingUp,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  footprints: Footprints,
  flame: Flame,
  medal: Medal,
  trophy: Trophy,
  swords: Swords,
  crown: Crown,
  'calendar-check': CalendarCheck,
  'calendar-range': CalendarRange,
  zap: Zap,
  rocket: Rocket,
  brain: Brain,
  library: Library,
  timer: Timer,
  hourglass: Hourglass,
  'badge-check': BadgeCheck,
  compass: Compass,
  'trending-up': TrendingUp,
  gem: Gem,
};

export function AchievementIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Award;
  return <Icon className={className} aria-hidden />;
}
