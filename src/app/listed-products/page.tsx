
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { StoreHeader } from '@/components/store-header';
import { WomensSidebar } from '@/components/womens-sidebar';

const categories = [
    { name: "Tops", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=500&fit=crop", hint: "woman wearing top" },
    { name: "Dresses", image: "https://images.unsplash.com/photo-1595505994901-c584758d4e4f?w=400&h=500&fit=crop", hint: "woman wearing dress" },
    { name: "Coats & Jackets", image: "https://images.unsplash.com/photo-1591942525516-2b8916295b28?w=400&h=500&fit=crop", hint: "woman wearing jacket" },
    { name: "Pants", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=500&fit=crop", hint: "woman wearing pants" },
    { name: "Jeans", image: "https://images.unsplash.com/photo-1605518216984-4a24b3aa4c43?w=400&h=500&fit=crop", hint: "woman wearing jeans" },
    { name: "Swim & Cover-Ups", image: "https://images.unsplash.com/photo-1560351322-65d1ef501570?w=400&h=500&fit=crop", hint: "woman in swimwear" },
    { name: "Bras & Underwear", image: "https://images.unsplash.com/photo-1614749326792-58e1696b0521?w=400&h=500&fit=crop", hint: "lingerie set" },
    { name: "Active", image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=500&fit=crop", hint: "woman in activewear" },
    { name: "Pajamas & Robes", image: "https://images.unsplash.com/photo-1585412219807-202795a43583?w=400&h=500&fit=crop", hint: "woman in pajamas" },
    { name: "Handbags", image: "https://images.unsplash.com/photo-1579631621588-44f3c70e23a3?w=400&h=500&fit=crop", hint: "handbag" },
    { name: "Shoes", image: "https://images.unsplash.com/photo-1590099033615-77535a093722?w=400&h=500&fit=crop", hint: "pair of shoes" },
    { name: "Sale & Clearance", image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=500&fit=crop", hint: "sale sign" },
];


export default function ListedProductsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <StoreHeader />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4 lg:hidden">
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:col-span-1">
            <WomensSidebar />
          </aside>

          {/* Right Column: Main Content */}
          <div className="lg:col-span-3 space-y-10">
            <div className="hidden lg:block">
                <h1 className="text-4xl font-bold">Women</h1>
            </div>

            <section>
                <h2 className="text-xl font-semibold mb-4 text-center">Shop by category</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {categories.map(category => (
                        <Link href="#" key={category.name} className="group block text-center">
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
            
            <section>
                <Card className="overflow-hidden bg-gray-100 dark:bg-gray-900 border-none">
                    <CardContent className="p-0 flex flex-col md:flex-row items-center">
                        <div className="md:w-1/2 p-8 text-center md:text-left">
                            <h3 className="text-3xl font-bold">25% off</h3>
                            <p className="text-xl">Michael Kors for her</p>
                            <p className="text-sm text-muted-foreground mt-1">Ends 5/15.</p>
                            <Button asChild variant="link" className="mt-4 px-0">
                                <Link href="#">Shop Now</Link>
                            </Button>
                        </div>
                        <div className="md:w-1/2 h-64 md:h-auto md:aspect-square relative">
                             <Image 
                                src="https://images.unsplash.com/photo-1525945367383-a90940981977?w=800&h=800&fit=crop"
                                alt="Michael Kors promotion"
                                layout="fill"
                                className="object-cover"
                                data-ai-hint="woman fashion"
                            />
                        </div>
                    </CardContent>
                </Card>
            </section>
            
            <section>
                 <Card className="overflow-hidden relative text-white">
                    <div className="absolute inset-0 bg-black/40 z-10" />
                    <Image 
                        src="https://images.unsplash.com/photo-1617964436152-29304c5aad3a?w=1200&h=600&fit=crop"
                        alt="State of Day promotion"
                        layout="fill"
                        className="object-cover"
                        data-ai-hint="woman relaxing"
                    />
                    <CardContent className="relative z-20 p-8 md:p-12 flex flex-col items-center justify-center text-center h-80">
                         <p className="text-lg">Introducing</p>
                        <h3 className="text-4xl font-bold my-2">State of Day</h3>
                        <p className="max-w-md">Restwear, sleepwear & innerwear that takes you from sunrise to slumber.</p>
                        <Button asChild variant="link" className="mt-4 text-white">
                            <Link href="#">Shop Now</Link>
                        </Button>
                    </CardContent>
                </Card>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
