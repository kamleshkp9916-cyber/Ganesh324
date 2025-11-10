
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Menu, Search, ShoppingCart, Home, ChevronRight, Video, Tv, Star, Users, Package, Heart, Sparkles, Loader2, ChevronDown } from 'lucide-react';

import { WomensSidebar } from '@/components/womens-sidebar';
import { Footer } from '@/components/footer';
import { SimilarProductsOverlay } from '@/components/similar-products-overlay';
import ProductSearch from '@/components/ProductSearch';

import { productDetails } from '@/lib/product-data';
import { generateKeywords } from '@/lib/generateKeywords';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { differenceInHours } from 'date-fns';

const PRODUCTS_PER_PAGE = 30;

const ProductCardSkeleton = () => (
    <Card className="w-full overflow-hidden h-full flex flex-col">
        <Skeleton className="relative aspect-square bg-muted" />
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

export default function WomensClothingPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [sortOption, setSortOption] = useState("relevance");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(searchParams.get('subcategory'));

    const [scanningProductId, setScanningProductId] = useState<string | null>(null);
    const [showSimilarOverlay, setShowSimilarOverlay] = useState(false);
    const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
    const [similarProducts, setSimilarProducts] = useState<any[]>([]);

    React.useEffect(() => {
        setIsLoading(false);
    }, [selectedSubcategory]);

    const allProducts = useMemo(() => Object.values(productDetails).map(p => ({ ...p, keywords: generateKeywords(p) })), []);

    const categoryProducts = useMemo(() => {
        return allProducts.filter(product => {
            const productCategorySlug = product.category.toLowerCase().replace(/\s+/g, '-');
            const productSubCategorySlug = product.subcategory?.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '%26');
            
            if (selectedSubcategory) {
                return productCategorySlug === 'women' && productSubCategorySlug === selectedSubcategory;
            }
            return productCategorySlug === 'women';
        });
    }, [allProducts, selectedSubcategory]);

    const sortedProducts = useMemo(() => {
        let sorted = showSearchResults ? searchResults : [...categoryProducts];
        if (sortOption === 'price-asc') {
            sorted.sort((a, b) => parseFloat(a.price.replace(/[^0-9.-]+/g, "")) - parseFloat(b.price.replace(/[^0-9.-]+/g, "")));
        } else if (sortOption === 'price-desc') {
            sorted.sort((a, b) => parseFloat(b.price.replace(/[^0-9.-]+/g, "")) - parseFloat(a.price.replace(/[^0-9.-]+/g, "")));
        }
        return sorted;
    }, [categoryProducts, searchResults, showSearchResults, sortOption]);

    const onSearchComplete = useCallback((results: any[], query: string) => {
        setSearchResults(results);
        setSearchQuery(query);
        setShowSearchResults(results.length > 0 || query.length > 0);
        setCurrentPage(1);
    }, []);

    const handleSimilarClick = (e: React.MouseEvent, product: any) => {
        e.preventDefault();
        e.stopPropagation();
        setScanningProductId(product.key);
        setIsLoadingSimilar(true);
        const similar = allProducts.filter(p => p.category === product.category && p.key !== product.key).slice(0, 10);
        setSimilarProducts(similar);
        setTimeout(() => {
            setScanningProductId(null);
            setShowSimilarOverlay(true);
            setTimeout(() => setIsLoadingSimilar(false), 1000);
        }, 1500);
    };
    
    const handleSubcategorySelect = (slug: string | null) => {
        setSelectedSubcategory(slug);
        setCurrentPage(1);
    };

    const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
    const visibleProducts = sortedProducts.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);
    
    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo(0, 0);
        }
    };
    
    const pageTitle = selectedSubcategory
        ? selectedSubcategory.replace(/-/g, ' ').replace(/%26/g, '&').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
        : 'Women';

    return (
        <>
            <div className="min-h-screen bg-background text-foreground flex flex-col">
                 <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
                    <h1 className="text-xl font-bold truncate">{pageTitle}</h1>
                    <Link href="/cart">
                        <Button asChild variant="ghost" size="icon">
                            <ShoppingCart className="h-6 w-6" />
                        </Button>
                    </Link>
                </header>

                <div className="flex flex-1">
                    <aside className="hidden lg:block w-72 p-6 border-r sticky top-[65px] h-screen overflow-y-auto">
                        <WomensSidebar onSelectSubcategory={handleSubcategorySelect} selectedSubcategory={selectedSubcategory} />
                    </aside>
                    <main className="flex-1">
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
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                         <div className="p-6">
                            {isLoading ? (
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {Array.from({ length: 10 }).map((_, index) => <ProductCardSkeleton key={index} />)}
                                </div>
                            ) : visibleProducts.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {visibleProducts.map((product: any) => {
                                            const isNew = product.createdAt && differenceInHours(new Date(), new Date(product.createdAt)) <= 24;
                                            const isScanning = scanningProductId === product.key;
                                            const originalPrice = parseFloat(product.price.replace(/[^0-9.-]+/g,""));
                                            const hasDiscount = product.discountPercentage && product.discountPercentage > 0;
                                            const discountedPrice = hasDiscount ? originalPrice * (1 - product.discountPercentage / 100) : originalPrice;
                                            return (
                                                <Link href={`/product/${product.key}`} key={product.key} className="group block">
                                                    <Card className="w-full overflow-hidden h-full flex flex-col">
                                                        <div className="relative aspect-square bg-muted">
                                                            {isNew && <Badge className="absolute top-2 left-2 z-10">NEW</Badge>}
                                                            {product.isFromStream && <Badge variant="purple" className={cn("absolute z-10", isNew ? "top-10 left-2" : "top-2 left-2")}><Video className="h-3 w-3 mr-1"/> From Stream</Badge>}
                                                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-8 w-8 rounded-full bg-black/30 text-white backdrop-blur-sm z-10 hover:bg-black/50 hover:text-red-500"><Heart className="h-4 w-4" /></Button>
                                                            <Image src={product.images[0]} alt={product.name} fill sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw" className="object-cover transition-transform group-hover:scale-105" data-ai-hint={product.hint}/>
                                                            {isScanning && <div className="absolute inset-0 bg-black/30 overflow-hidden"><div className="scan-animation"></div></div>}
                                                            <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs text-white bg-black/50 px-1.5 py-0.5 rounded-full backdrop-blur-sm"><Star className="w-3 h-3 text-black fill-black" /><span className="font-bold">4.8</span></div>
                                                            <div className="absolute bottom-2 right-2">
                                                                <Button size="icon" className="h-8 w-8 rounded-full bg-black/50 text-white backdrop-blur-sm" onClick={(e) => handleSimilarClick(e, product)} disabled={isScanning}>
                                                                    {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <CardContent className="p-3 flex-grow flex flex-col">
                                                            <h4 className="font-semibold truncate text-sm flex-grow">{product.name}</h4>
                                                            <div className="flex items-baseline gap-x-2 mt-1">
                                                                <p className="font-bold text-sm text-foreground">₹{discountedPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                                                {hasDiscount && (
                                                                    <>
                                                                        <p className="text-xs text-muted-foreground line-through">₹{originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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
                                                    <Button variant="outline" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4 mr-1" /> Previous</Button>
                                                </PaginationItem>
                                                <PaginationItem>
                                                    <span className="p-2 text-sm">Page {currentPage} of {totalPages}</span>
                                                </PaginationItem>
                                                <PaginationItem>
                                                    <Button variant="outline" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next <ChevronRight className="h-4 w-4 ml-1" /></Button>
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
                        </div>
                    </main>
                </div>
                <Footer />
            </div>
             {showSimilarOverlay && <SimilarProductsOverlay isOpen={showSimilarOverlay} onClose={() => setShowSimilarOverlay(false)} similarProducts={similarProducts} relatedStreams={[]} isLoading={isLoadingSimilar} />}
        </>
    );
}
