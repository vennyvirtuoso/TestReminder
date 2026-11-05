'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  CheckCircle,
  Circle,
  Trash2,
  ChevronDown,
  ChevronUp,
  Clock,
  Send,
} from 'lucide-react';
import { CompanyApplication, ApplicationStatus } from '../types';

interface CompanyTableViewProps {
  applications: CompanyApplication[];
  onToggleTestGiven: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus | string) => void;
  onAddComment: (id: string, commentText: string) => void;
  onDeleteComment: (companyId: string, commentId: string) => void;
  onDeleteCompany: (id: string) => void;
}

export const CompanyTableView: React.FC<CompanyTableViewProps> = ({
  applications,
  onToggleTestGiven,
  onUpdateStatus,
  onAddComment,
  onDeleteComment,
  onDeleteCompany,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    setCommentInput('');
  };

  const handleAddComment = (companyId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    onAddComment(companyId, commentInput.trim());
    setCommentInput('');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
            <tr>
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">Company</th>
              <th className="py-3 px-4">Role / Profile</th>
              <th className="py-3 px-4">JAF ID</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center">Test Status (Given?)</th>
              <th className="py-3 px-4">Test Date/Platform</th>
              <th className="py-3 px-4 text-center">Comments</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {applications.map((app, index) => {
              const isExpanded = expandedId === app.id;
              return (
                <React.Fragment key={app.id}>
                  <tr
                    className={`hover:bg-slate-50/70 transition-colors ${
                      app.testGiven ? '' : 'bg-amber-50/20'
                    }`}
                  >
                    <td className="py-3 px-4 text-slate-400 font-mono text-xs">{index + 1}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{app.companyName}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{app.profile}</td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">
                      {app.jafId || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={app.status}
                        onChange={(e) => onUpdateStatus(app.id, e.target.value)}
                        className="text-xs font-semibold px-2 py-1 rounded-md border border-slate-200 bg-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="Applied">Applied</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview">Interview</option>
                        <option value="Selected">Selected</option>
                        <option value="Waitlisted">Waitlisted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>

                    {/* Test Given Checkbox Column */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => onToggleTestGiven(app.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition ${
                          app.testGiven
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                        }`}
                        title="Click to toggle: Given / Not Given"
                      >
                        {app.testGiven ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Given</span>
                          </>
                        ) : (
                          <>
                            <Circle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Not Given</span>
                          </>
                        )}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-xs text-slate-600">
                      {app.testDate || app.testPlatform ? (
                        <span>
                          {app.testPlatform && <strong className="font-semibold">{app.testPlatform}: </strong>}
                          {app.testDate || 'Pending'}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">—</span>
                      )}
                    </td>

                    {/* Comments Toggle Button */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleExpand(app.id)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs font-medium transition ${
                          isExpanded
                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <MessageSquare className="w-3 h-3 text-blue-500" />
                        <span>{app.comments.length}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onDeleteCompany(app.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>

                  {/* Expandable Comments Drawer for this row */}
                  {isExpanded && (
                    <tr className="bg-slate-50/90 border-t border-b border-blue-100">
                      <td colSpan={9} className="p-4">
                        <div className="max-w-3xl mx-auto space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                              Comments & Notes for {app.companyName}:
                            </span>
                            <span className="text-xs text-slate-400">
                              {app.comments.length} comment{app.comments.length === 1 ? '' : 's'}
                            </span>
                          </div>

                          {/* Existing Comments */}
                          {app.comments.length > 0 && (
                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                              {app.comments.map((comment) => (
                                <div
                                  key={comment.id}
                                  className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs flex items-start justify-between gap-2"
                                >
                                  <div>
                                    <p className="text-slate-800">{comment.text}</p>
                                    <span className="text-[10px] text-slate-400">
                                      {new Date(comment.createdAt).toLocaleString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => onDeleteComment(app.id, comment.id)}
                                    className="p-1 text-slate-400 hover:text-rose-600"
                                    title="Delete comment"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Add Comment Form */}
                          <form onSubmit={(e) => handleAddComment(app.id, e)} className="flex gap-2">
                            <input
                              type="text"
                              placeholder={`Add comment for ${app.companyName}...`}
                              value={commentInput}
                              onChange={(e) => setCommentInput(e.target.value)}
                              className="flex-1 text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              type="submit"
                              disabled={!commentInput.trim()}
                              className="px-3 py-1.5 bg-blue-600 disabled:bg-slate-300 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              Add
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

