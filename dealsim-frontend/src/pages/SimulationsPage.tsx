export const SimulationsPage = () => {
  return (
    <div className="p-10 max-w-7xl">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">Manage Simulations</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-2xl">
          Configure your simulation environments by managing personas, business contexts, and grading rubrics for AI-driven deal scenarios.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex border-b border-slate-200 dark:border-slate-800">
        <button className="border-b-2 border-primary px-6 py-4 text-sm font-bold text-primary">
          Personas
        </button>
        <button className="border-b-2 border-transparent px-6 py-4 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
          Contexts
        </button>
        <button className="border-b-2 border-transparent px-6 py-4 text-sm font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
          Rubrics
        </button>
      </div>

      {/* Filters & Stats */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-bold text-slate-600 dark:text-slate-400">48 Total Personas</span>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">12 Recently Active</span>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-sm">filter_list</span> Filter
          </button>
          <button className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-sm">sort</span> Sort
          </button>
        </div>
      </div>

      {/* Persona Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* Persona Card 1 */}
        <div className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-shadow">
          <div className="relative h-48 w-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
            <img className="absolute h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8-B5kvww_ONrkuYRop1AisBFwLp2xzZ8Csj9OIDPBC-Hur0juReTf5zvy9IhNGjrsIL3Rtw9lfN2rqf3cG-R97pmeVjAV0UAY5mvUU8RHusJrop7NacwiUzz_9tUPt_bXI-ej33TG4F1i59G3iKCao_hqS_6LIXk0BNncR0hhEbH25tt87HTZXgu4-sc0B9s0Y1r11p9xzI70hXCqFGo-bh-xPXQ0671_D1hP0OhwPBK19eA1rnp9nfBchWv9cItkDipeuR57SUk" alt="Persona" />
            <div className="absolute bottom-3 left-3 z-20">
              <span className="rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">High Value</span>
            </div>
          </div>
          <div className="flex flex-1 flex-col p-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Alex Rivera</h3>
            <div className="mt-1 flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                <span className="material-symbols-outlined text-base">business_center</span>
                <span>Tech Industry</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                <span className="material-symbols-outlined text-base">psychology</span>
                <span>Analytical</span>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
              <button className="flex items-center gap-1 text-sm font-bold text-primary hover:underline">
                <span className="material-symbols-outlined text-base">edit</span> Edit
              </button>
              <button className="flex items-center gap-1 text-sm font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <span className="material-symbols-outlined text-base">content_copy</span> Duplicate
              </button>
            </div>
          </div>
        </div>

        {/* Add New Card Placeholder */}
        <button className="flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 p-8 hover:border-primary hover:bg-primary/5 transition-all">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-slate-800 text-slate-400 shadow-sm">
            <span className="material-symbols-outlined">person_add</span>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Create New Persona</p>
            <p className="text-xs text-slate-500">Add a custom role with specific traits</p>
          </div>
        </button>
      </div>
    </div>
  );
};
