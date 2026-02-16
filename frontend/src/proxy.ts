/**
 * Next.js 16 Proxy Configuration
 *
 * This proxy intercepts and rewrites action/ paths to the backend API.
 * Implements edge caching with 'use cache' directive.
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// Backend API URL
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

/**
 * Edge cache configuration
 * Cache actions for 5 minutes at the edge
 */
export const revalidate = 300; // 5 minutes

/**
 * Proxy handler for action routes
 * GET /action/:id → GET http://localhost:3001/api/action/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const { id } = params;

  try {
    // Build backend URL
    const backendUrl = `${BACKEND_URL}/api/action/${encodeURIComponent(id)}`;

    console.log(`[Proxy] Forwarding request to: ${backendUrl}`);

    // Forward request to backend
    const backendResponse = await fetch(backendUrl, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Blinch-Frontend/1.0',
        // Forward specific headers from client
        'Accept': request.headers.get('Accept') || 'application/json',
        // Cache control
        'Cache-Control': 'public, max-age=300',
      },
      // Don't forward body for GET requests
      body: undefined,
      // Next: required for edge runtime
      next: {
        revalidate: revalidate,
      },
    });

    // Check if backend response is ok
    if (!backendResponse.ok) {
      const errorData = await backendResponse.json().catch(() => ({
        error: { message: 'Backend error' },
      }));

      return NextResponse.json(
        {
          error: {
            ...errorData.error,
            message: `Action not found or invalid: ${id}`,
          },
        },
        { status: backendResponse.status }
      );
    }

    // Get response data
    const data = await backendResponse.json();

    // Create NextResponse with cached data
    const response = NextResponse.json(data, {
      status: backendResponse.status,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'X-Blinch-Cache': 'HIT',
        'X-Blinch-Protocol-Version': data.version || '1.1.0',
      },
    });

    return response;
  } catch (error) {
    console.error('[Proxy] Error forwarding request:', error);

    return NextResponse.json(
      {
        error: {
          code: 'PROXY_ERROR',
          message: 'Failed to fetch action metadata',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 502 }
    );
  }
}

/**
 * POST handler for creating actions
 * POST /action → POST http://localhost:3001/api/action
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const backendUrl = `${BACKEND_URL}/api/action`;

    console.log('[Proxy] Forwarding POST request to:', backendUrl);

    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    return NextResponse.json(data, {
      status: backendResponse.status,
    });
  } catch (error) {
    console.error('[Proxy] Error forwarding POST request:', error);

    return NextResponse.json(
      {
        error: {
          code: 'PROXY_ERROR',
          message: 'Failed to create action',
        },
      },
      { status: 502 }
    );
  }
}

/**
 * Generate static params for static generation
 * Uncomment if you want to pre-generate popular actions
 */
// export async function generateStaticParams() {
//   const actions = ['example', 'popular1', 'popular2'];
//   return actions.map((id) => ({ id }));
// }

/**
 * Optional: Runtime configuration
 */
export const runtime = 'nodejs'; // or 'edge' for edge runtime
export const dynamic = 'force-dynamic'; // Disable static optimization
