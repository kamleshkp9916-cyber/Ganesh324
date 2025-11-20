
"use client";

import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  UserPlus,
  Heart,
  Users,
  Search,
  ChevronDown,
  Bell,
  MoreHorizontal,
  Sun,
  Moon,
  Laptop,
  LogOut,
  Settings,
  LifeBuoy,
  Shield,
  FileText,
  LayoutDashboard,
  Package,
  Wallet,
  RadioTower,
  Tv,
  Flame,
  TrendingUp,
  Tags,
  List,
  User,
  Sparkles,
  Filter,
  Video,
  X,
  ShoppingBag,
  Rss,
  UserCheck,
  ShoppingCart,
  ChevronRight,
} from 'lucide-react';
import { mockStreams, productDetails, productToSellerMapping } from '@/lib/product-data';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import React, { useState, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useAuthActions } from '@/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import { GoLiveDialog } from '@/components/go-live-dialog';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { getCart, addToCart, saveCart } from '@/lib/product-history';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ProductShelfContent } from '@/components/product-shelf-content';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"


export default function SubCategoryStreamPage() {
    const router = useRouter();
    const params = useParams();
    const [sortOption, setSortOption] = useState("viewers-desc");
    const { user, userData } = useAuth();
    const { signOut } = useAuthActions();
    const { theme, setTheme } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [cartCount, setCartCount] = React.useState(0);
    const isMobile = useIsMobile();
    const { toast } = useToast();
    const [isFollowing, setIsFollowing] = useState(false);

    let { category: categoryPath } = params;

    const handleFollowToggle = () => {
        setIsFollowing(prev => !prev);
    };

    const getProductsForSeller = (sellerId: string): any[] => {
        return Object.values(productDetails).filter(p => productToSellerMapping[p.key as keyof typeof productToSellerMapping]?.uid === sellerId);
    }
    
    const handleAddToCart = (product: any) => {
        addToCart({ ...product, quantity: 1 });
        toast({
            title: "Added to Cart!",
            description: `${product.name} has been added to your cart.`
        });
    };
    
    const handleBuyNow = (product: any) => {
        saveCart([{ ...product, quantity: 1 }]);
        localStorage.setItem('buyNow', 'true');
        router.push('/cart');
    };

    React.useEffect(() => {
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

    const unreadCount = 0; // Mock data

    if (!categoryPath) {
        return <div>Loading...</div>;
    }
    
    const pathSegments = Array.isArray(categoryPath) ? categoryPath : [categoryPath];
    const categorySlug = pathSegments[0] || '';
    const subCategorySlug = pathSegments[1] || null;

    const parentCategoryTitle = categorySlug
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    
    const pageTitle = (subCategorySlug || categorySlug)
        .replace(/-/g, ' ')
        .replace(/%26/g, '&')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
        
    const displayedStreams = useMemo(() => {
        if (!mockStreams) return [];

        const filterStreams = (streams: any[], term: string) => {
            if (!term) return streams;
            const lowercasedTerm = term.toLowerCase();
            return streams.filter(stream => 
                (stream.title && stream.title.toLowerCase().includes(lowercasedTerm)) ||
                (stream.name && stream.name.toLowerCase().includes(lowercasedTerm)) ||
                (stream.subcategory && stream.subcategory.toLowerCase().includes(lowercasedTerm))
            );
        };
        
        let streams = mockStreams.filter(s => s.status === 'live');

        if (subCategorySlug) {
            streams = streams.filter(stream => {
                 const streamSubCategorySlug = (stream as any).subcategory?.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '%26');
                 return streamSubCategorySlug === subCategorySlug;
            });
        } else if (categorySlug) {
             streams = streams.filter(stream => {
                const streamCategorySlug = stream.category.toLowerCase().replace(/\s+/g, '-');
                return streamCategorySlug === categorySlug;
            });
        }

        const sorted = streams.sort((a, b) => b.viewers - a.viewers);
        
        return filterStreams(sorted, searchTerm); 

    }, [categorySlug, subCategorySlug, searchTerm]);

    const totalViewers = displayedStreams.reduce((acc, stream) => acc + stream.viewers, 0);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
           <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
                <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                         <Link href="/live-selling" className="flex items-center gap-2">
                            <span className="font-bold text-lg hidden sm:inline-block">StreamCart</span>
                        </Link>
                    </div>

                    <div className="hidden sm:flex flex-1 justify-center px-8">
                        <div className={cn(
                        "relative w-full max-w-sm lg:max-w-md transition-all duration-300",
                        isSearchOpen ? "w-full" : "w-auto"
                        )}>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground peer-focus:text-foreground"/>
                                <Input 
                                    placeholder="Search streams..." 
                                    className="rounded-full bg-muted h-10 pl-10 peer transition-all duration-300"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => setIsSearchOpen(true)}
                                    onBlur={() => setIsSearchOpen(false)}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setIsSearchOpen(prev => !prev)}>
                            <Search className="h-5 w-5"/>
                        </Button>

                        <Link href="/listed-products" passHref>
                            <Button variant="ghost" size="icon">
                                <ShoppingBag className="h-5 w-5"/>
                            </Button>
                        </Link>
                        
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
                                <Button variant="ghost" size="icon" className="relative">
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
                                    <Rss className="mr-2 h-4 w-4" />
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
                                    <DropdownMenuItem onSelect={() => router.push('/help')}>
                                    <LifeBuoy className="mr-2 h-4 w-4" />
                                    <span>Help & Support</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => router.push('/privacy-and-security')}>
                                    <Shield className="mr-2 h-4 w-4" />
                                    <span>Privacy & Security</span>
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
                        
                        {(userData?.role === 'seller' || userData?.role === 'admin') && (
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="hidden lg:flex">
                                        <RadioTower className="mr-2 h-4 w-4"/> Go Live
                                    </Button>
                                </DialogTrigger>
                                <GoLiveDialog />
                            </Dialog>
                        )}
                    </div>
                </div>
            </header>

            <main className="container mx-auto py-6">
                 <div className="flex flex-col items-center justify-center text-center mb-8">
                     <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <Link href={`/live-selling/${categorySlug}`} className="hover:text-primary">{parentCategoryTitle}</Link>
                        {subCategorySlug && (
                            <>
                                <ChevronRight className="h-4 w-4" />
                                <span>{pageTitle}</span>
                            </>
                        )}
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{pageTitle}</h1>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5"><Users className="h-4 w-4" /> <strong className="text-foreground">{(totalViewers / 1000).toFixed(1)}K</strong> watching</div>
                        <span className="text-muted-foreground/50">|</span>
                        <div className="flex items-center gap-1.5"><Heart className="h-4 w-4" /> <strong className="text-foreground">22.5K</strong> followers</div>
                    </div>
                    <div className="mt-4 flex gap-2">
                        <Button variant={isFollowing ? "outline" : "secondary"} size="sm" className="rounded-full" onClick={handleFollowToggle}>
                            {isFollowing ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                            {isFollowing ? "Following" : "Follow"}
                        </Button>
                    </div>
                </div>
                
                <Separator className="my-8" />
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                     <div className="relative flex-grow w-full md:flex-grow-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search in this category..."
                            className="pl-9 h-9 w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                     <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-2">
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9">
                                    <Filter className="mr-2 h-4 w-4" />
                                    Filter by: <span className="font-semibold ml-1">Languages</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuRadioItem value="any">Any</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="english">English</DropdownMenuRadioItem>
                                <DropdownMenuRadioItem value="hindi">Hindi</DropdownMenuRadioItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9">
                                    Sort by: <span className="font-semibold ml-1 capitalize">{sortOption.replace('-', ' ')}</span>
                                    <ChevronDown className="ml-1 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Sort Streams By</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuRadioGroup value={sortOption} onValueChange={setSortOption}>
                                    <DropdownMenuRadioItem value="viewers-desc">Most Viewers</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="viewers-asc">Fewest Viewers</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="newest">Recently Started</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div>
                    {displayedStreams.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                            {displayedStreams.map((seller) => {
                                const sellerProducts = getProductsForSeller(seller.id);
                                const productsToShow = sellerProducts.slice(0, 5);
                                const remainingCount = sellerProducts.length > 5 ? sellerProducts.length - 5 : 0;
                                return (
                                <Card key={seller.id} className="group flex flex-col space-y-2 overflow-hidden border-none shadow-none bg-transparent">
                                    <Link href={`/stream/${seller.id}`} className="block">
                                        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                                            <Image src={seller.thumbnailUrl} alt={`Live stream from ${seller.name}`} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover w-full h-full transition-transform group-hover:scale-105" />
                                            <div className="absolute top-3 left-3 z-10"><Badge variant="destructive" className="gap-1.5"><div className="h-2 w-2 rounded-full bg-white animate-pulse" />LIVE</Badge></div>
                                            <div className="absolute top-2 right-2 z-10">
                                                <Badge variant="secondary" className="bg-black/40 text-white font-semibold backdrop-blur-sm">
                                                    <Users className="w-3 h-3 mr-1"/>{seller.viewers.toLocaleString()}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2 mt-2">
                                                <Avatar className="w-8 h-8">
                                                <AvatarImage src={seller.avatarUrl} alt={seller.name} />
                                                <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 overflow-hidden">
                                                <p className="font-semibold text-sm leading-tight group-hover:underline truncate">{seller.title || seller.name}</p>
                                                <p className="text-xs text-muted-foreground">{seller.name}</p>
                                                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                                    <p className="text-xs text-primary font-semibold">{seller.category}</p>
                                                    {seller.subcategory && <Badge variant="outline" className="text-xs">{seller.subcategory}</Badge>}
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="flex items-center gap-1.5 mt-auto flex-shrink-0 pt-2 w-full justify-start pb-2 pl-2">
                                        {productsToShow.map((p: any, i: number) => (
                                            <Link href={`/product/${p.key}`} key={p.key} className="block" onClick={(e) => e.stopPropagation()}>
                                                <div className="w-10 h-10 bg-muted rounded-md border overflow-hidden hover:ring-2 hover:ring-primary">
                                                    <Image src={p.images[0]?.preview || p.images[0]} alt={p.name} width={40} height={40} className="object-cover w-full h-full" />
                                                </div>
                                            </Link>
                                        ))}
                                        {remainingCount > 0 && (
                                             <Sheet>
                                                <SheetTrigger asChild>
                                                    <button className="w-10 h-10 bg-muted rounded-md border flex items-center justify-center text-xs font-semibold text-muted-foreground hover:bg-secondary">
                                                        +{remainingCount}
                                                    </button>
                                                </SheetTrigger>
                                                <SheetContent side="bottom" className="h-[60vh] flex flex-col p-0">
                                                     <ProductShelfContent 
                                                        sellerProducts={sellerProducts}
                                                        handleAddToCart={handleAddToCart}
                                                        handleBuyNow={handleBuyNow}
                                                        isMobile={true}
                                                        onClose={() => {
                                                            const a = document.querySelector('[data-state="closed"]');
                                                            if (a) (a as HTMLElement).click();
                                                        }}
                                                        toast={toast}
                                                    />
                                                </SheetContent>
                                            </Sheet>
                                        )}
                                    </div>
                                </Card>
                            )})}
                        </div>
                    ) : (
                         <div className="text-center py-20 text-muted-foreground">
                            <h3 className="text-xl font-semibold">No Live Streams</h3>
                            <p>There are no active streams in this category right now.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );

    
}
