"use client"

import { Prisma } from "@prisma/client"
import { ChefHatIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import Image from "next/image";
import { useContext, useState } from "react";

import { formatCurrency } from "@/app/helpers/format-currency";
import { Button } from "@/components/ui/button";

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
  const [dropIng, setDropIng] = useState<string[]>([]);

  // Função para alternar a remoção de um ingrediente
  const toggleIngredient = (ingredient: string) => {
    setDropIng((prev) =>
      prev.includes(ingredient)
        ? prev.filter((item) => item !== ingredient) // Remove do array
        : [...prev, ingredient] // Adiciona ao array
    );
  };

  const handleDecreaseQuantity = () => {
    setQuantity((prev) => {
      if(prev === 1)
        return 1
      return prev -1
    })
  }
  const handleIncreaseQuantity = () => {
    setQuantity((prev) => (prev < product.inStock ? prev + 1 : prev));
  };

  const handleAddToCart = () => {
    addProduct({
      ...product,
      quantity,
      dropIng
    })
    toggleCart()
  }

  // Garantir que product.ingredients seja um array
  const ingredients = Array.isArray(product.ingredients) ? product.ingredients : [];
  
  return (
    <>
      <div className="relative z-50 mt-[-1.5rem] overflow-y-hidden rounded-t-3xl p-5 bg-white flex-auto flex-col flex">
        {/* RESTAURANTE */}
        <div className="flex-auto overflow-hidden">
          <div className="flex items-center gap-1 px-5 ml-[-10px]">
            <Image 
              src={product.restaurant.avatarImageUrl}
              alt={product.restaurant.name}
              width={25}
              height={25}
              quality={100}
              className="rounded-full"
            />
            <p className="text-lg text-muted-foreground">
              {product.restaurant.name} 
            </p>
          </div>
          {/* NOME DO PRODUTO */}
          <h2 className="mt-1 text-xl font-semibold">{product.name}</h2>
          {/* PREÇO E QUANTIDADE */}
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
          <div className="h-full overflow-y-auto pb-32"> 
          {/* SOBRE DIV SCROLL AREA*/}
            <div className="mt-6 space-y-3">
              <h4 className="font-semibold">Sobre </h4>
              <p className="text-sm text-muted-foreground">{product.description}</p>
            </div>
            {/* INGREDIENTES */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2">
                <ChefHatIcon size={18} />
                <div className="flex flex-col">
                  <h4 className="font-semibold">Remover Ingredientes</h4>
                  <p className="text-sm text-muted-foreground">Selecione somente os itens que você deseja remover </p>
                </div>
              </div>
              <ul className="px-5 text-sm text-muted-foreground mb-4 space-y-2">
                {ingredients.length > 0 ? (
                  ingredients.map((item, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 cursor-pointer"
                        checked={dropIng.includes(item)}
                        onChange={() => toggleIngredient(item)}
                      />
                      {item}
                    </li>
                  ))
                ) : (
                  <p>Nenhum ingrediente listado!</p>
                )}
              </ul>
            </div>
            {/*REMOVIDOS*/}
         
          </div>
        </div>
        <Button className="mt-6 w-full rounded-full" onClick={handleAddToCart}>Adicionar à sacola</Button>
      </div>
      <CartSheet />
    </>
  )
}

export default ProductDetails
