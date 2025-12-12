"use client";

import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "@/i18n";
import { SessionProvider } from "next-auth/react";
import { SWRConfig } from "swr";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <SWRConfig
                value={{
                    fetcher: (url: string) => fetch(url).then(res => res.json()),
                    revalidateOnFocus: false,
                }}
            >
                <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
                    <TooltipProvider>
                        {children}
                        <Toaster />
                    </TooltipProvider>
                </ThemeProvider>
            </SWRConfig>
        </SessionProvider>
    );
}
