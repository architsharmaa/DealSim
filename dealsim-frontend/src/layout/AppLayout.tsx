import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';

export const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 antialiased">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
