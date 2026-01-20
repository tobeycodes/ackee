'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLotteryProgram } from './lottery-data-access'

interface PurchaseModalProps {
  lotteryId: number
  price: number
  children: React.ReactNode
}

export function LotteryPurchaseModal({ lotteryId, price, children }: PurchaseModalProps) {
  const [open, setOpen] = useState(false)
  const [numbers, setNumbers] = useState<string[]>(Array(6).fill(''))
  const { purchaseTicket } = useLotteryProgram()

  const handleNumberChange = (index: number, value: string) => {
    const newNumbers = [...numbers]
    newNumbers[index] = value
    setNumbers(newNumbers)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const parsedNumbers = numbers.map((n) => parseInt(n))
    if (parsedNumbers.some((n) => isNaN(n) || n < 1 || n > 10)) {
      alert('All numbers must be between 1 and 10')
      return
    }

    const uniqueNumbers = new Set(parsedNumbers)
    if (uniqueNumbers.size !== parsedNumbers.length) {
      alert('Numbers must be unique')
      return
    }

    try {
      await purchaseTicket.mutateAsync({ id: lotteryId, numbers: parsedNumbers })
      setOpen(false)
      setNumbers(Array(6).fill(''))
    } catch (error) {
      console.error('Purchase failed:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase Lottery Ticket</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-white">
            <p>Lottery ID: {lotteryId}</p>
            <p>Price: {(price / 1_000_000_000).toFixed(3)} SOL</p>
          </div>

          <div className="space-y-2">
            <Label>Choose 6 unique numbers (1-10)</Label>
            <div className="grid grid-cols-3 gap-2">
              {numbers.map((number, index) => (
                <Input
                  key={index}
                  type="number"
                  min="1"
                  max="10"
                  value={number}
                  onChange={(e) => handleNumberChange(index, e.target.value)}
                  placeholder={`#${index + 1}`}
                  required
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={purchaseTicket.isPending} className="flex-1">
              {purchaseTicket.isPending ? 'Purchasing...' : 'Purchase'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

