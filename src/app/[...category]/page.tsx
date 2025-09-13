
"use client";

import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Star, Search, ListFilter, X, ChevronDown, Menu } from 'lucide-react';
import { productDetails } from '@/lib/product-data';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ProductFilterSidebar } from '@/components/product-filter-sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React, { useState, useMemo } from 'react';

export default function CategoryPage() {
    const router = useRouter();
    const params = useParams();
    const [sortOption, setSortOption] = useState("relevance");
    
    let { category: categoryPath } = params;

    // Filter states
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 15000]);
    const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [selectedRating, setSelectedRating] = useState(0);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [auctionState, setAuctionState] = useState("all");

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

    const filteredProducts = useMemo(() => {
        let filtered = products.filter(product => {
            const price = parseFloat(product.price.replace(/[^0-9.-]+/g,""));
            if (price < priceRange[0] || price > priceRange[1]) return false;

            if (selectedRating > 0 && (productDetails as any)[product.key]?.rating_avg < selectedRating) return false;
            
            if (inStockOnly && !(productDetails as any)[product.key]?.in_stock) return false;

            if(selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) return false;

            return true;
        });

        if (sortOption === 'price-asc') {
            filtered.sort((a, b) => parseFloat(a.price.replace(/[^0-9.-]+/g,"")) - parseFloat(b.price.replace(/[^0-9.-]+/g,"")));
        } else if (sortOption === 'price-desc') {
            filtered.sort((a, b) => parseFloat(b.price.replace(/[^0-9.-]+/g,"")) - parseFloat(a.price.replace(/[^0-9.-]+/g,"")));
        }

        return filtered;

    }, [products, priceRange, selectedRating, inStockOnly, selectedBrands, sortOption]);

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

            <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-8 flex-1 container mx-auto py-6">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:block lg:col-span-1">
                    <div className="sticky top-24">
                        <ProductFilterSidebar
                            priceRange={priceRange}
                            setPriceRange={setPriceRange}
                            selectedSubCategories={selectedSubCategories}
                            setSelectedSubCategories={setSelectedSubCategories}
                            selectedBrands={selectedBrands}
                            setSelectedBrands={setSelectedBrands}
                            selectedSizes={selectedSizes}
                            setSelectedSizes={setSelectedSizes}
                            selectedColors={selectedColors}
                            setSelectedColors={setSelectedColors}
                            selectedRating={selectedRating}
                            setSelectedRating={setSelectedRating}
                            inStockOnly={inStockOnly}
                            setInStockOnly={setInStockOnly}
                            auctionState={auctionState}
                            setAuctionState={setAuctionState}
                        />
                    </div>
                </aside>

                {/* Main Content */}
                <main className="lg:col-span-3 xl:col-span-4">
                     <div className="p-4 border-b flex flex-col sm:flex-row items-center gap-4 sticky top-20 bg-background/80 backdrop-blur-sm z-20 -mx-4 sm:mx-0">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                placeholder="Search in this category..."
                                className="rounded-full pl-10"
                            />
                        </div>
                         <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="gap-1.5 w-full justify-center lg:hidden">
                                        <ListFilter className="h-4 w-4" />
                                        Filter
                                    </Button>
                                </SheetTrigger>
                                <SheetContent className="p-0">
                                   <ProductFilterSidebar
                                        priceRange={priceRange}
                                        setPriceRange={setPriceRange}
                                        selectedSubCategories={selectedSubCategories}
                                        setSelectedSubCategories={setSelectedSubCategories}
                                        selectedBrands={selectedBrands}
                                        setSelectedBrands={setSelectedBrands}
                                        selectedSizes={selectedSizes}
                                        setSelectedSizes={setSelectedSizes}
                                        selectedColors={selectedColors}
                                        setSelectedColors={setSelectedColors}
                                        selectedRating={selectedRating}
                                        setSelectedRating={setSelectedRating}
                                        inStockOnly={inStockOnly}
                                        setInStockOnly={setInStockOnly}
                                        auctionState={auctionState}
                                        setAuctionState={setAuctionState}
                                    />
                                </SheetContent>
                            </Sheet>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="gap-1.5 w-full justify-center">
                                        Sort by: <span className="font-semibold capitalize">{sortOption}</span>
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
                    <div className="p-4 md:p-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProducts.map((product) => (
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
        </div>
    );
}
