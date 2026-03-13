import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { Assignment, User, Simulation } from '../types/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const AssignmentsPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedSim, setSelectedSim] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'organization_admin';

  // Fetch Assignments
  const { data: assignments, isLoading } = useQuery<Assignment[]>({
    queryKey: ['assignments'],
    queryFn: () => apiClient.get<Assignment[]>('/assignments')
  });

  // Fetch Users (for assignment)
  const { data: users } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => apiClient.get<User[]>('/users'),
    enabled: isAdmin
  });

  // Fetch Simulations
  const { data: simulations } = useQuery<Simulation[]>({
    queryKey: ['simulations'],
    queryFn: () => apiClient.get<Simulation[]>('/simulations')
  });

  // Create Assignment
  const createMutation = useMutation({
    mutationFn: (newAssignment: any) => apiClient.post('/assignments', newAssignment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Simulation assigned successfully');
      setIsModalOpen(false);
      setSelectedUser('');
      setSelectedSim('');
      setDueDate('');
    }
  });

  // Delete Assignment
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.delete(`/assignments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      toast.success('Assignment retracted');
    }
  });

  // Filtering Logic
  const filteredAssignments = useMemo(() => {
    if (!assignments) return [];
    
    return assignments.filter(assignment => {
      const user = assignment.userId as any;
      const sim = assignment.simulationId as any;
      
      const userName = user?.fullName || user?.name || '';
      const simName = sim?.name || '';
      
      const matchesSearch = 
        userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        simName.toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [assignments, searchQuery, statusFilter]);

  const handleAssign = () => {
    if (!selectedUser || !selectedSim) {
      toast.error('Please select both a user and a simulation');
      return;
    }
    createMutation.mutate({
      userId: selectedUser,
      simulationId: selectedSim,
      dueDate: dueDate || undefined
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl w-full mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Simulation Assignments</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track employee simulation progress across your organization.</p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 p-1 bg-primary/5 rounded-xl border border-primary/10 w-fit">
            {[
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'in-progress', label: 'In Progress' },
              { id: 'completed', label: 'Completed' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id as any)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  statusFilter === f.id 
                    ? 'bg-white dark:bg-slate-800 shadow-sm text-primary' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-primary/5'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {isAdmin && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-base">person_add</span>
              Assign Simulation
            </button>
          )}
        </div>
        <div className="relative min-w-[320px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
          <input 
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-primary/10 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none text-slate-900 dark:text-white" 
            placeholder="Search employees or simulations..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-primary/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-primary/5 bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Simulation</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Assigned Date</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {filteredAssignments.map((assignment) => {
                const user = assignment.userId as User;
                const sim = assignment.simulationId as Simulation;
                return (
                  <tr key={assignment._id} className="hover:bg-primary/[0.02] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full border border-primary/10 overflow-hidden bg-primary/5 flex items-center justify-center shrink-0">
                          {user?.avatarUrl ? (
                            <img className="h-full w-full object-cover" src={user.avatarUrl} alt={user?.fullName || user?.name} />
                          ) : (
                            <span className="text-sm font-bold text-primary">{(user?.fullName || user?.name || '?').charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.fullName || user?.name || 'Unknown User'}</p>
                          <p className="text-xs text-slate-500">{user?.role || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{sim?.name || 'Unknown Simulation'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-slate-500">{new Date(assignment.assignedDate).toLocaleDateString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        assignment.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        assignment.status === 'in-progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${
                          assignment.status === 'completed' ? 'bg-emerald-500' :
                          assignment.status === 'in-progress' ? 'bg-blue-500' :
                          'bg-slate-400'
                        }`}></span>
                        {assignment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        {isAdmin && assignment.status === 'completed' && assignment.sessionId && (
                          <button 
                            onClick={() => navigate(`/reports/${assignment.sessionId}`)}
                            className="text-primary hover:bg-primary/10 transition-all p-2 rounded-lg"
                            title="View Report"
                          >
                            <span className="material-symbols-outlined text-xl">analytics</span>
                          </button>
                        )}
                        {isAdmin && (
                          <button 
                            onClick={() => deleteMutation.mutate(assignment._id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                            title="Retract Assignment"
                          >
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl border border-slate-200 dark:border-slate-800 scale-in-center overflow-hidden relative">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Assign Simulation</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">Select an employee and a scenario to assign.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Employee (Email)</label>
                <select 
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none text-slate-900 dark:text-white"
                >
                  <option value="">Select Email...</option>
                  {users?.map(u => (
                    <option key={u.id} value={u.id}>{u.email}</option>
                  ))}
                </select>
              </div>

              {selectedUser && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Employee Name</label>
                  <div className="w-full h-14 bg-slate-100/50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 flex items-center text-sm font-black text-primary">
                    {users?.find(u => u.id === selectedUser)?.fullName || '—'}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Simulation Scenario</label>
                <select 
                  value={selectedSim}
                  onChange={(e) => setSelectedSim(e.target.value)}
                  className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none text-slate-900 dark:text-white"
                >
                  <option value="">Select Scenario...</option>
                  {simulations?.map(s => (
                    <option key={s._id || s.id} value={s._id || s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Due Date (Optional)</label>
                <input 
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full h-14 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 appearance-none text-slate-900 dark:text-white"
                />
              </div>

              <button 
                onClick={handleAssign}
                disabled={createMutation.isPending}
                className="w-full h-14 bg-primary text-white rounded-2xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 mt-4"
              >
                {createMutation.isPending ? (
                  <span className="animate-spin material-symbols-outlined">progress_activity</span>
                ) : (
                  <><span className="material-symbols-outlined">send</span> Assign Now</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
