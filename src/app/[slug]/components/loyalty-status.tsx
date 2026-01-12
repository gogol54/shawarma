"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

import { registerLoyaltyRedeem } from "../menu/actions/count-rescues"

interface LoyaltyStatusProps {
  phone: string
  data: {
    totalOrders: number
    totalRedeems: number
    availableRedeems: number
    ordersUntilNextReward: number
    canRedeem: boolean
  }
}

const LoyaltyStatus = ({ phone, data }: LoyaltyStatusProps) => {
  const {
    totalOrders,
    ordersUntilNextReward,
    canRedeem,
  } = data

  const [loading, setLoading] = React.useState(false)
  const router = useRouter()
  const handleClick = async () => {
    if (loading) return
    setLoading(true)

    try {
      await registerLoyaltyRedeem(
        phone,
        "2cc95952-c16f-414a-9b1c-9ff13b09c342"
      )

      // 🔁 força o server a recalcular tudo
      router.refresh()

      const whatsappNumber = "55996838707"
      const message = `Olá! Tudo bem? 
  Completei 10 pedidos no programa de fidelidade e gostaria de realizar o resgate do meu Shawarma Grátis.
  Telefone: ${phone}
  Obrigado!`

      const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        message
      )}`

      window.open(whatsappURL, "_blank")
    } catch (error) {
      console.log(error)
      toast.info("Esse resgate já foi utilizado ou não está mais disponível..");
      setLoading(false)
    }
  }
  const displayOrdersUntilNextReward = ordersUntilNextReward === 0 ? 10 : ordersUntilNextReward
  return (
    <div className="space-y-4 p-4">
      {/* Voltar ao menu */}


      <h2 className="text-lg font-semibold text-center">
       ⭐ Programa de Fidelidade ⭐
      </h2>

      <p>
        Total de pedidos: <strong>{totalOrders}</strong>
      </p>

      {canRedeem ? (
        <div className="rounded-lg border border-green-500 bg-green-50 p-4">
          <p className="font-medium text-green-700">
            🎉 Você tem um resgate disponível!
          </p>

          <Button
            onClick={handleClick}
            disabled={loading}
            className="mt-3 w-full justify-between bg-neutral-600 text-slate-200 hover:bg-neutral-700"
          >
            {loading ? "Processando resgate..." : "Resgatar agora"}
            <Image
              src="/wpp.png"
              alt="WhatsApp"
              width={28}
              height={28}
            />
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-yellow-500 bg-yellow-50 p-4">
          <p className="text-yellow-700">
            Faltam <strong>{displayOrdersUntilNextReward}</strong> pedidos
            para ganhar um resgate 🎁
          </p>
        </div>
      )}
    </div>
  )
}

export default LoyaltyStatus
