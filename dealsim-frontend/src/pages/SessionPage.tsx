export const SessionPage = () => {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Left Panel: Persona Info */}
      <aside className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-2 text-primary mb-6">
            <span className="material-symbols-outlined">account_circle</span>
            <h3 className="font-bold text-sm tracking-wider uppercase">Persona Info</h3>
          </div>
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-4">
              <div className="size-32 rounded-xl overflow-hidden border-4 border-slate-100 dark:border-slate-800 shadow-xl">
                <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNMfyYIZ_hknZvN58gj87o35_LTglGSye6gHVZJ6qYJ4JTF0n53O0WJM3GCtA9ejIRFPQzq3gFT5pdWu1uW01w9HabIwoXl5oBvc_4WUFNajS4HkkNft1ZI4Wk0pawYfRAfBBsvlRj7xjgj0fhS3Hay8IiIOB1yPoKucdwErV5Atnso5V2IQ8Twn4-HQCQQLC7MrDWHKyG1et4ieZu7L-Wj0qzAbwbxfHmgZEZFm0wAII1XhJ7Zl7E84-X2NnES1wY-IabeMZFmQk" alt="Jordan Smith" />
              </div>
              <div className="absolute -bottom-2 -right-2 size-8 bg-green-500 rounded-full border-4 border-white dark:border-slate-900"></div>
            </div>
            <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">Jordan Smith</h4>
            <p className="text-primary font-medium text-sm">Procurement Director, TechCorp</p>
          </div>
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Objective</p>
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">Secure 15% discount on annual license or walk away to competitors.</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2 px-1">Context</p>
              <ul className="space-y-3">
                <li className="flex gap-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="material-symbols-outlined text-primary text-sm mt-1">analytics</span>
                  Jordan is highly analytical and price-sensitive.
                </li>
                <li className="flex gap-3 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <span className="material-symbols-outlined text-primary text-sm mt-1">verified_user</span>
                  Values long-term stability and ROI over quick "flashy" features.
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-auto pt-10">
            <button className="w-full py-3 bg-red-500/10 text-red-500 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">stop_circle</span>
              End Session
            </button>
          </div>
        </div>
      </aside>

      {/* Main Panel: Active Simulation Chat */}
      <section className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900/40 relative">
        <div className="px-8 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">chat_bubble</span>
            <h2 className="font-bold text-slate-900 dark:text-slate-100">Enterprise Negotiation Simulation</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>
              Live Session
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">00:14:32</span>
          </div>
        </div>
        
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="flex items-start gap-4 max-w-[80%]">
            <div className="size-10 rounded-lg bg-slate-200 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center overflow-hidden">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjlQqznK_MD1z_JCH5UunQpOSVhkVGS9tUtx_ggHVNO0zZMNcAScYWP6CU47gjlxbdvBAmh1bCuLxUFNWTtjurhdtYHfOzCI7x53uHRuxC6aJTpotuXVnwZnV7sRr5Iwh9HZ0uqej6k_11ELMEajBWFl1leXZ-tbb9Ir7Tp5pMSeUA82OMfPYMd8JYPa82LDdvem7f7rqlKSs4cRZPMbE4PLrEnmdWHoIK0WiIjkmfs3GBfi6ZZjIl-Gvo0R6u1wWvGoeA3Jk4kVk" alt="Jordan Smith" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 ml-1">Jordan Smith (AI Buyer)</p>
              <div className="bg-white dark:bg-slate-800 p-4 rounded-xl rounded-tl-none shadow-sm border border-slate-200 dark:border-slate-700/50">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  I understand the value proposition of your platform, but the $120k annual fee is significantly above our budgeted allocation for this fiscal year. We're looking at a 15% reduction to align with our procurement mandates. Can you work with that?
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-4 max-w-[80%] ml-auto flex-row-reverse">
            <div className="size-10 rounded-lg bg-primary flex-shrink-0 flex items-center justify-center text-white">
              <span className="material-symbols-outlined">person</span>
            </div>
            <div className="space-y-1 flex flex-col items-end">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">Seller (You)</p>
              <div className="bg-primary p-4 rounded-xl rounded-tr-none shadow-sm text-white">
                <p className="text-sm leading-relaxed">
                  Jordan, I appreciate you being direct about the budget. While we don't typically offer a 15% discount on the base price, I'm open to looking at the service-level agreement or perhaps extending the term to three years to bring that annual cost closer to your target.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Input Area */}
        <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="relative flex items-center gap-2 max-w-4xl mx-auto">
            <button className="p-2 text-slate-400 hover:text-primary">
              <span className="material-symbols-outlined">add_circle</span>
            </button>
            <div className="relative flex-1">
              <textarea className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 resize-none text-slate-900 dark:text-slate-100 placeholder-slate-500" placeholder="Type your response..." rows={1}></textarea>
            </div>
            <button className="size-11 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      </section>

      {/* Right Panel: Real-time Analytics */}
      <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-2 text-primary mb-6">
            <span className="material-symbols-outlined">insights</span>
            <h3 className="font-bold text-sm tracking-wider uppercase">Live Analytics</h3>
          </div>
          <div className="space-y-6">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/30">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Words Per Minute</span>
                <span className="text-xs font-bold text-green-500">Normal</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">128</span>
                <span className="text-xs text-slate-500 mb-1">wpm</span>
              </div>
            </div>
            {/* Monologue Alert */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-600 mb-2">
                <span className="material-symbols-outlined text-sm">warning</span>
                <span className="text-xs font-bold uppercase tracking-wider">Monologue Alert</span>
              </div>
              <p className="text-xs leading-relaxed text-amber-700 dark:text-amber-400">
                Your last response was 45% longer than average. Ask an open-ended question.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
