'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  Sparkles,
  Plus,
  Upload,
  CheckCircle2,
  Clock,
  Building,
  Info,
} from 'lucide-react';
import { CompanyApplication, ApplicationStatus, FilterTestStatus } from '../types';
import {
  getStoredApplications,
  saveStoredApplications,
  getStoredLdap,
  saveStoredLdap,
  clearAllData,
} from '../utils/storage';
import { SAMPLE_APPLICATIONS } from '../utils/sampleData';
import { Navbar } from '../components/Navbar';
import { StatsCards } from '../components/StatsCards';
import { CompanyItem } from '../components/CompanyItem';
import { CompanyTableView } from '../components/CompanyTableView';
import { ImportModal } from '../components/ImportModal';
import { AddCompanyModal } from '../components/AddCompanyModal';
import { LdapModal } from '../components/LdapModal';

export default function Home() {
  const [applications, setApplications] = useState<CompanyApplication[]>([]);
  const [ldapId, setLdapId] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [testFilter, setTestFilter] = useState<FilterTestStatus>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'testPending'>('testPending');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLdapModalOpen, setIsLdapModalOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const storedApps = getStoredApplications();
    const storedLdap = getStoredLdap();

    if (storedApps.length > 0) {
      setApplications(storedApps);
    } else {
      // Load sample applications on first ever visit so user has immediate visual feedback
      setApplications(SAMPLE_APPLICATIONS);
      saveStoredApplications(SAMPLE_APPLICATIONS);
    }

    if (storedLdap) {
      setLdapId(storedLdap);
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever applications change
  const updateApplications = (newApps: CompanyApplication[]) => {
    setApplications(newApps);
    saveStoredApplications(newApps);
  };

  // Toggle Test Given Checkbox
  const handleToggleTestGiven = (id: string) => {
    const updated = applications.map((app) => {
      if (app.id === id) {
        return {
          ...app,
          testGiven: !app.testGiven,
          updatedAt: new Date().toISOString(),
        };
      }
      return app;
    });
    updateApplications(updated);
  };

  // Update Status
  const handleUpdateStatus = (id: string, newStatus: ApplicationStatus | string) => {
    const updated = applications.map((app) => {
      if (app.id === id) {
        return {
          ...app,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
      }
      return app;
    });
    updateApplications(updated);
  };

  // Add Comment
  const handleAddComment = (id: string, text: string) => {
    const updated = applications.map((app) => {
      if (app.id === id) {
        return {
          ...app,
          comments: [
            ...app.comments,
            {
              id: `comment-${Date.now()}`,
              text: text,
              createdAt: new Date().toISOString(),
            },
          ],
          updatedAt: new Date().toISOString(),
        };
      }
      return app;
    });
    updateApplications(updated);
  };

  // Delete Comment
  const handleDeleteComment = (companyId: string, commentId: string) => {
    const updated = applications.map((app) => {
      if (app.id === companyId) {
        return {
          ...app,
          comments: app.comments.filter((c) => c.id !== commentId),
          updatedAt: new Date().toISOString(),
        };
      }
      return app;
    });
    updateApplications(updated);
  };

  // Delete Company
  const handleDeleteCompany = (id: string) => {
    if (confirm('Are you sure you want to remove this company?')) {
      const updated = applications.filter((app) => app.id !== id);
      updateApplications(updated);
    }
  };

  // Update Test Details
  const handleUpdateTestDetails = (id: string, testDate: string, testPlatform: string) => {
    const updated = applications.map((app) => {
      if (app.id === id) {
        return {
          ...app,
          testDate,
          testPlatform,
          updatedAt: new Date().toISOString(),
        };
      }
      return app;
    });
    updateApplications(updated);
  };

  // Import Applications
  const handleImportApplications = (imported: Partial<CompanyApplication>[]) => {
    const newItems: CompanyApplication[] = imported.map((item, idx) => ({
      id: item.id || `app-${Date.now()}-${idx}`,
      companyName: item.companyName || 'Company',
      profile: item.profile || 'General',
      jafId: item.jafId || undefined,
      status: item.status || 'Applied',
      appliedDate: item.appliedDate || '',
      testGiven: Boolean(item.testGiven),
      testDate: item.testDate || '',
      testPlatform: item.testPlatform || '',
      comments: item.comments || [],
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
    }));

    // Merge by companyName + profile to avoid duplicate entries
    const existingMap = new Map<string, CompanyApplication>();
    applications.forEach((app) => {
      const key = `${app.companyName.toLowerCase()}_${app.profile.toLowerCase()}`;
      existingMap.set(key, app);
    });

    newItems.forEach((item) => {
      const key = `${item.companyName.toLowerCase()}_${item.profile.toLowerCase()}`;
      if (existingMap.has(key)) {
        const existing = existingMap.get(key)!;
        existingMap.set(key, {
          ...existing,
          status: item.status || existing.status,
          jafId: item.jafId || existing.jafId,
          appliedDate: item.appliedDate || existing.appliedDate,
        });
      } else {
        existingMap.set(key, item);
      }
    });

    const merged = Array.from(existingMap.values());
    updateApplications(merged);
  };

  // Load Sample Data
  const handleLoadSample = () => {
    updateApplications(SAMPLE_APPLICATIONS);
  };

  // Clear All
  const handleClearAll = () => {
    if (confirm('Clear all stored placement applications and notes?')) {
      clearAllData();
      setApplications([]);
      setLdapId('');
    }
  };

  // Save LDAP
  const handleSaveLdap = (id: string) => {
    setLdapId(id);
    saveStoredLdap(id);
  };

  // Filter & Sort
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = app.companyName.toLowerCase().includes(q);
          const matchesProfile = app.profile.toLowerCase().includes(q);
          const matchesJaf = app.jafId ? app.jafId.toLowerCase().includes(q) : false;
          const matchesComments = app.comments.some((c) => c.text.toLowerCase().includes(q));
          if (!matchesName && !matchesProfile && !matchesJaf && !matchesComments) {
            return false;
          }
        }

        // Test Given filter
        if (testFilter === 'given' && !app.testGiven) return false;
        if (testFilter === 'not_given' && app.testGiven) return false;

        // Status filter
        if (statusFilter !== 'all' && app.status.toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'testPending') {
          // Not given first
          if (a.testGiven !== b.testGiven) {
            return a.testGiven ? 1 : -1;
          }
          return a.companyName.localeCompare(b.companyName);
        }
        if (sortBy === 'name') {
          return a.companyName.localeCompare(b.companyName);
        }
        // Recent
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [applications, searchQuery, testFilter, statusFilter, sortBy]);

  if (!isLoaded) {
    return null; // or loading spinner
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navigation Bar */}
      <Navbar
        ldapId={ldapId}
        onOpenLdapModal={() => setIsLdapModalOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onClearAll={handleClearAll}
        onLoadSample={handleLoadSample}
        applications={applications}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner with Official Portal reminder */}
        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base">IIT Bombay Placement Application Monitor</span>
              <span className="text-[11px] font-semibold bg-blue-500/30 border border-blue-400/40 text-blue-200 px-2 py-0.5 rounded-full">
                Phase 1 & 2
              </span>
            </div>
            <p className="text-xs text-blue-100 mt-1 max-w-2xl leading-relaxed">
              Track companies applied at <code className="bg-black/20 px-1 py-0.5 rounded text-sky-200">campus.placements.iitb.ac.in/applicant/application</code>. Mark tests as Given or Not Given, take notes, and keep private records on your browser.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-3.5 py-2 bg-white text-blue-900 font-bold text-xs rounded-lg hover:bg-blue-50 shadow-xs transition flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5 text-blue-700" />
              Sync Applied Companies
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <StatsCards
          applications={applications}
          selectedTestFilter={testFilter}
          onSelectTestFilter={setTestFilter}
        />

        {/* Filter and Control Bar */}
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs mb-6 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by company name, role, JAF ID, or comments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* View Mode Toggle (Cards vs Table) */}
            <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-slate-50 self-end md:self-auto">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition ${
                  viewMode === 'cards'
                    ? 'bg-white shadow-xs text-blue-600 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Detailed Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition ${
                  viewMode === 'table'
                    ? 'bg-white shadow-xs text-blue-600 font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Dense Spreadsheet Table View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>
          </div>

          {/* Secondary Filter Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
            {/* Test Given Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 font-medium mr-1">Test Status:</span>
              <button
                onClick={() => setTestFilter('all')}
                className={`px-2.5 py-1 rounded-full font-medium transition ${
                  testFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({applications.length})
              </button>
              <button
                onClick={() => setTestFilter('not_given')}
                className={`px-2.5 py-1 rounded-full font-medium flex items-center gap-1 transition ${
                  testFilter === 'not_given'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <Clock className="w-3 h-3" />
                Test Pending ({applications.filter((a) => !a.testGiven).length})
              </button>
              <button
                onClick={() => setTestFilter('given')}
                className={`px-2.5 py-1 rounded-full font-medium flex items-center gap-1 transition ${
                  testFilter === 'given'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                Test Given ({applications.filter((a) => a.testGiven).length})
              </button>
            </div>

            {/* Dropdown Filters: Application Status & Sort */}
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1 border border-slate-300 rounded-lg bg-white text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Application Stages</option>
                <option value="Applied">Applied</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interview">Interview</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1 border border-slate-300 rounded-lg bg-white text-slate-700 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="testPending">Sort: Test Pending First</option>
                <option value="name">Sort: Company Name (A-Z)</option>
                <option value="recent">Sort: Recently Added</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications List */}
        {filteredApplications.length > 0 ? (
          viewMode === 'cards' ? (
            <div className="space-y-3">
              {filteredApplications.map((app) => (
                <CompanyItem
                  key={app.id}
                  application={app}
                  onToggleTestGiven={handleToggleTestGiven}
                  onUpdateStatus={handleUpdateStatus}
                  onAddComment={handleAddComment}
                  onDeleteComment={handleDeleteComment}
                  onDeleteCompany={handleDeleteCompany}
                  onUpdateTestDetails={handleUpdateTestDetails}
                />
              ))}
            </div>
          ) : (
            <CompanyTableView
              applications={filteredApplications}
              onToggleTestGiven={handleToggleTestGiven}
              onUpdateStatus={handleUpdateStatus}
              onAddComment={handleAddComment}
              onDeleteComment={handleDeleteComment}
              onDeleteCompany={handleDeleteCompany}
            />
          )
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto my-8">
            <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Building className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">No companies found</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {applications.length === 0
                ? 'You have not added any companies yet. Sync directly from the IITB Placement portal or load sample data.'
                : 'No companies match your current search and filters. Try clearing your filters.'}
            </p>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {applications.length === 0 ? (
                <>
                  <button
                    onClick={() => setIsImportModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Sync from IITB Portal
                  </button>
                  <button
                    onClick={handleLoadSample}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition"
                  >
                    Load Sample Data
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setTestFilter('all');
                    setStatusFilter('all');
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">IIT Bombay Placement Companion</span>
            <span>•</span>
            <span className="text-slate-400">100% Client-Side Privacy</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <a
              href="https://campus.placements.iitb.ac.in/applicant/application"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition"
            >
              IITB Portal
            </a>
            <span>•</span>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="hover:text-blue-600 transition"
            >
              Sync Tool
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportApplications={handleImportApplications}
        onLoadSample={handleLoadSample}
      />

      <AddCompanyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={(newComp) => {
          const comp: CompanyApplication = {
            id: `manual-${Date.now()}`,
            companyName: newComp.companyName || 'Company',
            profile: newComp.profile || 'Role',
            jafId: newComp.jafId,
            status: newComp.status || 'Applied',
            testGiven: Boolean(newComp.testGiven),
            testDate: newComp.testDate,
            testPlatform: newComp.testPlatform,
            comments: newComp.comments || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          updateApplications([comp, ...applications]);
        }}
      />

      <LdapModal
        isOpen={isLdapModalOpen}
        onClose={() => setIsLdapModalOpen(false)}
        currentLdapId={ldapId}
        onSaveLdapId={handleSaveLdap}
      />
    </div>
  );
}
