'use client';

import React, { useState } from 'react';
import { X, Plus, Building, Briefcase, Calendar, CheckCircle } from 'lucide-react';
import { CompanyApplication, ApplicationStatus } from '../types';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (company: Partial<CompanyApplication>) => void;
}

export const AddCompanyModal: React.FC<AddCompanyModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [companyName, setCompanyName] = useState('');
  const [profile, setProfile] = useState('');
  const [jafId, setJafId] = useState('');
  const [status, setStatus] = useState<ApplicationStatus>('Applied');
  const [testGiven, setTestGiven] = useState(false);
  const [testDate, setTestDate] = useState('');
  const [testPlatform, setTestPlatform] = useState('');
  const [initialComment, setInitialComment] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    onAdd({
      companyName: companyName.trim(),
      profile: profile.trim() || 'General Role',
      jafId: jafId.trim() || undefined,
      status: status,
      testGiven: testGiven,
      testDate: testDate || undefined,
      testPlatform: testPlatform.trim() || undefined,
      comments: initialComment.trim()
        ? [
            {
              id: `comment-${Date.now()}`,
              text: initialComment.trim(),
              createdAt: new Date().toISOString(),
            },
          ]
        : [],
    });

    // Reset & close
    setCompanyName('');
    setProfile('');
    setJafId('');
    setStatus('Applied');
    setTestGiven(false);
    setTestDate('');
    setTestPlatform('');
    setInitialComment('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Plus className="w-4 h-4 text-blue-600" />
            Add Applied Company
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Company Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Google, Microsoft, Graviton, etc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Profile / Role
              </label>
              <input
                type="text"
                placeholder="e.g. Software Engineer, Quant"
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                JAF ID (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. JAF-2024-0042"
                value={jafId}
                onChange={(e) => setJafId(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status & Test Given Checkbox */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Application Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ApplicationStatus)}
                className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="Applied">Applied</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Interview">Interview</option>
                <option value="Selected">Selected</option>
                <option value="Waitlisted">Waitlisted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Test Given Checkbox */}
            <div className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg bg-slate-50">
              <input
                type="checkbox"
                id="modal-test-given"
                checked={testGiven}
                onChange={(e) => setTestGiven(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="modal-test-given" className="text-xs font-semibold text-slate-800 cursor-pointer">
                Test Given / Completed
              </label>
            </div>
          </div>

          {/* Test Platform & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Test Platform
              </label>
              <input
                type="text"
                placeholder="e.g. HackerRank, Mettl"
                value={testPlatform}
                onChange={(e) => setTestPlatform(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Test Date
              </label>
              <input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          {/* Initial Comment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Comment / Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. OA pattern, prep notes, interview questions..."
              value={initialComment}
              onChange={(e) => setInitialComment(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
            >
              Add Company
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
