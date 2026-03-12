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
      personalityTraits: (formData.get('traits') as string).split(',').map(t => t.trim()),
      defaultObjections: (formData.get('objections') as string).split(',').map(o => o.trim()),
    };
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Personas</h2>
          <p className="text-slate-500 mt-1">Manage reusable AI buyer personas for your simulations.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Create Persona
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personas?.map((persona) => (
            <div key={persona._id || persona.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-all border-l-4 border-l-primary">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">person</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                  persona.resistanceLevel === 'high' ? 'bg-red-100 text-red-600' : 
                  persona.resistanceLevel === 'medium' ? 'bg-amber-100 text-amber-600' : 
                  'bg-emerald-100 text-emerald-600'
                }`}>
                  {persona.resistanceLevel?.toUpperCase()} RESISTANCE
                </span>
              </div>
              <h3 className="text-xl font-bold mb-1">{persona.name}</h3>
              <p className="text-slate-500 text-sm mb-4">{persona.role} @ {persona.company}</p>
              
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {persona.personalityTraits?.map(trait => (
                    <span key={trait} className="px-2 py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] rounded border border-slate-100 dark:border-slate-700">
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold">Create New Persona</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <input name="name" required className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Resistances</label>
                  <select name="resistanceLevel" className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <input name="role" required className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg" placeholder="VP of Sales" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company</label>
                  <input name="company" required className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg" placeholder="Acme Corp" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Personality Traits (comma separated)</label>
                <input name="traits" required className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg" placeholder="Direct, Skeptical, Busy" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Objections (comma separated)</label>
                <input name="objections" required className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg" placeholder="Too expensive, Not the right time" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {createMutation.isPending ? 'Creating...' : 'Create Persona'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
