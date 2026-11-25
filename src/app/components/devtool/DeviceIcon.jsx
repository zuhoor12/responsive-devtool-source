import { Smartphone, Tablet, Monitor } from "lucide-react";

export default function DeviceIcon({ category, className }) {
  const Icon = category === "mobile" ? Smartphone : category === "tablet" ? Tablet : Monitor;
  return <Icon className={className} />;
}