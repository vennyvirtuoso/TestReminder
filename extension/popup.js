// IIT Bombay Placement Auto-Sync Popup Script
document.addEventListener('DOMContentLoaded', async () => {
  const vercelUrlInput = document.getElementById('vercelUrl');
  const studentLdapInput = document.getElementById('studentLdap');
  const portalStatus = document.getElementById('portalStatus');
  const companyCount = document.getElementById('companyCount');
  const syncBtn = document.getElementById('syncBtn');
  const openAppBtn = document.getElementById('openAppBtn');

  // Load saved settings
  const stored = await chrome.storage.sync.get(['vercelAppUrl', 'studentLdap']);
  vercelUrlInput.value = stored.vercelAppUrl || 'http://localhost:3000';
  studentLdapInput.value = stored.studentLdap || '';

  // Save settings on input change
  const saveSettings = async () => {
    await chrome.storage.sync.set({
      vercelAppUrl: vercelUrlInput.value.trim(),
      studentLdap: studentLdapInput.value.trim(),
    });
  };

  vercelUrlInput.addEventListener('change', saveSettings);
  studentLdapInput.addEventListener('change', saveSettings);

  // Check active tab
  let currentCompanies = [];
  let detectedLdap = '';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url && tab.url.includes('campus.placements.iitb.ac.in')) {
      portalStatus.innerText = 'Connected to Portal ✓';
      portalStatus.style.color = '#16a34a';

      // Ask content script to scrape
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'SCRAPE_COMPANIES' });
        if (response && response.companies) {
          currentCompanies = response.companies;
          detectedLdap = response.ldap || '';
          companyCount.innerText = `${currentCompanies.length} companies`;

          if (detectedLdap && !studentLdapInput.value) {
            studentLdapInput.value = detectedLdap;
            await saveSettings();
          }
        }
      } catch (err) {
        console.warn('Could not contact content script:', err);
        companyCount.innerText = 'Reload portal tab';
      }
    } else {
      portalStatus.innerText = 'Not on IITB Portal';
      portalStatus.style.color = '#dc2626';
      companyCount.innerText = '—';
    }
  } catch (err) {
    console.error('Tab query error:', err);
  }

  // Handle Sync Button Click
  syncBtn.addEventListener('click', async () => {
    await saveSettings();
    const appUrl = (vercelUrlInput.value.trim() || 'http://localhost:3000').replace(/\/+$/, '');
    const ldapId = studentLdapInput.value.trim() || detectedLdap || 'my-apps';

    if (currentCompanies.length === 0) {
      alert('No companies detected. Please make sure you are logged into campus.placements.iitb.ac.in/applicant/application');
      return;
    }

    syncBtn.innerText = 'Syncing...';
    syncBtn.disabled = true;

    let syncId = '';
    try {
      const res = await fetch(`${appUrl}/api/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ldapId, applications: currentCompanies }),
      });
      const data = await res.json();
      if (data.syncId) syncId = data.syncId;
    } catch (e) {
      console.warn('API sync warning:', e);
    }

    // Clean, short URL without 20KB query strings (prevents URI_TOO_LONG)
    let targetUrl = `${appUrl}?sync_ldap=${encodeURIComponent(ldapId)}`;
    if (syncId) {
      targetUrl += `&sync_id=${encodeURIComponent(syncId)}`;
    } else {
      try {
        await navigator.clipboard.writeText(JSON.stringify(currentCompanies));
      } catch {}
    }

    chrome.tabs.create({ url: targetUrl });

    syncBtn.innerText = '✓ Synced Successfully!';
    syncBtn.style.background = '#10b981';
    setTimeout(() => {
      syncBtn.innerText = '🚀 Scrape & Sync Now';
      syncBtn.style.background = '#0284c7';
      syncBtn.disabled = false;
    }, 2500);
  });

  // Open App Button
  openAppBtn.addEventListener('click', async () => {
    const appUrl = vercelUrlInput.value.trim() || 'http://localhost:3000';
    chrome.tabs.create({ url: appUrl });
  });
});

