import { db } from "@/lib/prisma"

import CreateProductComponent from "../components/create-new-product"
import Topbar from "../components/topbar"

export default async function ProductsList() {
  const restaurants = await db.restaurant.findMany({
    orderBy: { name: "asc" },
  })

  const menuCategories = await db.menuCategory.findMany({
    orderBy: { name: "asc" },
  })

  return (
    <div className="w-full">
      <Topbar />
      <CreateProductComponent
        restaurants={restaurants}
        menuCategories={menuCategories}
      />
    </div>
  )
}
