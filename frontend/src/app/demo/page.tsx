/**
 * Demo Landing Page
 * Showcases Blinch protocol capabilities with pre-configured demo actions
 */

import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Blinch Demo - Interactive Bitcoin Cash Actions',
  description: 'Experience the Blinch protocol with interactive demo actions',
};

const DEMO_ACTIONS = [
  {
    id: 'simple-tip',
    title: '☕ Quick Tip',
    description: 'Basic protocol demonstration - send a tip with OP_RETURN enforcement',
    difficulty: 'Beginner',
    useContract: false,
    features: ['Direct payment', 'Protocol identifier on-chain', 'Instant verification'],
  },
  {
    id: 'bounty-blinch',
    title: '🎯 Bounty Blinch',
    description: 'Conditional payment via smart contract - funds locked until proof provided',
    difficulty: 'Advanced',
    useContract: true,
    features: [
      'Smart contract protection',
      'Covenant enforcement',
      'Conditional release',
      'Time-locked security',
    ],
  },
  {
    id: 'dev-reward',
    title: '💎 Dev Reward',
    description: 'Developer appreciation with covenant-protected payments',
    difficulty: 'Intermediate',
    useContract: true,
    features: [
      'Contract-protected',
      'Multi-parameter support',
      'On-chain verification',
      'Creator protection',
    ],
  },
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background">
      {/* Header */}
      <header className="border-b border-white/10 glass">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Image
                src="/icon-md.png"
                alt="Blinch"
                width={40}
                height={40}
                className="rounded-2xl"
                unoptimized
              />
            </div>
            <h1 className="text-2xl font-bold gradient-text">Blinch Demo</h1>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-5xl font-bold mb-6 gradient-text">
            Interactive Bitcoin Cash Actions
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Experience the Blinch protocol through hands-on demo actions. See how covenant
            contracts enforce protocol compliance on-chain.
          </p>

          {/* Protocol Info */}
          <div className="glass-strong rounded-2xl p-6 mb-8 border border-accent/30">
            <h3 className="text-xl font-semibold text-accent mb-4">🔐 Protocol Enforcement</h3>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="text-gray-500 mb-1">Protocol Prefix</div>
                <div className="font-mono text-accent">464c4f5701</div>
                <div className="text-xs text-gray-500 mt-1">FLOW\x01</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Contract Address</div>
                <div className="font-mono text-xs text-accent truncate">
                  bchtest:pdkfu...s6xsyj
                </div>
                <div className="text-xs text-gray-500 mt-1">100-year timeout</div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Network</div>
                <div className="font-mono text-accent">Chipnet Testnet</div>
                <div className="text-xs text-gray-500 mt-1">No real value</div>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Actions Grid */}
        <div className="max-w-6xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-center">Choose Your Demo</h3>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {DEMO_ACTIONS.map((action) => (
              <Link
                key={action.id}
                href={`/action/${action.id}`}
                className="group glass-strong rounded-2xl p-6 hover:border-accent/50 transition-all border border-white/10 hover:shadow-xl hover:shadow-accent/20"
              >
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-2xl font-bold">{action.title}</h4>
                  {action.useContract && (
                    <span className="px-2 py-1 rounded-full text-xs bg-accent/20 border border-accent/30 text-accent">
                      Contract
                    </span>
                  )}
                </div>

                <p className="text-gray-400 mb-4 text-sm">{action.description}</p>

                <div className="mb-4">
                  <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">
                    {action.difficulty}
                  </span>
                </div>

                <ul className="space-y-2 text-sm text-gray-400">
                  {action.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-accent">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                  <span className="text-sm text-gray-500">Try it now →</span>
                  <svg
                    className="w-5 h-5 text-gray-500 group-hover:text-accent transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold mb-8 text-center">How Blinch Works</h3>

          <div className="grid md:grid-cols-4 gap-6">
            <div className="glass-strong rounded-xl p-6 text-center border border-white/10">
              <div className="text-4xl mb-4">1️⃣</div>
              <h4 className="font-semibold mb-2">Create Action</h4>
              <p className="text-sm text-gray-400">
                Define payment rules and conditions
              </p>
            </div>

            <div className="glass-strong rounded-xl p-6 text-center border border-white/10">
              <div className="text-4xl mb-4">2️⃣</div>
              <h4 className="font-semibold mb-2">Share Link</h4>
              <p className="text-sm text-gray-400">
                Distribute the Blinch action URL
              </p>
            </div>

            <div className="glass-strong rounded-xl p-6 text-center border border-white/10">
              <div className="text-4xl mb-4">3️⃣</div>
              <h4 className="font-semibold mb-2">Execute</h4>
              <p className="text-sm text-gray-400">
                User clicks and wallet opens
              </p>
            </div>

            <div className="glass-strong rounded-xl p-6 text-center border border-white/10">
              <div className="text-4xl mb-4">4️⃣</div>
              <h4 className="font-semibold mb-2">Verify</h4>
              <p className="text-sm text-gray-400">
                Check OP_RETURN on-chain
              </p>
            </div>
          </div>
        </div>

        {/* Architecture Diagram */}
        <div className="max-w-4xl mx-auto mt-16">
          <h3 className="text-3xl font-bold mb-8 text-center">Covenant Architecture</h3>

          <div className="glass-strong rounded-2xl p-8 border border-accent/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1 text-center">
                <div className="text-2xl mb-2">👤 User</div>
                <div className="text-sm text-gray-400">Initiates Action</div>
              </div>

              <svg className="w-6 h-6 text-accent hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>

              <div className="flex-1 text-center">
                <div className="text-2xl mb-2">🔐 Covenant</div>
                <div className="text-sm text-gray-400">
                  Enforces OP_RETURN<br />
                  <code className="text-xs text-accent">464c4f5701</code>
                </div>
              </div>

              <svg className="w-6 h-6 text-accent hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>

              <div className="flex-1 text-center">
                <div className="text-2xl mb-2">💰 Recipient</div>
                <div className="text-sm text-gray-400">Receives Funds</div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 text-center text-sm text-gray-500">
              <p>The smart contract validates every transaction ensures protocol compliance before releasing funds.</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <div className="glass-strong rounded-2xl p-8 border border-primary/30">
            <h3 className="text-2xl font-bold mb-4">Ready to Build?</h3>
            <p className="text-gray-400 mb-6">
              Create your own Blinch actions with our powerful API.
            </p>
            <Link
              href="/create"
              className="inline-block px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all font-medium text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Create Your Action
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-gray-500">
          <p>Powered by CashScript • Bitcoin Cash Covenant Contracts</p>
          <p className="mt-2">
            <a
              href="https://github.com/chidx/blinch"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View on GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
