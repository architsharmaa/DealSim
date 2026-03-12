import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { Context } from '../types/api';

export const ContextsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: contexts, isLoading } = useQuery<Context[]>({
    queryKey: ['contexts'],
    queryFn: () => apiClient.get('/contexts'),
  });

  const createMutation = useMutation({
    mutationFn: (newContext: Partial<Context>) => apiClient.post('/contexts', newContext),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contexts'] });
      setIsModalOpen(false);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      product: formData.get('product') as string,
      dealSize: formData.get('dealSize') as string,
      salesStage: formData.get('salesStage') as string,
      specialConditions: formData.get('specialConditions') as string,
    };
    createMutation.mutate(data);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contexts</h2>
          <p className="text-slate-500 mt-1">Define the environmental variables for your simulations.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Create Context
        </button>
      </div>

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contexts?.map((context) => (
            <div key={context._id || context.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-all border-l-4 border-l-primary">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-2xl">category</span>
                </div>
                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-400">
                  {context.salesStage?.toUpperCase()}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-1">{context.product}</h3>
              <p className="text-slate-500 text-sm mb-4">Deal Size: {context.dealSize}</p>
              
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Special Conditions</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{context.specialConditions || 'None specified'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-xl font-bold">Create New Context</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product / Service</label>
                <input name="product" required className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg" placeholder="Enterprise Cloud Storage" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Deal Size</label>
                  <input name="dealSize" required className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg" placeholder="$50k - $100k" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sales Stage</label>
                  <select name="salesStage" className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg">
                    <option value="discovery">Discovery</option>
                    <option value="proposal">Proposal</option>
                    <option value="negotiation">Negotiation</option>
                    <option value="closing">Closing</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Special Conditions</label>
                <textarea 
                  name="specialConditions" 
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg" 
                  placeholder="Competitive pressure from Incumbent. Quarter end approaching." 
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg font-medium hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {createMutation.isPending ? 'Creating...' : 'Create Context'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
