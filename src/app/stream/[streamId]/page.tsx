

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
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/hooks/use-auth';
import { ScrollArea } from "@/components/ui/scroll-area";
import { toggleFollow, getUserData } from "@/lib/follow-data";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";


const liveSellers = [
    { id: '1', name: 'FashionFinds', avatarUrl: 'https://placehold.co/40x40.png', viewers: 1200, productId: 'prod_1', hasAuction: true, category: 'Fashion', description: 'Showcasing our latest vintage-inspired summer collection. Exclusive deals for live viewers!' },
    { id: '2', name: 'GadgetGuru', avatarUrl: 'https://placehold.co/40x40.png', viewers: 2500, productId: 'prod_2', hasAuction: false, category: 'Electronics', description: 'Unboxing the brand new SoundWave Pro 2 headphones. We will be testing the noise cancellation and battery life. Ask me anything!' },
    { id: '3', name: 'HomeHaven', avatarUrl: 'https://placehold.co/40x40.png', viewers: 850, productId: 'prod_3', hasAuction: false, category: 'Home Goods', description: 'Transform your living space with our new minimalist home decor items. Perfect for a modern aesthetic.' },
    { id: '4', name: 'BeautyBox', avatarUrl: 'https://placehold.co/40x40.png', viewers: 3100, productId: 'prod_4', hasAuction: true, category: 'Beauty', description: 'Live makeup tutorial: Achieving the perfect evening look with our new eyeshadow palette. Big giveaways during the stream!' },
    { id: '5', name: 'KitchenWiz', avatarUrl: 'https://placehold.co/40x40.png', viewers: 975, productId: 'prod_5', hasAuction: false, category: 'Kitchenware', description: 'Cooking demo! Making a one-pot pasta with our best-selling non-stick pan. Simple, easy, and delicious.' },
    { id: '6', name: 'FitFlow', avatarUrl: 'https://placehold.co/40x40.png', viewers: 1500, productId: 'prod_6', hasAuction: false, category: 'Fitness', description: 'Join our live 30-minute yoga session. We are using our extra-thick, non-slip yoga mats. All experience levels are welcome!' },
    { id: '7', name: 'ArtisanAlley', avatarUrl: 'https://placehold.co/40x40.png', viewers: 450, productId: 'prod_7', hasAuction: true, category: 'Handmade', description: 'Watch me create a unique pottery piece from scratch. This one-of-a-kind item will be auctioned at the end of the stream.' },
    { id: '8', name: 'PetPalace', avatarUrl: 'https://placehold.co/40x40.png', viewers: 1800, productId: 'prod_8', hasAuction: false, category: 'Pet Supplies', description: 'Everything your furry friend needs! Today we are looking at our orthopedic pet beds and interactive toys.' },
    { id: '9', name: 'BookNook', avatarUrl: 'https://placehold.co/40x40.png', viewers: 620, productId: 'prod_9', hasAuction: false, category: 'Books', description: 'Live reading from the first chapter of this month\'s featured novel. We have signed copies available for purchase!' },
    { id: '10', name: 'GamerGuild', avatarUrl: 'https://placehold.co/40x40.png', viewers: 4200, productId: 'prod_10', hasAuction: true, category: 'Gaming', description: 'High-stakes gaming tournament! Watch the pros compete and get a chance to win the gaming mouse they are using.' },
];

const mockInitialChat = [
    { id: 1, type: 'chat', user: 'Alice', message: 'This looks amazing! What material is it?' },
    { id: 2, type: 'chat', user: 'Bob', message: 'Just joined, what did I miss?' },
    { id: 3, type: 'product', productKey: 'prod_1', stock: 15 },
    { id: 4, type: 'chat', user: 'Charlie', message: 'I bought this last week, it\'s great quality!'},
    { id: 5, type: 'chat', user: 'Diana', message: 'Is there a discount code?'},
    { id: 6, type: 'product', productKey: 'prod_2', stock: 8 },
    { id: 7, type: 'chat', user: 'Eve', message: '🔥🔥🔥'},
    { id: 8, type: 'chat', user: 'Frank', message: 'Can you show the back of the product?'},
];

const allStreamProducts = Object.values(productDetails).map(p => ({...p, stock: Math.floor(Math.random() * 20) + 5})); // Add mock stock

const emojis = [
    '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '😘', '🥰', '😗', '😙', '😚',
    '🙂', '🤗', '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '😴',
    '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖', '😞', '😟', '😤',
    '😢', '😭', '😦', '😧', '😨', '😩', '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '😡', '😠', '🤬',
    '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😇', '🤠', '🤡', '🥳', '🥴', '🥺', '🤥', '🤫', '🤭', '🧐', '🤓', '😈',
    '👿', '👹', '👺', '💀', '👻', '👽', '🤖', '💩', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👋', '🤚',
    '🖐️', '✋', '🖖', '👏', '🙌', '🙏', '🤝', '💪', '🦾', '🦵', '🦿', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴',
    '👀', '👁️', '👅', '👄', '❤️', '💔', '💕', '💖', '💗', '💓', '💞', '💝', '💟', '✨', '⭐', '🌟', '💫', '💥',
    '💯', '🔥', '🎉', '🎊', '🎁', '🎈',
];

const mockViewers = [
    { userId: 'user1', name: 'Alice', avatar: 'https://placehold.co/40x40.png' },
    { userId: 'user2', name: 'Bob', avatar: 'https://placehold.co/40x40.png' },
    { userId: 'user3', name: 'Charlie', avatar: 'https://placehold.co/40x40.png' },
    { userId: 'user4', name: 'Diana', avatar: 'https://placehold.co/40x40.png' },
    { userId: 'user5', name: 'Eve', avatar: 'https://placehold.co/40x40.png' },
    { userId: 'user6', name: 'Frank', avatar: 'https://placehold.co/40x40.png' },
    { userId: 'user7', name: 'Grace', avatar: 'https://placehold.co/40x40.png' },
];


function ProductChatMessage({ productKey, stock, onAddToCart, onBuyNow, isAdminView }: { productKey: string, stock: number, onAddToCart: (productKey: string) => void, onBuyNow: (productKey: string) => void, isAdminView: boolean }) {
    const product = productDetails[productKey as keyof typeof productDetails];
    if (!product) return null;

    return (
        <Link href={`/product/${productKey}`}>
            <Card className="bg-background/80 backdrop-blur-sm border-primary/50 my-2 cursor-pointer hover:bg-background/90">
                <CardContent className="p-3 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <Image src={product.images[0]} alt={product.name} width={60} height={60} className="rounded-md object-cover" data-ai-hint={product.hint}/>
                        <div className="flex-grow overflow-hidden">
                            <p className="text-sm font-semibold truncate">{product.name}</p>
                            <p className="text-sm font-bold text-foreground">{product.price}</p>
                             <Badge variant={stock > 10 ? "outline" : "destructive"} className="mt-1">
                                <Zap className="mr-1 h-3 w-3" />
                                {stock} left
                            </Badge>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(productKey); }} disabled={isAdminView}>
                            <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                        </Button>
                        <Button size="sm" variant="default" className="flex-1" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onBuyNow(productKey); }} disabled={isAdminView}>
                            Buy Now
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}

function ProductListItem({ product, isBuyable, onAddToCart, onBuyNow, isAdminView }: { product: any, isBuyable: boolean, onAddToCart: (productKey: string) => void, onBuyNow: (productKey: string) => void, isAdminView: boolean }) {
     return (
        <div className="flex items-center gap-3 py-2 border-b last:border-none border-white/10">
            <Image src={product.images[0]} alt={product.name} width={50} height={50} className="rounded-md object-cover" data-ai-hint={product.hint}/>
            <div className="flex-grow overflow-hidden">
                <p className="text-sm font-semibold truncate">{product.name}</p>
                <p className="text-xs text-muted-foreground">{product.price}</p>
            </div>
            <div className="flex flex-col gap-1">
                 <Button size="sm" variant="secondary" onClick={() => onAddToCart(product.key)} disabled={!isBuyable || isAdminView} className="h-7 text-xs">
                    <ShoppingCart className="mr-1.5 h-3 w-3" /> Cart
                </Button>
                <Button size="sm" onClick={() => onBuyNow(product.key)} disabled={!isBuyable || isAdminView} className="h-7 text-xs">
                    Buy
                </Button>
            </div>
        </div>
    )
}

const STREAM_TERMINATED_KEY = 'stream_terminated_violation';
const FLAGGED_COMMENTS_KEY = 'streamcart_flagged_comments';

function formatTime(seconds: number) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    if(h === '00') return `${m}:${s}`;
    return `${h}:${m}:${s}`;
}

export default function StreamPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const { user, userData } = useAuth();
  
  const [seller, setSeller] = useState<any>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [quality, setQuality] = useState('Auto');
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isProductListOpen, setIsProductListOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState(mockInitialChat);
  const [newChatMessage, setNewChatMessage] = useState("");
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isStreamTerminated, setIsStreamTerminated] = useState(false);
  const [seekIndicator, setSeekIndicator] = useState<'forward' | 'backward' | null>(null);
  const doubleClickTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const streamId = params.streamId as string;
  const [isClient, setIsClient] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const featuredProductIds = chatMessages.filter(item => item.type === 'product').map(item => item.productKey);
  const isAdminView = userData?.role === 'admin';

  const streamProducts = useMemo(() => {
    if (seller?.hasAuction) {
      return Object.values(productDetails).filter(p => (p as any).isAuctionItem);
    }
    return allStreamProducts;
  }, [seller]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const connectWebSocket = useCallback(() => {
    console.log("Attempting to connect WebSocket...");
    setIsConnecting(true);
    const ws = new WebSocket("wss://echo.websocket.org/");
    ws.onopen = () => {
      console.log("WebSocket connected!");
      setIsConnecting(false);
      setChatMessages(prev => [...prev, { id: Date.now(), type: 'chat', user: 'System', message: 'Chat connected.' }]);
       if (reconnectTimeoutRef.current) {
            clearInterval(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
       }
    };
    ws.onmessage = (event) => console.log("Received:", event.data);
    ws.onerror = (error) => console.error("WebSocket error:", error);
    ws.onclose = () => {
      console.log("WebSocket disconnected.");
      setIsConnecting(false);
      setChatMessages(prev => [...prev, { id: Date.now(), type: 'chat', user: 'System', message: 'Chat disconnected. Reconnecting...' }]);
       if (!reconnectTimeoutRef.current) {
            reconnectTimeoutRef.current = setTimeout(() => connectWebSocket(), 3000);
       }
    };
    return ws;
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const ws = connectWebSocket();
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === STREAM_TERMINATED_KEY && event.newValue === streamId) setIsStreamTerminated(true);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
        ws.close();
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [isClient, streamId, connectWebSocket]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) viewport.scrollTop = viewport.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    if (!isClient) return;
    let sellerData: any = liveSellers.find(s => s.id === streamId || s.name === streamId) || null;
    if (!sellerData) {
        const liveStreamDataRaw = localStorage.getItem('liveStream');
        if (liveStreamDataRaw) {
            const liveStreamData = JSON.parse(liveStreamDataRaw);
            const sellerIdFromStorage = liveStreamData.seller?.uid || streamId;
            if (sellerIdFromStorage === streamId) {
                sellerData = { ...liveStreamData, id: streamId, viewers: liveSellers[1].viewers, productId: liveStreamData.product?.id, avatarUrl: liveStreamData.seller.photoURL, name: liveStreamData.seller.name, category: liveStreamData.product.category, description: liveStreamData.description };
            }
        }
    }
    if (sellerData) {
        setSeller(sellerData);
        if (user) {
            const followingKey = `following_${user.uid}`;
            const followingList = JSON.parse(localStorage.getItem(followingKey) || '[]');
            setIsFollowing(followingList.includes(sellerData.id));
        }
    }
  }, [streamId, user, isClient]);

   useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => setCurrentTime(video.currentTime);
    const setVideoDuration = () => setDuration(video.duration);
    const handlePlay = () => setIsPaused(false);
    const handlePause = () => setIsPaused(true);

    video.addEventListener("timeupdate", updateProgress);
    video.addEventListener("loadedmetadata", setVideoDuration);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
        video.removeEventListener("timeupdate", updateProgress);
        video.removeEventListener("loadedmetadata", setVideoDuration);
        video.removeEventListener("play", handlePlay);
        video.removeEventListener("pause", handlePause);
    };
  }, []);

  const handleAddToCart = (productKey: string) => {
    const product = productDetails[productKey as keyof typeof productDetails];
    if (product) {
        addToCart({ ...product, imageUrl: product.images[0], quantity: 1 });
        toast({ title: "Added to Cart!", description: `${product.name} has been added to your shopping cart.` });
    }
  };

  const handleBuyNow = (productKey: string) => router.push(`/cart?buyNow=true&productId=${productKey}`);

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newChatMessage.trim()) return;
      const newMessage = { id: Date.now(), type: 'chat', user: user?.displayName || 'Guest', message: newChatMessage.trim() };
      setChatMessages(prev => [...prev, newMessage]);
      setNewChatMessage("");
  };

  const addEmoji = (emoji: string) => setNewChatMessage(prev => prev + emoji);

  const handleFollowToggle = () => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Login Required', description: 'You must be logged in to follow a seller.' });
        return;
    }
    if (seller) {
        toggleFollow(user.uid, seller.id);
        setIsFollowing(prev => !prev);
    }
  };
    
  const handleTerminateStream = () => {
    localStorage.setItem(STREAM_TERMINATED_KEY, streamId);
    localStorage.removeItem(STREAM_TERMINATED_KEY);
    setIsStreamTerminated(true);
    toast({ variant: "destructive", title: "Stream Terminated", description: `The live stream by ${seller.name} has been stopped.` });
  };
    
  const handleReportComment = (comment: any) => {
    const storedFlaggedComments = JSON.parse(localStorage.getItem(FLAGGED_COMMENTS_KEY) || '[]');
    const updatedFlaggedComments = [...storedFlaggedComments, { ...comment, streamId }];
    localStorage.setItem(FLAGGED_COMMENTS_KEY, JSON.stringify(updatedFlaggedComments));
    toast({ title: "Comment Reported", description: "Thank you for your feedback. Our moderators will review it." });
  };
    
  const handleReportStream = () => toast({ title: "Stream Reported", description: "Thank you for helping keep StreamCart safe. Our team will review this stream." });
    
  const handleShareStream = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link Copied!", description: "Stream link copied to clipboard." });
  };

  const handleSeek = (direction: 'forward' | 'backward') => {
    if (videoRef.current) {
        const seekTime = direction === 'forward' ? 10 : -10;
        videoRef.current.currentTime += seekTime;
        setSeekIndicator(direction);
        setTimeout(() => setSeekIndicator(null), 500);
    }
  };

  const handlePlayPause = useCallback(() => {
    if (videoRef.current) {
        if (videoRef.current.paused) {
            videoRef.current.play();
        } else {
            videoRef.current.pause();
        }
    }
  }, []);

  if (!isClient || !seller) {
    return <div className="h-screen w-full flex items-center justify-center"><LoadingSpinner /></div>;
  }
  
  const sellerProfileUrl = `/seller/profile?userId=${seller.id}`;

  return (
    <>
     <AlertDialog open={isStreamTerminated}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-destructive"/> Stream Terminated by Admin</AlertDialogTitle>
                <AlertDialogDescription>This live stream has been ended by an administrator due to a violation of community guidelines.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter><AlertDialogAction onClick={() => router.push('/live-selling')}>Back to Live Selling</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    <div className="h-dvh w-full bg-black text-white flex flex-col lg:flex-row">
        <div className="hidden lg:flex flex-1 flex-col bg-black overflow-y-auto">
             <div className="w-full aspect-video bg-black relative group flex-shrink-0">
                <video 
                    ref={videoRef} 
                    src="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
                    className="w-full h-full object-contain" 
                    autoPlay 
                    muted={isMuted}
                    loop
                    playsInline
                />
                 <div className={cn(
                    "absolute inset-0 bg-black/20 transition-opacity duration-300 flex flex-col justify-between p-4",
                    controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
                )}>
                    <div>
                         <Button variant="ghost" size="icon" className="h-8 w-8 text-white bg-black/30 hover:bg-black/50" onClick={(e) => { e.stopPropagation(); router.push('/live-selling') }}>
                            <ArrowLeft className="text-white" />
                        </Button>
                    </div>
                    <div className="flex items-center justify-center gap-8">
                        <Button variant="ghost" size="icon" className="h-12 w-12" onClick={(e) => { e.stopPropagation(); handleSeek('backward'); }}><Rewind className="w-8 h-8 text-white" /></Button>
                        <Button variant="ghost" size="icon" className="h-16 w-16" onClick={(e) => { e.stopPropagation(); handlePlayPause(); }}>{isPaused ? <Play className="w-10 h-10 fill-white text-white"/> : <Pause className="w-10 h-10 fill-white text-white"/>}</Button>
                        <Button variant="ghost" size="icon" className="h-12 w-12" onClick={(e) => { e.stopPropagation(); handleSeek('forward'); }}><FastForward className="w-8 h-8 text-white" /></Button>
                    </div>
                    <div className="space-y-2">
                         <div className="flex items-center gap-2 text-xs font-mono text-white">
                            <span>{formatTime(currentTime)}</span>
                            <Progress value={(currentTime / duration) * 100} className="h-1.5 flex-1"/>
                            <span>{formatTime(duration)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Button variant="secondary" size="sm" className="text-xs h-7" onClick={(e) => { e.stopPropagation(); if (videoRef.current) videoRef.current.currentTime = videoRef.current.duration; }}>LIVE</Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setIsMuted(prev => !prev); }}>{isMuted ? <VolumeX className="w-5 h-5 text-white"/> : <Volume2 className="w-5 h-5 text-white"/>}</Button>
                            </div>
                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setControlsVisible(false); }}>
                                <PanelRightClose className="h-5 w-5 text-white" />
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                                        <Settings className="w-5 h-5 text-white" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>Quality</DropdownMenuLabel>
                                    {['1080p', '720p', '480p', 'Auto'].map(q => <DropdownMenuItem key={q} onSelect={() => setQuality(q)}>{q}{quality === q && " ✓"}</DropdownMenuItem>)}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
                 {!controlsVisible && (
                    <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-20 h-8 w-8 text-white bg-black/30 hover:bg-black/50" onClick={() => setControlsVisible(true)}>
                        <PanelRightOpen className="text-white" />
                    </Button>
                )}
            </div>

             <div className="p-4 space-y-4">
                <Collapsible>
                    <div className="flex justify-between items-center gap-4">
                        <div className="flex items-center gap-3 flex-1 overflow-hidden">
                            <Link href={sellerProfileUrl}>
                                <Avatar className="h-12 w-12">
                                    <AvatarImage src={seller.avatarUrl} alt={seller.name} />
                                    <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </Link>
                            <div className="flex-1 overflow-hidden">
                                <Link href={sellerProfileUrl} className="hover:underline">
                                    <h2 className="font-bold text-lg truncate text-white">{seller.name}</h2>
                                </Link>
                                <div className="flex items-center gap-2 text-xs mt-1">
                                    <Badge variant="destructive" className="h-5">LIVE</Badge>
                                    <div className="flex items-center gap-1 text-white">
                                        <Users className="h-3 w-3" />
                                        <span>{seller.viewers} viewers</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                         <div className="flex items-center gap-2 flex-shrink-0">
                            {seller.hasAuction && (
                                <Dialog>
                                <DialogTrigger asChild>
                                    <Badge variant="purple" className="cursor-pointer">
                                        <Gavel className="mr-1 h-3 w-3" />
                                        Auction
                                    </Badge>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                    <DialogTitle>Live Auction</DialogTitle>
                                    <DialogDescription>Bid on exclusive items from {seller.name}.</DialogDescription>
                                    </DialogHeader>
                                    <div className="py-4 text-center">
                                    <h4 className="font-bold text-lg mb-2">Vintage Camera</h4>
                                    <p className="text-sm text-muted-foreground">Current Bid:</p>
                                    <p className="text-4xl font-bold text-primary mb-4">₹13,500</p>
                                    <Button size="lg" className="w-full">Place Your Bid</Button>
                                    <p className="text-xs text-muted-foreground mt-2">Bidding ends in 2:30</p>
                                    </div>
                                </DialogContent>
                                </Dialog>
                            )}
                            {!isAdminView && user && (
                                <Button variant={isFollowing ? 'outline' : 'secondary'} size="sm" onClick={handleFollowToggle} className="h-7 text-xs">
                                <UserPlus className="mr-1.5 h-3 w-3" />
                                {isFollowing ? "Following" : "Follow"}
                                </Button>
                            )}
                             <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 text-xs text-white">
                                    Show More <ChevronDown className="ml-1 h-4 w-4" />
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                    </div>
                     <CollapsibleContent className="mt-4 space-y-2">
                        <div>
                            <h1 className="font-bold text-xl text-white">{seller.title || productDetails[seller.productId as keyof typeof productDetails]?.name}</h1>
                            <p className="text-sm text-primary font-semibold">{seller.category}</p>
                        </div>
                        <p className="text-sm text-white/80 whitespace-pre-wrap">{seller.description}</p>
                    </CollapsibleContent>
                </Collapsible>
            </div>
        </div>

        <div className="lg:hidden flex flex-col h-dvh w-full bg-black">
            <div className="w-full aspect-video bg-black relative group flex-shrink-0 z-10" onClick={handlePlayPause}>
                <Button variant="ghost" size="icon" className="absolute top-4 left-4 z-20 h-8 w-8 text-white bg-black/30 hover:bg-black/50" onClick={(e) => { e.stopPropagation(); router.back(); }}>
                    <ArrowLeft className="text-white" />
                </Button>
                <video 
                    ref={videoRef} 
                    src="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
                    className="w-full h-full object-contain" 
                    autoPlay 
                    muted 
                    loop
                    playsInline
                />
            </div>
            
            <div className="flex-1 relative overflow-hidden">
                 <div className={cn("absolute inset-x-0 bottom-0 z-30 flex flex-col transition-transform duration-300 ease-in-out bg-black/80 backdrop-blur-sm", isProductListOpen ? 'translate-y-0' : 'translate-y-full')} style={{ top: isProductListOpen ? 'auto' : '100%', height: isProductListOpen ? `calc(100% - ${(100 * 9 / 16)}vw)` : '0' }}>
                    <div className="p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                        <h3 className="font-bold text-lg">{seller.hasAuction ? "Auction Items" : "Products in Stream"}</h3>
                        <Button variant="ghost" size="icon" onClick={() => setIsProductListOpen(false)} className="h-8 w-8">
                            <X className="text-white" />
                        </Button>
                    </div>
                    <ScrollArea className="flex-grow p-4">
                        {streamProducts.map((product: any) => (
                            <ProductListItem
                                key={product.id}
                                product={product}
                                isBuyable={featuredProductIds.includes(product.key)}
                                onAddToCart={handleAddToCart}
                                onBuyNow={handleBuyNow}
                                isAdminView={isAdminView}
                            />
                        ))}
                    </ScrollArea>
                </div>

                <div className="absolute inset-0 flex flex-col">
                    <Card className="p-4 bg-black/50 backdrop-blur-sm border-b border-white/10 flex-shrink-0 rounded-none">
                        <Collapsible>
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                    <Link href={sellerProfileUrl}>
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={seller.avatarUrl} alt={seller.name} />
                                            <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <div className="flex-1 overflow-hidden">
                                        <Link href={sellerProfileUrl} className="hover:underline">
                                            <h2 className="font-semibold text-base truncate text-white">{seller.name}</h2>
                                        </Link>
                                        <div className="flex items-center gap-2 text-xs mt-1">
                                            <Badge variant="destructive" className="h-5">LIVE</Badge>
                                            {seller.hasAuction && (
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Badge variant="purple" className="cursor-pointer"><Gavel className="mr-1 h-3 w-3" />Auction</Badge>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader><DialogTitle>Live Auction</DialogTitle></DialogHeader>
                                                        <div className="py-4 text-center">
                                                            <p className="text-4xl font-bold text-primary mb-4">₹13,500</p>
                                                            <Button size="lg" className="w-full">Place Bid</Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {!isAdminView && user && (
                                        <Button variant={isFollowing ? 'outline' : 'secondary'} size="sm" onClick={handleFollowToggle} className="h-7 text-xs"><UserPlus className="mr-1.5 h-3 w-3" />{isFollowing ? "Following" : "Follow"}</Button>
                                    )}
                                </div>
                            </div>
                             <CollapsibleTrigger asChild>
                                <Button variant="link" size="sm" className="h-auto p-0 text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                    Show Details <ChevronDown className="h-4 w-4" />
                                </Button>
                            </CollapsibleTrigger>
                             <CollapsibleContent className="mt-2 space-y-1">
                                <div>
                                    <h1 className="font-bold text-lg text-white">{seller.title || productDetails[seller.productId as keyof typeof productDetails]?.name}</h1>
                                    <p className="text-sm text-primary font-semibold">{seller.category}</p>
                                </div>
                                <p className="text-sm text-white/80 whitespace-pre-wrap">{seller.description}</p>
                            </CollapsibleContent>
                        </Collapsible>
                    </Card>
                    <ScrollArea className="flex-1 p-4 space-y-4">
                        {chatMessages.map(item => (
                            item.type === 'chat' ? (
                                <div key={item.id} className="flex items-start gap-2 text-sm group/chatitem">
                                    <Avatar className="h-8 w-8"><AvatarFallback>{item.user!.charAt(0)}</AvatarFallback></Avatar>
                                    <div className="flex-grow">
                                        <p className="font-semibold text-white">{item.user}</p>
                                        <p className="text-white/80">{item.message}</p>
                                    </div>
                                    {!isAdminView && user?.displayName !== item.user && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/chatitem:opacity-100 transition-opacity">
                                                    <Flag className="h-3 w-3 text-white/50" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Report Comment?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to report this comment for review by our moderation team?
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleReportComment(item)}>Report</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </div>
                            ) : item.type === 'product' ? (
                                <ProductChatMessage key={item.id} productKey={item.productKey!} stock={item.stock!} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} isAdminView={isAdminView}/>
                            ) : null
                        ))}
                    </ScrollArea>
                    
                     <div className="absolute right-2 bottom-20 z-20 flex flex-col gap-2">
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-white bg-black/30 backdrop-blur-sm rounded-full" onClick={() => setIsProductListOpen(prev => !prev)}>
                            <List className="text-white" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-white bg-black/30 backdrop-blur-sm rounded-full" onClick={handleShareStream}>
                            <Share2 className="text-white" />
                        </Button>
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" size="icon" className="h-10 w-10 text-white bg-black/30 backdrop-blur-sm rounded-full">
                                    <MoreVertical className="text-white" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {isAdminView ? (
                                    <>
                                        <DropdownMenuLabel>Admin Controls</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                                                    <StopCircle className="mr-2 h-4 w-4" />
                                                    Terminate Stream
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action will immediately terminate the stream for {seller.name} and all viewers.</AlertDialogDescription></AlertDialogHeader>
                                                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleTerminateStream}>Confirm</AlertDialogAction></AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </>
                                ) : (
                                    <>
                                        <DropdownMenuItem onSelect={handleReportStream}><Flag className="mr-2 h-4 w-4" />Report Stream</DropdownMenuItem>
                                        <DropdownMenuItem><MessageCircle className="mr-2 h-4 w-4" />Feedback</DropdownMenuItem>
                                        <DropdownMenuItem><LifeBuoy className="mr-2 h-4 w-4" />Help</DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="p-3 border-t border-white/10 bg-black flex flex-col gap-3 flex-shrink-0 z-10">
                        {isConnecting && (
                            <div className="flex items-center gap-2 text-xs text-yellow-400 px-2">
                                <WifiOff className="h-4 w-4" />
                                Chat connection lost. Reconnecting...
                            </div>
                        )}
                        <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
                            <div className="relative flex-grow">
                                <Input 
                                    placeholder="Say something..." 
                                    className="bg-white/10 border-white/20 rounded-full text-white placeholder:text-white/50 pr-10" 
                                    value={newChatMessage} 
                                    onChange={(e) => setNewChatMessage(e.target.value)} 
                                />
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-white/50 hover:text-white">
                                            <Smile className="h-5 w-5" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 h-64">
                                        <ScrollArea className="h-full">
                                            <div className="grid grid-cols-8 gap-1">
                                                {emojis.map((emoji, index) => (
                                                    <Button key={index} variant="ghost" size="icon" onClick={() => addEmoji(emoji)}>
                                                        {emoji}
                                                    </Button>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <Button type="submit" size="icon" disabled={!newChatMessage.trim()} className="bg-white text-black hover:bg-white/80"><Send className="h-4 w-4" /></Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>

        {/* Chat Panel for large screens */}
        {isChatVisible && (
            <aside className="w-full lg:w-96 flex-col bg-black/90 lg:border-l lg:border-white/10 hidden lg:flex">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-white">Live Chat</h3>
                     <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-white" onClick={() => setIsProductListOpen(prev => !prev)}>
                            <List />
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-white">
                                    <MoreVertical />
                                </Button>
                            </DropdownMenuTrigger>
                             <DropdownMenuContent align="end">
                                {isAdminView ? (
                                <>
                                    <DropdownMenuLabel>Admin Controls</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                     <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                                                <StopCircle className="mr-2 h-4 w-4" />
                                                Terminate Stream
                                            </DropdownMenuItem>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action will immediately terminate the stream for {seller.name} and all viewers.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleTerminateStream}>Confirm</AlertDialogAction></AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </>
                                ) : (
                                <>
                                    <DropdownMenuItem onSelect={handleReportStream}><Flag className="mr-2 h-4 w-4" />Report Stream</DropdownMenuItem>
                                    <DropdownMenuItem><MessageCircle className="mr-2 h-4 w-4" />Feedback</DropdownMenuItem>
                                    <DropdownMenuItem><LifeBuoy className="mr-2 h-4 w-4" />Help</DropdownMenuItem>
                                </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="relative flex-1 overflow-hidden">
                    <ScrollArea className="absolute inset-0 p-4 space-y-4" ref={scrollAreaRef}>
                        {chatMessages.map(item => (
                            item.type === 'chat' ? (
                            <div key={item.id} className="flex items-start gap-2 text-sm group/chatitem">
                                <Avatar className="h-8 w-8"><AvatarFallback>{item.user!.charAt(0)}</AvatarFallback></Avatar>
                                <div className="flex-grow">
                                    <p className="font-semibold text-white">{item.user}</p>
                                    <p className="text-white/80">{item.message}</p>
                                </div>
                                {!isAdminView && user?.displayName !== item.user && (
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/chatitem:opacity-100 transition-opacity">
                                                <Flag className="h-3 w-3 text-white/50" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Report Comment?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure you want to report this comment for review by our moderation team?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleReportComment(item)}>Report</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                )}
                            </div>
                        ) : (
                            <ProductChatMessage 
                                key={item.id} 
                                productKey={item.productKey!}
                                stock={item.stock!} 
                                onAddToCart={handleAddToCart}
                                onBuyNow={handleBuyNow}
                                isAdminView={isAdminView}
                            />
                        )
                        ))}
                    </ScrollArea>
                    
                    <div className={cn("absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex-col", isProductListOpen ? "flex" : "hidden")}>
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-white">{seller.hasAuction ? "Auction Items" : "Products in Stream"}</h3>
                            <Button variant="ghost" size="icon" onClick={() => setIsProductListOpen(false)} className="h-8 w-8 text-white">
                                <X />
                            </Button>
                        </div>
                        <ScrollArea className="flex-grow p-4">
                            {streamProducts.map((product: any) => (
                                <ProductListItem
                                    key={product.id}
                                    product={product}
                                    isBuyable={featuredProductIds.includes(product.key)}
                                    onAddToCart={handleAddToCart}
                                    onBuyNow={handleBuyNow}
                                    isAdminView={isAdminView}
                                />
                            ))}
                        </ScrollArea>
                    </div>
                </div>
                <div className="p-3 border-t border-white/10">
                     {isConnecting && (
                        <div className="flex items-center gap-2 text-xs text-yellow-400 px-2 pb-2">
                            <WifiOff className="h-4 w-4" />
                            Chat connection lost. Reconnecting...
                        </div>
                    )}
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <div className="relative flex-grow">
                            <Input 
                                placeholder="Say something..." 
                                className="pr-10 bg-white/10 border-white/20 rounded-full text-white placeholder:text-white/50"
                                value={newChatMessage}
                                onChange={(e) => setNewChatMessage(e.target.value)}
                            />
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-white/50 hover:text-white">
                                        <Smile className="h-5 w-5" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-80 h-64">
                                    <ScrollArea className="h-full">
                                        <div className="grid grid-cols-8 gap-1">
                                            {emojis.map((emoji, index) => (
                                                <Button key={index} variant="ghost" size="icon" onClick={() => addEmoji(emoji)}>
                                                    {emoji}
                                                </Button>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <Button type="submit" size="icon" disabled={!newChatMessage.trim()} className="bg-white text-black hover:bg-white/80">
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </aside>
        )}
    </div>
    </>
  );
}

    