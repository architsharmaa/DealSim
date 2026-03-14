import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { Rubric, Competency } from '../types/api';

export const RubricsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const [competencies, setCompetencies] = useState<Competency[]>([
    { name: '', description: '', weight: 25, scoringGuidelines: '' }
  ]);

  const { data: rubrics, isLoading } = useQuery<Rubric[]>({
    queryKey: ['rubrics'],
    queryFn: () => apiClient.get('/rubrics'),
  });

  const createMutation = useMutation({
    mutationFn: (newRubric: Partial<Rubric>) => apiClient.post('/rubrics', newRubric),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rubrics'] });
      setIsModalOpen(false);
      setCompetencies([{ name: '', description: '', weight: 25, scoringGuidelines: '' }]);
    },
  });

  const addCompetency = () => {
    setCompetencies([...competencies, { name: '', description: '', weight: 0, scoringGuidelines: '' }]);
  };

  const removeCompetency = (index: number) => {
    setCompetencies(competencies.filter((_, i) => i !== index));
  };

  const updateCompetency = (index: number, field: keyof Competency, value: string | number) => {
    const nextCompetencies = [...competencies];
    (nextCompetencies[index] as any)[field] = value;
    setCompetencies(nextCompetencies);
  };

  const totalWeight = competencies.reduce((sum, c) => sum + (c.weight || 0), 0);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (totalWeight !== 100) {
       alert(`Total weight must be 100%. Current: ${totalWeight}%`);
       return;
    }
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      competencies: competencies,
    };
    createMutation.mutate(data);
  };

  const { data: frameworks } = useQuery<any[]>({
    queryKey: ['evaluation-frameworks'],
    queryFn: () => apiClient.get('/evaluation-frameworks'),
  });

  const allDisplayRubrics = [
    ...(frameworks?.map(f => ({ ...f, isBuiltIn: true })) || []),
    ...(rubrics || [])
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase">
            <span className="material-symbols-outlined text-[14px]">fact_check</span>
            Evaluation
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight">Grading Rubrics</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
            Design weighted scorecards or use standard sales methodologies to objectively evaluate performance.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group relative bg-primary text-white pl-5 pr-6 py-3 rounded-2xl font-bold hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 transition-all flex items-center gap-3 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
          <span className="material-symbols-outlined text-xl">rule</span>
          Create Rubric
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 bg-slate-100 dark:bg-slate-800/50 rounded-[2.5rem] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allDisplayRubrics.map((rubric) => (
            <div 
              key={rubric._id || rubric.id} 
              className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 transition-all duration-500 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-primary/5 dark:bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">
                    {rubric.isBuiltIn ? 'verified_user' : 'assignment_turned_in'}
                  </span>
                </div>
                <div className="flex gap-2">
                   {rubric.isBuiltIn && (
                      <div className="px-3 py-1 bg-primary text-white rounded-lg text-[10px] font-black tracking-widest uppercase border border-primary">
                        Standard
                      </div>
                   )}
                  <div className="px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-[10px] font-black tracking-widest uppercase border border-slate-100 dark:border-slate-700">
                    {rubric.competencies?.length || 0} Criteria
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-black mb-6 group-hover:text-primary transition-colors">{rubric.name}</h3>
              
              <div className="flex-1 space-y-4">
                {rubric.competencies?.map((comp: Competency, idx: number) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                      <span className="text-slate-600 dark:text-slate-400">{comp.name}</span>
                      <span className="text-primary">{comp.weight}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-700 delay-300" 
                        style={{ width: `${comp.weight}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {!rubric.isBuiltIn && (
                <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Modified recently</span>
                  <div className="flex gap-2">
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors">
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              )}
              
              {rubric.isBuiltIn && (
                <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Read-Only Methodology</span>
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary/5 text-primary">
                    <span className="material-symbols-outlined text-base">lock</span>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button 
            onClick={() => setIsModalOpen(true)}
            className="group h-full min-h-[350px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center p-8 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-3xl leading-none">post_add</span>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors">Design New Rubric</p>
              <p className="text-sm text-slate-400">Define weighted evaluation criteria</p>
            </div>
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black">Scorecard Designer</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Create an objective measurement framework.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Rubric Name</label>
                <input name="name" required className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-800 rounded-2xl transition-all font-bold text-lg" placeholder="e.g. Strategic Discovery Phase" />
              </div>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center px-1">
                  <div>
                     <h4 className="text-xs font-black uppercase tracking-widest text-primary">Competencies</h4>
                     <p className="text-[10px] text-slate-400">Weights must sum to 100% (Current: {totalWeight}%)</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={addCompetency} 
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-primary hover:text-white rounded-xl text-xs font-bold transition-all"
                  >
                    <span className="material-symbols-outlined text-sm">add</span> Add
                  </button>
                </div>
                
                <div className="space-y-6">
                  {competencies.map((comp, index) => (
                    <div key={index} className="p-6 bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-6 relative group">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex items-center justify-center text-[10px] font-black">{index + 1}</div>
                           <h5 className="font-bold text-sm">Competency Details</h5>
                        </div>
                        {competencies.length > 1 && (
                          <button 
                            type="button" 
                            onClick={() => removeCompetency(index)}
                            className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/30 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                          >
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-3 space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Competency Name</label>
                          <input 
                            value={comp.name} 
                            onChange={(e) => updateCompetency(index, 'name', e.target.value)}
                            required 
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm" 
                            placeholder="e.g. Value Quantification" 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Weight %</label>
                          <input 
                            type="number"
                            value={comp.weight} 
                            onChange={(e) => updateCompetency(index, 'weight', parseInt(e.target.value))}
                            required 
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm text-center font-bold text-primary" 
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Definition</label>
                          <input 
                            value={comp.description} 
                            onChange={(e) => updateCompetency(index, 'description', e.target.value)}
                            required 
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-sm" 
                            placeholder="Explain what success looks like..." 
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Scoring Guidelines (AI Context)</label>
                          <textarea 
                            value={comp.scoringGuidelines} 
                            onChange={(e) => updateCompetency(index, 'scoringGuidelines', e.target.value)}
                            required 
                            rows={2}
                            className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl text-xs leading-relaxed" 
                            placeholder="Instructions for the AI to score this criteria (e.g. 5 if they asked about X, 0 if they mentioned Y...)" 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 flex gap-4 sticky bottom-0 bg-white dark:bg-slate-900 mt-auto">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 px-6 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={createMutation.isPending || totalWeight !== 100} 
                  className="flex-1 px-6 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createMutation.isPending ? 'Syncing...' : 'Publish Rubric'}
                  <span className="material-symbols-outlined text-sm">send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
