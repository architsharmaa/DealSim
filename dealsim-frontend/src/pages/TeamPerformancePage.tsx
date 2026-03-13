import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import type { TeamPerformance, Session, Simulation } from '../types/api';

const EmployeeSessionsModal = ({ userId, userName, onClose }: { userId: string, userName: string, onClose: () => void }) => {
  const navigate = useNavigate();
  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ['user-sessions', userId],
    queryFn: () => apiClient.get(`/sessions?userId=${userId}`)
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-2xl p-8 shadow-2xl border border-slate-200 dark:border-slate-800 scale-in-center overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Performance History</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Detailed session list for <span className="text-primary font-black">{userName}</span></p>

        <div className="max-h-[400px] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : !sessions || sessions.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400 font-bold italic">No sessions completed yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <div key={s._id} className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 flex items-center justify-between hover:border-primary/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <span className="material-symbols-outlined text-xl">play_circle</span>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white">{(s.simulationId as Simulation).name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(s.startedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-900 dark:text-white">
                          {s.evaluation?.overallScore !== undefined ? `${s.evaluation.overallScore}%` : '—'}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</p>
                      </div>
                      {s.status === 'evaluated' ? (
                        <button 
                          onClick={() => navigate(`/reports/${s._id}`)}
                          className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-sm"
                        >
                          View Report
                        </button>
                      ) : (
                        <span className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-xl font-bold text-[10px] uppercase tracking-widest">
                          {s.status.replace('-', ' ')}
                        </span>
                      )}
                    </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const TeamPerformancePage = () => {
  const [selectedEmp, setSelectedEmp] = useState<{ id: string, name: string } | null>(null);
  const { data: teamStats, isLoading } = useQuery<TeamPerformance>({
    queryKey: ['team-performance'],
    queryFn: () => apiClient.get<TeamPerformance>('/analytics/team-performance')
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl w-full mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Team Performance</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Monitor the proficiency and growth of your organization.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-primary/10 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Team Avg Score</p>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black text-slate-900 dark:text-white">{teamStats?.teamAvgScore || 0}%</span>
            <span className="material-symbols-outlined text-primary mb-2">trending_up</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-primary/10 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Completions</p>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-black text-slate-900 dark:text-white">{teamStats?.totalCompletions || 0}</span>
            <span className="material-symbols-outlined text-emerald-500 mb-2">check_circle</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-primary to-indigo-600 p-8 rounded-[2.5rem] shadow-xl shadow-primary/20 text-white">
          <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-4">Top Performer</p>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <span className="text-xl font-black">{teamStats?.employeePerformance[0]?.name.charAt(0) || '?'}</span>
            </div>
            <div>
              <p className="font-black text-lg leading-tight">{teamStats?.employeePerformance[0]?.name || 'N/A'}</p>
              <p className="text-xs font-bold text-white/70">{teamStats?.employeePerformance[0]?.avgScore || 0}% Avg Proficiency</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-primary/10 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-primary/5">
          <h3 className="text-xl font-black text-slate-900 dark:text-white">Organization Leaderboard</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center w-16">Rank</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Employee</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Sessions</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Avg Score</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Growth</th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {teamStats?.employeePerformance.map((emp, index) => (
                <tr key={emp._id} className="hover:bg-primary/[0.01] transition-colors group">
                  <td className="px-8 py-6 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-black text-sm ${
                      index === 0 ? 'bg-amber-100 text-amber-600' :
                      index === 1 ? 'bg-slate-100 text-slate-600' :
                      index === 2 ? 'bg-orange-100 text-orange-600' :
                      'text-slate-400'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full border border-primary/10 overflow-hidden bg-primary/5 flex items-center justify-center shrink-0">
                        {emp.avatarUrl ? (
                          <img className="h-full w-full object-cover" src={emp.avatarUrl} alt={emp.name} />
                        ) : (
                          <span className="text-sm font-black text-primary">{emp.name.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{emp.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{emp.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center text-sm font-bold text-slate-600 dark:text-slate-400">
                    {emp.sessionsCompleted}
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-black text-slate-900 dark:text-white">{emp.avgScore}%</span>
                      <div className="w-16 h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${emp.avgScore}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                      emp.skillGrowth >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {emp.skillGrowth >= 0 ? '+' : ''}{emp.skillGrowth}%
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => setSelectedEmp({ id: emp._id, name: emp.name })}
                      className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                      title="View Session History"
                    >
                      <span className="material-symbols-outlined">history</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEmp && (
        <EmployeeSessionsModal 
          userId={selectedEmp.id} 
          userName={selectedEmp.name} 
          onClose={() => setSelectedEmp(null)} 
        />
      )}
    </div>
  );
};
