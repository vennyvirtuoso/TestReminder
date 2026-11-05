'use client';

import React from 'react';
import { ExternalLink, ShieldCheck, Download, Plus, Upload, User, Trash2 } from 'lucide-react';
import { CompanyApplication } from '../types';
import { exportToCSV, exportToJSON } from '../utils/storage';

interface NavbarProps {
  ldapId: string;
  onOpenLdapModal: () => void;
  onOpenImportModal: () => void;
  onOpenAddModal: () => void;
  onClearAll: () => void;
  onLoadSample: () => void;
  applications: CompanyApplication[];
}

export const Navbar: React.FC<NavbarProps> = ({
  ldapId,
  onOpenLdapModal,
  onOpenImportModal,
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
                <h1 className="font-bold text-slate-900 text-lg sm:text-xl tracking-tight">
                  Placement Tracker
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
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
            {/* LDAP Profile Badge */}
            <button
              onClick={onOpenLdapModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
              title="Manage your IITB LDAP ID (100% private to your browser)"
            >
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">LDAP:</span>
              <span className="font-semibold text-slate-900 max-w-[100px] truncate">
                {ldapId ? ldapId : 'Set ID'}
              </span>
              <span title="Private local storage">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </span>
            </button>

            {/* Import Button */}
            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Sync / Import</span>
            </button>

            {/* Add Company */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Company</span>
            </button>

            {/* Export Dropdown */}
            <div className="relative group">
              <button
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
                title="Export or download your data"
              >
                <Download className="w-4 h-4 text-slate-500" />
                <span className="hidden md:inline">Export</span>
              </button>
              <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1.5 hidden group-hover:block z-50">
                <button
                  onClick={() => exportToCSV(applications)}
                  className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                  disabled={applications.length === 0}
                >
                  <span>Export to CSV</span>
                  <span className="text-[10px] text-slate-400">Excel</span>
                </button>
                <button
                  onClick={() => exportToJSON(applications)}
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
                  className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
