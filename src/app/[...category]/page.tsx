
"use client";

import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Star } from 'lucide-react';
import { productDetails } from '@/lib/product-data';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import Image from 'next/image';

export default function CategoryPage() {
    const router = useRouter();
    const params = useParams();
    
    let { category: categoryPath } = params;

    if (!categoryPath) {
        return <div>Loading...</div>;
    }

    if (Array.isArray(categoryPath)) {
        categoryPath = categoryPath.join(' / ');
    }
    
    const categoryName = categoryPath
        .split('/')
        .map(segment => segment.replace(/-/g, ' '))
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' > ');

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

