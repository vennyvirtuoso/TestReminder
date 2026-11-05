'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  Copy,
  Check,
  Bookmark,
  FileText,
  Database,
  Sparkles,
  AlertCircle,
  Puzzle,
  ExternalLink,
  Loader2,
  ShieldCheck,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';
import { parseIITBPortalInput } from '../utils/parser';
import { CompanyApplication } from '../types';
import { getIITBToken, saveIITBToken } from '../utils/storage';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportApplications: (apps: Partial<CompanyApplication>[]) => void;
  onLoadSample: () => void;
  ldapId?: string;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onImportApplications,
  onLoadSample,
  ldapId,
}) => {
  const [activeTab, setActiveTab] = useState<'token' | 'paste' | 'extension' | 'sample'>('token');
  const [tokenInput, setTokenInput] = useState('');
  const [rememberToken, setRememberToken] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchSuccess, setFetchSuccess] = useState<string | null>(null);
  const [rawText, setRawText] = useState('');
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [copiedBookmarklet, setCopiedBookmarklet] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-load saved token if any
  useEffect(() => {
    if (isOpen && ldapId) {
      const saved = getIITBToken(ldapId);
      if (saved) {
        setTokenInput(saved);
      }
    }
    setError(null);
    setFetchSuccess(null);
  }, [isOpen, ldapId]);

  if (!isOpen) return null;

  const tokenCopyBookmarkletCode =
    "javascript:(function(){try{var t=localStorage.token||(localStorage.getItem('token')||'').replace(/^\"|\"$/g,'');if(t&&t.length>10){navigator.clipboard.writeText(t).then(function(){alert('✅ Token copied to clipboard! Return to the Tracker and paste it.');});}else{alert('⚠️ No token found. Please make sure you are logged into https://campus.placements.iitb.ac.in');}}catch(e){prompt('Copy your token manually:',localStorage.token);}})();";

  const handleTokenFetch = async () => {
    setError(null);
    setFetchSuccess(null);

    const cleanToken = tokenInput.trim();
    if (!cleanToken) {
      setError('Please paste your IIT Bombay portal session token first.');
      return;
    }

    setIsFetching(true);

    try {
      const res = await fetch('/api/iitb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: cleanToken,
          ldapId: ldapId || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Server responded with status ${res.status}`);
      }

      if (!data.applications || data.applications.length === 0) {
        throw new Error(
          'IIT Bombay server returned 0 applications. Make sure you have signed/applied to jobs on the placement portal.'
        );
      }

      // Save token if user opted to remember
      if (rememberToken && ldapId) {
        saveIITBToken(ldapId, cleanToken);
      }

      setFetchSuccess(
        `🎉 Successfully synced ${data.applications.length} applications directly from IIT Bombay!`
      );

      // Import into state
      setTimeout(() => {
        onImportApplications(data.applications);
        onClose();
      }, 1000);
    } catch (err: any) {
      console.error('[Token Sync Error]:', err);
      setError(
        err.message ||
          'Failed to connect to IIT Bombay portal. Your session may have expired. Please log in again.'
      );
    } finally {
      setIsFetching(false);
    }
  };

  const handlePasteSubmit = () => {
    setError(null);
    if (!rawText.trim()) {
      setError('Please paste text or HTML table first.');
      return;
    }

    const parsed = parseIITBPortalInput(rawText);
    if (parsed.length === 0) {
      setError(
        'Could not detect any companies in the pasted text. Please make sure you copied the table from https://campus.placements.iitb.ac.in/applicant/application'
      );
      return;
    }

    onImportApplications(parsed);
    setRawText('');
    onClose();
  };

  const handleCopySnippet = () => {
    navigator.clipboard.writeText('copy(localStorage.token)');
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleCopyBookmarklet = () => {
    navigator.clipboard.writeText(tokenCopyBookmarkletCode);
    setCopiedBookmarklet(true);
    setTimeout(() => setCopiedBookmarklet(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-blue-50/30">
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-2 gap-2 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab('token');
              setError(null);
            }}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'token'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="w-4 h-4 text-blue-600" />
            <span>⚡ API Token Sync</span>
            <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded-full">
              Recommended
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('paste');
              setError(null);
            }}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'paste'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Paste Table / HTML</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('extension');
              setError(null);
            }}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'extension'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Puzzle className="w-4 h-4 text-emerald-600" />
            <span>Chrome Extension</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('sample');
              setError(null);
            }}
            className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition whitespace-nowrap ${
              activeTab === 'sample'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Sample Data</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* TAB 1: API TOKEN SYNC (NO EXTENSION REQUIRED) */}
          {activeTab === 'token' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Direct & Instant Portal Sync (No Extension Needed)</span>
                </div>
                <p className="text-blue-800 leading-relaxed">
                  Connects directly to the official IIT Bombay Placement API (
                  <code>campus.placements.iitb.ac.in/api/v1/job/application</code>
                  ) and fetches all your eligible & bonus signed applications with hiring stages.
                </p>
              </div>

              {/* Instructions */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  How to get your session token in 5 seconds:
                </h4>
                <ol className="list-decimal pl-5 space-y-2 leading-relaxed">
                  <li>
                    Open{' '}
                    <a
                      href="https://campus.placements.iitb.ac.in/applicant/application"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-bold underline inline-flex items-center gap-0.5"
                    >
                      campus.placements.iitb.ac.in <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    in your browser and log in with your LDAP.
                  </li>
                  <li>
                    Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono shadow-2xs">F12</kbd> (or right click ➔ Inspect ➔ Console tab).
                  </li>
                  <li>
                    Run this 1-line command to copy your token directly to clipboard:
                    <div className="mt-1 flex items-center gap-2">
                      <code className="bg-slate-900 text-emerald-400 px-2.5 py-1.5 rounded-lg font-mono text-[11px] flex-1 select-all">
                        copy(localStorage.token)
                      </code>
                      <button
                        type="button"
                        onClick={handleCopySnippet}
                        className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-800 font-medium text-[11px] flex items-center gap-1 transition"
                      >
                        {copiedSnippet ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-600" />
                            <span>Copy Command</span>
                          </>
                        )}
                      </button>
                    </div>
                  </li>
                  <li>Paste the token below and click Fetch!</li>
                </ol>

                {/* Optional 1-click Bookmarklet */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Prefer a bookmark button?</span>
                  <a
                    href={tokenCopyBookmarkletCode}
                    onClick={(e) => {
                      e.preventDefault();
                      handleCopyBookmarklet();
                    }}
                    className="text-blue-600 hover:text-blue-700 font-semibold underline inline-flex items-center gap-1"
                    title="Drag to Bookmarks bar: Click it on IITB portal to copy token!"
                  >
                    <Bookmark className="w-3 h-3" />
                    {copiedBookmarklet ? 'Copied Bookmark Code!' : 'Copy "Copy Token" Bookmarklet'}
                  </a>
                </div>
              </div>

              {/* Input & Action */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  IIT Bombay Session Token:
                </label>
                <div className="relative">
                  <textarea
                    rows={3}
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (Paste your token here)"
                    className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 break-all"
                  />
                  {tokenInput && (
                    <button
                      type="button"
                      onClick={() => setTokenInput('')}
                      className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-600 text-xs px-1.5 py-0.5 rounded bg-slate-100"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberToken}
                      onChange={(e) => setRememberToken(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Remember token on this device for 1-click refreshes</span>
                  </label>

                  <button
                    onClick={handleTokenFetch}
                    disabled={isFetching || !tokenInput.trim()}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-2 transition"
                  >
                    {isFetching ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Connecting to IITB...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>⚡ Fetch & Sync Applications</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {fetchSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="font-semibold">{fetchSuccess}</span>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-semibold">{error}</p>
                    <p className="text-[11px] text-rose-600">
                      Tokens expire when your session ends on the placement portal. Simply re-run{' '}
                      <code>copy(localStorage.token)</code> after logging in again.
                    </p>
                  </div>
                </div>
              )}
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
                ), select the table of applied companies, press{' '}
                <kbd className="px-1 bg-slate-100 border rounded">Cmd+C</kbd>, and paste here:
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

          {/* TAB 3: EXTENSION */}
          {activeTab === 'extension' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                  <Puzzle className="w-4 h-4 text-emerald-600" />
                  <span>Automatic Sync via Chrome Extension</span>
                </div>
                <p className="text-emerald-800 leading-relaxed">
                  Log in to the placement portal normally through your IITB SSO. The extension
                  automatically detects all applied companies and pushes them to your tracker in
                  real time.
                </p>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <h4 className="font-bold text-slate-900 text-sm">How to load in Chrome / Brave:</h4>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    Open Chrome and navigate to:{' '}
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-900">
                      chrome://extensions
                    </code>
                  </li>
                  <li>
                    Enable <strong>&ldquo;Developer mode&rdquo;</strong> in the top-right corner.
                  </li>
                  <li>
                    Click <strong>&ldquo;Load unpacked&rdquo;</strong> and select the{' '}
                    <code className="bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-mono">
                      extension
                    </code>{' '}
                    folder from the repository.
                  </li>
                  <li>
                    Open{' '}
                    <a
                      href="https://campus.placements.iitb.ac.in/applicant/application"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 font-semibold underline inline-flex items-center gap-0.5"
                    >
                      campus.placements.iitb.ac.in <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>
                    Click the floating <strong>&ldquo;🚀 Sync to Tracker Web App&rdquo;</strong>{' '}
                    widget!
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 4: SAMPLE DATA */}
          {activeTab === 'sample' && (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Load Sample IIT Bombay Applications
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                  Populate the dashboard with 6 realistic placement companies (Graviton, Google,
                  Goldman Sachs, Microsoft, McKinsey, Tower Research) to explore all tracking,
                  checkbox, and comment features immediately.
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
