
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu, Search, User, ShoppingCart, Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Logo } from '@/components/logo';
import { Input } from '@/components/ui/input';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { CATEGORY_BANNERS_KEY, CategoryBanners } from '@/app/admin/settings/page';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

const defaultBanners: CategoryBanners = {
    "Sale": {
        banner1: { title: 'Big Savings!', description: 'Up to 70% off on selected items.', imageUrl: 'https://placehold.co/800x800.png' },
        banner2: { title: 'Final Clearance', description: 'Don\'t miss out on these last-chance deals.', imageUrl: 'https://placehold.co/1200x600.png' }
    }
} as any;

export default function SalePage() {
  const router = useRouter();
  const [banners] = useLocalStorage<CategoryBanners>(CATEGORY_BANNERS_KEY, defaultBanners);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
      setIsMounted(true);
  }, []);

  const banner1 = banners?.Sale?.banner1;
  const banner2 = banners?.Sale?.banner2;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col h-screen">
       <header className="border-b sticky top-0 bg-background/95 z-50 flex-shrink-0">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                          <ArrowLeft className="h-6 w-6" />
                        </Button>
                    </div>
                    <div className="hidden lg:flex flex-1 max-w-lg mx-auto">
                        <div className="relative w-full">
                            <Input 
                                placeholder="Search products, brands, and more"
                                className="rounded-full pr-10"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                            <Search className="h-6 w-6 lg:hidden" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <User className="h-6 w-6" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <ShoppingCart className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            </div>
        </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 flex-grow flex flex-col overflow-hidden">
        <div className="hidden lg:block my-4">
            <nav aria-label="Breadcrumb">
                <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <li><Link href="/live-selling" className="hover:text-primary"><Home className="h-4 w-4" /></Link></li>
                    <li><ChevronRight className="h-4 w-4" /></li>
                    <li><span className="font-semibold text-foreground">Sale</span></li>
                </ol>
            </nav>
        </div>
        <div className="text-center py-20 text-muted-foreground">
            <h1 className="text-4xl font-bold mb-4 text-red-600">Sale</h1>
            <p>Sale content coming soon.</p>
        </div>
      </main>
    </div>
  );
}
