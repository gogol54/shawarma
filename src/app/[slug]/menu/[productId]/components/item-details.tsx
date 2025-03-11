"use client"

import { Prisma } from "@prisma/client"
import { ChefHatIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import { useContext, useState } from "react";

import { formatCurrency } from "@/app/helpers/format-currency";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

import CartSheet from "../../components/cart-sheet";
import { CartContext } from "../../contexts/cart";

interface ProductDetailsProps {
  product: Prisma.ProductGetPayload<{
    include: {
      restaurant: {
        select: {
          name: true,
          avatarImageUrl: true
        }
      }
    }
  }>;
}

const ProductDetails = ({product}: ProductDetailsProps) => {
  const [quantity, setQuantity] = useState<number>(1)
  const { toggleCart, addProduct } = useContext(CartContext)
  const handleDecreaseQuantity = () => {
    setQuantity((prev) => {
      if(prev === 1)
        return 1
      return prev -1
    })
  }
  const handleIncreaseQuantity = () => {
    setQuantity((prev) => prev + 1)
 }
 const handleAddToCart = () => {
  addProduct({
    ...product,
    quantity
  })
  toggleCart()
 }

  return (
  <>
    <div className="relative z-50 mt-[-1.5rem] overflow-hidden rounded-t-3xl p-5 bg-white flex-auto flex-col flex">
      {/*RESTAURANTE*/}
      <div className="flex-auto overflow-hidden">
        <div className="flex items-center gap-1 px-5 ml-[-10px]">
          <Image 
            src={product.restaurant.avatarImageUrl}
            alt={product. restaurant.name}
            width={25}
            height={25}
            quality={100}
            className="rounded-full"
          />
          <p className="text-lg text-muted-foreground">
            {product.restaurant.name}
          </p>
        </div>
        {/*NOME DO PRODUTO*/}
        <h2 className="mt-1 text-xl font-semibold">{product.name}</h2>
        {/*PREÇO E QUANTIDADE*/}
        <div className="flex items-center mt-3 justify-between">
          <h3 className="text-xl semibold">
            {formatCurrency(product.price)}
          </h3>
          <div className="flex items-center gap-3 text-center">
            <Button 
              variant="outline" 
              className="h-8 w-8 rounded-xl" 
              onClick={handleDecreaseQuantity}
            >
              <ChevronLeftIcon />
            </Button>
            <p className="w-4">{quantity}</p>

            <Button 
              variant="destructive" 
              className="h-8 w-8 rounded-xl" 
              onClick={handleIncreaseQuantity}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
        <ScrollArea className="h-full">
          {/*SOBRE*/}
          <div className="mt-6 space-y-3">
            <h4 className="font-semibold">Sobre</h4>
            <p className="text-sm text-muted-foreground">{product.description}</p>
          </div>
          {/*INGREDIENTES*/}
          <div className="mt-6 space-y-3">
            <div className="5 flex items-center gap-1">
              <ChefHatIcon size={18} />
              <h4 className="font-semibold">Ingredientes</h4>
            </div>
            <ul className="list-disc px-5 text-sm text-muted-foreground">
            {product?.ingredients && Array.isArray(product?.ingredients) ? (
                product.ingredients.map(item => (
                  <li key={item}>{item}</li>
                ))
              ) : (
              <p>Nenhum ingrediente listado!</p>
            )}
            </ul>
            
          </div>
        </ScrollArea>
      </div>
      <Button className="mt-6 w-full rounded-full" onClick={handleAddToCart}>Adicionar à sacola</Button>
    </div>
    <CartSheet />
  </>)
}

export default ProductDetails
