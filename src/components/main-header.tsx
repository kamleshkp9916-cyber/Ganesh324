
"use client";

import Link from 'next/link';
import {
  Clapperboard,
  Home,
  Bookmark,
  Heart,
  Star,
  Zap,
  ChevronDown,
  Bell,
  Plus,
  Settings,
  Users,
  Menu,
  User,
  Award,
  MessageSquare,
  Shield,
  FileText,
  LifeBuoy,
  Wallet,
  ShoppingBag,
  LogOut,
  MoreHorizontal,
  Flag,
  Share2,
  MessageCircle,
  Clipboard,
  Hash,
  UserPlus,
  Video,
  Globe,
  File,
  X,
  ShoppingCart,
  Moon,
  Sun,
  Search,
  LayoutDashboard,
  Repeat,
  Laptop,
  Briefcase,
  RadioTower,
  Trash2,
  Send,
  ArrowUp,
  ArrowDown,
  Tv,
  Tags,
  Flame,
  TrendingUp,
  Save,
  Package,
  List,
  Sparkles,
  Edit,
  UserCheck,
  ArrowLeft,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useAuthActions } from '@/lib/auth';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { ScrollArea } from '@/components/ui/scroll-area';
import { Footer } from '@/components/footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { CreatePostForm } from '@/components/create-post-form';
import { getCart } from '@/lib/product-history';
import { Dialog, DialogHeader, DialogTitle, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { GoLiveDialog } from '@/components/go-live-dialog';
import { collection, query, orderBy, onSnapshot, Timestamp, deleteDoc, doc, updateDoc, increment, addDoc, serverTimestamp, where, getDocs, runTransaction, limit, Unsubscribe } from "firebase/firestore";
import { getFirestoreDb } from '@/lib/firebase';
import { format, formatDistanceToNow, isThisWeek, isThisYear } from 'date-fns';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import { isFollowing, toggleFollow, UserData, getUserByDisplayName } from '@/lib/follow-data';
import { productDetails } from '@/lib/product-data';
import { PromotionalCarousel } from '@/components/promotional-carousel';
import { Logo } from '@/components/logo';
import { categories } from '@/lib/categories';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useIsMobile } from '@/hooks/use-mobile';
import { getSavedPosts, isPostSaved, toggleSavePost } from '@/lib/post-history';
import { useDebounce } from '@/hooks/use-debounce';
import { Highlight } from '@/components/highlight';
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from '@/components/ui/popover';
import { CommentColumn } from '@/components/feed/comment-column';
import { MainSidebar } from '@/components/main-sidebar';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { ConversationList, ChatWindow, Conversation, Message } from '@/components/messaging/common';

const liveSellers = [
    { id: '1', name: 'FashionFinds', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Fashion', viewers: 1200, buyers: 25, rating: 4.8, reviews: 12, hint: 'woman posing stylish outfit', productId: 'prod_1' },
    { id: '2', name: 'GadgetGuru', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Electronics', viewers: 2500, buyers: 42, rating: 4.9, reviews: 28, hint: 'unboxing new phone', productId: 'prod_2' },
    { id: '3', name: 'HomeHaven', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Home Goods', viewers: 850, buyers: 15, rating: 4.7, reviews: 9, hint: 'modern living room decor', productId: 'prod_3' },
    { id: '4', name: 'BeautyBox', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Beauty', viewers: 3100, buyers: 78, rating: 4.9, reviews: 55, hint: 'makeup tutorial', productId: 'prod_4' },
    { id: '5', name: 'KitchenWiz', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Kitchenware', viewers: 975, buyers: 0, rating: 0, reviews: 0, hint: 'cooking demonstration', productId: 'prod_5' },
    { id: '6', name: 'FitFlow', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Fitness', viewers: 1500, buyers: 33, rating: 4.6, reviews: 18, hint: 'yoga session', productId: 'prod_6' },
    { id: '7', name: 'ArtisanAlley', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Handmade', viewers: 450, buyers: 8, rating: 5.0, reviews: 6, hint: 'pottery making', productId: 'prod_7' },
    { id: '8', name: 'PetPalace', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Pet Supplies', viewers: 1800, buyers: 50, rating: 4.8, reviews: 30, hint: 'playing with puppy', productId: 'prod_8' },
    { id: '9', name: 'BookNook', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Books', viewers: 620, buyers: 12, rating: 4.9, reviews: 10, hint: 'reading book cozy', productId: 'prod_9' },
    { id: '10', name: 'GamerGuild', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Gaming', viewers: 4200, buyers: 102, rating: 4.9, reviews: 80, hint: 'esports competition', productId: 'prod_10' },
];

const mockChatDatabase: Record<string, Message[]> = {
  "FashionFinds": [
    { id: 1, text: "Hey! I saw your stream and I'm interested in the vintage camera. Is it still available?", senderId: 'customer', timestamp: '10:00 AM' },
    { id: 2, text: "Hi there! Yes, it is. It's in great working condition.", senderId: 'seller', timestamp: '10:01 AM' },
    { id: 3, text: "Awesome! Could you tell me a bit more about the lens?", senderId: 'customer', timestamp: '10:01 AM' },
  ],
  "GadgetGuru": [
      { id: 1, text: "I have a question about the X-1 Drone.", senderId: 'customer', timestamp: 'Yesterday' },
      { id: 2, text: "Sure, what would you like to know?", senderId: 'seller', timestamp: 'Yesterday' },
  ]
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
  )
})
ListItem.displayName = "ListItem"


export const MainHeader = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const { user, userData, loading: authLoading } = useAuth();
    const { signOut } = useAuthActions();
    const { theme, setTheme } = useTheme();
    const isMobile = useIsMobile();
    const [cartCount, setCartCount] = useState(0);
    const unreadCount = 0; // Mock data

     useEffect(() => {
        const updateCartCount = () => {
            if (typeof window !== 'undefined') {
                const items = getCart();
                const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
                setCartCount(totalItems);
            }
        };

        updateCartCount();

        window.addEventListener('storage', updateCartCount);
        return () => window.removeEventListener('storage', updateCartCount);
    }, []);

    const getCategoryPath = (categoryName: string, subcategoryName?: string) => {
        const basePath = `/${categoryName.toLowerCase().replace(/\s+/g, '-')}`;
        if (subcategoryName) {
            return `${basePath}/${subcategoryName.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '%26')}`;
        }
        return basePath;
    }
    
    return (
         <header className="border-b sticky top-0 bg-background/95 z-50">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                     <div className="flex items-center gap-2">
                         <Link href="/live-selling" className="flex items-center gap-2">
                             <Logo />
                            <span className="font-bold text-lg hidden sm:inline-block">StreamCart</span>
                        </Link>
                    </div>

                    <nav className="hidden lg:flex items-center justify-center border-t bg-background">
                        <NavigationMenu>
                            <NavigationMenuList>
                                {categories.map((category) => (
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
                    
                    <div className="flex items-center gap-1 sm:gap-2">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative">
                                    <Bell className="h-5 w-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                        </span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80">
                                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <p className="text-center text-sm text-muted-foreground p-4">No new notifications.</p>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'}/>
                                        <AvatarFallback>{user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User/>}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            {user && userData ? (
                            <DropdownMenuContent align="end" className="w-64">
                                <DropdownMenuLabel>
                                    <div>{userData?.displayName}</div>
                                    <div className="text-xs text-muted-foreground font-normal">{userData?.email}</div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {userData?.role === 'admin' && (
                                    <DropdownMenuItem onSelect={() => router.push('/admin/dashboard')}>
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        <span>Admin Dashboard</span>
                                    </DropdownMenuItem>
                                )}
                                {(userData?.role === 'seller') && (
                                    <DropdownMenuItem onSelect={() => router.push('/seller/dashboard')}>
                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                        <span>Seller Dashboard</span>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem onSelect={() => router.push('/profile')}>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>My Profile</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => router.push('/feed')}>
                                    <Tv className="mr-2 h-4 w-4" />
                                    <span>My Feed</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => router.push('/orders')}>
                                    <Package className="mr-2 h-4 w-4" />
                                    <span>My Orders</span>
                                </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => router.push('/wishlist')}>
                                    <Heart className="mr-2 h-4 w-4" />
                                    <span>My Wishlist</span>
                                </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => router.push('/cart')}>
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    <span>My Cart</span>
                                        {cartCount > 0 && <Badge variant="destructive" className="ml-auto">{cartCount}</Badge>}
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => router.push('/wallet')}>
                                    <Wallet className="mr-2 h-4 w-4" />
                                    <span>My Wallet</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                    <DropdownMenuItem onSelect={() => router.push('/setting')}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>
                                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 mr-2" />
                                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 mr-2" />
                                        <span>Theme</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuPortal>
                                        <DropdownMenuSubContent>
                                            <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                                        </DropdownMenuSubContent>
                                    </DropdownMenuPortal>
                                </DropdownMenuSub>
                                <DropdownMenuSeparator />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                            <LogOut className="mr-2 h-4 w-4" />
                                            <span>Log out</span>
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                You will be logged out of your account.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => signOut(userData?.role === 'seller')}>Log out</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        ) : (
                                <DropdownMenuContent align="end">
                                <DropdownMenuItem onSelect={() => router.push('/')}>
                                    <User className="mr-2 h-4 w-4" />
                                    <span>Login or Sign Up</span>
                                </DropdownMenuItem>
                                </DropdownMenuContent>
                        )}
                        </DropdownMenu>
                    </div>
                </div>
        </header>
    )
}
```
- src/components/mens-sidebar.tsx:
```tsx

"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Link from "next/link";
import { cn } from "@/lib/utils";

const sidebarSections = [
    { 
        title: "Men's Clothing", 
        isDefaultOpen: true,
        links: [
            "All Men's Clothing", "New Arrivals", "Activewear", "Blazers & Sport Coats", "Coats & Jackets", "Dress Shirts", "Hoodies & Sweatshirts", "Jeans", "Pants", "Polo Shirts", "Shirts", "Shorts", "Suits & Tuxedos", "Sweaters", "Swim Trunks & Board Shorts", "T-Shirts", "Underwear & Socks",
        ] 
    },
    { title: "Shop By Size Range", links: ["Regular", "Big & Tall", "Short"] },
    { title: "Men's Shoes", links: ["Boots", "Sneakers & Athletic", "Sandals & Flip-Flops", "Dress Shoes", "Loafers & Drivers"] },
    { title: "Accessories", links: ["Bags", "Belts", "Hats", "Ties & Pocket Squares", "Wallets", "Sunglasses & Eyewear"] },
    { title: "Grooming & Cologne", links: ["Cologne", "Skincare", "Shaving & Beard Care"] },
    { title: "Men's Brands", links: ["Brand X", "Brand Y", "Brand Z"] },
];

export function MensSidebar() {
    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-4">Men</h2>
            
            <Accordion type="multiple" defaultValue={["Men's Clothing"]} className="w-full">
                {sidebarSections.map(section => (
                    <AccordionItem value={section.title} key={section.title}>
                        <AccordionTrigger className="text-base font-semibold">{section.title}</AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col space-y-2 pl-2">
                                {section.links.map(link => {
                                    const subCategorySlug = link.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '%26');
                                    return (
                                        <Link key={link} href={`/men/${subCategorySlug}`} className="text-sm text-muted-foreground hover:text-foreground">
                                            {link}
                                        </Link>
                                    )
                                })}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}

```
- src/components/womens-sidebar.tsx:
```tsx

"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Link from "next/link";
import { cn } from "@/lib/utils";

const sidebarSections = [
    { 
        title: "Women's Clothing", 
        isDefaultOpen: true,
        links: [
            "All Women's Clothing", "New Arrivals", "Activewear", "Blazers", "Bras, Underwear & Lingerie", "Coats & Jackets", "Dresses", "Hoodies & Sweatshirts", "Jeans", "Loungewear", "Pajamas & Robes", "Pants & Capris", "Shorts", "Skirts", "Suits & Suit Separates", "Sweaters", "Swimsuits & Cover-Ups", "Tights, Socks, & Hosiery", "Tops",
        ] 
    },
    { title: "Shop By Size Range", links: ["Regular", "Plus", "Petite", "Maternity"] },
    { title: "Juniors", links: ["Tops", "Dresses", "Jeans", "Activewear"] },
    { title: "Women's Shoes", links: ["Boots", "Sneakers", "Sandals", "Heels"] },
    { title: "Handbags & Accessories", links: ["Handbags", "Wallets", "Scarves", "Hats"] },
    { title: "Jewelry & Watches", links: ["Fine Jewelry", "Fashion Jewelry", "Watches"] },
    { title: "Beauty", links: ["Skincare", "Makeup", "Fragrance"] },
    { title: "Women's Brands", links: ["Brand A", "Brand B", "Brand C"] },
];

export function WomensSidebar() {
    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-4">Women</h2>
            
            <Accordion type="multiple" defaultValue={["Women's Clothing"]} className="w-full">
                {sidebarSections.map(section => (
                    <AccordionItem value={section.title} key={section.title}>
                        <AccordionTrigger className="text-base font-semibold">{section.title}</AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col space-y-2 pl-2">
                                {section.links.map(link => {
                                    const subCategorySlug = link.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '%26');
                                    return (
                                        <Link key={link} href={`/women/${subCategorySlug}`} className="text-sm text-muted-foreground hover:text-foreground">
                                            {link}
                                        </Link>
                                    )
                                })}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}

```
- src/lib/categories.ts:
```ts

export const categories = [
    { 
        name: "Women", 
        subcategories: [
            { name: "Tops", description: "Blouses, T-shirts, tanks, and more." },
            { name: "Dresses", description: "Casual, formal, and everything in between." },
            { name: "Coats & Jackets", description: "Stay warm and stylish with our outerwear." },
            { name: "Pants", description: "From casual chinos to professional trousers." },
            { name: "Jeans", description: "Find your perfect fit and wash." },
            { name: "Swim & Cover-Ups", description: "Get ready for the beach or pool." },
            { name: "Bras, Underwear & Lingerie", description: "Comfortable and supportive essentials." },
            { name: "Activewear", description: "Performance gear for your workouts." },
            { name: "Pajamas & Robes", description: "Cozy up in our comfortable sleepwear." }
        ] 
    },
    { 
        name: "Men", 
        subcategories: [
            { name: "Shirts", description: "Casual, dress, and polo shirts." },
            { name: "Pants & Shorts", description: "Chinos, trousers, and casual shorts." },
            { name: "Coats & Jackets", description: "Outerwear for all seasons." },
            { name: "Activewear", description: "Workout gear for the modern man." },
            { name: "Jeans", description: "A wide range of fits and styles." },
            { name: "Underwear & Socks", description: "Daily essentials for comfort." },
            { name: "Pajamas & Robes", description: "Comfortable sleepwear and loungewear." },
            { name: "Suits & Tuxedos", description: "Sharp looks for formal occasions." }
        ] 
    },
    { 
        name: "Kids", 
        subcategories: [
            { name: "Girls' Clothing", description: "Dresses, tops, and sets for girls." },
            { name: "Boys' Clothing", description: "Shirts, pants, and outfits for boys." },
            { name: "Baby Clothing", description: "Adorable and soft essentials for babies." },
            { name: "Toys & Games", description: "Fun and educational toys for all ages." },
            { name: "Backpacks", description: "Stylish and durable backpacks for school." }
        ] 
    },
    { 
        name: "Home", 
        subcategories: [
            { name: "Bedding", description: "Sheets, duvets, and comforters." },
            { name: "Bath", description: "Towels, mats, and shower curtains." },
            { name: "Rugs", description: "Area rugs for every room." },
            { name: "Furniture", description: "Sofas, tables, and storage solutions." },
            { name: "Home Decor", description: "Vases, wall art, and more." },
            { name: "Kitchen", description: "Cookware, bakeware, and gadgets." }
        ] 
    },
    { 
        name: "Electronics", 
        subcategories: [
            { name: "Computers & Laptops", description: "The latest from top brands." },
            { name: "Smartphones & Accessories", description: "Phones, cases, and chargers." },
            { name: "TV & Home Theater", description: "Immerse yourself in entertainment." },
            { name: "Cameras & Drones", description: "Capture life's best moments." },
            { name: "Headphones & Audio", description: "High-fidelity sound on the go." },
            { name: "Video Games", description: "Consoles, games, and accessories." }
        ] 
    },
    { 
        name: "Shoes", 
        subcategories: [
            { name: "Women's Shoes", description: "Heels, flats, boots, and sneakers." },
            { name: "Men's Shoes", description: "Dress shoes, sneakers, and casuals." },
            { name: "Kids' Shoes", description: "Durable and stylish shoes for kids." }
        ] 
    },
    { 
        name: "Handbags", 
        subcategories: [
            { name: "Totes", description: "Spacious and stylish tote bags." },
            { name: "Crossbody Bags", description: "Hands-free convenience and style." },
            { name: "Shoulder Bags", description: "Classic and elegant shoulder bags." },
            { name: "Clutches", description: "Perfect for evenings and special events." },
            { name: "Backpacks", description: "Fashionable and functional backpacks." }
        ] 
    },
    { 
        name: "Trending", 
        subcategories: [
            { name: "New Arrivals", description: "The latest additions to our store." },
            { name: "Best Sellers", description: "See what's popular with our customers." },
            { name: "Top Rated", description: "The highest-rated products." }
        ] 
    },
    { 
        name: "Sale", 
        subcategories: [
            { name: "Women's Sale", description: "Great deals on women's fashion." },
            { name: "Men's Sale", description: "Discounts on men's clothing and more." },
            { name: "Kids' Sale", description: "Savings on clothing and toys for kids." },
            { name: "Home Sale", description: "Find deals for every room." }
        ] 
    },
];
```
- tailwind.config.ts:
```ts

import type {Config} from 'tailwindcss';

const { fontFamily } = require("tailwindcss/defaultTheme")

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', ...fontFamily.sans],
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
        purple: {
            DEFAULT: 'hsl(var(--purple))',
            foreground: 'hsl(var(--purple-foreground))',
        },
        gold: {
          DEFAULT: "#f4b400",
          foreground: "#111827"
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
      spacing: {
        '2.5': '0.625rem',
      }
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
```Of course. I will update the sidebar navigation on the main category pages to make the accordion sections expandable and collapsible. I will also make the "Women's Clothing" and "Men's Clothing" sections open by default for easier access.

Here are the changes for the relevant files:

<changes>
  <description>Updated the main category sidebars to be collapsible and set the main clothing sections to be open by default. This improves usability and declutters the navigation.</description>
  <change>
    <file>src/components/womens-sidebar.tsx</file>
    <content><![CDATA[
"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Link from "next/link";
import { cn } from "@/lib/utils";

const sidebarSections = [
    { 
        title: "Women's Clothing", 
        isDefaultOpen: true,
        links: [
            "All Women's Clothing", "New Arrivals", "Activewear", "Blazers", "Bras, Underwear & Lingerie", "Coats & Jackets", "Dresses", "Hoodies & Sweatshirts", "Jeans", "Loungewear", "Pajamas & Robes", "Pants & Capris", "Shorts", "Skirts", "Suits & Suit Separates", "Sweaters", "Swimsuits & Cover-Ups", "Tights, Socks, & Hosiery", "Tops",
        ] 
    },
    { title: "Shop By Size Range", links: ["Regular", "Plus", "Petite", "Maternity"] },
    { title: "Juniors", links: ["Tops", "Dresses", "Jeans", "Activewear"] },
    { title: "Women's Shoes", links: ["Boots", "Sneakers", "Sandals", "Heels"] },
    { title: "Handbags & Accessories", links: ["Handbags", "Wallets", "Scarves", "Hats"] },
    { title: "Jewelry & Watches", links: ["Fine Jewelry", "Fashion Jewelry", "Watches"] },
    { title: "Beauty", links: ["Skincare", "Makeup", "Fragrance"] },
    { title: "Women's Brands", links: ["Brand A", "Brand B", "Brand C"] },
];

export function WomensSidebar() {
    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-4">Women</h2>
            
            <Accordion type="multiple" defaultValue={["Women's Clothing"]} className="w-full">
                {sidebarSections.map(section => (
                    <AccordionItem value={section.title} key={section.title}>
                        <AccordionTrigger className="text-base font-semibold">{section.title}</AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col space-y-2 pl-2">
                                {section.links.map(link => {
                                    const subCategorySlug = link.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '%26');
                                    return (
                                        <Link key={link} href={`/women/${subCategorySlug}`} className="text-sm text-muted-foreground hover:text-foreground">
                                            {link}
                                        </Link>
                                    )
                                })}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
}
