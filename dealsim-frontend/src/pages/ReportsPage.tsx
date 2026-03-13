import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { Session, Simulation } from '../types/api';

export const ReportsPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

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

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Overall Score</p>
          <div className="flex items-baseline gap-2">
            <p className="text-slate-900 dark:text-slate-100 text-3xl font-bold">{evaluation?.overallScore || '—'}/100</p>
            <span className="text-green-600 dark:text-green-400 text-sm font-bold">+5.2%</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Customer Sentiment</p>
          <p className="text-slate-900 dark:text-slate-100 text-3xl font-bold">{(evaluation as any)?.sentiment || 'Positive'}</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Key Objections</p>
          <p className="text-slate-900 dark:text-slate-100 text-3xl font-bold">{(evaluation as any)?.objectionsResolved || 3} Resolved</p>
        </div>
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Talk Ratio</p>
          <p className="text-slate-900 dark:text-slate-100 text-3xl font-bold">
            {(evaluation as any)?.talkRatio ? `${(evaluation as any).talkRatio.seller}/${(evaluation as any).talkRatio.buyer}` : '45/55'}
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
              {evaluation?.competencyScores ? Object.entries(evaluation.competencyScores).map(([name, score]) => (
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
                <p className="text-xs text-slate-400 italic">No competency data available.</p>
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
                {session.summary?.overallSummary || 'The session was highly productive.'}
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
