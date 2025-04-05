"use client"

import { useSearchParams } from "next/navigation";
import { useContext, useState } from "react";

import { formatCurrency } from "@/app/helpers/format-currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { CartContext } from "../contexts/cart";
import CartItem from "./cart-item";
import FinishDialog from "./payment-btn-order";

const CartSheet = () => {
  const searchParams = useSearchParams();
  const consumptionMethod = searchParams.get("consumptionMethod");
  const { 
    isOpen, 
    products, 
    total, 
    payOnDelivery,
    setIsOpen, 
    setPayOnDelivery 
  } = useContext(CartContext);
  const [finishOrderDialogIsOpen, setFinishOrderDialogIsOpen] = useState<boolean>(false)
  console.log(products)
  return (
    <Sheet open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
      <SheetContent className="w-[90%] max-w-[450px] mx-auto">
        <SheetHeader>
          <SheetTitle>Suas Compras</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col h-full py-5">
          <div className="max-h-[500px] overflow-y-auto space-y-4 pb-7">
            {products.map((product) => (
              
              <CartItem key={`${product.id}-${JSON.stringify(product.dropIng)}`} item={product} />
            ))}
          </div>
          <Card className="mb-6">
            <CardContent className="p-5">
            {consumptionMethod === 'takeaway' && <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Valor </p>
                <p className="font-semibold text-sm">{formatCurrency(total)}</p>
              </div>}
              {consumptionMethod === 'takeaway' && <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Entrega </p>
                <p className="font-semibold text-sm">{formatCurrency(8)}</p>
              </div>}
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Total </p>
                <p className="font-semibold text-sm">{consumptionMethod === 'takeaway' ? formatCurrency(total + 8) : formatCurrency(total)}</p>
              </div>
            </CardContent>
          </Card>
          {/* Checkbox para "Pagar na Retirada" */}
          <div className="flex items-center mb-4 space-x-2">
            <Checkbox
              id="pay-on-pickup"
              checked={payOnDelivery}
              onCheckedChange={(checked) => setPayOnDelivery(Boolean(checked))}
            />
            <label htmlFor="pay-on-pickup" className="text-sm cursor-pointer">
              Pagar na Retirada
            </label>
          </div>
          {/* Button agora tem o evento onClick direto */}
          <Button className="w-full rounded-full" onClick={() => setFinishOrderDialogIsOpen(true)}>
            Finalizar Pedido
          </Button>
          <FinishDialog open={finishOrderDialogIsOpen} onOpenChange={setFinishOrderDialogIsOpen}/>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;




