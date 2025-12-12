import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const utils = trpc.useUtils();

    const loginMutation = trpc.auth.login.useMutation({
        onSuccess: async (data) => {
            toast.success("Logged in successfully!");
            await utils.auth.me.invalidate();
            // Use window.location for reliable redirect
            if (data.user.role === "admin") {
                window.location.href = "/admin";
            } else {
                window.location.href = "/products";
            }
        },
        onError: (error) => {
            toast.error(error.message || "Login failed");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate({ email, password });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Card className="w-full max-w-md bg-card text-card-foreground">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Login</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-background text-foreground"
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-background text-foreground"
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full bg-primary text-primary-foreground"
                            disabled={loginMutation.isPending}
                        >
                            {loginMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Logging in...
                                </>
                            ) : (
                                "Login"
                            )}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link href="/register">
                            <a className="text-primary hover:underline">Register</a>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
