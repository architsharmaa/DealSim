import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { SimulationsPage } from './pages/SimulationsPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SessionPage } from './pages/SessionPage';

const ProfilePage = () => <div className="p-8"><h2 className="text-2xl font-bold">Profile Page Placeholder</h2></div>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="simulations" element={<SimulationsPage />} />
          <Route path="assignments" element={<AssignmentsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="session/:sessionId" element={<SessionPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
