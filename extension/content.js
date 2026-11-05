// IIT Bombay Placement Portal - Ultra Lightweight & Safe Auto-Sync Content Script
(function () {
  console.log('[IITB Placement Auto-Sync] Safe content script initialized.');

  const accumulatedCompanies = new Map();
  let isAutoPaginating = false;

  function getCleanText(el) {
    if (!el) return '';
    try {
      const clone = el.cloneNode(true);
      clone.querySelectorAll('svg, i-feather, i, .fa, .feather').forEach((n) => n.remove());
      return clone.textContent.replace(/\s+/g, ' ').trim();
    } catch {
      return el.innerText ? el.innerText.trim() : '';
    }
  }

  function parseMatRow(row, category = 'Eligible') {
    try {
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
            if (step.classList.contains('success')) currentStatus = stepName;
            if (step.classList.contains('danger')) currentStatus = `Rejected at ${stepName}`;

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
    } catch (e) {
      console.warn('Row parse error:', e);
      return null;
    }
  }

  function scrapeCurrentDOM() {
    try {
      const eligibleSection = document.getElementById('eligible-jobs') || document;
      eligibleSection.querySelectorAll('table.mat-table tbody tr.mat-row, table tbody tr').forEach((row) => {
        const parsed = parseMatRow(row, 'Eligible');
        if (parsed) accumulatedCompanies.set(parsed.id, parsed);
      });

      const bonusSection = document.getElementById('bonus-jobs');
      if (bonusSection) {
        bonusSection.querySelectorAll('table.mat-table tbody tr.mat-row, table tbody tr').forEach((row) => {
          const parsed = parseMatRow(row, 'Bonus');
          if (parsed) accumulatedCompanies.set(parsed.id, parsed);
        });
      }
    } catch (e) {
      console.warn('DOM scrape error:', e);
    }
    return Array.from(accumulatedCompanies.values());
  }

  function getTotalSignedJobsCount() {
    try {
      const statsEl = document.querySelector('.stats, app-application');
      if (statsEl) {
        const match = statsEl.innerText.match(/Total number of jobs signed\s*(\d+)/i);
        if (match) return parseInt(match[1], 10);
      }
    } catch {}
    return 0;
  }

  function detectStudentLdap() {
    try {
      const pageText = document.body.innerText || '';
      const rollMatch = pageText.match(/\b([1-2][0-9]{8}|[1-2][0-9][a-zA-Z][0-9]{6})\b/i);
      if (rollMatch) return rollMatch[1].toLowerCase();
    } catch {}
    return '';
  }

  async function autoScrapeAllPages(updateCallback) {
    if (isAutoPaginating) return;
    isAutoPaginating = true;

    try {
      const totalExpected = getTotalSignedJobsCount();
      scrapeCurrentDOM();
      if (updateCallback) updateCallback(accumulatedCompanies.size, totalExpected);

      const eligibleSection = document.getElementById('eligible-jobs') || document;
      const paginator = eligibleSection.querySelector('.mat-paginator');

      if (paginator) {
        // Rewind to page 1
        let prevBtn = paginator.querySelector('.mat-paginator-navigation-previous:not([disabled]):not(.mat-button-disabled)');
        let rewindLimit = 0;
        while (prevBtn && rewindLimit < 10) {
          rewindLimit++;
          prevBtn.click();
          await new Promise((r) => setTimeout(r, 450));
          scrapeCurrentDOM();
          if (updateCallback) updateCallback(accumulatedCompanies.size, totalExpected);
          prevBtn = paginator.querySelector('.mat-paginator-navigation-previous:not([disabled]):not(.mat-button-disabled)');
        }

        // Page forward
        let nextBtn = paginator.querySelector('.mat-paginator-navigation-next:not([disabled]):not(.mat-button-disabled)');
        let forwardLimit = 0;
        while (nextBtn && forwardLimit < 15) {
          forwardLimit++;
          nextBtn.click();
          await new Promise((r) => setTimeout(r, 550));
          scrapeCurrentDOM();
          if (updateCallback) updateCallback(accumulatedCompanies.size, totalExpected);
          nextBtn = paginator.querySelector('.mat-paginator-navigation-next:not([disabled]):not(.mat-button-disabled)');
        }
      }

      scrapeCurrentDOM();
      if (updateCallback) updateCallback(accumulatedCompanies.size, totalExpected);
    } catch (err) {
      console.error('Auto-pagination error:', err);
    } finally {
      isAutoPaginating = false;
    }
  }

  function injectFloatingWidget() {
    if (document.getElementById('iitb-sync-floating-widget')) {
      updateWidgetCount();
      return;
    }

    const table = document.querySelector('table.mat-table');
    if (!table) return; // Only inject when placement table is present

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
      box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.3);
      padding: 14px 16px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      color: #0f172a;
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: 320px;
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

    const autoPageBtn = document.getElementById('iitb-auto-page-btn');
    autoPageBtn.onclick = async () => {
      autoPageBtn.innerText = '⏳ Collecting all pages...';
      autoPageBtn.disabled = true;

      await autoScrapeAllPages(() => {
        updateWidgetCount();
      });

      autoPageBtn.innerText = `✓ Collected ${accumulatedCompanies.size} jobs!`;
      autoPageBtn.style.background = '#dcfce7';
      autoPageBtn.style.color = '#15803d';
      setTimeout(() => {
        autoPageBtn.innerText = '⚡ Collect All Pages';
        autoPageBtn.disabled = false;
      }, 4000);
    };

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

      try {
        await fetch(`${appUrl}/api/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ldapId: targetLdap, applications: allCompanies }),
        });
      } catch (e) {
        console.warn('API sync warning:', e);
      }

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
    if (countEl) countEl.innerText = accumulatedCompanies.size;
  }

  // Periodic safe check (at most once every 1.5 seconds) - ZERO performance impact
  setInterval(() => {
    try {
      if (document.querySelector('table.mat-table')) {
        scrapeCurrentDOM();
        injectFloatingWidget();
      }
    } catch {}
  }, 1500);

  // Initial trigger after short delay so Angular completely finishes its initial render
  setTimeout(() => {
    try {
      scrapeCurrentDOM();
      injectFloatingWidget();
    } catch {}
  }, 1000);
})();
