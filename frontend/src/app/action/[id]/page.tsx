/**
 * Action page component
 * Renders the Blinch action UI
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ActionCard from '@/components/ActionCard';

interface PageProps {
  params: { id: string };
}

/**
 * Generate metadata for the action page
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = params;

  return {
    title: `Action ${id} - Blinch`,
    description: `Execute Blinch action ${id}`,
    openGraph: {
      title: `Blinch Action: ${id}`,
      description: 'Interactive Bitcoin Cash Action',
      type: 'website',
    },
  };
}

/**
 * Action page component
 */
export default async function ActionPage({ params }: PageProps) {
  const { id } = params;

  // Fetch action data from backend via proxy
  const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:3001'}/api/action/${id}`, {
    cache: 'force-cache',
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    notFound();
  }

  const action = await response.json();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      {/* Header */}
      <header className="border-b border-white/10 glass">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-xl font-bold">B</span>
            </div>
            <h1 className="text-2xl font-bold gradient-text">Blinch</h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <ActionCard action={action} />
        </div>
      </main>
    </div>
  );
}
