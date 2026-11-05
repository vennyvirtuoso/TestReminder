import { NextRequest, NextResponse } from 'next/server';

// In-memory cache for recent syncs per LDAP (for cross-origin transfers)
const syncCache = new Map<string, { applications: any[]; syncedAt: string }>();

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
    const { ldapId, applications } = body;

    if (!ldapId || !Array.isArray(applications)) {
      return NextResponse.json(
        { error: 'Invalid payload. Must provide ldapId and applications array.' },
        {
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const cleanLdap = ldapId.toLowerCase().trim();
    syncCache.set(cleanLdap, {
      applications,
      syncedAt: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        message: `Successfully received ${applications.length} applications for ${cleanLdap}`,
        count: applications.length,
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ldapId = searchParams.get('ldapId');

  if (!ldapId) {
    return NextResponse.json(
      { error: 'ldapId query param required' },
      {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  const cleanLdap = ldapId.toLowerCase().trim();
  const cached = syncCache.get(cleanLdap);

  return NextResponse.json(
    {
      success: true,
      data: cached || null,
    },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
