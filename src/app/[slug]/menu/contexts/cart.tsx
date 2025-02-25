"use client"

import { Product } from "@prisma/client";
import { createContext, ReactNode, useState } from "react";

export interface CartProduct extends Pick<Product, "id" | "name" | "imageUrl" | "price">{
  quantity: number;
}

export interface ICartContext {
  isOpen: boolean;
  products: CartProduct[];
  toggleCart: () => void;
  addProduct: (Product: CartProduct) => void;
  decreaseProductQuantity: (productId: string) => void;
  increaseProductQuantity: (ProductId: string) => void;
  removeProduct: (productId: string) => void;
}

export const CartContext = createContext<ICartContext>({
  isOpen: false,
  products: [],
  toggleCart: () => {},
  addProduct: () => {},
  decreaseProductQuantity: () => {},
  increaseProductQuantity: () => {},
  removeProduct: () => {}
})

export const CartProvider = ({children} : {children: ReactNode}) => {
  const [products, setProducts] = useState<CartProduct[]>([])
  const [isOpen, setIsOpen]= useState<boolean>(false)
 
  const decreaseProductQuantity = (productId: string) => {
    setProducts((prevs) => {
      return prevs.map((item) => {
        if (item.quantity === 1) {
          return { ...item, quantity: 1 };
        }
        if (item.id !== productId) {
          return item
        }
        return { ...item, quantity: item.quantity - 1 };
      });
    })
  }

  const increaseProductQuantity = (productId: string) => {
    setProducts((prevs) => {
      return prevs.map((item) => {
        if(item.id !== productId){
          return item
        }
        if (item.id === productId) {
          return { ...item, quantity: item.quantity + 1 };
        }

      });
    })
  }

  const toggleCart = () => {
    setIsOpen((prev) => !prev)
  }

  const removeProduct = (productId: string) => {
    setProducts(prevs => prevs.filter(item => item.id !== productId))
  } 

  const addProduct = (product: CartProduct) => {
    const productIsAlreadyOnTheCart = products.some(item => item.id === product.id)
   
    if(!productIsAlreadyOnTheCart){
      return setProducts((prev) => [...prev, product])
    }

    setProducts((prevProducts) => {
      return prevProducts.map((item) => {
        if (item.id === product.id) {
          return {
            ...item,
            quantity: item.quantity + product.quantity,
          };
        }
        return item
      });
    })
  }
  
  return (
    <CartContext.Provider
      value={{
        isOpen,
        products,
        toggleCart,
        addProduct,
        decreaseProductQuantity,
        increaseProductQuantity,
        removeProduct
      }}
    >
      {children}  
    </CartContext.Provider>
  )
}