import { CompanyApplication } from '../types';

const STORAGE_KEY = 'iitb_placement_applications_v1';
const LDAP_STORAGE_KEY = 'iitb_ldap_user_v1';

export const getStoredApplications = (): CompanyApplication[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse applications from localStorage', err);
    return [];
  }
};

export const saveStoredApplications = (apps: CompanyApplication[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch (err) {
    console.error('Failed to save applications to localStorage', err);
  }
};

export const getStoredLdap = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(LDAP_STORAGE_KEY) || '';
};

export const saveStoredLdap = (ldapId: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LDAP_STORAGE_KEY, ldapId.trim());
};

export const clearAllData = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LDAP_STORAGE_KEY);
};

export const exportToCSV = (apps: CompanyApplication[]): void => {
  const headers = [
    'Company Name',
    'Profile / Role',
    'Status',
    'Test Given',
    'Test Date',
    'Test Platform',
    'JAF ID',
    'Applied Date',
    'Comments Count',
    'All Comments'
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
    escapeCSV(app.testGiven ? 'Given' : 'Not Given'),
    escapeCSV(app.testDate || ''),
    escapeCSV(app.testPlatform || ''),
    escapeCSV(app.jafId || ''),
    escapeCSV(app.appliedDate || ''),
    escapeCSV(app.comments.length.toString()),
    escapeCSV(app.comments.map((c) => `[${c.createdAt.slice(0, 10)}] ${c.text}`).join(' | '))
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `IITB_Applied_Companies_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToJSON = (apps: CompanyApplication[]): void => {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(apps, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `IITB_Applications_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
