
"use client";

import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus, Rss, Heart, Users, Search, ChevronDown, Bell, ShoppingCart, User, MoreHorizontal, ShoppingBag } from 'lucide-react';
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
import { Moon, Sun, Laptop, LogOut, Settings, LifeBuoy, Shield, FileText, LayoutDashboard, Package, Wallet } from 'lucide-react';
import { GoLiveDialog } from '@/components/go-live-dialog';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { RadioTower } from 'lucide-react';
import { getCart } from '@/lib/product-history';
import { cn } from '@/lib/utils';

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
        
    const filteredStreams = liveSellers.filter(stream => {
        if (!stream.category) return false;
        const streamCategorySlug = stream.category.toLowerCase().replace(/\s+/g, '-');
        const streamSubCategorySlug = (stream as any).subcategory?.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '%26');
        
        if (subCategorySlug) {
            return streamCategorySlug === categorySlug && streamSubCategorySlug === subCategorySlug;
        }
        return streamCategorySlug === categorySlug;
    });

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
                <div className="flex items-start gap-6 mb-6">
                     <Image
                        src="https://placehold.co/150x200.png"
                        alt={pageTitle}
                        width={150}
                        height={200}
                        className="rounded-lg hidden md:block"
                     />
                     <div className="flex-grow pt-2">
                        <h1 className="text-4xl font-bold mb-2">{pageTitle}</h1>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                            <span><strong className="text-foreground">{(totalViewers / 1000).toFixed(1)}K</strong> watching</span>
                            <span><strong className="text-foreground">222.5K</strong> followers</span>
                        </div>
                         <div className="flex items-center gap-2 mb-4">
                             <Badge variant="secondary">IRL</Badge>
                             <Badge variant="secondary">Casual</Badge>
                         </div>
                        <Button variant="outline">
                            <Heart className="mr-2 h-4 w-4" />
                            Follow
                        </Button>
                     </div>
                </div>

                <Tabs defaultValue="livestreams" className="w-full">
                    <TabsList>
                        <TabsTrigger value="livestreams">Livestreams</TabsTrigger>
                        <TabsTrigger value="clips">Clips</TabsTrigger>
                    </TabsList>
                    <TabsContent value="livestreams" className="mt-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                            <div className="relative w-full md:w-auto md:flex-grow max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input placeholder="Search tags" className="pl-10" />
                            </div>
                             <div className="flex items-center gap-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="gap-1.5">
                                            Filter by: <span className="font-semibold">Languages</span>
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        <DropdownMenuRadioGroup value={"english"} onValueChange={() => {}}>
                                            <DropdownMenuRadioItem value="english">English</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="hindi">Hindi</DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="gap-1.5">
                                            Sort by: <span className="font-semibold capitalize">{sortOption.replace('-', ' ')}</span>
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        <DropdownMenuRadioGroup value={sortOption} onValueChange={setSortOption}>
                                            <DropdownMenuRadioItem value="viewers-desc">Viewers (High to Low)</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="viewers-asc">Viewers (Low to High)</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="recent">Recently Started</DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {filteredStreams.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredStreams.map((seller) => (
                                    <Link href={`/stream/${seller.id}`} key={seller.id} className="group">
                                        <Card className="overflow-hidden h-full flex flex-col bg-card shadow-lg hover:shadow-primary/20 transition-shadow">
                                            <div className="relative aspect-video bg-muted">
                                                <Image src={seller.thumbnailUrl} alt={`Live stream from ${seller.name}`} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover w-full h-full transition-transform group-hover:scale-105" />
                                                <div className="absolute top-2 left-2 z-10"><Badge variant="destructive">LIVE</Badge></div>
                                                <div className="absolute top-2 right-2 z-10"><Badge variant="secondary" className="bg-black/50 text-white"><Users className="w-3 h-3 mr-1"/>{seller.viewers.toLocaleString()}</Badge></div>
                                            </div>
                                            <div className="p-3 flex-grow">
                                                <div className="flex items-start gap-3">
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
                    </TabsContent>
                     <TabsContent value="clips">
                        <div className="text-center py-20 text-muted-foreground">
                            <h3 className="text-xl font-semibold">No Clips Found</h3>
                            <p>There are no clips available for this category yet.</p>
                        </div>
                     </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
