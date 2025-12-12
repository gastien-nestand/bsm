"use client";

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    const languages = ['en', 'fr', 'ht'];
    const currentIndex = languages.indexOf(i18n.language);
    const nextIndex = (currentIndex + 1) % languages.length;
    const newLang = languages[nextIndex];
    i18n.changeLanguage(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', newLang);
    }
  };

  const getLanguageLabel = () => {
    switch (i18n.language) {
      case 'en': return 'EN';
      case 'fr': return 'FR';
      case 'ht': return 'HT';
      default: return 'EN';
    }
  };

  // Don't render on server to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="text-primary-foreground hover:bg-primary-foreground/10 flex items-center gap-2"
      >
        <Languages className="h-4 w-4" />
        <span className="font-medium">EN</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="text-primary-foreground hover:bg-primary-foreground/10 flex items-center gap-2"
    >
      <Languages className="h-4 w-4" />
      <span className="font-medium">{getLanguageLabel()}</span>
    </Button>
  );
}
