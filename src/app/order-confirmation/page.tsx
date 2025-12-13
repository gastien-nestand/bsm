"use client";

import { Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Home, ShoppingBag } from "lucide-react";
import Link from "next/link";

function OrderConfirmationContent() {
    const { t } = useTranslation();
    const searchParams = useSearchParams();
    const [orderId, setOrderId] = useState<string | null>(null);

    useEffect(() => {
        if (searchParams) {
            const id = searchParams.get("orderId");
            setOrderId(id);
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Card className="max-w-2xl w-full">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <div className="rounded-full bg-green-100 p-3">
                            <CheckCircle2 className="h-16 w-16 text-green-600" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl">{t("confirmation.title")}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {orderId && (
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground mb-1">
                                {t("confirmation.orderNumber")}
                            </p>
                            <p className="text-2xl font-bold">#{orderId}</p>
                        </div>
                    )}

                    <div>
                        <h3 className="font-semibold text-lg mb-3">{t("confirmation.whatNext")}</h3>
                        <ol className="space-y-3 list-decimal list-inside text-muted-foreground">
                            <li>{t("confirmation.step1")}</li>
                            <li>{t("confirmation.step2")}</li>
                            <li>{t("confirmation.step3")}</li>
                            <li>{t("confirmation.step4")}</li>
                        </ol>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">{t("confirmation.questions")}</h4>
                        <p className="text-sm text-muted-foreground">
                            {t("confirmation.questionsText")}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                        <Button asChild className="flex-1">
                            <Link href="/products">
                                <ShoppingBag className="mr-2 h-5 w-5" />
                                {t("confirmation.orderMore")}
                            </Link>
                        </Button>
                        <Button asChild variant="outline" className="flex-1">
                            <Link href="/">
                                <Home className="mr-2 h-5 w-5" />
                                {t("confirmation.returnHome")}
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
                <Card className="max-w-2xl w-full">
                    <CardContent className="p-8 text-center">
                        <p className="text-muted-foreground">Loading...</p>
                    </CardContent>
                </Card>
            </div>
        }>
            <OrderConfirmationContent />
        </Suspense>
    );
}
