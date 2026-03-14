import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { Persona, Context, Rubric, Simulation } from '../types/api';
import { WebhookSettingsModal } from '../components/WebhookSettingsModal';

export const SimulationsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [committeePersonaIds, setCommitteePersonaIds] = useState<string[]>([]);
  const [simulationType, setSimulationType] = useState<'single' | 'committee'>('single');
  const [isCreatingPersona, setIsCreatingPersona] = useState(false);
  const [isCreatingContext, setIsCreatingContext] = useState(false);

  // Queries
  const { data: simulations, isLoading: loadingSims } = useQuery<Simulation[]>({
    queryKey: ['simulations'],
    queryFn: () => apiClient.get('/simulations'),
  });

  const { data: personas } = useQuery<Persona[]>({
    queryKey: ['personas'],
    queryFn: () => apiClient.get('/personas'),
  });

  const { data: contexts } = useQuery<Context[]>({
    queryKey: ['contexts'],
    queryFn: () => apiClient.get('/contexts'),
  });

  const { data: rubrics } = useQuery<Rubric[]>({
    queryKey: ['rubrics'],
    queryFn: () => apiClient.get('/rubrics'),
  });

  const { data: frameworks } = useQuery<any[]>({
    queryKey: ['evaluation-frameworks'],
    queryFn: () => apiClient.get('/evaluation-frameworks'),
  });

  // Create Simulation Mutation
  const createMutation = useMutation({
    mutationFn: (newSim: any) => apiClient.post('/simulations', newSim),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['simulations'] });
      setIsModalOpen(false);
      setCommitteePersonaIds([]);
      setSimulationType('single');
    },
  });

  const quickPersonaMutation = useMutation({
    mutationFn: (newPersona: any) => apiClient.post('/personas', newPersona),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personas'] });
      setIsCreatingPersona(false);
    },
  });

  const quickContextMutation = useMutation({
    mutationFn: (newContext: any) => apiClient.post('/contexts', newContext),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contexts'] });
      setIsCreatingContext(false);
    },
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      personaId: formData.get('personaId'),
      contextId: formData.get('contextId'),
      rubricId: formData.get('rubricId'),
      committeePersonaIds: simulationType === 'committee' ? committeePersonaIds : [],
    };
    createMutation.mutate(data);
  };

  const handleQuickPersonaCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    quickPersonaMutation.mutate({
      name: formData.get('name'),
      role: formData.get('role'),
      company: formData.get('company'),
      priorities: (formData.get('priorities') as string).split(',').map(p => p.trim()),
    });
  };

  const handleQuickContextCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    quickContextMutation.mutate({
      product: formData.get('product'),
      salesStage: formData.get('salesStage'),
      dealSize: formData.get('dealSize'),
      background: formData.get('background'),
    });
  };

  const toggleCommitteeMember = (personaId: string) => {
    setCommitteePersonaIds(prev =>
      prev.includes(personaId)
        ? prev.filter(id => id !== personaId)
        : prev.length < 2 ? [...prev, personaId] : prev // max 2 committee members
    );
  };

  return (
    <div className="p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase">
            <span className="material-symbols-outlined text-[14px]">psychology</span>
            Scenario Orchestration
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Active Simulations</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
            Compiled simulations ready for roleplay. Each simulation is a pre-orchestrated scenario combining persona, context, and rubrics.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group relative bg-primary text-white pl-5 pr-6 py-3.5 rounded-2xl font-bold hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 transition-all flex items-center gap-3 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
          <span className="material-symbols-outlined text-xl">add_circle</span>
          Compile New Simulation
        </button>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/30 p-4 rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Ready Scenarios</span>
            <span className="text-xl font-black text-slate-900 dark:text-white px-1">{simulations?.length || 0}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/personas')} className="text-xs font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="material-symbols-outlined text-sm">person</span> Personas
          </button>
          <button onClick={() => navigate('/contexts')} className="text-xs font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="material-symbols-outlined text-sm">schema</span> Contexts
          </button>
          <button onClick={() => navigate('/rubrics')} className="text-xs font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="material-symbols-outlined text-sm">checklist</span> Rubrics
          </button>
          <div className="w-[1px] h-6 bg-slate-200 dark:border-slate-800 mx-1" />
          <button onClick={() => setIsWebhookModalOpen(true)} className="text-xs font-bold text-primary hover:text-primary transition-colors flex items-center gap-1.5 px-3 py-2 bg-primary/5 rounded-xl border border-primary/20">
            <span className="material-symbols-outlined text-sm">link</span> Webhooks
          </button>
        </div>
      </div>

      {/* Grid */}
      {loadingSims ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[2.5rem]" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {simulations?.map((sim) => (
            <div key={sim._id || sim.id} className="group flex flex-col bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 relative">
              <div className="flex justify-between items-start mb-6">
                <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-3xl">play_lesson</span>
                </div>
                <div className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full uppercase tracking-widest">
                  Active Scenario
                </div>
              </div>
              
              <h3 className="text-2xl font-black mb-2 group-hover:text-primary transition-colors">{sim.name}</h3>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                  <span className="material-symbols-outlined text-base">person</span>
                  <span>Buyer: <span className="text-slate-900 dark:text-slate-200">{(sim.personaId as any)?.name || 'Unknown'}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                  <span className="material-symbols-outlined text-base">business_center</span>
                  <span>Deal: <span className="text-slate-900 dark:text-slate-200">{(sim.contextId as any)?.product || 'Generic'}</span></span>
                </div>
              </div>

              <button 
                onClick={() => navigate(`/session/new?simulationId=${sim._id || sim.id}`)}
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-slate-200 dark:shadow-black/50 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">rocket</span>
                Start Roleplay
              </button>
            </div>
          ))}

          {/* Add New Trigger */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex flex-col items-center justify-center gap-4 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-8 hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white dark:bg-slate-800 text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-3xl">terminal</span>
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-slate-900 dark:text-white">Compile Scenario</p>
              <p className="text-sm text-slate-500">Combine blocks into a simulation</p>
            </div>
          </button>
        </div>
      )}

      {/* Compile Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black">Scenario Compilation</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Bake persona and context into a reusable prompt. <button type="button" onClick={() => setIsWebhookModalOpen(true)} className="text-primary hover:underline font-bold">Configure Webhooks</button></p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-8 space-y-6">
              {/* Simulation Type Toggle */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setSimulationType('single')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${simulationType === 'single' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}
                >
                  Single Buyer
                </button>
                <button
                  type="button"
                  onClick={() => setSimulationType('committee')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${simulationType === 'committee' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500'}`}
                >
                  Buying Committee
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Scenario Name</label>
                <input name="name" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-800 rounded-2xl transition-all" placeholder="e.g. Discovery Call - Solar Edge" />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Primary Buyer Persona</label>
                  {!isCreatingPersona && (
                    <button type="button" onClick={() => setIsCreatingPersona(true)} className="text-[10px] font-black text-primary hover:underline">＋ Create New</button>
                  )}
                </div>
                
                {isCreatingPersona ? (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-primary/20 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <input name="name" placeholder="Name" required className="w-full px-4 py-2 bg-white dark:bg-slate-800 border-none rounded-xl text-sm" />
                    <input name="role" placeholder="Role (e.g. CFO)" required className="w-full px-4 py-2 bg-white dark:bg-slate-800 border-none rounded-xl text-sm" />
                    <input name="company" placeholder="Company" required className="w-full px-4 py-2 bg-white dark:bg-slate-800 border-none rounded-xl text-sm" />
                    <input name="priorities" placeholder="Priorities (comma separated)" className="w-full px-4 py-2 bg-white dark:bg-slate-800 border-none rounded-xl text-sm" />
                    <div className="flex gap-2 pt-1">
                      <button type="button" onClick={() => setIsCreatingPersona(false)} className="flex-1 py-2 rounded-xl text-[10px] font-black bg-slate-200 dark:bg-slate-700">Cancel</button>
                      <button type="button" onClick={(e) => handleQuickPersonaCreate(e as any)} className="flex-1 py-2 rounded-xl text-[10px] font-black bg-primary text-white">Save Persona</button>
                    </div>
                  </div>
                ) : (
                  <select name="personaId" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-800 rounded-2xl transition-all appearance-none cursor-pointer">
                    <option value="">Select Persona...</option>
                    {personas?.map(p => <option key={p._id} value={p._id}>{p.name} ({p.role})</option>)}
                  </select>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Deal Context</label>
                  {!isCreatingContext && (
                    <button type="button" onClick={() => setIsCreatingContext(true)} className="text-[10px] font-black text-primary hover:underline">＋ Create New</button>
                  )}
                </div>

                {isCreatingContext ? (
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-primary/20 space-y-3 animate-in fade-in slide-in-from-top-2">
                    <input name="product" placeholder="Product" required className="w-full px-4 py-2 bg-white dark:bg-slate-800 border-none rounded-xl text-sm" />
                    <select name="salesStage" className="w-full px-4 py-2 bg-white dark:bg-slate-800 border-none rounded-xl text-sm">
                      <option value="discovery">Discovery</option>
                      <option value="proposal">Proposal</option>
                      <option value="negotiation">Negotiation</option>
                    </select>
                    <input name="dealSize" placeholder="Deal Size" className="w-full px-4 py-2 bg-white dark:bg-slate-800 border-none rounded-xl text-sm" />
                    <div className="flex gap-2 pt-1">
                      <button type="button" onClick={() => setIsCreatingContext(false)} className="flex-1 py-2 rounded-xl text-[10px] font-black bg-slate-200 dark:bg-slate-700">Cancel</button>
                      <button type="button" onClick={(e) => handleQuickContextCreate(e as any)} className="flex-1 py-2 rounded-xl text-[10px] font-black bg-primary text-white">Save Context</button>
                    </div>
                  </div>
                ) : (
                  <select name="contextId" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-800 rounded-2xl transition-all appearance-none cursor-pointer">
                    <option value="">Select Context...</option>
                    {contexts?.map(c => <option key={c._id} value={c._id}>{c.product} - {c.salesStage}</option>)}
                  </select>
                )}
              </div>

              {simulationType === 'committee' && (
                <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4 animate-in slide-in-from-top-4 duration-500">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Buying Committee <span className="text-slate-300 dark:text-slate-600">(max 2)</span></label>
                    {committeePersonaIds.length > 0 && (
                      <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full">{committeePersonaIds.length} added</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 pl-1">Add extra stakeholders for this multi-persona simulation.</p>
                  <div className="flex flex-wrap gap-2">
                    {personas?.map(p => {
                      const isSelected = committeePersonaIds.includes(p._id || p.id);
                      return (
                        <button
                          key={p._id || p.id}
                          type="button"
                          onClick={() => toggleCommitteeMember(p._id || p.id || '')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${isSelected
                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-primary/50'
                          }`}
                        >
                          {isSelected && <span className="mr-1">✓</span>}
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Grading Rubric</label>
                <select name="rubricId" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-800 rounded-2xl transition-all appearance-none cursor-pointer">
                  <option value="">Select Rubric or Methodology...</option>
                  <optgroup label="Standard Methodologies">
                    {frameworks?.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                  </optgroup>
                  <optgroup label="Custom Rubrics">
                    {rubrics?.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
                  </optgroup>
                </select>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 px-6 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-black text-sm"
                >
                  Discard
                </button>
                <button 
                  type="submit" 
                  disabled={createMutation.isPending} 
                  className="flex-1 px-6 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createMutation.isPending ? 'Orchestrating...' : 'Compile Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <WebhookSettingsModal 
        isOpen={isWebhookModalOpen} 
        onClose={() => setIsWebhookModalOpen(false)} 
      />
    </div>
  );
};
