'use client'

import { Prisma } from "@prisma/client";
import { ClockIcon, LockIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";

import { formatCurrency } from "@/app/helpers/format-currency";
import { fetchIsRestaurantOpen } from "@/app/helpers/is-open";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import { CartContext } from "../contexts/cart";
import CartSheet from "./cart-sheet";
import Products from "./products";

interface RestaurantCategoriesProps {
  restaurant: Prisma.RestaurantGetPayload<{
    include: {
      menuCategories: {
        include: { products: true },
      },
    },
  }>
}

const RestaurantCategories = ({ restaurant }: RestaurantCategoriesProps) => {
  const { products, total, totalQuantity, setIsOpen } = useContext(CartContext);
  const [open, setOpenRestaurant] = useState<boolean |null>(null)
  const [selectedCategory, setSelectedCategory] = useState<typeof restaurant.menuCategories[0] | null>(null);

  useEffect(() => {
    const savedCategoryName = localStorage.getItem("selectedCategory");

    if (savedCategoryName) {
      const foundCategory = restaurant.menuCategories.find(
        (cat) => cat.name === savedCategoryName
      );

      if (foundCategory) {
        setSelectedCategory(foundCategory);
      } else {
        setSelectedCategory(restaurant.menuCategories[0]);
      }
    } else {
      setSelectedCategory(restaurant.menuCategories[0]);
    }
  }, [restaurant.menuCategories]);


  useEffect(() => {
  const checkOpen = async () => {
    const isOpen = await fetchIsRestaurantOpen(); // ou slug, depende da função
    setOpenRestaurant(isOpen);
  };

  checkOpen();
}, [restaurant.id]);

  const handleCategoryClick = (category: typeof restaurant.menuCategories[0]) => {
    setSelectedCategory(category);
    localStorage.setItem("selectedCategory", category.name);
  }

  const getCategoryBtn = (category: string) => {
    return selectedCategory?.name === category ? "default" : "secondary";
  }

  return (
    <div className="relative z-50 mt-[-1.5rem] rounded-t-3xl bg-white">
      <div className="p-5">
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
        <div className="flex flex-row justify-between text-xs mt-3 items-center">
          {open ? (
            <>
              <div className="flex flex-row items-center">
                <ClockIcon size={12} className="mt-1 mr-1 text-green-500" />
                <p className="font-semibold text-green-500 mt-1 text-[14px]">Aberto!</p>
              </div>
              <div>
                <p>
                  <Link
                    rel="stylesheet"
                    href={`/${restaurant.slug}/orders`}
                    className="text-blue-500 text-[14px] underline"
                  >
                    Meus pedidos
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-row items-center">
                <LockIcon size={12} className="mt-1 mr-1 text-red-500" />
                <p className="font-semibold text-red-500 mt-1 text-[14px]">Fechado</p>
              </div>
              <div>
                <p>
                  <Link
                    rel="stylesheet"
                    href={`/${restaurant.slug}/orders`}
                    className="text-blue-500 text-[14px] underline"
                  >
                    Meus pedidos
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Categorias */}
      <ScrollArea className="w-full">
        <div className="flex w-max space-x-4 p-4 pt-0">
          {restaurant.menuCategories.map((category) => ( 
            <Button 
              onClick={() => handleCategoryClick(category)}
              key={category.id} 
              variant={getCategoryBtn(category.name)}
              size="sm" 
              className="rounded-full"
            >
              {category.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal"/>
      </ScrollArea>

      <h3 className="font-semibold px-5 pt-8">{selectedCategory?.name}</h3>

      <Products products={selectedCategory?.products.filter(product => product.inStock > 0) || []} />

      {products.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 flex w-full items-center justify-between border-t bg-white px-5 py-3">
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
  );
}

export default RestaurantCategories;
