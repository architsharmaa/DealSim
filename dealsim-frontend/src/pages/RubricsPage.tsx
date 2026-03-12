import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { Rubric, Competency } from '../types/api';

export const RubricsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const [competencies, setCompetencies] = useState<Competency[]>([{ name: '', description: '', weight: 25, scoringGuidelines: '' }]);

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
    setCompetencies([...competencies, { name: '', description: '', weight: 25, scoringGuidelines: '' }]);
  };

  const removeCompetency = (index: number) => {
    setCompetencies(competencies.filter((_, i) => i !== index));
  };

  const updateCompetency = (index: number, field: keyof Competency, value: string | number) => {
    const nextCompetencies = [...competencies];
    (nextCompetencies[index] as any)[field] = value;
    setCompetencies(nextCompetencies);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      competencies: competencies,
    };
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Rubrics</h2>
          <p className="text-slate-500 mt-1">Design scorecards to evaluate simulation performance.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Create Rubric
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rubrics?.map((rubric) => (
            <div key={rubric._id || rubric.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-all border-l-4 border-l-primary">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">checklist</span>
                </div>
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-400">
                  {rubric.competencies?.length || 0} COMPETENCIES
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3">{rubric.name}</h3>
              
              <div className="space-y-2">
                {rubric.competencies?.slice(0, 3).map((comp: Competency) => (
                  <div key={comp.name} className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">{comp.name}</span>
                    <span className="font-semibold">{comp.weight}%</span>
                  </div>
                ))}
                {(rubric.competencies?.length || 0) > 3 && (
                  <p className="text-[10px] text-slate-400 text-center mt-2">+{(rubric.competencies?.length || 0) - 3} more</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 rounded-t-2xl">
              <h3 className="text-xl font-bold">Create New Rubric</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
              <div className="space-y-2">
                <label className="text-sm font-medium">Rubric Name</label>
                <input name="name" required className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg" placeholder="Discovery Call Excellence" />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-500">Competencies</h4>
                  <button type="button" onClick={addCompetency} className="text-primary text-xs font-bold hover:underline">
                    + Add Competency
                  </button>
                </div>
                
                {competencies.map((comp, index) => (
                  <div key={index} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl space-y-3 relative group">
                    {competencies.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeCompetency(index)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                    )}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Name</label>
                        <input 
                          value={comp.name} 
                          onChange={(e) => updateCompetency(index, 'name', e.target.value)}
                          required 
                          className="w-full text-sm bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-md" 
                          placeholder="e.g. Active Listening" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Weight %</label>
                        <input 
                          type="number"
                          value={comp.weight} 
                          onChange={(e) => updateCompetency(index, 'weight', parseInt(e.target.value))}
                          required 
                          className="w-full text-sm bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-md" 
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                        <input 
                          value={comp.description} 
                          onChange={(e) => updateCompetency(index, 'description', e.target.value)}
                          required 
                          className="w-full text-sm bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-md" 
                          placeholder="What does success look like?" 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Scoring Guidelines</label>
                        <input 
                          value={comp.scoringGuidelines} 
                          onChange={(e) => updateCompetency(index, 'scoringGuidelines', e.target.value)}
                          required 
                          className="w-full text-sm bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 rounded-md" 
                          placeholder="0-5 score criteria..." 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex gap-3 bg-white dark:bg-slate-900 sticky bottom-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {createMutation.isPending ? 'Creating...' : 'Create Rubric'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
