"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CheckoutClient() {
    const { t } = useTranslation();
    const router = useRouter();
    const { data: session } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: cart, isLoading: cartLoading } = useSWR(
        session?.user ? '/api/cart' : null,
        fetcher
    );

    const [formData, setFormData] = useState({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        pickupDate: "",
        notes: "",
    });

    // Update form data when session loads
    useEffect(() => {
        if (session?.user) {
            setFormData(prev => ({
                ...prev,
                customerName: session.user?.name || "",
                customerEmail: session.user?.email || "",
            }));
        }
    }, [session]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!cart || !cart.items || cart.items.length === 0) {
            toast.error(t("toast.cartEmpty"));
            return;
        }

        if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
            toast.error(t("toast.fillFields"));
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    customerName: formData.customerName,
                    customerEmail: formData.customerEmail,
                    customerPhone: formData.customerPhone,
                    pickupDate: formData.pickupDate || undefined,
                    notes: formData.notes || undefined,
                    paymentMethod: "pickup",
                    items: cart.items.map((item: any) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                    })),
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create order');
            }

            const data = await response.json();
            toast.success(t("toast.orderSuccess"));
            router.push(`/order-confirmation?orderId=${data.orderId}`);
        } catch (error) {
            console.error(error);
            toast.error(t("toast.orderError"));
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    if (!session?.user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle>{t("admin.loginRequired")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">{t("admin.loginText")}</p>
                        <Button asChild className="w-full">
                            <Link href="/login">{t("admin.login")}</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (cartLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!cart || !cart.items || cart.items.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle>{t("checkout.cartEmpty")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">{t("checkout.cartEmptyText")}</p>
                        <Button asChild className="w-full">
                            <Link href="/products">{t("checkout.browseProducts")}</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const totalAmount = cart.items.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
    );

    return (
        <div className="min-h-screen bg-muted/30 py-12">
            <Link href="/products" className="fixed top-4 left-4 z-50">
                <Button variant="ghost" size="sm">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Products
                </Button>
            </Link>
            <div className="container max-w-6xl">
                <h1 className="text-4xl font-bold mb-8">{t("checkout.title")}</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Order Form */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>{t("checkout.yourInfo")}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="customerName">
                                            {t("checkout.fullName")} <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="customerName"
                                            name="customerName"
                                            type="text"
                                            value={formData.customerName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="customerEmail">
                                            {t("checkout.email")} <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="customerEmail"
                                            name="customerEmail"
                                            type="email"
                                            value={formData.customerEmail}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="customerPhone">
                                            {t("checkout.phone")} <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="customerPhone"
                                            name="customerPhone"
                                            type="tel"
                                            value={formData.customerPhone}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="pickupDate">{t("checkout.pickupDate")}</Label>
                                        <Input
                                            id="pickupDate"
                                            name="pickupDate"
                                            type="datetime-local"
                                            value={formData.pickupDate}
                                            onChange={handleChange}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="notes">{t("checkout.notes")}</Label>
                                        <Textarea
                                            id="notes"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            placeholder={t("checkout.notesPlaceholder")}
                                            rows={4}
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        size="lg"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                {t("checkout.placingOrder")}
                                            </>
                                        ) : (
                                            <>
                                                <ShoppingCart className="mr-2 h-5 w-5" />
                                                {t("checkout.placeOrder")}
                                            </>
                                        )}
                                    </Button>

                                    <p className="text-sm text-muted-foreground text-center">
                                        {t("checkout.paymentNote")}
                                        <br />
                                        {t("checkout.confirmNote")}
                                    </p>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div>
                        <Card className="sticky top-8">
                            <CardHeader>
                                <CardTitle>{t("checkout.orderSummary")}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {cart.items.map((item: any) => (
                                    <div key={item.id} className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.quantity} × ${(item.price / 100).toFixed(2)}
                                            </p>
                                        </div>
                                        <p className="font-semibold">
                                            ${((item.price * item.quantity) / 100).toFixed(2)}
                                        </p>
                                    </div>
                                ))}

                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <span>{t("products.total")}</span>
                                        <span>${(totalAmount / 100).toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
