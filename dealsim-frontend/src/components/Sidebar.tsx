import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  const isAdmin = currentUser?.role === 'organization_admin';
  const isEmployee = currentUser?.role === 'org_employee';

  const navItems = [
    ...(isEmployee ? [
      { name: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
      { name: 'Reports', path: '/reports', icon: 'bar_chart' },
    ] : []),
    ...(isAdmin ? [
      { name: 'Simulations', path: '/simulations', icon: 'play_circle' },
      { name: 'Assignments', path: '/assignments', icon: 'assignment' },
    ] : []),
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark flex flex-col fixed h-full z-20">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white">
          <span className="material-symbols-outlined text-xl">handshake</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight">DealSim</h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={location.pathname === item.path ? 'sidebar-item-active group' : 'sidebar-item group'}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
          <Link to="/profile" className={location.pathname === '/profile' ? 'sidebar-item-active group' : 'sidebar-item group'}>
            <span className="material-symbols-outlined">account_circle</span>
            <span className="font-medium">Profile</span>
          </Link>
          <button className="w-full sidebar-item group text-left">
            <span className="material-symbols-outlined">settings</span>
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </nav>
      <div className="p-4 mt-auto">
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            {isAdmin ? 'Admin View' : 'Employee View'}
          </p>
          <p className="text-sm font-medium mb-3">Enterprise Access</p>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-full"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};
