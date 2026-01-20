'use client'

import { useLotteryProgram } from './lottery-data-access'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export function LotteryCreate() {
  const { initializeLottery } = useLotteryProgram()
  const [id, setId] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    initializeLottery.mutateAsync(parseInt(id))
    setId('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input type="number" placeholder="Lottery ID" value={id} onChange={(e) => setId(e.target.value)} required />
      <Button type="submit" disabled={initializeLottery.isPending || !id}>
        Create Lottery{initializeLottery.isPending && '...'}
      </Button>
    </form>
  )
}
