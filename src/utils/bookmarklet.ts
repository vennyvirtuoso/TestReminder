export const getBookmarkletCode = (appOrigin: string = window.location.origin): string => {
  const script = `(function() {
  try {
    const rows = Array.from(document.querySelectorAll('table tbody tr, table tr'));
    const items = [];
    rows.forEach((r, idx) => {
      const cells = Array.from(r.querySelectorAll('td')).map(c => c.innerText.trim());
      if (cells.length >= 2) {
        let company = '', profile = 'Role', jaf = '', status = 'Applied', date = '';
        if (/^\\d+$/.test(cells[0])) {
          company = cells[1];
          profile = cells[2] || '';
          jaf = cells[3] || '';
          status = cells[4] || 'Applied';
          date = cells[5] || '';
        } else {
          company = cells[0];
          profile = cells[1] || '';
          jaf = cells[2] || '';
          status = cells[3] || 'Applied';
          date = cells[4] || '';
        }
        if (company && !company.toLowerCase().includes('company')) {
          items.push({
            companyName: company,
            profile: profile || 'General',
            jafId: jaf,
            status: status,
            appliedDate: date,
            testGiven: false,
            comments: []
          });
        }
      }
    });

    if (items.length === 0) {
      alert('Could not detect application table on this page. Please make sure you are on campus.placements.iitb.ac.in/applicant/application');
      return;
    }

    const jsonStr = JSON.stringify(items);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(jsonStr).then(() => {
        alert('🎉 Successfully captured ' + items.length + ' applied companies!\\n\\nCopied to clipboard. Go back to your IITB Placement Tracker web app and click "Import" -> "Paste Clipboard".');
      }).catch(() => {
        prompt('Copy this data and paste into IITB Placement Tracker:', jsonStr);
      });
    } else {
      prompt('Copy this data and paste into IITB Placement Tracker:', jsonStr);
    }
  } catch(e) {
    alert('Error extracting data: ' + e.message);
  }
})();`;

  return `javascript:${encodeURIComponent(script.replace(/\n\s*/g, ''))}`;
};

export const getConsoleSnippet = (): string => {
  return `// Paste this in DevTools Console on https://campus.placements.iitb.ac.in/applicant/application
(function() {
  const rows = Array.from(document.querySelectorAll('table tbody tr, table tr'));
  const items = [];
  rows.forEach((r, idx) => {
    const cells = Array.from(r.querySelectorAll('td')).map(c => c.innerText.trim());
    if (cells.length >= 2) {
      let company = '', profile = 'Role', jaf = '', status = 'Applied', date = '';
      if (/^\\d+$/.test(cells[0])) {
        company = cells[1];
        profile = cells[2] || '';
        jaf = cells[3] || '';
        status = cells[4] || 'Applied';
        date = cells[5] || '';
      } else {
        company = cells[0];
        profile = cells[1] || '';
        jaf = cells[2] || '';
        status = cells[3] || 'Applied';
        date = cells[4] || '';
      }
      if (company && !company.toLowerCase().includes('company')) {
        items.push({
          companyName: company,
          profile: profile || 'General',
          jafId: jaf,
          status: status,
          appliedDate: date,
          testGiven: false,
          comments: []
        });
      }
    }
  });
  console.log('Found', items.length, 'companies');
  copy(JSON.stringify(items, null, 2));
  alert('Copied ' + items.length + ' applications to clipboard! Paste in your Tracker app.');
})();`;
};

