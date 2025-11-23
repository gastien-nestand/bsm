import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, MapPin, Clock, Phone, Plus } from "lucide-react";
import { Link } from "wouter";
import LanguageToggle from "@/components/LanguageToggle";
import MobileNav from "@/components/MobileNav";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { t } = useTranslation();
  const { data: products } = trpc.products.list.useQuery();

  // Get featured products (first 3 available products)
  const featuredProducts = products?.filter(p => p.available === 1).slice(0, 3) || [];

  // Get special/new products (products with "special" or "new" in description or last 2 products)
  const specialProducts = products?.filter(p => p.available === 1).slice(-2) || [];

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
              <Link href="/products">
                <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">
                  {t('nav.products')}
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10">
                  {t('nav.admin')}
                </Button>
              </Link>
            </div>
            {/* Mobile Navigation */}
            <MobileNav />
          </div>
        </div>
      </nav>

      {/* Header Image */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30 z-10" />
        <img
          src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80"
          alt="Fresh bread and traditional Haitian drinks"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex items-center justify-center">
          <div className="container text-center text-white">
            <h2 className="text-4xl md:text-6xl font-bold mb-4">{t('home.hero.title')}</h2>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/products">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  {t('home.hero.orderNow')}
                </Button>
              </Link>
              <Link href="/products">
                <Button size="lg" variant="outline" className="bg-white/90 text-foreground hover:bg-white">
                  {t('home.hero.viewMenu')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Special/New Products */}
      {specialProducts.length > 0 && (
        <section className="py-16 bg-secondary">
          <div className="container">
            <h3 className="text-3xl font-bold text-center mb-12">{t('home.special.title')}</h3>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {specialProducts.map((product) => (
                <Card key={product.id} className="bg-card text-card-foreground">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 aspect-square bg-muted">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="md:w-2/3 p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-xl font-bold">{product.name}</h4>
                        <Badge variant="default">New</Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">{product.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">
                          ${(product.price / 100).toFixed(2)}
                        </span>
                        <Link href="/products">
                          <Button size="sm" className="bg-primary text-primary-foreground">
                            {t('home.hero.orderNow')}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}


      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container">
          <h3 className="text-3xl font-bold text-center mb-12">{t('home.whyChoose.title')}</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-card text-card-foreground">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">{t('home.whyChoose.preorders.title')}</h4>
                  <p className="text-muted-foreground">
                    {t('home.whyChoose.preorders.desc')}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">{t('home.whyChoose.fresh.title')}</h4>
                  <p className="text-muted-foreground">
                    {t('home.whyChoose.fresh.desc')}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card text-card-foreground">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2">{t('home.whyChoose.local.title')}</h4>
                  <p className="text-muted-foreground">
                    {t('home.whyChoose.local.desc')}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-16 bg-background">
          <div className="container">
            <h3 className="text-3xl font-bold text-center mb-12">{t('home.featured.title')}</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="bg-card text-card-foreground">
                  <CardHeader>
                    <div className="aspect-square rounded-lg overflow-hidden mb-4 bg-muted">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardTitle className="text-xl">{product.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        ${(product.price / 100).toFixed(2)}
                      </span>
                      <Badge variant="secondary">{product.category}</Badge>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href="/products" className="w-full">
                      <Button className="w-full bg-primary text-primary-foreground">
                        <Plus className="mr-2 h-4 w-4" />
                        {t('products.addToCart')}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/products">
                <Button size="lg" variant="outline">
                  {t('home.hero.viewMenu')}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}


      {/* Store Information */}
      <section className="py-16 bg-muted">
        <div className="container">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-3xl font-bold text-center mb-8">{t('home.visit.title')}</h3>
            <Card className="bg-card text-card-foreground">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold">Location</h4>
                      <p className="text-muted-foreground">446 E Ashland St, Brockton, MA 02302</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold">Hours</h4>
                      <p className="text-muted-foreground">Mon-Fri: 7:00 AM - 7:00 PM</p>
                      <p className="text-muted-foreground">Sat: 8:00 AM - 7:00 PM</p>
                      <p className="text-muted-foreground">Sun: 8:00 AM - 4:00 PM</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <h4 className="font-semibold">Contact</h4>
                      <p className="text-muted-foreground">508-857-1883</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-foreground text-background py-8 mt-auto">
        <div className="container text-center">
          <p className="text-sm">
            {t('footer.copyright')}
          </p>
        </div>
      </footer>
    </div>
  );
}
