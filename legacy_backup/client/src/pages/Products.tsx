import { useState, useMemo } from "react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import LanguageToggle from "@/components/LanguageToggle";
import MobileNav from "@/components/MobileNav";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type CartItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
};

export default function Products() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const { data: user } = trpc.auth.me.useQuery();
  const { data: products, isLoading } = trpc.products.list.useQuery();
  const { data: backendCart } = trpc.cart.get.useQuery(undefined, {
    enabled: !!user,
  });

  const utils = trpc.useUtils();

  const addToCartMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
    },
  });

  const updateCartMutation = trpc.cart.update.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
    },
  });

  const removeFromCartMutation = trpc.cart.remove.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
    },
  });

  // Sync backend cart to local state for display
  React.useEffect(() => {
    if (backendCart?.items) {
      setCart(
        backendCart.items.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        }))
      );
    }
  }, [backendCart]);

  const categories = useMemo(() => {
    if (!products) return ["All"];
    const cats = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (selectedCategory === "All") return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  const addToCart = (product: { id: number; name: string; price: number }) => {
    if (user) {
      // Use backend cart for authenticated users
      addToCartMutation.mutate({ productId: product.id, quantity: 1 });
    } else {
      // Use local cart for guests
      setCart((prev) => {
        const existing = prev.find((item) => item.productId === product.id);
        if (existing) {
          return prev.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
      });
    }
    toast.success(t('products.addedToCart'));
  };

  const updateQuantity = (productId: number, delta: number) => {
    if (user) {
      const item = cart.find((i) => i.productId === productId);
      if (item) {
        const newQuantity = item.quantity + delta;
        updateCartMutation.mutate({ productId, quantity: newQuantity });
      }
    } else {
      setCart((prev) => {
        return prev
          .map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + delta }
              : item
          )
          .filter((item) => item.quantity > 0);
      });
    }
  };

  const removeFromCart = (productId: number) => {
    if (user) {
      removeFromCartMutation.mutate({ productId });
    } else {
      setCart((prev) => prev.filter((item) => item.productId !== productId));
    }
    toast.success(t('products.removedFromCart'));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error(t('toast.cartEmpty'));
      return;
    }
    // Pass cart data to checkout page via state
    setLocation("/checkout", { state: { cart } });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-primary text-primary-foreground shadow-md relative z-50">
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
            <div className="hidden md:flex gap-4 items-center">
              <LanguageToggle />
              <Link href="/">
                <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">
                  {t('nav.home')}
                </Button>
              </Link>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="relative bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center bg-secondary text-secondary-foreground">
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-card text-card-foreground">
                  <SheetHeader>
                    <SheetTitle>{t('products.cart')}</SheetTitle>
                    <SheetDescription>{t('products.cartReview')}</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {cart.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">{t('products.cartEmpty')}</p>
                    ) : (
                      <>
                        {cart.map((item) => (
                          <div key={item.productId} className="flex items-center justify-between border-b border-border pb-4">
                            <div className="flex-1">
                              <h4 className="font-semibold">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">${(item.price / 100).toFixed(2)} each</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.productId, -1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-semibold">{item.quantity}</span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.productId, 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive"
                                onClick={() => removeFromCart(item.productId)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <div className="pt-4 border-t border-border">
                          <div className="flex justify-between text-lg font-bold mb-4">
                            <span>{t('products.total')}:</span>
                            <span>${(cartTotal / 100).toFixed(2)}</span>
                          </div>
                          <Button className="w-full bg-primary text-primary-foreground" onClick={handleCheckout}>
                            {t('products.checkout')}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            {/* Mobile Navigation */}
            <div className="flex md:hidden gap-2 items-center">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="relative bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-secondary text-secondary-foreground text-xs">
                        {cartItemCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent className="bg-card text-card-foreground">
                  <SheetHeader>
                    <SheetTitle>{t('products.cart')}</SheetTitle>
                    <SheetDescription>{t('products.cartReview')}</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    {cart.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">{t('products.cartEmpty')}</p>
                    ) : (
                      <>
                        {cart.map((item) => (
                          <div key={item.productId} className="flex items-center justify-between border-b border-border pb-4">
                            <div className="flex-1">
                              <h4 className="font-semibold">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                ${(item.price / 100).toFixed(2)} {t('products.each')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.productId, -1)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">{item.quantity}</span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8"
                                onClick={() => updateQuantity(item.productId, 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive"
                                onClick={() => removeFromCart(item.productId)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <div className="pt-4 border-t border-border">
                          <div className="flex justify-between text-lg font-bold mb-4">
                            <span>{t('products.total')}:</span>
                            <span>${(cartTotal / 100).toFixed(2)}</span>
                          </div>
                          <Button className="w-full bg-primary text-primary-foreground" onClick={handleCheckout}>
                            {t('products.checkout')}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
              <MobileNav />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 py-12 bg-background">
        <div className="container">
          <h2 className="text-4xl font-bold mb-8 text-foreground">{t('products.title')}</h2>

          {/* Category Filter */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat ? "bg-primary text-primary-foreground" : ""}
              >
                {cat}
              </Button>
            ))}
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('products.loading')}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t('products.noProducts')}</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="bg-card text-card-foreground hover:shadow-lg transition-shadow">
                  <CardHeader>
                    {product.imageUrl && (
                      <div className="w-full h-48 bg-muted rounded-md mb-4 overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardTitle className="flex justify-between items-start">
                      <span>{product.name}</span>
                      <Badge variant="secondary" className="bg-accent text-accent-foreground">
                        {product.category}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{product.description}</p>
                    <p className="text-2xl font-bold mt-4 text-primary">
                      ${(product.price / 100).toFixed(2)}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                      onClick={() => addToCart(product)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      {t('products.addToCart')}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-background py-8">
        <div className="container text-center">
          <p className="text-sm">
            {t('footer.copyright')}
          </p>
        </div>
      </footer>
    </div>
  );
}
