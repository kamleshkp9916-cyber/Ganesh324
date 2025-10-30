
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu, Search, User, ShoppingCart, Home, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { KidsSidebar } from '@/components/kids-sidebar';
import { Logo } from '@/components/logo';
import { Input } from '@/components/ui/input';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { CATEGORY_BANNERS_KEY, CategoryBanners } from '@/app/admin/settings/page';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const categories = [
    { name: "Girls' Clothing", image: "https://images.unsplash.com/photo-1519340241574-289a2b421515?w=400&h=500&fit=crop", hint: "girl wearing dress" },
    { name: "Boys' Clothing", image: "https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=400&h=500&fit=crop", hint: "boy wearing shirt" },
    { name: "Baby Clothing", image: "https://images.unsplash.com/photo-1522771765996-33d74d17b882?w=400&h=500&fit=crop", hint: "baby clothes" },
    { name: "Shoes", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=500&fit=crop", hint: "kids shoes" },
    { name: "Toys & Games", image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=400&h=500&fit=crop", hint: "toys" },
    { name: "Backpacks", image: "https://images.unsplash.com/photo-1553062407-98eada6b5a5a?w=400&h=500&fit=crop", hint: "kids backpack" },
];

const defaultBanners: CategoryBanners = {
    "Kids": {
        banner1: { title: "Kids' Corner", description: 'Fun and stylish outfits for your little ones.', imageUrl: 'https://placehold.co/800x800.png' },
        banner2: { title: 'Playtime Favorites', description: 'Durable and fun toys for all ages.', imageUrl: 'https://placehold.co/1200x600.png' }
    }
} as any;

export default function KidsPage() {
  const router = useRouter();
  const [banners] = useLocalStorage<CategoryBanners>(CATEGORY_BANNERS_KEY, defaultBanners);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
      setIsMounted(true);
  }, []);

  const banner1 = banners?.Kids?.banner1;
  const banner2 = banners?.Kids?.banner2;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col h-screen">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
        <h1 className="text-xl font-bold truncate">Kids</h1>
        <Link href="/cart">
            <Button asChild variant="ghost" size="icon">
                <ShoppingCart className="h-6 w-6" />
            </Button>
        </Link>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 flex-grow flex flex-col overflow-hidden">
        <div className="flex items-center justify-between my-4 lg:hidden flex-shrink-0">
            <h1 className="text-2xl font-bold">Kids</h1>
             <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80">
                   <KidsSidebar />
                </SheetContent>
            </Sheet>
        </div>
        
        <div className="hidden lg:flex items-center justify-between my-4">
            <nav aria-label="Breadcrumb">
                <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <li><Button asChild variant="ghost" size="sm"><Link href="/listed-products"><Home className="h-4 w-4" /><span className="sr-only md:not-sr-only md:ml-2">Home</span></Link></Button></li>
                    <li><ChevronRight className="h-4 w-4" /></li>
                    <li><Button asChild variant="secondary" size="sm" className="font-semibold text-foreground"><Link href="/kids">Kids</Link></Button></li>
                </ol>
            </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-grow overflow-hidden">
          <aside className="hidden lg:block lg:col-span-1 h-full overflow-y-auto no-scrollbar">
            <div className="sticky top-0 pt-6">
              <KidsSidebar />
            </div>
          </aside>

          <div className="lg:col-span-3 h-full overflow-y-auto no-scrollbar">
            <div className="space-y-10 pb-10">
              <section>
                  <h2 className="text-xl font-semibold mb-4 text-center">Shop for Kids</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {categories.map(category => (
                          <Link href={`/kids/${category.name.toLowerCase().replace(/\s/g, '-').replace(/&/g, '%26')}`} key={category.name} className="group block text-center">
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
