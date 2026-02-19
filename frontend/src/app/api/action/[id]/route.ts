/**
 * Next.js App Router - Action API Route Handler
 *
 * This file proxies action requests to the backend API.
 * Placed at app/api/action/[id]/route.ts to avoid conflict with the page.
 */

export { GET, POST, revalidate, runtime, dynamic } from '../../../../lib/action-proxy';
