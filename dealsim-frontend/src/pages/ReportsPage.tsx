import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../api/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Session, EvaluationFramework, Rubric } from '../types/api';
import { FrameworkComparison } from '../components/FrameworkComparison';

export const ReportsPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [generatingStrategy, setGeneratingStrategy] = useState(false);
  const [strategyMoves, setStrategyMoves] = useState<string[] | null>(null);

  const [frameworkAId, setFrameworkAId] = useState<string>('');
  const [frameworkBId, setFrameworkBId] = useState<string>('');
  const [showComparison, setShowComparison] = useState(false);

  const { data: frameworks } = useQuery<EvaluationFramework[]>({
    queryKey: ['evaluation-frameworks'],
    queryFn: () => apiClient.get('/evaluation-frameworks'),
  });

  const { data: rubrics } = useQuery<Rubric[]>({
    queryKey: ['rubrics'],
    queryFn: () => apiClient.get('/rubrics'),
  });

  const reEvaluateMutation = useMutation({
    mutationFn: ({ sessId, frameworkId }: { sessId: string; frameworkId: string }) => 
      apiClient.post(`/sessions/${sessId}/re-evaluate`, { frameworkId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
    }
  });

  // Helper to clean corrupted summary data (markdown remnants)
  const cleanSummary = (text: string) => {
    if (!text) return '';
    return text
      .replace(/"""json\s*/gi, '')
      .replace(/"""/gi, '')
      .replace(/```json\s*/gi, '')
      .replace(/```/gi, '')
      .replace(/\{\s*"overallSummary":\s*"/i, '')
      .replace(/"\s*,\s*"keyEvents":\s*\[[\s\S]*?\]\s*\}/i, '')
      .trim();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'evaluated': return 'text-emerald-500 bg-emerald-500/10';
      case 'active': return 'text-blue-500 bg-blue-500/10';
      case 'completed': return 'text-amber-500 bg-amber-500/10';
      default: return 'text-slate-400 bg-slate-400/10';
    }
  };

  const { data: directSession, isLoading: directLoading } = useQuery<Session>({
    queryKey: ['session', sessionId],
    queryFn: () => apiClient.get(`/sessions/${sessionId}`),
    enabled: !!sessionId
  });

  const targetUserId = directSession?.userId || undefined;

  const { data: sessions, isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ['user-sessions', targetUserId],
    queryFn: () => apiClient.get(`/sessions${targetUserId ? `?userId=${targetUserId}` : ''}`),
    enabled: !!targetUserId || !sessionId
  });

  const session = sessionId ? directSession : sessions?.[0];
  const isLoading = (sessionId ? directLoading : sessionsLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 text-center">
        <div className="size-20 rounded-3xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 mb-6">
          <span className="material-symbols-outlined text-4xl">analytics</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">No Reports Available</h2>
        <p className="text-slate-500 max-w-xs mt-2">Complete your first simulation session to generate a performance diagnostic report.</p>
        <button 
          onClick={() => navigate('/simulations')}
          className="mt-8 px-8 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          Explore Scenarios
        </button>
      </div>
    );
  }

  const simulation = session?.simulationId as any;
  const originalRubric = simulation?.rubricId;
  
  const allFrameworks = frameworks ? frameworks.map(f => ({ ...f, type: 'Standard' })) : [];
  
  // Add all custom rubrics to the list
  if (rubrics) {
    rubrics.forEach(r => {
      const rId = r._id || (r as any).id;
      if (!allFrameworks.find(f => f._id === rId)) {
        allFrameworks.push({
          ...r,
          _id: rId,
          name: r.name,
          type: 'Custom Rubric'
        } as any);
      }
    });
  }

  // Ensure the original rubric is tagged and at the top of custom group if needed
  if (originalRubric) {
    const rubricId = originalRubric?._id || originalRubric?.id;
    const existing = allFrameworks.find(f => f._id === rubricId);
    if (!existing) {
      allFrameworks.unshift({
          ...originalRubric,
          _id: rubricId,
          name: originalRubric.name,
          type: 'Custom Rubric'
      } as any);
    }
  }

  const persona = simulation?.personaId && typeof simulation.personaId === 'object' 
    ? (simulation.personaId as any) 
    : undefined;
  const evaluation = session.evaluations?.[0];
  
  // Calculate relative time for transcript
  const formatTranscriptTime = (timestamp: string | Date) => {
    const start = new Date(session.startedAt).getTime();
    const current = new Date(timestamp).getTime();
    const diff = Math.max(0, current - start);
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleGenerateStrategy = async () => {
    if (!session?._id) return;
    setGeneratingStrategy(true);
    try {
      const res = await apiClient.post<{ strategy: string[] }>(`/sessions/${session._id}/closer-strategy`);
      setStrategyMoves(res.strategy);
    } catch (err) {
      console.error('Failed to generate strategy:', err);
    } finally {
      setGeneratingStrategy(false);
    }
  };


  const duration = session.endedAt 
    ? Math.floor((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 60000) 
    : 0;

  return (
    <div className="max-w-[1440px] mx-auto w-full p-6 md:p-10 space-y-8 animate-in fade-in duration-700">
      {/* Header & Session Selection */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <h1 className="text-slate-900 dark:text-slate-100 text-4xl font-black leading-tight tracking-[-0.033em]">
              Session Report: {simulation?.name || 'Untitled Session'}
            </h1>
            {sessions && sessions.length > 1 && (
              <select 
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                value={session._id}
                onChange={(e) => navigate(`/reports/${e.target.value}`)}
              >
                {sessions.map(s => (
                  <option key={s._id} value={s._id}>
                    {new Date(s.startedAt).toLocaleDateString()} - {(s.simulationId as any)?.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-normal">
            Completed on {new Date(session.endedAt || session.startedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} • Duration: {duration}m
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate(`/session/new?simulationId=${simulation?._id || (simulation as any)?.id}`)}
            className="flex items-center justify-center rounded-xl h-12 px-6 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-bold hover:bg-slate-200 transition-colors"
          >
            <span className="material-symbols-outlined mr-2">refresh</span>
            Review Again
          </button>
          <button className="flex items-center justify-center rounded-xl h-12 px-6 bg-primary text-white text-sm font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined mr-2">download</span>
            Download PDF
          </button>
        </div>
      </div>

      {session.status === 'active' && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-8 flex flex-col items-center text-center gap-4 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="size-16 rounded-full bg-blue-500 text-white flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-3xl">sensors</span>
          </div>
          <div>
            <h2 className="text-2xl font-black text-blue-900 dark:text-blue-100">Simulation In Progress</h2>
            <p className="text-blue-700/70 dark:text-blue-300/60 max-w-lg mx-auto mt-2">
              This session is currently live. Detailed sales diagnostics, skill scores, and AI coaching insights will be automatically generated as soon as the participant ends the session.
            </p>
          </div>
          <div className="flex gap-4 mt-2">
             <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 rounded-xl text-blue-700 dark:text-blue-300 text-xs font-black uppercase tracking-widest">
                <span className="size-2 rounded-full bg-blue-500 animate-ping"></span>
                Live Transcript Monitoring
             </div>
          </div>
        </div>
      )}

      {/* Methodology Hot-Swap Control */}
      {session.status !== 'active' && (
        <div className="bg-slate-50 dark:bg-slate-900 shadow-inner rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 space-y-8 animate-in fade-in duration-1000">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-widest uppercase mb-2">
                <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                Framework Hot-Swap
              </div>
              <h3 className="text-2xl font-black">Methodology Analysis</h3>
              <p className="text-slate-500 text-sm">Switch or compare different sales methodologies for this transcript.</p>
            </div>
            
            <div className="flex flex-wrap gap-6 items-center">
              {/* Framework A Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Primary Perspective</label>
                <div className="flex gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20">
                   <select 
                      value={frameworkAId} 
                      onChange={(e) => setFrameworkAId(e.target.value)}
                      className="bg-transparent border-none text-xs font-bold px-3 py-1.5 focus:ring-0 cursor-pointer min-w-[200px] dark:text-white appearance-none"
                    >
                      <option value="" className="dark:bg-slate-900">Select Methodology...</option>
                      {['Custom Rubric', 'Standard'].map(group => (
                        <optgroup key={group} label={group === 'Standard' ? "Standard Methodologies" : "Custom Rubrics"} className="dark:bg-slate-900 dark:text-slate-400">
                          {allFrameworks.filter(f => (f as any).type === group).map(f => (
                            <option key={f._id} value={f._id} className="dark:bg-slate-900 dark:text-white">{f.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <button 
                      title="Run Diagnostic Analysis"
                      disabled={!frameworkAId || !session?._id || reEvaluateMutation.isPending}
                      onClick={() => {
                        if (session?._id) {
                          reEvaluateMutation.mutate({ sessId: session._id!, frameworkId: frameworkAId });
                        }
                      }}
                      className={`size-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 ${reEvaluateMutation.isPending ? 'bg-slate-100 animate-pulse' : 'bg-primary text-white hover:scale-105 active:scale-95 shadow-md shadow-primary/20'}`}
                    >
                      {reEvaluateMutation.isPending ? (
                        <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                      ) : (
                        <span className="material-symbols-outlined text-base">analytics</span>
                      )}
                    </button>
                </div>
              </div>

              <div className="pt-5 text-slate-300 font-black text-xs">VS</div>

              {/* Framework B Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Comparison Lens</label>                <div className="flex gap-2 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all focus-within:ring-2 focus-within:ring-primary/20">
                   <select 
                      value={frameworkBId} 
                      onChange={(e) => setFrameworkBId(e.target.value)}
                      className="bg-transparent border-none text-xs font-bold px-3 py-1.5 focus:ring-0 cursor-pointer min-w-[200px] dark:text-white appearance-none"
                    >
                      <option value="" className="dark:bg-slate-900">Select Methodology...</option>
                      {['Custom Rubric', 'Standard'].map(group => (
                        <optgroup key={group} label={group === 'Standard' ? "Standard Methodologies" : "Custom Rubrics"} className="dark:bg-slate-900 dark:text-slate-400">
                          {allFrameworks.filter(f => (f as any).type === group).map(f => (
                            <option key={f._id} value={f._id} className="dark:bg-slate-900 dark:text-white">{f.name}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <button 
                      title="Run Comparison Analysis"
                      disabled={!frameworkBId || !session?._id || reEvaluateMutation.isPending}
                      onClick={() => {
                        if (session?._id) {
                          reEvaluateMutation.mutate({ sessId: session._id!, frameworkId: frameworkBId });
                        }
                      }}
                      className={`size-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30 ${reEvaluateMutation.isPending ? 'bg-slate-100 animate-pulse' : 'bg-primary text-white hover:scale-105 active:scale-95 shadow-md shadow-primary/20'}`}
                    >
                      {reEvaluateMutation.isPending ? (
                        <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                      ) : (
                        <span className="material-symbols-outlined text-base">analytics</span>
                      )}
                    </button>
                </div>
              </div>
              <button 
                onClick={() => setShowComparison(!showComparison)}
                className={`h-12 px-6 rounded-2xl flex items-center gap-3 font-bold text-xs transition-all border ${showComparison 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-lg' 
                  : 'bg-white dark:bg-slate-950 text-slate-600 border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:text-primary shadow-sm'}`}
              >
                <span className="material-symbols-outlined text-lg">
                  {showComparison ? 'visibility_off' : 'compare'}
                </span>
                {showComparison ? 'Hide Comparison' : 'Side-by-Side View'}
              </button>
            </div>
          </div>

          {showComparison && frameworks && (
            <FrameworkComparison 
              session={session}
              frameworkAId={frameworkAId}
              frameworkBId={frameworkBId}
              frameworks={allFrameworks as any}
            />
          )}

          {reEvaluateMutation.isPending && (
            <div className="flex items-center gap-3 text-slate-400 text-xs font-bold justify-center animate-pulse">
              <span className="material-symbols-outlined animate-spin text-sm">sync</span>
              AI is re-calibrating performance using selected methodology...
            </div>
          )}
        </div>
      )}

      {session.coachingInsights && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-1000">
          <div className="lg:col-span-2 rounded-2xl p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">psychology</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">AI Coaching Insights</h3>
                <p className="text-sm text-slate-500">Deconstruct your performance with actionable sales diagnostics.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Missed Discovery</h4>
                <ul className="space-y-3">
                  {session.coachingInsights.missedDiscoveryQuestions.map((q, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <span className="text-primary font-bold">•</span>
                      {q}
                    </li>
                  ))}
                  {session.coachingInsights.missedDiscoveryQuestions.length === 0 && (
                    <li className="text-sm text-slate-400 italic">No discovery items missed.</li>
                  )}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Objection Handling</h4>
                <ul className="space-y-3">
                  {session.coachingInsights.objectionHandling.map((o, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <span className="text-amber-500 font-bold">•</span>
                      {o}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Suggested Questions</h4>
                <div className="flex flex-wrap gap-2">
                  {session.coachingInsights.suggestedQuestions.map((q, i) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300">
                      {q}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Key Strengths</h4>
                <div className="flex flex-wrap gap-2">
                  {session.coachingInsights.conversationStrengths.map((s, i) => (
                    <span key={i} className="px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 rounded-lg text-xs font-bold text-green-700 dark:text-green-400">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-8 bg-slate-900 text-white shadow-xl shadow-slate-900/20 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <span className="material-symbols-outlined text-9xl">warning</span>
            </div>
            
            <div className="relative z-10 space-y-6">
              <div>
                <h3 className="text-xl font-black mb-1">Deal Risk Analysis</h3>
                <p className="text-slate-400 text-sm">Predicted probability of deal stall or loss.</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-4xl font-black">{(session.coachingInsights.dealRiskScore * 100).toFixed(0)}%</span>
                  <span className={`text-xs font-black uppercase tracking-widest px-2 py-1 rounded ${
                    session.coachingInsights.dealRiskScore > 0.6 ? 'bg-red-500 text-white' : 
                    session.coachingInsights.dealRiskScore > 0.3 ? 'bg-amber-500 text-white' : 
                    'bg-green-500 text-white'
                  }`}>
                    {session.coachingInsights.dealRiskScore > 0.6 ? 'High Risk' : 
                     session.coachingInsights.dealRiskScore > 0.3 ? 'Elevated' : 'Low Risk'}
                  </span>
                </div>
                <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ease-out ${
                      session.coachingInsights.dealRiskScore > 0.6 ? 'bg-red-500' : 
                      session.coachingInsights.dealRiskScore > 0.3 ? 'bg-amber-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${session.coachingInsights.dealRiskScore * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  "{session.coachingInsights.dealRiskReason}"
                </p>
              </div>
            </div>

            <div className="relative z-10 space-y-4">
              {!strategyMoves ? (
                <button 
                  onClick={handleGenerateStrategy}
                  disabled={generatingStrategy}
                  className="w-full py-4 bg-white text-slate-900 rounded-xl font-black text-sm hover:translate-y-[-2px] active:translate-y-[0] transition-all disabled:opacity-50 disabled:translate-y-0"
                >
                  {generatingStrategy ? 'Analyzing Deal Factors...' : 'Generate Closer Strategy'}
                </button>
              ) : (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Tactical Next Moves</h4>
                  {strategyMoves.map((move, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                      <span className="text-primary font-bold">{i + 1}</span>
                      <p className="text-xs text-slate-200">{move}</p>
                    </div>
                  ))}
                  <button 
                    onClick={() => setStrategyMoves(null)}
                    className="w-full text-[10px] font-bold text-slate-500 hover:text-slate-300 transition-colors pt-2"
                  >
                    Reset Strategy
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Overall Score</p>
          <div className="flex items-baseline gap-2">
            <p className="text-slate-900 dark:text-slate-100 text-3xl font-bold">
              {evaluation?.overallScore !== undefined ? `${evaluation.overallScore}/100` : (session.status === 'active' ? 'Live' : '—')}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Customer Sentiment</p>
          <p className="text-slate-900 dark:text-slate-100 text-3xl font-bold">{evaluation?.sentiment || (session.status === 'active' ? 'Analyzing...' : '—')}</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Key Objections</p>
          <p className="text-slate-900 dark:text-slate-100 text-3xl font-bold">{evaluation?.objectionsResolved !== undefined ? `${evaluation.objectionsResolved} Resolved` : (session.status === 'active' ? 'Tracking...' : '—')}</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Talk Ratio</p>
          <p className="text-slate-900 dark:text-slate-100 text-3xl font-bold">
            {evaluation?.talkRatio ? `${evaluation.talkRatio.seller}/${evaluation.talkRatio.buyer}` : (session.status === 'active' ? 'Calculating...' : '—')}
          </p>
        </div>
      </div>

      {/* 4-Column Diagnostic Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Column 0: Conversation Timeline */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-full overflow-visible">
            <h3 className="text-slate-900 dark:text-slate-100 font-bold mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">timeline</span>
              Session Timeline
            </h3>
            <div className="relative space-y-10 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/50 before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
              {session.keyEvents && session.keyEvents.length > 0 ? (
                session.keyEvents.map((event, i) => (
                  <div key={i} className="relative flex items-center justify-between gap-6 group">
                    <div className="flex items-center gap-4">
                      {/* Event Marker */}
                      <div className={`absolute left-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white dark:border-slate-900 shadow-md transition-all duration-300 group-hover:scale-110 z-10 ${
                        event.type === 'objection_raised' ? 'bg-red-500 text-white border-red-100 dark:border-red-900/40' :
                        event.type === 'closing_attempt' ? 'bg-green-500 text-white border-green-100 dark:border-green-900/40' :
                        event.type === 'discovery_question' ? 'bg-primary text-white border-primary/20' :
                        'bg-slate-800 text-white border-slate-700'
                      }`}>
                        <span className="material-symbols-outlined text-lg">
                          {event.type === 'discovery_question' ? 'help' :
                           event.type === 'objection_raised' ? 'block' :
                           event.type === 'value_proposition' ? 'verified' :
                           event.type === 'pricing_discussion' ? 'payments' : 'handshake'}
                        </span>
                      </div>
                      
                      {/* Event Content */}
                      <div className="ml-12 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-400 tabular-nums">
                            {formatTranscriptTime(event.timestamp)}
                          </span>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                            event.type === 'objection_raised' ? 'bg-red-500/10 text-red-500' :
                            event.type === 'closing_attempt' ? 'bg-green-500/10 text-green-500' :
                            event.type === 'discovery_question' ? 'bg-primary/10 text-primary' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}>
                            {event.type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-100 font-bold leading-snug">
                          {event.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="pl-12 py-4">
                  <p className="text-xs text-slate-400 italic">No milestones detected.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Column 1: Competency Breakdown */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 h-full">
            <h3 className="text-slate-900 dark:text-slate-100 font-bold mb-6">Competency Breakdown</h3>
            <div className="space-y-8">
              {evaluation?.competencyScores && Object.keys(evaluation.competencyScores).length > 0 ? Object.entries(evaluation.competencyScores).map(([name, score]) => (
                <div key={name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">{name}</span>
                    <span className="text-slate-900 dark:text-slate-100 font-bold">{score}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${Number(score) < 70 ? 'bg-primary/40' : 'bg-primary'}`} 
                      style={{ width: `${score}%` }}
                    ></div>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-400 italic">No competency data available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Column 2: Transcript Viewer */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col min-h-[600px]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-slate-900 dark:text-slate-100 font-bold">Transcript Viewer</h3>
              <button className="text-primary text-sm font-bold">Search</button>
            </div>
            <div className="flex-1 max-h-[600px] overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {session.transcripts.map((t, i) => {
                const highlight = (evaluation as any)?.highlights?.find((h: any) => h.index === i);
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">{formatTranscriptTime(t.timestamp)}</span>
                      {highlight && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          highlight.type === 'GOOD_RESPONSE' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                          highlight.type === 'KEY_MOMENT' ? 'bg-primary/10 text-primary' :
                          'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30'
                        }`}>
                          {highlight.label || highlight.type.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {t.speaker === 'seller' ? 'You' : (persona?.name || 'AI Prospect')}
                      </span>:{' '}
                      {t.content.replace(new RegExp(`^${persona?.name}:\\s*`, 'i'), '')}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Column 3: Summary & Takeaways */}
        <div className="lg:col-span-3 space-y-6">
          <div className="rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
            <div>
              <h3 className="text-slate-900 dark:text-slate-100 font-bold mb-4">Summary</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {session.summary?.overallSummary 
                  ? cleanSummary(session.summary.overallSummary)
                  : (session.status === 'active' 
                      ? 'AI summary will be generated once the session is completed and evaluated.' 
                      : 'No summary available for this session.')}
              </p>
            </div>
            <hr className="border-slate-100 dark:border-slate-800"/>
            <div>
              <h3 className="text-slate-900 dark:text-slate-100 font-bold mb-4">Key Takeaways</h3>
            <ul className="space-y-6">
              {evaluation?.feedback?.strengths?.map((s: any, i: number) => {
                const isObj = typeof s === 'object' && s !== null;
                const point = isObj ? s.point : s;
                const evidence = isObj ? s.evidence : null;
                return (
                  <li key={i} className="space-y-3 group">
                    <div className="flex gap-3">
                      <div className="size-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-100 font-bold leading-snug">{point}</p>
                    </div>
                    {evidence && (
                      <div className="ml-9 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 italic font-medium leading-relaxed relative">
                        <span className="material-symbols-outlined text-[12px] opacity-30 absolute -left-1 -top-1">format_quote</span>
                        {evidence}
                      </div>
                    )}
                  </li>
                );
              })}
              {evaluation?.feedback?.weaknesses?.map((w: any, i: number) => {
                const isObj = typeof w === 'object' && w !== null;
                const point = isObj ? w.point : w;
                const evidence = isObj ? w.evidence : null;
                return (
                  <li key={i} className="space-y-3 group">
                    <div className="flex gap-3">
                      <div className="size-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-sm font-bold">priority_high</span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-100 font-bold leading-snug">{point}</p>
                    </div>
                    {evidence && (
                      <div className="ml-9 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 italic font-medium leading-relaxed relative">
                        <span className="material-symbols-outlined text-[12px] opacity-30 absolute -left-1 -top-1">format_quote</span>
                        {evidence}
                      </div>
                    )}
                  </li>
                );
              })}
                  {(evaluation as any)?.feedback?.recommendations?.map((r: string, i: number) => (
                    <li key={i} className="flex gap-3">
                      <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-sm font-bold">lightbulb</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{r}</p>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Footer */}
      <div className="pt-10 pb-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4 opacity-30 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Session ID</div>
          <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md text-[10px] text-slate-500">{session._id}</code>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</div>
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${getStatusColor(session.status)}`}>
            {session.status}
          </span>
        </div>
      </div>
    </div>
  );
};
