import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { Session, Simulation } from '../types/api';

export const ReportsPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [generatingStrategy, setGeneratingStrategy] = useState(false);
  const [strategyMoves, setStrategyMoves] = useState<string[] | null>(null);

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

  const { data: sessions, isLoading: sessionsLoading } = useQuery<Session[]>({
    queryKey: ['user-sessions'],
    queryFn: () => apiClient.get('/sessions'),
  });

  const session = sessionId 
    ? sessions?.find(s => (s._id || (s as any).id) === sessionId)
    : sessions?.[0];

  if (sessionsLoading) {
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

  const simulation = session.simulationId as Simulation | undefined;
  const persona = simulation?.personaId && typeof simulation.personaId === 'object' 
    ? (simulation.personaId as any) 
    : undefined;
  const evaluation = session.evaluation;
  
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

      {/* AI Coaching Insights Section */}
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
              {evaluation && evaluation.overallScore !== undefined ? evaluation.overallScore : '—'}/100
            </p>
            <span className="text-green-600 dark:text-green-400 text-sm font-bold">+5.2%</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Customer Sentiment</p>
          <p className="text-slate-900 dark:text-slate-100 text-3xl font-bold">{evaluation?.sentiment || 'Positive'}</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Key Objections</p>
          <p className="text-slate-900 dark:text-slate-100 text-3xl font-bold">{evaluation?.objectionsResolved !== undefined ? evaluation.objectionsResolved : 0} Resolved</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Talk Ratio</p>
          <p className="text-slate-900 dark:text-slate-100 text-3xl font-bold">
            {evaluation?.talkRatio ? `${evaluation.talkRatio.seller}/${evaluation.talkRatio.buyer}` : '45/55'}
          </p>
        </div>
      </div>

      {/* 3-Column Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
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
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col h-[600px]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-slate-900 dark:text-slate-100 font-bold">Transcript Viewer</h3>
              <button className="text-primary text-sm font-bold">Search</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                        {t.speaker === 'seller' ? 'You' : (persona?.name || 'AI Prospect')}:
                      </span>{' '}
                      {t.content}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Column 3: Summary & Takeaways */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
            <div>
              <h3 className="text-slate-900 dark:text-slate-100 font-bold mb-4">Summary</h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                {cleanSummary(session.summary?.overallSummary || 'The session was highly productive.')}
              </p>
            </div>
            <hr className="border-slate-100 dark:border-slate-800"/>
            <div>
              <h3 className="text-slate-900 dark:text-slate-100 font-bold mb-4">Key Takeaways</h3>
              <ul className="space-y-4">
                 {evaluation?.feedback?.strengths?.map((s: string, i: number) => (
                    <li key={i} className="flex gap-3">
                      <div className="size-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-sm font-bold">check</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{s}</p>
                    </li>
                  ))}
                  {evaluation?.feedback?.weaknesses?.map((w: string, i: number) => (
                    <li key={i} className="flex gap-3">
                      <div className="size-6 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-sm font-bold">priority_high</span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{w}</p>
                    </li>
                  ))}
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
          {/* Recommendations/Next Steps */}
          <div className="rounded-xl p-6 bg-primary text-white space-y-4 shadow-lg shadow-primary/20">
            <h3 className="font-bold text-lg">Recommended Training</h3>
            <p className="text-primary-100 text-sm opacity-90">Based on your session, we recommend the "Advanced Objection Handling" module to increase your closing score.</p>
            <button className="w-full bg-white text-primary rounded-lg py-2 text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">Start Training</button>
          </div>
        </div>
      </div>
    </div>
  );
};
