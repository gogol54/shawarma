'use client'

import { MenuCategory, Prisma } from "@prisma/client";
import { ClockIcon, LockIcon } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { isOpen } from "@/app/helpers/is-open";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import Products from "./products";

interface RestaurantCategoriesProps {
  restaurant: Prisma.RestaurantGetPayload<{
    include: {
      menuCategories: {
        include: { products: true},
      },
    },
  }>
}
const RestaurantCategories = ({restaurant}: RestaurantCategoriesProps) => {
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory>(restaurant.menuCategories[0])
  const handleCategoryClick = (category: MenuCategory) => {
    setSelectedCategory(category)
  }
  const open = isOpen()
  const getCategoryBtn = (category: MenuCategory) => {
    return selectedCategory.id === category.id ? "default" : "secondary"
  }
  return (
    <div className="relative z-50 mt-[-1.5rem] rounded-t-3xl bg-white ">
      <div className="p-5">
        <div className="flex items-center gap-3 ">
          <Image 
            src={restaurant.avatarImageUrl} 
            alt={restaurant.name}
            width={45} 
            height={45} 
          />
          <div>
            <h2 className="text-lg font-semibold">{restaurant.name}</h2>
            <p className="text-xs opacity-55">{restaurant.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs mt-3">
          {open ? (
            <div className="flex items-center gap-1 text-green-500">
              <ClockIcon size={12} />
              <p>Aberto!</p>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-red-500">
              <LockIcon size={12} />
              <p>Fechado</p>
            </div>
          )}
        </div>
      </div>
     
      <ScrollArea className="w-full">
        <div className="flex w-max space-x-4 p-4 pt-0">
          {
            restaurant.menuCategories.map((category) => ( 
              <Button 
                onClick={() => handleCategoryClick(category)}
                key={category.id} 
                variant={getCategoryBtn(category)}
                size="sm" 
                className="rounded-full"
              >
                {category.name}
              </Button>
            ))
          }
        </div>
        <ScrollBar orientation="horizontal"/>
      </ScrollArea>
      <h3 className="font-semibold px-5 pt-8">{selectedCategory.name}</h3>
       {<Products products={selectedCategory.products}/>
      }
    </div>
    );
}
 
export default RestaurantCategories;