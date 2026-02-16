# Blinch CashScript Contracts

This directory contains the CashScript smart contracts for the Blinch protocol.

## Blinch.cash

The main covenant contract that enforces the Blinch protocol rules.

### Protocol Requirement

**CRITICAL**: Every spending transaction MUST include an OP_RETURN output with the hex prefix `464c4f5701` (`FLOW\x01`).

### Contract Functions

#### `execute(sig s, pubkey pk)`
Releases funds to the designated recipient.

**Requirements:**
- Caller must be the designated recipient
- Transaction MUST include OP_RETURN with `464c4f5701` prefix
- Valid signature required

**Parameters:**
- `s`: Signature from the recipient
- `pk`: Public key of the recipient

#### `cancel(sig s)`
Allows the creator to reclaim funds after the timeout period.

**Requirements:**
- Timeout period must have elapsed (144 blocks)
- Caller must be the contract creator
- Valid signature required

**Parameters:**
- `s`: Signature from the creator

### Constructor Parameters

- `creator`: Public key of the contract creator (can cancel after timeout)
- `recipient`: Public key of the designated recipient (can execute)
- `timeout`: Block height when creator can reclaim funds

## Deployment

### Deploy to Chipnet
```bash
npm run deploy:chipnet
```

### Deploy to Testnet
```bash
npm run deploy:testnet
```

## Compilation

```bash
npm run build
```

This compiles `Blinch.cash` and outputs the artifact to `dist/Blinch.json`.

## Testing

```bash
npm test
```

## Contract Security

The contract uses native introspection to verify:
1. Protocol compliance via OP_RETURN prefix check
2. Proper authorization via signature verification
3. Time-based security via timeout enforcement

### OP_RETURN Format

The OP_RETURN output must be formatted as:
```
OP_RETURN OP_PUSHDATA(5) 0x464c4f5701 [action_data]
```

Where:
- `0x464c4f5701` = "FLOW\x01" (protocol identifier)
- `[action_data]` = Optional action-specific data
