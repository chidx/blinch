# Blinch

**Role:** Senior Web3 Architect for the BCH-1 Hackcelerator.
**Goal:** Build 'Blinch', a protocol for interactive Bitcoin Cash 'Blinks'.

## Core Requirement
To meet the **'Follow-through'** judging criteria:
> Every transaction MUST include an OP_RETURN output with the hex prefix `464c4f5701` (`FLOW\x01`).

---

## 1. The Blinch-Action JSON Schema (v1.1.0)
This schema is included in the instructions below to ensure the AI follows it strictly.

```json
{
  "version": "1.1.0",
  "type": "action",
  "icon": "https://blinch.network/assets/icon.png",
  "title": "Interactive Blinch Action",
  "description": "Metadata for a Bitcoin Cash interactive link.",
  "links": {
    "actions": [
      {
        "label": "Execute",
        "href": "bitcoincash:addr?amount=0.01&op_return=464c4f5701[action_type]",
        "parameters": [{ "name": "note", "label": "Public Note", "type": "text" }]
      }
    ]
  },
  "metadata": { "protocol": "Blinch", "identifier": "FLOW\x01", "hex_prefix": "464c4f5701" }
}
```

## 2. Technical Stack (2026 Standards)

*   **Frontend**: Next.js 16 (stable).
    *   Use the new `proxy.ts` for request routing.
    *   Use the `'use cache'` directive for server-side metadata optimization.
    *   Enable Turbopack.
*   **Backend**: Node.js 25.6.1 and Express 5.2.1.
*   **Contracts**: CashScript 0.12.1.

## 3. Architecture

*   **Schema Integration**: The backend must serve the JSON schema at `/api/action/:id`.
*   **Contract**: Create a Blinch.cash covenant. It must use native introspection to verify that `tx.outputs[i].lockingBytecode` contains the `464c4f5701` prefix before allowing a release.
*   **Frontend Renderer**: Build a Next.js 16 component that unfurls these Action URLs into a beautiful UI card. It should use the CashScript SDK (v0.12.1) to build and broadcast transactions to the Chipnet testnet.

**Deliverables:**
*   Full folder structure.
*   `.cash` contract.
*   `proxy.ts` file.
*   Express 5.2.1 routes.
*   Prioritize 'Narrative Traction' with a clean, high-conversion UI.

---

## 4. Divided Silo Prompts

### Phase 1: The Smart Contract (CashScript 0.12.1)
**Prompt:**
> Write a CashScript 0.12.1 smart contract for the 'Blinch' protocol.
>
> The contract must be a covenant that guards funds.
> It must strictly enforce that the spending transaction includes an OP_RETURN output starting with the hex prefix `464c4f5701`.
> Use `tx.outputs[i].lockingBytecode` to perform this check.
> Include an 'Execute' function for a specific recipientPkh and a 'Cancel' function for the creator after a timeout of 144 blocks.
>
> Adhere to the latest CashScript v0.12 syntax and provide a TypeScript deployment script for the Chipnet network using ElectrumNetworkProvider.

### Phase 2: The Backend Provider (Node 25.6 + Express 5.2)
**Prompt:**
> Build a high-performance backend for 'Blinch' using Node.js 25.6.1 and Express 5.2.1.
>
> Implement a `GET /api/action/:id` endpoint that serves the BCH-Action JSON Schema v1.1.0.
> The JSON returned must include: `icon`, `title`, `description`, and a `links.actions` array.
> Ensure the `href` field is a valid `bitcoincash:` URI that includes the mandatory `op_return=464c4f5701` parameter.
>
> Set the API to handle CORS and include OpenGraph meta-tags in the response so the links 'unfurled' by social media crawlers.
> Use the new Express 5.x error handling patterns.

### Phase 3: The Frontend & Proxy (Next.js 16)
**Prompt:**
> Create a Next.js 16 (stable) application for 'Blinch'.
>
> **Proxy Layer**: Implement the new `proxy.ts` file to intercept and rewrite routes for `action/` paths.
> **Caching**: Use the `'use cache'` directive to ensure that Action metadata fetched from the backend is cached at the edge for 5 minutes.
> **Action Renderer**: Build a React component that consumes the BCH-Action JSON Schema. It should render a card with buttons that, when clicked, invoke the CashScript SDK (v0.12.1).
> **Transaction Logic**: Ensure the SDK adds a second output to the transaction containing the OP_RETURN hex `464c4f5701`.
>
> Style the dashboard and the renderer using Tailwind CSS with a modern, glassmorphic dark-mode aesthetic.

### Enhancement 1: Blinch Agent Gateway (AI Infrastructure)
**Prompt:**
> Act as a Senior AI Infrastructure Engineer. Build an enhancement for the 'Blinch' protocol called 'Blinch Agent Gateway'.
>
> **The Goal**: Enable AI agents to interact with Blinch programmatically using Model Context Protocol (MCP) and x402 HTTP 402 headers.
>
> **Technical Requirements**:
>
> *   **MCP Server**: Build a TypeScript MCP server that exposes two primary tools to an AI agent:
>     *   `create_blinch_link`: Takes `amount`, `recipient`, and `action_type` as input. Returns a Blinch-standardized URL.
>     *   `get_action_metadata`: Allows the agent to 'read' a Blinch JSON schema to understand how much to pay and where.
>
> *   **x402 Middleware**: Create an Express 5.2 middleware for the Blinch backend.
>     *   If a request is made to a protected resource (e.g., an AI prompt or data feed), the server must return a Status 402 (Payment Required).
>     *   The response must include headers: `X-Payment-Link: [Blinch_URL]` and `X-Payment-Amount: [Sats]`.
>
> *   **BCH Integration**: Use the CashScript SDK to provide a `verify_payment` utility that checks if a transaction with the `FLOW\x01` prefix has reached the required amount on-chain before the middleware grants access (200 OK).
>
> **Agent Flow**:
> > Agent tries to access an API → Receives 402 and a Blinch Link → Agent uses the Blinch MCP Tool to sign a BCH transaction → Agent retries with the `X-Payment` header → Server grants access.

---

## Notes
*   Use `beads` for task management.