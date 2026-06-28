import {
  Sparkles,
  Package,
  User,
  Users,
  Gem,
  Flag,
  Flower2,
  Crown,
} from "lucide-react";

const ICON_MAP = {
  sparkles: Sparkles,
  package: Package,
  user: User,
  users: Users,
  gem: Gem,
  flag: Flag,
  flower: Flower2,
  crown: Crown,
};

export function getCategoryIcon(iconName) {
  return ICON_MAP[iconName] || Sparkles;
}
