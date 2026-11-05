'use client';

import React from 'react';
import {
  Bell,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { CompanyApplication } from '../types';

interface UpcomingTestsBannerProps {
  applications: CompanyApplication[];
  onOpenBlogModal: () => void;
  onToggleTestGiven: (id: string) => void;
}

export const UpcomingTestsBanner: React.FC<UpcomingTestsBannerProps> = ({
  applications,
  onOpenBlogModal,
  onToggleTestGiven,
}) => {
  // Find all applications that have a testDate and where test is pending (not yet given)
  const upcomingTests = applications.filter(
    (app) => !app.testGiven && (app.testDate || app.testPlatform)
  );

  return (
    <div className="mb-6">
      {upcomingTests.length > 0 ? (
        <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 shadow-sm overflow-hidden animate-in fade-in duration-300">
          {/* Header */}
          <div className="px-5 py-3.5 bg-amber-500/10 border-b border-amber-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
              </span>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-amber-700" />
                  Upcoming Tests Alert
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-extrabold text-xs border border-rose-200">
                  {upcomingTests.length} Pending
                </span>
              </div>
            </div>

            <button
              onClick={onOpenBlogModal}
              className="text-xs font-semibold text-amber-900 hover:text-amber-950 bg-amber-200/70 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
            >
              <span>Scan Blog for New Tests</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Test Cards List */}
          <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {upcomingTests.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-xl p-3.5 border border-amber-200 shadow-2xs hover:shadow-xs transition flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-bold text-slate-900 text-sm leading-tight truncate">
                      {test.companyName}
                    </h4>
                    {test.shortlistedForInterview && (
                      <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded border border-purple-200 shrink-0">
                        Interview Shortlist
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{test.profile}</p>

                  {/* Schedule Details */}
                  <div className="mt-2.5 space-y-1.5 text-xs">
                    {test.testDate && (
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span>{test.testDate}</span>
                      </div>
                    )}
                    {test.testPlatform && (
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{test.testPlatform}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mark as Given Button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    Action Required
                  </span>
                  <button
                    onClick={() => onToggleTestGiven(test.id)}
                    className="px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition flex items-center gap-1 cursor-pointer"
                    title="Mark this test as completed"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mark Given</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty / Compact Notice */
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-700">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 mr-1.5">Placement Blog Test Radar:</span>
              <span className="text-slate-600">
                Keep your test dates and venues synchronized with official blog posts.
              </span>
            </div>
          </div>
          <button
            onClick={onOpenBlogModal}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition shadow-2xs flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <span>Scan Placement Blog</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
