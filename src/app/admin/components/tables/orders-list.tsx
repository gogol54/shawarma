'use client'

import { ConsumptionMethod, OrderStatus } from "@prisma/client"
import { JsonValue } from "@prisma/client/runtime/library"
import { useState, useTransition } from "react"

import handleDownloadReceipt from "@/app/helpers/cupom"
import { formatCurrency } from "@/app/helpers/format-currency"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"

import { updateOrderStatus } from "../../actions/orders-actions"

type OrdersListComponentProps = {
  orders: {
    id: number
    code: string | null
    total: number
    status: OrderStatus
    consumptionMethod: ConsumptionMethod
    customerName: string
    customerPhone: string
    isPaid: boolean
    address: JsonValue | null
    paymentMethod: string | null
    createdAt: string // ou Date, dependendo de como vem do backend
    orderProducts: {
      id: string
      productId: string 
      quantity: number
      price: number
      dropIng: JsonValue | null
      product: {
        name: string
      }
    }[]
  }[]
}

export default function OrdersListComponent({ orders }: OrdersListComponentProps) {
  const [open, setOpen] = useState(false)
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null)
  const [viewProductsOrderId, setViewProductsOrderId] = useState<number | null>(null)
  const [newStatus, setNewStatus] = useState<OrderStatus>('PENDING')
  const [isPending, startTransition] = useTransition()
  const motoboy : number = 8
  const getMinutesSince = (createdAt: string | Date, status: string) => {
    if (status !== "IN_PREPARATION" && status !== "PENDING") {
      switch (status) {
        case "FINISHED":
          return "Finalizado"
        case "CANCELLED":
          return "Cancelado"
        case "DELIVERY":
          return "Finalizado"
        default:
          return "-"
      }
    }
  
    const created = new Date(createdAt)
    const now = new Date()
    const diffMs = now.getTime() - created.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    return `${diffMins} min`
  }

  const statusFormatter = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="text-yellow-600 font-medium">Pendente</span>
      case 'IN_PREPARATION':
        return <span className="text-blue-600 font-medium">Em preparo</span>
      case 'DELIVERY':
        return <span className="text-violet-500 font-medium">Saiu para entrega</span>
      case 'FINISHED':
        return <span className="text-green-600 font-medium">Entregue</span>
      case 'CANCELLED':
        return <span className="text-red-600 font-medium">Cancelado</span>
      default:
        return <span className="text-gray-500">Desconhecido</span>
    }
  }

  const handleEditClick = (orderId: number, currentStatus: OrderStatus) => {
    setActiveOrderId(orderId)
    setNewStatus(currentStatus)
    setOpen(true)
  }

  const handleUpdate = async () => {
    if (activeOrderId === null) return
    startTransition(async () => {
      const res = await updateOrderStatus(activeOrderId, newStatus)
      if (res.success) {
        setOpen(false)
        setActiveOrderId(null)
      } else {
        alert("Erro ao atualizar o pedido.")
      }
    })
  }

  return (
    <div className="p-2 overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Lista de Pedidos</h2>
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Celular</TableHead>
            <TableHead>Entrega</TableHead>
            <TableHead>Tempo</TableHead>
            <TableHead>Pagamento</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.customerName || "N/A"}</TableCell>
              <TableCell>{order.customerPhone}</TableCell>
              <TableCell>{order.consumptionMethod}</TableCell>
              <TableCell>
                {getMinutesSince(order.createdAt, order.status)}
              </TableCell>
              <TableCell>
                {order.isPaid ? "Pago ✅/\nvia "+order.paymentMethod : "Pendente⚠️"}
              </TableCell>
              <TableCell>{formatCurrency(order.total)}</TableCell>
              <TableCell>{statusFormatter(order.status)}</TableCell>
              <TableCell className="flex gap-2">
                {/* Botão Editar */}
                <Dialog open={open && activeOrderId === order.id} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => handleEditClick(order.id, order.status)} 
                      className="bg-blue-500 hover:bg-blue-400 text-white" >
                      Editar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-full sm:max-w-lg w-[95vw] sm:w-full">
                    <DialogHeader>
                      <DialogTitle>Atualizar Status</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm">Pedido #{viewProductsOrderId} - {order.customerName}</p>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                      className="border rounded p-2 w-full mt-4"
                    >
                      <option value="PENDING">Pendente</option>
                      <option value="IN_PREPARATION">Em preparo</option>
                      <option value="DELIVERY">Saiu para entrega</option>
                      <option value="FINISHED">Entregue</option>
                      <option value="CANCELLED">Cancelado</option>
                    </select>
                    <DialogFooter className="mt-4">
                      <Button disabled={isPending} onClick={handleUpdate} className="bg-blue-500 hover:bg-blue-400">
                        {isPending ? "Salvando..." : "Confirmar"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Botão Visualizar Produtos */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button onClick={() => setViewProductsOrderId(order.id)} className="bg-blue-500 hover:bg-blue-400 text-white">
                      Visualizar
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Produtos do Pedido #{order.id}</DialogTitle>
                      <Button
                        variant="outline"
                        onClick={() => handleDownloadReceipt(order)}
                        className="mt-2 text-sm bg-green-500 hover:bg-green-600 text-white"
                      >
                        Baixar Comprovante
                      </Button>
                      {order.orderProducts.length > 0 ? (
                        order.orderProducts.map((product, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 p-2 rounded shadow-sm"
                          >
                            <p className="text-base"><strong>Produto:</strong> {product.product.name}</p>
                            <p className="text-base"><strong>Quantidade:</strong> {product.quantity}</p>
                            <p className="text-base"><strong>Preço:</strong> {formatCurrency(product.price)}</p>
                            {order.consumptionMethod === 'entrega' &&
                              <p className="text-base"><strong>Entrega:</strong> {formatCurrency(motoboy)}</p>
                            }
                            <p className="text-base"><strong>Total:</strong> {
                              order.consumptionMethod === 'entrega' ? 
                                formatCurrency(product.price + motoboy) : 
                                formatCurrency(product.price)}
                            </p>
                            <p className="text-base">
                              <strong>Ingredientes p/ remover:</strong>{" "}
                              {Array.isArray(product.dropIng)
                                ? product.dropIng.join(", ")
                                : "Nenhum"}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500">Nenhum produto encontrado.</p>
                      )}
                    </DialogHeader>
                    {/* ... conteúdo aqui ... */}
                  </DialogContent>
                </Dialog>

                {/* Finda Visualizar Produtos */}

              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
