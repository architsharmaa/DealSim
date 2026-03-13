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
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase">
            <span className="material-symbols-outlined text-[14px]">map</span>
            Environment
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight">Context Templates</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
            Define the business landscape, deal complexity, and sales stage to ground your simulations in reality.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="group relative bg-primary text-white pl-5 pr-6 py-3 rounded-2xl font-bold hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 transition-all flex items-center gap-3 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
          <span className="material-symbols-outlined text-xl">add_location_alt</span>
          New Template
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {contexts?.map((context) => (
            <div 
              key={context._id || context.id} 
              className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-4 hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/50 transition-all duration-500 flex flex-col"
            >
              <div className="relative p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] mb-6 overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <span className="material-symbols-outlined text-8xl rotate-12">category</span>
                </div>
                
                <div className="flex justify-between items-start mb-6">
                   <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-primary shadow-sm">
                      <span className="material-symbols-outlined">analytics</span>
                   </div>
                   <span className="px-3 py-1 bg-white dark:bg-slate-900 rounded-lg text-[10px] font-black tracking-widest uppercase border border-slate-100 dark:border-slate-800 shadow-sm">
                      {context.salesStage}
                   </span>
                </div>
                
                <h3 className="text-xl font-black mb-1 leading-tight line-clamp-1">{context.product}</h3>
                <p className="text-primary font-bold text-sm tracking-tight">{context.dealSize} Contract Value</p>
              </div>

              <div className="px-4 pb-4 flex-1">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Scenario Constraints</p>
                 <div className="p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-700/50 relative">
                    <span className="material-symbols-outlined absolute -top-2 -left-2 text-slate-200 dark:text-slate-700 pointer-events-none">format_quote</span>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic line-clamp-3">
                       {context.specialConditions || 'Standard market conditions apply with no specific environmental triggers.'}
                    </p>
                 </div>
              </div>

              <div className="px-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex justify-end items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex gap-2">
                  <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </button>
                  <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors">
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button 
            onClick={() => setIsModalOpen(true)}
            className="group h-full min-h-[300px] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center p-8 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300">
              <span className="material-symbols-outlined text-3xl leading-none">add_location_alt</span>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors">Create Template</p>
              <p className="text-sm text-slate-400">Add environmental deal variables</p>
            </div>
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black">Define Environment</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Set the stage for your training scenarios.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Product / Solution Offering</label>
                <input name="product" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-800 rounded-2xl transition-all" placeholder="e.g. Enterprise Data Governance Suite" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Contract Value</label>
                  <input name="dealSize" required className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-800 rounded-2xl transition-all" placeholder="e.g. $100k - $250k" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Sales Milestone</label>
                  <select name="salesStage" className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-800 rounded-2xl transition-all appearance-none cursor-pointer">
                    <option value="Discovery">Discovery Phase</option>
                    <option value="Proposal">Proposal Presentation</option>
                    <option value="Negotiation">Final Negotiation</option>
                    <option value="Closing">Closing / Handover</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Simulated Conditions</label>
                <textarea 
                  name="specialConditions" 
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-800 rounded-2xl transition-all" 
                  placeholder="e.g. Incumbent vendor is strongly favored. Champion just left the company. Budget frozen but project is high priority." 
                />
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
                  {createMutation.isPending ? 'Deploying...' : 'Seal Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
