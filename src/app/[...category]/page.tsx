
"use client";

import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Star, Search, ChevronDown, Users, Package, Sparkles, Video, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { productDetails } from '@/lib/product-data';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { differenceInDays } from 'date-fns';
import { useDebounce } from '@/hooks/use-debounce';
import { normalize, generateKeywords } from '@/lib/generateKeywords';
import ProductSearch from '@/components/ProductSearch';
import { cn } from '@/lib/utils';
import { SimilarProductsOverlay } from '@/components/similar-products-overlay';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationLink, PaginationEllipsis } from '@/components/ui/pagination';
import { Footer } from '@/components/footer';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

const PRODUCTS_PER_PAGE = 30;

const ProductCardSkeleton = () => (
    <Card className="w-full overflow-hidden h-full flex flex-col">
        <Skeleton className="relative aspect-[10/9] bg-muted" />
        <div className="p-3 flex-grow flex flex-col space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-3 w-12" />
            </div>
        </div>
    </Card>
);


export default function CategoryPage() {
    const router = useRouter();
    const params = useParams();
    const [sortOption, setSortOption] = useState("relevance");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    // State for similar products functionality
    const [scanningProductId, setScanningProductId] = useState<string | null>(null);
    const [showSimilarOverlay, setShowSimilarOverlay] = useState(false);
    const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
    const [similarProducts, setSimilarProducts] = useState<any[]>([]);

    useEffect(() => {
        // Simulate loading
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [params.category]); // Re-trigger loading on category change


    const { category: categoryPath } = params;

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
        setCurrentPage(1); // Reset pagination on new search
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

    const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
    const visibleProducts = sortedProducts.slice(
        (currentPage - 1) * PRODUCTS_PER_PAGE,
        currentPage * PRODUCTS_PER_PAGE
    );
    
    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo(0, 0);
        }
    };

    return (
        <>
            <div className="min-h-screen bg-background text-foreground flex flex-col">
                <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-xl font-bold truncate">{pageTitle}</h1>
                     {user && (
                        <Link href="/cart">
                            <Button asChild variant="ghost" size="icon">
                                <ShoppingCart className="h-6 w-6" />
                            </Button>
                        </Link>
                    )}
                </header>

                <main className="container mx-auto py-6 flex-grow">
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
                     {isLoading ? (
                        <div className="p-4 md:p-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {Array.from({ length: 10 }).map((_, index) => (
                                <ProductCardSkeleton key={index} />
                            ))}
                        </div>
                    ) : visibleProducts.length > 0 ? (
                        <>
                            <div className="p-4 md:p-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {visibleProducts.map((product: any) => {
                                    const isNew = product.createdAt && differenceInDays(new Date(), new Date(product.createdAt)) <= 7;
                                    const isScanning = scanningProductId === product.key;

                                    const originalPrice = parseFloat(product.price.replace(/[^0-9.-]+/g,""));
                                    const hasDiscount = product.discountPercentage && product.discountPercentage > 0;
                                    const discountedPrice = hasDiscount ? originalPrice * (1 - product.discountPercentage / 100) : originalPrice;

                                    return (
                                        <Link href={`/product/${product.key}`} key={product.key} className="group block">
                                            <Card className="w-full overflow-hidden h-full flex flex-col">
                                                <div className="relative aspect-[10/9] bg-muted">
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
                                                     <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs text-white bg-black/50 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                                                        <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                                                        <span className="font-bold">4.8</span>
                                                    </div>
                                                    <div className="absolute bottom-2 right-2">
                                                        <Button size="icon" className="h-8 w-8 rounded-full bg-black/50 text-white backdrop-blur-sm" onClick={(e) => handleSimilarClick(e, product)} disabled={isScanning}>
                                                            {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                                <CardContent className="p-3 flex-grow flex flex-col">
                                                    <h4 className="font-semibold truncate text-sm flex-grow">{product.name}</h4>
                                                     <div className="flex items-center gap-2 mt-1">
                                                        <p className={cn("font-bold text-foreground text-sm", hasDiscount && "text-destructive")}>
                                                            ₹{discountedPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                        </p>
                                                        {hasDiscount && (
                                                            <>
                                                                <p className="text-xs text-muted-foreground line-through">
                                                                    ₹{originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                                </p>
                                                                <Badge variant="destructive" className="text-[10px] px-1 py-0">({product.discountPercentage}% OFF)</Badge>
                                                            </>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                                        <div className="flex items-center gap-1"><Package className="w-3 h-3" /> {product.stock} left</div>
                                                        <div className="flex items-center gap-1"><Users className="w-3 h-3" /> {product.sold} sold</div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    )
                                })}
                            </div>
                            {totalPages > 1 && (
                                <Pagination className="mt-8">
                                    <PaginationContent>
                                        <PaginationItem>
                                             <Button variant="ghost" onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
                                                <ChevronLeft className="h-4 w-4" /><ChevronLeft className="h-4 w-4 -ml-2" /> Page 1
                                            </Button>
                                        </PaginationItem>
                                        <PaginationItem>
                                            <Button variant="outline" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                                                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                                            </Button>
                                        </PaginationItem>
                                        <PaginationItem>
                                            <span className="p-2 text-sm">Page {currentPage} of {totalPages}</span>
                                        </PaginationItem>
                                        <PaginationItem>
                                            <Button variant="outline" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                                                Next <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-20 text-muted-foreground">
                            <h2 className="text-2xl font-bold">{searchQuery ? `No results for "${searchQuery}"` : "No Products Found"}</h2>
                            <p>{searchQuery ? "Try searching for something else." : "There are no products in this category yet."}</p>
                        </div>
                    )}
                </main>
                <Footer />
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
