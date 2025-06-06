"use client"

import { Product } from "@prisma/client";
import { createContext, ReactNode, useState } from "react";

export interface CartProduct extends Pick<Product, "id" | "name" | "description" | "imageUrl" | "price" | "offer" | "inStock" | "menuCategoryId" >{
  quantity: number;
  dropIng: string[];
}

export interface ICartContext {
  isOpen: boolean;
  products: CartProduct[];
  total: number;
  totalQuantity: number;
  payOnDelivery: boolean; 
  clearCart: () => void;
  setIsOpen: (value: boolean) => void;
  setPayOnDelivery: (value: boolean) => void;
  addProduct: (Product: CartProduct) => void;
  decreaseProductQuantity: (productId: string, dropIng: string[]) => void;
  increaseProductQuantity: (productId: string, dropIng: string[]) => void;
  removeProduct: (productId: string, dropIng: string[]) => void;
}

export const CartContext = createContext<ICartContext>({
  isOpen: false,
  products: [],
  total: 0,
  totalQuantity: 0,
  payOnDelivery: false, 
  setIsOpen: () => {},
  setPayOnDelivery: () => {},
  addProduct: () => {},
  decreaseProductQuantity: () => {},
  increaseProductQuantity: () => {},
  removeProduct: () => {},
  clearCart: () => {}
})

export const CartProvider = ({children} : {children: ReactNode}) => {
  const [products, setProducts] = useState<CartProduct[]>([])
  const [isOpen, setIsOpen]= useState<boolean>(false)
  const [payOnDelivery, setPayOnDelivery] = useState<boolean>(false);

  const total = products.reduce((acc, product) => {
    return acc + (product.price * (1 - product.offer / 100)) * product.quantity;
  },0)
  const totalQuantity = products.reduce((acc, product) => {
    return acc + product.quantity 
  }, 0)

  const decreaseProductQuantity = (productId: string, dropIng: string[]) => {
    setProducts((prevs) => {
      return prevs.map((item) => {
        // Verifica se o produto é o correto, considerando o ID e os ingredientes removidos
        if (item.quantity === 1 || item.id !== productId || JSON.stringify(item.dropIng) !== JSON.stringify(dropIng)) {
          return item;
        }
        return { ...item, quantity: item.quantity - 1 };
      });
    });
  };

  const increaseProductQuantity = (productId: string, dropIng: string[]) => {
    setProducts((prevs) =>
      prevs.map((item) => {
        if (item.id !== productId || JSON.stringify(item.dropIng) !== JSON.stringify(dropIng)) {
          return item;
        }
        // Garantir que a quantidade não ultrapasse o estoque
        if (item.quantity < item.inStock) {
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      })
    );
  };

  const removeProduct = (productId: string, dropIng: string[]) => {
    setProducts((prevs) =>
      prevs.filter((item) => {
        const isSameId = item.id === productId;
        const isSameDropIng = JSON.stringify(item.dropIng) === JSON.stringify(dropIng);
        return !(isSameId && isSameDropIng); // mantém todos os outros
      })
    );
  };
  const clearCart = () => {
    setProducts([]);
  };

  const addProduct = (product: CartProduct) => {
    product.dropIng.sort()
    setProducts((prevProducts) => {
      const existingProduct = prevProducts.find(
        (item) => item.id === product.id && JSON.stringify(item.dropIng) === JSON.stringify(product.dropIng)
      );
  
      if (existingProduct) {
        // Garante que a quantidade total não ultrapasse o inStock
        const newQuantity = existingProduct.quantity + product.quantity;
        return prevProducts.map((item) =>
          item.id === product.id && JSON.stringify(item.dropIng) === JSON.stringify(product.dropIng)
            ? { ...item, quantity: newQuantity > item.inStock ? item.inStock : newQuantity }
            : item
        );
      } else {
        // Garante que o novo produto adicionado não ultrapasse o inStock
        return [...prevProducts, { ...product, quantity: Math.min(product.quantity, product.inStock) }];
      }
    });
  };
  
  return (
    <CartContext.Provider
      value={{
        isOpen,
        products,
        total,
        totalQuantity,
        payOnDelivery,
        setPayOnDelivery,
        setIsOpen,
        addProduct,
        decreaseProductQuantity,
        increaseProductQuantity,
        removeProduct,
        clearCart
      }}
    >
      {children}  
    </CartContext.Provider>
  )
}