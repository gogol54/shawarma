
import { notFound } from "next/navigation"

import { db } from "@/lib/prisma"

import RestaurantCategories from "./components/categories"
import RestaurantHeader from "./components/header"

interface RestaurantMenuProps {
  params: Promise<{slug: string}>
  searchParams: Promise<{consumptionMethod: string}>
}

const isConsumptionMethodValid = (ConsumptionMethod: string) => {
  return ["retirada", "entrega"].includes(ConsumptionMethod)
}
const RestaurantMenuPage = async ({params, searchParams}: RestaurantMenuProps) => {
  const { slug } = await params
  const {consumptionMethod} = await searchParams
  const restaurant = await db.restaurant.findUnique({
    where: {slug},
    include: {
      menuCategories: {
        include: {
          products: true
        },
      },
    }
  })
const openWeek = await db.openingHours.findMany({
  orderBy: {
    dayOfWeek: 'asc',
  },
});  

const randomData = restaurant?.menuCategories
  const ordem = ['salgados','doces','combos', 'fritas', 'bebidas' ]; // você pode incluir mais categorias aqui
  randomData?.sort((a, b) => {
    const indexA = ordem.indexOf(a.name.toLowerCase());
    const indexB = ordem.indexOf(b.name.toLowerCase());
  
    // categorias que não estão na lista ficam no final
    return (indexA === -1 ? ordem.length : indexA) - (indexB === -1 ? ordem.length : indexB);
  });
  
  if(!restaurant || !isConsumptionMethodValid(consumptionMethod)){
    return notFound()
  }
  return (
    <div>
      <RestaurantHeader restaurant={restaurant} slug={slug} />      
      <RestaurantCategories restaurant={restaurant} openWeek={openWeek} />
    </div>
  )
}
 
export default RestaurantMenuPage;