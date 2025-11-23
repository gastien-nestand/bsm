import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Link, useLocation } from "wouter";
import LanguageToggle from "@/components/LanguageToggle";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type CartItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
};

export default function Checkout() {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const state = (window.history.state as { cart?: CartItem[] }) || {};
  const cart = state.cart || [];

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    pickupDate: "",
    notes: "",
    paymentMethod: "pickup" as "online" | "pickup",
  });

  const createOrderMutation = trpc.order.create.useMutation({
    onSuccess: (data) => {
      toast.success(t('toast.orderSuccess'));
      setLocation("/order-confirmation", { state: { orderId: data.orderId } });
    },
    onError: (error) => {
      toast.error(error.message || t('toast.orderError'));
    },
  });

  const createCheckoutSessionMutation = trpc.payment.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.sessionUrl) {
        toast.info(t('toast.redirectingToPayment'));
        window.open(data.sessionUrl, '_blank');
      }
    },
    onError: (error) => {
      toast.error(error.message || t('toast.paymentError'));
    },
  });

  const cartTotal = cart.reduce((sum: number, item: CartItem) => sum + item.price * item.quantity, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error(t('toast.cartEmpty'));
      return;
    }

    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      toast.error(t('toast.fillFields'));
      return;
    }

    const orderData = {
      customerName: formData.customerName,
      customerEmail: formData.customerEmail,
      customerPhone: formData.customerPhone,
      pickupDate: formData.pickupDate,
      notes: formData.notes,
      items: cart.map((item: CartItem) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    };

    if (formData.paymentMethod === "online") {
      // Create Stripe checkout session
      createCheckoutSessionMutation.mutate(orderData);
    } else {
      // Create order with pay at pickup
      createOrderMutation.mutate({
        ...orderData,
        paymentMethod: "pickup",
      });
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <nav className="bg-primary text-primary-foreground shadow-md">
          <div className="container py-4 flex items-center justify-between">
            <Link href="/">
              <img 
                src="https://placehold.co/150x50/8B4513/FFFFFF?text=Logo" 
                alt="Boulangerie Saint Marc" 
                className="h-12 cursor-pointer"
              />
            </Link>
            <LanguageToggle />
          </div>
        </nav>
        <main className="flex-1 flex items-center justify-center bg-background">
          <Card className="max-w-md bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>{t('checkout.cartEmpty')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{t('checkout.cartEmptyText')}</p>
              <Link href="/products">
                <Button className="w-full bg-primary text-primary-foreground">{t('checkout.browseProducts')}</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-primary text-primary-foreground shadow-md">
        <div className="container py-4 flex items-center justify-between">
          <Link href="/">
            <img 
              src="https://placehold.co/150x50/8B4513/FFFFFF?text=Logo" 
              alt="Boulangerie Saint Marc" 
              className="h-12 cursor-pointer"
            />
          </Link>
          <LanguageToggle />
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 py-12 bg-background">
        <div className="container max-w-4xl">
          <h2 className="text-4xl font-bold mb-8 text-foreground">{t('checkout.title')}</h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Order Form */}
            <Card className="bg-card text-card-foreground">
              <CardHeader>
                <CardTitle>{t('checkout.yourInfo')}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="customerName">{t('checkout.fullName')} {t('checkout.required')}</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      required
                      className="bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerEmail">{t('checkout.email')} {t('checkout.required')}</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      required
                      className="bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customerPhone">{t('checkout.phone')} {t('checkout.required')}</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      required
                      className="bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <Label htmlFor="pickupDate">{t('checkout.pickupDate')}</Label>
                    <Input
                      id="pickupDate"
                      type="date"
                      value={formData.pickupDate}
                      onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                      className="bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">{t('checkout.notes')}</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder={t('checkout.notesPlaceholder')}
                      className="bg-background text-foreground"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>{t('checkout.paymentMethod')}</Label>
                    <RadioGroup
                      value={formData.paymentMethod}
                      onValueChange={(value) => setFormData({ ...formData, paymentMethod: value as "online" | "pickup" })}
                      className="space-y-2"
                    >
                      <div className="flex items-center space-x-2 border border-border rounded-lg p-4 cursor-pointer hover:bg-accent">
                        <RadioGroupItem value="online" id="online" />
                        <Label htmlFor="online" className="cursor-pointer flex-1">
                          <div>
                            <div className="font-semibold">{t('checkout.payOnline')}</div>
                            <div className="text-sm text-muted-foreground">{t('checkout.payOnlineDesc')}</div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 border border-border rounded-lg p-4 cursor-pointer hover:bg-accent">
                        <RadioGroupItem value="pickup" id="pickup" />
                        <Label htmlFor="pickup" className="cursor-pointer flex-1">
                          <div>
                            <div className="font-semibold">{t('checkout.payAtPickup')}</div>
                            <div className="text-sm text-muted-foreground">{t('checkout.payAtPickupDesc')}</div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={createOrderMutation.isPending || createCheckoutSessionMutation.isPending}
                  >
                    {(createOrderMutation.isPending || createCheckoutSessionMutation.isPending)
                      ? t('checkout.processing')
                      : formData.paymentMethod === "online"
                      ? t('checkout.proceedToPayment')
                      : t('checkout.placeOrder')}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card className="bg-card text-card-foreground h-fit">
              <CardHeader>
                <CardTitle>{t('checkout.orderSummary')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cart.map((item: CartItem) => (
                    <div key={item.productId} className="flex justify-between items-start border-b border-border pb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          ${(item.price / 100).toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">${((item.price * item.quantity) / 100).toFixed(2)}</p>
                    </div>
                  ))}
                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between text-xl font-bold">
                      <span>{t('products.total')}:</span>
                      <span className="text-primary">${(cartTotal / 100).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="pt-4 text-sm text-muted-foreground">
                    <p>{t('checkout.paymentNote')}</p>
                    <p>{t('checkout.confirmNote')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-background py-8">
        <div className="container text-center">
          <p className="text-sm">
            © 2024 Boulangerie Saint Marc. Authentic Haitian Bakery in Brockton, MA.
          </p>
        </div>
      </footer>
    </div>
  );
}
