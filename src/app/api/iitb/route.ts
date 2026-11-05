import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, ldapId } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid token. Please provide your IITB placement session token.' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const cleanToken = token.trim().replace(/^Bearer\s+/i, '');

    // Call IIT Bombay's official REST API endpoint
    const iitbApiUrl = 'https://campus.placements.iitb.ac.in/api/v1/job/application';
    console.log('[IITB Direct API] Fetching applications from', iitbApiUrl);

    const iitbRes = await fetch(iitbApiUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        Accept: 'application/json, text/plain, */*',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://campus.placements.iitb.ac.in/applicant/application',
      },
    });

    if (!iitbRes.ok) {
      const errText = await iitbRes.text();
      console.error('[IITB Direct API] Error from IITB server:', iitbRes.status, errText);
      return NextResponse.json(
        {
          error: `IIT Bombay portal returned status ${iitbRes.status}. Your session token may be expired or invalid. Please check your login.`,
          details: errText.slice(0, 200),
        },
        { status: iitbRes.status, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const rawData = await iitbRes.json();
    console.log('[IITB Direct API] Success! Response type:', typeof rawData, Array.isArray(rawData) ? rawData.length : Object.keys(rawData));

    // Handle different response shapes from IITB API
    const rawItems: any[] = Array.isArray(rawData)
      ? rawData
      : Array.isArray(rawData.applications)
      ? rawData.applications
      : Array.isArray(rawData.data)
      ? rawData.data
      : Array.isArray(rawData.jobs)
      ? rawData.jobs
      : [];

    const formattedApplications = rawItems.map((item, idx) => {
      // Extract Company Name
      const companyName =
        item.company?.name ||
        item.companyName ||
        item.company_name ||
        item.company ||
        item.job?.company?.name ||
        item.job?.companyName ||
        item.job?.company_name ||
        item.job?.company ||
        item.jaf?.company?.name ||
        item.jaf?.companyName ||
        'Company';

      // Extract Job Role / Title / Designation
      let profile =
        item.designation ||
        item.title ||
        item.role ||
        item.job?.designation ||
        item.job?.title ||
        item.job?.role ||
        item.jobTitle ||
        item.job_title ||
        item.jaf?.designation ||
        'General Role';

      // Extract JAF ID / Code
      const jobCode = item.code || item.jobCode || item.job_code || item.job?.code || item.jaf?.code || (idx + 1);
      const jobId = item.jobId || item.job_id || item.job?.id || item.jaf?.id || item.id || '';
      let jafId = `Code #${jobCode}${jobId ? ` (JAF ${jobId})` : ''}`;

      // Handle bonus application flag
      const isBonus = item.isBonus || item.bonus || item.is_bonus || item.category === 'bonus';
      if (isBonus && !jafId.includes('Bonus')) {
        jafId = `${jafId} • [Bonus]`;
      }

      // If profile is purely numeric (like "3", "2") and jaf contains text, swap
      if (/^\d+$/.test(profile.trim()) && item.jafId && /[a-zA-Z]/.test(item.jafId)) {
        const num = profile.trim();
        profile = item.jafId.trim();
        jafId = `Profile #${num} (${jafId})`;
      }

      // Extract Current Status
      const status =
        item.status ||
        item.applicationStatus ||
        item.application_status ||
        item.progressStatus ||
        'Applied';

      // Extract Signing Date
      const appliedDate =
        item.signingDate ||
        item.signing_date ||
        item.createdAt ||
        item.created_at ||
        item.appliedAt ||
        item.applied_at ||
        new Date().toISOString().slice(0, 10);

      // Parse Hiring Process / Pipeline Stages if present
      const comments = [];
      let hasTest = false;
      let testName = '';

      if (Array.isArray(item.processes) || Array.isArray(item.stages) || Array.isArray(item.steps)) {
        const processList = item.processes || item.stages || item.steps;
        const stageNames = processList.map((p: any) => p.name || p.title || p.step || String(p));
        if (stageNames.length > 0) {
          comments.push({
            id: `stages-${idx}-${Date.now()}`,
            text: `Hiring Pipeline: ${stageNames.join(' ➔ ')}`,
            createdAt: new Date().toISOString(),
          });

          // Check if test is in stages
          const foundTest = stageNames.find((s: string) =>
            /test|assessment|coding|aptitude/i.test(s)
          );
          if (foundTest) {
            hasTest = true;
            testName = foundTest;
          }
        }
      }

      if (item.resumeId || item.resume) {
        comments.push({
          id: `resume-${idx}-${Date.now()}`,
          text: `Applied with Resume #${item.resumeId || item.resume}`,
          createdAt: new Date().toISOString(),
        });
      }

      return {
        id: `iitb-api-${jobId || idx}-${Date.now()}`,
        companyName: String(companyName).trim(),
        profile: String(profile).trim(),
        jafId: jafId,
        status: String(status).trim(),
        appliedDate: String(appliedDate).slice(0, 10),
        testGiven: false,
        testPlatform: hasTest ? testName : undefined,
        comments: comments,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    });

    return NextResponse.json(
      {
        success: true,
        count: formattedApplications.length,
        applications: formattedApplications,
        ldapId: ldapId || undefined,
      },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (err: any) {
    console.error('[IITB Direct API] Server Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error while connecting to IIT Bombay portal' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
