
"use client";

import { useState } from 'react';
import Link from 'next/link';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X, Search, User, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";
import React from 'react';
import { Logo } from './logo';
import { useAuth } from '@/hooks/use-auth.tsx';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';

const shopLinks: { title: string; href: string; description: string }[] = [
  { title: "Clothing", href: "/mens-clothing", description: "Apparel for all seasons and styles." },
  { title: "Electronics", href: "/electronics", description: "The latest gadgets and tech." },
  { title: "Accessories", href: "/handbags", description: "Complete your look with our accessories." },
  { title: "Kids", href: "/kids", description: "Fun and stylish options for children." },
  { title: "Sale", href: "/sale", description: "Find the best deals and discounts." },
];

const collectionsLinks: { title: string; href: string; description: string }[] = [
  { title: "New Arrivals", href: "/trending", description: "Check out the latest products." },
  { title: "Trending", href: "/trending", description: "See what's popular right now." },
  { title: "Featured", href: "/trending", description: "Our top picks for you." },
  { title: "Best Sellers", href: "/top-seller", description: "Discover our most loved items." },
];

export function MainHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, userData } = useAuth();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center">
        {/* Mobile Menu */}
        <div className="lg:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="grid gap-6 text-lg font-medium mt-8">
                <Link href="/live-selling" className="hover:text-primary" onClick={() => setIsOpen(false)}>Home</Link>
                <Link href="/mens-clothing" className="hover:text-primary" onClick={() => setIsOpen(false)}>Shop</Link>
                <Link href="/trending" className="hover:text-primary" onClick={() => setIsOpen(false)}>Collections</Link>
                <Link href="/live-selling" className="hover:text-primary" onClick={() => setIsOpen(false)}>Live Shopping</Link>
                <Link href="/help" className="hover:text-primary" onClick={() => setIsOpen(false)}>Help</Link>
                <Link href="/contact" className="hover:text-primary" onClick={() => setIsOpen(false)}>Contact Us</Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-4">
           <Link href="/live-selling" className="flex items-center gap-2 mr-6">
                <Logo />
            </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link href="/live-selling" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Home</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Shop</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                    {shopLinks.map((component) => (
                      <ListItem key={component.title} title={component.title} href={component.href}>
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Collections</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                    {collectionsLinks.map((component) => (
                      <ListItem key={component.title} title={component.title} href={component.href}>
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/live-selling" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Live Shopping</NavigationMenuLink>
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

        {/* Center Logo on Mobile */}
        <div className="flex-1 flex justify-center lg:hidden">
            <Link href="/live-selling" className="flex items-center gap-2">
                <Logo />
            </Link>
        </div>
        
        {/* Right side icons */}
        <div className="flex flex-1 items-center justify-end gap-2">
            <div ref={searchRef} className="relative flex items-center">
                 <div className="relative hidden sm:block">
                     <Input
                        placeholder="Search..."
                        className="bg-muted rounded-full pl-4 pr-10 h-10 w-full"
                    />
                     <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                 </div>
                 <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full flex-shrink-0 sm:hidden"
                    >
                    <Search className="h-5 w-5 text-muted-foreground" />
                </Button>
            </div>
            {user && userData ? (
                <>
                    <Link href="/profile">
                        <Avatar className="h-9 w-9 cursor-pointer">
                            <AvatarImage src={user.photoURL || 'https://placehold.co/40x40.png'} alt={userData.displayName || "User"} />
                            <AvatarFallback>{userData.displayName ? userData.displayName.charAt(0) : 'U'}</AvatarFallback>
                        </Avatar>
                    </Link>
                    <Link href="/cart">
                        <Button variant="ghost" size="icon" className="relative">
                            <ShoppingCart className="h-6 w-6" />
                        </Button>
                    </Link>
                </>
            ) : (
                 <Link href="/">
                    <Button variant="ghost" size="icon">
                        <User className="h-6 w-6" />
                    </Button>
                 </Link>
            )}
        </div>
      </div>
    </header>
  );
}

const ListItem = React.forwardRef<React.ElementRef<"a">, React.ComponentPropsWithoutRef<"a">>(({ className, title, children, ...props }, ref) => {
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
