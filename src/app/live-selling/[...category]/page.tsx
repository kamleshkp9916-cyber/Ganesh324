
"use client";

import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus, Rss, Heart, Users, Search, ChevronDown, Bell, MoreHorizontal, ShoppingCart, Sun, Moon, Laptop, LogOut, Settings, LifeBuoy, Shield, FileText, LayoutDashboard, Package, Wallet, RadioTower, Tv, Flame, TrendingUp, Tags, List } from 'lucide-react';
import { mockStreams as liveSellers } from '@/lib/product-data';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
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
import React, { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useAuthActions } from '@/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from 'next-themes';
import { GoLiveDialog } from '@/components/go-live-dialog';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { getCart } from '@/lib/product-history';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';


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

    let { category: categoryPath } = params;

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
    
    const pageTitle = (subCategorySlug || categorySlug)
        .replace(/-/g, ' ')
        .replace(/&/g, '%26')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
        
    const filteredStreams = useMemo(() => {
        if (!liveSellers) return [];
        let streams = liveSellers.filter(stream => {
            if (!stream.category) return false;
            const streamCategorySlug = stream.category.toLowerCase().replace(/\s+/g, '-');
            const streamSubCategorySlug = (stream as any).subcategory?.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '%26');
            
            if (subCategorySlug) {
                return streamCategorySlug === categorySlug && streamSubCategorySlug === subCategorySlug;
            }
            return streamCategorySlug === categorySlug;
        });

        if (searchTerm) {
            streams = streams.filter(stream => 
                (stream.title && stream.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (stream.name && stream.name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        
        return streams.sort((a, b) => b.viewers - a.viewers);

    }, [categorySlug, subCategorySlug, searchTerm]);

    const totalViewers = filteredStreams.reduce((acc, stream) => acc + stream.viewers, 0);

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
                                <DropdownMenuItem onClick={() => signOut(userData?.role === 'seller')}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
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
                 <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-secondary px-3 py-1 rounded-full mb-3">
                        <Tv className="h-4 w-4"/>
                        <span>Live Streams</span>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{pageTitle}</h1>
                </div>
                
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                     <div className="flex items-center gap-4 text-sm text-muted-foreground w-full md:w-auto justify-center">
                        <div className="flex items-center gap-1.5"><Flame className="h-4 w-4 text-primary" /> <strong className="text-foreground">{(totalViewers / 1000).toFixed(1)}K</strong> watching</div>
                        <Separator orientation="vertical" className="h-4" />
                        <div className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-primary" /> <strong className="text-foreground">222.5K</strong> followers</div>
                    </div>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9">
                                    Filter by: <span className="font-semibold ml-1">Languages</span>
                                    <ChevronDown className="ml-2 h-4 w-4"/>
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
                                    Sort by: <span className="font-semibold ml-1 capitalize">{sortOption.replace("-", " ")}</span>
                                     <ChevronDown className="ml-2 h-4 w-4"/>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuRadioGroup value={sortOption} onValueChange={setSortOption}>
                                    <DropdownMenuRadioItem value="viewers-desc">Viewers (High to Low)</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="viewers-asc">Viewers (Low to High)</DropdownMenuRadioItem>
                                    <DropdownMenuRadioItem value="newest">Newest</DropdownMenuRadioItem>
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div>
                    {filteredStreams.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
                            {filteredStreams.map((seller) => (
                                <Link href={`/stream/${seller.id}`} key={seller.id} className="group">
                                    <Card className="overflow-hidden h-full flex flex-col bg-card shadow-none border-none">
                                        <div className="relative aspect-[3/4] bg-muted rounded-2xl overflow-hidden">
                                            <Image src={seller.thumbnailUrl} alt={`Live stream from ${seller.name}`} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover w-full h-full transition-transform group-hover:scale-105" />
                                            <div className="absolute top-3 left-3 z-10"><Badge variant="destructive" className="gap-1.5"><div className="h-2 w-2 rounded-full bg-white animate-pulse" />LIVE</Badge></div>
                                            <div className="absolute bottom-2 left-2 right-2 z-10">
                                                <div className="flex items-center justify-between text-white text-xs font-semibold bg-black/40 p-1.5 px-2 rounded-full backdrop-blur-sm">
                                                    <div className="flex items-center gap-1"><Users className="w-3 h-3"/>{seller.viewers.toLocaleString()}</div>
                                                    <div className="flex items-center gap-1"><Heart className="w-3 h-3 fill-white"/>{Math.round(seller.viewers / 20)}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="pt-3">
                                            <div className="flex items-start gap-3">
                                                    <Avatar className="h-8 w-8">
                                                    <AvatarImage src={seller.avatarUrl} alt={seller.name} />
                                                    <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="font-semibold text-sm leading-tight truncate group-hover:text-primary transition-colors">{(seller as any).title || 'Live Stream'}</p>
                                                    <p className="text-xs text-muted-foreground">{seller.name}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
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

    