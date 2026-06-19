"use client";

import { useSearchParams } from "next/navigation";
import { useContext, useState } from "react";

import { formatCurrency } from "@/app/helpers/format-currency";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
    setPayOnDelivery,
  } = useContext(CartContext);
  const [finishOrderDialogIsOpen, setFinishOrderDialogIsOpen] =
    useState<boolean>(false);
  return (
    <Sheet open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
      <SheetContent className="mx-auto w-[85%] max-w-[450px]">
        <Button
          variant="default"
          className="bg- bg-hover:bg-amber-500 mb-10 mt-[-5] w-min rounded-md bg-amber-400 hover:bg-amber-300"
          onClick={() => setIsOpen(false)}
        >
          Continuar comprando
        </Button>
        <SheetHeader>
          <SheetTitle>Suas Compras</SheetTitle>
        </SheetHeader>
        <div className="flex h-full flex-col py-5">
          <div className="max-h-[500px] space-y-4 overflow-y-auto pb-7">
            {products.map((product) => (
              <CartItem
                key={`${product.id}-${JSON.stringify(product.dropIng)}`}
                item={product}
              />
            ))}
          </div>
          <Card className="mb-6">
            <CardContent className="p-5">
              {consumptionMethod === "entrega" && (
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Valor </p>
                  <p className="text-sm font-semibold">
                    {formatCurrency(total)}
                  </p>
                </div>
              )}
              {consumptionMethod === "entrega" && (
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Entrega </p>
                  <p className="text-sm font-semibold">{formatCurrency(10)}</p>
                </div>
              )}
              <div className="flex justify-between">
                <p className="text-sm text-muted-foreground">Total </p>
                <p className="text-sm font-semibold">
                  {consumptionMethod === "entrega"
                    ? formatCurrency(total + 10)
                    : formatCurrency(total)}
                </p>
              </div>
            </CardContent>
          </Card>
          {/* Checkbox para "Pagar na Retirada" */}
          <div className="mb-4 flex items-center space-x-2">
            <Checkbox
              id="pay-on-pickup"
              checked={payOnDelivery}
              onCheckedChange={(checked) => setPayOnDelivery(Boolean(checked))}
            />
            <label htmlFor="pay-on-pickup" className="cursor-pointer text-sm">
              Pagar na Retirada
            </label>
          </div>
          {/* Button agora tem o evento onClick direto */}
          <Button
            className="w-full rounded-full"
            onClick={() => {
              setFinishOrderDialogIsOpen(true);
            }}
          >
            Finalizar Pedido
          </Button>

          <FinishDialog
            open={finishOrderDialogIsOpen}
            onOpenChange={setFinishOrderDialogIsOpen}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSheet;
