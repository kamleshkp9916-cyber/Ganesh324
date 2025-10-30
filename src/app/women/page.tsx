
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu, Search, User, ShoppingCart, Home, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { WomensSidebar } from '@/components/womens-sidebar';
import { Logo } from '@/components/logo';
import { Input } from '@/components/ui/input';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { CATEGORY_BANNERS_KEY, CategoryBanners } from '@/app/admin/settings/page';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const categories = [
    { name: "Tops", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=500&fit=crop", hint: "woman wearing top" },
    { name: "Dresses", image: "https://images.unsplash.com/photo-1572804013427-4d7ca726b655?w=400&h=500&fit=crop", hint: "woman in dress" },
    { name: "Coats & Jackets", image: "https://images.unsplash.com/photo-1591047139829-d919b49ea84e?w=400&h=500&fit=crop", hint: "woman wearing jacket" },
    { name: "Pants", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop", hint: "woman wearing pants" },
    { name: "Jeans", image: "https://images.unsplash.com/photo-1604176214539-d34199c1484b?w=400&h=500&fit=crop", hint: "woman wearing jeans" },
    { name: "Swim & Cover-Ups", image: "https://images.unsplash.com/photo-1575429188235-9d0a48405f6a?w=400&h=500&fit=crop", hint: "woman in swimsuit" },
];

const defaultBanners: CategoryBanners = {
    "Women": {
        banner1: { title: '25% off', description: 'Michael Kors for her. Ends 5/15.', imageUrl: 'https://images.unsplash.com/photo-1525945367383-a90940981977?w=800&h=800&fit=crop' },
        banner2: { title: 'State of Day', description: 'Restwear, sleepwear & innerwear that takes you from sunrise to slumber.', imageUrl: 'https://images.unsplash.com/photo-1617964436152-29304c5aad3a?w=1200&h=600&fit=crop' }
    }
};

export default function WomensClothingPage() {
  const router = useRouter();
  const [banners] = useLocalStorage<CategoryBanners>(CATEGORY_BANNERS_KEY, defaultBanners);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
      setIsMounted(true);
  }, []);

  const banner1 = banners?.Women?.banner1;
  const banner2 = banners?.Women?.banner2;

  const getSubCategoryPath = (name: string) => {
    const subCategorySlug = name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '%26');
    return `/women/${subCategorySlug}`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col h-screen">
       <header className="border-b sticky top-0 bg-background/95 z-50 flex-shrink-0">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-4">
                        
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
            <h1 className="text-2xl font-bold">Women</h1>
             <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                        <Menu className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-80">
                    <WomensSidebar />
                </SheetContent>
            </Sheet>
        </div>

        <div className="hidden lg:block my-4">
            <nav aria-label="Breadcrumb">
                <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <li><Button asChild variant="ghost" size="sm"><Link href="/listed-products"><Home className="h-4 w-4" /><span className="sr-only md:not-sr-only md:ml-2">Home</span></Link></Button></li>
                    <li><ChevronRight className="h-4 w-4" /></li>
                    <li><Button asChild variant="secondary" size="sm" className="font-semibold text-foreground"><Link href="/women">Women</Link></Button></li>
                </ol>
            </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-grow overflow-hidden">
          {/* Left Column: Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-1 h-full overflow-y-auto no-scrollbar">
             <div className="sticky top-0 pt-6">
                <WomensSidebar />
            </div>
          </aside>

          {/* Right Column: Main Content */}
           <div className="lg:col-span-3 h-full overflow-y-auto no-scrollbar">
               <div className="space-y-10 pb-10">
                    <div className="hidden lg:block pt-6">
                        <h1 className="text-4xl font-bold">Women</h1>
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
                                            data-ai-hint="woman fashion"
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
                                        data-ai-hint="woman relaxing"
                                    />
                                    <CardContent className="relative z-20 p-8 md:p-12 flex flex-col items-center justify-center text-center h-80">
                                        <h3 className="text-4xl font-bold">{banner2.title}</h3>
                                        <p className="max-w-md mt-2">{banner2.description}</p>
                                        <Button asChild variant="link" className="mt-4 text-white">
                                            <Link href={getSubCategoryPath("Pajamas & Robes")}>Shop The Collection</Link>
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
