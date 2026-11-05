'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Calendar,
  CheckCircle,
  Circle,
  Trash2,
  Send,
  Building,
  Tag,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import { CompanyApplication, ApplicationStatus } from '../types';

interface CompanyItemProps {
  application: CompanyApplication;
  onToggleTestGiven: (id: string) => void;
  onToggleInterviewShortlist?: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus | string) => void;
  onAddComment: (id: string, commentText: string) => void;
  onDeleteComment: (companyId: string, commentId: string) => void;
  onDeleteCompany: (id: string) => void;
  onUpdateTestDetails?: (id: string, testDate: string, testPlatform: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  Applied: 'bg-blue-50 text-blue-700 border-blue-200',
  Shortlisted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Test Shortlisted': 'bg-teal-50 text-teal-700 border-teal-200',
  Interview: 'bg-purple-50 text-purple-700 border-purple-200',
  Selected: 'bg-green-100 text-green-800 border-green-300 font-bold',
  Waitlisted: 'bg-amber-50 text-amber-700 border-amber-200',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  Closed: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const CompanyItem: React.FC<CompanyItemProps> = ({
  application,
  onToggleTestGiven,
  onToggleInterviewShortlist,
  onUpdateStatus,
  onAddComment,
  onDeleteComment,
  onDeleteCompany,
  onUpdateTestDetails,
}) => {
  const [isCommentsOpen, setIsCommentsOpen] = useState(application.comments.length > 0);
  const [newComment, setNewComment] = useState('');
  const [isEditingTest, setIsEditingTest] = useState(false);
  const [testDate, setTestDate] = useState(application.testDate || '');
  const [testPlatform, setTestPlatform] = useState(application.testPlatform || '');

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    onAddComment(application.id, newComment.trim());
    setNewComment('');
    setIsCommentsOpen(true);
  };

  const handleSaveTestDetails = () => {
    if (onUpdateTestDetails) {
      onUpdateTestDetails(application.id, testDate, testPlatform);
    }
    setIsEditingTest(false);
  };

  const statusBadgeStyle =
    STATUS_COLORS[application.status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-md ${
        application.testGiven
          ? 'border-slate-200 hover:border-emerald-300'
          : 'border-amber-200/80 bg-amber-50/10 hover:border-amber-400'
      }`}
    >
      {/* Main Row / Card Content */}
      <div className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Left: Company & Role Details */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900 text-lg sm:text-xl tracking-tight truncate">
                {application.companyName}
              </span>

              {/* Status Selector */}
              <div className="relative inline-block">
                <select
                  value={application.status}
                  onChange={(e) => onUpdateStatus(application.id, e.target.value)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer appearance-none pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500 ${statusBadgeStyle}`}
                >
                  <option value="Applied">Applied</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview">Interview</option>
                  <option value="Selected">Selected 🎉</option>
                  <option value="Test Shortlisted">Test Shortlisted</option>
                  <option value="Waitlisted">Waitlisted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Closed">Closed</option>
                </select>
                <ChevronDown className="w-3 h-3 absolute right-2 top-2 pointer-events-none text-current opacity-70" />
              </div>

              {application.jafId && (
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono border border-slate-200">
                  {application.jafId}
                </span>
              )}

              {application.shortlistedForInterview && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold border border-purple-300 inline-flex items-center gap-1 shadow-2xs">
                  🎯 Interview Shortlist
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-y-1 gap-x-3 text-xs sm:text-sm text-slate-600">
              <span className="font-medium text-slate-800 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {application.profile}
              </span>

              {application.appliedDate && (
                <span className="text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Applied: {application.appliedDate}
                </span>
              )}

              {application.ctc && (
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  {application.ctc}
                </span>
              )}
            </div>
          </div>

          {/* Right: TEST GIVEN / SHORTLIST Controls */}
          <div className="flex items-center flex-wrap gap-2.5">
            {/* The Shortlisted for Interview Button */}
            <button
              type="button"
              onClick={() => onToggleInterviewShortlist && onToggleInterviewShortlist(application.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none ${
                application.shortlistedForInterview
                  ? 'bg-purple-600 text-white border-purple-700 shadow-xs hover:bg-purple-700'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300'
              }`}
              title="Click to toggle: Shortlisted for Interview"
            >
              <span>{application.shortlistedForInterview ? '🎯' : '⚪'}</span>
              <span>
                {application.shortlistedForInterview ? 'Shortlisted' : 'Shortlist?'}
              </span>
            </button>

            {/* The Main Test Checkbox */}
            <div
              onClick={() => onToggleTestGiven(application.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border transition-all cursor-pointer select-none ${
                application.testGiven
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100 ring-1 ring-amber-200/50'
              }`}
              title="Click to toggle: Test Given vs Test Not Given"
            >
              <input
                type="checkbox"
                checked={application.testGiven}
                onChange={() => {}} // handled by parent div onClick
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer pointer-events-none"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                  {application.testGiven ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Test Given
                    </>
                  ) : (
                    <>
                      <Circle className="w-3.5 h-3.5 text-amber-600" />
                      Test Not Given
                    </>
                  )}
                </span>
                <span className="text-[10px] text-slate-500">
                  {application.testGiven ? 'Marked complete' : 'Action pending'}
                </span>
              </div>
            </div>

            {/* Test Details / Date Badge or Edit Button */}
            <button
              onClick={() => setIsEditingTest(!isEditingTest)}
              className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
              title="Add or edit test platform and date"
            >
              {application.testDate || application.testPlatform ? (
                <span className="flex items-center gap-1 text-slate-700 font-medium">
                  <Clock className="w-3 h-3 text-blue-500" />
                  {application.testPlatform || 'Test'}: {application.testDate || 'Set date'}
                </span>
              ) : (
                <span className="text-slate-400">+ Test Date</span>
              )}
            </button>

            {/* Delete Company Button */}
            <button
              onClick={() => onDeleteCompany(application.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
              title="Remove company application"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Optional Test Date & Platform Editor Inline */}
        {isEditingTest && (
          <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-wrap items-center gap-3 text-xs">
            <span className="font-medium text-slate-700">Test Info:</span>
            <input
              type="text"
              placeholder="Platform (e.g. HackerRank, Mettl, CodeSignal)"
              value={testPlatform}
              onChange={(e) => setTestPlatform(e.target.value)}
              className="px-2.5 py-1 border border-slate-300 rounded bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              className="px-2.5 py-1 border border-slate-300 rounded bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleSaveTestDetails}
              className="px-3 py-1 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 cursor-pointer"
            >
              Save
            </button>
            {application.testDate && (
              <button
                type="button"
                onClick={() => {
                  setTestDate('');
                  setTestPlatform('');
                  if (onUpdateTestDetails) {
                    onUpdateTestDetails(application.id, '', '');
                  }
                  setIsEditingTest(false);
                }}
                className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded border border-rose-200 font-medium cursor-pointer"
                title="Clear test date and venue"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsEditingTest(false)}
              className="px-2 py-1 text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Comments Toggle Button */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
          >
            <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
            <span>Comments & Notes</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px]">
              {application.comments.length}
            </span>
            {isCommentsOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>

          {!isCommentsOpen && application.comments.length > 0 && (
            <span className="text-xs text-slate-400 italic truncate max-w-[300px]">
              Latest: &ldquo;{application.comments[application.comments.length - 1].text}&rdquo;
            </span>
          )}
        </div>
      </div>

      {/* Expanded Comments Section */}
      {isCommentsOpen && (
        <div className="bg-slate-50/70 border-t border-slate-100 p-4 sm:p-5">
          {/* List of comments */}
          {application.comments.length > 0 ? (
            <div className="space-y-2 mb-3">
              {application.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs text-xs sm:text-sm flex items-start justify-between gap-3 group"
                >
                  <div className="flex-1">
                    <p className="text-slate-800 whitespace-pre-wrap">{comment.text}</p>
                    <span className="text-[10px] text-slate-400 mt-1 inline-block">
                      {new Date(comment.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteComment(application.id, comment.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition"
                    title="Delete note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic mb-3">
              No notes or comments added yet for {application.companyName}. Record OA questions, test dates, interview feedback, etc.
            </p>
          )}

          {/* New Comment Input Form */}
          <form onSubmit={handleAddCommentSubmit} className="flex gap-2">
            <input
              type="text"
              placeholder={`Add a comment / prep note for ${application.companyName}...`}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 text-xs sm:text-sm px-3.5 py-2 bg-white border border-slate-300 rounded-lg placeholder-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="px-3.5 py-2 bg-blue-600 disabled:bg-slate-300 text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition hover:bg-blue-700 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

