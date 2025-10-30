
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu, Search, User, ShoppingCart, Home, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { HandbagsSidebar } from '@/components/handbags-sidebar';
import { Logo } from '@/components/logo';
import { Input } from '@/components/ui/input';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { CATEGORY_BANNERS_KEY, CategoryBanners } from '@/app/admin/settings/page';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';

const categories = [
    { name: "Totes", image: "https://images.unsplash.com/photo-1594223274502-942be6e542e0?w=400&h=500&fit=crop", hint: "tote bag" },
    { name: "Crossbody Bags", image: "https://images.unsplash.com/photo-1579566346927-c68383817a25?w=400&h=500&fit=crop", hint: "crossbody bag" },
    { name: "Shoulder Bags", image: "https://images.unsplash.com/photo-1617482337134-36a8d8b135b9?w=400&h=500&fit=crop", hint: "shoulder bag" },
    { name: "Clutches", image: "https://images.unsplash.com/photo-1583406734135-4a6c4f995874?w=400&h=500&fit=crop", hint: "clutch purse" },
    { name: "Backpacks", image: "https://images.unsplash.com/photo-1587547131175-9055034d0107?w=400&h=500&fit=crop", hint: "fashion backpack" },
];

const defaultBanners: CategoryBanners = {
    "Handbags": {
        banner1: { title: 'The Perfect Accessory', description: 'Complete your look with our new handbag collection.', imageUrl: 'https://placehold.co/800x800.png' },
        banner2: { title: 'Carry It All', description: 'Stylish and functional bags for every need.', imageUrl: 'https://placehold.co/1200x600.png' }
    }
} as any;

export default function HandbagsPage() {
  const router = useRouter();
  const [banners] = useLocalStorage<CategoryBanners>(CATEGORY_BANNERS_KEY, defaultBanners);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
      setIsMounted(true);
  }, []);

  const banner1 = banners?.Handbags?.banner1;
  const banner2 = banners?.Handbags?.banner2;

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
        <div className="flex items-center justify-between my-4 lg:hidden flex-shrink-0">
             <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-2xl font-bold">Handbags</h1>
             <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80">
                   <HandbagsSidebar />
                </SheetContent>
            </Sheet>
        </div>

        <div className="hidden lg:block my-4">
            <nav aria-label="Breadcrumb">
                <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <li><Link href="/live-selling" className="hover:text-primary"><Home className="h-4 w-4" /></Link></li>
                    <li><ChevronRight className="h-4 w-4" /></li>
                    <li><span className="font-semibold text-foreground">Handbags</span></li>
                </ol>
            </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-grow overflow-hidden">
          <aside className="hidden lg:block lg:col-span-1 h-full overflow-y-auto no-scrollbar">
            <div className="sticky top-0 pt-6">
              <HandbagsSidebar />
            </div>
          </aside>

          <div className="lg:col-span-3 h-full overflow-y-auto no-scrollbar">
            <div className="space-y-10 pb-10">
              <div className="hidden lg:block pt-6">
                  <h1 className="text-4xl font-bold">Handbags</h1>
              </div>
              
              <section>
                  <h2 className="text-xl font-semibold mb-4 text-center">Shop by Type</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {categories.map(category => (
                          <Link href={`/handbags/${category.name.toLowerCase().replace(/\s/g, '-').replace(/&/g, '%26')}`} key={category.name} className="group block text-center">
                              <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-2">
                                  <Image 
                                      src={category.image}
                                      alt={category.name}
                                      width={200}
                                      height={200}
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
