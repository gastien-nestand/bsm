"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Plus, Minus, ShoppingCart, Home } from "lucide-react";
import Link from "next/link";
import MobileNav from "@/components/MobileNav";
import type { Product } from "@/db/schema";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function ProductsClient({ products }: { products: Product[] }) {
    const { t } = useTranslation();
    const { data: session } = useSession();
    const [selectedCategory, setSelectedCategory] = useState<string>("All");
    const [cartQuantities, setCartQuantities] = useState<Record<number, number>>({});
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    // Fetch cart data using SWR
    const { data: cart, mutate: mutateCart } = useSWR(
        session?.user ? '/api/cart' : null,
        fetcher
    );

    // Get unique categories
    const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

    // Filter products by category
    const filteredProducts = products.filter((product) => {
        if (selectedCategory === "All") return product.available === 1;
        return product.category === selectedCategory && product.available === 1;
    });

    // Calculate total cart items
    const cartItemCount = cart?.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

    const handleAddToCart = async (productId: number) => {
        if (!session?.user) {
            toast.error("Please login to add items to cart");
            window.location.href = "/login";
            return;
        }

        setIsAddingToCart(true);
        try {
            const quantity = cartQuantities[productId] || 1;
            const response = await fetch('/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productId, quantity }),
            });

            if (!response.ok) {
                throw new Error('Failed to add to cart');
            }

            // Refresh cart data
            await mutateCart();
            toast.success(t("products.addedToCart"));
            setCartQuantities({ ...cartQuantities, [productId]: 1 }); // Reset to 1 after adding
        } catch (error) {
            toast.error("Failed to add to cart");
            console.error(error);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const updateQuantity = (productId: number, delta: number) => {
        const current = cartQuantities[productId] || 1;
        const newQty = Math.max(1, Math.min(99, current + delta));
        setCartQuantities({ ...cartQuantities, [productId]: newQty });
    };

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Navigation - Dark Brown Header */}
            <nav style={{ backgroundColor: 'var(--header-bg)' }} className="text-white shadow-md relative z-50">
                <div className="container py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/">
                            <img
                                src="/logo.jpg"
                                alt="Boulangerie Saint Marc"
                                className="h-16 cursor-pointer"
                            />
                        </Link>
                        {/* Desktop Navigation */}
                        <div className="hidden md:flex gap-4 items-center">
                            <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
                                <Link href="/">
                                    <Home className="mr-2 h-5 w-5" />
                                    {t("nav.home")}
                                </Link>
                            </Button>
                            <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
                                <Link href="/admin">{t("nav.admin")}</Link>
                            </Button>
                            {session?.user && (
                                <Button
                                    className="relative bg-primary hover:bg-primary/90 text-white"
                                    asChild
                                >
                                    <Link href="/checkout">
                                        <ShoppingCart className="h-5 w-5 mr-2" />
                                        {t("products.cart")}
                                        {cartItemCount > 0 && (
                                            <Badge className="absolute -top-2 -right-2 rounded-full px-2 py-0.5 text-xs bg-white text-primary">
                                                {cartItemCount}
                                            </Badge>
                                        )}
                                    </Link>
                                </Button>
                            )}
                        </div>
                        {/* Mobile Navigation */}
                        <MobileNav />
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 py-12">
                <div className="container max-w-7xl mx-auto px-4">
                    <h1 className="text-4xl font-bold mb-8 text-foreground">Our Products</h1>

                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap gap-3 mb-10">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-6 py-2 rounded-full font-medium transition-all ${selectedCategory === category
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-white text-foreground border border-border hover:border-primary/50'
                                    }`}
                            >
                                {category === "All" ? t("products.all") : category}
                            </button>
                        ))}
                    </div>

                    {/* Products Grid with Proper Spacing */}
                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-16">
                            <ShoppingBag className="h-20 w-20 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground text-lg">{t("products.noProducts")}</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {filteredProducts.map((product) => {
                                const quantity = cartQuantities[product.id] || 1;
                                return (
                                    <Card key={product.id} className="flex flex-col overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                                        <div className="aspect-[4/3] overflow-hidden bg-muted">
                                            {product.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ShoppingBag className="h-20 w-20 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between gap-2">
                                                <h3 className="font-semibold text-lg text-foreground leading-tight">
                                                    {product.name}
                                                </h3>
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-orange-100 text-orange-800 border-0 shrink-0"
                                                >
                                                    {product.category}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1 pt-0">
                                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                                {product.description}
                                            </p>
                                            <p className="text-2xl font-bold text-primary">
                                                ${(product.price / 100).toFixed(2)}
                                            </p>
                                        </CardContent>
                                        <CardFooter className="flex flex-col gap-3 pt-0">
                                            {/* Quantity Selector */}
                                            <div className="flex items-center justify-center gap-4 w-full">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => updateQuantity(product.id, -1)}
                                                    disabled={quantity <= 1}
                                                    className="h-9 w-9 rounded-full"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                                <span className="text-lg font-semibold min-w-[3ch] text-center">
                                                    {quantity}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => updateQuantity(product.id, 1)}
                                                    disabled={quantity >= 99}
                                                    className="h-9 w-9 rounded-full"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            {/* Add to Cart Button */}
                                            <Button
                                                className="w-full bg-primary hover:bg-primary/90 text-white font-medium shadow-sm"
                                                onClick={() => handleAddToCart(product.id)}
                                                disabled={isAddingToCart}
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Add to Cart
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-foreground text-background py-8 mt-auto">
                <div className="container text-center">
                    <p className="text-sm">{t("footer.copyright")}</p>
                </div>
            </footer>
        </div>
    );
}
