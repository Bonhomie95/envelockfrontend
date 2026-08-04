import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth";
import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Smtp from "./pages/Smtp";
import Leads from "./pages/Leads";
import Compose from "./pages/Compose";
import CampaignLive from "./pages/CampaignLive";
import Users from "./pages/Users";

function Protected({ children, admin }: { children: JSX.Element; admin?: boolean }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="login-wrap muted">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <Protected>
              <Layout />
            </Protected>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/smtp" element={<Smtp />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/compose" element={<Compose />} />
          <Route path="/campaigns/:id" element={<CampaignLive />} />
          <Route
            path="/users"
            element={
              <Protected admin>
                <Users />
              </Protected>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
