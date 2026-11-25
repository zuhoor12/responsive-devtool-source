import { HashRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import DevToolLayout from "@/components/devtool/DevToolLayout";
import ResponsiveDevTool from "@/pages/ResponsiveDevTool";

// HashRouter: the extension page lives at a fixed file (viewer.html), so path-based
// routing would 404 on reload. The query string (?url=...) stays readable before the "#".
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<DevToolLayout />}>
          <Route path="/" element={<ResponsiveDevTool />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </HashRouter>
  );
}
