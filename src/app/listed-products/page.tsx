
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Search, User, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { categories } from '@/lib/categories';

export default function ListedProductsPage() {
  const router = useRouter();

  const getHrefForSubcategory = (categoryName: string, subcategoryName: string) => {
    // This can be expanded later to generate real URLs
    return `/${categoryName.toLowerCase().replace(' ', '-')}/${subcategoryName.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`;
  }

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

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            {categories.map((category) => (
                <div key={category.name}>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">{category.name}</h3>
                    <ul className="space-y-3">
                        {category.subcategories.map((subcategory) => (
                            <li key={subcategory}>
                                <Link href={getHrefForSubcategory(category.name, subcategory)} className="text-lg font-medium text-foreground hover:text-primary hover:underline">
                                    {subcategory}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
      </main>
    </div>
  );
}
