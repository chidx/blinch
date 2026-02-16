# Blinch Frontend

Next.js 16 frontend for the Blinch protocol with glassmorphic dark mode design.

## Features

- ✅ Next.js 16 with App Router and Turbopack
- ✅ Proxy.ts for action route interception
- ✅ Edge caching with 'use cache' directive
- ✅ React components for action rendering
- ✅ CashScript SDK integration utilities
- ✅ Wallet connection flow
- ✅ Glassmorphic dark mode UI
- ✅ Tailwind CSS 4.0 styling

## Quick Start

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Visit `http://localhost:3000`

## Environment Variables

```bash
BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_NETWORK=chipnet
```

## Pages

### Home (`/`)
Dashboard with hero section and feature grid

### Action Page (`/action/:id`)
Renders Blinch action with execute button and parameters

## Components

### ActionCard
Main component for rendering BCH-Action JSON Schema

```tsx
import { ActionCard } from '@/components';

<ActionCard action={actionData} />
```

### WalletConnect
Wallet connection button (placeholder for BCH wallet integration)

```tsx
import { WalletConnect } from '@/components';

<WalletConnect onConnect={(addr) => console.log(addr)} />
```

### TransactionBuilder
Build and broadcast transactions with CashScript SDK

```tsx
import { TransactionBuilder } from '@/components';

<TransactionBuilder action={actionData} />
```

## CashScript Integration

The frontend includes utilities for building transactions:

```typescript
import { buildBlinchTransaction, broadcastTransaction } from '@/lib/cashscript';

const { tx, hex } = await buildBlinchTransaction({
  contractAddress: '...',
  artifact: contractArtifact,
  creatorKey: '...',
  recipientAddress: '...',
  amount: 10000,
  actionData: 'tip',
});

const txid = await broadcastTransaction(hex);
```

## Styling

### Glassmorphic Classes

```tsx
<div className="glass">
  {/* Light glass effect */}
</div>

<div className="glass-strong">
  {/* Strong glass effect */}
</div>
```

### Gradient Text

```tsx
<h1 className="gradient-text">
  Blinch
</h1>
```

## Development

```bash
npm run dev       # Start with Turbopack
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Lint code
```

## Architecture

```
src/
├── app/                    # Next.js 16 App Router
│   ├── action/[id]/       # Dynamic action pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ActionCard.tsx     # Main action renderer
│   ├── WalletConnect.tsx  # Wallet connection
│   └── TransactionBuilder.tsx
├── lib/                  # Utilities
│   ├── api.ts            # API client
│   ├── cashscript.ts     # CashScript SDK integration
│   └── transaction.ts    # Transaction utilities
├── proxy.ts              # Next.js proxy configuration
└── types/                # TypeScript types
```

## Proxy Configuration

The `proxy.ts` file intercepts action routes:

- **GET** `/action/:id` → Proxies to backend API
- **POST** `/action` → Creates new actions
- **Caching**: 5 minutes at edge with stale-while-revalidate

## Protocol Compliance

All transactions include mandatory OP_RETURN prefix:

```
464c4f5701 (FLOW\x01)
```

This is enforced by the CashScript integration.

## License

MIT
