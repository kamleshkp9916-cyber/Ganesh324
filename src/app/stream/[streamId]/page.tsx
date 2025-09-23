
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

const liveSellers = [
    { id: '1', name: 'FashionFinds', avatarUrl: 'https://placehold.co/40x40.png', viewers: 1200, productId: 'prod_1', hasAuction: true, category: 'Fashion', description: 'Showcasing our latest vintage-inspired summer collection. Exclusive deals for live viewers!' },
    { id: '2', name: 'GadgetGuru', avatarUrl: 'https://placehold.co/40x40.png', viewers: 2500, productId: 'prod_2', hasAuction: false, category: 'Electronics', description: 'Unboxing the brand new SoundWave Pro 2 headphones. We will be testing the noise cancellation and battery life. Ask me anything!' },
    { id: '3', name: 'HomeHaven', avatarUrl: 'https://placehold.co/40x40.png', viewers: 850, productId: 'prod_3', hasAuction: false, category: 'Home Goods', description: 'Transform your living space with our new minimalist home decor items. Perfect for a modern aesthetic.' },
];

const mockChatMessages = [
    { id: 1, user: 'Ganesh', text: 'This looks amazing! 🔥', avatar: 'https://placehold.co/40x40.png' },
    { id: 2, user: 'Alex', text: 'What is the material?', avatar: 'https://placehold.co/40x40.png' },
    { id: 3, user: 'Jane', text: 'I just bought one! So excited. 🤩', avatar: 'https://placehold.co/40x40.png' },
    { id: 4, user: 'Chris', text: 'Is there a discount for first-time buyers?', avatar: 'https://placehold.co/40x40.png' },
];

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
          description: `${product.name} has been added to your cart.`,
        });
      }
    };
    const handleBuyNow = (product: any) => {
      if (product) {
        router.push(`/cart?buyNow=true&productId=${product.key}`);
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
        <div className="h-dvh w-full bg-black text-white grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4">
            <div className="lg:col-span-2 xl:col-span-3 w-full h-full flex items-center justify-center">
                <div ref={playerRef} className="w-full h-full relative group">
                    <video
                        ref={videoRef}
                        src={streamData.streamUrl || "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"}
                        className="w-full h-full object-contain"
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
            </div>
            <div className="lg:col-span-1 xl:col-span-1 bg-background text-foreground flex flex-col h-full border-l border-border relative overflow-hidden">
                <div className="p-4 border-b flex items-center justify-between z-10">
                    <h3 className="font-bold text-lg">Live Chat</h3>
                    <div className="flex items-center gap-2">
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
                                        <Link href={`/product/${product.key}`} className="block flex-shrink-0">
                                            <Image src={product.images[0]} alt={product.name} width={80} height={80} className="rounded-lg object-cover" data-ai-hint={product.hint} />
                                        </Link>
                                        <div className="flex-grow">
                                            <Link href={`/product/${product.key}`} className="hover:underline">
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

                <ScrollArea className="flex-grow p-4" ref={chatContainerRef}>
                    <div className="space-y-4">
                        {chatMessages.map(msg => (
                            <div key={msg.id} className="flex items-start gap-2 text-sm group">
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
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-4 border-t">
                    <form onSubmit={handleNewMessageSubmit} className="flex items-center gap-2">
                        <Input
                            placeholder="Send a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
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

    