import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

export const Header = () => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center bg-slate-100 dark:bg-slate-800/50 rounded-xl px-4 py-2 w-96 border border-slate-200/50 dark:border-slate-700/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
        <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
        <input 
          className="bg-transparent border-none focus:ring-0 outline-none text-sm w-full placeholder:text-slate-500 ml-2" 
          placeholder="Search simulations or reports..." 
          type="text"
        />
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all active:scale-95"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          <span className="material-symbols-outlined">
            {theme === 'light' ? 'dark_mode' : 'light_mode'}
          </span>
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        
        <div className="flex items-center gap-4 ml-2 pl-4 border-l border-slate-100 dark:border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold tracking-tight">{currentUser?.fullName || 'User'}</p>
            <p className="text-[10px] text-primary font-black uppercase tracking-widest">{currentUser?.role?.replace('_', ' ') || 'Guest'}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all group overflow-hidden relative"
            title="Logout"
          >
            <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
