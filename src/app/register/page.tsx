"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to login page
        router.push("/login");
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Redirecting...</CardTitle>
                    <CardDescription>
                        Please use the login page to sign in
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </CardContent>
            </Card>
        </div>
    );
}
