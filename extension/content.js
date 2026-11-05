// IIT Bombay Placement Portal Content Script
(function () {
  console.log('[IITB Placement Auto-Sync] Content script loaded on', window.location.href);

  // Scrape applied companies from the page
  function scrapeCompanies() {
    const rows = Array.from(document.querySelectorAll('table tbody tr, table tr'));
    const items = [];

    rows.forEach((r, idx) => {
      const cells = Array.from(r.querySelectorAll('td')).map((c) => c.innerText.trim());
      if (cells.length >= 2) {
        let company = '',
          profile = 'General Role',
          jaf = '',
          status = 'Applied',
          processStages = '';

        // Standard IIT Bombay placement portal table column layout:
        // cells[0]: Serial No (e.g. "1")
        // cells[1]: Company Name (e.g. "NK Securities Research Private Limited")
        // cells[2]: Profile ID / JAF index (e.g. "3")
        // cells[3]: Designation / Job Role (e.g. "AI/ML Researcher")
        // cells[4]: Stages (e.g. "Applied\nTechnical test\n...")
        if (/^\d+$/.test(cells[0])) {
          company = cells[1] || '';
          const col2 = cells[2] || '';
          const col3 = cells[3] || '';
          processStages = cells[4] || '';

          if (/^\d+$/.test(col2) && col3) {
            profile = col3;
            jaf = `Profile #${col2}`;
          } else {
            profile = col2 || col3 || 'General Role';
            jaf = col3 || '';
          }
        } else {
          company = cells[0] || '';
          profile = cells[1] || 'General Role';
          jaf = cells[2] || '';
          processStages = cells[3] || '';
        }

        // Clean up status and stages
        if (processStages) {
          const firstLine = processStages.split('\n')[0].trim();
          status = normalizeStatus(firstLine || processStages);
        }

        // Filter out header rows
        if (
          company &&
          !company.toLowerCase().includes('company') &&
          !company.toLowerCase().includes('sr.')
        ) {
          const comments = [];
          if (processStages && processStages.includes('\n')) {
            const stagesList = processStages.split('\n').map((s) => s.trim()).filter(Boolean);
            if (stagesList.length > 1) {
              comments.push({
                id: `stages-${Date.now()}-${idx}`,
                text: `Hiring Process: ${stagesList.join(' ➔ ')}`,
                createdAt: new Date().toISOString(),
              });
            }
          }

          items.push({
            id: `iitb-${Date.now()}-${idx}`,
            companyName: company.replace(/\s+/g, ' ').trim(),
            profile: profile.replace(/\s+/g, ' ').trim(),
            jafId: jaf.trim(),
            status: status,
            appliedDate: new Date().toISOString().slice(0, 10),
            testGiven: false,
            comments: comments,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      }
    });

    return items;
  }

  function normalizeStatus(raw) {
    const s = (raw || '').toLowerCase();
    if (s.includes('shortlist')) return 'Shortlisted';
    if (s.includes('interview')) return 'Interview';
    if (s.includes('select')) return 'Selected';
    if (s.includes('reject') || s.includes('not shortlisted')) return 'Rejected';
    if (s.includes('waitlist')) return 'Waitlisted';
    if (s.includes('closed')) return 'Closed';
    return 'Applied';
  }

  // Detect student LDAP ID / Roll Number from page content
  function detectStudentLdap() {
    const pageText = document.body.innerText || '';
    const rollMatch = pageText.match(/\b([1-2][0-9]{8}|[1-2][0-9][a-zA-Z][0-9]{6})\b/i);
    if (rollMatch) {
      return rollMatch[1].toLowerCase();
    }
    return '';
  }

  // Inject floating sync widget on campus.placements.iitb.ac.in
  function injectFloatingWidget(companies) {
    if (document.getElementById('iitb-sync-floating-widget')) return;

    const widget = document.createElement('div');
    widget.id = 'iitb-sync-floating-widget';
    widget.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      background: #ffffff;
      border: 1.5px solid #0284c7;
      border-radius: 14px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      padding: 14px 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      color: #0f172a;
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 320px;
    `;

    const count = companies.length;
    const detectedLdap = detectStudentLdap();

    widget.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="font-size: 16px;">🎓</span>
          <strong style="color: #0369a1; font-weight: 700;">IITB Placement Tracker</strong>
        </div>
        <button id="iitb-widget-close" style="border: none; background: transparent; cursor: pointer; color: #94a3b8; font-size: 15px; padding: 2px;">✕</button>
      </div>

      <div style="font-size: 12px; color: #475569; line-height: 1.4;">
        Captured <strong>${count}</strong> applied companies.
        ${detectedLdap ? `<span style="display:block; margin-top: 2px; color: #0284c7; font-weight: 600;">Student: ${detectedLdap}</span>` : ''}
      </div>

      <div style="display: flex; flex-direction: column; gap: 4px;">
        <label style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Destination URL</label>
        <input id="iitb-widget-url" type="url" placeholder="https://your-app.vercel.app" style="
          width: 100%;
          box-sizing: border-box;
          padding: 6px 8px;
          font-size: 11px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          background: #f8fafc;
          color: #0f172a;
          outline: none;
        " />
      </div>

      <button id="iitb-widget-sync-btn" style="
        background: #0284c7;
        color: #ffffff;
        border: none;
        padding: 9px 14px;
        border-radius: 8px;
        font-weight: 700;
        cursor: pointer;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        box-shadow: 0 2px 4px rgba(2, 132, 199, 0.2);
        transition: background 0.2s;
      ">
        🚀 Sync to Vercel Tracker
      </button>
    `;

    document.body.appendChild(widget);

    const urlInput = document.getElementById('iitb-widget-url');

    // Prepopulate with saved URL
    chrome.storage.sync.get(['vercelAppUrl'], (res) => {
      if (res.vercelAppUrl && !res.vercelAppUrl.includes('localhost')) {
        urlInput.value = res.vercelAppUrl;
      } else {
        urlInput.value = res.vercelAppUrl || '';
      }
    });

    urlInput.onchange = () => {
      if (urlInput.value.trim()) {
        chrome.storage.sync.set({ vercelAppUrl: urlInput.value.trim() });
      }
    };

    document.getElementById('iitb-widget-close').onclick = () => {
      widget.remove();
    };

    document.getElementById('iitb-widget-sync-btn').onclick = async () => {
      let targetUrl = urlInput.value.trim();
      if (!targetUrl) {
        targetUrl = prompt('Enter your Vercel URL (e.g. https://test-reminder-xxx.vercel.app):');
        if (!targetUrl || !targetUrl.trim()) return;
        targetUrl = targetUrl.trim();
        urlInput.value = targetUrl;
      }

      // Save URL for future syncs
      chrome.storage.sync.set({ vercelAppUrl: targetUrl });

      const appUrl = targetUrl.replace(/\/+$/, '');
      const targetLdap = detectedLdap || 'my-apps';
      const btn = document.getElementById('iitb-widget-sync-btn');
      btn.innerText = 'Syncing...';
      btn.style.background = '#0369a1';

      // 1. Post to API webhook
      try {
        await fetch(`${appUrl}/api/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ldapId: targetLdap, applications: companies }),
        });
      } catch (e) {
        console.warn('API post failed, falling back to tab open', e);
      }

      // 2. Open Web App tab with encoded sync payload
      const payloadStr = encodeURIComponent(JSON.stringify(companies));
      const redirectUrl = `${appUrl}?sync_ldap=${encodeURIComponent(targetLdap)}&sync_payload=${payloadStr}`;
      window.open(redirectUrl, '_blank');

      btn.innerText = '✓ Synced to Vercel!';
      btn.style.background = '#10b981';
      setTimeout(() => {
        btn.innerText = '🚀 Sync to Vercel Tracker';
        btn.style.background = '#0284c7';
      }, 3000);
    };
  }

  // Run automatically when DOM is ready
  function init() {
    const companies = scrapeCompanies();
    if (companies.length > 0) {
      console.log(`[IITB Placement Auto-Sync] Scraped ${companies.length} companies.`);
      injectFloatingWidget(companies);
    }
  }

  // Listen for popup messages
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'SCRAPE_COMPANIES') {
      const companies = scrapeCompanies();
      const ldap = detectStudentLdap();
      sendResponse({ companies, ldap });
    }
    return true;
  });

  // Observe page mutations
  const observer = new MutationObserver(() => {
    if (!document.getElementById('iitb-sync-floating-widget')) {
      const companies = scrapeCompanies();
      if (companies.length > 0) {
        injectFloatingWidget(companies);
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
  } else {
    window.addEventListener('DOMContentLoaded', init);
  }
})();
