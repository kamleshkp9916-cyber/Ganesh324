
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
  Volume2,
  VolumeX,
  List,
  Smile,
  PanelRightClose,
  PanelRightOpen,
  Flag,
  MessageCircle,
  LifeBuoy,
  Gavel,
  ShieldCheck,
  StopCircle,
  Rewind,
  FastForward,
  WifiOff,
  ChevronDown,
  Maximize,
  Minimize,
  PictureInPicture,
  ShoppingBag,
  Paperclip,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { productDetails } from "@/lib/product-data";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { addToCart, isProductInCart } from "@/lib/product-history";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/hooks/use-auth';
import { ScrollArea } from "@/components/ui/scroll-area";
import { toggleFollow, getUserData } from "@/lib/follow-data";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase';
import { Slider } from "@/components/ui/slider";
import { FeedbackDialog } from "@/components/feedback-dialog";
import { Textarea } from "@/components/ui/textarea";

const liveSellers = [
    { id: '1', name: 'FashionFinds', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Fashion', viewers: 1200, buyers: 25, rating: 4.8, reviews: 12, hint: 'woman posing stylish outfit', productId: 'prod_1', hasAuction: true },
    { id: '2', name: 'GadgetGuru', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Electronics', viewers: 2500, buyers: 42, rating: 4.9, reviews: 28, hint: 'unboxing new phone', productId: 'prod_2', hasAuction: false },
    { id: '3', name: 'HomeHaven', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Home Goods', viewers: 850, buyers: 15, rating: 4.7, reviews: 9, hint: 'modern living room decor', productId: 'prod_3', hasAuction: false },
    { id: '4', name: 'BeautyBox', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Beauty', viewers: 3100, buyers: 78, rating: 4.9, reviews: 55, hint: 'makeup tutorial', productId: 'prod_4', hasAuction: true },
    { id: '5', name: 'KitchenWiz', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Kitchenware', viewers: 975, buyers: 0, rating: 0, reviews: 0, hint: 'cooking demonstration', productId: 'prod_5', hasAuction: false },
    { id: '6', name: 'FitFlow', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Fitness', viewers: 1500, buyers: 33, rating: 4.6, reviews: 18, hint: 'yoga session', productId: 'prod_6', hasAuction: false },
    { id: '7', name: 'ArtisanAlley', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Handmade', viewers: 450, buyers: 8, rating: 5.0, reviews: 6, hint: 'pottery making', productId: 'prod_7', hasAuction: true },
    { id: '8', name: 'PetPalace', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Pet Supplies', viewers: 1800, buyers: 50, rating: 4.8, reviews: 30, hint: 'playing with puppy', productId: 'prod_8', hasAuction: false },
    { id: '9', name: 'BookNook', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Books', viewers: 620, buyers: 12, rating: 4.9, reviews: 10, hint: 'reading book cozy', productId: 'prod_9', hasAuction: false },
    { id: '10', name: 'GamerGuild', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Gaming', viewers: 4200, buyers: 102, rating: 4.9, reviews: 80, hint: 'esports competition', productId: 'prod_10', hasAuction: true },
];

const mockChatMessages: any[] = [
    { id: 1, user: 'Ganesh', text: 'This looks amazing! 🔥', avatar: 'https://placehold.co/40x40.png' },
    { id: 2, user: 'Alex', text: 'What is the material?', avatar: 'https://placehold.co/40x40.png' },
    { id: 3, user: 'Jane', text: 'I just bought one! So excited. 🤩', avatar: 'https://placehold.co/40x40.png' },
    { id: 'system-1', type: 'system', text: 'Sarah joined the stream.'},
    { id: 'prod-123', type: 'product', productKey: 'prod_2', timestamp: '10:05 AM' },
];

const streamCategories = ["Fashion", "Electronics", "Home Goods", "Beauty", "Fitness", "Handmade", "Books", "Gaming", "Pet Supplies", "Kitchenware"];

function formatTime(seconds: number) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function StreamPage() {
    const router = useRouter();
    const params = useParams();
    const streamId = params.streamId as string;
    const { user } = useAuth();
    const { toast } = useToast();

    // Mock Data for UI building
    const mockStreamData = {
        id: streamId,
        title: "Live Shopping Event",
        status: "live",
        startedAt: new Timestamp(Math.floor(Date.now() / 1000) - 300, 0), // 5 minutes ago
        viewerCount: 12400,
        streamUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    };

    const streamData = mockStreamData; // Use mock data directly
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    
    const [isPaused, setIsPaused] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [chatMessages, setChatMessages] = useState(mockChatMessages);
    const [newMessage, setNewMessage] = useState("");
    const [isProductListVisible, setIsProductListVisible] = useState(false);
    
    const handlePlayPause = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play().catch(console.error);
        } else {
            video.pause();
        }
    }, []);

    const handleSeek = (direction: 'forward' | 'backward') => {
        const video = videoRef.current;
        if (!video) return;
        const newTime = direction === 'forward' ? video.currentTime + 10 : video.currentTime - 10;
        video.currentTime = Math.max(0, Math.min(duration, newTime));
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            const viewport = chatContainerRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, [chatMessages]);
    
    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            const updateProgress = () => setCurrentTime(video.currentTime);
            const setVideoDuration = () => setDuration(video.duration);
            const onPlay = () => setIsPaused(false);
            const onPause = () => setIsPaused(true);

            video.addEventListener("timeupdate", updateProgress);
            video.addEventListener("loadedmetadata", setVideoDuration);
            video.addEventListener("play", onPlay);
            video.addEventListener("pause", onPause);

            // Start muted and autoplay if possible
            video.muted = true;
            video.play().catch(() => {
                setIsPaused(true);
            });

            return () => {
                video.removeEventListener("timeupdate", updateProgress);
                video.removeEventListener("loadedmetadata", setVideoDuration);
                video.removeEventListener("play", onPlay);
                video.removeEventListener("pause", onPause);
            };
        }
    }, [duration]);

    const handleNewMessageSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        const newMsg = {
            id: Date.now(),
            user: user?.displayName || 'You',
            text: newMessage,
            avatar: user?.photoURL || 'https://placehold.co/40x40.png'
        };
        setChatMessages(prev => [...prev, newMsg]);
        setNewMessage("");
    };

    const handleReportStream = () => {
        toast({
            title: "Stream Reported",
            description: "Thank you for your feedback. Our team will review this stream shortly.",
        });
    };
    
    const handleReportMessage = (messageId: number) => {
        toast({
            title: "Message Reported",
            description: "The message has been reported and will be reviewed by our moderation team.",
        });
    };
    
    const elapsedTime = streamData?.startedAt ? (Date.now() - (streamData.startedAt as Timestamp).toDate().getTime()) / 1000 : currentTime;
    
    const seller = useMemo(() => liveSellers.find(s => s.id === streamId), [streamId]);
    
    const handleAddToCart = (product: any) => {
      if (product) {
        addToCart({ ...product, quantity: 1 });
        toast({
          title: "Added to Cart!",
          description: `'${product.name}' has been added to your cart.`,
        });
      }
    };
    const handleBuyNow = (product: any) => {
      if (product) {
        router.push(`/cart?buyNow=true&productId='${product.key}'`);
      }
    };
    const handleNotifyMe = () => {
        toast({
            title: "You're on the list!",
            description: "We'll notify you when this product is back in stock."
        });
    };

    const sellerProducts = Object.values(productDetails).filter(p => p.brand === seller?.name);

    return (
        <div className="h-dvh w-full bg-black text-white grid grid-cols-1 lg:grid-cols-[300px_1fr_340px] overflow-hidden">
            <aside className="hidden lg:flex lg:col-span-1 h-full flex-col border-r border-border bg-background text-foreground">
                 <ScrollArea className="h-full">
                    <div className="p-4">
                        <h3 className="font-semibold mb-4">Browse by Category</h3>
                        <div className="space-y-2">
                            {streamCategories.map(category => (
                                <Button key={category} variant="ghost" className="w-full justify-start">{category}</Button>
                            ))}
                        </div>
                        <Separator className="my-4" />
                        <h3 className="font-semibold mb-4">Live Sellers</h3>
                        <div className="space-y-3">
                            {liveSellers.slice(0, 10).map(s => (
                                <Link key={s.id} href={`/stream/${s.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={s.avatarUrl} />
                                        <AvatarFallback>{s.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow overflow-hidden">
                                        <p className="font-semibold text-sm truncate">{s.name}</p>
                                        <p className="text-xs text-muted-foreground">{s.category}</p>
                                    </div>
                                    <div className="flex items-center text-xs">
                                        <Users className="h-3 w-3 mr-1" />
                                        {s.viewers}
                                    </div>
                                </Link>
                            ))}
                        </div>
                         <Button variant="link" className="text-muted-foreground w-full mt-2 justify-end p-2 h-auto">More...</Button>
                    </div>
                </ScrollArea>
            </aside>
             <div className="lg:col-span-1 w-full h-full flex flex-col overflow-hidden">
                 <div className="w-full h-full flex flex-col overflow-y-auto no-scrollbar">
                    <div className="w-full h-[60vh] bg-black relative group flex-shrink-0" ref={playerRef}>
                        <video
                            ref={videoRef}
                            src={streamData.streamUrl || "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
                            className="w-full h-full object-cover"
                            loop
                        />
                         <div 
                            className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/60 flex flex-col p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                            {/* Top Bar */}
                             <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft /></Button>
                                     <h1 className="font-bold text-lg hidden sm:block">{streamData.title || "Live Event"}</h1>
                                </div>
                                <Badge variant="secondary" className="gap-1.5"><Users className="h-3 w-3" /> {Math.round(streamData.viewerCount / 1000)}K watching</Badge>
                            </div>

                            {/* Center Controls */}
                             <div className="flex-1 flex items-center justify-center gap-4 sm:gap-8">
                                <Button variant="ghost" size="icon" className="w-14 h-14" onClick={() => handleSeek('backward')}><Rewind className="w-8 h-8" /></Button>
                                <Button variant="ghost" size="icon" className="w-20 h-20" onClick={handlePlayPause}>
                                    {isPaused ? <Play className="w-12 h-12 fill-current" /> : <Pause className="w-12 h-12 fill-current" />}
                                </Button>
                                <Button variant="ghost" size="icon" className="w-14 h-14" onClick={() => handleSeek('forward')}><FastForward className="w-8 h-8" /></Button>
                            </div>

                             {/* Bottom Bar */}
                             <div className="space-y-3">
                                <Progress value={(currentTime / duration) * 100} className="h-2" />
                                 <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 sm:gap-4">
                                        <Badge variant="destructive" className="gap-1.5"><div className="h-2 w-2 rounded-full bg-white animate-pulse" /> LIVE</Badge>
                                        <Button variant="ghost" size="icon" onClick={() => setIsMuted(prev => !prev)}>
                                            {isMuted ? <VolumeX /> : <Volume2 />}
                                        </Button>
                                        <p className="text-sm font-mono">{formatTime(elapsedTime)}</p>
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <Button variant="ghost" size="icon"><PictureInPicture /></Button>
                                        <Button variant="ghost" size="icon"><Share2 /></Button>
                                        <Button variant="ghost" size="icon"><Settings /></Button>
                                        <Button variant="ghost" size="icon"><Maximize /></Button>
                                    </div>
                                 </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t border-border bg-background text-foreground overflow-y-auto flex-grow">
                        <Collapsible>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {seller && (
                                        <>
                                            <Avatar>
                                                <AvatarImage src={seller.avatarUrl} />
                                                <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <h3 className="font-semibold">{seller.name}</h3>
                                            <Button variant="secondary" size="sm" className="h-7">
                                                <UserPlus className="mr-1.5 h-4 w-4" /> Follow
                                            </Button>
                                        </>
                                    )}
                                </div>
                                <CollapsibleTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                        Show Description
                                        <ChevronDown className="h-4 w-4 ml-2" />
                                    </Button>
                                </CollapsibleTrigger>
                            </div>
                            <CollapsibleContent>
                                <p className="text-sm text-muted-foreground pt-3">
                                    {seller?.description || "No description available for this stream."}
                                </p>
                            </CollapsibleContent>
                        </Collapsible>
                        <div className="mt-6">
                            <h4 className="font-semibold mb-4">Related Streams</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {liveSellers.filter(s => s.id !== streamId).map(s => (
                                    <Link href={`/stream/${s.id}`} key={s.id} className="group relative rounded-lg overflow-hidden">
                                        <div className="absolute top-2 left-2 z-10"><Badge variant="destructive">LIVE</Badge></div>
                                        <Image src={s.thumbnailUrl} alt={s.name} width={200} height={300} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                                            <p className="font-semibold text-white text-sm truncate">{s.name}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-1 bg-background text-foreground flex flex-col h-full border-l border-border relative">
                <div className="p-4 border-b flex items-center justify-between z-10 flex-shrink-0">
                    <h3 className="font-bold text-lg">Live Chat</h3>
                    <div className="flex items-center gap-2">
                        {seller?.hasAuction && (
                            <Button variant="ghost" size="icon">
                                <Gavel className="h-5 w-5 text-purple-500" />
                            </Button>
                        )}
                       <Button variant="ghost" size="icon" onClick={() => setIsProductListVisible(prev => !prev)}>
                            <ShoppingBag className="h-5 w-5" />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                             <DropdownMenuContent align="end">
                                <FeedbackDialog>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <MessageCircle className="mr-2 h-4 w-4" /> Feedback
                                    </DropdownMenuItem>
                                </FeedbackDialog>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:text-destructive">
                                            <Flag className="mr-2 h-4 w-4" /> Report Stream
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Report Stream?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                If this stream violates our community guidelines, please report it. Our moderation team will review it promptly.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleReportStream}>Report</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>

                <div
                    className={cn(
                        "absolute inset-x-0 top-16 bottom-0 z-20 bg-background/80 backdrop-blur-sm transition-transform duration-300 ease-in-out",
                        isProductListVisible ? 'translate-y-0' : 'translate-y-full'
                    )}
                >
                    <div className="h-full flex flex-col">
                         <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="font-semibold">Products in this Stream</h3>
                             <Button variant="ghost" size="icon" onClick={() => setIsProductListVisible(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <ScrollArea className="flex-grow">
                             <div className="p-4 space-y-4">
                                {(sellerProducts.length > 0 ? sellerProducts : [productDetails['prod_1'], productDetails['prod_2'], { ...productDetails['prod_3'], stock: 0 }]).map(product => (
                                    <div key={product.key} className="flex items-center gap-4">
                                        <Link href={`/product/'${product.key}'`} className="block flex-shrink-0">
                                            <Image src={product.images[0]} alt={product.name} width={80} height={80} className="rounded-lg object-cover" data-ai-hint={product.hint} />
                                        </Link>
                                        <div className="flex-grow">
                                            <Link href={`/product/'${product.key}'`} className="hover:underline">
                                                <h3 className="font-semibold text-sm">{product.name}</h3>
                                            </Link>
                                            <p className="font-bold text-base text-foreground">{product.price}</p>
                                            <Badge variant={product.stock > 0 ? 'success' : 'destructive'}>{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</Badge>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                        {product.stock > 0 ? (
                                            <>
                                                <Button size="sm" onClick={() => handleBuyNow(product)}>Buy Now</Button>
                                                <Button size="sm" variant="outline" onClick={() => handleAddToCart(product)}>Add to Cart</Button>
                                            </>
                                        ) : (
                                            <Button size="sm" onClick={handleNotifyMe}>Notify Me</Button>
                                        )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>

                <ScrollArea className="flex-grow" ref={chatContainerRef}>
                    <div className="p-4 space-y-4">
                        {chatMessages.map(msg => {
                            if (msg.type === 'system') {
                                return (
                                    <div key={msg.id} className="text-center text-xs text-muted-foreground italic py-1">
                                        {msg.text}
                                    </div>
                                );
                            }
                            if (msg.type === 'product') {
                                const product = productDetails[msg.productKey as keyof typeof productDetails];
                                if (!product) return null;
                                return (
                                    <Card key={msg.id} className="bg-muted overflow-hidden">
                                        <div className="flex items-center gap-4 p-3">
                                            <Image src={product.images[0]} alt={product.name} width={64} height={64} className="rounded-md" />
                                            <div className="flex-grow">
                                                <p className="text-xs text-muted-foreground">Featured Product</p>
                                                <h4 className="font-semibold text-sm">{product.name}</h4>
                                                <p className="font-bold">{product.price}</p>
                                            </div>
                                        </div>
                                        <CardFooter className="p-2 bg-background flex gap-2">
                                            <Button size="sm" className="flex-1" onClick={() => handleBuyNow(product)}>Buy Now</Button>
                                            <Button size="sm" variant="outline" className="flex-1" onClick={() => handleAddToCart(product)}>Add to Cart</Button>
                                        </CardFooter>
                                    </Card>
                                )
                            }
                            return (
                                <div key={msg.id} className="flex items-start gap-2 group">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={msg.avatar} />
                                        <AvatarFallback>{msg.user.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow">
                                        <span className="font-semibold">{msg.user}</span>
                                        <p className="text-muted-foreground">{msg.text}</p>
                                    </div>
                                    <AlertDialog>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                                                        <Flag className="mr-2 h-4 w-4" /> Report Message
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Report this message?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This message will be sent to our moderation team for review. Abusing this feature may result in account penalties.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleReportMessage(msg.id)}>Confirm Report</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            )
                        })}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t flex-shrink-0">
                    <form onSubmit={handleNewMessageSubmit} className="flex items-center gap-3">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" type="button" className="flex-shrink-0">
                                    <Smile className="h-5 w-5" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <p>Emoji picker coming soon!</p>
                            </PopoverContent>
                        </Popover>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" type="button" className="flex-shrink-0">
                                    <Paperclip className="h-5 w-5" />
                                </Button>
                            </PopoverTrigger>
                             <PopoverContent>
                                <p>File attachments coming soon!</p>
                            </PopoverContent>
                        </Popover>
                        <Textarea
                            placeholder="Send a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            className="resize-none flex-grow"
                            rows={1}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleNewMessageSubmit(e);
                                }
                            }}
                        />
                        <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
