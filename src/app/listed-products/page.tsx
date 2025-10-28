
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
import { Menu, ShoppingBag, User, X, ChevronRight, ArrowLeft, Search, List, Star, Package, Users, ArrowRight } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from 'next/image';
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { categories } from "@/lib/categories";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { productDetails } from "@/lib/product-data";
import ProductSearch from "@/components/ProductSearch";
import { PromotionalCarousel } from "@/components/promotional-carousel";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const allCategories = categories;

const collageCategories = [
    { name: "Women", href: "/women", imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=1200&fit=crop", hint: "woman shopping", gridClass: "md:row-span-2 md:col-span-2" },
    { name: "Men", href: "/men", imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1200&fit=crop", hint: "man wearing t-shirt", gridClass: "" },
    { name: "Electronics", href: "/electronics", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop", hint: "headphones", gridClass: "" },
    { name: "Home", href: "/home", imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8cbf?w=800&h=800&fit=crop", hint: "kitchen", gridClass: "md:row-span-2 md:col-span-2" },
    { name: "Kids", href: "/kids", imageUrl: "https://images.unsplash.com/photo-1519340241574-289a2b421515?w=800&h=1200&fit=crop", hint: "girl wearing dress", gridClass: "" },
    { name: "Trending", href: "/trending", imageUrl: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800&h=800&fit=crop", hint: "fashion clothes rack", gridClass: "" },
];


export default function ListedProductsPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const trendingProducts = useMemo(() => {
    return Object.values(productDetails)
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 10);
  }, []);

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
              <Card className="w-full group overflow-hidden h-full flex flex-col">
                <div className="aspect-square bg-muted rounded-t-lg overflow-hidden relative">
                  <Image
                    src={p.images?.[0] || "https://placehold.co/200x200.png"}
                    alt={p.name}
                    fill
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-3 flex-grow flex flex-col">
                    <h4 className="font-semibold truncate text-sm flex-grow">{p.name}</h4>
                    <p className="font-bold text-foreground mt-1">{p.price}</p>
                    <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
                        <Star className="w-4 h-4 fill-current" />
                        <span>4.8</span>
                        <span className="text-muted-foreground">(1.2k reviews)</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <div className="flex items-center gap-1"><Package className="w-3 h-3" /> {p.stock} left</div>
                        <div className="flex items-center gap-1"><Users className="w-3 h-3" /> {p.sold} sold</div>
                    </div>
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
           <div className="space-y-16">
              <PromotionalCarousel />
              
                <section>
                    <div className="text-left mb-8">
                        <h2 className="text-3xl font-bold tracking-tight">Shop By Category</h2>
                        <p className="text-muted-foreground mt-1">Explore our curated collections.</p>
                    </div>
                     <div className="grid grid-cols-2 md:grid-cols-4 md:auto-rows-[250px] gap-4">
                        {collageCategories.map((item) => (
                            <Link href={item.href} key={item.name} className={cn("group relative rounded-lg overflow-hidden", item.gridClass)}>
                                <Image
                                    src={item.imageUrl}
                                    alt={item.name}
                                    fill
                                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                                    data-ai-hint={item.hint}
                                />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
                                <div className="absolute inset-0 p-4 flex flex-col justify-end">
                                    <h3 className="text-xl font-bold text-white">{item.name}</h3>
                                    <Button variant="secondary" size="sm" className="mt-2 w-fit">Shop Now</Button>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
           </div>
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
