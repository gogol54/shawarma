"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { PlusCircle, Trash2 } from "lucide-react"
import { useFieldArray,useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import { createProduct } from "../actions/product-actions"

const formSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  price: z.string().min(1, "Preço obrigatório"),
  description: z.string(),
  imageUrl: z.string().url("URL inválida"),
  menuCategoryId: z.string().min(1, "Categoria obrigatória"),
  restaurantId: z.string().min(1, "Restaurante obrigatório"),
  inStock: z.number().default(25),
  ingredients: z
  .array(z.object({ value: z.string().min(1, "Ingrediente obrigatório") }))
  .default([])})
type FormSchema = z.infer<typeof formSchema>

type Props = {
  restaurants: { id: string; name: string }[]
  menuCategories: { id: string; name: string }[]
}

export default function CreateProductComponent({ restaurants, menuCategories }: Props) {
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      price: "",
      description: "",
      imageUrl: "",
      menuCategoryId: "",
      restaurantId: "",
      inStock: 25,
      ingredients: [],
    },
  })

  const {
    fields: ingredientFields,
    append,
    remove,
  } = useFieldArray({
    control: form.control,
    name: "ingredients",
  })

  const onSubmit = async (data: FormSchema) => {
    const result = await createProduct({
      ...data,
      offer: 0,
      price: Number(data.price),
      ingredients: data.ingredients?.map(i => i.value) ?? [],
    })

    if (result.success) {
      toast.success("Produto criado com sucesso!")
      form.reset()
    } else {
      toast.error(result.error ?? "Erro ao criar produto")
    }
  }

  return (
    <Form {...form}>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold">Novo Produto</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL da Imagem</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="restaurantId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Restaurante</FormLabel>
                <FormControl>
                  <select className="w-full border rounded px-3 py-2" {...field}>
                    <option value="">Selecione</option>
                    {restaurants.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="menuCategoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria</FormLabel>
                <FormControl>
                  <select className="w-full border rounded px-3 py-2" {...field}>
                    <option value="">Selecione</option>
                    {menuCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <FormLabel>Ingredientes</FormLabel>
          {ingredientFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <FormField
                control={form.control}
                name={`ingredients.${index}.value`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input placeholder={`Ingrediente ${index + 1}`} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {ingredientFields.length > 1 && (
                <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => append({ value: "" })}
            >
            <PlusCircle size={18} /> Adicionar ingrediente
          </Button>
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full">
            Criar Produto
          </Button>
        </div>
      </form>
    </Form>
  )
}
