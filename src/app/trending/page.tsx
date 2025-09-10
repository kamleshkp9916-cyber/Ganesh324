
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu, Search, User, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { StoreHeader } from '@/components/store-header';
import { Logo } from '@/components/logo';
import { Input } from '@/components/ui/input';

export default function TrendingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
       <header className="border-b sticky top-0 bg-background/95 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-4">
                        <Link href="/live-selling">
                            <Logo className="h-10" />
                        </Link>
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
      <StoreHeader />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center py-20 text-muted-foreground">
            <h1 className="text-4xl font-bold mb-4">Trending</h1>
            <p>Trending content coming soon.</p>
        </div>
      </main>
    </div>
  );
}
