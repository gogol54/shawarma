import { Product } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

interface ProductsProps {
  products: Product[]
}

const Products = ({products}: ProductsProps) => {
  const { slug } = useParams<{slug: string}>()
  const search = useSearchParams()
  const consumptionMethod = search.get("consumptionMethod")
  return (  
    <div className="space-y-3 px-5 pb-20">
      {
        products.map((product) => (
          <Link 
            key={product.id} 
            href={`/${slug}/menu/${product.id}?consumptionMethod=${consumptionMethod}`} 
            className="flex items-center justify-between gap-10 py-3 border-b"
          > 
            <div>
              <h3 className="text-sm font-medium">
                {product.name}
              </h3>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {product.description}
              </p>
              {product.offer > 0 ? (
                <div className="pt-3">
                  <p className="text-xs text-muted-foreground line-through">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(product.price)}
                  </p>
                  <p className="text-sm font-semibold text-green-600">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(product.price * (1 - product.offer / 100))}
                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                      {product.offer}% OFF
                    </span>
                  </p>
                </div>
              ) : (
                <p className="pt-3 text-sm font-semibold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(product.price)}
                </p>
              )}
            </div>
            <div className="relative min-h-[82px] min-w-[120px] ">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-contain rounded-lg"
              />
            </div>
          </Link>
        ))
      }
    </div>
  )
}
 
export default Products;