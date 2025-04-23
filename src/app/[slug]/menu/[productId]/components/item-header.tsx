'use client'

import { Product } from "@prisma/client";
import { ChevronLeftIcon, ScrollTextIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";


interface ProductHeaderProps {
  slug: string,
  product: Pick<Product, 'name' | 'imageUrl'>
}

const ProductHeader = ({ product, slug }: ProductHeaderProps) => {
  const router = useRouter()
  const handleBackClick = () => router.back()
  const handleOrdersClick = () => router.push(`/${slug}/orders`)

  return (  
  <div className="relative min-h-[300px] w-full">
    <Button 
      variant="secondary" 
      size="icon" 
      className="absolute left-4 top-4 z-50 rounded-full"
      onClick={handleBackClick}
    >
      <ChevronLeftIcon className="text-slate-600" />
    </Button>
    <Image 
      src={product?.imageUrl} 
      alt={product?.name}
      className="object-contain bg-custom-gradient z-10" 
      fill
    />
    <Button 
      variant="secondary" 
      size="icon" 
      className="absolute right-4 top-4 z-50 rounded-full"
      onClick={handleOrdersClick}

    >
      <ScrollTextIcon />
    </Button>
    
  
  </div>
  )
}
 
export default ProductHeader;