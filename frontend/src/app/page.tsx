/**
 * Home page - Dashboard for Blinch actions
 */

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      {/* Header */}
      <header className="border-b border-white/10 glass">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-xl font-bold">B</span>
              </div>
              <h1 className="text-2xl font-bold gradient-text">Blinch</h1>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/docs" className="text-sm text-gray-400 hover:text-white transition-colors">
                Documentation
              </Link>
              <a
                href="https://github.com/blinch/protocol"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                GitHub
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-5xl font-bold mb-6 gradient-text">
            Bitcoin Cash Interactive Blinks
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            A protocol for interactive Bitcoin Cash actions with covenant-based smart contracts
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/action/example"
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity font-medium"
            >
              Try Example Action
            </Link>
            <Link
              href="/docs"
              className="px-6 py-3 rounded-lg glass hover:bg-white/5 transition-colors font-medium"
            >
              Read Docs
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="glass rounded-xl p-6 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Covenant Security</h3>
            <p className="text-gray-400">
              CashScript smart contracts with native introspection ensure protocol compliance
            </p>
          </div>

          <div className="glass rounded-xl p-6 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary to-accent flex items-center justify-center mb-4">
              <span className="text-2xl">⚡</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Instant Execution</h3>
            <p className="text-gray-400">
              Execute actions directly from any wallet with Bitcoin Cash URI support
            </p>
          </div>

          <div className="glass rounded-xl p-6 hover:border-primary/50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center mb-4">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Beautiful UI</h3>
            <p className="text-gray-400">
              Glassmorphic design with modern aesthetics for high conversion
            </p>
          </div>
        </div>

        {/* Protocol Info */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="glass-strong rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-4">Protocol Compliance</h3>
            <p className="text-gray-400 mb-4">
              Every transaction includes an OP_RETURN output with the Blinch protocol identifier:
            </p>
            <code className="block bg-black/30 rounded-lg p-4 text-sm font-mono text-accent">
              464c4f5701 (FLOW\x01)
            </code>
            <p className="text-gray-500 text-sm mt-4">
              This ensures all actions follow the Blinch protocol standards for maximum security
              and interoperability.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-500 text-sm">
          <p>Blinch Protocol - Built for BCH-1 Hackcelerator</p>
          <p className="mt-2">Powered by CashScript • Next.js 16 • Bitcoin Cash</p>
        </div>
      </footer>
    </div>
  );
}
