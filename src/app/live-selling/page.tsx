
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Home, LayoutGrid, Menu, Search, ShoppingCart, FilePen, Wallet, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";

export default function LiveSellingPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);

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

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return liveProducts;
    return liveProducts.filter(
      (product) =>
        product.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.productName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, liveProducts]);


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex-1 mx-4">
            {isSearchVisible ? (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by user or product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>
            ) : (
              <div className="flex justify-center">
                 <Image src="/streamcart-logo.png" alt="StreamCart Logo" width={180} height={40} data-ai-hint="logo" />
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsSearchVisible(!isSearchVisible)}>
            {isSearchVisible ? <ArrowLeft className="h-6 w-6" /> : <Search className="h-6 w-6" />}
          </Button>
        </div>
        {!isSearchVisible && <Separator className="mt-4" />}
      </header>
      <main className="flex-1 overflow-y-auto px-4">
        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map((product, index) => (
            <Card key={index} className="overflow-hidden relative aspect-[9/16]">
              <div className={`absolute inset-0 ${product.bgColor}`} />
              <CardContent className="p-2 flex items-end h-full">
                <div className="flex items-center gap-2 text-white text-sm font-semibold">
                  <Avatar className="border-2 border-red-500">
                    <AvatarImage src={product.userImage} alt={product.userName} data-ai-hint="profile picture" />
                    <AvatarFallback>{product.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{product.userName}<br/>{product.productName}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <footer className="sticky bottom-0 bg-background border-t p-2">
        <div className="flex justify-around items-center">
          <Button variant="ghost" className="flex flex-col h-auto p-2 text-primary">
            <Home className="h-8 w-8" />
            <span className="text-xs font-bold -mt-1">_</span>
          </Button>
          <Button variant="ghost" className="flex flex-col h-auto p-2 text-foreground">
            <FilePen className="h-8 w-8" />
          </Button>
          <Button variant="ghost" className="flex flex-col h-auto p-2 text-foreground">
            <LayoutGrid className="h-8 w-8" />
          </Button>
          <Button variant="ghost" className="flex flex-col h-auto p-2 text-foreground">
            <ShoppingCart className="h-8 w-8" />
          </Button>
           <Button variant="ghost" className="flex flex-col h-auto p-2 text-foreground">
            <Wallet className="h-8 w-8" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
