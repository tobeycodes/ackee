# Project Description

**Deployed Frontend URL:** https://ackee-lottery.vercel.app

**Solana Program ID:** 9RGwo1Eekh1X96WiBEaob2bn6pS7iuunma21eyHbeX1Q

## Project Overview

### Description

A decentralized lottery application built on Solana blockchain. Users can participate in lottery games by purchasing tickets with their chosen 6-number combinations, wait for drawings to occur, and claim prizes if they win. Each lottery has a unique ID and manages its own ticket sales, prize pool, and winner selection process. The application demonstrates advanced Solana program concepts including PDA-based account management, lottery mechanics, and secure prize distribution.

### Key Features

- **Initialize Lottery**: Create new lottery games with unique IDs and configurable parameters
- **Purchase Tickets**: Buy lottery tickets with custom 6-number combinations (1-10 range)
- **Draw Numbers**: Execute lottery drawings to determine winning number combinations
- **Claim Prizes**: Winners can claim their prizes from completed lotteries
- **View Lottery Status**: Check active lotteries, ticket sales, and drawing results
- **Ticket Management**: Track purchased tickets and verify numbers against drawings

### How to Use the dApp

1. **Connect Wallet** - Connect your Solana wallet to the application
2. **Browse Lotteries** - View available active lotteries and their details
3. **Purchase Ticket** - Select a lottery and choose your 6-number combination (1-10 each)
4. **Wait for Drawing** - Monitor lottery status until the drawing occurs
5. **Check Results** - View winning numbers once the lottery is drawn
6. **Claim Prize** - If you win, claim your prize portion from the lottery pool

## Program Architecture

The Lottery dApp uses a multi-account architecture with separate accounts for lottery management and individual tickets. The program leverages PDAs to create deterministic addresses for lotteries and tickets, ensuring proper data isolation and secure access control.

### PDA Usage

The program uses Program Derived Addresses for both lottery and ticket account management.

**PDAs Used:**

- **Lottery PDA**: Derived from seeds `["lottery", lottery_id_bytes]` - creates unique lottery accounts that can only be managed by their authority
- **Ticket PDA**: Derived from seeds `["ticket", lottery_pda, user_wallet_pubkey]` - ensures each user can have one ticket per lottery with deterministic addressing

### Program Instructions

**Instructions Implemented:**

- **Initialize**: Creates a new lottery account with specified ID, sets price to 1 SOL, and marks it as active
- **Purchase**: Allows users to buy tickets with their chosen 6-number combination and adds them to the holders list
- **Draw**: Executes the lottery drawing by setting winning numbers and marking the lottery as inactive
- **Claim**: Enables winners to claim their prize portion from the lottery's prize pool

### Account Structure

```rust
#[account]
pub struct Lottery {
    pub authority: Pubkey,        // The wallet that created and manages this lottery
    pub id: u64,                  // Unique identifier for the lottery
    pub holders: Vec<Pubkey>,     // List of ticket holders (max 100)
    pub sold: u32,                // Number of tickets sold
    pub price: u64,               // Ticket price in lamports (1 SOL = 1,000,000 lamports)
    pub is_active: bool,          // Whether the lottery is still accepting tickets
    pub is_claimed: bool,         // Whether prizes have been claimed
    pub numbers: Option<[u8; 6]>, // Winning numbers (set after drawing)
    pub bump: u8,                 // PDA bump seed
}

#[account]
pub struct Ticket {
    pub numbers: [u8; 6],         // User's chosen numbers for this ticket
    pub bump: u8,                 // PDA bump seed
}
```

## Testing

### Test Coverage

**Happy Path Tests:**

- **Initialize Lottery**: Successfully creates lottery accounts with correct initial values
- **Purchase Ticket**: Properly creates tickets and updates lottery holder list
- **Draw Lottery**: Successfully sets winning numbers and deactivates lottery
- **Claim Prize**: Allows valid winners to claim their prize portions

**Unhappy Path Tests:**

- **Duplicate Lottery**: Prevents creation of lotteries with existing IDs
- **Invalid Numbers**: Rejects tickets with invalid number combinations
- **Unauthorized Operations**: Prevents non-authorities from drawing lotteries
- **Double Claiming**: Prevents multiple prize claims for the same lottery

### Running Tests

```bash
yarn install                        # install dependencies
anchor test -- --features "testing" # run the test suite
```

