# Lottery Solana Program

A decentralized lottery program built on the Solana blockchain using the Anchor framework. This program allows users to create lotteries, purchase tickets, execute drawings, and claim prizes.

## Program Overview

**Program ID:** `9RGwo1Eekh1X96WiBEaob2bn6pS7iuunma21eyHbeX1Q`

This Solana program implements a lottery system where:

- Authorities can create new lottery games with unique IDs
- Users can purchase tickets with 6-number combinations
- Drawings can be executed to determine winning numbers
- Winners can claim their proportional share of the prize pool

## Instructions

### Initialize

Creates a new lottery with the specified ID.

- **Authority**: Must sign the transaction
- **Parameters**: `id: u64` - Unique lottery identifier
- **Creates**: Lottery PDA account with initial settings

### Purchase

Allows users to buy tickets for an active lottery.

- **Parameters**: `id: u64`, `numbers: [u8; 6]` - Lottery ID and chosen numbers
- **Creates**: Ticket PDA for the user
- **Updates**: Adds user to lottery holders list

### Draw

Executes the lottery drawing (authority only).

- **Authority**: Lottery creator must sign
- **Parameters**: `id: u64` - Lottery to draw
- **Updates**: Sets winning numbers and deactivates lottery

### Claim

Allows winners to claim their prize.

- **Parameters**: `id: u64` - Lottery ID to claim from
- **Requirements**: User must have winning ticket
- **Transfers**: Prize portion to winner

## Account Structure

### Lottery Account

```rust
pub struct Lottery {
    pub authority: Pubkey,        // Lottery creator
    pub id: u64,                  // Unique identifier
    pub holders: Vec<Pubkey>,     // Ticket holders (max 100)
    pub sold: u32,                // Tickets sold count
    pub price: u64,               // Ticket price (1 SOL)
    pub is_active: bool,          // Accepting tickets
    pub is_claimed: bool,         // Prize claimed status
    pub numbers: Option<[u8; 6]>, // Winning numbers
    pub bump: u8,                 // PDA bump
}
```

### Ticket Account

```rust
pub struct Ticket {
    pub numbers: [u8; 6],         // User's chosen numbers
    pub bump: u8,                 // PDA bump
}
```

## PDA Derivation

### Lottery PDA

- **Seeds**: `["lottery", lottery_id.to_le_bytes()]`
- **Purpose**: Deterministic lottery account addresses

### Ticket PDA

- **Seeds**: `["ticket", lottery_pda, user_pubkey]`
- **Purpose**: One ticket per user per lottery

## Development

### Prerequisites

- Rust and Cargo
- Solana CLI tools
- Anchor framework

### Building

```bash
anchor build
```

### Testing

```bash
anchor test
```

### Deploying

```bash
anchor deploy
```

