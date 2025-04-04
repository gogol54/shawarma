'use client'

import { ChevronLeftIcon } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useContext } from 'react'

import { Button } from '@/components/ui/button'

import { CartContext } from '../../menu/contexts/cart'

export const GoBackBtn = () => {
  const router = useRouter()
  const { clearCart, setIsOpen } = useContext(CartContext)

  const handleBack = () => {
    clearCart()
    setIsOpen(false)
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
    <Button onClick={handleClick} className="w-full justify-between text-slate-200 bg-neutral-600 hover:bg-neutral-700">
      Acompanhe seu pedido 
      <Image 
        src="/wpp.png"
        alt="whatsapp logo"
        width={30}
        height={30}
      />
    </Button>
  )
}