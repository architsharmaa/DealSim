import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api/client';
import type { Simulation, Session } from '../types/api';
import { useSessionSocket } from '../hooks/useSessionSocket';

export const SessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Setup state
  const [showSetup, setShowSetup] = useState(!sessionId || sessionId === 'new');
  const [availableSimulations, setAvailableSimulations] = useState<Simulation[]>([]);
  const [selectedSimulationId, setSelectedSimulationId] = useState('');
  const [starting, setStarting] = useState(false);

  // Session state
  const [session, setSession] = useState<Session | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Live Analytics from WebSocket
  const { liveAnalytics, isSocketConnected } = useSessionSocket(sessionId === 'new' ? undefined : sessionId);
  const latestSnapshot = liveAnalytics || session?.analyticsSnapshots?.[session.analyticsSnapshots.length - 1];

  // Load setup data
  useEffect(() => {
    if (showSetup) {
      apiClient.get<Simulation[]>('/simulations')
        .then((sims) => {
          setAvailableSimulations(sims);
          
          // Handle pre-selected simulation from query params
          const params = new URLSearchParams(location.search);
          const sid = params.get('simulationId');
          if (sid && (sessionId === 'new' || !sessionId)) {
            setSelectedSimulationId(sid);
            // Trigger auto-start
            handleStart(sid);
          }
        });
    }
  }, [showSetup, location.search]);

  // Load existing session
  useEffect(() => {
    if (sessionId && sessionId !== 'new') {
      apiClient.get<Session>(`/sessions/${sessionId}`).then((data) => {
        setSession(data);
        setShowSetup(false);
      }).catch(() => navigate('/dashboard'));
    }
  }, [sessionId]);

  // Auto-scroll chat
  useEffect(() => {
    if (session?.transcripts) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [session?.transcripts]);

  // Timer
  useEffect(() => {
    if (session?.status === 'active' && session.startedAt) {
      const start = new Date(session.startedAt).getTime();
      const interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - start) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [session?.status, session?.startedAt]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const getSpeakerStyles = (speaker: string = '') => {
    const s = speaker || 'Unknown';
    if (s === 'seller') return { bg: 'bg-slate-900 dark:bg-white', text: 'text-white dark:text-slate-900', label: 'Field Representative (You)' };
    if (s === 'narrator') return { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-400', label: 'System' };
    
    // Hash-based color for personas
    const colors = [
      'from-primary to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-600',
      'from-rose-500 to-pink-600',
      'from-violet-500 to-purple-600'
    ];
    let hash = 0;
    for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
    const color = colors[Math.abs(hash) % colors.length];

    return { bg: `bg-gradient-to-br ${color}`, text: 'text-white', label: s };
  };

  // Start session
  const handleStart = async (overrideId?: string) => {
    const targetId = overrideId || selectedSimulationId;
    if (!targetId || starting) return;
    setStarting(true);
    try {
      const data = await apiClient.post<Session>('/sessions', {
        simulationId: targetId,
        assignmentId: new URLSearchParams(location.search).get('assignmentId')
      });
      navigate(`/session/${data._id || data.id}`, { replace: true });
    } catch (err) {
      console.error('Failed to start session:', err);
    } finally {
      setStarting(false);
    }
  };

  // Send message
  const handleSend = async () => {
    if (!message.trim() || sending || !session) return;
    const sid = sessionId !== 'new' ? sessionId : (session._id || (session as any).sessionId);
    setSending(true);
    try {
      const data = await apiClient.post<Session>(
        `/sessions/${sid}/message`,
        { message: message.trim() }
      );
      setSession(data);
      setMessage('');
      textareaRef.current?.focus();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  // End session
  const handleEnd = async () => {
    if (!session) return;
    const sid = sessionId !== 'new' ? sessionId : (session._id || (session as any).sessionId);
    setEnding(true);
    try {
      const data = await apiClient.post<Session>(`/sessions/${sid}/end`);
      setSession(data);
    } catch (err) {
      console.error('Failed to end session:', err);
    } finally {
      setEnding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const simulation = session?.simulationId as Simulation | undefined;
  const persona = simulation?.personaId as any;
  const context = simulation?.contextId as any;

  // Setup Modal
  if (showSetup) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-8">
        <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8">
          {starting ? (
            <div className="flex flex-col items-center justify-center py-10 animate-in fade-in duration-500">
              <div className="relative mb-8">
                <div className="size-20 rounded-[2rem] border-4 border-primary/20 animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="animate-spin text-3xl text-primary material-symbols-outlined">skia_shadow</span>
                </div>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-2">Establishing Protocol</h2>
              <p className="text-xs text-slate-500 font-medium px-10 text-center leading-relaxed italic">Synchronizing tactical behavior models and deal context variables...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-10">
                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-3xl">terminal</span>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">Initialize Simulation</h2>
                  <p className="text-sm text-slate-500 font-medium">Select a pre-compiled scenario to begin.</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">Available Scenarios</label>
                  <select
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer"
                    value={selectedSimulationId}
                    onChange={(e) => setSelectedSimulationId(e.target.value)}
                  >
                    <option value="">Select a scenario...</option>
                    {availableSimulations.map((s) => (
                      <option key={s._id || s.id} value={s._id || s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {selectedSimulationId && (
                  <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 animate-in fade-in slide-in-from-top-2">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">Scenario Details</p>
                    {availableSimulations.find(s => (s._id || s.id) === selectedSimulationId) && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          Buyer: <span className="text-slate-900 dark:text-slate-100">{(availableSimulations.find(s => (s._id || s.id) === selectedSimulationId)?.personaId as any)?.name}</span>
                        </p>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                          Context: <span className="text-slate-900 dark:text-slate-100">{(availableSimulations.find(s => (s._id || s.id) === selectedSimulationId)?.contextId as any)?.product}</span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleStart()}
                disabled={!selectedSimulationId || starting}
                className="mt-10 w-full py-4 bg-primary text-white rounded-2xl font-black text-sm hover:translate-y-[-2px] active:translate-y-[1px] transition-all shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined">play_circle</span> Start Roleplay Session
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // Main Session View
  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-slate-950">
      {/* Left Panel: Simulation Info */}
      <aside className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="flex items-center gap-2 text-primary mb-10">
            <span className="material-symbols-outlined">info</span>
            <h3 className="font-black text-[10px] tracking-[0.2em] uppercase">Scenario Intel</h3>
          </div>
          
          {simulation && (
            <div className="space-y-8">
              <div className="flex flex-col items-center text-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                <div className="size-24 rounded-3xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-3xl font-black mb-4 shadow-2xl shadow-primary/30">
                  {persona?.name?.charAt(0)}
                </div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{persona?.name}</h4>
                <p className="text-primary font-bold text-xs mt-1 uppercase tracking-widest">{persona?.role}, {persona?.company}</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Personality Traits</p>
                  <div className="flex flex-wrap gap-1.5">
                    {persona?.personalityTraits?.map((t: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold rounded-lg border border-slate-200/50 dark:border-slate-700/50 shadow-sm">{t}</span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Deal Context</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white">{context?.product}</p>
                  <p className="text-xs font-bold text-slate-500 mt-1 uppercase">{context?.salesStage}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {session?.status === 'active' && (
          <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950">
            <button
              onClick={handleEnd}
              disabled={ending}
              className="w-full py-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-sm hover:bg-red-500 hover:text-white transition-all duration-300 flex items-center justify-center gap-3 border border-red-500/20 shadow-lg shadow-red-500/5"
            >
              {ending ? (
                <span className="animate-spin material-symbols-outlined">progress_activity</span>
              ) : (
                <><span className="material-symbols-outlined">cancel</span> Terminate Session</>
              )}
            </button>
          </div>
        )}
      </aside>

      {/* Main Panel: Chat */}
      <section className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900/30 overflow-hidden border-r border-slate-200 dark:border-slate-800">
        <header className="px-8 py-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">forum</span>
            </div>
            <div>
              <h2 className="font-black text-lg text-slate-900 dark:text-white leading-none">
                {simulation?.name || 'Simulation Session'}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live Roleplay Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Elapsed Time</span>
              <span className="text-sm font-black text-slate-900 dark:text-white font-mono">{formatTime(elapsed)}</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800`}>
              <span className={`w-2 h-2 rounded-full ${session?.status === 'active' ? 'bg-primary animate-pulse shadow-[0_0_8px_rgba(48,125,232,0.6)]' : 'bg-slate-400'}`}></span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                {session?.status === 'active' ? 'Link Established' : 'Session Terminated'}
              </span>
            </div>
          </div>
        </header>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar scroll-smooth">
          {session?.transcripts.map((t: any, i: number) => {
            const isSeller = t.speaker === 'seller';
            const isNarrator = t.speaker === 'narrator';
            const styles = getSpeakerStyles(t.speaker);

            if (isNarrator) {
              return (
                <div key={i} className="flex justify-center">
                  <div className="bg-slate-100 dark:bg-slate-900/50 px-6 py-2 rounded-full border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold text-slate-500 italic">{t.content}</p>
                  </div>
                </div>
              );
            }

            return (
              <div key={i} className={`flex items-start gap-6 max-w-[85%] ${isSeller ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`size-12 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-lg transition-transform hover:scale-110 duration-300 ${styles.bg} ${styles.text}`}>
                  {isSeller ? (
                    <span className="material-symbols-outlined">person</span>
                  ) : (
                    <span className="font-black text-lg">{t.speaker.charAt(0)}</span>
                  )}
                </div>
                <div className={`space-y-2 ${isSeller ? 'flex flex-col items-end text-right' : ''}`}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">
                    {styles.label}
                  </p>
                  <div className={`p-6 rounded-[2rem] shadow-xl ${
                    isSeller
                      ? 'bg-primary rounded-tr-none text-white shadow-primary/20'
                      : 'bg-white dark:bg-slate-900 rounded-tl-none border border-slate-200 dark:border-slate-800'
                  }`}>
                    <p className="text-sm font-medium leading-relaxed">
                      {t.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          {sending && (
            <div className="flex items-start gap-6 max-w-[85%] animate-in fade-in slide-in-from-left-4">
              <div className="size-12 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex-shrink-0 flex items-center justify-center text-white font-black text-lg">
                {persona?.name?.charAt(0) || 'B'}
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">{persona?.name}</p>
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] rounded-tl-none border border-slate-200 dark:border-slate-800 shadow-xl">
                  <div className="flex gap-2">
                    {[0, 150, 300].map(delay => (
                      <span key={delay} className="w-2.5 h-2.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }}></span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        {session?.status === 'active' ? (
          <footer className="p-8 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 z-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
            <div className="max-w-4xl mx-auto flex items-center gap-4">
              <div className="relative flex-1 group">
                <textarea
                  ref={textareaRef}
                  className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-3xl px-8 py-4 text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:ring-4 focus:ring-primary/10 transition-all resize-none shadow-inner"
                  placeholder={`Respond to ${persona?.name}...`}
                  rows={1}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sending}
                />
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-focus-within:border-primary/20 pointer-events-none transition-colors"></div>
              </div>
              <button
                onClick={handleSend}
                disabled={!message.trim() || sending}
                className="size-14 rounded-[1.5rem] bg-primary text-white flex items-center justify-center hover:bg-primary/90 hover:scale-110 active:scale-95 transition-all shadow-2xl shadow-primary/30 disabled:opacity-50 disabled:grayscale"
              >
                <span className="material-symbols-outlined text-2xl">send</span>
              </button>
            </div>
          </footer>
        ) : (session?.status === 'evaluated' || session?.status === 'completed') && (
          <footer className="p-8 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <span className="material-symbols-outlined">verified</span>
              </div>
              <div>
                <p className="text-lg font-black text-slate-900 dark:text-white">Roleplay Completed</p>
                <p className="text-sm text-slate-500 font-medium">Review the generated diagnostics in the analytics panel.</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate(`/reports/${session._id}`)}
                  className="mt-2 px-10 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all border border-slate-200 dark:border-slate-700"
                >View Full Report</button>
                <button
                  onClick={() => navigate('/simulations')}
                  className="mt-2 px-10 py-3.5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:translate-y-[-2px] transition-all shadow-xl shadow-primary/20"
                >Return to Scenarios</button>
              </div>
            </div>
          </footer>
        )}
      </section>

      {/* Right Panel: Performance & Diagnostics */}
      <aside className="w-96 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col overflow-y-auto">
        <div className="p-8 space-y-10">
          <div className="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined">analytics</span>
            <h3 className="font-black text-[10px] tracking-[0.2em] uppercase">
              {session?.status === 'evaluated' ? 'Performance Scorecard' : 'Live Diagnostics'}
            </h3>
          </div>

          {simulation?.committeePersonaIds && (simulation.committeePersonaIds as any[]).length > 0 && (
            <div className="space-y-4">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Participants</p>
               <div className="space-y-3">
                 {[persona, ...(simulation.committeePersonaIds as any[])].filter(Boolean).map((p: any) => {
                    const name = p.name || (typeof p === 'string' ? p : 'Unknown');
                    const role = p.role || 'Stakeholder';
                    const styles = getSpeakerStyles(name);
                    return (
                      <div key={p._id || p.id || name} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                        <div className={`size-8 rounded-lg flex items-center justify-center font-black text-xs ${styles.bg} ${styles.text}`}>
                          {name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900 dark:text-white leading-none">{name}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">{role}</p>
                        </div>
                      </div>
                    );
                 })}
               </div>
            </div>
          )}

          {!session?.evaluations?.length && !ending && (
            <div className="space-y-6">
              {/* Live Analytics Dashboard */}
              <div className="grid grid-cols-1 gap-4">
                {/* Sentiment & Talk Ratio Row */}
                <div className="flex gap-4">
                  <div className="flex-1 p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <span className="material-symbols-outlined text-sm">mood</span> Sentiment
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className={`text-2xl font-black uppercase tracking-tight ${
                        latestSnapshot?.buyerSentiment === 'positive' ? 'text-emerald-500' :
                        latestSnapshot?.buyerSentiment === 'negative' ? 'text-red-500' :
                        'text-slate-900 dark:text-white'
                      }`}>
                        {latestSnapshot?.buyerSentiment || 'Neutral'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">pie_chart</span> Talk Ratio
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">{latestSnapshot?.talkRatio || 0}%</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">seller</span>
                    </div>
                  </div>
                </div>

                {/* WPM & Monologue Row */}
                <div className="p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                  {latestSnapshot?.monologueFlag && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black px-3 py-1 uppercase tracking-widest transform rotate-45 translate-x-4 translate-y-2">Monologue</div>
                  )}
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">speed</span> Speaking Speed
                  </p>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-black text-slate-900 dark:text-white">{latestSnapshot?.wpm || 0}</span>
                    <span className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-widest pl-1">wpm</span>
                  </div>
                </div>

                {/* Filler Words */}
                <div className="p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-sm">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">warning</span> Filler Words (Live)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {latestSnapshot?.fillerWords && Object.keys(latestSnapshot.fillerWords).length > 0 ? (
                      Object.entries(latestSnapshot.fillerWords).map(([word, count]) => (
                        <span key={word} className="px-3 py-1 bg-red-500/10 text-red-500 text-[10px] font-black rounded-lg border border-red-500/20 shadow-sm uppercase tracking-tighter">
                          {word} ({count as any})
                        </span>
                      ))
                    ) : (
                      <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black rounded-lg border border-emerald-500/20 shadow-sm uppercase tracking-tighter">
                        Clean Speech
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Session Core Info */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Engagement Metadata</p>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 rounded-3xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Turns</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{session?.transcripts.length || 0}</p>
                   </div>
                   <div className="p-4 rounded-3xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Time</p>
                    <p className="text-xl font-black text-slate-900 dark:text-white font-mono">{formatTime(elapsed)}</p>
                   </div>
                </div>
              </div>
            </div>
          )}

          {ending && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
              <div className="relative mb-10">
                <div className="size-24 rounded-[2rem] border-4 border-primary/20 animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="animate-spin text-4xl text-primary material-symbols-outlined">skia_shadow</span>
                </div>
              </div>
              <h4 className="text-xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Compiling Results...</h4>
              <p className="text-sm text-slate-500 font-medium px-10 leading-relaxed">AI is synthesizing the transcript and computing competency scores based on the rubric.</p>
            </div>
          )}

          {session?.evaluations?.[0] && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="relative p-1 bg-gradient-to-br from-primary to-indigo-600 rounded-[3rem] shadow-2xl shadow-primary/20">
                <div className="bg-white dark:bg-slate-950 rounded-[2.8rem] p-8 text-center">
                  <span className="text-[12px] font-black text-primary uppercase tracking-[0.3em] block mb-4">Overall Score</span>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-7xl font-black text-slate-900 dark:text-white tabular-nums">
                      {session.evaluations[0].overallScore || '—'}
                    </span>
                    <span className="text-lg font-bold text-slate-400 mt-6">/100</span>
                  </div>
                </div>
              </div>

              {session.summary && (
                <div className="p-6 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">subject</span> Executive Summary
                  </p>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
                    {session.summary.overallSummary}
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {session.evaluations[0].feedback?.strengths?.length > 0 && (
                  <div className="p-6 rounded-[2.5rem] bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm font-black">done_all</span> Key Wins
                    </p>
                    <ul className="space-y-4">
                      {session.evaluations[0].feedback.strengths.map((s: any, i: number) => {
                        const isObj = typeof s === 'object' && s !== null;
                        const point = isObj ? s.point : s;
                        const evidence = isObj ? s.evidence : null;
                        return (
                          <li key={i} className="space-y-2 group">
                            <div className="flex gap-3 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 leading-relaxed">
                              <span className="size-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black flex-shrink-0 group-hover:scale-110 transition-transform">✓</span>
                              {point}
                            </div>
                            {evidence && (
                              <div className="ml-8 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-800 dark:text-emerald-300 italic font-medium leading-relaxed relative">
                                <span className="material-symbols-outlined text-[12px] opacity-50 absolute -left-1 -top-1">format_quote</span>
                                {evidence}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {session.evaluations[0].feedback?.weaknesses?.length > 0 && (
                  <div className="p-6 rounded-[2.5rem] bg-red-500/5 border border-red-500/10">
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm font-black">report_problem</span> High Friction
                    </p>
                    <ul className="space-y-4">
                      {session.evaluations[0].feedback.weaknesses.map((w: any, i: number) => {
                        const isObj = typeof w === 'object' && w !== null;
                        const point = isObj ? w.point : w;
                        const evidence = isObj ? w.evidence : null;
                        return (
                          <li key={i} className="space-y-2 group">
                            <div className="flex gap-3 text-[11px] font-bold text-red-700 dark:text-red-400 leading-relaxed">
                              <span className="size-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px] font-black flex-shrink-0 group-hover:scale-110 transition-transform">!</span>
                              {point}
                            </div>
                            {evidence && (
                              <div className="ml-8 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[10px] text-red-800 dark:text-red-300 italic font-medium leading-relaxed relative">
                                <span className="material-symbols-outlined text-[12px] opacity-50 absolute -left-1 -top-1">format_quote</span>
                                {evidence}
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
