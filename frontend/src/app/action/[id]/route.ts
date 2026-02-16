/**
 * Next.js 16 App Router - Action Route Handler
 *
 * This file proxies action requests to the backend API.
 * It's placed at app/action/[id]/route.ts for Next.js 16 routing.
 */

export { GET, POST, revalidate, runtime, dynamic } from '../../proxy';
