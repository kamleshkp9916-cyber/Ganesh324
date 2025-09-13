
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Menu, ShoppingCart, User, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { HUB_BANNER_KEY, HubBanner } from "@/app/admin/settings/page";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from 'next/image';
import { Skeleton } from "@/components/ui/skeleton";


const menSubcategories = {
  explore: ["All Men’s Clothing", "New Arrivals"],
  shop: ["T-Shirts", "Shirts", "Jeans", "Jackets", "Shoes"],
  more: ["Grooming", "Accessories"],
};

const womenSubcategories = {
  explore: ["All Women’s Clothing", "New Arrivals"],
  shop: ["Dresses", "Tops", "Pants", "Shoes", "Bags"],
  more: ["Beauty", "Accessories"],
};

const kidsSubcategories = {
  explore: ["All Kids’ Clothing"],
  shop: ["T-Shirts", "Shorts", "Dresses", "School Bags", "Toys"],
  more: ["Baby Care", "Accessories"],
};

const electronicsSubcategories = {
  explore: ["All Electronics", "New Arrivals"],
  shop: ["Mobiles", "Laptops", "Smartwatches", "Headphones", "TVs"],
  more: ["Accessories", "Gaming"],
};

const defaultHubBanner: HubBanner = {
    title: "Mega Electronics Sale",
    description: "Up to 40% off on all smartphones, laptops, and accessories. Limited time offer!",
    imageUrl: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=1200&h=400&fit=crop"
};


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

function MegaMenuContent({ title, subcategories }: { title: string, subcategories: Record<string, string[]> }) {
    return (
        <div className="p-6 md:w-[500px] lg:w-[600px]">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            <div className="grid grid-cols-3 gap-6">
                {Object.entries(subcategories).map(([key, links]) => (
                    <div key={key}>
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">{key}</h4>
                        <ul className="space-y-2">
                            {links.map((link) => (
                                <li key={link}>
                                    <Link href="#" className="text-sm hover:text-primary transition-colors">
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function ListedProductsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const router = useRouter();
  const [hubBanner] = useLocalStorage<HubBanner>(HUB_BANNER_KEY, defaultHubBanner);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
                                    <Link href="/home" legacyBehavior passHref>
                                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>Home</NavigationMenuLink>
                                    </Link>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger>Men</NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <MegaMenuContent title="Men" subcategories={menSubcategories} />
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger>Women</NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                         <MegaMenuContent title="Women" subcategories={womenSubcategories} />
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger>Kids</NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <MegaMenuContent title="Kids" subcategories={kidsSubcategories} />
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <NavigationMenuTrigger>Electronics</NavigationMenuTrigger>
                                    <NavigationMenuContent>
                                        <MegaMenuContent title="Electronics" subcategories={electronicsSubcategories} />
                                    </NavigationMenuContent>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <Link href="#" legacyBehavior passHref>
                                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>Auctions</NavigationMenuLink>
                                    </Link>
                                </NavigationMenuItem>
                                <NavigationMenuItem>
                                    <Link href="/help" legacyBehavior passHref>
                                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>Help</NavigationMenuLink>
                                    </Link>
                                </NavigationMenuItem>
                                 <NavigationMenuItem>
                                    <Link href="/contact" legacyBehavior passHref>
                                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>Contact Us</NavigationMenuLink>
                                    </Link>
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
                                    {['Home', 'Men', 'Women', 'Kids', 'Electronics', 'Auctions', 'Help', 'Contact Us'].map(item => (
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
              <CardContent className="p-0 relative aspect-[3/1]">
                <Image
                  src={hubBanner.imageUrl}
                  alt={hubBanner.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-4">
                   <h2 className="text-4xl font-bold text-white shadow-lg">{hubBanner.title}</h2>
                   <p className="text-lg text-white/90 mt-2 shadow-lg max-w-lg">{hubBanner.description}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Skeleton className="w-full aspect-[3/1] mb-10" />
          )}

        <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">Choose a Category</h1>
            <p className="text-muted-foreground mt-4 text-lg">
                Please select a category or subcategory from the menu above to start browsing products.
            </p>
        </div>
      </main>
    </div>
  );
}
