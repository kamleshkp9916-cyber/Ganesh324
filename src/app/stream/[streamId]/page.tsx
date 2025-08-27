
"use client";

import {
  ArrowLeft,
  Heart,
  MessageSquare,
  MoreVertical,
  Send,
  Share2,
  ShoppingCart,
  Star,
  UserPlus,
  Users,
  X,
  PlusCircle,
  Video,
  Zap,
  Play,
  Pause,
  Settings,
  RadioTower,
  Tv,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { productDetails } from "@/components/product-detail-client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { addToCart, isProductInCart } from "@/lib/product-history";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


const liveSellers = [
    { id: 1, name: 'FashionFinds', avatarUrl: 'https://placehold.co/40x40.png', viewers: 1200, productId: 'prod_1' },
    { id: 2, name: 'GadgetGuru', avatarUrl: 'https://placehold.co/40x40.png', viewers: 2500, productId: 'prod_2' },
    { id: 3, name: 'HomeHaven', avatarUrl: 'https://placehold.co/40x40.png', viewers: 850, productId: 'prod_3' },
    { id: 4, name: 'BeautyBox', avatarUrl: 'https://placehold.co/40x40.png', viewers: 3100, productId: 'prod_4' },
    { id: 5, name: 'KitchenWiz', avatarUrl: 'https://placehold.co/40x40.png', viewers: 975, productId: 'prod_5' },
    { id: 6, name: 'FitFlow', avatarUrl: 'https://placehold.co/40x40.png', viewers: 1500, productId: 'prod_6' },
    { id: 7, name: 'ArtisanAlley', avatarUrl: 'https://placehold.co/40x40.png', viewers: 450, productId: 'prod_7' },
    { id: 8, name: 'PetPalace', avatarUrl: 'https://placehold.co/40x40.png', viewers: 1800, productId: 'prod_8' },
    { id: 9, name: 'BookNook', avatarUrl: 'https://placehold.co/40x40.png', viewers: 620, productId: 'prod_9' },
    { id: 10, name: 'GamerGuild', avatarUrl: 'https://placehold.co/40x40.png', viewers: 4200, productId: 'prod_10' },
];

const mockChat = [
    { id: 1, type: 'chat', user: 'Alice', message: 'This looks amazing! What material is it?' },
    { id: 2, type: 'chat', user: 'Bob', message: 'Just joined, what did I miss?' },
    { id: 3, type: 'product', productKey: 'prod_1', stock: 15 },
    { id: 4, type: 'chat', user: 'Charlie', message: 'I bought this last week, it\'s great quality!'},
    { id: 5, type: 'chat', user: 'Diana', message: 'Is there a discount code?'},
    { id: 6, type: 'product', productKey: 'prod_2', stock: 8 },
    { id: 7, type: 'chat', user: 'Eve', message: '🔥🔥🔥'},
    { id: 8, type: 'chat', user: 'Frank', message: 'Can you show the back of the product?'},
];

function ProductChatMessage({ productKey, stock, onAddToCart, onBuyNow }: { productKey: string, stock: number, onAddToCart: (productKey: string) => void, onBuyNow: (productKey: string) => void }) {
    const product = productDetails[productKey as keyof typeof productDetails];
    if (!product) return null;

    return (
        <Card className="bg-background/80 backdrop-blur-sm border-primary/50 my-2">
            <CardContent className="p-3 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <Image src={product.images[0]} alt={product.name} width={60} height={60} className="rounded-md object-cover" data-ai-hint={product.hint}/>
                    <div className="flex-grow overflow-hidden">
                        <p className="text-sm font-semibold truncate">{product.name}</p>
                        <p className="text-sm font-bold text-primary">{product.price}</p>
                         <Badge variant={stock > 10 ? "outline" : "destructive"} className="mt-1">
                            <Zap className="mr-1 h-3 w-3" />
                            {stock} left
                        </Badge>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <Button size="sm" className="flex-1" onClick={() => onAddToCart(productKey)}>
                        <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                    </Button>
                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => onBuyNow(productKey)}>
                        Buy Now
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function StreamPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const streamId = params.streamId as string;
  
  const [seller, setSeller] = useState<typeof liveSellers[0] | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [quality, setQuality] = useState('Auto');

  useEffect(() => {
    const sellerData = liveSellers.find(s => String(s.id) === streamId);
    if (sellerData) {
      setSeller(sellerData);
    } else {
        const liveStreamDataRaw = localStorage.getItem('liveStream');
        if (liveStreamDataRaw) {
            const liveStreamData = JSON.parse(liveStreamDataRaw);
            if (liveStreamData.seller.id === streamId) {
                setSeller({
                    id: liveStreamData.seller.id,
                    name: liveStreamData.seller.name,
                    avatarUrl: liveStreamData.seller.photoURL || 'https://placehold.co/40x40.png',
                    viewers: Math.floor(Math.random() * 5000),
                    productId: liveStreamData.product.id
                });
            }
        }
    }
  }, [streamId]);

  const handleAddToCart = (productKey: string) => {
    const product = productDetails[productKey as keyof typeof productDetails];
    if (product) {
        addToCart({ ...product, imageUrl: product.images[0], quantity: 1 });
        toast({
            title: "Added to Cart!",
            description: `${product.name} has been added to your shopping cart.`,
        });
    }
  };

  const handleBuyNow = (productKey: string) => {
      router.push(`/cart?buyNow=true&productId=${productKey}`);
  };


  if (!seller) {
    return <div className="h-screen w-full flex items-center justify-center"><LoadingSpinner /></div>;
  }

  return (
    <div className="h-screen w-full flex flex-col lg:flex-row bg-background text-foreground">
      {/* Video Player Section */}
      <div className="flex-grow bg-black flex flex-col relative group">
        <header className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent z-10 text-white transition-opacity duration-300 opacity-100 group-hover:opacity-100">
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 hover:text-white" onClick={() => router.back()}>
              <ArrowLeft />
            </Button>
            <Avatar>
              <AvatarImage src={seller.avatarUrl} alt={seller.name} />
              <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{seller.name}</h2>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="destructive" className="h-5">LIVE</Badge>
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{seller.viewers}</span>
                </div>
              </div>
            </div>
          </div>
          <Button variant="secondary" size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Follow
          </Button>
        </header>
        
        <div className="flex-1 relative flex items-center justify-center">
            {/* Placeholder for video player */}
            <div className="w-full h-full bg-gray-900 flex items-center justify-center text-muted-foreground">
                <Video className="h-16 w-16" />
            </div>

             {/* Player Controls Overlay */}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button variant="ghost" size="icon" className="h-16 w-16 text-white" onClick={() => setIsPaused(!isPaused)}>
                    {isPaused ? <Play className="h-12 w-12" /> : <Pause className="h-12 w-12" />}
                </Button>
            </div>
            
            <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white">
                            <Settings className="h-6 w-6" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" side="top">
                        <DropdownMenuItem onSelect={() => setQuality('Auto')}>
                            <RadioTower className="mr-2 h-4 w-4" />
                            <span>Auto</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setQuality('1080p')}>
                            <Tv className="mr-2 h-4 w-4" />
                            <span>1080p</span>
                        </DropdownMenuItem>
                         <DropdownMenuItem onSelect={() => setQuality('720p')}>
                             <Tv className="mr-2 h-4 w-4" />
                            <span>720p</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
             {isPaused && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Button variant="ghost" size="icon" className="h-16 w-16 text-white" onClick={() => setIsPaused(false)}>
                        <Play className="h-12 w-12 fill-white" />
                    </Button>
                </div>
            )}
        </div>
      </div>

      {/* Chat and Details Section */}
      <aside className="w-full lg:w-96 h-1/2 lg:h-screen border-l flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg">Live Chat</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical /></Button>
        </div>
        <div className="flex-grow p-4 space-y-4 overflow-y-auto">
          {mockChat.map(item => (
             item.type === 'chat' ? (
                <div key={item.id} className="flex items-start gap-2 text-sm">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{item.user!.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{item.user}</p>
                        <p className="text-muted-foreground">{item.message}</p>
                    </div>
                </div>
            ) : (
                <ProductChatMessage 
                    key={item.id} 
                    productKey={item.productKey!}
                    stock={item.stock!} 
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                />
            )
          ))}
        </div>
        <div className="p-3 border-t">
          <form className="flex items-center gap-2">
            <Button variant="ghost" size="icon"><PlusCircle className="h-5 w-5" /></Button>
            <Input placeholder="Say something..." className="flex-grow" />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </aside>
    </div>
  );
}
