"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Product } from "@/db/schema";
import ImageUpload from "@/components/ImageUpload";

const productSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    price: z.string().min(1, "Price is required"),
    category: z.string().min(1, "Category is required"),
    imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    available: z.string(),
});

type ProductFormValues = z.infer<typeof productSchema>;

const categories = ["Bread", "Pastries", "Cakes", "Desserts", "Specialty"];

interface ProductFormProps {
    product?: Product;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function ProductForm({ product, open, onOpenChange, onSuccess }: ProductFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const isEditing = !!product;

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: "",
            description: "",
            price: "",
            category: "",
            imageUrl: "",
            available: "1",
        },
    });

    // Reset form when product changes or dialog opens
    useEffect(() => {
        if (open) {
            if (product) {
                form.reset({
                    name: product.name || "",
                    description: product.description || "",
                    price: (product.price / 100).toFixed(2),
                    category: product.category || "",
                    imageUrl: product.imageUrl || "",
                    available: String(product.available),
                });
            } else {
                form.reset({
                    name: "",
                    description: "",
                    price: "",
                    category: "",
                    imageUrl: "",
                    available: "1",
                });
            }
        }
    }, [product, open, form]);

    const onSubmit = async (data: ProductFormValues) => {
        setIsLoading(true);

        try {
            const priceInCents = Math.round(parseFloat(data.price) * 100);
            const productData = {
                name: data.name,
                description: data.description || undefined,
                price: priceInCents,
                category: data.category,
                imageUrl: data.imageUrl || undefined,
                available: parseInt(data.available),
            };

            const url = isEditing
                ? `/api/admin/products/${product.id}`
                : '/api/admin/products';

            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productData),
            });

            if (!response.ok) {
                throw new Error('Failed to save product');
            }

            toast.success(isEditing ? "Product updated successfully" : "Product created successfully");
            onOpenChange(false);
            form.reset();
            onSuccess?.();
        } catch (error) {
            toast.error("Failed to save product");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Product" : "Create Product"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update the product information below."
                            : "Fill in the details to create a new product."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Croissant" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="A delicious buttery pastry..."
                                            className="resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price (USD)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                placeholder="3.50"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>Enter price in dollars</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map((cat) => (
                                                    <SelectItem key={cat} value={cat}>
                                                        {cat}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="imageUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Image</FormLabel>
                                    <FormControl>
                                        <ImageUpload
                                            value={field.value}
                                            onChange={field.onChange}
                                            onRemove={() => field.onChange("")}
                                        />
                                    </FormControl>
                                    <FormDescription>Upload a product image (max 5MB)</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="available"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Availability</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="1">Available</SelectItem>
                                            <SelectItem value="0">Out of Stock</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                            >
                                {isEditing ? "Update" : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
