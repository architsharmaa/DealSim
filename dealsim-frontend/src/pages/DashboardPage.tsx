import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { DashboardStats } from '../types/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const DashboardPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const data = await apiClient.get<DashboardStats>('/analytics/dashboard-stats');
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      {/* Welcome Header */}
      <div>
        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Welcome back, <span className="text-primary">{currentUser?.fullName?.split(' ')[0] || 'Alex'}</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
          You have {stats?.assignedSimulations.length || 0} active assignments. Your performance is stable.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white dark:bg-slate-950 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:scale-[1.02] transition-all">
          <div className="flex items-center justify-between mb-6">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Avg Score</span>
            <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <span className="material-symbols-outlined text-2xl">trending_up</span>
            </div>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black text-slate-900 dark:text-white">{stats?.avgScore || 0}%</span>
            <span className={`${(Number(stats?.scoreVariance) || 0) >= 0 ? 'text-emerald-500' : 'text-red-500'} text-sm font-black mb-2 flex items-center gap-1`}>
              <span className="material-symbols-outlined text-sm">{(Number(stats?.scoreVariance) || 0) >= 0 ? 'arrow_upward' : 'arrow_downward'}</span> {Math.abs(Number(stats?.scoreVariance || 0))}%
            </span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 mt-3 tabular-nums">vs {stats?.lastMonthAvgDisplay || 0}% last month</p>
        </div>

        <div className="bg-white dark:bg-slate-950 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:scale-[1.02] transition-all">
          <div className="flex items-center justify-between mb-6">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Sessions Completed</span>
            <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">check_circle</span>
            </div>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black text-slate-900 dark:text-white">{stats?.sessionsCompleted || 0}</span>
            <span className="text-slate-400 text-sm font-black mb-2">this period</span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 mt-3">Target: 30 sessions</p>
        </div>

        <div className="bg-white dark:bg-slate-950 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:scale-[1.02] transition-all">
          <div className="flex items-center justify-between mb-6">
            <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Skill Growth</span>
            <div className="size-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <span className="material-symbols-outlined text-2xl">bolt</span>
            </div>
          </div>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black text-slate-900 dark:text-white">+{stats?.skillGrowth || 0}%</span>
            <span className="text-emerald-500 text-sm font-black mb-2">Excellent</span>
          </div>
          <p className="text-[11px] font-bold text-slate-400 mt-3 font-medium">Negotiation efficiency improved</p>
        </div>
      </div>

      {/* Active Assignments Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Active Assignments</h3>
          <button onClick={() => navigate('/simulations')} className="text-primary text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-1">
            Explore All <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats?.assignedSimulations.map((assignment) => {
            const sim = assignment.simulationId as any;
            return (
              <div key={assignment._id} className="group bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500">
                <div className="h-2 bg-primary"></div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary font-black text-sm">
                        {sim?.personaId?.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 dark:text-white text-sm line-clamp-1">{sim?.personaId?.name || sim?.name || 'Scenario'}</h4>
                        <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">{sim?.personaId?.role || 'Prospect'}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-6 line-clamp-2 min-h-[2rem]">
                     {sim?.contextId?.product || 'Practice Session'}. Focus on handling {sim?.personaId?.resistanceLevel || 'medium'} resistance.
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">schedule</span> 15m</span>
                    </div>
                    <button 
                      onClick={() => navigate(`/session/new?simulationId=${sim?._id || sim?.id}&assignmentId=${assignment._id}`)}
                      className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-110 active:scale-95 transition-all shadow-lg"
                    >
                      Start
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          
          {stats?.assignedSimulations.length === 0 && (
            <div className="col-span-full py-12 bg-slate-50 dark:bg-slate-900/40 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700 mb-3">task_alt</span>
              <p className="font-black text-slate-400 uppercase tracking-widest text-[10px]">No pending assignments</p>
              <button onClick={() => navigate('/simulations')} className="mt-2 text-primary font-bold text-[10px] hover:underline">Launch a practice session</button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Recently Completed List */}
        <div className="xl:col-span-2 space-y-6">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Recent Sessions</h3>
          <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats?.recentSessions.map((session) => (
                <div key={session._id} className="p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-black text-sm">
                      {session.evaluation?.overallScore || '—'}%
                    </div>
                    <div>
                      <h5 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{(session.simulationId as any)?.name || 'Practice Session'}</h5>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
                        {new Date(session.startedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (session.status === 'evaluated' || session.status === 'completed') {
                        navigate(`/reports/${session._id}`);
                      } else {
                        navigate(`/session/${session._id}`);
                      }
                    }} 
                    className="text-slate-300 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined">analytics</span>
                  </button>
                </div>
              ))}
              
              {stats?.recentSessions.length === 0 && (
                <div className="p-10 text-center">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest text-center">Zero flights logged</p>
                </div>
              )}
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-900/30 text-center border-t border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => navigate('/simulations')}
                className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"
              >
                View Full Logs
              </button>
            </div>
          </div>
        </div>

        {/* AI Insights Sidebar */}
        <div className="space-y-6 flex flex-col">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">AI Insights</h3>
          <div className="bg-gradient-to-br from-primary to-indigo-600 p-6 rounded-[2rem] text-white shadow-xl shadow-primary/20 flex-1 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-3">
              <span className="material-symbols-outlined text-2xl">lightbulb</span>
              <h4 className="font-black text-[9px] uppercase tracking-widest opacity-80">Instructor Memo</h4>
            </div>
            <p className="text-xs font-bold leading-relaxed italic">
              "Focus on rapport building. {currentUser?.fullName?.split(' ')[0] || 'Archit'}, your last evaluation showed you jumped into technicals too early."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
