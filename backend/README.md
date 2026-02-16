# Blinch Backend API

Express 5.2.1 backend server for the Blinch protocol BCH-Action JSON Schema API.

## Features

- ✅ Express 5.2.1 with async error handling
- ✅ CORS enabled for all origins
- ✅ Helmet security headers
- ✅ Request compression
- ✅ BCH-Action JSON Schema v1.1.0
- ✅ Bitcoin Cash URI generation with OP_RETURN
- ✅ OpenGraph meta tags support

## Quick Start

```bash
cd backend
npm install
npm run dev
```

Server will start on `http://localhost:3001`

## API Endpoints

### GET /api/action/:id

Returns BCH-Action JSON Schema v1.1.0 for a given action ID.

**Example:**
```bash
curl http://localhost:3001/api/action/example
```

**Response:**
```json
{
  "version": "1.1.0",
  "type": "action",
  "icon": "https://blinch.network/assets/icon.png",
  "title": "Example Blinch Action",
  "description": "An example interactive Bitcoin Cash action",
  "links": {
    "actions": [{
      "label": "Execute",
      "href": "bitcoincash:addr?amount=0.01&op_return=464c4f5701tip",
      "parameters": [
        { "name": "note", "label": "Public Note", "type": "text" }
      ]
    }]
  },
  "metadata": {
    "protocol": "Blinch",
    "identifier": "FLOW\\x01",
    "hex_prefix": "464c4f5701"
  }
}
```

### GET /api/actions

List all available actions.

### POST /api/action

Create a new action (admin use).

**Request Body:**
```json
{
  "title": "My Action",
  "description": "Action description",
  "recipientAddress": "bitcoincash:...",
  "amount": "0.01",
  "parameters": [
    { "name": "note", "label": "Note", "type": "text" }
  ]
}
```

### GET /api/health

Health check endpoint.

## Environment Variables

```bash
PORT=3001
NODE_ENV=development
```

## OpenGraph Support

The API includes meta tags for social media unfurling. Add to your HTML:

```html
<meta property="og:type" content="website">
<meta property="og:title" content="Blinch Action">
<meta property="og:description" content="Interactive Bitcoin Cash Action">
<meta property="og:image" content="https://blinch.network/assets/og-image.png">
```

## Error Handling

The API uses Express 5.x async error handling with proper error codes:

- `VALIDATION_ERROR` - Invalid request data
- `INVALID_ACTION_ID` - Malformed action ID
- `ACTION_NOT_FOUND` - Action doesn't exist
- `INVALID_ADDRESS` - Invalid BCH address
- `INTERNAL_ERROR` - Server error

## Development

```bash
npm run dev       # Start development server with tsx watch
npm run build     # Compile TypeScript
npm run start     # Start production server
npm run test      # Run tests
npm run lint      # Lint code
```

## Architecture

```
src/
├── routes/          # API route handlers
│   ├── actions.ts   # Action endpoints
│   ├── health.ts    # Health check
│   └── index.ts     # Route aggregator
├── middleware/      # Express middleware
│   ├── errorHandler.ts
│   └── logger.ts
├── lib/            # Utilities
│   └── action-builder.ts
├── types/          # TypeScript types
│   ├── action.ts
│   ├── errors.ts
│   └── express.ts
├── server.ts       # Express app setup
└── index.ts        # Entry point
```

## Protocol Compliance

All generated Bitcoin Cash URIs include the mandatory OP_RETURN prefix `464c4f5701`:

```
bitcoincash:address?amount=0.1&op_return=464c4f5701action_data
```

This ensures compliance with the Blinch protocol requirements.

## License

MIT
