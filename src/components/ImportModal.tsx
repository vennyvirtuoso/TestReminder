'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Bookmark, FileText, Code, Database, Sparkles, AlertCircle, Puzzle, ExternalLink } from 'lucide-react';
import { parseIITBPortalInput } from '../utils/parser';
import { getBookmarkletCode, getConsoleSnippet } from '../utils/bookmarklet';
import { CompanyApplication } from '../types';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportApplications: (apps: Partial<CompanyApplication>[]) => void;
  onLoadSample: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportApplications,
  onLoadSample,
}) => {
  const [activeTab, setActiveTab] = useState<'extension' | 'bookmarklet' | 'paste' | 'console' | 'sample'>('extension');
  const [rawText, setRawText] = useState('');
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);
  const [copiedConsole, setCopiedConsole] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const bookmarkletCode = getBookmarkletCode();
  const consoleCode = getConsoleSnippet();

  const handlePasteSubmit = () => {
    setError(null);
    if (!rawText.trim()) {
      setError('Please paste text or HTML table first.');
      return;
    }

    const parsed = parseIITBPortalInput(rawText);
    if (parsed.length === 0) {
      setError('Could not detect any companies in the pasted text. Please make sure you copied the table from https://campus.placements.iitb.ac.in/applicant/application');
      return;
    }

    onImportApplications(parsed);
    setRawText('');
    onClose();
  };

  const handleCopyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletCode);
    setCopiedBookmarklet(true);
    setTimeout(() => setCopiedBookmarklet(false), 2000);
  };

  const handleCopyConsole = () => {
    navigator.clipboard.writeText(consoleCode);
    setCopiedConsole(true);
    setTimeout(() => setCopiedConsole(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Sync from IIT Bombay Placement Portal
            </h2>
            <p className="text-xs text-slate-500">
              100% private to your browser. Your credentials are never seen by any server.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-2 gap-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('extension')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'extension'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Puzzle className="w-4 h-4 text-emerald-600" />
            Chrome Extension (Auto-Sync)
          </button>
          <button
            onClick={() => setActiveTab('bookmarklet')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'bookmarklet'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            1-Click Bookmarklet
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'paste'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            Paste Table / HTML
          </button>
          <button
            onClick={() => setActiveTab('console')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'console'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code className="w-4 h-4" />
            Console Script
          </button>
          <button
            onClick={() => setActiveTab('sample')}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'sample'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Sample Data
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* TAB 0: CHROME EXTENSION (AUTO-SYNC) */}
          {activeTab === 'extension' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                  <Puzzle className="w-4 h-4 text-emerald-600" />
                  <span>Automatic Sync via Chrome Extension</span>
                </div>
                <p className="text-emerald-800 leading-relaxed">
                  Log in to the placement portal normally through your IITB SSO. The extension will automatically detect all applied companies and push them to your tracker in real time!
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <h4 className="font-bold text-slate-900 text-sm">How to load in Chrome / Brave (30 seconds):</h4>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    Open Chrome and type in address bar: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-900">chrome://extensions</code>
                  </li>
                  <li>
                    Enable <strong>&ldquo;Developer mode&rdquo;</strong> toggle in the top-right corner.
                  </li>
                  <li>
                    Click the <strong>&ldquo;Load unpacked&rdquo;</strong> button in the top-left.
                  </li>
                  <li>
                    Select the <code className="bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-mono">extension</code> folder from your project directory.
                  </li>
                  <li>
                    Open <a href="https://campus.placements.iitb.ac.in/applicant/application" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold underline inline-flex items-center gap-0.5">campus.placements.iitb.ac.in <ExternalLink className="w-3 h-3" /></a> and log in via IITB SSO.
                  </li>
                  <li>
                    A floating <strong>&ldquo;🚀 Sync to Tracker Web App&rdquo;</strong> widget will automatically appear on the page! Click it to sync immediately.
                  </li>
                </ol>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800">Extension folder path:</span>
                  <div className="font-mono text-slate-500 mt-0.5 select-all">TestReminder/extension</div>
                </div>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-md text-[11px]">
                  Manifest V3 Ready
                </span>
              </div>
            </div>
          )}

          {/* TAB 1: BOOKMARKLET */}
          {activeTab === 'bookmarklet' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-2">
                <p className="font-semibold text-sm text-blue-950">How it works:</p>
                <ol className="list-decimal pl-4 space-y-1 text-slate-700">
                  <li>
                    Drag the button below to your browser Bookmarks Bar (or click &ldquo;Copy Code&rdquo; and save as a bookmark).
                  </li>
                  <li>
                    Open{' '}
                    <a
                      href="https://campus.placements.iitb.ac.in/applicant/application"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-semibold text-blue-700"
                    >
                      campus.placements.iitb.ac.in/applicant/application
                    </a>{' '}
                    and log in with your IITB LDAP.
                  </li>
                  <li>
                    Click the bookmark! It instantly extracts your applied companies and copies them to your clipboard.
                  </li>
                  <li>
                    Come back here and paste into the &ldquo;Paste Table&rdquo; tab!
                  </li>
                </ol>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <a
                  href={bookmarkletCode}
                  onClick={(e) => {
                    // Prevent normal navigation if clicked directly
                    e.preventDefault();
                    handleCopyBookmarklet();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 cursor-grab active:cursor-grabbing transition"
                  title="Drag this button to your Bookmarks Bar!"
                >
                  <Bookmark className="w-4 h-4" />
                  📥 Drag Me to Bookmarks Bar
                </a>

                <button
                  onClick={handleCopyBookmarklet}
                  className="w-full sm:w-auto px-4 py-2.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-1.5 transition"
                >
                  {copiedBookmarklet ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      Copied Bookmarklet Code!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      Copy Bookmarklet Code
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PASTE TABLE / HTML */}
          {activeTab === 'paste' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                On the IITB portal (
                <code className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded">
                  campus.placements.iitb.ac.in/applicant/application
                </code>
                ), select the table of applied companies, press <kbd className="px-1 bg-slate-100 border rounded">Cmd+C</kbd>, and paste here:
              </p>

              <textarea
                rows={7}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste copied table rows, JSON from bookmarklet, or raw HTML here..."
                className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              />

              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setRawText('')}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                >
                  Clear
                </button>
                <button
                  onClick={handlePasteSubmit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                >
                  Parse & Import Companies
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CONSOLE SCRIPT */}
          {activeTab === 'console' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Fastest for power users! Open Chrome DevTools (<kbd className="px-1 bg-slate-100 border rounded">Cmd + Option + J</kbd>) on the IITB portal, paste this script, and press Enter:
              </p>

              <div className="relative">
                <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] overflow-x-auto max-h-48 font-mono">
                  {consoleCode}
                </pre>
                <button
                  onClick={handleCopyConsole}
                  className="absolute top-2 right-2 px-2.5 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-xs font-medium flex items-center gap-1 transition"
                >
                  {copiedConsole ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedConsole ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-500">
                It will copy all applications to your clipboard as JSON. Then switch to &ldquo;Paste Table&rdquo; tab and paste it!
              </p>
            </div>
          )}

          {/* TAB 4: SAMPLE DATA */}
          {activeTab === 'sample' && (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Load Sample IIT Bombay Applications</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Populate the dashboard with 6 realistic placement companies (Graviton, Google, Goldman Sachs, Microsoft, McKinsey, Tower Research) to explore all tracking, checkbox, and comment features immediately.
                </p>
              </div>
              <button
                onClick={() => {
                  onLoadSample();
                  onClose();
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                Load Sample Data Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

