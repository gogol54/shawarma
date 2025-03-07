'use client'

import { ChevronLeftIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useContext } from 'react'

import { Button } from '@/components/ui/button'

import { CartContext } from '../../menu/contexts/cart'

const GoBackBtn = () => {
  const router = useRouter()
  const { clearCart, toggleCart } = useContext(CartContext)
  const handleBack = () => {
    toggleCart()
    clearCart()
    router.back()
  }
  return (
    <Button size="icon" variant="secondary" className="rounded-full" onClick={handleBack}> 
      <ChevronLeftIcon />
    </Button>
  )
}

export default GoBackBtn