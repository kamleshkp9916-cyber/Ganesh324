
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Home, LayoutGrid, AlignJustify, Search, ShoppingCart, Wallet, ArrowLeft, User, Award, MessageSquare, Settings, Shield, FileText, LifeBuoy, LogOut, Rss, LogIn } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { useAuthActions, useAuth } from "@/lib/auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import type { UserProfile } from "@/services/user-service";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

function LiveSellingContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const liveProducts = [
    {
      id: "user-1",
      bgColor: "bg-gradient-to-b from-red-400 to-red-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 1",
      productName: "New Arrival Shirt"
    },
    {
      id: "user-2",
      bgColor: "bg-gradient-to-b from-blue-400 to-blue-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 2",
      productName: "Latest Sneakers"
    },
    {
      id: "user-3",
      bgColor: "bg-gradient-to-b from-green-400 to-green-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 3",
      productName: "Summer Dress"
    },
    {
      id: "user-4",
      bgColor: "bg-gradient-to-b from-purple-400 to-purple-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 4",
      productName: "New Handbag"
    },
    {
      id: "user-5",
      bgColor: "bg-gradient-to-b from-yellow-400 to-yellow-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 5",
      productName: "Vintage Watch"
    },
    {
      id: "user-6",
      bgColor: "bg-gradient-to-b from-pink-400 to-pink-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 6",
      productName: "Sunglasses"
    },
    {
      id: "user-7",
      bgColor: "bg-gradient-to-b from-indigo-400 to-indigo-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 7",
      productName: "Leather Jacket"
    },
    {
      id: "user-8",
      bgColor: "bg-gradient-to-b from-gray-400 to-gray-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 8",
      productName: "Formal Shoes"
    },
     {
      id: "user-9",
      bgColor: "bg-gradient-to-b from-red-400 to-red-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 9",
      productName: "Cool T-Shirt"
    },
    {
      id: "user-10",
      bgColor: "bg-gradient-to-b from-blue-400 to-blue-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 10",
      productName: "Denim Jeans"
    },
    {
      id: "user-11",
      bgColor: "bg-gradient-to-b from-green-400 to-green-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 11",
      productName: "Designer Skirt"
    },
    {
      id: "user-12",
      bgColor: "bg-gradient-to-b from-purple-400 to-purple-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 12",
      productName: "Classic Hat"
    },
  ];

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return liveProducts;
    return liveProducts.filter(
      (product) =>
        product.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, liveProducts]);

  return (
    <div className="flex flex-col h-screen">
      <header className="p-4 border-b">
        <div className="flex items-center justify-between">
          <SidebarTrigger>
            <AlignJustify className="h-6 w-6" />
          </SidebarTrigger>
          <div className="flex-1 mx-4">
            {isSearchVisible ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by user or product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full rounded-full"
                />
              </div>
            ) : (
              <div className="flex justify-center">
                 <h1 className="text-2xl font-bold text-primary">StreamCart</h1>
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsSearchVisible(!isSearchVisible)}>
            {isSearchVisible ? <ArrowLeft className="h-6 w-6" /> : <Search className="h-6 w-6" />}
          </Button>
        </div>
      </header>
      <main className="flex-1 px-4 flex flex-col overflow-hidden">
        <h2 className="text-xl font-semibold mt-4">Live Sellers</h2>
        <Separator className="my-2" />
        <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
            <div className="grid grid-cols-2 gap-4">
            {
                filteredProducts.map((product) => (
                  <Link key={product.id} href={`/live-selling/${product.id}?userName=${encodeURIComponent(product.userName)}&userImage=${encodeURIComponent(product.userImage)}`} passHref>
                    <Card className="overflow-hidden relative aspect-[9/16] cursor-pointer">
                      <div className={`absolute inset-0 ${product.bgColor}`} />
                      <CardContent className="p-2 flex items-end h-full">
                          <div className="flex items-center gap-2 text-white text-sm font-semibold">
                          <Avatar className="border-2 border-primary">
                              <AvatarImage src={product.userImage} alt={product.userName} data-ai-hint="profile picture" />
                              <AvatarFallback>{product.userName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <span>{product.userName}<br/>{product.productName}</span>
                          </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
            }
            </div>
        </div>
      </main>
      <footer className="sticky bottom-0 bg-background border-t p-2">
        <div className="flex justify-around items-center">
          <Button variant="ghost" className="flex flex-col h-auto p-2 text-primary">
            <Home className="h-10 w-10" />
            <span className="text-xs font-bold -mt-1">_</span>
          </Button>
          <Link href="/feed" passHref>
            <Button variant="ghost" className="flex flex-col h-auto p-2 text-foreground">
              <Rss className="h-10 w-10" />
              <span className="text-xs">Feed</span>
            </Button>
          </Link>
          <Button variant="ghost" className="flex flex-col h-auto p-2 text-foreground">
            <LayoutGrid className="h-10 w-10" />
          </Button>
          <Button variant="ghost" className="flex flex-col h-auto p-2 text-foreground">
            <ShoppingCart className="h-10 w-10" />
          </Button>
           <Button variant="ghost" className="flex flex-col h-auto p-2 text-foreground">
            <Wallet className="h-10 w-10" />
          </Button>
        </div>
      </footer>
    </div>
  );
}

function AppSidebar() {
  const { signOut } = useAuthActions();
  const { user, loading } = useAuth();

  const userProfile: UserProfile | null = user ? {
    name: user.displayName || 'Anonymous',
    username: user.email || 'No-email',
    avatarUrl: user.photoURL || 'https://placehold.co/80x80.png',
    following: 200,
    followers: 100,
  } : null;


  const menuItems = [
    { icon: User, label: 'My Profile', href: '/profile' },
    { icon: ShoppingCart, label: 'Orders', href: '/orders' },
    { icon: Award, label: 'Top Seller', href: '/top-seller' },
    { icon: MessageSquare, label: 'Message', href: '/message' },
    { icon: Settings, label: 'Setting', href: '/setting' },
    { icon: Shield, label: 'Privacy And Security', href: '/privacy-and-security' },
  ];

  const helpItems = [
    { icon: FileText, label: 'Term & Conditions', href: '/terms-and-conditions' },
    { icon: LifeBuoy, label: 'Help 24/7', href: '/help' },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="relative">
        <div className="absolute top-2 right-2">
            <SidebarTrigger>
                <ArrowLeft className="h-5 w-5" />
            </SidebarTrigger>
        </div>
          <div className="flex flex-col items-center text-center p-4 pt-8">
            {loading ? (
                <div className="flex flex-col items-center gap-2">
                    <LoadingSpinner />
                </div>
            ) : user ? (
                <>
                    <Link href="/profile">
                    <Avatar className="w-20 h-20 mb-4 border-2 border-primary cursor-pointer">
                        <AvatarImage src={userProfile!.avatarUrl} alt={userProfile!.username} data-ai-hint="profile picture" />
                        <AvatarFallback>{userProfile!.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    </Link>
                    <p className="font-semibold">{userProfile!.name}</p>
                    <p className="text-sm text-muted-foreground">{userProfile!.username}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                        <button className="hover:text-primary"><span className="font-bold text-primary-foreground">{userProfile!.following}</span> Following</button>
                        <button className="hover:text-primary"><span className="font-bold text-primary-foreground">{userProfile!.followers}</span> Followers</button>
                    </div>
                </>
            ) : (
                <div className="flex flex-col items-center gap-4">
                    <Avatar className="w-20 h-20 mb-4 border-2">
                        <AvatarFallback>?</AvatarFallback>
                    </Avatar>
                    <p className="font-semibold">Not Signed In</p>
                    <Link href="/" passHref>
                        <Button>
                            <LogIn className="mr-2 h-4 w-4" />
                            Login
                        </Button>
                    </Link>
                </div>
            )}
          </div>
      </SidebarHeader>
      <SidebarContent className="overflow-y-auto no-scrollbar">
        <SidebarMenu>
            {user && (
                <>
                {menuItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                    <Link href={item.href} passHref>
                        <SidebarMenuButton>
                        <item.icon />
                        <span>{item.label}</span>
                        </SidebarMenuButton>
                    </Link>
                    </SidebarMenuItem>
                ))}
                <Separator className="my-4" />
                </>
            )}
            {helpItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                <Link href={item.href} passHref>
                    <SidebarMenuButton>
                    <item.icon />
                    <span>{item.label}</span>
                    </SidebarMenuButton>
                </Link>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-2">
                <ThemeSwitcher/>
                <span>Dark Mode</span>
            </div>
        </div>
        {user && (
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={signOut}>
                        <LogOut />
                        <span>Logout</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}


export default function LiveSellingPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <LiveSellingContent />
      </SidebarInset>
    </SidebarProvider>
  );
}
