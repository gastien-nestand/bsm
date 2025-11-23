import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import { Link } from 'wouter';
import LanguageToggle from './LanguageToggle';

export default function MobileNav() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: '/', label: t('nav.home') },
    { href: '/products', label: t('nav.products') },
    { href: '/admin', label: t('nav.admin') },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden text-primary-foreground hover:bg-primary-foreground/10"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <SheetHeader className="sr-only">
          <SheetTitle>{t('nav.menu')}</SheetTitle>
          <SheetDescription>Navigation menu</SheetDescription>
        </SheetHeader>
        <nav className="flex flex-col gap-4 mt-8">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className="w-full justify-start text-lg"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Button>
            </Link>
          ))}
          <div className="mt-4 pt-4 border-t">
            <LanguageToggle />
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
