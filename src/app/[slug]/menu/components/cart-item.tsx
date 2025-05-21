"use client"

import { ChevronLeftIcon, ChevronRightIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { useContext } from "react";

import { formatCurrency } from "@/app/helpers/format-currency";
import { Button } from "@/components/ui/button";

import { CartContext, CartProduct } from "../contexts/cart";

interface CartItemProps {
  item: CartProduct;
}


const CartItem = ({item} : CartItemProps) => {
  const {
    decreaseProductQuantity, 
    increaseProductQuantity, 
    removeProduct
  } = useContext(CartContext)
  return (  
    <div className="flex items-center justify-between py-4 mb-7">
      <div className="flex items-center gap-3">
        <div className="relative h-20 w-20 mr-2">
          <Image 
            src={item.imageUrl} 
            alt={item.name} 
            className="object-cover bg-gray-100 rounded-2xl"
            fill 
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs max-w-[90%] truncate text-ellipsis">{item.name}</p>
          <p className="text-sm font-semibold">{formatCurrency(item.price * (1 - item.offer / 100))}</p>
          {/* QUANTIDADE */}
          <div className="flex items-center gap-1 text-center">
            <Button 
              className="h-7 w-7 rounded-lg" 
              variant="outline" 
              onClick={() => decreaseProductQuantity(item.id, item.dropIng)}
            >
              <ChevronLeftIcon size={12}/>
            </Button>      
              <p className="w-7 text-xs">{item.quantity}</p>
            <Button 
              className="h-7 w-7 rounded-lg" 
              variant="destructive"
              onClick={() => increaseProductQuantity(item.id, item.dropIng)}
            >
              <ChevronRightIcon size={12}/>
            </Button>        
          </div>
        </div>
      </div>
      <div>
        <Button 
          className="w-7 h-7 rounded-lg" 
          variant="outline" 
          onClick={() => removeProduct(item.id, item.dropIng)}
        >
          <TrashIcon />
        </Button>
      </div>
    </div>
  );
}
 
export default CartItem;