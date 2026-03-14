import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export const WebhookSettingsModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState('');
  const [secret, setSecret] = useState('');

  const { data: settings, isLoading } = useQuery<{ webhookUrl?: string; webhookSecret?: string }>({
    queryKey: ['org-webhook-settings'],
    queryFn: () => apiClient.get('/organizations/settings'),
    enabled: isOpen
  });

  useEffect(() => {
    if (settings) {
      setUrl(settings.webhookUrl || '');
      setSecret(settings.webhookSecret || '');
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (data: { webhookUrl: string; webhookSecret?: string }) => 
      apiClient.patch('/organizations/settings', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['org-webhook-settings'] });
      onClose();
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black">Webhook Integration</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Send real-time event data to your CRM or LMS.</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            updateMutation.mutate({ webhookUrl: url, webhookSecret: secret });
          }} 
          className="p-8 space-y-6"
        >
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 text-primary">Webhook Endpoint URL</label>
            <input 
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-primary focus:bg-white dark:focus:bg-slate-800 rounded-2xl transition-all" 
              placeholder="https://your-crm.com/webhooks/dealsim"
              required 
            />
            <p className="text-[10px] text-slate-400 italic px-1 pt-1">
              Events: session.started, session.completed, evaluation.ready
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Signing Secret (HMAC-SHA256)</label>
            <div className="relative">
              <input 
                type="text"
                value={secret}
                readOnly
                className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/80 border-transparent rounded-2xl text-slate-500 font-mono text-xs select-all" 
              />
              <button 
                type="button"
                onClick={() => {
                   // Secret is managed by backend on first URL save if empty
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-primary opacity-50 cursor-not-allowed"
              >
                AUTO-GEN
              </button>
            </div>
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 px-6 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-black text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={updateMutation.isPending || isLoading} 
              className="flex-1 px-6 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
