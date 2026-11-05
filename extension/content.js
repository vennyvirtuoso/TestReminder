// IIT Bombay Placement Portal - Advanced Multi-Page Auto-Sync Content Script
(function () {
  console.log('[IITB Placement Auto-Sync] Advanced content script loaded on', window.location.href);

  // In-memory accumulation of all scraped companies across pages & sections
  const accumulatedCompanies = new Map();

  // Helper to extract clean text without child SVGs / icons
  function getCleanText(el) {
    if (!el) return '';
    const clone = el.cloneNode(true);
    clone.querySelectorAll('svg, i-feather, i, .fa, .feather').forEach((n) => n.remove());
    return clone.textContent.replace(/\s+/g, ' ').trim();
  }

  // Parse an Angular Material mat-table row
  function parseMatRow(row, category = 'Eligible') {
    const companyEl = row.querySelector('.cdk-column-company, td:nth-child(1)');
    const codeEl = row.querySelector('.cdk-column-code, td:nth-child(2)');
    const titleEl = row.querySelector('.cdk-column-title, td:nth-child(3)');
    const dateEl = row.querySelector('.cdk-column-signingDate, td:nth-child(4)');
    const statusEl = row.querySelector('.cdk-column-status, td:nth-child(5)');
    const resumeEl = row.querySelector('.cdk-column-resume, td:nth-child(6)');

    const company = getCleanText(companyEl);
    if (!company || company.toLowerCase().includes('company')) return null;

    const jobCode = getCleanText(codeEl) || '1';
    const roleTitle = getCleanText(titleEl) || 'General Role';

    const titleLink = titleEl?.querySelector('a');
    const jobDetailHref = titleLink?.getAttribute('href') || '';
    const jobIdMatch = jobDetailHref.match(/\/applicant\/job\/(\d+)/);
    const uniqueJobId = jobIdMatch ? jobIdMatch[1] : `${company}_${roleTitle}_${jobCode}`;

    const signingDate = getCleanText(dateEl);
    const resumeNo = getCleanText(resumeEl);

    // Parse Progress Train Stages
    const stages = [];
    let currentStatus = 'Applied';
    let hasTestInPipeline = false;
    let testName = '';

    if (statusEl) {
      const trainSteps = statusEl.querySelectorAll('.progress-train > div, app-progress-train div.d-flex.flex-column');
      trainSteps.forEach((step) => {
        const stepName = getCleanText(step.querySelector('.name')) || step.innerText.trim();
        if (stepName) {
          stages.push(stepName);
          const isSuccess = step.classList.contains('success');
          const isDanger = step.classList.contains('danger');

          if (isSuccess) {
            currentStatus = stepName;
          } else if (isDanger) {
            currentStatus = `Rejected at ${stepName}`;
          }

          const lower = stepName.toLowerCase();
          if (lower.includes('test') || lower.includes('assessment') || lower.includes('coding')) {
            hasTestInPipeline = true;
            testName = stepName;
          }
        }
      });
    }

    const comments = [];
    if (stages.length > 0) {
      comments.push({
        id: `pipeline-${uniqueJobId}`,
        text: `Hiring Pipeline: ${stages.join(' ➔ ')}`,
        createdAt: new Date().toISOString(),
      });
    }

    if (resumeNo) {
      comments.push({
        id: `resume-${uniqueJobId}`,
        text: `Applied with Resume #${resumeNo} • Category: ${category}`,
        createdAt: new Date().toISOString(),
      });
    }

    return {
      id: `iitb-job-${uniqueJobId}`,
      companyName: company,
      profile: roleTitle,
      jafId: `Code #${jobCode}${jobIdMatch ? ` (Job ${jobIdMatch[1]})` : ''}`,
      status: currentStatus,
      appliedDate: signingDate,
      testGiven: false,
      testPlatform: hasTestInPipeline ? testName : undefined,
      comments: comments,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // Scrape all tables currently present in DOM (Eligible + Bonus)
  function scrapeCurrentDOM() {
    // 1. Eligible jobs
    const eligibleSection = document.getElementById('eligible-jobs') || document;
    eligibleSection.querySelectorAll('table.mat-table tbody tr.mat-row, table tbody tr').forEach((row) => {
      const parsed = parseMatRow(row, 'Eligible');
      if (parsed) accumulatedCompanies.set(parsed.id, parsed);
    });

    // 2. Bonus jobs
    const bonusSection = document.getElementById('bonus-jobs');
    if (bonusSection) {
      bonusSection.querySelectorAll('table.mat-table tbody tr.mat-row, table tbody tr').forEach((row) => {
        const parsed = parseMatRow(row, 'Bonus');
        if (parsed) accumulatedCompanies.set(parsed.id, parsed);
      });
    }

    return Array.from(accumulatedCompanies.values());
  }

  // Get total signed jobs count from page badge
  function getTotalSignedJobsCount() {
    const statsEl = document.querySelector('.stats, app-application');
    if (statsEl) {
      const match = statsEl.innerText.match(/Total number of jobs signed\s*(\d+)/i);
      if (match) return parseInt(match[1], 10);
    }
    return 0;
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

  // Auto-Paginator: Sequentially clicks Next Page until all items are scraped
  let isAutoPaginating = false;
  async function autoScrapeAllPages(updateCallback) {
    if (isAutoPaginating) return;
    isAutoPaginating = true;

    try {
      const totalExpected = getTotalSignedJobsCount();
      console.log(`[IITB Placement Auto-Sync] Starting auto-pagination. Expected total: ${totalExpected}`);

      // First, scrape current page
      scrapeCurrentDOM();
      if (updateCallback) updateCallback(accumulatedCompanies.size, totalExpected);

      // Find Eligible Paginator
      const eligibleSection = document.getElementById('eligible-jobs') || document;
      const paginator = eligibleSection.querySelector('.mat-paginator');

      if (paginator) {
        // First rewind to page 1 if not on page 1
        let prevBtn = paginator.querySelector('.mat-paginator-navigation-previous:not([disabled]):not(.mat-button-disabled)');
        while (prevBtn) {
          prevBtn.click();
          await new Promise((r) => setTimeout(r, 400));
          scrapeCurrentDOM();
          if (updateCallback) updateCallback(accumulatedCompanies.size, totalExpected);
          prevBtn = paginator.querySelector('.mat-paginator-navigation-previous:not([disabled]):not(.mat-button-disabled)');
        }

        // Now page through all Next pages
        let nextBtn = paginator.querySelector('.mat-paginator-navigation-next:not([disabled]):not(.mat-button-disabled)');
        let safetyCounter = 0;

        while (nextBtn && safetyCounter < 15) {
          safetyCounter++;
          console.log(`[IITB Placement Auto-Sync] Paging to next page (${safetyCounter})...`);
          nextBtn.click();
          await new Promise((r) => setTimeout(r, 500)); // wait for Angular DOM re-render

          scrapeCurrentDOM();
          if (updateCallback) updateCallback(accumulatedCompanies.size, totalExpected);

          nextBtn = paginator.querySelector('.mat-paginator-navigation-next:not([disabled]):not(.mat-button-disabled)');
        }
      }

      // Also ensure bonus jobs are collected
      scrapeCurrentDOM();
      if (updateCallback) updateCallback(accumulatedCompanies.size, totalExpected);

      console.log(`[IITB Placement Auto-Sync] Completed! Total collected: ${accumulatedCompanies.size}`);
    } catch (err) {
      console.error('Auto-pagination error:', err);
    } finally {
      isAutoPaginating = false;
    }
  }

  // Inject floating sync widget on campus.placements.iitb.ac.in
  function injectFloatingWidget() {
    if (document.getElementById('iitb-sync-floating-widget')) {
      updateWidgetCount();
      return;
    }

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
      box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
      padding: 14px 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      color: #0f172a;
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 330px;
    `;

    const totalExpected = getTotalSignedJobsCount();
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
        Captured <strong id="iitb-captured-count" style="color: #0284c7; font-size: 14px;">${accumulatedCompanies.size}</strong>${totalExpected ? ` of <strong>${totalExpected}</strong> total jobs` : ' companies'}.
        ${detectedLdap ? `<span style="display:block; margin-top: 2px; color: #0284c7; font-weight: 600;">Student: ${detectedLdap}</span>` : ''}
      </div>

      <!-- Auto-Paging button for multi-page jobs -->
      <button id="iitb-auto-page-btn" style="
        background: #f0fdf4;
        color: #166534;
        border: 1px solid #bbf7d0;
        padding: 7px 10px;
        border-radius: 8px;
        font-weight: 600;
        cursor: pointer;
        font-size: 11px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: background 0.2s;
      ">
        ⚡ Collect All Pages (${totalExpected || 'All'} Jobs)
      </button>

      <div style="display: flex; flex-direction: column; gap: 4px;">
        <label style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Destination Vercel URL</label>
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
    chrome.storage.sync.get(['vercelAppUrl'], (res) => {
      if (res.vercelAppUrl && !res.vercelAppUrl.includes('localhost')) {
        urlInput.value = res.vercelAppUrl;
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

    // Auto-Page button click
    const autoPageBtn = document.getElementById('iitb-auto-page-btn');
    autoPageBtn.onclick = async () => {
      autoPageBtn.innerText = '⏳ Paging through tables...';
      autoPageBtn.disabled = true;

      await autoScrapeAllPages((current, total) => {
        updateWidgetCount();
      });

      autoPageBtn.innerText = `✓ Collected all ${accumulatedCompanies.size} jobs!`;
      autoPageBtn.style.background = '#dcfce7';
      autoPageBtn.style.color = '#15803d';
      setTimeout(() => {
        autoPageBtn.innerText = '⚡ Collect All Pages';
        autoPageBtn.disabled = false;
      }, 4000);
    };

    // Sync button click
    document.getElementById('iitb-widget-sync-btn').onclick = async () => {
      let targetUrl = urlInput.value.trim();
      if (!targetUrl) {
        targetUrl = prompt('Enter your Vercel URL (e.g. https://test-reminder-xxx.vercel.app):');
        if (!targetUrl || !targetUrl.trim()) return;
        targetUrl = targetUrl.trim();
        urlInput.value = targetUrl;
      }

      chrome.storage.sync.set({ vercelAppUrl: targetUrl });
      const appUrl = targetUrl.replace(/\/+$/, '');
      const targetLdap = detectedLdap || 'my-apps';
      const btn = document.getElementById('iitb-widget-sync-btn');
      btn.innerText = 'Syncing...';
      btn.style.background = '#0369a1';

      const allCompanies = Array.from(accumulatedCompanies.values());

      // 1. Post to API webhook
      try {
        await fetch(`${appUrl}/api/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ldapId: targetLdap, applications: allCompanies }),
        });
      } catch (e) {
        console.warn('API post failed, falling back to tab open', e);
      }

      // 2. Open Web App tab with encoded payload
      const payloadStr = encodeURIComponent(JSON.stringify(allCompanies));
      const redirectUrl = `${appUrl}?sync_ldap=${encodeURIComponent(targetLdap)}&sync_payload=${payloadStr}`;
      window.open(redirectUrl, '_blank');

      btn.innerText = `✓ Synced ${allCompanies.length} Jobs!`;
      btn.style.background = '#10b981';
      setTimeout(() => {
        btn.innerText = '🚀 Sync to Vercel Tracker';
        btn.style.background = '#0284c7';
      }, 3000);
    };
  }

  function updateWidgetCount() {
    const countEl = document.getElementById('iitb-captured-count');
    if (countEl) {
      countEl.innerText = accumulatedCompanies.size;
    }
  }

  // Initial trigger
  function init() {
    scrapeCurrentDOM();
    if (document.querySelector('table.mat-table')) {
      injectFloatingWidget();
    }
  }

  // Observe page changes (when user manually changes page or filters)
  const observer = new MutationObserver(() => {
    const prevSize = accumulatedCompanies.size;
    scrapeCurrentDOM();
    if (document.querySelector('table.mat-table')) {
      injectFloatingWidget();
    }
    if (accumulatedCompanies.size !== prevSize) {
      updateWidgetCount();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init();
  } else {
    window.addEventListener('DOMContentLoaded', init);
  }
})();
