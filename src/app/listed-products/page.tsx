
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, User, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

const mainCategories = [
    { name: "Women", href: "/listed-products", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=500&fit=crop", hint: "woman wearing top" },
    { name: "Men", href: "/mens-clothing", image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400&h=500&fit=crop", hint: "man wearing shirt" },
    { name: "Kids", href: "/kids", image: "https://images.unsplash.com/photo-1519340241574-289a2b421515?w=400&h=500&fit=crop", hint: "girl wearing dress" },
    { name: "Home", href: "/home", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=500&fit=crop", hint: "modern furniture" },
    { name: "Electronics", href: "/electronics", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=500&fit=crop", hint: "laptop on desk" },
    { name: "Shoes", href: "/shoes", image: "https://images.unsplash.com/photo-1590099033615-77535a093722?w=400&h=500&fit=crop", hint: "pair of shoes" },
    { name: "Handbags", href: "/handbags", image: "https://images.unsplash.com/photo-1579631621588-44f3c70e23a3?w=400&h=500&fit=crop", hint: "handbag" },
    { name: "Trending", href: "/trending", image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=500&fit=crop", hint: "sale sign" },
];

export default function ListedProductsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
       <header className="border-b sticky top-0 bg-background/95 z-50">
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
                        <Link href="/profile">
                            <Button variant="ghost" size="icon">
                                <User className="h-6 w-6" />
                            </Button>
                        </Link>
                         <Link href="/cart">
                            <Button variant="ghost" size="icon">
                                <ShoppingCart className="h-6 w-6" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-bold">All Categories</h1>
            <p className="text-muted-foreground mt-2">Explore all our product categories in one place.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {mainCategories.map(category => (
                <Link href={category.href} key={category.name} className="group block">
                    <Card className="overflow-hidden">
                        <CardContent className="p-0">
                            <div className="aspect-[4/5] bg-muted relative">
                                <Image
                                    src={category.image}
                                    alt={category.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform"
                                    data-ai-hint={category.hint}
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-center group-hover:underline">{category.name}</h3>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
      </main>
    </div>
  );
}
