import { CompanyApplication } from '../types';

export interface UserAccount {
  ldapId: string;
  name?: string;
  passwordHash?: string;
  createdAt: string;
  lastLogin: string;
}

const ACTIVE_USER_KEY = 'iitb_active_ldap_session';
const USERS_INDEX_KEY = 'iitb_registered_users_v1';

// Helper to get storage key for a specific user's applications
const getUserAppsKey = (ldapId: string) => `iitb_apps_user_${ldapId.toLowerCase().trim()}`;
const getUserMetaKey = (ldapId: string) => `iitb_meta_user_${ldapId.toLowerCase().trim()}`;
const getUserTokenKey = (ldapId: string) => `iitb_token_${ldapId.toLowerCase().trim()}`;

// Saved IITB Placement Portal Session Token (Local only)
export const getIITBToken = (ldapId: string): string | null => {
  if (typeof window === 'undefined' || !ldapId) return null;
  return localStorage.getItem(getUserTokenKey(ldapId));
};

export const saveIITBToken = (ldapId: string, token: string): void => {
  if (typeof window === 'undefined' || !ldapId) return;
  localStorage.setItem(getUserTokenKey(ldapId), token.trim());
};

export const clearIITBToken = (ldapId: string): void => {
  if (typeof window === 'undefined' || !ldapId) return;
  localStorage.removeItem(getUserTokenKey(ldapId));
};

// Active Session Management
export const getActiveUserSession = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_USER_KEY);
};

export const setActiveUserSession = (ldapId: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACTIVE_USER_KEY, ldapId.toLowerCase().trim());
};

export const clearActiveUserSession = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACTIVE_USER_KEY);
};

// Registered Users Index
export const getRegisteredUsers = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USERS_INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const registerUserIndex = (ldapId: string) => {
  const cleanId = ldapId.toLowerCase().trim();
  const current = getRegisteredUsers();
  if (!current.includes(cleanId)) {
    const updated = [...current, cleanId];
    localStorage.setItem(USERS_INDEX_KEY, JSON.stringify(updated));
  }
};

// User Profile / Metadata
export const getUserAccount = (ldapId: string): UserAccount | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getUserMetaKey(ldapId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveUserAccount = (account: UserAccount): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getUserMetaKey(account.ldapId), JSON.stringify(account));
  registerUserIndex(account.ldapId);
};

// User Applications (Isolated per LDAP ID)
export const getUserApplications = (ldapId: string): CompanyApplication[] => {
  if (typeof window === 'undefined' || !ldapId) return [];
  try {
    const raw = localStorage.getItem(getUserAppsKey(ldapId));
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse applications for user:', ldapId, err);
    return [];
  }
};

export const saveUserApplications = (ldapId: string, apps: CompanyApplication[]): void => {
  if (typeof window === 'undefined' || !ldapId) return;
  try {
    localStorage.setItem(getUserAppsKey(ldapId), JSON.stringify(apps));
  } catch (err) {
    console.error('Failed to save applications for user:', ldapId, err);
  }
};

// Delete user account & data
export const deleteUserAccount = (ldapId: string): void => {
  if (typeof window === 'undefined' || !ldapId) return;
  const cleanId = ldapId.toLowerCase().trim();
  localStorage.removeItem(getUserAppsKey(cleanId));
  localStorage.removeItem(getUserMetaKey(cleanId));
  const current = getRegisteredUsers().filter((id) => id !== cleanId);
  localStorage.setItem(USERS_INDEX_KEY, JSON.stringify(current));
  if (getActiveUserSession() === cleanId) {
    clearActiveUserSession();
  }
};

// Export to CSV for active user
export const exportToCSV = (apps: CompanyApplication[], ldapId: string = 'User'): void => {
  const headers = [
    'Company Name',
    'Profile / Role',
    'Status',
    'Shortlisted for Interview',
    'Test Given',
    'Test Date',
    'Test Platform',
    'JAF ID',
    'Applied Date',
    'Comments Count',
    'All Comments',
  ];

  const escapeCSV = (str: string) => {
    if (!str) return '""';
    const clean = str.replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = apps.map((app) => [
    escapeCSV(app.companyName),
    escapeCSV(app.profile),
    escapeCSV(app.status),
    escapeCSV(app.shortlistedForInterview ? 'Yes (Shortlisted)' : 'No'),
    escapeCSV(app.testGiven ? 'Given' : 'Not Given'),
    escapeCSV(app.testDate || ''),
    escapeCSV(app.testPlatform || ''),
    escapeCSV(app.jafId || ''),
    escapeCSV(app.appliedDate || ''),
    escapeCSV(app.comments.length.toString()),
    escapeCSV(app.comments.map((c) => `[${c.createdAt.slice(0, 10)}] ${c.text}`).join(' | ')),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `IITB_Applied_${ldapId}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export to JSON for active user
export const exportToJSON = (apps: CompanyApplication[], ldapId: string = 'User'): void => {
  const backup = {
    ldapId,
    exportedAt: new Date().toISOString(),
    totalCompanies: apps.length,
    applications: apps,
  };
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `IITB_Backup_${ldapId}_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
