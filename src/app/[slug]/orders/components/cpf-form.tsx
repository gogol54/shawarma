"use client"

import { zodResolver } from '@hookform/resolvers/zod'
import { usePathname, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { PatternFormat } from 'react-number-format'
import z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
 } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

 import { removePoints, validateCPF } from '../../menu/helpers/cpf'

const formSchema = z.object({
  cpf: z.string().trim().min(1, {
    message: "O cpf é obrigatório."
  }).refine((value) => validateCPF(value), {
    message: "CPF inválido!",
  })
})
type FormSchema = z.infer<typeof formSchema>;

const CpfForm = () => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema)
  })
  const pathname = usePathname()
  const router = useRouter()
  const handleCancel = () => {
    router.back()
  }
  const onSubmit = (data: FormSchema) => {
    router.replace(`${pathname}?cpf=${removePoints(data.cpf)}`)
  }

  return (
    <Drawer open>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Encontre Seus Pedidos</DrawerTitle>
          <DrawerDescription>Insira seu número para encontrar o pedido</DrawerDescription>
        </DrawerHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem className='px-4'>
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
                className="w-full rounded-full"
              >
                Confirmar
              </Button>
              <DrawerClose asChild>
                <Button 
                  variant="outline" 
                  className="rounded-full w-full"
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  )
}

export default CpfForm