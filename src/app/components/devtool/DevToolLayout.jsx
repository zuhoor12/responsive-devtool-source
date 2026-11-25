import { Outlet } from "react-router-dom";
import { DevToolProvider } from "@/lib/DevToolContext";

export default function DevToolLayout() {
  return (
    <DevToolProvider>
      <Outlet />
    </DevToolProvider>
  );
}