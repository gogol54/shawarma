
import { notFound } from "next/navigation"

import { getRestaurantBySlug } from "@/app/data/actions_restaurant"

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
  const restaurant = await getRestaurantBySlug(slug)
  if(!isConsumptionMethodValid(consumptionMethod)){
    return notFound()
  }
  return (
    <div>
      <RestaurantHeader restaurant={restaurant} />      
    </div>
  )
}
 
export default RestaurantMenuPage;