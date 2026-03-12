export const DashboardPage = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Welcome back, Alex</h2>
        <p className="text-slate-500 mt-1">
          You have 3 active assignments due this week. Your performance is up 12% from last month.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Avg Score</span>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">88%</span>
            <span className="text-emerald-500 text-sm font-semibold pb-1">+5.2%</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">vs 83.6% last month</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Sessions Completed</span>
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">24</span>
            <span className="text-slate-400 text-sm font-semibold pb-1">this period</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Target: 30 sessions</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Skill Growth</span>
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
              <span className="material-symbols-outlined">bolt</span>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">+12%</span>
            <span className="text-emerald-500 text-sm font-semibold pb-1">+2%</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Negotiation efficiency improved</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Assigned Simulations Section */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Assigned Simulations</h3>
            <a className="text-primary text-sm font-semibold hover:underline" href="#">View all</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Simulation Card 1 */}
            <div className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-primary/50 transition-all">
              <div className="h-2 bg-primary"></div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBKqrGAHIuSagU3zNU4V5TRZip0ud5epCHOfwhC6gQ_UENlKpMm74T-Ov4BfZltHvjXpkYVWfSItWWwVFThFK8Gc6ksmMQxpj-k6m2DpGpdKBDLAUq-2Do2F_3A6howDwvX9HcXPXIJKleEKyXd1z4ol8lQHijzUE2F0M2m5C_UeWrrocIs7VaYq-47rGR-WR6DtlQWPaG7L2zKveKkwiHa-CDykKArgW5Z1ANo6QDNghuUMmQCbXpYxBOU8f3FQ_bz_4f2Jc9asMM')" }}></div>
                    <div>
                      <h4 className="font-bold">Marcus Chen</h4>
                      <p className="text-xs text-slate-500 uppercase font-medium">VP of Procurement</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold uppercase">Expert</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Negotiate a 15% expansion contract for the APAC region. Focus on long-term commitment.</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> 15m</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">psychology</span> Medium</span>
                  </div>
                  <button className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all transform active:scale-95 shadow-sm shadow-primary/20">
                    Start
                  </button>
                </div>
              </div>
            </div>
            {/* Simulation Card 2 */}
            <div className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-primary/50 transition-all">
              <div className="h-2 bg-slate-200 dark:bg-slate-700"></div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBI7W9LDK2UKaJ79CJZ1B_NwPOn3fqu1wD16BI1MUuV4IiQtV8wDgTQ3xsU6r2-yebzPqOjOtBb1BvUXxKJOYMYz8GP3MSwZ_vrGLXeN7WeEkxB7X9vLOIQDL3ZbWdW8Ya9UifXTpQiv0PiD1xw0BjAuBu3eQjqGNDj6EuT_1YiYVmwQUAYvvPMftJacnO69tlxou0q1XaIREisWuHP0kAT0wFWXMJSKr1Wy-x8VZ2uytnfb0qFbPMsixuQtQYGOSQO4Vech-D8yMY')" }}></div>
                    <div>
                      <h4 className="font-bold">Sarah Jenkins</h4>
                      <p className="text-xs text-slate-500 uppercase font-medium">CMO at TechFlow</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase">Beginner</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">Initial discovery call for the new marketing automation module. Overcome budget objections.</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> 10m</span>
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">psychology</span> Easy</span>
                  </div>
                  <button className="bg-primary hover:bg-primary/90 text-white px-5 py-2 rounded-lg text-sm font-bold transition-all transform active:scale-95 shadow-sm shadow-primary/20">
                    Start
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recently Completed List */}
        <div>
          <h3 className="text-xl font-bold mb-6">Recently Completed</h3>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                    <span className="text-sm font-bold">92%</span>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold">Renewal Negotiation</h5>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">2 hours ago</p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-primary">
                  <span className="material-symbols-outlined">visibility</span>
                </button>
              </div>
              
              <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                    <span className="text-sm font-bold">88%</span>
                  </div>
                  <div>
                    <h5 className="text-sm font-bold">Sarah Jenkins (Call 1)</h5>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wide">Yesterday</p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-primary">
                  <span className="material-symbols-outlined">visibility</span>
                </button>
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 text-center border-t border-slate-100 dark:border-slate-800">
              <button className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">View All History</button>
            </div>
          </div>

          {/* Additional Context Card */}
          <div className="mt-6 bg-primary/5 dark:bg-primary/10 border border-primary/20 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="material-symbols-outlined text-primary">lightbulb</span>
              <h4 className="font-bold text-sm">Pro Tip</h4>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Focus on the <span className="font-bold">Empathy Mapping</span> module. Alex, your scores show you could improve your rapport building before jumping to technical specs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
