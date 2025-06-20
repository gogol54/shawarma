'use client'

import { Prisma } from "@prisma/client";
import { ClockIcon, LockIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";

import { formatCurrency } from "@/app/helpers/format-currency";
import { fetchIsRestaurantOpen } from "@/app/helpers/is-open";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
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
  openWeek: Prisma.OpeningHoursGetPayload<true>[]
}

const RestaurantCategories = ({ restaurant, openWeek }: RestaurantCategoriesProps) => {
  const { products, total, totalQuantity, setIsOpen } = useContext(CartContext);
  const [open, setOpenRestaurant] = useState<boolean | null>(null)
  const [openDialog, setOpenDialog] = useState<boolean | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<typeof restaurant.menuCategories[0] | null>(null);

  const handleClickTimeStamp = () => {
    setOpenDialog(true)
  }

  const daysOfWeek = [
    { label: "Domingo", limited: false },
    { label: "Segunda-feira", limited: true },
    { label: "Terça-feira", limited: true },
    { label: "Quarta-feira", limited: true },
    { label: "Quinta-feira", limited: false },
    { label: "Sexta-feira", limited: false },
    { label: "Sábado", limited: false },
  ];

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
      const isOpen = await fetchIsRestaurantOpen();
      setOpenRestaurant(isOpen);
    };
    checkOpen();
  }, [restaurant.id]);

  // 👇 Scroll automático
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) {
          const id = visible.target.getAttribute('id');
          const name = id?.replace('category-', '').replace(/-/g, ' ');
          const foundCategory = restaurant.menuCategories.find(
            (cat) => cat.name.toLowerCase() === name
          );
          if (foundCategory) {
            setSelectedCategory(foundCategory);
            localStorage.setItem("selectedCategory", foundCategory.name);
          }
        }
      },
      {
        rootMargin: '-20% 0px -75% 0px',
        threshold: 0.1,
      }
    );

    restaurant.menuCategories.forEach((cat) => {
      const el = document.getElementById(`category-${cat.name.toLowerCase().replace(/\s+/g, '-')}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [restaurant.menuCategories]);

  const handleCategoryClick = (category: typeof restaurant.menuCategories[0]) => {
    const el = document.getElementById(`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

        <div className="flex justify-start">
          <Button 
            className="bg-[#f5f5f5] text-[#333333] hover:bg-gray-200 mt-4 mb-2 w-32 max-h-8"
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

      {/* Menu de categorias */}
      <ScrollArea className="w-full">
        <div className="flex w-max space-x-4 p-4 pt-0">
          {restaurant.menuCategories.map((category) => (
            <Button 
              onClick={() => handleCategoryClick(category)}
              key={category.id}
              variant={getCategoryBtn(category.name)}
              size="sm"
              className="rounded-full whitespace-nowrap"
            >
              {category.name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal"/>
      </ScrollArea>

      {/* Todas as seções renderizadas com IDs */}
      <div>
        {restaurant.menuCategories.map((category) => (
          <section
            key={category.id}
            id={`category-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
            className="scroll-mt-32"
          >
            <h3 className="font-semibold px-5 pt-8">{category.name}</h3>
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
  );
}

export default RestaurantCategories;
