"use client";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const formSchema = z.object({
  name: z.string().trim().min(1, { message: "O nome é obrigatório." }),
  cpf: z
    .string()
    .trim()
    .min(1, { message: "O CPF é obrigatório." })
    .refine(validateCPF, { message: "CPF inválido!" }),
  phone: z.string().trim().min(1, { message: "O contato é obrigatório." }),
  address: z.object({
    street: z.string().trim().min(1, { message: "A rua é obrigatória." }),
    number: z.string().trim().min(1, { message: "O número é obrigatório." }),
    complement: z.string().optional(),
    zone: z.string().trim().min(1, { message: "O bairro é obrigatório." }),
  }),
});

type FormSchema = z.infer<typeof formSchema>;

interface FinishOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FinishDialog = ({ open, onOpenChange }: FinishOrderDialogProps) => {
  const search = useSearchParams();
  const { products, clearCart, setIsOpen, payOnDelivery } =
    useContext(CartContext);

  const [isPending, startTransition] = useTransition();

  const { slug } = useParams();
  const safeSlug = Array.isArray(slug) ? slug[0] : (slug ?? "");

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      cpf: "",
      phone: "",
      address: {
        street: "",
        number: "",
        complement: "",
        zone: "",
      },
    },
    shouldUnregister: true,
  });

  const onSubmit = (data: FormSchema) => {
    startTransition(async () => {
      try {
        const consumptionMethod = search.get(
          "consumptionMethod",
        ) as ConsumptionMethod;

        const response = await createOrder({
          consumptionMethod,
          customerCpf: data.cpf,
          customerName: data.name,
          customerPhone: data.phone,
          address: {
            street: data.address.street || "",
            number: data.address.number || "",
            complement: data.address.complement || "",
            zone: data.address.zone || "",
          },
          products,
          slug: safeSlug,
          control: payOnDelivery,
        });

        if (response?.orderId) {
          clearCart();
          setIsOpen(false);
          onOpenChange(false);

          toast.success("Redirecionando para o pagamento...");

          window.location.href = `/checkout/${response.orderId}`;
          return;
        }

        if (response?.redirectUrl) {
          clearCart();
          setIsOpen(false);
          onOpenChange(false);

          toast.success("Agradecemos pela preferência!");

          window.location.href = response.redirectUrl;
          return;
        }

        toast.error("Erro ao iniciar pagamento.");
      } catch (error) {
        toast.error("Algum erro foi encontrado, tente novamente!");
        console.log(error);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Finalizar Pedido</DialogTitle>

          <DialogDescription>
            Insira suas informações para finalizar o pedido
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto px-1">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite seu nome..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="phone"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contato</FormLabel>
                    <FormControl>
                      <PatternFormat
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
                name="cpf"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <PatternFormat
                        format="###.###.###-##"
                        customInput={Input}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="address.street"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rua</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="address.number"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número</FormLabel>
                    <FormControl>
                      <Input placeholder="Número..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="address.complement"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complemento</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Complemento (opcional)..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="address.zone"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <Input placeholder="Bairro..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2 pb-2 pt-2">
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending && (
                    <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Efetuar Compra
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  className="w-full"
                  disabled={isPending}
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FinishDialog;
