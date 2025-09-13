"use client"

import Link from "next/link"
import { Menu, Search, ShoppingCart, User } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Logo } from "./logo"
import React from "react"
import { Input } from "./ui/input"

const shopComponents: { title: string; href: string; description: string }[] = [
  {
    title: "Clothing",
    href: "/listed-products",
    description: "Browse our latest collection of women's and men's fashion.",
  },
  {
    title: "Electronics",
    href: "/electronics",
    description: "Discover cutting-edge gadgets, computers, and accessories.",
  },
  {
    title: "Accessories",
    href: "/handbags",
    description: "Complete your look with our stylish handbags, shoes, and more.",
  },
   {
    title: "Kids",
    href: "/kids",
    description: "Fun and fashionable clothing and toys for the little ones.",
  },
   {
    title: "Sale",
    href: "/sale",
    description: "Grab the best deals on your favorite items before they're gone.",
  },
]

const collectionsComponents: { title: string; href: string; description: string }[] = [
  {
    title: "New Arrivals",
    href: "/trending",
    description: "Check out the latest products fresh on the shelves.",
  },
  {
    title: "Trending",
    href: "/trending",
    description: "See what's popular and join the hype.",
  },
   {
    title: "Featured",
    href: "/trending",
    description: "Our hand-picked selection of must-have items.",
  },
  {
    title: "Best Sellers",
    href: "/top-seller",
    description: "Shop the most loved products by our community.",
  },
]

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


export function MainHeader() {
  return (
    <header className="border-b sticky top-0 bg-background/95 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
                <div className="flex items-center gap-4">
                     <Sheet>
                        <SheetTrigger asChild>
                             <Button variant="ghost" size="icon" className="lg:hidden">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left">
                            <nav className="grid gap-6 text-lg font-medium p-4">
                                <Link href="/live-selling" className="flex items-center gap-2 text-lg font-semibold mb-4">
                                    <Logo />
                                    <span>StreamCart</span>
                                </Link>
                                <Link href="/live-selling" className="hover:text-foreground">Home</Link>
                                <Link href="/listed-products" className="text-muted-foreground hover:text-foreground">Shop</Link>
                                <Link href="/trending" className="text-muted-foreground hover:text-foreground">Collections</Link>
                                <Link href="/live-selling" className="text-muted-foreground hover:text-foreground">Live Shopping</Link>
                                <Link href="/help" className="text-muted-foreground hover:text-foreground">Help</Link>
                                <Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact Us</Link>
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <Link href="/live-selling" className="items-center gap-2 hidden lg:flex">
                        <Logo />
                        <span className="font-semibold text-lg">StreamCart</span>
                    </Link>
                </div>
                
                 <NavigationMenu className="hidden lg:flex">
                    <NavigationMenuList>
                        <NavigationMenuItem>
                            <Link href="/live-selling" legacyBehavior passHref>
                                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                Home
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger>Shop</NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] ">
                                {shopComponents.map((component) => (
                                    <ListItem
                                    key={component.title}
                                    title={component.title}
                                    href={component.href}
                                    >
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
                                {collectionsComponents.map((component) => (
                                    <ListItem
                                    key={component.title}
                                    title={component.title}
                                    href={component.href}
                                    >
                                    {component.description}
                                    </ListItem>
                                ))}
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <Link href="/live-selling" legacyBehavior passHref>
                                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                Live Shopping
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <Link href="/help" legacyBehavior passHref>
                                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                Help
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <Link href="/contact" legacyBehavior passHref>
                                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                Contact Us
                                </NavigationMenuLink>
                            </Link>
                        </NavigationMenuItem>
                    </NavigationMenuList>
                </NavigationMenu>

                <div className="flex items-center justify-end gap-2">
                    <div className="relative hidden sm:block">
                        <Input 
                            placeholder="Search..."
                            className="rounded-full pr-10 h-9"
                        />
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                     <Button variant="ghost" size="icon" className="sm:hidden">
                        <Search className="h-6 w-6" />
                    </Button>
                    <Link href="/profile" passHref>
                        <Button variant="ghost" size="icon">
                            <User className="h-6 w-6" />
                        </Button>
                    </Link>
                     <Link href="/cart" passHref>
                        <Button variant="ghost" size="icon">
                            <ShoppingCart className="h-6 w-6" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    </header>
  )
}
