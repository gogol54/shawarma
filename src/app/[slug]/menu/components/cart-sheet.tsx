import { useContext, useEffect } from "react";

import { formatCurrency } from "@/app/helpers/format-currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { CartContext } from "../contexts/cart";
import CartItem from "./cart-item";
import FinishButton from "./payment-btn-order";

const CartSheet = () => {
  const { isOpen, products, total, toggleCart } = useContext(CartContext);

  return (
    <Sheet open={isOpen} onOpenChange={toggleCart}>
      <SheetContent className="w-[80%]">
        <SheetHeader>
          <SheetTitle>Suas Compras</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full py-5">
          <div className="flex-auto">
            {products.map((product) => (
              <CartItem key={product.id} item={product} />
            ))}
          </div>
          <Card className="mb-6">
            <CardContent className="p-5">
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="font-semibold text-sm">{formatCurrency(total)}</p>
              </div>
            </CardContent>
          </Card>
          {/* Button agora tem o evento onClick direto */}
          <FinishButton />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;




