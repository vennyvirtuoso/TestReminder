'use client';

import React from 'react';
import { ExternalLink, ShieldCheck, Download, Plus, Upload, User, LogOut, Trash2, BookOpen } from 'lucide-react';
import { CompanyApplication } from '../types';
import { exportToCSV, exportToJSON } from '../utils/storage';

interface NavbarProps {
  ldapId: string;
  onLogout: () => void;
  onOpenImportModal: () => void;
  onOpenBlogModal?: () => void;
  onOpenAddModal: () => void;
  onClearAll: () => void;
  onLoadSample: () => void;
  applications: CompanyApplication[];
}

export const Navbar: React.FC<NavbarProps> = ({
  ldapId,
  onLogout,
  onOpenImportModal,
  onOpenBlogModal,
  onOpenAddModal,
  onClearAll,
  onLoadSample,
  applications,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Link */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-700 via-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              IITB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-base sm:text-xl tracking-tight">
                  Placement Tracker
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hidden sm:inline-block">
                  IIT Bombay
                </span>
              </div>
              <a
                href="https://campus.placements.iitb.ac.in/applicant/application"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 transition-colors"
                title="Open official IITB Placement Portal"
              >
                campus.placements.iitb.ac.in
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active Student Badge with Switch Account / Logout */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span className="font-bold font-mono text-slate-900 max-w-[120px] truncate">
                {ldapId}
              </span>
              <button
                onClick={onLogout}
                className="ml-1 text-slate-400 hover:text-rose-600 p-0.5 rounded transition"
                title="Sign out / Switch LDAP User"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Import Button */}
            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition"
              title="Import applied companies from IITB portal"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Sync / Import</span>
            </button>

            {/* Placement Blog Button */}
            {onOpenBlogModal && (
              <button
                onClick={onOpenBlogModal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition cursor-pointer"
                title="Scan IIT Bombay Placement Blog for Test Dates & Venues"
              >
                <BookOpen className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">Placement Blog</span>
              </button>
            )}

            {/* Add Company */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Company</span>
            </button>

            {/* Export & Actions Dropdown */}
            <div className="relative group">
              <button
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
                title="Options & Export"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span className="hidden md:inline">Export</span>
              </button>
              <div className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 hidden group-hover:block z-50">
                <button
                  onClick={() => exportToCSV(applications, ldapId)}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                  disabled={applications.length === 0}
                >
                  <span>Export to CSV</span>
                  <span className="text-[10px] text-slate-400">Excel</span>
                </button>
                <button
                  onClick={() => exportToJSON(applications, ldapId)}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                  disabled={applications.length === 0}
                >
                  <span>Backup JSON</span>
                  <span className="text-[10px] text-slate-400">Full</span>
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={onLoadSample}
                  className="w-full text-left px-3 py-1.5 text-xs text-blue-600 hover:bg-blue-50"
                >
                  Load Sample Data
                </button>
                <button
                  onClick={onClearAll}
                  className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear My Data
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={onLogout}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 font-medium"
                >
                  <LogOut className="w-3 h-3 text-slate-500" />
                  Switch / Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
