import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { Organization } from '../types/api';

export const ProfilePage = () => {
  const { currentUser, logout } = useAuth();

  const { data: org, isLoading: orgLoading } = useQuery<Organization>({
    queryKey: ['my-organization', currentUser?.organizationId],
    queryFn: async () => {
      if (!currentUser?.organizationId) throw new Error('No organization ID');
      return await apiClient.get<Organization>(`/organizations/${currentUser.organizationId}`);
    },
    enabled: !!currentUser?.organizationId
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const roleLabels: Record<string, string> = {
    organization_admin: 'Organization Admin',
    org_employee: 'Team Member',
    admin: 'System Admin',
    manager: 'Manager',
    employee: 'Sales Representative'
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-8 bg-white dark:bg-slate-950 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-500"></div>
        
        <div className="relative">
          <div className="size-32 rounded-[2.5rem] bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-primary/30 ring-4 ring-white dark:ring-slate-900">
            {currentUser?.fullName ? getInitials(currentUser.fullName) : currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div className="absolute -bottom-2 -right-2 size-10 rounded-2xl bg-emerald-500 border-4 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-lg">
            <span className="material-symbols-outlined text-sm">verified</span>
          </div>
        </div>

        <div className="text-center md:text-left space-y-2 relative z-10">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {currentUser?.fullName || currentUser?.name || 'User Profile'}
          </h2>
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
              {roleLabels[currentUser?.role || 'employee'] || 'Member'}
            </span>
            <span className="px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-200 dark:border-slate-800">
              Active Session
            </span>
          </div>
        </div>

        <div className="md:ml-auto">
          <button 
            onClick={() => logout()}
            className="px-8 py-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-red-500/20 active:scale-95"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Info */}
        <div className="bg-white dark:bg-slate-950 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 space-y-8">
          <div className="flex items-center gap-3 text-primary">
            <span className="material-symbols-outlined font-black">person_filled</span>
            <h3 className="font-black text-[10px] tracking-[0.2em] uppercase">Account Details</h3>
          </div>

          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{currentUser?.fullName || 'Not provided'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{currentUser?.email || 'Not provided'}</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">User ID</label>
              <code className="text-[10px] font-mono bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-slate-500 border border-slate-200 dark:border-slate-800">
                {currentUser?.id || currentUser?.organizationId}
              </code>
            </div>
          </div>
        </div>

        {/* Organization Info */}
        <div className="bg-white dark:bg-slate-950 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          
          <div className="flex items-center gap-3 text-indigo-500">
            <span className="material-symbols-outlined font-black">corporate_fare</span>
            <h3 className="font-black text-[10px] tracking-[0.2em] uppercase">Organization Context</h3>
          </div>

          {orgLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded w-3/4"></div>
              <div className="h-4 bg-slate-100 dark:bg-slate-900 rounded w-1/2"></div>
            </div>
          ) : (
            <div className="space-y-6 relative z-10">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Company Name</label>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{org?.name || 'Loading...'}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Plan Level</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white capitalize">{org?.plan || 'Standard'}</span>
                  {org?.plan === 'enterprise' && (
                    <span className="size-5 rounded-full bg-amber-500 flex items-center justify-center text-white">
                      <span className="material-symbols-outlined text-[10px]">grade</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="pt-4">
                <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-2">
                  View Organization Settings <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security & Preferences */}
      <div className="bg-white dark:bg-slate-950 p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="size-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <span className="material-symbols-outlined text-2xl font-black">key</span>
          </div>
          <div>
            <h4 className="font-black text-sm text-slate-900 dark:text-white">Security & Access</h4>
            <p className="text-xs text-slate-500 font-medium">Reset your biometric keys or update password credentials.</p>
          </div>
        </div>
        <button className="px-8 py-3 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95">
          Reset Credentials
        </button>
      </div>
    </div>
  );
};
