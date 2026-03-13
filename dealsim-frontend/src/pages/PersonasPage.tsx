import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { Persona } from '../types/api';

export const PersonasPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: personas, isLoading } = useQuery<Persona[]>({
    queryKey: ['personas'],
    queryFn: () => apiClient.get('/personas'),
  });

  const createMutation = useMutation({
    mutationFn: (newPersona: Partial<Persona>) => apiClient.post('/personas', newPersona),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personas'] });
      setIsModalOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      company: formData.get('company') as string,
      resistanceLevel: formData.get('resistanceLevel') as 'low' | 'medium' | 'high',
      personalityTraits: (formData.get('traits') as string).split(',').map(t => t.trim()).filter(Boolean),
      defaultObjections: (formData.get('objections') as string).split(',').map(o => o.trim()).filter(Boolean),
    };
    createMutation.mutate(data);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase">
            <span className="material-symbols-outlined text-[14px]">psychology</span>
            Building Blocks
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight">Personas</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
            Configure reusable AI buyer personas with specific traits and resistance levels to test your sales team's agility.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group relative bg-primary text-white pl-5 pr-6 py-3 rounded-2xl font-bold hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 transition-all flex items-center gap-3 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
          <span className="material-symbols-outlined text-xl">person_add</span>
          Create Persona
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {personas?.map((persona) => (
            <div 
              key={persona._id || persona.id} 
              className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 transition-all duration-500 flex flex-col"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="relative">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                    <span className="material-symbols-outlined text-3xl">person</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900" />
                </div>
                <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase shadow-sm ${
                  persona.resistanceLevel === 'high' ? 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-950/30 dark:border-red-900/50' : 
                  persona.resistanceLevel === 'medium' ? 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50' : 
                  'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50'
                }`}>
                  {persona.resistanceLevel} Resistance
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-black mb-1 group-hover:text-primary transition-colors">{persona.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-6">{persona.role} @ {persona.company}</p>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Traits</p>
                    <div className="flex flex-wrap gap-2">
                      {persona.personalityTraits?.map((trait, idx) => (
                        <span key={idx} className="px-3 py-1 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 text-[11px] font-semibold rounded-lg border border-slate-100 dark:border-slate-700">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                  {persona.defaultObjections && persona.defaultObjections.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Key Objections</p>
                      <ul className="space-y-1.5">
                        {persona.defaultObjections.slice(0, 2).map((obj, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400 italic">
                            <span className="text-primary">•</span>
                            "{obj}"
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="text-xs font-bold text-slate-400 hover:text-primary transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">edit</span> Edit
                </button>
                <button className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">delete</span> Delete
                </button>
              </div>
            </div>
          ))}
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="group h-full min-h-[300px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center p-8 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-3xl leading-none">add</span>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors">Add New Persona</p>
              <p className="text-sm text-slate-400">Define a custom role with specific traits</p>
            </div>
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black">Design Persona</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Craft the identity of your next AI buyer.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Name</label>
                  <input name="name" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-800 rounded-2xl transition-all" placeholder="e.g. Jordan Smith" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Resistance</label>
                  <select name="resistanceLevel" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-800 rounded-2xl transition-all appearance-none cursor-pointer">
                    <option value="low">Low Resistance</option>
                    <option value="medium">Medium Resistance</option>
                    <option value="high">High Resistance</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Role</label>
                  <input name="role" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-800 rounded-2xl transition-all" placeholder="e.g. VP Engineering" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Company</label>
                  <input name="company" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-800 rounded-2xl transition-all" placeholder="e.g. Stellar AI" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Personality Traits</label>
                <input name="traits" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-800 rounded-2xl transition-all" placeholder="Direct, Budget-conscious, Analytical..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Typical Objections</label>
                <input name="objections" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-800 rounded-2xl transition-all" placeholder="It's too expensive, We need X feature first..." />
              </div>
              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 px-6 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={createMutation.isPending} 
                  className="flex-1 px-6 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Syncing...' : 'Commission Persona'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
