'use client'

import { Product } from "@prisma/client";
import { ChevronLeftIcon, ScrollTextIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

// import { useState } from "react";
// import CpfForm from "@/app/[slug]/orders/components/cpf-form";
import { Button } from "@/components/ui/button";


interface ProductHeaderProps {
  product: Pick<Product, 'name' | 'imageUrl'>
}

const ProductHeader = ({ product }: ProductHeaderProps) => {
  const router = useRouter()
  // const [pressed, setPressed] = useState<boolean>(false)
  const handleBackClick = () => router.back()

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
      className="object-contain 0 z-10 bg-gray-100" 
      fill
    />
    <Button 
      variant="secondary" 
      size="icon" 
      className="absolute right-4 top-4 z-50 rounded-full"
      onClick={handleBackClick}

    >
      <ScrollTextIcon />
      {/* {pressed && <CpfForm />}  depois nos faz essa*/}
    </Button>
    
  
  </div>
  )
}
 
export default ProductHeader;