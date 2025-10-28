
"use client";

import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Star, Search, ChevronDown, Users, Package, Sparkles, Video, Loader2 } from 'lucide-react';
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
import React, { useState, useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { differenceInDays } from 'date-fns';
import { useDebounce } from '@/hooks/use-debounce';
import { normalize, generateKeywords } from '@/lib/generateKeywords';
import ProductSearch from '@/components/ProductSearch';
import { cn } from '@/lib/utils';
import { SimilarProductsOverlay } from '@/components/similar-products-overlay';

const PRODUCTS_PER_PAGE = 10;

export default function CategoryPage() {
    const router = useRouter();
    const params = useParams();
    const [sortOption, setSortOption] = useState("relevance");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleProductsCount, setVisibleProductsCount] = useState(PRODUCTS_PER_PAGE);

    // State for similar products functionality
    const [scanningProductId, setScanningProductId] = useState<string | null>(null);
    const [showSimilarOverlay, setShowSimilarOverlay] = useState(false);
    const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
    const [similarProducts, setSimilarProducts] = useState<any[]>([]);

    let { category: categoryPath } = params;

    if (!categoryPath) {
        return <div>Loading...</div>;
    }
    
    const pathSegments = Array.isArray(categoryPath) ? categoryPath : [categoryPath];
    const categorySlug = pathSegments[0] || '';
    const subCategorySlug = pathSegments.length > 1 ? pathSegments[pathSegments.length - 1] : null;
    
    const lastSegment = pathSegments[pathSegments.length - 1] || '';

    const pageTitle = lastSegment
        .replace(/-/g, ' ')
        .replace(/%26/g, '&')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
        
    const allProducts = Object.values(productDetails).map(p => ({...p, keywords: generateKeywords(p)}));

    const categoryProducts = useMemo(() => {
        return allProducts.filter(product => {
            const productCategorySlug = product.category.toLowerCase().replace(/\s+/g, '-');
            const productSubCategorySlug = product.subcategory?.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '%26');

            if (subCategorySlug) {
                // If there's a subcategory in the URL, match both category and subcategory
                return productCategorySlug === categorySlug && productSubCategorySlug === subCategorySlug;
            }
            // If there's only a category in the URL, match the category
            return productCategorySlug === categorySlug;
        });
    }, [allProducts, categorySlug, subCategorySlug]);

    const sortedProducts = useMemo(() => {
        let sorted = showSearchResults ? searchResults : [...categoryProducts];

        if (sortOption === 'price-asc') {
            sorted.sort((a, b) => parseFloat(a.price.replace(/[^0-9.-]+/g,"")) - parseFloat(b.price.replace(/[^0-9.-]+/g,"")));
        } else if (sortOption === 'price-desc') {
            sorted.sort((a, b) => parseFloat(b.price.replace(/[^0-9.-]+/g,"")) - parseFloat(a.price.replace(/[^0-9.-]+/g,"")));
        }

        return sorted;

    }, [categoryProducts, searchResults, showSearchResults, sortOption]);
    
    const onSearchComplete = useCallback((results: any[], query: string) => {
        setSearchResults(results);
        setSearchQuery(query);
        setShowSearchResults(results.length > 0 || query.length > 0);
        setVisibleProductsCount(PRODUCTS_PER_PAGE); // Reset pagination on new search
    }, []);
    
    const handleSimilarClick = (e: React.MouseEvent, product: any) => {
        e.preventDefault();
        e.stopPropagation();
        
        setScanningProductId(product.key);
        setIsLoadingSimilar(true);
        
        // Find similar products from the current category
        const similar = allProducts.filter(p => p.category === product.category && p.key !== product.key).slice(0, 10);
        setSimilarProducts(similar);
        
        setTimeout(() => {
            setScanningProductId(null);
            setShowSimilarOverlay(true);
            setTimeout(() => {
                setIsLoadingSimilar(false);
            }, 1000);
        }, 1500);
    };

    const visibleProducts = sortedProducts.slice(0, visibleProductsCount);
    const hasMoreProducts = visibleProductsCount < sortedProducts.length;

    const loadMoreProducts = () => {
        setVisibleProductsCount(prevCount => prevCount + PRODUCTS_PER_PAGE);
    };

    return (
        <>
            <div className="min-h-screen bg-background text-foreground flex flex-col">
                <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-xl font-bold truncate">{pageTitle}</h1>
                    <div className="w-10">
                        <Button asChild variant="ghost" size="icon">
                            <Link href="/cart"><ShoppingCart className="h-6 w-6" /></Link>
                        </Button>
                    </div>
                </header>

                <main className="container mx-auto py-6">
                    <div className="p-4 border-b flex flex-col sm:flex-row items-center gap-4 sticky top-[65px] bg-background/80 backdrop-blur-sm z-20 -mx-4 sm:mx-0">
                        <div className="relative flex-1 w-full">
                            <ProductSearch onSearchComplete={onSearchComplete} />
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
                    {visibleProducts.length > 0 ? (
                        <>
                            <div className="p-4 md:p-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {visibleProducts.map((product: any) => {
                                    const isNew = product.createdAt && differenceInDays(new Date(), new Date(product.createdAt)) <= 7;
                                    const isScanning = scanningProductId === product.key;
                                    return (
                                        <Link href={`/product/${product.key}`} key={product.key} className="group block">
                                            <Card className="w-full overflow-hidden h-full flex flex-col">
                                                <div className="relative aspect-square bg-muted">
                                                    {isNew && (
                                                        <Badge className="absolute top-2 left-2 z-10">NEW</Badge>
                                                    )}
                                                    {product.isFromStream && (
                                                        <Badge variant="purple" className={cn("absolute z-10", isNew ? "top-10 left-2" : "top-2 left-2")}>
                                                            <Video className="h-3 w-3 mr-1"/> From Stream
                                                        </Badge>
                                                    )}
                                                    <Image
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        fill
                                                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                                                        className="object-cover transition-transform group-hover:scale-105"
                                                        data-ai-hint={product.hint}
                                                    />
                                                    {isScanning && (
                                                        <div className="absolute inset-0 bg-black/30 overflow-hidden">
                                                            <div className="scan-animation"></div>
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-2 right-2">
                                                        <Button size="icon" className="h-8 w-8 rounded-full bg-black/50 text-white backdrop-blur-sm" onClick={(e) => handleSimilarClick(e, product)} disabled={isScanning}>
                                                            {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="p-3 flex-grow flex flex-col">
                                                    <h4 className="font-semibold truncate text-sm flex-grow">{product.name}</h4>
                                                    <p className="font-bold text-foreground mt-1">{product.price}</p>
                                                    <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
                                                        <Star className="w-4 h-4 fill-current" />
                                                        <span>4.8</span>
                                                        <span className="text-muted-foreground">(1.2k reviews)</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                                        <div className="flex items-center gap-1"><Package className="w-3 h-3" /> {product.stock} left</div>
                                                        <div className="flex items-center gap-1"><Users className="w-3 h-3" /> {product.sold} sold</div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    )
                                })}
                            </div>
                            {hasMoreProducts && (
                                <div className="text-center mt-8">
                                    <Button onClick={loadMoreProducts}>Load More</Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20 text-muted-foreground">
                            <h2 className="text-2xl font-bold">{searchQuery ? `No results for "${searchQuery}"` : "No Products Found"}</h2>
                            <p>{searchQuery ? "Try searching for something else." : "There are no products in this category yet."}</p>
                        </div>
                    )}
                </main>
            </div>
             {showSimilarOverlay && <SimilarProductsOverlay
                isOpen={showSimilarOverlay}
                onClose={() => setShowSimilarOverlay(false)}
                similarProducts={similarProducts}
                relatedStreams={[]}
                isLoading={isLoadingSimilar}
            />}
        </>
    );
}
