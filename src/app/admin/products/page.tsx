"use client";

import { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Plus, Trash2, Loader2, ArrowLeft, Home } from "lucide-react";
import { toast } from "sonner";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Product } from "@/db/schema";
import { Switch } from "@/components/ui/switch";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminProductsPage() {
    const router = useRouter();
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [deleteProduct, setDeleteProduct] = useState<Product | undefined>();

    const { data: products, isLoading, mutate } = useSWR<Product[]>('/api/admin/products', fetcher);

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setSelectedProduct(undefined);
        setIsFormOpen(true);
    };

    const handleDelete = (product: Product) => {
        setDeleteProduct(product);
    };

    const confirmDelete = async () => {
        if (!deleteProduct) return;

        try {
            const response = await fetch(`/api/admin/products/${deleteProduct.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete product');
            }

            toast.success("Product deleted successfully");
            mutate(); // Revalidate the products list
            setDeleteProduct(undefined);
        } catch (error) {
            toast.error("Failed to delete product");
        }
    };

    const toggleAvailability = async (product: Product) => {
        try {
            const response = await fetch(`/api/admin/products/${product.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    available: product.available === 1 ? 0 : 1,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update product');
            }

            toast.success("Product availability updated");
            mutate(); // Revalidate the products list
        } catch (error) {
            toast.error("Failed to update product");
        }
    };

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
                    <h2 className="text-3xl font-bold tracking-tight">Products</h2>
                    <p className="text-muted-foreground">
                        Manage your bakery products and inventory
                    </p>
                </div>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Products</CardTitle>
                    <CardDescription>
                        {products?.length || 0} products in total
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : !products || products.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No products found. Create your first product to get started.
                        </div>
                    ) : (
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[80px]">Image</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Category</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Available</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                                                    {product.imageUrl ? (
                                                        <img
                                                            src={product.imageUrl}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground">No img</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{product.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">{product.category}</Badge>
                                            </TableCell>
                                            <TableCell>${(product.price / 100).toFixed(2)}</TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={product.available === 1}
                                                    onCheckedChange={() => toggleAvailability(product)}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(product)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(product)}
                                                    >
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <ProductForm
                product={selectedProduct}
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onSuccess={() => mutate()}
            />

            <AlertDialog open={!!deleteProduct} onOpenChange={(open) => !open && setDeleteProduct(undefined)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete "{deleteProduct?.name}". This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
