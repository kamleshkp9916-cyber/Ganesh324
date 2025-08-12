
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Home, LayoutGrid, AlignJustify, Search, ShoppingCart, FilePen, Wallet, ArrowLeft, User, Award, MessageSquare, Settings, Shield, FileText, LifeBuoy, LogOut } from "lucide-react";
import Image from "next/image";
import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from "@/components/ui/sidebar";
import { useAuthActions } from "@/lib/auth";
import { ThemeSwitcher } from "@/components/theme-switcher";

function LiveSellingContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const liveProducts = [
    {
      bgColor: "bg-gradient-to-b from-red-400 to-red-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 1",
      productName: "New Arrival Shirt"
    },
    {
      bgColor: "bg-gradient-to-b from-blue-400 to-blue-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 2",
      productName: "Latest Sneakers"
    },
    {
      bgColor: "bg-gradient-to-b from-green-400 to-green-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 3",
      productName: "Summer Dress"
    },
    {
      bgColor: "bg-gradient-to-b from-purple-400 to-purple-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 4",
      productName: "New Handbag"
    },
    {
      bgColor: "bg-gradient-to-b from-yellow-400 to-yellow-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 5",
      productName: "Vintage Watch"
    },
    {
      bgColor: "bg-gradient-to-b from-pink-400 to-pink-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 6",
      productName: "Sunglasses"
    },
    {
      bgColor: "bg-gradient-to-b from-indigo-400 to-indigo-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 7",
      productName: "Leather Jacket"
    },
    {
      bgColor: "bg-gradient-to-b from-gray-400 to-gray-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 8",
      productName: "Formal Shoes"
    },
     {
      bgColor: "bg-gradient-to-b from-red-400 to-red-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 9",
      productName: "Cool T-Shirt"
    },
    {
      bgColor: "bg-gradient-to-b from-blue-400 to-blue-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 10",
      productName: "Denim Jeans"
    },
    {
      bgColor: "bg-gradient-to-b from-green-400 to-green-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 11",
      productName: "Designer Skirt"
    },
    {
      bgColor: "bg-gradient-to-b from-purple-400 to-purple-600",
      userImage: "https://placehold.co/40x40.png",
      userName: "User 12",
      productName: "Classic Hat"
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); 
    return () => clearTimeout(timer);
  }, []);

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
            {loading ? (
                Array.from({ length: 8 }).map((_, index) => (
                    <Card key={index} className="overflow-hidden relative aspect-[9/16] bg-muted">
                        <CardContent className="p-2 flex items-end h-full">
                            <div className="flex items-center gap-2 w-full">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            ) : (
                filteredProducts.map((product, index) => (
                    <Card key={index} className="overflow-hidden relative aspect-[9/16]">
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
                ))
            )}
            </div>
        </div>
      </main>
      <footer className="sticky bottom-0 bg-background border-t p-2">
        <div className="flex justify-around items-center">
          <Button variant="ghost" className="flex flex-col h-auto p-2 text-primary">
            <Home className="h-10 w-10" />
            <span className="text-xs font-bold -mt-1">_</span>
          </Button>
          <Button variant="ghost" className="flex flex-col h-auto p-2 text-foreground">
            <FilePen className="h-10 w-10" />
          </Button>
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
  const router = useRouter();
  const [userProfile] = useState({
    name: 'bantypr324',
    username: '@bantypr324',
    avatarUrl: 'https://placehold.co/80x80.png',
    following: 200,
    followers: 100,
  });

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
            <Avatar className="w-20 h-20 mb-4 border-2 border-primary">
                <AvatarImage src={userProfile.avatarUrl} alt={userProfile.username} data-ai-hint="profile picture" />
                <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <p className="font-semibold">{userProfile.name}</p>
            <p className="text-sm text-muted-foreground">{userProfile.username}</p>
            <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                <button className="hover:text-primary"><span className="font-bold text-primary-foreground">{userProfile.following}</span> Following</button>
                <button className="hover:text-primary"><span className="font-bold text-primary-foreground">{userProfile.followers}</span> Followers</button>
            </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="overflow-y-auto no-scrollbar">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href || '#'} className="w-full">
                  <SidebarMenuButton>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <Separator className="my-4" />
        <SidebarMenu>
            {helpItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <Link href={item.href || '#'} className="w-full">
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
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton onClick={signOut}>
                    <LogOut />
                    <span>Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
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
