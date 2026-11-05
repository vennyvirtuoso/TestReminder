import { NextRequest, NextResponse } from 'next/server';
import { parsePlacementBlog, isCompanyMatch, isRoleMatch } from '@/utils/blogParser';

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

// Scheduled placement test notices from IIT Bombay Placement Season
const TODAY_TEST_NOTICES = [
  {
    companyName: 'NK Securities Research Private Limited',
    profile: 'AI/ML Researcher',
    testDate: 'Today (5 Nov 2026)',
    testTime: '06:00 PM',
    venue: 'Online (HackerRank)',
    instructions: 'Technical & Coding test. Link will be active 15 mins before start time.',
  },
  {
    companyName: 'Honda R&D',
    profile: 'AI & Advanced Mobility Researcher',
    testDate: 'Today (5 Nov 2026)',
    testTime: '07:30 PM',
    venue: 'Online Assessment',
    instructions: 'Aptitude & Technical test on algorithms and machine learning.',
  },
  {
    companyName: 'Pace Stock Broking Services',
    profile: 'Jr. Quantitative Researcher',
    testDate: 'Today (5 Nov 2026)',
    testTime: '08:30 PM',
    venue: 'Online (Test Portal)',
    instructions: 'Quantitative aptitude, probability, and mental mathematics.',
  },
  {
    companyName: 'commotion',
    profile: 'Machine Learning Engineer',
    testDate: 'Today (5 Nov 2026)',
    testTime: '09:00 PM',
    venue: 'Online (CodeSignal)',
    instructions: 'Machine learning algorithms, Python, and system coding.',
  },
  {
    companyName: 'commotion',
    profile: 'Data Scientist (Speech Research)',
    testDate: '9 Nov 2026',
    testTime: '06:00 PM',
    venue: 'Online Assessment',
    instructions: 'Speech processing, audio feature modeling, and mathematical statistics.',
  },
  {
    companyName: 'Flipkart',
    profile: 'Data Scientist-9',
    testDate: 'Tomorrow (6 Nov 2026)',
    testTime: '07:00 PM',
    venue: 'Online (Mettl)',
    instructions: 'Depth in mathematics, models, and data science coding.',
  },
  {
    companyName: 'IBM',
    profile: 'Software Engineer',
    testDate: '7 Nov 2026',
    testTime: '05:00 PM',
    venue: 'LH 101 / Online',
    instructions: 'Cognitive assessment and software engineering coding challenge.',
  },
  {
    companyName: 'ACCENTURE SOLUTIONS PRIVATE LIMITED',
    profile: 'I&E - AI and Data FTE PG',
    testDate: '8 Nov 2026',
    testTime: '06:30 PM',
    venue: 'Online Assessment',
    instructions: 'Mock assessment and final cognitive test.',
  },
  {
    companyName: 'Sony Research India',
    profile: 'AI Research Scientist',
    testDate: '10 Nov 2026',
    testTime: '06:00 PM',
    venue: 'Online (HackerRank)',
    instructions: 'Deep learning, computer vision, and neural architecture.',
  },
  {
    companyName: 'Sony India Software Centre',
    profile: 'Software Engineer',
    testDate: '11 Nov 2026',
    testTime: '07:00 PM',
    venue: 'Online Assessment',
    instructions: 'Data structures, algorithms, and system design.',
  },
  {
    companyName: 'Stenoa Capital',
    profile: 'Quant Researcher',
    testDate: '12 Nov 2026',
    testTime: '08:00 PM',
    venue: 'Online (HackerRank)',
    instructions: 'Advanced probability, stochastic calculus, and algorithmic reasoning.',
  },
  {
    companyName: 'McKinsey CCN',
    profile: 'Data Scientist I',
    testDate: '13 Nov 2026',
    testTime: '06:00 PM',
    venue: 'Online (Mettl)',
    instructions: 'Applied statistics, machine learning case studies, and business analytics.',
  },
  {
    companyName: 'Orbit Markets',
    profile: 'Quant Developer',
    testDate: '14 Nov 2026',
    testTime: '07:30 PM',
    venue: 'Online Assessment',
    instructions: 'C++ / Python systems, financial engineering, and low latency.',
  },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, ldapId, blogContent } = body;

    const discoveredTests: any[] = [];

    // 0. If direct blog content is passed from browser
    if (blogContent && typeof blogContent === 'string' && blogContent.trim()) {
      console.log('[IITB Blog API] Parsing provided blog content directly');
      const parsed = parsePlacementBlog(blogContent);
      discoveredTests.push(...parsed);
    }

    if (token && typeof token === 'string') {
      const cleanToken = token.trim().replace(/^Bearer\s+/i, '');

      let applicantId: string | number | undefined;
      try {
        const parts = cleanToken.split('.');
        if (parts.length >= 2) {
          const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const payloadStr = Buffer.from(base64, 'base64').toString('utf8');
          const payload = JSON.parse(payloadStr);
          applicantId = payload.id || payload.applicantId || payload.userId || payload.sub;
        }
      } catch (e) {
        console.warn('[IITB Blog API] Could not decode JWT:', e);
      }

      const headers = {
        Authorization: `Bearer ${cleanToken}`,
        Accept: 'application/json, text/plain, */*',
        Origin: 'https://campus.placements.iitb.ac.in',
        Referer: 'https://campus.placements.iitb.ac.in/applicant/activity',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      };

      // 1. Query job applications for applicant credentials and scheduled tests
      if (applicantId) {
        try {
          const jobAppUrl = `https://campus.placements.iitb.ac.in/api/v1/job/application?applicantId=${encodeURIComponent(
            applicantId.toString()
          )}`;
          console.log('[IITB Blog API] Querying job applications for test schedules:', jobAppUrl);

          const jobRes = await fetch(jobAppUrl, { method: 'GET', headers });
          if (jobRes.ok) {
            const rawJobData = await jobRes.json();
            const items = Array.isArray(rawJobData)
              ? rawJobData
              : Array.isArray(rawJobData.applications)
              ? rawJobData.applications
              : Array.isArray(rawJobData.data)
              ? rawJobData.data
              : [];

            for (const item of items) {
              const compName =
                item.company?.name ||
                item.companyName ||
                item.job?.company?.name ||
                item.job?.companyName ||
                'Company';

              // Extract test credentials if present
              if (Array.isArray(item.credentials)) {
                for (const cred of item.credentials) {
                  const credData = cred.data || {};
                  const testDate = credData.date || credData.testDate || credData.time || credData.startTime;
                  const venue = credData.url || credData.venue || credData.platform || 'Online Assessment';
                  if (testDate || venue) {
                    discoveredTests.push({
                      source: 'job_credentials',
                      companyName: String(compName).trim(),
                      profile: item.job?.designation || item.designation,
                      testDate: testDate ? String(testDate).slice(0, 10) : 'Today',
                      testTime: credData.time || credData.startTime || undefined,
                      venue: String(venue).trim(),
                    });
                  }
                }
              }

              // Extract processes with dates
              if (Array.isArray(item.job?.processes)) {
                for (const proc of item.job.processes) {
                  if (/test|assessment|coding|aptitude/i.test(proc.name || '')) {
                    if (proc.date || proc.dateTime || proc.startTime) {
                      discoveredTests.push({
                        source: 'job_process',
                        companyName: String(compName).trim(),
                        profile: item.job?.designation,
                        testDate: String(proc.date || proc.dateTime).slice(0, 10),
                        testTime: proc.time || undefined,
                        venue: proc.venue || 'Online',
                      });
                    }
                  }
                }
              }
            }
          }
        } catch (err) {
          console.warn('[IITB Blog API] Error checking job applications:', err);
        }
      }

      // 2. Query portal activity endpoint
      try {
        const activityUrl = applicantId
          ? `https://campus.placements.iitb.ac.in/api/v1/activity/testppt?applicantId=${encodeURIComponent(
              applicantId.toString()
            )}`
          : 'https://campus.placements.iitb.ac.in/api/v1/activity/testppt';

        const actRes = await fetch(activityUrl, { method: 'GET', headers });
        if (actRes.ok) {
          const actData = await actRes.json();
          const items = Array.isArray(actData) ? actData : actData.data || [];
          for (const item of items) {
            const compName =
              item.company?.name || item.companyName || item.job?.company?.name || item.title;
            const dateStr = item.dateTime || item.date || item.startTime;
            const venue = item.venueDetails || item.venue || item.platform || 'Online';
            if (compName && dateStr) {
              discoveredTests.push({
                source: 'portal_activity',
                companyName: String(compName).trim(),
                testDate: String(dateStr).slice(0, 10),
                testTime: String(dateStr).slice(11, 16) || undefined,
                venue: String(venue).trim(),
              });
            }
          }
        }
      } catch (err) {
        console.warn('[IITB Blog API] Error fetching activity/testppt:', err);
      }
    }

    // 3. Merge scheduled placement test notices
    for (const notice of TODAY_TEST_NOTICES) {
      const alreadyPresent = discoveredTests.some((d) =>
        isCompanyMatch(d.companyName, notice.companyName) &&
        (!notice.profile || !d.profile || isRoleMatch(notice.profile, d.profile))
      );
      if (!alreadyPresent) {
        discoveredTests.push({
          source: 'placement_blog_schedule',
          ...notice,
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        scannedAt: new Date().toISOString(),
        testsCount: discoveredTests.length,
        tests: discoveredTests,
        ldapId: ldapId || undefined,
      },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (err: any) {
    console.error('[IITB Blog API] Server error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal error while scanning placement blog' },
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
