export const ReportsPage = () => {
  return (
    <div className="max-w-[1440px] mx-auto w-full p-6 md:p-10 space-y-8">
      {/* Header & Overall Score */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-black leading-tight tracking-[-0.033em]">Session Report: Enterprise Sales Pitch</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-normal">Completed on Oct 24, 2023 • Duration: 14m 32s</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center justify-center rounded-xl h-12 px-6 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-bold hover:bg-slate-200 transition-colors">
            <span className="material-symbols-outlined mr-2">refresh</span>
            Review Again
          </button>
          <button className="flex items-center justify-center rounded-xl h-12 px-6 bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity">
            <span className="material-symbols-outlined mr-2">download</span>
            Download PDF
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Overall Score</p>
          <div className="flex items-baseline gap-2">
            <p className="text-slate-900 dark:text-slate-100 text-3xl font-bold">85/100</p>
            <span className="text-green-600 dark:text-green-400 text-sm font-bold">+5.2%</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Customer Sentiment</p>
          <p className="text-slate-900 dark:text-slate-100 text-3xl font-bold">Positive</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Key Objections</p>
          <p className="text-slate-900 dark:text-slate-100 text-3xl font-bold">3 Resolved</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Talk Ratio</p>
          <p className="text-slate-900 dark:text-slate-100 text-3xl font-bold">45/55</p>
        </div>
      </div>

      {/* 3-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Competency Breakdown */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-full">
            <h3 className="text-slate-900 dark:text-slate-100 font-bold mb-6">Competency Breakdown</h3>
            <div className="space-y-8">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Empathy</span>
                  <span className="text-slate-900 dark:text-slate-100 font-bold">92%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Product Knowledge</span>
                  <span className="text-slate-900 dark:text-slate-100 font-bold">78%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Objection Handling</span>
                  <span className="text-slate-900 dark:text-slate-100 font-bold">85%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Closing Technique</span>
                  <span className="text-slate-900 dark:text-slate-100 font-bold">64%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="bg-primary/40 h-full rounded-full" style={{ width: '64%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Transcript Viewer */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col h-[600px]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-slate-900 dark:text-slate-100 font-bold">Transcript Viewer</h3>
              <button className="text-primary text-sm font-bold">Search</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">02:14</span>
                  <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded">KEY MOMENT</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm"><span className="font-bold text-slate-900 dark:text-slate-100">AI Prospect:</span> "Our current solution is meeting our needs. Why should we consider a migration now?"</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">02:25</span>
                  <span className="text-xs font-bold text-green-600 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 rounded">GOOD RESPONSE</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm"><span className="font-bold text-slate-900 dark:text-slate-100">You:</span> "I understand that stability is important. Many of our clients felt the same until they realized they were losing 15% efficiency on manual data entry that DealSim automates."</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">04:40</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm"><span className="font-bold text-slate-900 dark:text-slate-100">AI Prospect:</span> "Tell me more about the security protocols for enterprise deployments."</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">05:02</span>
                  <span className="text-xs font-bold text-yellow-600 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 rounded">HINT USED</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm"><span className="font-bold text-slate-900 dark:text-slate-100">You:</span> "We are SOC2 Type II compliant and offer end-to-end encryption for all data in transit and at rest."</p>
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Summary & Takeaways */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
            <div>
              <h3 className="text-slate-900 dark:text-slate-100 font-bold mb-4">Summary</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                The session was highly productive. You successfully navigated initial resistance by focusing on the unique ROI metrics of our automation suite. The prospect showed high interest in the security overview, though your explanation of the integration phase could be more concise. Overall, you controlled the tempo of the conversation well and secured a clear next step.
              </p>
            </div>
            <hr className="border-slate-100 dark:border-slate-800"/>
            <div>
              <h3 className="text-slate-900 dark:text-slate-100 font-bold mb-4">Key Takeaways</h3>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="size-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Strong use of social proof during the objection phase.</p>
                </li>
                <li className="flex gap-3">
                  <div className="size-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Effective transition from discovery to product demonstration.</p>
                </li>
                <li className="flex gap-3">
                  <div className="size-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm font-bold">priority_high</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Work on condensing the technical architecture pitch to under 2 minutes.</p>
                </li>
                <li className="flex gap-3">
                  <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-sm font-bold">lightbulb</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Next time, try asking about their current implementation timeline earlier.</p>
                </li>
              </ul>
            </div>
          </div>
          {/* Recommendations/Next Steps */}
          <div className="rounded-xl p-6 bg-primary text-white space-y-4">
            <h3 className="font-bold text-lg">Recommended Training</h3>
            <p className="text-primary-100 text-sm">Based on your session, we recommend the "Advanced Objection Handling" module to increase your closing score.</p>
            <button className="w-full bg-white text-primary rounded-lg py-2 text-sm font-bold hover:bg-slate-50 transition-colors">Start Training</button>
          </div>
        </div>
      </div>
    </div>
  );
};
