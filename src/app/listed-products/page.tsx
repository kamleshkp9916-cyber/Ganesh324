
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star } from 'lucide-react';
import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { productDetails } from '@/lib/product-data';
import Link from 'next/link';

const clothingCategories = [
    { name: "T-Shirts" },
    { name: "Jeans" },
    { name: "Dresses" },
    { name: "Jackets" },
    { name: "Sweaters" },
    { name: "Skirts" },
];

// Mock mapping of categories to product keys
const categoryProductMapping: { [key: string]: string[] } = {
    "Jackets": ["prod_5"],
    // Add other mappings here as needed
};

// Filter products that are in the 'Fashion' category
const fashionProducts = Object.values(productDetails).filter(p => p.category === 'Fashion');

export default function ListedProductsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(clothingCategories[0].name);

  const displayedProducts = useMemo(() => {
    // In a real app, you'd filter by sub-category.
    // For this demo, we'll just show all fashion products regardless of the selected sub-category.
    return fashionProducts;
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Clothing</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Left Column: Categories */}
          <div className="md:col-span-1">
            <h2 className="text-lg font-semibold mb-4">Categories</h2>
            <div className="space-y-2">
              {clothingCategories.map(category => (
                <Button
                  key={category.name}
                  variant={selectedCategory === category.name ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Right Column: Products */}
          <div className="md:col-span-3">
             <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {displayedProducts.map(product => (
                     <Link href={`/product/${product.key}`} key={product.id} className="group block">
                        <Card className="w-full overflow-hidden h-full flex flex-col">
                            <div className="relative aspect-square bg-muted">
                                <Image 
                                    src={product.images[0]}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    data-ai-hint={product.hint}
                                />
                            </div>
                            <div className="p-3 flex-grow flex flex-col">
                                <h4 className="font-semibold truncate text-sm flex-grow">{product.name}</h4>
                                <p className="font-bold text-foreground mt-1">{product.price}</p>
                                <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span>4.8</span>
                                    <span className="text-muted-foreground">(1.2k)</span>
                                </div>
                            </div>
                        </Card>
                    </Link>
                ))}
             </div>
             {displayedProducts.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No products in this category yet.</p>
                </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
}
