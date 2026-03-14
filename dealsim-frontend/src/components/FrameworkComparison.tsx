import React from 'react';
import type { EvaluationFramework, Session } from '../types/api';

interface FrameworkComparisonProps {
  session: Session;
  frameworkAId: string;
  frameworkBId: string;
  frameworks: EvaluationFramework[];
}

export const FrameworkComparison: React.FC<FrameworkComparisonProps> = ({ 
  session, 
  frameworkAId, 
  frameworkBId,
  frameworks 
}) => {
  const findEvaluation = (fwId: string) => {
    return session.evaluations?.find(e => {
        const id = typeof e.frameworkId === 'string' ? e.frameworkId : e.frameworkId._id;
        return id === fwId;
    });
  };

  const evalA = findEvaluation(frameworkAId);
  const evalB = findEvaluation(frameworkBId);
  const fwA = frameworks.find(f => f._id === frameworkAId);
  const fwB = frameworks.find(f => f._id === frameworkBId);

  if (!fwA || !fwB) return null;

  const renderEvalColumn = (fw: EvaluationFramework, evaluation: any) => {
    if (!evaluation) {
      return (
        <div className="flex-1 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">pending_actions</span>
          <p className="text-sm font-bold text-slate-400">No evaluation found for {fw.name}</p>
          <p className="text-xs text-slate-400 mt-1">Trigger re-evaluation to see results</p>
        </div>
      );
    }

    return (
      <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xl font-black">{fw.name}</h4>
            <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <span className="text-2xl font-black">{evaluation.overallScore}</span>
            </div>
          </div>

          <div className="space-y-4">
            {fw.competencies.map(comp => {
              const score = evaluation.competencyScores[comp.name] || 0;
              return (
                <div key={comp.name} className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest px-1">
                    <span className="text-slate-500">{comp.name}</span>
                    <span className={score >= 70 ? 'text-emerald-500' : score >= 40 ? 'text-amber-500' : 'text-rose-500'}>{score}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${score >= 70 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">check_circle</span> Key Strengths
            </h5>
            <ul className="space-y-2">
              {evaluation.feedback.strengths.map((s: string, i: number) => (
                <li key={i} className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">• {s}</li>
              ))}
            </ul>
          </div>

          <div className="p-5 bg-rose-500/5 border border-rose-500/10 rounded-2xl">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-base">warning</span> Areas to Improve
            </h5>
            <ul className="space-y-2">
              {evaluation.feedback.weaknesses.map((w: string, i: number) => (
                <li key={i} className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">• {w}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {renderEvalColumn(fwA, evalA)}
      <div className="hidden md:flex flex-col items-center justify-center">
         <div className="h-full w-[1px] bg-slate-200 dark:bg-slate-800 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-black text-[10px] text-slate-400">VS</div>
         </div>
      </div>
      {renderEvalColumn(fwB, evalB)}
    </div>
  );
};
