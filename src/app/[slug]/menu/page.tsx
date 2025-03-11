
import { notFound } from "next/navigation"

import { db } from "@/lib/prisma"

import RestaurantCategories from "./components/categories"
import RestaurantHeader from "./components/header"

interface RestaurantMenuProps {
  params: Promise<{slug: string}>
  searchParams: Promise<{consumptionMethod: string}>
}

const isConsumptionMethodValid = (ConsumptionMethod: string) => {
  return ["dine_in", "takeaway"].includes(ConsumptionMethod)
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
  
  if(!restaurant || !isConsumptionMethodValid(consumptionMethod)){
    return notFound()
  }
  return (
    <div>
      <RestaurantHeader restaurant={restaurant} slug={slug} />      
      <RestaurantCategories restaurant={restaurant} />
    </div>
  )
}
 
export default RestaurantMenuPage;