'use client'

import { Prisma } from "@prisma/client"
import { ClockIcon, LockIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useContext, useEffect, useRef,useState } from "react"

import { formatCurrency } from "@/app/helpers/format-currency"
import { fetchIsRestaurantOpen } from "@/app/helpers/is-open"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

import { CartContext } from "../contexts/cart"
import CartSheet from "./cart-sheet"
import Products from "./products"

interface RestaurantCategoriesProps {
  restaurant: Prisma.RestaurantGetPayload<{
    include: {
      menuCategories: {
        include: { products: true },
      },
    },
  }>
  openWeek: Prisma.OpeningHoursGetPayload<true>[]
}

const RestaurantCategories = ({ restaurant, openWeek }: RestaurantCategoriesProps) => {
  const { products, total, totalQuantity, setIsOpen } = useContext(CartContext)
  const [open, setOpenRestaurant] = useState<boolean | null>(null)
  const [openDialog, setOpenDialog] = useState<boolean | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<typeof restaurant.menuCategories[0] | null>(null)
  const sectionRefs = useRef<Record<string, HTMLElement>>({})

  const daysOfWeek = [
    { label: "Domingo", limited: false },
    { label: "Segunda-feira", limited: true },
    { label: "Terça-feira", limited: true },
    { label: "Quarta-feira", limited: true },
    { label: "Quinta-feira", limited: false },
    { label: "Sexta-feira", limited: false },
    { label: "Sábado", limited: false },
  ]

  useEffect(() => {
    setSelectedCategory(restaurant.menuCategories[0])
  }, [restaurant.menuCategories])

  useEffect(() => {
    const checkOpen = async () => {
      const isOpen = await fetchIsRestaurantOpen()
      setOpenRestaurant(isOpen)
    }
    checkOpen()
  }, [restaurant.id])

  // Monta o ref das seções
  useEffect(() => {
    const refs: Record<string, HTMLElement> = {}
    restaurant.menuCategories.forEach(category => {
      const id = `category-${category.name.toLowerCase().replace(/\s+/g, '-')}`
      const el = document.getElementById(id)
      if (el) {
        refs[category.name] = el
      }
    })
    sectionRefs.current = refs
  }, [restaurant.menuCategories])

  // Função para detectar a seção visível pelo scroll
  useEffect(() => {
    const onScroll = () => {
      const scrollPosition = window.scrollY + 100 // Ajusta conforme a altura da barra sticky etc

      let currentCategory = restaurant.menuCategories[0].name

      for (const category of restaurant.menuCategories) {
        const el = sectionRefs.current[category.name]
        if (!el) continue
        if (el.offsetTop <= scrollPosition) {
          currentCategory = category.name
        }
      }

      if (currentCategory !== selectedCategory?.name) {
        setSelectedCategory(restaurant.menuCategories.find(cat => cat.name === currentCategory) || null)
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", onScroll)
    }
  }, [restaurant.menuCategories, selectedCategory])

  const handleClickTimeStamp = () => setOpenDialog(true)

  const handleCategoryClick = (category: typeof restaurant.menuCategories[0]) => {
    const el = sectionRefs.current[category.name]
    if (el) {
      window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" }) // Ajuste -80 para compensar sticky header
    }
    setSelectedCategory(category)
  }

  const getCategoryBtn = (category: string) =>
    selectedCategory?.name === category ? "default" : "secondary"

  return (
    <div className="relative z-50 mt-[-1.5rem] rounded-t-3xl bg-white">
      <div className="p-5">
        {/* Header restaurante */}
        <div className="flex items-center gap-2">
          <Image
            src={restaurant.avatarImageUrl}
            alt={restaurant.name}
            width={45}
            height={45}
            quality={100}
            className="object-cover rounded-lg"
          />
          <div>
            <h2 className="text-lg font-semibold">{restaurant.name}</h2>
            <p className="text-xs opacity-55">{restaurant.description}</p>
          </div>
        </div>

        <div className="flex justify-start">
          <Button
            className="bg-white text-blue-500 underline hover:bg-white mt-4 mb-2 w-32 max-h-8"
            onClick={handleClickTimeStamp}
          >
            <p className="text-xs">Horário da Semana</p>
          </Button>
        </div>

        <Dialog open={openDialog === true && Array.isArray(openWeek)} onOpenChange={() => setOpenDialog(!openDialog)}>
          <DialogTrigger asChild />
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Horários de Funcionamento</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-3">
              {openWeek.map((day) => (
                <div
                  key={day.id}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
                    day.isOpen ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {day.isOpen ? (
                      <ClockIcon className="text-green-600" size={20} />
                    ) : (
                      <LockIcon className="text-red-600" size={20} />
                    )}
                    <p className="font-medium">{daysOfWeek[day.dayOfWeek].label}</p>
                  </div>
                  <div className="text-sm font-semibold text-muted-foreground">
                    {day.isOpen ? `${day.openTime} às ${day.closeTime}` : "Fechado"}
                  </div>
                 
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
        <Link href={`/${restaurant.slug}/club`} className="block">
          <Button
            className="
              w-full
              rounded-xl
              bg-gradient-to-r from-yellow-400 via-lime-400 to-green-500
              text-gray-900
              font-bold
              shadow-lg
              animate-pulse
              hover:animate-none
              hover:scale-[1.04]
              transition-all
            "
          >
            🎁 Ganhe Shawarma Grátis
          </Button>
        </Link>
            
           
        <div className="flex flex-row justify-between text-xs mt-3 items-center">
          {open ? (
            <div className="flex flex-row items-center">
              <ClockIcon size={12} className="mt-1 mr-1 text-green-500" />
              <p className="font-semibold text-green-500 mt-1 text-[14px]">Aberto!</p>
            </div>
          ) : (
            <div className="flex flex-row items-center">
              <LockIcon size={12} className="mt-1 mr-1 text-red-500" />
              <p className="font-semibold text-red-500 mt-1 text-[14px]">Fechado</p>
            </div>
          )}
           
          <div>
            <Link href={`/${restaurant.slug}/orders`} className="text-blue-500 text-[14px] underline">
              Meus pedidos
            </Link>
          </div>
        </div>
         
      </div>

      {/* Menu fixo com categorias */}
      <div className="sticky top-0 z-40 bg-white pt-3 pb-1 shadow-md">
        <div className="px-5 pb-2 font-semibold text-base">
        </div>
        <ScrollArea className="overflow-hidden w-full">
          <div className="flex w-max space-x-4 px-5">
            {restaurant.menuCategories.map((category) => (
              <Button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                variant={getCategoryBtn(category.name)}
                size="sm"
                className="rounded-full whitespace-nowrap"
              >
                {category.name}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Conteúdo das categorias */}
      <div>
        {restaurant.menuCategories.map((category) => (
          <section
            key={category.id}
            id={`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
            className="scroll-mt-[120px] mt-4 min-h-[200px]"
          >
            <Products products={category.products} />
          </section>
        ))}
      </div>

      {/* Sacola */}
      {products.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 flex w-full items-center justify-between border-t bg-white px-5 py-3 z-50">
          <div>
            <p className="text-xs text-muted-foreground">Total dos pedidos</p>
            <p className="text-sm font-semibold">
              {formatCurrency(total)}
              <span className="text-xs font-normal text-muted-foreground">
                / {totalQuantity} {totalQuantity > 1 ? 'itens' : 'item'}
              </span>
            </p>
          </div>
          <Button onClick={() => setIsOpen(true)}>Ver sacola</Button>
          <CartSheet />
        </div>
      )}
    </div>
  )
}

export default RestaurantCategories
