
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

const allCategories = categories;

const collageCategories = [
    { name: "Women", href: "/women", imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=1200&fit=crop", hint: "woman shopping", gridClass: "md:row-span-2 md:col-span-2" },
    { name: "Men", href: "/men", imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1200&fit=crop", hint: "man wearing t-shirt", gridClass: "" },
    { name: "Electronics", href: "/electronics", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop", hint: "headphones", gridClass: "" },
    { name: "Kids", href: "/kids", imageUrl: "https://images.unsplash.com/photo-1519340241574-289a2b421515?w=800&h=1200&fit=crop", hint: "girl wearing dress", gridClass: "" },
    { name: "Home", href: "/home", imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8cbf?w=800&h=800&fit=crop", hint: "kitchen", gridClass: "md:col-span-2" },
];

const brandLogos = [
    { name: 'BrandA', logo: 'https://placehold.co/120x60.png?text=BrandA' },
    { name: 'BrandB', logo: 'https://placehold.co/120x60.png?text=BrandB' },
    { name: 'BrandC', logo: 'https://placehold.co/120x60.png?text=BrandC' },
    { name: 'BrandD', logo: 'https://placehold.co/120x60.png?text=BrandD' },
    { name: 'BrandE', logo: 'https://placehold.co/120x60.png?text=BrandE' },
    { name: 'BrandF', logo: 'https://placehold.co/120x60.png?text=BrandF' },
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
                    <h2 className="text-3xl font-bold text-center mb-6">Explore by Category</h2>
                     <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[250px] gap-4">
                        {collageCategories.map((category) => (
                            <Link href={category.href} key={category.name} className={cn("group relative rounded-lg overflow-hidden", category.gridClass)}>
                                <Image
                                    src={category.imageUrl}
                                    alt={category.name}
                                    fill
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                                    data-ai-hint={category.hint}
                                />
                                <div className="absolute inset-0 bg-black/30" />
                                <div className="absolute inset-0 flex items-end p-4">
                                    <h3 className="text-xl font-bold text-white">{category.name}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
                
                <section>
                    <h2 className="text-3xl font-bold text-center mb-6">Trending Now</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {trendingProducts.slice(0, 5).map(product => (
                            <Link href={`/product/${product.key}`} key={product.key} className="group block">
                                <Card className="w-full overflow-hidden h-full flex flex-col">
                                    <div className="relative aspect-square bg-muted">
                                        <Image src={product.images[0]} alt={product.name} fill sizes="20vw" className="object-cover group-hover:scale-105 transition-transform" />
                                    </div>
                                    <div className="p-3">
                                        <h4 className="font-semibold text-sm truncate">{product.name}</h4>
                                        <p className="font-bold">{product.price}</p>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </section>
                
                <section>
                    <h2 className="text-3xl font-bold text-center mb-6">Shop by Brand</h2>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        {brandLogos.map(brand => (
                            <div key={brand.name} className="p-2 border rounded-md hover:shadow-md transition-shadow">
                                <Image src={brand.logo} alt={brand.name} width={120} height={60} className="object-contain" />
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-8 grid md:grid-cols-2 gap-8 items-center">
                            <div className="space-y-4">
                                <Badge variant="secondary">Seller Spotlight</Badge>
                                <h3 className="text-3xl font-bold">Meet GadgetGuru</h3>
                                <p className="text-muted-foreground">"I'm passionate about bringing you the best and latest in technology. From unboxings to in-depth reviews, my streams are all about helping you make the right choice for your tech needs. Join my community of enthusiasts!"</p>
                                <Button asChild>
                                    <Link href="/seller/profile?userId=gadgetguru-uid">
                                        View Profile <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                             <div className="relative aspect-square rounded-lg overflow-hidden">
                                <Image src="https://images.unsplash.com/photo-1550009158-94ae76552485?w=800&h=800&fit=crop" alt="GadgetGuru" fill className="object-cover" />
                            </div>
                        </CardContent>
                    </Card>
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
