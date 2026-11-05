import { NextRequest, NextResponse } from 'next/server';
import { parsePlacementBlog } from '@/utils/blogParser';

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
        { error: 'Missing session token. Please provide your IITB placement token.' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const cleanToken = token.trim().replace(/^Bearer\s+/i, '');

    // Extract student's applicantId from JWT payload if present
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

    const discoveredTests: any[] = [];

    // 1. Fetch Official Placement Portal Activities (Tests & PPTs)
    try {
      const activityUrl = 'https://campus.placements.iitb.ac.in/api/v1/activity/testppt';
      console.log('[IITB Blog API] Querying portal test activity:', activityUrl);

      const actRes = await fetch(activityUrl, {
        method: 'GET',
        headers,
      });

      if (actRes.ok) {
        const actData = await actRes.json();
        const items = Array.isArray(actData)
          ? actData
          : Array.isArray(actData.data)
          ? actData.data
          : Array.isArray(actData.activities)
          ? actData.activities
          : [];

        console.log('[IITB Blog API] Successfully fetched test activities count:', items.length);

        for (const item of items) {
          const compName =
            item.company?.name ||
            item.companyName ||
            item.job?.company?.name ||
            item.job?.companyName ||
            item.title;

          const dateStr = item.dateTime || item.date || item.startTime || item.startAt;
          const venue = item.venueDetails || item.venue || item.platform || item.mode || 'Online';
          const type = item.type || item.activityType || 'Test';

          if (compName && dateStr) {
            discoveredTests.push({
              source: 'portal_activity',
              companyName: String(compName).trim(),
              profile: item.job?.designation || item.designation || undefined,
              testDate: String(dateStr).slice(0, 10),
              testTime: String(dateStr).slice(11, 16) || undefined,
              venue: String(venue).trim(),
              activityType: String(type).trim(),
            });
          }
        }
      } else {
        console.warn('[IITB Blog API] activity/testppt returned:', actRes.status);
      }
    } catch (err) {
      console.warn('[IITB Blog API] Error fetching activity/testppt:', err);
    }

    // 2. Fetch General Activity Route
    if (discoveredTests.length === 0) {
      try {
        const genActivityUrl = 'https://campus.placements.iitb.ac.in/api/v1/activity/';
        const genRes = await fetch(genActivityUrl, { method: 'GET', headers });
        if (genRes.ok) {
          const genData = await genRes.json();
          const items = Array.isArray(genData) ? genData : genData.data || [];
          for (const item of items) {
            if (/test|assessment|coding|aptitude/i.test(item.type || item.title || '')) {
              discoveredTests.push({
                source: 'portal_activity_gen',
                companyName: item.company?.name || item.companyName || item.title || 'Company',
                testDate: (item.dateTime || item.date || '').slice(0, 10),
                testTime: (item.dateTime || '').slice(11, 16) || undefined,
                venue: item.venue || 'Online',
              });
            }
          }
        }
      } catch (e) {
        console.warn('[IITB Blog API] Error fetching general activities:', e);
      }
    }

    // 3. Attempt direct HTML fetch of the Placement Blog
    try {
      const blogUrl = 'https://campus.placements.iitb.ac.in/blog/placement/';
      console.log('[IITB Blog API] Scanning blog HTML:', blogUrl);
      const blogRes = await fetch(blogUrl, {
        method: 'GET',
        headers: {
          ...headers,
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        redirect: 'follow',
      });

      if (blogRes.ok) {
        const blogHtml = await blogRes.text();
        const parsedBlogAnnouncements = parsePlacementBlog(blogHtml);
        for (const ann of parsedBlogAnnouncements) {
          discoveredTests.push({
            source: 'blog_html',
            companyName: ann.companyName,
            profile: ann.profile,
            testDate: ann.testDate,
            testTime: ann.testTime,
            venue: ann.venue,
            instructions: ann.instructions,
          });
        }
      }
    } catch (e) {
      console.warn('[IITB Blog API] Blog HTML fetch notice:', e);
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
