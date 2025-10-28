
"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ShoppingBag, User, X, ChevronRight, ArrowLeft, Search, List } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { HUB_BANNER_KEY, HubBanner, HUB_FEATURED_PRODUCTS_KEY, FeaturedProduct } from '@/app/admin/settings/page';
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from 'next/image';
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { categories } from "@/lib/categories";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { productDetails } from "@/lib/product-data";
import ProductSearch from "@/components/ProductSearch";

const allCategories = categories;

const defaultHubBanner: HubBanner = {
    title: "Mega Electronics Sale",
    description: "Up to 40% off on all smartphones, laptops, and accessories. Limited time offer!",
    imageUrl: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=1200&h=400&fit=crop"
};

const defaultFeaturedProducts: FeaturedProduct[] = [
  { imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop', name: 'Latest Laptop', model: 'Model Pro X' },
  { imageUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=500&h=500&fit=crop', name: 'Smartphone', model: 'SmartX 12' },
  { imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop', name: 'Headphones', model: 'AudioMax 3' },
];

const collageCategories = [
    { name: "Women", href: "/women", imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=1200&fit=crop", hint: "woman shopping", colSpan: "col-span-2", rowSpan: "row-span-2" },
    { name: "Men", href: "/men", imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1200&fit=crop", hint: "man wearing t-shirt", colSpan: "col-span-1", rowSpan: "row-span-1" },
    { name: "Electronics", href: "/electronics", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop", hint: "headphones", colSpan: "col-span-1", rowSpan: "row-span-1" },
    { name: "Kids", href: "/kids", imageUrl: "https://images.unsplash.com/photo-1519340241574-289a2b421515?w=800&h=1200&fit=crop", hint: "girl wearing dress", colSpan: "col-span-1", rowSpan: "row-span-1" },
    { name: "Home", href: "/home", imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8cbf?w=800&h=800&fit=crop", hint: "kitchen", colSpan: "col-span-2", rowSpan: "row-span-1" },
];

export default function ListedProductsPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [hubBanner, setHubBanner] = useState<HubBanner>(defaultHubBanner);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>(defaultFeaturedProducts);
  const [isMounted, setIsMounted] = useState(false);
  
  const [storedHubBanner] = useLocalStorage<HubBanner>(HUB_BANNER_KEY, defaultHubBanner);
  const [storedFeaturedProducts] = useLocalStorage<FeaturedProduct[]>(HUB_FEATURED_PRODUCTS_KEY, defaultFeaturedProducts);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  useEffect(() => {
    if(isMounted) {
        setHubBanner(storedHubBanner);
        setFeaturedProducts(storedFeaturedProducts);
    }
  }, [isMounted, storedHubBanner, storedFeaturedProducts])

  const getCategoryPath = (categoryName: string, subcategoryName?: string) => {
    const basePath = `/${categoryName.toLowerCase().replace(/\s+/g, '-')}`;
    if (subcategoryName) {
        return `${basePath}/${subcategoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '%26')}`;
    }
    return basePath;
  }
  
  const onSearchComplete = useCallback((results: any[], query: string) => {
    setSearchResults(results);
    setSearchQuery(query);
    setShowSearchResults(!!query);
  }, []);
  
  const renderSearchResults = () => (
    <div className="container mx-auto py-6">
      <h2 className="text-2xl font-bold mb-4">
        Search Results for "{searchQuery}"
      </h2>
      {searchResults.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {searchResults.map((p) => (
            <Link href={`/product/${p.key}`} key={p.id} className="group block">
              <Card className="w-full group overflow-hidden">
                <div className="aspect-square bg-muted rounded-t-lg overflow-hidden relative">
                  <Image
                    src={p.images?.[0] || "https://placehold.co/200x200.png"}
                    alt={p.name}
                    fill
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-3">
                  <h4 className="font-semibold truncate text-sm">{p.name}</h4>
                  <p className="font-bold text-foreground">{p.price}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p>No products found for "{searchQuery}".</p>
        </div>
      )}
    </div>
  );


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
       <header className="border-b sticky top-0 bg-background/95 z-50">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                     <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="-ml-2" onClick={() => {
                            if (showSearchResults) {
                                setShowSearchResults(false);
                                setSearchQuery('');
                                setSearchResults([]);
                            } else {
                                router.back()
                            }
                        }}>
                          <ArrowLeft className="h-6 w-6" />
                        </Button>
                        <Link href="/live-selling" className="flex items-center gap-2">
                            <span className="font-bold text-lg hidden sm:inline-block">StreamCart</span>
                        </Link>
                    </div>

                    <div className="hidden lg:flex flex-1 justify-center px-8">
                         <div className="w-full max-w-lg">
                           <ProductSearch onSearchComplete={onSearchComplete} />
                         </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                            <Search className="h-6 w-6 lg:hidden" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <User className="h-6 w-6" />
                        </Button>
                         <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-full max-w-sm p-0 flex flex-col">
                                <SheetHeader className="flex justify-between items-center p-4 border-b">
                                    <Link href="/live-selling" className="flex items-center gap-2">
                                        <SheetTitle className="font-bold text-lg">StreamCart</SheetTitle>
                                    </Link>
                                </SheetHeader>
                                <ScrollArea className="flex-grow">
                                    <div className="p-4">
                                        <Accordion type="multiple" className="w-full">
                                            {allCategories.map(({name, subcategories}) => (
                                                <AccordionItem value={name} key={name}>
                                                    <AccordionTrigger className="text-base font-semibold">
                                                        <Link href={getCategoryPath(name)} onClick={() => setMobileMenuOpen(false)}>
                                                            {name}
                                                        </Link>
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        <div className="flex flex-col space-y-2 pl-4">
                                                            {subcategories.map(sub => (
                                                                <Link key={sub.name} href={getCategoryPath(name, sub.name)} className="text-sm text-muted-foreground hover:text-foreground py-1" onClick={() => setMobileMenuOpen(false)}>
                                                                    {sub.name}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            ))}
                                        </Accordion>
                                    </div>
                                </ScrollArea>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
             <nav className="hidden lg:flex items-center justify-center border-t bg-background">
                <NavigationMenu>
                    <NavigationMenuList>
                        {allCategories.map((category) => (
                        <NavigationMenuItem key={category.name}>
                            <NavigationMenuTrigger>{category.name}</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                                    {category.subcategories.map((component) => (
                                        <ListItem
                                            key={component.name}
                                            title={component.name}
                                            href={getCategoryPath(category.name, component.name)}
                                        >
                                          {component.description}
                                        </ListItem>
                                    ))}
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>
            </nav>
        </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow">
         
         {showSearchResults ? renderSearchResults() : (
           <>
            {isMounted && hubBanner ? (
            <Card className="overflow-hidden border-none shadow-lg mb-10">
            <CardContent className="p-0 relative">
                <div className="aspect-[3/1] relative">
                    <Image
                    src={hubBanner.imageUrl}
                    alt={hubBanner.title}
                    fill
                    sizes="100vw"
                    className="object-cover"
                    data-ai-hint="electronics sale gadgets"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-4">
                    <h2 className="text-4xl font-bold text-white shadow-lg">{hubBanner.title}</h2>
                    <p className="text-lg text-white/90 mt-2 shadow-lg max-w-lg">{hubBanner.description}</p>
                    </div>
                </div>
                {featuredProducts && featuredProducts.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 bg-card-foreground/5">
                    {featuredProducts.map((product, index) => (
                    <Link href="#" key={index} className="group p-4 flex items-center gap-4 hover:bg-card-foreground/10 transition-colors">
                        <div className="relative w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                        <Image src={product.imageUrl} alt={product.name} fill sizes="80px" className="object-cover group-hover:scale-105 transition-transform" data-ai-hint={product.name.toLowerCase()} />
                        </div>
                        <div>
                        <p className="font-semibold text-sm group-hover:underline">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.model}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto group-hover:translate-x-1 transition-transform" />
                    </Link>
                    ))}
                </div>
                )}
            </CardContent>
            </Card>
        ) : (
            <Skeleton className="w-full aspect-[3/1] mb-10" />
        )}

        <section className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-6">Shop by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[minmax(0,_300px)]">
                {collageCategories.map((cat, index) => (
                    <Link key={index} href={getCategoryPath(cat.name)} className={cn("group relative rounded-lg overflow-hidden shadow-lg", cat.colSpan, cat.rowSpan)}>
                        <Image
                            src={cat.imageUrl}
                            alt={cat.name}
                            fill
                            sizes="(max-width: 768px) 50vw, 25vw"
                            className="object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-105"
                            data-ai-hint={cat.hint}
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <h3 className="text-2xl font-bold text-white text-center p-2">{cat.name}</h3>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
        </>
         )}
      </main>
    </div>
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"
