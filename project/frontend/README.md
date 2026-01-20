# Lottery dApp Frontend

A modern React-based frontend for the Solana lottery program, built with Next.js, TypeScript, and Tailwind CSS.

## Overview

This frontend application provides a user-friendly interface for interacting with the lottery Solana program. Users can connect their wallets, participate in lotteries, purchase tickets, and claim prizes through an intuitive web interface.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 with custom components
- **State Management**: TanStack Query + Jotai
- **Blockchain**: Solana Web3.js with Wallet Adapter
- **Program Integration**: Anchor framework
- **UI Components**: Radix UI primitives
- **Notifications**: Sonner (toast notifications)
- **Theme**: Next Themes (dark/light mode support)

## Key Features

- **Wallet Integration**: Connect multiple Solana wallet types
- **Lottery Management**: View active lotteries and their details
- **Ticket Purchase**: Select numbers and buy lottery tickets
- **Real-time Updates**: Live lottery status and ticket information
- **Prize Claiming**: Claim winnings from successful tickets
- **Responsive Design**: Mobile-friendly interface
- **Dark/Light Mode**: Theme switching support

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── account/           # Account management pages
│   ├── lottery/           # Lottery-specific pages
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx          # Homepage
├── components/
│   ├── lottery/          # Lottery-specific components
│   │   ├── lottery-data-access.tsx    # Program interaction hooks
│   │   ├── lottery-feature.tsx       # Main lottery interface
│   │   ├── lottery-list.tsx          # Lottery listings
│   │   └── lottery-purchase-modal.tsx # Ticket purchase UI
│   ├── account/          # Account management
│   ├── cluster/          # Network selection
│   ├── solana/           # Solana provider setup
│   └── ui/               # Reusable UI components
└── lib/
    └── utils.ts          # Utility functions
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- A Solana wallet browser extension

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Development Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run ci           # Run all CI checks (build, lint, format)
```

