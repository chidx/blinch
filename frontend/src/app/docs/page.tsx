/**
 * Documentation page
 */

import Link from 'next/link';

export default function DocsPage() {
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
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 gradient-text">Documentation</h1>
          <p className="text-xl text-gray-400">
            Learn how to use the Blinch protocol for interactive Bitcoin Cash actions.
          </p>
        </div>

        {/* Quick Start */}
        <section className="mb-12 glass-strong rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              Blinch enables interactive Bitcoin Cash actions through covenant-based smart
              contracts. Every transaction includes a mandatory OP_RETURN output with the
              protocol identifier.
            </p>

            <div className="bg-black/30 rounded-lg p-4 my-6">
              <p className="text-sm text-gray-400 mb-2">Protocol Identifier (OP_RETURN):</p>
              <code className="text-accent text-lg">464c4f5701 (FLOW\x01)</code>
            </div>

            <h3 className="text-xl font-semibold mt-8 mb-3">Try an Action</h3>
            <p>
              Visit the{' '}
              <Link href="/action/example" className="text-accent hover:underline">
                example action
              </Link>{' '}
              to see Blinch in action.
            </p>
          </div>
        </section>

        {/* Architecture */}
        <section className="mb-12 glass-strong rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Architecture</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-4 rounded-lg bg-black/30 border border-white/10">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-semibold mb-2">Smart Contracts</h3>
              <p className="text-sm text-gray-400">
                CashScript covenants enforce protocol compliance with native introspection
              </p>
            </div>

            <div className="p-4 rounded-lg bg-black/30 border border-white/10">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold mb-2">Backend API</h3>
              <p className="text-sm text-gray-400">
                Express server serving BCH-Action JSON Schema for action metadata
              </p>
            </div>

            <div className="p-4 rounded-lg bg-black/30 border border-white/10">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-semibold mb-2">Frontend</h3>
              <p className="text-sm text-gray-400">
                Next.js 16 app with beautiful glassmorphic UI
              </p>
            </div>
          </div>
        </section>

        {/* BCH-Action Schema */}
        <section className="mb-12 glass-strong rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">BCH-Action JSON Schema</h2>

          <p className="text-gray-400 mb-6">
            Actions are represented using the BCH-Action JSON Schema v1.1.0:
          </p>

          <pre className="text-sm overflow-x-auto">
            <code>{`{
  "version": "1.1.0",
  "type": "action",
  "icon": "https://blinch.network/assets/icon.png",
  "title": "Interactive Blinch Action",
  "description": "Metadata for a Bitcoin Cash interactive link.",
  "links": {
    "actions": [{
      "label": "Execute",
      "href": "bitcoincash:addr?amount=0.01&op_return=464c4f5701[action_type]",
      "parameters": [
        { "name": "note", "label": "Public Note", "type": "text" }
      ]
    }]
  },
  "metadata": {
    "protocol": "Blinch",
    "identifier": "FLOW\\\\x01",
    "hex_prefix": "464c4f5701"
  }
}`}</code>
          </pre>
        </section>

        {/* Creating Actions */}
        <section className="mb-12 glass-strong rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Creating Actions</h2>

          <div className="space-y-4 text-gray-300">
            <p>
              To create a custom Blinch action, you need to deploy a Blinch smart contract and
              register the action with the backend API.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">1. Deploy Contract</h3>
            <p className="text-sm text-gray-400">
              Use the CashScript deployment script to deploy your covenant:
            </p>
            <pre className="text-sm mt-2">
              <code>cd contracts && npm run deploy:chipnet</code>
            </pre>

            <h3 className="text-xl font-semibold mt-6 mb-3">2. Register Action</h3>
            <p className="text-sm text-gray-400">
              POST your action metadata to the backend API:
            </p>
            <pre className="text-sm mt-2">
              <code>curl -X POST http://localhost:3001/api/action -d '{"title":"My Action",...}'</code>
            </pre>
          </div>
        </section>

        {/* Resources */}
        <section className="glass-strong rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Resources</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <a
              href="https://cashscript.org"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-lg bg-black/30 border border-white/10 hover:border-primary/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">CashScript</h3>
              <p className="text-sm text-gray-400">Smart contract language for Bitcoin Cash</p>
            </a>

            <a
              href="https://developer.bitcoin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-lg bg-black/30 border border-white/10 hover:border-primary/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">Bitcoin.com Developers</h3>
              <p className="text-sm text-gray-400">BCH development documentation</p>
            </a>

            <a
              href="https://chipnet.net"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-lg bg-black/30 border border-white/10 hover:border-primary/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">Chipnet Explorer</h3>
              <p className="text-sm text-gray-400">Testnet block explorer</p>
            </a>

            <a
              href="https://github.com/blinch"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 rounded-lg bg-black/30 border border-white/10 hover:border-primary/50 transition-colors"
            >
              <h3 className="font-semibold mb-1">GitHub</h3>
              <p className="text-sm text-gray-400">Source code and contributions</p>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-gray-500 text-sm">
          <p>Blinch Protocol - Built for BCH-1 Hackcelerator</p>
        </div>
      </footer>
    </div>
  );
}
