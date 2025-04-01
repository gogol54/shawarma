'use client'

import { zodResolver } from "@hookform/resolvers/zod";
import { ConsumptionMethod } from "@prisma/client";
import { Loader2Icon } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useContext, useTransition } from "react";
import { useForm } from "react-hook-form";
import { PatternFormat } from "react-number-format";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { createOrder } from "../actions/create-order";
import { CartContext } from "../contexts/cart";
import { validateCPF } from "../helpers/cpf";

// Definição do Schema
const formSchema = z.object({
  name: z.string().trim().min(1, { message: "O nome é obrigatório." }),
  cpf: z.string().trim().min(1, { message: "O CPF é obrigatório." }).refine((value) => validateCPF(value), { message: "CPF inválido!" }),
  phone: z.string().trim().min(1, { message: "O contato é obrigatório." }),
  address: z.object({
    street: z.string().trim().min(1, { message: "A rua é obrigatória." }),
    number: z.string().trim().min(1, { message: "O número é obrigatório." }),
    complement: z.string().optional(),
    zone: z.string().trim().min(1, { message: "O bairro é obrigatório." }),
  })
});

type FormSchema = z.infer<typeof formSchema>

interface FinishOrderDialogProps{
  open: boolean,
  onOpenChange: (open: boolean) => void,
}


const FinishDialog = ({open, onOpenChange}: FinishOrderDialogProps) => {
  const search = useSearchParams();
  const { products, clearCart } = useContext(CartContext);
  const [isPending, startTransition] = useTransition();
  const { slug } = useParams();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      cpf: "",
      phone: "",
      address: { street: "", number: "", complement: "", zone: "" },
    },
    shouldUnregister: true,
  });

  const onSubmit = async (data: FormSchema) => {
    try {
      startTransition(async () => {
        const consumptionMethod = search.get("consumptionMethod") as ConsumptionMethod;
        await createOrder({
          consumptionMethod,
          customerCpf: data.cpf,
          customerName: data.name,
          customerPhone: data.phone,
          address: data.address,
          products,
          slug,
        });
        clearCart();
        onOpenChange(false);
        toast.success("Agradecemos pela preferência, agora é só esperar!");
      });
    } catch (error) {
      toast.error("Algum erro foi encontrado, tente novamente!");
      console.log(error);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="flex-column bg-white p-2 shadow-lg rounded-lg w-full overflow-y-scroll">
        <DrawerHeader>
            <DrawerTitle>Finalizar Pedido</DrawerTitle>
            <DrawerDescription>Insira suas informações para finalizar o pedido</DrawerDescription>
        </DrawerHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} >
              <FormField name="name" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl><Input placeholder="Digite seu nome..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="phone" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Contato</FormLabel>
                  <FormControl><PatternFormat format="(##)#####-####" customInput={Input} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="cpf" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl><PatternFormat format="###.###.###-##" customInput={Input} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="address.street" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Rua</FormLabel>
                  <FormControl><Input placeholder="Rua..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="address.number" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Número</FormLabel>
                  <FormControl><Input placeholder="Número..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="address.complement" control={form.control} render={({ field }) => (
                <FormItem >
                  <FormLabel >Complemento</FormLabel>
                  <FormControl><Input placeholder="Complemento (opcional)..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField  name="address.zone" control={form.control} render={({ field }) => (
                <FormItem >
                  <FormLabel>Bairro</FormLabel>
                  <FormControl><Input placeholder="Bairro..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <DrawerFooter className="mt-auto">
                <Button type="submit" color='green' disabled={isPending}>
                  {isPending && <Loader2Icon className="animate-spin" />} Efetuar pagamento
                </Button>
                <DrawerClose asChild>
                  <Button variant="destructive">Cancelar</Button>
                </DrawerClose>
              </DrawerFooter>
            </form>
          </Form>
      </DrawerContent>
    </Drawer>
  );
};

export default FinishDialog;
