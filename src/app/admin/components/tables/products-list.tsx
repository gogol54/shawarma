// src/app/admin/pages/products-list.tsx
'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const products = [
  {
    id: "1",
    name: "X-Burguer",
    price: "R$ 18,00",
    available: true,
  },
  {
    id: "2",
    name: "X-Tudo",
    price: "R$ 25,00",
    available: false,
  },
]

export default function ProductsList() {
  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Lista de Produtos</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.price}</TableCell>
              <TableCell>
                {product.available ? (
                  <span className="text-green-600 font-semibold">Disponível</span>
                ) : (
                  <span className="text-red-500 font-semibold">Indisponível</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
