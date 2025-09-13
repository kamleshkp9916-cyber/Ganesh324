
"use client";

import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Star, Search, ChevronDown } from 'lucide-react';
import { productDetails } from '@/lib/product-data';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { differenceInDays } from 'date-fns';

export default function CategoryPage() {
    const router = useRouter();
    const params = useParams();
    const [sortOption, setSortOption] = useState("relevance");
    
    let { category: categoryPath } = params;

    if (!categoryPath) {
        return <div>Loading...</div>;
    }
    
    const pathSegments = Array.isArray(categoryPath) ? categoryPath : [categoryPath];
    const lastSegment = pathSegments[pathSegments.length - 1] || '';

    const categoryName = lastSegment
        .replace(/-/g, ' ')
        .replace(/%26/g, '&')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
        
    const products = Object.values(productDetails); 

    const sortedProducts = useMemo(() => {
        let sorted = [...products];

        if (sortOption === 'price-asc') {
            sorted.sort((a, b) => parseFloat(a.price.replace(/[^0-9.-]+/g,"")) - parseFloat(b.price.replace(/[^0-9.-]+/g,"")));
        } else if (sortOption === 'price-desc') {
            sorted.sort((a, b) => parseFloat(b.price.replace(/[^0-9.-]+/g,"")) - parseFloat(a.price.replace(/[^0-9.-]+/g,"")));
        }

        return sorted;

    }, [products, sortOption]);
    

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
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

            <main className="container mx-auto py-6">
                 <div className="p-4 border-b flex flex-col sm:flex-row items-center gap-4 sticky top-[65px] bg-background/80 backdrop-blur-sm z-20 -mx-4 sm:mx-0">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Search in this category..."
                            className="rounded-full pl-10"
                        />
                    </div>
                     <div className="flex items-center gap-2 w-full sm:w-auto">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="gap-1.5 w-full justify-center">
                                    Sort by: <span className="font-semibold capitalize">{sortOption.replace('-', ' ')}</span>
                                    <ChevronDown className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuRadioGroup value={sortOption} onValueChange={setSortOption}>
                                    <DropdownMenuRadioItem value="relevance">Relevance</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="price-asc">Price: Low to High</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="price-desc">Price: High to Low</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="newest">Newest</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="popularity">Popularity</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="p-4 md:p-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {sortedProducts.map((product: any) => {
                        const isNew = product.createdAt && differenceInDays(new Date(), new Date(product.createdAt)) <= 7;
                        return (
                            <Link href={`/product/${product.key}`} key={product.id} className="group block">
                                <Card className="w-full overflow-hidden h-full flex flex-col">
                                    <div className="relative aspect-square bg-muted">
                                        {isNew && (
                                            <Badge className="absolute top-2 left-2 z-10">NEW</Badge>
                                        )}
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
                        )
                    })}
                </div>
            </main>
        </div>
    );
}
