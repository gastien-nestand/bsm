"use client";

import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/DashboardLayout";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const loading = status === "loading";

    useEffect(() => {
        if (!loading) {
            if (!session?.user) {
                router.push("/login");
            } else if (session.user.role !== "admin") {
                router.push("/");
            }
        }
    }, [session, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!session?.user || session.user.role !== "admin") {
        return null;
    }

    return <DashboardLayout>{children}</DashboardLayout>;
}
