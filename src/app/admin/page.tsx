"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminDashboard() {
    const { data: products } = useSWR('/api/admin/products', fetcher);
    const { data: orders } = useSWR('/api/admin/orders', fetcher);

    const totalProducts = products?.length || 0;
    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum: number, order: any) => sum + (order.totalAmount || 0), 0) || 0;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                    Overview of your bakery operations
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            Active products in catalog
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        <p className="text-xs text-muted-foreground">
                            All time orders
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${(totalRevenue / 100).toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground">
                            All time revenue
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Customers</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalOrders}</div>
                        <p className="text-xs text-muted-foreground">
                            Unique orders placed
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!orders || orders.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No orders yet</p>
                        ) : (
                            <div className="space-y-4">
                                {orders.slice(0, 5).map((order: any) => (
                                    <div key={order.id} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">{order.customerName}</p>
                                            <p className="text-xs text-muted-foreground">{order.customerEmail}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">${(order.totalAmount / 100).toFixed(2)}</p>
                                            <p className="text-xs text-muted-foreground">{order.status}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Popular Products</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!products || products.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No products yet</p>
                        ) : (
                            <div className="space-y-4">
                                {products.slice(0, 5).map((product: any) => (
                                    <div key={product.id} className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium">{product.name}</p>
                                            <p className="text-xs text-muted-foreground">{product.category}</p>
                                        </div>
                                        <p className="text-sm font-medium">${(product.price / 100).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
