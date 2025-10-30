
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu, Search, User, ShoppingCart, Home, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MensSidebar } from '@/components/mens-sidebar';
import { Logo } from '@/components/logo';
import { Input } from '@/components/ui/input';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { CATEGORY_BANNERS_KEY, CategoryBanners } from '@/app/admin/settings/page';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const categories = [
    { name: "Shirts", image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400&h=500&fit=crop", hint: "man wearing shirt" },
    { name: "Pants & Shorts", image: "https://images.unsplash.com/photo-1542272604-787c38E2C73b?w=400&h=500&fit=crop", hint: "men's pants" },
    { name: "Coats & Jackets", image: "https://images.unsplash.com/photo-1520975954732-35dd222996b7?w=400&h=500&fit=crop", hint: "man wearing jacket" },
    { name: "Activewear", image: "https://images.unsplash.com/photo-1544216717-3bbf52512659?w=400&h=500&fit=crop", hint: "man in activewear" },
    { name: "Jeans", image: "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=400&h=500&fit=crop", hint: "man wearing jeans" },
    { name: "Underwear & Socks", image: "https://images.unsplash.com/photo-1613031027735-d72b535804e3?w=400&h=500&fit=crop", hint: "men's underwear" },
    { name: "Pajamas & Robes", image: "https://images.unsplash.com/photo-1576523993214-94ac33b58474?w=400&h=500&fit=crop", hint: "man in pajamas" },
    { name: "Suits & Tuxedos", image: "https://images.unsplash.com/photo-1593030339999-d438a5a5a6a6?w=400&h=500&fit=crop", hint: "man in suit" },
    { name: "Shoes", image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=500&fit=crop", hint: "men's shoes" },
    { name: "Accessories", image: "https://images.unsplash.com/photo-1615102581648-6346305a4132?w=400&h=500&fit=crop", hint: "men's watch" },
    { name: "Big & Tall", image: "https://images.unsplash.com/photo-1607346256330-58d35961a1a7?w=400&h=500&fit=crop", hint: "tall man" },
];

const defaultBanners: CategoryBanners = {
    "Men": {
        banner1: { title: '40% off', description: 'Top Brand Polos & Tees. Limited time only.', imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=800&fit=crop' },
        banner2: { title: 'Activewear Collection', description: 'Engineered to keep you cool, dry, and comfortable.', imageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=1200&h=600&fit=crop' }
    }
} as any;

export default function MensClothingPage() {
  const router = useRouter();
  const [banners] = useLocalStorage<CategoryBanners>(CATEGORY_BANNERS_KEY, defaultBanners);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
      setIsMounted(true);
  }, []);

  const banner1 = banners?.Men?.banner1;
  const banner2 = banners?.Men?.banner2;

  const getSubCategoryPath = (name: string) => {
    const subCategorySlug = name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '%26');
    return `/men/${subCategorySlug}`;
  };

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
            <h1 className="text-2xl font-bold">Men</h1>
             <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80">
                   <MensSidebar />
                </SheetContent>
            </Sheet>
        </div>

        <div className="hidden lg:block my-4">
            <nav aria-label="Breadcrumb">
                <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <li><Link href="/live-selling" className="hover:text-primary"><Home className="h-4 w-4" /></Link></li>
                    <li><ChevronRight className="h-4 w-4" /></li>
                    <li><span className="font-semibold text-foreground">Men</span></li>
                </ol>
            </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-grow overflow-hidden">
          {/* Left Column: Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-1 h-full overflow-y-auto no-scrollbar">
            <div className="sticky top-0 pt-6">
              <MensSidebar />
            </div>
          </aside>

          {/* Right Column: Main Content */}
          <div className="lg:col-span-3 h-full overflow-y-auto no-scrollbar">
            <div className="space-y-10 pb-10">
              <div className="hidden lg:block pt-6">
                  <h1 className="text-4xl font-bold">Men</h1>
              </div>

               <section>
                   <Card className="overflow-hidden bg-gray-100 dark:bg-gray-900 border-none">
                       {isMounted && banner1 ? (
                          <CardContent className="p-0 flex flex-col md:flex-row items-center">
                              <div className="md:w-1/2 p-8 text-center md:text-left">
                                  <h3 className="text-3xl font-bold">{banner1.title}</h3>
                                  <p className="text-xl">{banner1.description}</p>
                                  <Button asChild variant="link" className="mt-4 px-0">
                                      <Link href="/sale">Shop Now</Link>
                                  </Button>
                              </div>
                              <div className="md:w-1/2 h-64 md:h-auto md:aspect-square relative">
                                  <Image 
                                      src={banner1.imageUrl}
                                      alt={banner1.title}
                                      fill
                                      className="object-cover"
                                      data-ai-hint="man fashion"
                                  />
                              </div>
                          </CardContent>
                      ) : (
                           <Skeleton className="w-full h-80" />
                      )}
                  </Card>
              </section>
              
              <section>
                   <Card className="overflow-hidden relative text-white">
                      {isMounted && banner2 ? (
                          <>
                              <div className="absolute inset-0 bg-black/40 z-10" />
                              <Image 
                                  src={banner2.imageUrl}
                                  alt={banner2.title}
                                  fill
                                  className="object-cover"
                                  data-ai-hint="man running"
                              />
                              <CardContent className="relative z-20 p-8 md:p-12 flex flex-col items-center justify-center text-center h-80">
                                  <p className="text-lg">Performance Enhanced</p>
                                  <h3 className="text-4xl font-bold my-2">{banner2.title}</h3>
                                  <p className="max-w-md">{banner2.description}</p>
                                  <Button asChild variant="link" className="mt-4 text-white">
                                      <Link href={getSubCategoryPath("Activewear")}>Shop The Collection</Link>
                                  </Button>
                              </CardContent>
                          </>
                      ) : (
                           <Skeleton className="w-full h-80" />
                      )}
                  </Card>
              </section>
              
              <section>
                  <h2 className="text-xl font-semibold mb-4 text-center">Shop by category</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {categories.map(category => (
                          <Link href={getSubCategoryPath(category.name)} key={category.name} className="group block text-center">
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
