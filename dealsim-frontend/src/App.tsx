import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './layout/AppLayout';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardPage } from './pages/DashboardPage';
import { SimulationsPage } from './pages/SimulationsPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SessionPage } from './pages/SessionPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { PersonasPage } from './pages/PersonasPage';
import { ContextsPage } from './pages/ContextsPage';
import { RubricsPage } from './pages/RubricsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const ProfilePage = () => <div className="p-8"><h2 className="text-2xl font-bold">Profile Page Placeholder</h2></div>;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
        <Toaster position="top-right" />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected Dashboard Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="simulations" element={<SimulationsPage />} />
                <Route path="assignments" element={<AssignmentsPage />} />
                <Route path="reports/:sessionId?" element={<ReportsPage />} />
                <Route path="personas" element={<PersonasPage />} />
                <Route path="contexts" element={<ContextsPage />} />
                <Route path="rubrics" element={<RubricsPage />} />
                <Route path="session/:sessionId" element={<SessionPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
