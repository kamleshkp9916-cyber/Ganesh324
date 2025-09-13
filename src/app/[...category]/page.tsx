
"use client";

import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Star, Search, ListFilter } from 'lucide-react';
import { productDetails } from '@/lib/product-data';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Input } from '@/components/ui/input';

export default function CategoryPage() {
    const router = useRouter();
    const params = useParams();
    
    let { category: categoryPath } = params;

    if (!categoryPath) {
        return <div>Loading...</div>;
    }
    
    // Ensure categoryPath is an array
    const pathSegments = Array.isArray(categoryPath) ? categoryPath : [categoryPath];

    // Get the last segment for the title
    const lastSegment = pathSegments[pathSegments.length - 1] || '';

    // Create a clean title from the last segment
    const categoryName = lastSegment
        .replace(/-/g, ' ')
        .replace(/%26/g, '&')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    const products = Object.values(productDetails).slice(0, 10); 

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold truncate">{categoryName}</h1>
                <div className="w-10">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/cart"><ShoppingCart className="h-6 w-6" /></Link>
                    </Button>
                </div>
            </header>

             <div className="p-4 border-b flex items-center gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search in this category..."
                        className="rounded-full pl-10"
                    />
                </div>
                <Button variant="outline" className="gap-1.5">
                    <ListFilter className="h-4 w-4" />
                    Filter
                </Button>
            </div>

            <main className="p-4 md:p-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {products.map((product) => (
                        <Link href={`/product/${product.key}`} key={product.id} className="group block">
                            <Card className="w-full overflow-hidden h-full flex flex-col">
                                <div className="relative aspect-square bg-muted">
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-105"
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
            </main>
        </div>
    );
}

