export const AssignmentsPage = () => {
  return (
    <div className="p-8 max-w-7xl w-full mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Simulation Assignments</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track employee simulation progress across your organization.</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 p-1 bg-primary/5 rounded-xl border border-primary/10 w-fit">
          <button className="px-4 py-1.5 rounded-lg text-sm font-medium bg-white dark:bg-slate-800 shadow-sm text-primary">All</button>
          <button className="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-primary/5">Pending</button>
          <button className="px-4 py-1.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-primary/5">Completed</button>
        </div>
        <div className="relative min-w-[320px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
          <input 
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-primary/10 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none text-slate-900 dark:text-white" 
            placeholder="Search employees or simulations..." 
            type="text"
          />
        </div>
      </div>

      {/* Data Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-primary/5 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Simulation</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {/* Row 1 */}
              <tr className="hover:bg-primary/[0.02] transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full border border-primary/10 overflow-hidden bg-primary/5 flex items-center justify-center shrink-0">
                      <img className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXcSe_23nJVN9IhXwaJ_IYA3aRdKzzvDLeqqumIQzbZDxbjJKcxNW_4MXcx7hXhA1O_bcs-fmrjzJUARCDNoyl2E6dy4P3d42IwQtMpk7S7ILfZctHtjxuXLFSDdmG1qgD_TBxvwKej9z3M3A2-tzXly4pUyLEZCBMpADm-1dKM6b9UB8ZCIgCRuCOjI273KgrULZBq2HuCOHzQAsXQwk7rtY8aOEujE44SRP0WBn9C4dPiR3xL86I4yRc5xSjVD16vkCVMBX0HvU" alt="Employee avatar" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Marcus Thorne</p>
                      <p className="text-xs text-slate-500">Sales Development</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Enterprise Negotiation</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-slate-500">Oct 12, 2023</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
                    In Progress
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button className="text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 border-t border-primary/5 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Showing 1 to 5 of 42 results</p>
          <div className="flex gap-2">
            <button className="p-2 border border-primary/10 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors disabled:opacity-50">
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="p-2 border border-primary/10 rounded-lg bg-white dark:bg-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
