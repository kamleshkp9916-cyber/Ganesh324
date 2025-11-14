

"use client";

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import React, { useState, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu, Search, User, ShoppingCart, Home, ChevronRight, ListFilter, Star, Package, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MensSidebar } from '@/components/mens-sidebar';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { CATEGORY_BANNERS_KEY, CategoryBanners } from '@/app/admin/settings/page';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { productDetails } from '@/lib/product-data';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { differenceInHours } from 'date-fns';
import { cn } from '@/lib/utils';
import ProductSearch from '@/components/ProductSearch';
import { Footer } from '@/components/footer';

const PRODUCTS_PER_PAGE = 30;

const categories = [
    { name: "Shirts", image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=400&h=500&fit=crop", hint: "man wearing shirt" },
    { name: "Pants & Shorts", image: "https://images.unsplash.com/photo-1542272604-787c38E2C73b?w=400&h=500&fit=crop", hint: "men's pants" },
    { name: "Coats & Jackets", image: "https://images.unsplash.com/photo-1520975954732-35dd222996b7?w=400&h=500&fit=crop", hint: "man wearing jacket" },
    { name: "Activewear", image: "https://images.unsplash.com/photo-1544216717-3bbf52512659?w=400&h=500&fit=crop", hint: "man in activewear" },
    { name: "Jeans", image: "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=400&h=500&fit=crop", hint: "man wearing jeans" },
    { name: "Underwear & Socks", image: "https://images.unsplash.com/photo-1613031027735-d72b535804e3?w=400&h=500&fit=crop", hint: "men's underwear" },
    { name: "Pajamas & Robes", image: "https://images.unsplash.com/photo-1576523993214-94ac33b58474?w=400&h=500&fit=crop", hint: "man in pajamas" },
    { name: "Suits & Tuxedos", image: "https://images.unsplash.com/photo-1593030339999-d438a5a5a6a6?w=400&h=500&fit=crop", hint: "man in suit" },
    { name: "Shoes", image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=500&fit=crop", hint: "men's shoes" },
    { name: "Accessories", image: "https://images.unsplash.com/photo-1615102581648-6346305a4132?w=400&h=500&fit=crop", hint: "men's watch" },
    { name: "Big & Tall", image: "https://images.unsplash.com/photo-1607346256330-58d35961a1a7?w=400&h=500&fit=crop", hint: "tall man" },
];

const defaultBanners: CategoryBanners = {
    "Men": {
        banner1: { title: '40% off', description: 'Top Brand Polos & Tees. Limited time only.', imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=800&fit=crop' },
        banner2: { title: 'Activewear Collection', description: 'Engineered to keep you cool, dry, and comfortable.', imageUrl: 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=1200&h=600&fit=crop' }
    }
} as any;

const ProductCardSkeleton = () => (
    <Card className="w-full">
        <Skeleton className="aspect-square w-full rounded-t-lg" />
        <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
        </div>
    </Card>
);

export default function MensPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const subcategory = params.subcategory?.[0];

  const [banners] = useLocalStorage<CategoryBanners>(CATEGORY_BANNERS_KEY, defaultBanners);
  const [isMounted, setIsMounted] = useState(false);
  const [sortOption, setSortOption] = useState("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(subcategory || null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
      setIsMounted(true);
      if(subcategory) {
        setSelectedSubcategory(subcategory);
      }
      setIsLoading(false);
  }, [subcategory]);

  const onSearchComplete = useCallback((results: any[], query: string) => {
    setSearchResults(results);
    setSearchQuery(query);
    setShowSearchResults(results.length > 0 || query.length > 0);
    setCurrentPage(1);
  }, []);

  const handleSubcategorySelect = (slug: string | null) => {
    setIsLoading(true);
    setSelectedSubcategory(slug);
    router.push(slug ? `/men/${slug}` : '/men', { scroll: false });
  };
  
  const allProducts = useMemo(() => Object.values(productDetails), []);

  const categoryProducts = useMemo(() => {
    return allProducts.filter(product => {
        const productCategorySlug = product.category.toLowerCase().replace(/\s+/g, '-');
        const productSubCategorySlug = product.subcategory?.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '%26');
        
        if (selectedSubcategory) {
            return productCategorySlug === 'men' && productSubCategorySlug === selectedSubcategory;
        }
        return productCategorySlug === 'men';
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
  
  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const visibleProducts = sortedProducts.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    }
  };

  const banner1 = banners?.Men?.banner1;
  const banner2 = banners?.Men?.banner2;

  const getSubCategoryPath = (name: string) => {
    const subCategorySlug = name.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '%26');
    return `/men/${subCategorySlug}`;
  };
  
  const pageTitle = selectedSubcategory
    ? selectedSubcategory.replace(/-/g, ' ').replace(/%26/g, '&').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Men';

  return (
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
             <MensSidebar onSelectSubcategory={handleSubcategorySelect} selectedSubcategory={selectedSubcategory} />
          </aside>
          <main className="flex-1">
             <div className="p-4 border-b flex flex-col sm:flex-row items-center gap-4 sticky top-[65px] bg-background/80 backdrop-blur-sm z-20 -mx-4 sm:mx-0">
                <div className="flex items-center gap-2 w-full">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="lg:hidden"><ArrowLeft/></Button>
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="lg:hidden">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-80">
                           <MensSidebar onSelectSubcategory={handleSubcategorySelect} selectedSubcategory={selectedSubcategory} />
                        </SheetContent>
                    </Sheet>
                    <div className="relative flex-1">
                       <ProductSearch onSearchComplete={onSearchComplete} />
                    </div>
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
                {!selectedSubcategory && !showSearchResults && (
                    <div className="space-y-10 pb-10">
                        <section>
                            <Card className="overflow-hidden bg-gray-100 dark:bg-gray-900 border-none">
                                {isMounted && banner1 ? (
                                    <CardContent className="p-0 flex flex-col md:flex-row items-center">
                                        <div className="md:w-1/2 p-8 text-center md:text-left">
                                            <h3 className="text-3xl font-bold">{banner1.title}</h3>
                                            <p className="text-xl">{banner1.description}</p>
                                            <Button asChild variant="link" className="mt-4 px-0">
                                                <Link href="/sale">Shop Now</Link>
                                            </Button>
                                        </div>
                                        <div className="md:w-1/2 h-64 md:h-auto md:aspect-square relative">
                                            <Image 
                                                src={banner1.imageUrl}
                                                alt={banner1.title}
                                                fill
                                                className="object-cover"
                                                data-ai-hint="man fashion"
                                            />
                                        </div>
                                    </CardContent>
                                ) : (
                                    <Skeleton className="w-full h-80" />
                                )}
                            </Card>
                        </section>
                        <section>
                            <Card className="overflow-hidden relative text-white">
                                {isMounted && banner2 ? (
                                    <>
                                        <div className="absolute inset-0 bg-black/40 z-10" />
                                        <Image 
                                            src={banner2.imageUrl}
                                            alt={banner2.title}
                                            fill
                                            className="object-cover"
                                            data-ai-hint="man running"
                                        />
                                        <CardContent className="relative z-20 p-8 md:p-12 flex flex-col items-center justify-center text-center h-80">
                                            <p className="text-lg">Performance Enhanced</p>
                                            <h3 className="text-4xl font-bold my-2">{banner2.title}</h3>
                                            <p className="max-w-md">{banner2.description}</p>
                                            <Button asChild variant="link" className="mt-4 text-white">
                                                <Link href={getSubCategoryPath("Activewear")}>Shop The Collection</Link>
                                            </Button>
                                        </CardContent>
                                    </>
                                ) : (
                                    <Skeleton className="w-full h-80" />
                                )}
                            </Card>
                        </section>
                        <section>
                            <h2 className="text-xl font-semibold mb-4 text-center">Shop by category</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {categories.map(category => (
                                    <Link href={getSubCategoryPath(category.name)} key={category.name} className="group block text-center">
                                        <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-2">
                                            <Image 
                                                src={category.image}
                                                alt={category.name}
                                                width={200}
                                                height={200}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                data-ai-hint={category.hint}
                                            />
                                        </div>
                                        <p className="text-sm font-medium group-hover:underline">{category.name}</p>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
                
                {(selectedSubcategory || showSearchResults) && (
                    <>
                        {isLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {Array.from({ length: 10 }).map((_, index) => <ProductCardSkeleton key={index} />)}
                            </div>
                        ) : visibleProducts.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {visibleProducts.map((product) => {
                                         const isNew = product.createdAt && differenceInHours(new Date(), new Date(product.createdAt)) <= 24;
                                         return (
                                             <Link href={`/product/${product.key}`} key={product.key} className="group block">
                                                <Card className="w-full group overflow-hidden h-full flex flex-col">
                                                    <div className="relative aspect-square bg-muted">
                                                         {isNew && <Badge className="absolute top-2 left-2 z-10">NEW</Badge>}
                                                         <Image
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            fill
                                                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                                            className="object-cover transition-transform group-hover:scale-105"
                                                            data-ai-hint={product.hint}
                                                        />
                                                    </div>
                                                    <CardContent className="p-3 flex-grow flex flex-col">
                                                        <h4 className="font-semibold truncate text-sm flex-grow">{product.name}</h4>
                                                        <p className="font-bold text-foreground mt-1">{product.price}</p>
                                                         <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
                                                            <Star className="w-4 h-4 fill-current" />
                                                            <span>4.8</span>
                                                            <span className="text-muted-foreground">(1.2k reviews)</span>
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
                                                <Button variant="outline" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronRight className="h-4 w-4 mr-1" /> Previous</Button>
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
                    </>
                )}
            </div>
          </main>
      </div>
      <Footer />
    </div>
  );
}
