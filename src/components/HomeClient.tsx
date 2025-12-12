"use client";

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, MapPin, Clock, Phone, Calendar } from "lucide-react";
import Link from "next/link";
import MobileNav from "@/components/MobileNav";
import type { Product } from "@/db/schema";

export default function HomeClient({ products }: { products: Product[] }) {
    const { t } = useTranslation();

    // Get special/new products (last 4 products)
    const specialProducts = products?.filter(p => p.available === 1).slice(-4) || [];

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Navigation - Dark Brown Header */}
            <nav style={{ backgroundColor: 'var(--header-bg)' }} className="text-white shadow-md relative z-50">
                <div className="container py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/">
                            <img
                                src="/logo.jpg"
                                alt="Boulangerie Saint Marc Bakery"
                                className="h-16 cursor-pointer"
                            />
                        </Link>
                        {/* Desktop Navigation */}
                        <div className="hidden md:flex gap-6 items-center">
                            <span className="text-white/80 text-sm">🇭🇹 EN</span>
                            <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
                                <Link href="/products">Products</Link>
                            </Button>
                            <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
                                <Link href="/admin">Admin</Link>
                            </Button>
                        </div>
                        {/* Mobile Navigation */}
                        <MobileNav />
                    </div>
                </div>
            </nav>

            {/* Hero Section with Background Image */}
            <section className="relative h-[500px] md:h-[600px] overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60 z-10" />
                <img
                    src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80"
                    alt="Fresh artisan bread"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                    <div className="container text-center text-white px-4">
                        <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
                            Boulangerie Saint Marc
                        </h1>
                        <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto drop-shadow-md leading-relaxed">
                            Experience the authentic taste of Haiti right here in Brockton, Massachusetts.
                            Our traditional recipes bring warmth and flavor to every loaf.
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <Button
                                size="lg"
                                className="bg-primary hover:bg-primary/90 text-white font-medium shadow-lg"
                                asChild
                            >
                                <Link href="/products">
                                    <Calendar className="mr-2 h-5 w-5" />
                                    Order Now
                                </Link>
                            </Button>
                            <Button
                                size="lg"

                                className="!bg-white text-black hover:bg-gray-100 border-0 shadow-lg font-medium"
                                asChild
                            >
                                <Link href="/products">
                                    View Menu
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* New & Special Section */}
            {specialProducts.length > 0 && (
                <section className="py-16 bg-background">
                    <div className="container max-w-7xl mx-auto px-4">
                        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-foreground">
                            New & Special
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {specialProducts.map((product) => (
                                <Card key={product.id} className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                                        {product.imageUrl ? (
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold text-lg mb-2 text-foreground">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                            {product.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xl font-bold text-primary">
                                                ${(product.price / 100).toFixed(2)}
                                            </span>
                                            <Button
                                                size="sm"
                                                className="bg-primary hover:bg-primary/90 text-white"
                                                asChild
                                            >
                                                <Link href="/products">Order</Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Why Choose Us Section */}
            <section className="py-16 bg-muted/30">
                <div className="container max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
                        Why Choose Us
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <Card className="bg-white shadow-sm">
                            <CardContent className="pt-8 pb-8">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShoppingBag className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3 text-foreground">
                                        Easy Pre-Orders
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Order ahead and pick up fresh bread at your convenience
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white shadow-sm">
                            <CardContent className="pt-8 pb-8">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Clock className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3 text-foreground">
                                        Fresh Daily
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Baked fresh every morning using traditional methods
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white shadow-sm">
                            <CardContent className="pt-8 pb-8">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <MapPin className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3 text-foreground">
                                        Local & Authentic
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Serving Brockton with authentic Haitian bakery traditions
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Store Information */}
            <section className="py-16 bg-background">
                <div className="container max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
                        Visit Us
                    </h2>
                    <div className="max-w-3xl mx-auto">
                        <Card className="bg-white shadow-md">
                            <CardContent className="pt-8 pb-8">
                                <div className="grid md:grid-cols-3 gap-8">
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                                            <MapPin className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="font-semibold mb-2 text-foreground">Location</h3>
                                        <p className="text-sm text-muted-foreground">
                                            446 E Ashland St<br />
                                            Brockton, MA 02302
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                                            <Clock className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="font-semibold mb-2 text-foreground">Hours</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Mon-Fri: 7AM - 7PM<br />
                                            Sat: 8AM - 7PM<br />
                                            Sun: 8AM - 4PM
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center text-center">
                                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                                            <Phone className="h-6 w-6 text-primary" />
                                        </div>
                                        <h3 className="font-semibold mb-2 text-foreground">Contact</h3>
                                        <p className="text-sm text-muted-foreground">
                                            508-857-1883
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ backgroundColor: 'var(--header-bg)' }} className="text-white py-8 mt-auto">
                <div className="container text-center">
                    <p className="text-sm text-white/80">
                        © 2024 Boulangerie Saint Marc. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
