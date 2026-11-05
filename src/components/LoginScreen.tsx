'use client';

import React, { useState } from 'react';
import { ShieldCheck, Lock, User, ArrowRight, Sparkles, Building2, ExternalLink } from 'lucide-react';
import { getUserAccount, saveUserAccount, setActiveUserSession, saveUserApplications, getUserApplications } from '../utils/storage';
import { SAMPLE_APPLICATIONS } from '../utils/sampleData';

interface LoginScreenProps {
  onLoginSuccess: (ldapId: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [ldapId, setLdapId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isNewUserHint, setIsNewUserHint] = useState(false);

  const handleLdapChange = (val: string) => {
    const clean = val.trim().toLowerCase();
    setLdapId(val);
    setError(null);
    if (clean) {
      const existing = getUserAccount(clean);
      setIsNewUserHint(!existing);
    } else {
      setIsNewUserHint(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = ldapId.trim().toLowerCase();
    if (!cleanId) {
      setError('Please enter your IIT Bombay LDAP ID or Roll Number.');
      return;
    }
    if (!password.trim()) {
      setError('Please enter a passcode or password to secure your personal data.');
      return;
    }

    const existing = getUserAccount(cleanId);
    if (existing) {
      // Validate password if set
      if (existing.passwordHash && existing.passwordHash !== password) {
        setError('Incorrect passcode for this LDAP ID. Please try again.');
        return;
      }
      // Update last login
      saveUserAccount({
        ...existing,
        lastLogin: new Date().toISOString(),
      });
    } else {
      // Create new student account
      saveUserAccount({
        ldapId: cleanId,
        passwordHash: password,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      });

      // If user has no applications yet, prompt or give fresh state
      const currentApps = getUserApplications(cleanId);
      if (currentApps.length === 0) {
        // Leave empty for clean import, or user can load sample
      }
    }

    setActiveUserSession(cleanId);
    onLoginSuccess(cleanId);
  };

  const handleQuickDemoLogin = () => {
    const demoId = '210050012';
    const existing = getUserAccount(demoId);
    if (!existing) {
      saveUserAccount({
        ldapId: demoId,
        passwordHash: 'demo',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      });
      saveUserApplications(demoId, SAMPLE_APPLICATIONS);
    }
    setActiveUserSession(demoId);
    onLoginSuccess(demoId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 text-white">
      {/* Top Header */}
      <div className="w-full max-w-md mx-auto text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-600 shadow-xl mb-3 border border-white/20">
          <span className="text-2xl font-black tracking-tight text-white">IITB</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Placement Companion
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-1">
          Indian Institute of Technology Bombay
        </p>
        <a
          href="https://campus.placements.iitb.ac.in/applicant/application"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 mt-2 transition"
        >
          <span>campus.placements.iitb.ac.in/applicant/application</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-900 border border-slate-100">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900">Student Sign In</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log in with your LDAP to manage your applied companies, tests, and comments.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* LDAP ID Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              IITB LDAP ID / Roll Number *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. 210050012 or your_ldap"
                value={ldapId}
                onChange={(e) => handleLdapChange(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-900 placeholder-slate-400"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
            {isNewUserHint && (
              <p className="text-[11px] text-blue-600 mt-1 flex items-center gap-1 font-medium">
                <Sparkles className="w-3 h-3" />
                First time logging in with this ID? A new private workspace will be created!
              </p>
            )}
          </div>

          {/* Passcode Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Passcode / Password *
              </label>
              <span className="text-[11px] text-slate-400">Protects your notes</span>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="Enter personal passcode"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 placeholder-slate-400"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 group"
          >
            <span>Open My Placement Dashboard</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-slate-400">or explore instantly</span>
          </div>
        </div>

        {/* Demo Login Button */}
        <button
          onClick={handleQuickDemoLogin}
          className="w-full py-2.5 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2"
        >
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>Launch Demo Student Workspace (210050012)</span>
        </button>

        {/* Privacy Note */}
        <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-800">Multi-User Isolation:</strong> Each LDAP user gets their own dedicated data partition. Your comments, applied companies, and test statuses are visible only when signed into your account.
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 text-center text-xs text-slate-400 max-w-sm">
        IIT Bombay Placement Tracker • Hostable on Vercel with zero config
      </footer>
    </div>
  );
};
