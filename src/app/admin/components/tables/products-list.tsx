'use client'
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { deleteProduct,updateProduct } from "../../actions/product-actions"

type Product = {
  id: string
  name: string
  description: string
  price: number
  inStock: number
  imageUrl: string
  createdAt: string
  menuCategory: {
    name: string
  }
  restaurant: {
    name: string
  }
}

type Props = {
  products: Product[]
}

const ProductsListComponent = ({ products }: Props) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    inStock: "",
    imageUrl: "",
  })

  const handleUpdateClick = (product: Product) => {
    setSelectedProduct(product)
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      inStock: String(product.inStock),
      imageUrl: product.imageUrl,
    })
  }

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) return

    const result = await updateProduct(selectedProduct.id, {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      inStock: parseInt(form.inStock),
      imageUrl: form.imageUrl,
    })

    if (result.success) {
      setSelectedProduct(null)
    } else {
      alert(result.error)
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Lista de Produtos</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="p-2">Imagem</TableHead>
            <TableHead className="p-2">Nome</TableHead>
            <TableHead className="p-2">Descrição</TableHead>
            <TableHead className="p-2">Categoria</TableHead>
            <TableHead className="p-2">Restaurante</TableHead>
            <TableHead className="p-2">Preço</TableHead>
            <TableHead className="p-2">Estoque</TableHead>
            <TableHead className="p-2">Criado em</TableHead>
            <TableHead className="p-2">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="p-2">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={60}
                  height={60}
                  className="rounded object-cover"
                />
              </TableCell>
              <TableCell className="p-2">{product.name}</TableCell>
              <TableCell className="p-2 max-w-3.5 truncate">{product.description}</TableCell>
              <TableCell className="p-2">{product.menuCategory.name}</TableCell>
              <TableCell className="p-2">{product.restaurant.name}</TableCell>
              <TableCell className="p-2">R$ {product.price.toFixed(2)}</TableCell>
              <TableCell className="p-2">{product.inStock}</TableCell>
              <TableCell className="p-2">
                {new Date(product.createdAt).toLocaleDateString("pt-BR")}{" "}
                {new Date(product.createdAt).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </TableCell>
              <TableCell className="p-2 space-x-2">
                {/* Dialog de Atualização */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => handleUpdateClick(product)}>
                      Atualizar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Atualizar Produto</DialogTitle>
                    </DialogHeader>
                    {selectedProduct && (
                      <form onSubmit={handleUpdateSubmit} className="space-y-4">
                        <div>
                          <Label>Nome</Label>
                          <Input
                            value={form.name}
                            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Descrição</Label>
                          <Input
                            value={form.description}
                            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Preço (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={form.price}
                            onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Estoque</Label>
                          <Input
                            type="number"
                            value={form.inStock}
                            onChange={(e) => setForm((prev) => ({ ...prev, inStock: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label>Imagem (URL)</Label>
                          <Input
                            value={form.imageUrl}
                            onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                          />
                        </div>
                        <DialogClose asChild>
                          <Button type="submit">Salvar Alterações</Button>
                        </DialogClose>
                      </form>
                    )}
                  </DialogContent>
                </Dialog>
              </TableCell>
              <TableCell>
                {/* Dialog de Remoção */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      Remover
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirmar Remoção</DialogTitle>
                    </DialogHeader>
                    <p>
                      Você tem certeza que deseja remover o produto <strong>{product.name}</strong>? Esta ação
                      não pode ser desfeita.
                    </p>
                    <div className="flex justify-end gap-2 mt-4">
                      <DialogClose asChild>
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            const res = await deleteProduct(product.id)
                            if (res.success) {
                              toast.success("Produto removido com sucesso!")
                            } else {
                              toast.error(res.error ?? "Erro ao remover produto")
                            }
                          }}
                        >
                          Confirmar Remoção
                        </Button>
                      </DialogClose>
                    </div>
                  </DialogContent>
                </Dialog>
              </TableCell>
            
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default ProductsListComponent
