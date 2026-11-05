'use client';

import React from 'react';
import { CheckCircle2, Clock, Building2, Award } from 'lucide-react';
import { CompanyApplication, FilterTestStatus } from '../types';

interface StatsCardsProps {
  applications: CompanyApplication[];
  selectedTestFilter: FilterTestStatus;
  onSelectTestFilter: (filter: FilterTestStatus) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
  applications,
  selectedTestFilter,
  onSelectTestFilter,
}) => {
  const total = applications.length;
  const testsGiven = applications.filter((a) => a.testGiven).length;
  const testsNotGiven = applications.filter((a) => !a.testGiven).length;
  const shortlisted = applications.filter(
    (a) => a.status.toLowerCase().includes('shortlist') || a.status.toLowerCase().includes('interview') || a.status.toLowerCase().includes('select')
  ).length;

  const percentage = total > 0 ? Math.round((testsGiven / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 my-6">
      {/* Total Applications */}
      <div
        onClick={() => onSelectTestFilter('all')}
        className={`p-4 rounded-xl border transition cursor-pointer ${
          selectedTestFilter === 'all'
            ? 'bg-blue-50/70 border-blue-400 shadow-sm ring-1 ring-blue-300'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Applied
          </span>
          <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{total}</span>
          <span className="text-xs text-slate-500">companies</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
          <span>Click to view all</span>
          {selectedTestFilter === 'all' && (
            <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">Active</span>
          )}
        </div>
      </div>

      {/* Test Given */}
      <div
        onClick={() => onSelectTestFilter('given')}
        className={`p-4 rounded-xl border transition cursor-pointer ${
          selectedTestFilter === 'given'
            ? 'bg-emerald-50/70 border-emerald-400 shadow-sm ring-1 ring-emerald-300'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
            Test Given
          </span>
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">{testsGiven}</span>
          <span className="text-xs text-emerald-600 font-medium">({percentage}%)</span>
        </div>
        <div className="mt-2 text-xs text-emerald-700 flex items-center justify-between">
          <span>Filter: Test Completed</span>
          {selectedTestFilter === 'given' && (
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200 px-1.5 py-0.5 rounded">Active</span>
          )}
        </div>
      </div>

      {/* Test Not Given / Pending */}
      <div
        onClick={() => onSelectTestFilter('not_given')}
        className={`p-4 rounded-xl border transition cursor-pointer ${
          selectedTestFilter === 'not_given'
            ? 'bg-amber-50/70 border-amber-400 shadow-sm ring-1 ring-amber-300'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
            Test Pending
          </span>
          <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-700">{testsNotGiven}</span>
          <span className="text-xs text-amber-600 font-medium">needs test</span>
        </div>
        <div className="mt-2 text-xs text-amber-700 flex items-center justify-between">
          <span>Filter: Test Not Given</span>
          {selectedTestFilter === 'not_given' && (
            <span className="text-[10px] font-bold text-amber-800 bg-amber-200 px-1.5 py-0.5 rounded">Active</span>
          )}
        </div>
      </div>

      {/* Shortlisted / Progress */}
      <div className="p-4 rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">
            Shortlisted / Progress
          </span>
          <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-extrabold text-purple-700">{shortlisted}</span>
          <span className="text-xs text-purple-600 font-medium">
            {total > 0 ? `${Math.round((shortlisted / total) * 100)}% conversion` : '0'}
          </span>
        </div>
        <div className="mt-2 text-xs text-slate-500">
          <span>Interviews & Shortlists</span>
        </div>
      </div>
    </div>
  );
};
