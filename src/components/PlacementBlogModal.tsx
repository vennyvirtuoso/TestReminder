'use client';

import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  ExternalLink,
  Sparkles,
  Check,
  AlertCircle,
  Copy,
  Building,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { CompanyApplication } from '../types';
import {
  parsePlacementBlog,
  matchBlogAnnouncementsWithApplications,
  BlogTestAnnouncement,
} from '../utils/blogParser';

interface PlacementBlogModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: CompanyApplication[];
  onUpdateApplications: (updated: CompanyApplication[]) => void;
}

const SAMPLE_BLOG_NOTICES = `---
Company: NK Securities Research Private Limited
Profile: AI/ML Researcher
Test Date: Today (5th November 2026)
Test Time: 06:00 PM - 08:00 PM
Venue: Online (HackerRank)
Instructions: System requirements: Working webcam and microphone. Link will be sent 30 mins prior to the test.

---
Company: Honda R&D
Profile: AI & Advanced Mobility Researcher
Test Date: Today (5th November 2026)
Test Time: 07:30 PM - 09:00 PM
Venue: Online (Aptitude & Technical Assessment)
Instructions: 90 mins test consisting of core algorithms, ML theory, and problem solving.

---
Company: Pace Stock Broking Services
Profile: Jr. Quantitative Researcher
Test Date: Today (5th November 2026)
Test Time: 08:30 PM - 10:00 PM
Venue: Online Test Portal
Instructions: Quantitative aptitude, probability, and mental mathematics.

---
Company: Flipkart
Profile: Data Scientist-9
Test Date: Tomorrow (6th November 2026)
Test Time: 07:00 PM - 08:30 PM
Venue: Online (Mettl)
Instructions: Mathematics, Statistics, Machine Learning, and Coding test.

---
Company: IBM
Profile: Software Engineer
Test Date: 7th November 2026
Test Time: 05:00 PM - 07:00 PM
Venue: LH 101 / Online (Cognitive & Coding Assessment)
Instructions: Offline in LH 101 for on-campus students; online link for remote applicants.

---
Company: ACCENTURE SOLUTIONS PRIVATE LIMITED
Profile: I&E - AI and Data FTE PG
Test Date: 8th November 2026
Test Time: 06:30 PM - 08:00 PM
Venue: Online (Mock Assessment & Final Cognitive Test)
Instructions: Mandatory mock test must be taken 24 hours prior to the final assessment.
`;

export const PlacementBlogModal: React.FC<PlacementBlogModalProps> = ({
  isOpen,
  onClose,
  applications,
  onUpdateApplications,
}) => {
  const [blogText, setBlogText] = useState('');
  const [parsedMatches, setParsedMatches] = useState<
    (BlogTestAnnouncement & { matchedApp: CompanyApplication })[] | null
  >(null);
  const [unmatchedList, setUnmatchedList] = useState<BlogTestAnnouncement[]>([]);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleScanText = () => {
    setError(null);
    if (!blogText.trim()) {
      setError('Please paste text or announcements from the placement blog first.');
      return;
    }

    const announcements = parsePlacementBlog(blogText);
    if (announcements.length === 0) {
      setError(
        'Could not detect any company test schedules. Make sure the text includes company names and test dates/venues.'
      );
      return;
    }

    const { matchedAnnouncements, unmatchedAnnouncements } =
      matchBlogAnnouncementsWithApplications(announcements, applications);

    setParsedMatches(matchedAnnouncements);
    setUnmatchedList(unmatchedAnnouncements);
  };

  const handleApplyUpdates = () => {
    if (!parsedMatches || parsedMatches.length === 0) return;

    const updatedApps = [...applications];

    parsedMatches.forEach((match) => {
      const idx = updatedApps.findIndex((a) => a.id === match.matchedCompanyId);
      if (idx !== -1) {
        const existing = updatedApps[idx];
        const dateFormatted = match.testTime
          ? `${match.testDate} at ${match.testTime}`
          : match.testDate;

        const newComment = {
          id: `blog-notice-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          text: `📢 Placement Blog Announcement: Test scheduled on ${dateFormatted} • Venue: ${match.venue || 'Online'}.`,
          createdAt: new Date().toISOString(),
        };

        updatedApps[idx] = {
          ...existing,
          testDate: dateFormatted,
          testPlatform: match.venue || existing.testPlatform || 'Online',
          comments: [newComment, ...existing.comments],
          updatedAt: new Date().toISOString(),
        };
      }
    });

    onUpdateApplications(updatedApps);
    alert(
      `🎉 Successfully matched and updated test schedules for ${parsedMatches.length} companies! Check the Upcoming Tests banner on your dashboard.`
    );
    onClose();
  };

  const handleCopyExtractor = () => {
    navigator.clipboard.writeText('copy(document.body.innerText)');
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-amber-50/40">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-600" />
              Placement Blog Test Scanner
            </h2>
            <p className="text-xs text-slate-500">
              Sync test dates, times, and venues from official IIT Bombay placement blog posts.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Quick link & instruction */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-amber-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-700" />
                How to sync test notices in 2 easy steps:
              </span>
              <a
                href="https://campus.placements.iitb.ac.in/blog/placement/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-blue-700 hover:text-blue-800 underline inline-flex items-center gap-1"
              >
                Open Placement Blog <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
              <li>
                Open the placement blog tab (or placement email announcement).
              </li>
              <li>
                Select and copy the test notices (or run{' '}
                <button
                  type="button"
                  onClick={handleCopyExtractor}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-200 hover:bg-slate-300 rounded font-mono text-[11px] text-slate-900 cursor-pointer"
                >
                  {copiedSnippet ? 'Copied code!' : 'copy(document.body.innerText)'}
                  <Copy className="w-3 h-3" />
                </button>{' '}
                in console).
              </li>
              <li>Paste below and click &ldquo;Scan & Match Companies&rdquo;!</li>
            </ol>
          </div>

          {/* Text Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700">
                Paste Placement Blog Text / Announcements:
              </label>
              <button
                type="button"
                onClick={() => setBlogText(SAMPLE_BLOG_NOTICES)}
                className="text-blue-600 hover:text-blue-800 font-semibold inline-flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Load Sample IITB Blog Notices
              </button>
            </div>

            <textarea
              rows={6}
              value={blogText}
              onChange={(e) => setBlogText(e.target.value)}
              placeholder="Paste announcement posts, emails, or tables from the placement blog here..."
              className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 placeholder-slate-400"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Scan Action */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => {
                setBlogText('');
                setParsedMatches(null);
                setUnmatchedList([]);
                setError(null);
              }}
              className="text-slate-500 hover:text-slate-700 text-xs cursor-pointer"
            >
              Clear
            </button>

            <button
              onClick={handleScanText}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>🔍 Scan & Match My Companies</span>
            </button>
          </div>

          {/* Parsed Matches Preview */}
          {parsedMatches && (
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Found {parsedMatches.length} Matching Applied Companies!
                </h4>
                <span className="text-[11px] text-slate-500">
                  Ready to update into your tracker
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {parsedMatches.map((match) => (
                  <div
                    key={match.id}
                    className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900">{match.matchedApp.companyName}</strong>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                          Matched
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-blue-600" />
                          {match.testDate} {match.testTime && `at ${match.testTime}`}
                        </span>
                        {match.venue && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            {match.venue}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 italic shrink-0">
                      Auto-sets date & venue
                    </span>
                  </div>
                ))}
              </div>

              {unmatchedList.length > 0 && (
                <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <strong>Other companies in blog ({unmatchedList.length}):</strong>{' '}
                  {unmatchedList.map((u) => u.companyName).join(', ')} (skipped because you haven&apos;t applied to them).
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleApplyUpdates}
                  disabled={parsedMatches.length === 0}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <span>Apply & Update Dashboard Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

