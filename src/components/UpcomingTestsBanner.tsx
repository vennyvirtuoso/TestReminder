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
  AlertTriangle,
  RefreshCw,
  Flame,
} from 'lucide-react';
import { CompanyApplication } from '../types';
import { isTestToday } from '../utils/blogParser';

interface UpcomingTestsBannerProps {
  applications: CompanyApplication[];
  onOpenBlogModal: () => void;
  onToggleTestGiven: (id: string) => void;
  isScanning?: boolean;
  onTriggerAutoScan?: () => void;
  lastScannedTime?: string | null;
}

export const UpcomingTestsBanner: React.FC<UpcomingTestsBannerProps> = ({
  applications,
  onOpenBlogModal,
  onToggleTestGiven,
  isScanning = false,
  onTriggerAutoScan,
  lastScannedTime,
}) => {
  // Find all pending tests
  const pendingTests = applications.filter(
    (app) => !app.testGiven && (app.testDate || app.testPlatform)
  );

  // Separate tests happening TODAY vs later
  const testsToday = pendingTests.filter((app) => isTestToday(app.testDate));
  const testsUpcomingLater = pendingTests.filter((app) => !isTestToday(app.testDate));

  return (
    <div className="mb-6 space-y-4">
      {/* 1. CRITICAL TODAY ALERT BANNER (If any tests are today) */}
      {testsToday.length > 0 && (
        <div className="rounded-2xl border-2 border-rose-500 bg-gradient-to-r from-rose-50 via-red-50 to-rose-50 shadow-lg overflow-hidden animate-pulse-subtle">
          <div className="px-5 py-3.5 bg-rose-600 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3.5 w-3.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-90" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white" />
              </span>
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-300 fill-amber-300" />
                <h3 className="font-black text-white text-base tracking-tight uppercase">
                  🚨 Placement Test Happening Today!
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-white text-rose-700 font-extrabold text-xs shadow-2xs">
                {testsToday.length} Test{testsToday.length > 1 ? 's' : ''} Today
              </span>
            </div>

            <span className="text-xs font-semibold text-rose-100">
              Prepare now & check your login link!
            </span>
          </div>

          {/* Today's Test Cards */}
          <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {testsToday.map((test) => (
              <div
                key={test.id}
                className="bg-white rounded-xl p-4 border-2 border-rose-200 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-3 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-rose-600 text-white font-black text-[10px] uppercase px-3 py-0.5 rounded-bl-lg tracking-wider">
                  TODAY
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 text-base leading-tight pr-14 truncate">
                    {test.companyName}
                  </h4>
                  <p className="text-xs font-semibold text-slate-600 mt-0.5 truncate">
                    {test.profile}
                  </p>

                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-rose-700 font-bold bg-rose-50 px-2 py-1 rounded-lg border border-rose-100">
                      <Clock className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{test.testDate}</span>
                    </div>

                    {test.testPlatform && (
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{test.testPlatform}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Action */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                    Pending Action
                  </span>
                  <button
                    onClick={() => onToggleTestGiven(test.id)}
                    className="px-3 py-1.5 text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                    title="Click when you have finished this test"
                  >
                    <CheckCircle className="w-4 h-4 text-white" />
                    <span>Mark Test Given</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. UPCOMING TESTS BANNER (Future Tests) */}
      {testsUpcomingLater.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 shadow-sm overflow-hidden animate-in fade-in duration-300">
          <div className="px-5 py-3.5 bg-amber-500/10 border-b border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-500" />
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                  <Bell className="w-4 h-4 text-amber-700" />
                  Upcoming Tests Schedule
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300">
                  {testsUpcomingLater.length} Upcoming
                </span>
                <span className="text-[11px] text-emerald-800 bg-emerald-100/80 border border-emerald-300 px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Auto-scanning Blog (every 20m)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onTriggerAutoScan && (
                <button
                  type="button"
                  onClick={onTriggerAutoScan}
                  disabled={isScanning}
                  className="text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-2xs"
                  title="Scan Placement Blog & Activities right now"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-amber-600 ${isScanning ? 'animate-spin' : ''}`} />
                  <span>{isScanning ? 'Scanning...' : 'Scan Now'}</span>
                </button>
              )}

              <button
                onClick={onOpenBlogModal}
                className="text-xs font-semibold text-amber-900 hover:text-amber-950 bg-amber-200/70 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <span>Blog Scanner</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {testsUpcomingLater.map((test) => (
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

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    Scheduled
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
      )}

      {/* 3. Empty State (When no tests have dates yet) */}
      {pendingTests.length === 0 && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-700">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 mr-1.5">Placement Blog Test Radar:</span>
              <span className="text-slate-600">
                Scanning <code className="text-blue-700 bg-blue-100/50 px-1 py-0.5 rounded">campus.placements.iitb.ac.in/blog/placement/</code> every 20 minutes for test dates & venues.
              </span>
              {lastScannedTime && (
                <span className="ml-2 text-slate-400 text-[11px]">
                  (Last scan: {lastScannedTime})
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onTriggerAutoScan && (
              <button
                type="button"
                onClick={onTriggerAutoScan}
                disabled={isScanning}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold rounded-lg text-xs transition shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Scanning...' : 'Scan Now'}</span>
              </button>
            )}
            <button
              onClick={onOpenBlogModal}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition shadow-2xs flex items-center gap-1 cursor-pointer"
            >
              <span>Blog Details</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
