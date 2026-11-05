import { CompanyApplication } from '../types';

export const parseIITBPortalInput = (rawInput: string): Partial<CompanyApplication>[] => {
  const trimmed = rawInput.trim();
  if (!trimmed) return [];

  // 1. Try parsing JSON first
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      return items.map((item, idx) => ({
        id: item.id || `app-${Date.now()}-${idx}`,
        companyName: item.companyName || item.company || item.name || 'Unknown Company',
        profile: item.profile || item.role || item.designation || 'General',
        jafId: item.jafId || item.jaf || item.jafNo || '',
        status: item.status || 'Applied',
        appliedDate: item.appliedDate || item.date || '',
        resume: item.resume || '',
        testGiven: Boolean(item.testGiven),
        testDate: item.testDate || '',
        testPlatform: item.testPlatform || '',
        comments: Array.isArray(item.comments) ? item.comments : [],
        createdAt: item.createdAt || new Date().toISOString(),
        updatedAt: item.updatedAt || new Date().toISOString(),
      }));
    } catch {
      // not JSON, continue to HTML / text
    }
  }

  // 2. Try parsing HTML (if contains <table> or <tr> or <div)
  if (trimmed.includes('<table') || trimmed.includes('<tr') || trimmed.includes('class=')) {
    if (typeof window !== 'undefined') {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(trimmed, 'text/html');
        const rows = doc.querySelectorAll('tr');

        if (rows.length > 0) {
          const results: Partial<CompanyApplication>[] = [];
          rows.forEach((row, idx) => {
            const cells = Array.from(row.querySelectorAll('td')).map((td) => td.textContent?.trim() || '');
            if (cells.length >= 2) {
              // Heuristic to detect company & profile columns
              // Often: [SrNo, Company, Profile, JAF, Status, Date, ...] or [Company, Profile, Status, ...]
              let companyName = '';
              let profile = 'General';
              let jafId = '';
              let status = 'Applied';
              let appliedDate = '';

              if (cells.length === 2) {
                companyName = cells[0];
                profile = cells[1];
              } else if (cells.length === 3) {
                companyName = cells[0];
                profile = cells[1];
                status = cells[2];
              } else if (cells.length >= 4) {
                // If first column is serial number (numeric)
                if (/^\d+$/.test(cells[0])) {
                  companyName = cells[1];
                  profile = cells[2];
                  jafId = cells[3] || '';
                  status = cells[4] || 'Applied';
                  appliedDate = cells[5] || '';
                } else {
                  companyName = cells[0];
                  profile = cells[1];
                  jafId = cells[2] || '';
                  status = cells[3] || 'Applied';
                  appliedDate = cells[4] || '';
                }
              }

              if (companyName && !companyName.toLowerCase().includes('company') && !companyName.toLowerCase().includes('sr')) {
                results.push({
                  id: `iitb-${Date.now()}-${idx}`,
                  companyName: cleanText(companyName),
                  profile: cleanText(profile),
                  jafId: cleanText(jafId),
                  status: normalizeStatus(status),
                  appliedDate: appliedDate,
                  testGiven: false,
                  comments: [],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                });
              }
            }
          });

          if (results.length > 0) return results;
        }
      } catch (e) {
        console.warn('HTML parsing failed, falling back to text lines', e);
      }
    }
  }

  // 3. Fallback: Parse plain text lines (e.g. copied from table or tab-separated)
  const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
  const results: Partial<CompanyApplication>[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Check if tab-separated or comma-separated
    const parts = line.includes('\t')
      ? line.split('\t').map((p) => p.trim())
      : line.includes('  ')
      ? line.split(/\s{2,}/).map((p) => p.trim())
      : line.split(',').map((p) => p.trim());

    if (parts.length >= 2) {
      let company = parts[0];
      let role = parts[1];
      let status = parts[2] || 'Applied';

      if (/^\d+$/.test(parts[0]) && parts.length >= 3) {
        company = parts[1];
        role = parts[2];
        status = parts[3] || 'Applied';
      }

      if (company.toLowerCase() !== 'company' && company.toLowerCase() !== 'company name') {
        results.push({
          id: `line-${Date.now()}-${i}`,
          companyName: cleanText(company),
          profile: cleanText(role),
          status: normalizeStatus(status),
          testGiven: false,
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } else if (line.length > 1) {
      // Just single company names per line
      results.push({
        id: `line-${Date.now()}-${i}`,
        companyName: cleanText(line),
        profile: 'General Role',
        status: 'Applied',
        testGiven: false,
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }

  return results;
};

function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function normalizeStatus(status: string): string {
  const s = status.toLowerCase();
  if (s.includes('shortlist')) return 'Shortlisted';
  if (s.includes('interview')) return 'Interview';
  if (s.includes('select')) return 'Selected';
  if (s.includes('reject') || s.includes('not shortlisted')) return 'Rejected';
  if (s.includes('waitlist')) return 'Waitlisted';
  if (s.includes('closed')) return 'Closed';
  return 'Applied';
}
