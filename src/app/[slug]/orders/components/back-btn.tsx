'use client'

import { ChevronLeftIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useContext } from 'react'

import { Button } from '@/components/ui/button'

import { CartContext } from '../../menu/contexts/cart'

export const GoBackBtn = () => {
  const router = useRouter()
  const { clearCart, toggleCart } = useContext(CartContext)

  const handleBack = () => {
    toggleCart()
    clearCart()
    router.push('/rosul')
  }

  return (
    <Button size="icon" variant="secondary" className="rounded-full" onClick={handleBack}> 
      <ChevronLeftIcon />
    </Button>
  )
}

interface TrackOrderButtonProps {
  orderId: number;
}

export const TrackOrderButton = ({ orderId }: TrackOrderButtonProps) => {
  const handleClick = () => {
    const whatsappNumber = "+55" + "55981376693"
    const message = `Olá, estou acompanhando o pedido #${orderId}`
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    
    window.open(whatsappURL, "_blank")
  }

  return (
    <Button onClick={handleClick} className="w-full justify-between">
      Acompanhe seu pedido
    </Button>
  )
}