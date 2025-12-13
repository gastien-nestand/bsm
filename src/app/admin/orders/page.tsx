"use client";

import { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Loader2, ArrowLeft, Home } from "lucide-react";
import { toast } from "sonner";
import type { Order } from "@/db/schema";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const statusColors = {
    pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    confirmed: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
    ready: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
    completed: "bg-green-500/10 text-green-700 dark:text-green-400",
    cancelled: "bg-red-500/10 text-red-700 dark:text-red-400",
};

const paymentStatusColors = {
    pending: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    paid: "bg-green-500/10 text-green-700 dark:text-green-400",
    failed: "bg-red-500/10 text-red-700 dark:text-red-400",
};

type OrderStatus = "pending" | "confirmed" | "ready" | "completed" | "cancelled";

export default function AdminOrdersPage() {
    const router = useRouter();
    const [selectedOrder, setSelectedOrder] = useState<Order | undefined>();
    const [filterStatus, setFilterStatus] = useState<string>("all");

    const { data: orders, isLoading, mutate } = useSWR<Order[]>('/api/admin/orders', fetcher);

    const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
        try {
            const response = await fetch(`/api/admin/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update order status');
            }

            toast.success("Order status updated");
            mutate(); // Revalidate orders list
        } catch (error) {
            toast.error("Failed to update order status");
        }
    };

    const filteredOrders = orders?.filter((order) => {
        if (filterStatus === "all") return true;
        return order.status === filterStatus;
    });

    return (
        <div className="space-y-6">
            {/* Navigation Buttons */}
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/admin')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push('/')}
                >
                    <Home className="mr-2 h-4 w-4" />
                    Homepage
                </Button>
            </div>

            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
                    <p className="text-muted-foreground">
                        Manage customer orders and fulfillment
                    </p>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Orders</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Orders</CardTitle>
                    <CardDescription>
                        {filteredOrders?.length || 0} orders
                        {filterStatus !== "all" && ` (${filterStatus})`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : !filteredOrders || filteredOrders.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No orders found.
                        </div>
                    ) : (
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredOrders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-mono text-sm">
                                                #{order.id}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{order.customerName}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {order.customerEmail}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                ${(order.totalAmount / 100).toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <Select
                                                    value={order.status}
                                                    onValueChange={(value) =>
                                                        handleStatusChange(order.id, value as OrderStatus)
                                                    }
                                                >
                                                    <SelectTrigger className="w-[130px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">Pending</SelectItem>
                                                        <SelectItem value="confirmed">Confirmed</SelectItem>
                                                        <SelectItem value="ready">Ready</SelectItem>
                                                        <SelectItem value="completed">Completed</SelectItem>
                                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className={paymentStatusColors[order.paymentStatus as keyof typeof paymentStatusColors]}
                                                >
                                                    {order.paymentStatus}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {format(new Date(order.createdAt), "MMM d, yyyy")}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setSelectedOrder(order)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(undefined)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Order #{selectedOrder?.id}</DialogTitle>
                        <DialogDescription>
                            {selectedOrder && `Placed on ${format(new Date(selectedOrder.createdAt), "MMMM d, yyyy 'at' h:mm a")}`}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedOrder && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Customer</p>
                                    <p className="font-medium">{selectedOrder.customerName}</p>
                                    <p className="text-sm text-muted-foreground">{selectedOrder.customerEmail}</p>
                                    <p className="text-sm text-muted-foreground">{selectedOrder.customerPhone}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Order Details</p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">Status:</span>
                                        <Badge variant="secondary" className={statusColors[selectedOrder.status as keyof typeof statusColors]}>
                                            {selectedOrder.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">Payment:</span>
                                        <Badge variant="secondary" className={paymentStatusColors[selectedOrder.paymentStatus as keyof typeof paymentStatusColors]}>
                                            {selectedOrder.paymentStatus}
                                        </Badge>
                                    </div>
                                    <p className="text-sm">Method: {selectedOrder.paymentMethod}</p>
                                </div>
                            </div>

                            {selectedOrder.pickupDate && (
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Pickup Date</p>
                                    <p>{format(new Date(selectedOrder.pickupDate), "MMMM d, yyyy 'at' h:mm a")}</p>
                                </div>
                            )}

                            {selectedOrder.notes && (
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">Notes</p>
                                    <p className="text-sm">{selectedOrder.notes}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Total</p>
                                <p className="text-2xl font-bold">${(selectedOrder.totalAmount / 100).toFixed(2)}</p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
