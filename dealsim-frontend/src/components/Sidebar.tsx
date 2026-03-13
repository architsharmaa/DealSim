import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Sidebar = () => {
  const location = useLocation();
  const { currentUser } = useAuth();

  const isAdmin = currentUser?.role === 'organization_admin';
  const isEmployee = currentUser?.role === 'org_employee';

  const navItems = [
    ...(isEmployee ? [
      { name: 'Dashboard', path: '/dashboard', icon: 'grid_view' },
      { name: 'Reports', path: '/reports', icon: 'analytics' },
    ] : []),
    ...(isAdmin ? [
      { name: 'Launch Simulation', path: '/session/new', icon: 'rocket_launch', primary: true },
      { name: 'Dashboard', path: '/dashboard', icon: 'grid_view' },
      { name: 'Simulations', path: '/simulations', icon: 'play_circle' },
      { name: 'Assignments', path: '/assignments', icon: 'assignment' },
      { name: 'Reports', path: '/reports', icon: 'analytics' },
      { name: 'Personas', path: '/personas', icon: 'person_search' },
      { name: 'Contexts', path: '/contexts', icon: 'schema' },
      { name: 'Rubrics', path: '/rubrics', icon: 'checklist_rtl' },
    ] : []),
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark flex flex-col fixed h-full z-20 transition-colors duration-300">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 rotate-3">
          <span className="material-symbols-outlined text-2xl">handshake</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
          DealSim
        </h1>
      </div>

      <nav className="flex-1 px-4 mt-6 space-y-1.5">
        <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Main Menu</p>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]' 
                  : (item as any).primary 
                    ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 hover:translate-x-1'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:translate-x-1'
              }`}
            >
              <span className={`material-symbols-outlined transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              <span className="font-bold text-sm tracking-tight">{item.name}</span>
            </Link>
          );
        })}

        <div className="pt-8 mt-8 border-t border-slate-100 dark:border-slate-800">
          <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Account</p>
          <Link 
            to="/profile" 
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group ${
              location.pathname === '/profile' 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:translate-x-1'
            }`}
          >
            <span className="material-symbols-outlined">account_circle</span>
            <span className="font-bold text-sm tracking-tight">Profile</span>
          </Link>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 hover:translate-x-1 group text-left">
            <span className="material-symbols-outlined group-hover:rotate-45 transition-transform duration-500">settings</span>
            <span className="font-bold text-sm tracking-tight">Settings</span>
          </button>
        </div>
      </nav>

      <div className="p-6 mt-auto">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/40 dark:to-slate-900/40 rounded-[2rem] p-6 border border-slate-200/50 dark:border-slate-800 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700" />
          <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 relative z-10">
            {isAdmin ? 'Admin' : 'Employee'}
          </p>
          <p className="text-sm font-black text-slate-900 dark:text-white mb-4 relative z-10">Enterprise Access</p>
          <div className="w-full bg-slate-200 dark:bg-slate-700/50 h-2 rounded-full overflow-hidden relative z-10 shadow-inner">
            <div className="bg-primary h-full w-full shadow-[0_0_10px_rgba(48,125,232,0.5)] animate-pulse"></div>
          </div>
        </div>
      </div>
    </aside>
  );
};
