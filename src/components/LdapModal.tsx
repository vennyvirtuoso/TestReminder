'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, Lock, User, Key } from 'lucide-react';

interface LdapModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLdapId: string;
  onSaveLdapId: (id: string) => void;
}

export const LdapModal: React.FC<LdapModalProps> = ({
  isOpen,
  onClose,
  currentLdapId,
  onSaveLdapId,
}) => {
  const [ldapInput, setLdapInput] = useState(currentLdapId);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveLdapId(ldapInput);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            IIT Bombay LDAP Identity
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Privacy Guarantee Box */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-emerald-900">100% Client-Side Privacy Guarantee:</span>
              <p className="text-emerald-800 leading-relaxed">
                Your LDAP ID is stored <strong>only in your personal browser&rsquo;s local storage</strong>.
                It is <strong>never transmitted</strong> to any server, database, or external AI.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your IITB LDAP ID / Roll Number
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. 210050012 or your_ldap"
                value={ldapInput}
                onChange={(e) => setLdapInput(e.target.value)}
                className="w-full text-xs sm:text-sm pl-9 pr-3.5 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-slate-900"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Used strictly for labeling your personal application board. Never enter passwords.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setLdapInput('');
                onSaveLdapId('');
                onClose();
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium"
            >
              Clear Saved ID
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
              >
                Save Locally
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

