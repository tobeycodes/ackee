'use client'

import { useLotteryProgram } from './lottery-data-access'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ellipsify } from '@/lib/utils'
import { LotteryPurchaseModal } from './lottery-purchase-modal'
import { useWallet } from '@solana/wallet-adapter-react'

export function LotteryList() {
  const { getLotteries, useUserTicket, drawLottery, claimPrize } = useLotteryProgram()
  const { publicKey } = useWallet()

  if (getLotteries.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }

  if (getLotteries.error) {
    return (
      <div className="alert alert-error">
        <span>Failed to load lotteries: {getLotteries.error.message}</span>
      </div>
    )
  }

  const lotteries = getLotteries.data || []

  type LotteryAccount = NonNullable<typeof getLotteries.data>[number]

  const LotteryRow = ({ lottery }: { lottery: LotteryAccount }) => {
    const userTicket = useUserTicket(lottery.account.id.toNumber(), publicKey || undefined)
    const hasTicket = !!userTicket.data
    const isSoldOut = lottery.account.sold >= 100
    const isAuthority = publicKey && lottery.account.authority.equals(publicKey)
    const isActive = lottery.account.isActive
    const isClaimed = lottery.account.isClaimed
    const hasNumbers = lottery.account.numbers
    const isWinner =
      hasTicket &&
      hasNumbers &&
      userTicket.data?.numbers?.every((num: number, idx: number) => num === lottery.account.numbers![idx])
    const canDraw = isAuthority && isActive && lottery.account.sold > 0
    const canClaim = isWinner && !isActive && !isClaimed && hasNumbers
    const canPurchase = isActive && !isSoldOut && !hasTicket && publicKey

    return (
      <TableRow key={lottery.account.id.toString()}>
        <TableCell>{lottery.account.id.toString()}</TableCell>
        <TableCell>{ellipsify(lottery.account.authority.toString())}</TableCell>
        <TableCell>{(lottery.account.price.toNumber() / 1_000_000_000).toFixed(3)}</TableCell>
        <TableCell>{lottery.account.sold}/100</TableCell>
        <TableCell>{lottery.account.holders.length}</TableCell>
        <TableCell>
          {isActive ? (
            <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              Active
            </span>
          ) : isClaimed ? (
            <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20">
              Claimed
            </span>
          ) : (
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
              Drawn
            </span>
          )}
        </TableCell>
        <TableCell>
          {lottery.account.numbers ? (
            <div className="flex gap-1">
              {lottery.account.numbers.map((num: number, idx: number) => (
                <span
                  key={idx}
                  className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                >
                  {num}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </TableCell>
        <TableCell>
          <div className="flex gap-2">
            <LotteryPurchaseModal lotteryId={lottery.account.id.toNumber()} price={lottery.account.price.toNumber()}>
              <Button size="sm" disabled={!canPurchase}>
                Buy
              </Button>
            </LotteryPurchaseModal>

            <Button
              size="sm"
              variant="outline"
              disabled={!canDraw || drawLottery.isPending}
              onClick={() => drawLottery.mutateAsync(lottery.account.id.toNumber())}
            >
              {drawLottery.isPending ? 'Drawing...' : 'Draw'}
            </Button>

            <Button
              size="sm"
              variant="default"
              disabled={!canClaim || claimPrize.isPending}
              onClick={() => claimPrize.mutateAsync(lottery.account.id.toNumber())}
            >
              {claimPrize.isPending ? 'Claiming...' : 'Claim'}
            </Button>
          </div>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lotteries ({lotteries.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {lotteries.length === 0 ? (
          <div className="text-center text-gray-500">No lotteries found</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Authority</TableHead>
                <TableHead>Price (SOL)</TableHead>
                <TableHead>Tickets Sold</TableHead>
                <TableHead>Holders</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Drawn Numbers</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lotteries.map((lottery) => (
                <LotteryRow key={lottery.account.id.toString()} lottery={lottery} />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
