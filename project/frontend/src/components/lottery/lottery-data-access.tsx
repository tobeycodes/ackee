'use client'

import { useConnection } from '@solana/wallet-adapter-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../use-transaction-toast'
import { toast } from 'sonner'
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import LotteryIDL from './lottery.json'
import type { Lottery } from './lottery'
import { BN } from 'bn.js'

const LOTTERY_PROGRAM_ID = new PublicKey(LotteryIDL.address)

function getLotteryProgram(provider: AnchorProvider, address?: PublicKey): Program<Lottery> {
  return new Program({ ...LotteryIDL, address: address ? address.toBase58() : LotteryIDL.address } as Lottery, provider)
}

function getLotteryProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
    case 'mainnet-beta':
    default:
      return LOTTERY_PROGRAM_ID
  }
}

export function useLotteryProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const queryClient = useQueryClient()
  const programId = useMemo(() => getLotteryProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getLotteryProgram(provider, programId), [provider, programId])

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const getLotteries = useQuery({
    queryKey: ['get-active-lotteries', { cluster }],
    queryFn: () => program.account.lottery.all(),
  })

  const initializeLottery = useMutation({
    mutationKey: ['lottery', 'initialize', { cluster }],
    mutationFn: (id: number) => program.methods.initialize(new BN(id)).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      getLotteries.refetch()
    },
    onError: () => {
      toast.error('Failed to initialize lottery')
    },
  })

  const purchaseTicket = useMutation({
    mutationKey: ['lottery', 'purchase', { cluster }],
    mutationFn: ({ id, numbers }: { id: number; numbers: number[] }) =>
      program.methods.purchase(new BN(id), numbers).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      getLotteries.refetch()
      queryClient.invalidateQueries({ queryKey: ['get-user-ticket'] })
    },
    onError: () => {
      toast.error('Failed to purchase ticket')
    },
  })

  const drawLottery = useMutation({
    mutationKey: ['lottery', 'draw', { cluster }],
    mutationFn: (id: number) => program.methods.draw(new BN(id)).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      getLotteries.refetch()
    },
    onError: () => {
      toast.error('Failed to draw lottery')
    },
  })

  const claimPrize = useMutation({
    mutationKey: ['lottery', 'claim', { cluster }],
    mutationFn: (id: number) => program.methods.claim(new BN(id)).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      getLotteries.refetch()
    },
    onError: () => {
      toast.error('Failed to claim prize')
    },
  })

  const useUserTicket = (lotteryId: number, userPublicKey?: PublicKey) => {
    return useQuery({
      queryKey: ['get-user-ticket', { cluster, lotteryId, userPublicKey: userPublicKey?.toString() }],
      queryFn: async () => {
        if (!userPublicKey) return null
        try {
          const [lotteryPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('lottery'), new BN(lotteryId).toArrayLike(Buffer, 'le', 8)],
            programId,
          )

          const [ticketPDA] = PublicKey.findProgramAddressSync(
            [Buffer.from('ticket'), lotteryPDA.toBuffer(), userPublicKey.toBuffer()],
            programId,
          )

          return await program.account.ticket.fetch(ticketPDA)
        } catch {
          return null
        }
      },
      enabled: !!userPublicKey,
    })
  }

  return {
    program,
    programId,
    getProgramAccount,
    getLotteries,
    initializeLottery,
    purchaseTicket,
    drawLottery,
    claimPrize,
    useUserTicket,
  }
}
