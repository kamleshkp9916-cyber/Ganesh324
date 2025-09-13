
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
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ShoppingCart, User, X, ChevronRight, ShoppingBag } from "lucide-react";
import { Logo } from "@/components/logo";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { HUB_BANNER_KEY, HubBanner, HUB_FEATURED_PRODUCTS_KEY, FeaturedProduct } from '@/app/admin/settings/page';
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from 'next/image';
import { Skeleton } from "@/components/ui/skeleton";

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
  );
});
ListItem.displayName = "ListItem";

const womenSubcategories = ["All Women’s Clothing", "New Arrivals", "Dresses", "Tops", "Pants", "Shoes", "Bags", "Beauty", "Accessories"];
const menSubcategories = ["All Men’s Clothing", "New Arrivals", "T-Shirts", "Shirts", "Jeans", "Jackets", "Shoes", "Grooming", "Accessories"];
const kidsSubcategories = ["All Kids’ Clothing", "T-Shirts", "Shorts", "Dresses", "School Bags", "Toys", "Baby Care", "Accessories"];
const electronicsSubcategories = ["All Electronics", "New Arrivals", "Mobiles", "Laptops", "Smartwatches", "Headphones", "TVs", "Accessories", "Gaming"];
const shoesSubcategories = ["Women's Boots", "Women's Sneakers", "Women's Sandals", "Women's Heels", "Men's Boots", "Men's Sneakers", "Men's Dress Shoes", "Girls' Shoes", "Boys' Shoes"];
const handbagsSubcategories = ["All Handbags", "Totes", "Crossbody Bags", "Shoulder Bags", "Clutches", "Backpacks", "Wallets", "New Arrivals", "Sale"];
const trendingSubcategories = ["New Arrivals", "Best Sellers", "Top Rated", "Women's Trending", "Men's Trending", "Home Decor Trends"];
const saleSubcategories = ["Women's Sale", "Men's Sale", "Kids' Sale", "Home Sale", "Clearance", "Up to 50% Off", "Final Sale"];


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
    { name: "Women's Fashion", href: "/womens-clothing", imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=1200&fit=crop", hint: "woman shopping", colSpan: "col-span-2", rowSpan: "row-span-2" },
    { name: "Men's Style", href: "/mens-clothing", imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&h=1200&fit=crop", hint: "man wearing t-shirt", colSpan: "col-span-1", rowSpan: "row-span-1" },
    { name: "Electronics", href: "/electronics", imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop", hint: "headphones", colSpan: "col-span-1", rowSpan: "row-span-1" },
    { name: "Kids' Corner", href: "/kids", imageUrl: "https://images.unsplash.com/photo-1519340241574-289a2b421515?w=800&h=1200&fit=crop", hint: "girl wearing dress", colSpan: "col-span-1", rowSpan: "row-span-1" },
    { name: "Home Goods", href: "/home", imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8cbf?w=800&h=800&fit=crop", hint: "kitchen", colSpan: "col-span-2", rowSpan: "row-span-1" },
];


function MegaMenuContent({ title, subcategories, href }: { title: string, subcategories: string[], href: string }) {
    return (
      <ul className="grid gap-3 p-6 md:w-[250px]">
        <ListItem href={href} title={title}>
            Browse all products in this category.
        </ListItem>
        {subcategories.map((link) => (
          <ListItem key={link} href="#" title={link} />
        ))}
      </ul>
    );
}

export default function ListedProductsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [hubBanner] = useLocalStorage<HubBanner>(HUB_BANNER_KEY, defaultHubBanner);
  const [featuredProducts] = useLocalStorage<FeaturedProduct[]>(HUB_FEATURED_PRODUCTS_KEY, defaultFeaturedProducts);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const getCategoryUrl = (categoryName: string) => `/${categoryName.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
       <header className="border-b sticky top-0 bg-background/95 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                     <div className="flex items-center gap-4">
                        <Link href="/live-selling" className="flex items-center gap-2">
                            <Logo className="h-7 w-7" />
                            <span className="font-bold text-lg hidden sm:inline-block">StreamCart</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex">
                         <NavigationMenu>
                            <NavigationMenuList>
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger>Women</NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                         <MegaMenuContent title="All Women's" subcategories={womenSubcategories} href="/womens-clothing" />
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger>Men</NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <MegaMenuContent title="All Men's" subcategories={menSubcategories} href="/mens-clothing" />
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger>Kids</NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <MegaMenuContent title="All Kids'" subcategories={kidsSubcategories} href="/kids" />
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger>Electronics</NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <MegaMenuContent title="All Electronics" subcategories={electronicsSubcategories} href="/electronics" />
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger>Shoes</NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <MegaMenuContent title="All Shoes" subcategories={shoesSubcategories} href="/shoes" />
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                                 <NavigationMenuItem>
                                    <NavigationMenuTrigger>Handbags</NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <MegaMenuContent title="All Handbags" subcategories={handbagsSubcategories} href="/handbags" />
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger>Trending</NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <MegaMenuContent title="All Trending" subcategories={trendingSubcategories} href="/trending" />
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                                 <NavigationMenuItem>
                                    <NavigationMenuTrigger>Sale</NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <MegaMenuContent title="All Sale" subcategories={saleSubcategories} href="/sale" />
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                            <User className="h-6 w-6" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <ShoppingCart className="h-6 w-6" />
                        </Button>
                         <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-full max-w-sm">
                                <div className="flex justify-between items-center p-4 border-b">
                                    <h2 className="text-lg font-semibold">Menu</h2>
                                     <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                                        <X className="h-6 w-6" />
                                    </Button>
                                </div>
                                <div className="p-4 space-y-2">
                                    {['Women', 'Men', 'Kids', 'Electronics', 'Shoes', 'Handbags', 'Trending', 'Sale'].map(item => (
                                        <Link key={item} href="#" className="block p-3 rounded-md text-base font-medium hover:bg-accent" onClick={() => setMobileMenuOpen(false)}>
                                            {item}
                                        </Link>
                                    ))}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow">
          {isMounted && hubBanner ? (
            <Card className="overflow-hidden border-none shadow-lg mb-10">
              <CardContent className="p-0 relative">
                <div className="aspect-[3/1] relative">
                    <Image
                      src={hubBanner.imageUrl}
                      alt={hubBanner.title}
                      fill
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
                           <Image src={product.imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform" data-ai-hint={product.name.toLowerCase()} />
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
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[250px] md:auto-rows-[300px]">
                {collageCategories.map((cat, index) => (
                    <Link key={index} href={getCategoryUrl(cat.name)} className={cn("group relative rounded-lg overflow-hidden shadow-lg", cat.colSpan, cat.rowSpan)}>
                        <Image
                            src={cat.imageUrl}
                            alt={cat.name}
                            fill
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
      </main>
    </div>
  );
}
