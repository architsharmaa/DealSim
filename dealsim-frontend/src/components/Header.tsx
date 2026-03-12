export const Header = () => {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between">
      <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 w-96 border border-slate-200 dark:border-slate-700">
        <span className="material-symbols-outlined text-slate-400 text-sm">search</span>
        <input 
          className="bg-transparent border-none focus:ring-0 outline-none text-sm w-full placeholder:text-slate-500 ml-2" 
          placeholder="Search simulations or reports..." 
          type="text"
        />
      </div>
      <div className="flex items-center gap-4">
        <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
          <div className="text-right">
            <p className="text-sm font-semibold">Alex Rivera</p>
            <p className="text-xs text-slate-500">Sales Manager</p>
          </div>
          <div 
            className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 bg-cover bg-center" 
            style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAxRBkS5-3MeeyIJv5o1_URwV9rZBrYN9Z2F094ayJPf8eyw-IpTly6apMO_hEnIZI9OojiWairGirVKc88rrdh1Xy849RExi-6HIAL7Kd56_DmusIXSa7VFTVvZvodMEpbU5ce9nXQMLlroDz40E0pYQlsbjGd9jSeg1mcgBcpcrXahU_hvu1XNjwkLwFStWJ9TLa74Fk4WCjf-ZIlQ99oWCBvOlgh0SYlpxGp0TN_nrTae6YEdxZ3vkBqGS_02N7jeL0urwf74uk')" }}
          />
        </div>
      </div>
    </header>
  );
};
