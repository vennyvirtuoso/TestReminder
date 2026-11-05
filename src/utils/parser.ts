import { CompanyApplication } from '../types';

export const parseIITBPortalInput = (rawInput: string): Partial<CompanyApplication>[] => {
  const trimmed = rawInput.trim();
  if (!trimmed) return [];

  // 1. Try parsing JSON first (from bookmarklet, extension, or backup)
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      const items = Array.isArray(parsed) ? parsed : [parsed];
      return items.map((item, idx) => {
        let profile = item.profile || item.role || item.designation || 'General Role';
        let jafId = item.jafId || item.jaf || item.jafNo || '';

        // Auto-fix if profile is numeric and jafId is role title
        if (/^\d+$/.test(profile.trim()) && jafId && /[a-zA-Z]/.test(jafId)) {
          const temp = profile.trim();
          profile = jafId.trim();
          jafId = `Profile #${temp}`;
        }

        return {
          id: item.id || `app-${Date.now()}-${idx}`,
          companyName: item.companyName || item.company || item.name || 'Unknown Company',
          profile: profile,
          jafId: jafId,
          status: item.status || 'Applied',
          appliedDate: item.appliedDate || item.date || '',
          resume: item.resume || '',
          testGiven: Boolean(item.testGiven),
          testDate: item.testDate || '',
          testPlatform: item.testPlatform || '',
          comments: Array.isArray(item.comments) ? item.comments : [],
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        };
      });
    } catch {
      // not JSON, continue to HTML / text
    }
  }

  // 2. Try parsing HTML (Angular Material mat-table or standard table)
  if (trimmed.includes('<table') || trimmed.includes('<tr') || trimmed.includes('class=')) {
    if (typeof window !== 'undefined') {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(trimmed, 'text/html');

        // Check if Angular Material mat-table with CDK columns exists
        const matRows = doc.querySelectorAll('tr.mat-row, tr.cdk-row');
        if (matRows.length > 0) {
          const results: Partial<CompanyApplication>[] = [];
          matRows.forEach((row, idx) => {
            const companyEl = row.querySelector('.cdk-column-company, td:nth-child(1)');
            const codeEl = row.querySelector('.cdk-column-code, td:nth-child(2)');
            const titleEl = row.querySelector('.cdk-column-title, td:nth-child(3)');
            const dateEl = row.querySelector('.cdk-column-signingDate, td:nth-child(4)');
            const statusEl = row.querySelector('.cdk-column-status, td:nth-child(5)');

            const company = companyEl?.textContent?.replace(/\s+/g, ' ').trim() || '';
            if (!company || company.toLowerCase().includes('company')) return;

            const code = codeEl?.textContent?.replace(/\s+/g, ' ').trim() || '1';
            let roleTitle = titleEl?.textContent?.replace(/\s+/g, ' ').trim() || 'General Role';

            // Clean title of icons
            const titleLink = titleEl?.querySelector('a');
            if (titleLink && titleLink.childNodes[0]) {
              roleTitle = titleLink.childNodes[0].textContent?.trim() || roleTitle;
            }

            const signingDate = dateEl?.textContent?.replace(/\s+/g, ' ').trim() || '';

            // Extract stages from progress train
            const stages: string[] = [];
            let currentStatus = 'Applied';
            let hasTest = false;
            let testName = '';

            if (statusEl) {
              const trainSteps = statusEl.querySelectorAll('.progress-train > div, app-progress-train div.d-flex.flex-column');
              trainSteps.forEach((step) => {
                const stepName = step.querySelector('.name')?.textContent?.trim() || step.textContent?.trim() || '';
                if (stepName) {
                  stages.push(stepName);
                  if (step.classList.contains('success')) currentStatus = stepName;
                  if (step.classList.contains('danger')) currentStatus = `Rejected at ${stepName}`;
                  if (stepName.toLowerCase().includes('test') || stepName.toLowerCase().includes('assessment')) {
                    hasTest = true;
                    testName = stepName;
                  }
                }
              });
            }

            const comments = [];
            if (stages.length > 0) {
              comments.push({
                id: `stages-${Date.now()}-${idx}`,
                text: `Hiring Pipeline: ${stages.join(' ➔ ')}`,
                createdAt: new Date().toISOString(),
              });
            }

            results.push({
              id: `iitb-${Date.now()}-${idx}`,
              companyName: company,
              profile: roleTitle,
              jafId: `Code #${code}`,
              status: currentStatus,
              appliedDate: signingDate,
              testGiven: false,
              testPlatform: hasTest ? testName : undefined,
              comments: comments,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          });

          if (results.length > 0) return results;
        }

        // Standard <tr> / <td> fallback
        const rows = doc.querySelectorAll('tr');
        if (rows.length > 0) {
          const results: Partial<CompanyApplication>[] = [];
          rows.forEach((row, idx) => {
            const cells = Array.from(row.querySelectorAll('td')).map((td) => td.textContent?.trim() || '');
            if (cells.length >= 2) {
              let companyName = '';
              let profile = 'General Role';
              let jafId = '';
              let status = 'Applied';
              let appliedDate = '';

              if (/^\d+$/.test(cells[0]) && cells.length >= 4) {
                companyName = cells[1];
                if (/^\d+$/.test(cells[2]) && cells[3]) {
                  profile = cells[3];
                  jafId = `Profile #${cells[2]}`;
                  status = cells[4] || 'Applied';
                } else {
                  profile = cells[2];
                  jafId = cells[3] || '';
                  status = cells[4] || 'Applied';
                }
              } else {
                companyName = cells[0];
                profile = cells[1] || 'General Role';
                jafId = cells[2] || '';
                status = cells[3] || 'Applied';
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

  // 3. Fallback: Parse plain text lines
  const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
  const results: Partial<CompanyApplication>[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
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
