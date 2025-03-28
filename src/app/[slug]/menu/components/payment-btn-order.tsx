'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { ConsumptionMethod, Product } from "@prisma/client";
import { Loader2Icon } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useContext, useTransition } from "react";
import { useForm } from "react-hook-form";
import { PatternFormat } from 'react-number-format' 
import { toast } from "sonner";
import z from "zod"

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { createOrder } from "../actions/create-order";
import { CartContext } from "../contexts/cart";
import { validateCPF } from "../helpers/cpf";

// Definição do Schema
const formSchema = z.object({
  name: z.string().trim().min(1, { message: "O nome é obrigatório." }),
  cpf: z.string().trim().min(1, { message: "O cpf é obrigatório." }).refine((value) => validateCPF(value), { message: "CPF inválido!" }),
  phone: z.string().trim().min(1, { message: "O contato é obrigatório." })
});

type FormSchema = z.infer<typeof formSchema>;

interface FinishOrderDialogProps {
  open: boolean,
  onOpenChange: (open: boolean) => void,
}

const FinishDialog = ({ open, onOpenChange }: FinishOrderDialogProps) => {
  const search = useSearchParams();
  const { products, clearCart } = useContext(CartContext);
  const [isPending, startTransition] = useTransition();
  const { slug } = useParams<{ slug: string }>();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", cpf: "", phone: "" },
    shouldUnregister: true,
  });

  const sendOrderToWhatsApp = (data: FormSchema, products: Product, consumptionMethod: ConsumptionMethod) => {
    // Formatação da mensagem para WhatsApp
    const formattedProducts = products.map((product) => `🥙 *${product.name}* - ${product.quantity}x`).join("\n");
    const message = encodeURIComponent(
      `📢 *Novo Pedido Recebido!*\n\n` +
      `👤 *Cliente:* ${data.name}\n` +
      `📞 *Telefone:* ${data.phone}\n` +
      `📍 *Método de Consumo:* ${consumptionMethod === "dine_in" ? "Buscar no Local" : "Entrega"}\n\n` +
      `🛒 *Resumo do Pedido:*\n${formattedProducts}\n\n` +
      `✅ Pedido confirmado e aguardando preparo!`
    );
    
    // Número do WhatsApp do restaurante (ou responsável)
    const whatsappNumber = "+55" + "55981376693"; // Certifique-se de que o número está correto, sem espaços, parênteses ou traços.
  
    // Gerando a URL para abrir o WhatsApp com a mensagem
    const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;
  
    // Redireciona o cliente para o WhatsApp para enviar a mensagem
    window.open(whatsappURL, "_blank");  // Abre o WhatsApp em uma nova aba ou aplicativo
  };

  const onSubmit = async (data: FormSchema) => {
    try {
      startTransition(async () => {
        const consumptionMethod = search.get("consumptionMethod") as ConsumptionMethod;
        // Cria a ordem
        await createOrder({
          consumptionMethod,
          customerCpf: data.cpf,
          customerName: data.name,
          customerPhone: data.phone,
          products,
          slug
        });
        clearCart();
        onOpenChange(false);

        // Envia o pedido para o WhatsApp
        sendOrderToWhatsApp(data, products, consumptionMethod);

        // Exibe o toast de sucesso
        toast.success("Agradecemos pela preferência, agora é só esperar!");
      });
    } catch (error) {
      toast.error("Algum erro foi encontrado, tente novamente!");
      console.log(error);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Finalizar Pedido</DrawerTitle>
          <DrawerDescription>Insira suas informações para finalizar o seu pedido</DrawerDescription>
        </DrawerHeader>
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Digite seu nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite seu nome..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número para contato</FormLabel>
                    <FormControl>
                      <PatternFormat
                        placeholder="(55)988025159"
                        format="(##)#####-####"
                        customInput={Input}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Digite seu CPF</FormLabel>
                    <FormControl>
                      <PatternFormat
                        placeholder="Digite seu CPF..."
                        format="###.###.###-##"
                        customInput={Input}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DrawerFooter>
                <Button
                  type="submit"
                  variant="destructive"
                  className="rounded-full"
                  disabled={isPending}
                >
                  {isPending && <Loader2Icon className="animate-spin" />}
                  Finalizar
                </Button>
                <DrawerClose asChild>
                  <Button variant="outline" className="rounded-full w-full">
                    Cancelar
                  </Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </Form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default FinishDialog;
