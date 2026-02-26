import { NextRequest, NextResponse } from 'next/server';

// Backend API URL (server-side only, can use localhost)
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

/**
 * POST /api/action
 * Proxy POST requests to backend for creating actions
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const backendUrl = `${BACKEND_URL}/api/action`;

    console.log('[API Proxy] Forwarding POST request to:', backendUrl);
    console.log('[API Proxy] Request body:', body);

    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    console.log('[API Proxy] Backend response status:', backendResponse.status);
    console.log('[API Proxy] Backend response data:', data);

    return NextResponse.json(data, {
      status: backendResponse.status,
      headers: {
        // Forward any important headers
        ...(backendResponse.headers.get('content-type') && {
          'content-type': backendResponse.headers.get('content-type')!,
        }),
      },
    });
  } catch (error) {
    console.error('[API Proxy] Error forwarding POST request:', error);

    return NextResponse.json(
      {
        error: {
          code: 'PROXY_ERROR',
          message: 'Failed to create action',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 502 }
    );
  }
}
