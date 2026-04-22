import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";
import ExpenseTrackerPage from "./pages/ExpenseTrackerPage";
import BudgetPlannerPage from "./pages/BudgetPlannerPage";
import SavingsGoalsPage from "./pages/SavingsGoalsPage";
import FamilyRoomPage from "./pages/FamilyRoomPage";
import AIAdvisorPage from "./pages/AIAdvisorPage";
import ReportsPage from "./pages/ReportsPage";
import ProfileSettingsPage from "./pages/ProfileSettingsPage";
import AdminPanelPage from "./pages/AdminPanelPage";

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />
      <Route path="/forgot-password" element={<AuthPage />} />

      <Route
        path="/app/*"
        element={
          <ProtectedRoute>
            <AppShell>
              <Routes>
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="expenses" element={<ExpenseTrackerPage />} />
                <Route path="budgets" element={<BudgetPlannerPage />} />
                <Route path="goals" element={<SavingsGoalsPage />} />
                <Route path="family-room" element={<FamilyRoomPage />} />
                <Route path="advisor" element={<AIAdvisorPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="profile" element={<ProfileSettingsPage />} />
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminPanelPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<DashboardPage />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to={user ? "/app/dashboard" : "/"} replace />} />
    </Routes>
  );
};

export default AppRoutes;
