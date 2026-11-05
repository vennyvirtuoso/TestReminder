import { NextRequest, NextResponse } from 'next/server';

// In-memory cache for recent sync transfers (short TTL)
interface SyncItem {
  ldapId: string;
  applications: any[];
  syncedAt: number;
}

const syncCache = new Map<string, SyncItem>();

// Clean up entries older than 30 minutes
const cleanupOldEntries = () => {
  const now = Date.now();
  for (const [key, val] of syncCache.entries()) {
    if (now - val.syncedAt > 30 * 60 * 1000) {
      syncCache.delete(key);
    }
  }
};

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
    cleanupOldEntries();
    const body = await req.json();
    const { ldapId, applications } = body;

    if (!Array.isArray(applications) || applications.length === 0) {
      return NextResponse.json(
        { error: 'Invalid payload: applications array required' },
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    const cleanLdap = (ldapId || 'my-apps').toLowerCase().trim();
    const syncId = Math.random().toString(36).substring(2, 10);

    const item: SyncItem = {
      ldapId: cleanLdap,
      applications,
      syncedAt: Date.now(),
    };

    // Store by both syncId and ldapId
    syncCache.set(syncId, item);
    syncCache.set(cleanLdap, item);

    return NextResponse.json(
      {
        success: true,
        syncId,
        ldapId: cleanLdap,
        count: applications.length,
        message: `Cached ${applications.length} applications for sync transfer`,
      },
      {
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const syncId = searchParams.get('syncId') || searchParams.get('sync_id');
    const ldapId = searchParams.get('ldapId') || searchParams.get('ldap');

    if (!syncId && !ldapId) {
      return NextResponse.json(
        { error: 'syncId or ldapId query param required' },
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    let item: SyncItem | undefined;
    if (syncId && syncCache.has(syncId)) {
      item = syncCache.get(syncId);
      // Consume one-time token
      syncCache.delete(syncId);
    } else if (ldapId) {
      item = syncCache.get(ldapId.toLowerCase().trim());
    }

    if (!item) {
      return NextResponse.json(
        { success: false, error: 'Sync session expired or not found' },
        {
          status: 404,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    return NextResponse.json(
      {
        success: true,
        ldapId: item.ldapId,
        applications: item.applications,
        count: item.applications.length,
      },
      {
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
}
