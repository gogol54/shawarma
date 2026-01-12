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

import { removePoints } from '../../menu/helpers/cpf'

const formSchema = z.object({   
  phone: z.string().trim().min(1, { 
    message: "O contato é obrigatório." 
  })
})
type FormSchema = z.infer<typeof formSchema>;

const PhoneForm = () => {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema)
  })
  const pathname = usePathname()
  const router = useRouter()
  const handleCancel = () => {
    router.back()
  }
  const onSubmit = (data: FormSchema) => {
    router.replace(`${pathname}?phone=${removePoints(data.phone)}`)
  }
 
  return (
    <Drawer open>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>🎁 Encontre seus prêmios</DrawerTitle>
          <DrawerDescription>Insira seu número para verificar se há lanches disponíveis para resgate 🌯✨</DrawerDescription>
        </DrawerHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className='px-4'>
                  <FormLabel>Coloque o número do seu celular</FormLabel>
                  <FormControl>
                    <PatternFormat
                      placeholder="ex: (55)99611-1234"
                      format="(##)#####-####"
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

export default PhoneForm