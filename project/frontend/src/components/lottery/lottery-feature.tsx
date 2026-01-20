'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { WalletButton } from '../solana/solana-provider'
import { AppHero } from '../app-hero'
import { LotteryList } from './lottery-list'
import { LotteryCreate } from './lottery-create'

export default function LotteryFeature() {
  const { publicKey } = useWallet()

  return publicKey ? (
    <div>
      <AppHero title="Lottery">
        <div className="mt-10 flex flex-col gap-10">
          <LotteryCreate />
          <LotteryList />
        </div>
      </AppHero>
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton className="btn btn-primary" />
        </div>
      </div>
    </div>
  )
}
