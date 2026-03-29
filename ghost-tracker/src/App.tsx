import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Tracker } from "./pages/Tracker";
import { Profile } from "./pages/Profile";
import { ResumeBuilder } from "./pages/ResumeBuilder";
import { JobBoard } from "./pages/JobBoard";
import { H1BExplorer } from "./pages/H1BExplorer";
import { JobHelp } from "./pages/JobHelp";
import { AIAssistant } from "./pages/AIAssistant";
import { Settings } from "./pages/Settings";
import { NotFound } from "./pages/NotFound";
import { useApplications } from "./hooks/useApplications";

function AppRoutes() {
  const { auth, isDemoMode } = useAuth();
  const {
    applications,
    scan,
    hasLoaded,
    scanInbox,
    stats,
    addApplication,
    updateApplication,
    deleteApplication,
  } = useApplications();

  const handleScan = () => scanInbox(auth.accessToken, isDemoMode);

  if (!auth.isAuthenticated && !isDemoMode) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout onRefresh={handleScan} scan={scan} />}>
        <Route
          path="/"
          element={
            <Dashboard
              applications={applications}
              stats={stats}
              onScan={handleScan}
              hasLoaded={hasLoaded}
            />
          }
        />
        <Route
          path="/tracker"
          element={
            <Tracker
              applications={applications}
              hasLoaded={hasLoaded}
              onAdd={addApplication}
              onUpdate={updateApplication}
              onDelete={deleteApplication}
            />
          }
        />
        <Route path="/profile" element={<Profile />} />
        <Route path="/resume" element={<ResumeBuilder />} />
        <Route path="/jobs" element={<JobBoard />} />
        <Route path="/h1b" element={<H1BExplorer />} />
        <Route path="/help" element={<JobHelp />} />
        <Route path="/ai" element={<AIAssistant />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
