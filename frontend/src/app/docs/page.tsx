/**
 * Documentation page
 */

import Link from 'next/link';
import { Navigation } from '@/components/Navigation';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      <Navigation />

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
  "icon": "/icon-lg.png",
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

          <div className="space-y-6 text-gray-300">
            <p>
              Blinch makes it easy to create interactive Bitcoin Cash actions. You can create actions
              through the web interface or programmatically via the API.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Method 1: Web Interface (Recommended)</h3>

            <div className="space-y-4">
              <div className="pl-4 border-l-2 border-primary">
                <h4 className="font-medium text-white">Step 1: Navigate to Create</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Click the "Create Your Blinch" button on the home page, or visit{' '}
                  <code className="text-accent">/create</code> directly.
                </p>
              </div>

              <div className="pl-4 border-l-2 border-primary">
                <h4 className="font-medium text-white">Step 2: Basic Information</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Enter a title and description for your action. Choose an icon from the presets.
                  The title should be short and descriptive (max 100 characters).
                </p>
              </div>

              <div className="pl-4 border-l-2 border-primary">
                <h4 className="font-medium text-white">Step 3: Fund Details</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Enter the Bitcoin Cash address that will receive payments. Choose a default amount
                  or enter a custom value. This is where funds will be sent when users execute your action.
                </p>
              </div>

              <div className="pl-4 border-l-2 border-primary">
                <h4 className="font-medium text-white">Step 4: Customize (Optional)</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Add an action type identifier or custom parameters for user input. You can also
                  add your BCH address as a creator to enable future edits/deletions.
                </p>
              </div>

              <div className="pl-4 border-l-2 border-primary">
                <h4 className="font-medium text-white">Step 5: Generate & Share</h4>
                <p className="text-sm text-gray-400 mt-1">
                  Review your action and click "Create Action". You'll get a unique URL that you can
                  share with others. The action will include the Blinch protocol identifier in all
                  transactions.
                </p>
              </div>
            </div>

            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mt-4">
              <p className="text-sm">
                <strong>Tip:</strong> Every transaction includes <code className="mx-1 px-2 py-0.5 rounded bg-black/30 text-accent">464c4f5701</code>
                in the OP_RETURN to ensure protocol compliance.
              </p>
            </div>

            <h3 className="text-xl font-semibold mt-8 mb-3">Method 2: API</h3>
            <p className="text-sm text-gray-400 mb-3">
              Create actions programmatically using the REST API:
            </p>

            <pre className="text-sm bg-black/30 rounded-lg p-4 overflow-x-auto">
              <code>{`curl -X POST http://localhost:3001/api/action \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Coffee Tip Jar",
    "description": "Tips for my coffee content!",
    "recipientAddress": "bitcoincash:qrqglczyxh4yvdnkkenk3k9ltq3e2j2dnqjvulv4rk",
    "amount": "0.01",
    "creatorAddress": "bitcoincash:qrqglczyxh4yvdnkkenk3k9ltq3e2j2dnqjvulv4rk"
  }'`}</code>
            </pre>

            <h4 className="font-medium text-white mt-6 mb-2">Response:</h4>
            <pre className="text-sm bg-black/30 rounded-lg p-4 overflow-x-auto">
              <code>{`{
  "id": "a1B2c3D4e5",
  "version": "1.1.0",
  "type": "action",
  "title": "Coffee Tip Jar",
  ...
}`}</code>
            </pre>
          </div>
        </section>

        {/* Dashboard */}
        <section className="mb-12 glass-strong rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Managing Actions</h2>

          <div className="space-y-4 text-gray-300">
            <p>
              Visit the <Link href="/dashboard" className="text-accent hover:underline">Dashboard</Link> to manage your created actions.
            </p>

            <h3 className="text-xl font-semibold mt-6 mb-3">Dashboard Features</h3>

            <ul className="space-y-3 mt-4">
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <div>
                  <strong className="text-white">View All Actions</strong>
                  <p className="text-sm text-gray-400">See all actions you've created with their details</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <div>
                  <strong className="text-white">Search & Filter</strong>
                  <p className="text-sm text-gray-400">Quickly find actions by title or description</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <div>
                  <strong className="text-white">Share Actions</strong>
                  <p className="text-sm text-gray-400">Copy action links with one click</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <div>
                  <strong className="text-white">Delete Actions</strong>
                  <p className="text-sm text-gray-400">Remove actions you no longer need (requires creator address)</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary">✓</span>
                <div>
                  <strong className="text-white">View Stats</strong>
                  <p className="text-sm text-gray-400">See overview of your actions (total, with parameters, custom types)</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* Sharing & Embedding */}
        <section className="mb-12 glass-strong rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Sharing & Embedding Actions</h2>

          <div className="space-y-4 text-gray-300">
            <h3 className="text-xl font-semibold mb-3">Share Your Action</h3>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-white mb-2">Direct Link</h4>
                <p className="text-sm text-gray-400">
                  Share the action URL: <code className="text-accent">https://blinch.network/action/[id]</code>
                </p>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">QR Code</h4>
                <p className="text-sm text-gray-400">
                  Generate a QR code for mobile wallet scanning. Users can scan and execute the action directly.
                </p>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">Embed on Website</h4>
                <p className="text-sm text-gray-400 mb-2">
                  Use an iframe to embed the action on your website:
                </p>
                <pre className="text-sm bg-black/30 rounded-lg p-4">
                  <code>{`<iframe
  src="https://blinch.network/action/[id]"
  width="400"
  height="300"
  frameborder="0">
</iframe>`}</code>
                </pre>
              </div>

              <div>
                <h4 className="font-medium text-white mb-2">Bitcoin Cash URI</h4>
                <p className="text-sm text-gray-400 mb-2">
                  Direct wallet integration using BCH URIs:
                </p>
                <pre className="text-sm bg-black/30 rounded-lg p-4 overflow-x-auto">
                  <code>{`bitcoincash:address?amount=0.01&op_return=464c4f5701[action_type]`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12 glass-strong rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">What is the creator address?</h3>
              <p className="text-sm text-gray-400">
                The creator address is your BCH address that proves ownership of an action. It allows you to edit or delete
                the action later. Without it, anyone can delete the action and you won't be able to make changes.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">What are custom parameters?</h3>
              <p className="text-sm text-gray-400">
                Custom parameters allow users to input additional data when executing your action. For example, you could
                ask for a note, a message, or any other text input. Parameters can be text, number, boolean, or date fields.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">How do I test my action?</h3>
              <p className="text-sm text-gray-400">
                After creating an action, click "View Action" to see how it looks. You can test the Bitcoin Cash URI
                with any BCH wallet that supports URI protocols. On Chipnet testnet, you can use testnet funds to test
                without real money.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Can I edit an action after creating it?</h3>
              <p className="text-sm text-gray-400">
                Currently, editing is not fully supported. However, if you set a creator address, you can delete and
                recreate the action with changes. Full edit functionality is planned for a future release.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Where are actions stored?</h3>
              <p className="text-sm text-gray-400">
                Actions are stored both in the backend server (file-based persistence) and in your browser's localStorage.
                This ensures your actions are available even if the server restarts, and provides fast access to your
                dashboard.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">What happens to the funds?</h3>
              <p className="text-sm text-gray-400">
                When a user executes your action, funds are sent directly to the recipient address you specified.
                Blinch doesn't hold or intermediate funds - it's a direct peer-to-peer transaction secured by
                the Bitcoin Cash blockchain.
              </p>
            </div>
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
