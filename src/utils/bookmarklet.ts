export const getBookmarkletCode = (appOrigin: string = ''): string => {
  const script = `(function() {
  try {
    const rows = Array.from(document.querySelectorAll('table.mat-table tbody tr.mat-row, table tr'));
    const items = [];
    rows.forEach((r, idx) => {
      const companyEl = r.querySelector('.cdk-column-company, td:nth-child(1)');
      const codeEl = r.querySelector('.cdk-column-code, td:nth-child(2)');
      const titleEl = r.querySelector('.cdk-column-title, td:nth-child(3)');
      const dateEl = r.querySelector('.cdk-column-signingDate, td:nth-child(4)');
      const statusEl = r.querySelector('.cdk-column-status, td:nth-child(5)');

      const company = companyEl ? companyEl.innerText.trim() : '';
      if (company && !company.toLowerCase().includes('company')) {
        const code = codeEl ? codeEl.innerText.trim() : '1';
        let title = titleEl ? titleEl.innerText.trim() : 'General Role';
        const date = dateEl ? dateEl.innerText.trim() : '';

        const stages = [];
        let status = 'Applied';
        let hasTest = false;
        let testName = '';

        if (statusEl) {
          const steps = statusEl.querySelectorAll('.name');
          steps.forEach(s => {
            const name = s.innerText.trim();
            if (name) {
              stages.push(name);
              if (name.toLowerCase().includes('test')) {
                hasTest = true;
                testName = name;
              }
            }
          });
          const successStep = statusEl.querySelector('.success .name');
          if (successStep) status = successStep.innerText.trim();
        }

        const comments = [];
        if (stages.length > 0) {
          comments.push({
            id: 'c-' + Date.now() + '-' + idx,
            text: 'Hiring Process: ' + stages.join(' ➔ '),
            createdAt: new Date().toISOString()
          });
        }

        items.push({
          companyName: company,
          profile: title,
          jafId: 'Code #' + code,
          status: status,
          appliedDate: date,
          testGiven: false,
          testPlatform: hasTest ? testName : undefined,
          comments: comments
        });
      }
    });

    if (items.length === 0) {
      alert('No applications found. Please make sure you are on campus.placements.iitb.ac.in/applicant/application');
      return;
    }

    const jsonStr = JSON.stringify(items);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(jsonStr).then(() => {
        alert('🎉 Copied ' + items.length + ' applied companies to clipboard!\\n\\nNow switch to your Placement Tracker app and click "Import" -> "Paste Table".');
      }).catch(() => {
        prompt('Copy your placement data:', jsonStr);
      });
    } else {
      prompt('Copy your placement data:', jsonStr);
    }
  } catch(e) {
    alert('Extraction error: ' + e.message);
  }
})();`;

  return `javascript:${encodeURIComponent(script.replace(/\n\s*/g, ''))}`;
};

export const getConsoleSnippet = (): string => {
  return `// Paste in DevTools Console on https://campus.placements.iitb.ac.in/applicant/application
(function() {
  const rows = Array.from(document.querySelectorAll('table.mat-table tbody tr.mat-row, table tr'));
  const items = [];
  rows.forEach((r, idx) => {
    const compEl = r.querySelector('.cdk-column-company, td:nth-child(1)');
    const codeEl = r.querySelector('.cdk-column-code, td:nth-child(2)');
    const titleEl = r.querySelector('.cdk-column-title, td:nth-child(3)');
    const dateEl = r.querySelector('.cdk-column-signingDate, td:nth-child(4)');
    const statusEl = r.querySelector('.cdk-column-status, td:nth-child(5)');
    const company = compEl ? compEl.innerText.trim() : '';
    if (company && !company.toLowerCase().includes('company')) {
      const code = codeEl ? codeEl.innerText.trim() : '1';
      const title = titleEl ? titleEl.innerText.trim() : 'Role';
      const date = dateEl ? dateEl.innerText.trim() : '';
      const stages = [];
      let status = 'Applied';
      if (statusEl) {
        statusEl.querySelectorAll('.name').forEach(s => stages.push(s.innerText.trim()));
        const successStep = statusEl.querySelector('.success .name');
        if (successStep) status = successStep.innerText.trim();
      }
      items.push({
        companyName: company,
        profile: title,
        jafId: 'Code #' + code,
        status: status,
        appliedDate: date,
        testGiven: false,
        comments: stages.length ? [{ id: 'c-' + idx, text: 'Hiring Process: ' + stages.join(' ➔ '), createdAt: new Date().toISOString() }] : []
      });
    }
  });
  copy(JSON.stringify(items, null, 2));
  alert('🎉 Copied ' + items.length + ' applications to clipboard! Paste in your Tracker app.');
})();`;
};
