
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu, Search, User, ShoppingCart, Home, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ShoesSidebar } from '@/components/shoes-sidebar';
import { Logo } from '@/components/logo';
import { Input } from '@/components/ui/input';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { CATEGORY_BANNERS_KEY, CategoryBanners } from '@/app/admin/settings/page';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const categories = [
    { name: "Women's Shoes", image: "https://images.unsplash.com/photo-1590099033615-77535a093722?w=400&h=500&fit=crop", hint: "women's shoes" },
    { name: "Men's Shoes", image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=500&fit=crop", hint: "men's shoes" },
    { name: "Kids' Shoes", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=500&fit=crop", hint: "kids shoes" },
];

const defaultBanners: CategoryBanners = {
    "Shoes": {
        banner1: { title: 'Step Up Your Style', description: 'Find the perfect pair for any occasion.', imageUrl: 'https://placehold.co/800x800.png' },
        banner2: { title: 'Comfort & Style', description: 'Sneakers, boots, and more.', imageUrl: 'https://placehold.co/1200x600.png' }
    }
} as any;

export default function ShoesPage() {
  const router = useRouter();
  const [banners] = useLocalStorage<CategoryBanners>(CATEGORY_BANNERS_KEY, defaultBanners);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
      setIsMounted(true);
  }, []);

  const banner1 = banners?.Shoes?.banner1;
  const banner2 = banners?.Shoes?.banner2;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col h-screen">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
        <h1 className="text-xl font-bold truncate">Shoes</h1>
        <Link href="/cart">
            <Button asChild variant="ghost" size="icon">
                <ShoppingCart className="h-6 w-6" />
            </Button>
        </Link>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 flex-grow flex flex-col overflow-hidden">
        <div className="flex items-center justify-between my-4 lg:hidden flex-shrink-0">
             <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80">
                   <ShoesSidebar />
                </SheetContent>
            </Sheet>
        </div>

        <div className="hidden lg:flex items-center justify-between my-4">
             <div className="flex items-center gap-2">
                <nav aria-label="Breadcrumb">
                    <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <li><Button asChild variant="ghost" size="sm"><Link href="/listed-products"><Home className="h-4 w-4" /><span className="sr-only md:not-sr-only md:ml-2">Home</span></Link></Button></li>
                        <li><ChevronRight className="h-4 w-4" /></li>
                    </ol>
                </nav>
                <h1 className="text-2xl font-bold">Shoes</h1>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-grow overflow-hidden">
          <aside className="hidden lg:block lg:col-span-1 h-full overflow-y-auto no-scrollbar">
            <div className="sticky top-0 pt-6">
              <ShoesSidebar />
            </div>
          </aside>

          <div className="lg:col-span-3 h-full overflow-y-auto no-scrollbar">
            <div className="space-y-10 pb-10">
              <section>
                  <h2 className="text-xl font-semibold mb-4 text-center">Shop by Department</h2>
                  <div className="grid grid-cols-3 gap-4">
                      {categories.map(category => (
                          <Link href={`/shoes/${category.name.toLowerCase().replace(/\s/g, '-').replace(/&/g, '%26')}`} key={category.name} className="group block text-center">
                              <div className="aspect-[4/5] bg-muted rounded-lg overflow-hidden mb-2">
                                  <Image 
                                      src={category.image}
                                      alt={category.name}
                                      width={400}
                                      height={500}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                      data-ai-hint={category.hint}
                                  />
                              </div>
                              <p className="text-sm font-medium group-hover:underline">{category.name}</p>
                          </Link>
                      ))}
                  </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
