// src/app/admin/pages/products-list.tsx

import { db } from "@/lib/prisma"

import ProductsListComponent from "../components/tables/products-list"
import Topbar from "../components/topbar"

export default async function ProductsList() {
  const products = await db.product.findMany({
    include: {
      restaurant: true,
      menuCategory: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  })
  
  const productsList = products.map((product) => ({
    ...product,
    createdAt: product.createdAt.toISOString(),
  }))

  return (
    <div className="w-full">
      <Topbar />
      <ProductsListComponent products={productsList} />
    </div>
  )
}
