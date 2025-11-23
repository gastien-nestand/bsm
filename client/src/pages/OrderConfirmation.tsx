import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function OrderConfirmation() {
  const state = (window.history.state as { orderId?: number }) || {};
  const orderId = state.orderId;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-primary text-primary-foreground shadow-md">
        <div className="container py-4">
          <Link href="/">
            <h1 className="text-2xl font-bold cursor-pointer">Boulangerie Saint Marc</h1>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 bg-background">
        <Card className="max-w-2xl w-full mx-4 bg-card text-card-foreground">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl">Order Confirmed!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {orderId && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Your Order Number</p>
                <p className="text-2xl font-bold text-primary">#{orderId}</p>
              </div>
            )}

            <div className="space-y-3 text-left">
              <h3 className="font-semibold text-lg">What happens next?</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span>We will review your order and confirm availability</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span>You will receive a confirmation call or email within 24 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span>Your fresh bread will be ready for pickup at your scheduled time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <span>Payment will be collected when you pick up your order</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 space-y-3">
              <Link href="/products">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Order More
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  Return to Home
                </Button>
              </Link>
            </div>

            <div className="pt-4 text-sm text-muted-foreground">
              <p>Questions about your order?</p>
              <p>Contact us and mention your order number.</p>
            </div>
          </CardContent>
        </Card>
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
