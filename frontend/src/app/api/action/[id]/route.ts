/**
 * Next.js App Router - Action API Route Handler
 *
 * This file proxies action requests to the backend API.
 * Placed at app/api/action/[id]/route.ts to avoid conflict with the page.
 */

import { NextRequest, NextResponse } from 'next/server';

// Backend API URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

/**
 * Proxy handler for action routes
 * GET /api/action/:id → GET http://localhost:3001/api/action/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  try {
    // Proxy to backend
    const backendUrl = `${BACKEND_URL}/api/action/${id}`;
    const response = await fetch(backendUrl, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: response.statusText },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Add custom headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('X-Blinch-Protocol-Version', '1.1.0');

    return NextResponse.json(data, { headers });
  } catch (error) {
    console.error('Action proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch action' },
      { status: 500 }
    );
  }
}

/**
 * POST handler for creating actions
 * POST /api/action/:id → POST http://localhost:3001/api/action
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Proxy to backend
    const backendUrl = `${BACKEND_URL}/api/action`;
    const body = await request.json();

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        await response.json(),
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Action proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to create action' },
      { status: 500 }
    );
  }
}
