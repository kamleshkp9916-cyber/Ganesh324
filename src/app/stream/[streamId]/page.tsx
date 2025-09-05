
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
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import React, { useEffect, useState, useRef, useMemo } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth.tsx";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toggleFollow, getUserData } from "@/lib/follow-data";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";


const liveSellers = [
    { id: '1', name: 'FashionFinds', avatarUrl: 'https://placehold.co/40x40.png', viewers: 1200, productId: 'prod_1', hasAuction: true },
    { id: '2', name: 'GadgetGuru', avatarUrl: 'https://placehold.co/40x40.png', viewers: 2500, productId: 'prod_2', hasAuction: false },
    { id: '3', name: 'HomeHaven', avatarUrl: 'https://placehold.co/40x40.png', viewers: 850, productId: 'prod_3', hasAuction: false },
    { id: '4', name: 'BeautyBox', avatarUrl: 'https://placehold.co/40x40.png', viewers: 3100, productId: 'prod_4', hasAuction: true },
    { id: '5', name: 'KitchenWiz', avatarUrl: 'https://placehold.co/40x40.png', viewers: 975, productId: 'prod_5', hasAuction: false },
    { id: '6', name: 'FitFlow', avatarUrl: 'https://placehold.co/40x40.png', viewers: 1500, productId: 'prod_6', hasAuction: false },
    { id: '7', name: 'ArtisanAlley', avatarUrl: 'https://placehold.co/40x40.png', viewers: 450, productId: 'prod_7', hasAuction: true },
    { id: '8', name: 'PetPalace', avatarUrl: 'https://placehold.co/40x40.png', viewers: 1800, productId: 'prod_8', hasAuction: false },
    { id: '9', name: 'BookNook', avatarUrl: 'https://placehold.co/40x40.png', viewers: 620, productId: 'prod_9', hasAuction: false },
    { id: '10', name: 'GamerGuild', avatarUrl: 'https://placehold.co/40x40.png', viewers: 4200, productId: 'prod_10', hasAuction: true },
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

const mockNewUsers = [
    'GadgetFan', 'StyleQueen', 'HomeBody', 'DealHunter', 'GamerPro', 'BookLover', 'PetParent'
]

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
                    <Button size="sm" className="flex-1" onClick={() => onAddToCart(productKey)} disabled={isAdminView}>
                        <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
                    </Button>
                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => onBuyNow(productKey)} disabled={isAdminView}>
                        Buy Now
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function ProductListItem({ product, isBuyable, onAddToCart, onBuyNow, isAdminView }: { product: any, isBuyable: boolean, onAddToCart: (productKey: string) => void, onBuyNow: (productKey: string) => void, isAdminView: boolean }) {
     return (
        <div className="flex items-center gap-3 py-2 border-b last:border-none">
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

function StreamTimer() {
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };

    return (
        <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded-md text-xs font-mono flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span>LIVE</span>
            <span>{formatTime(elapsedTime)}</span>
        </div>
    );
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
  
  const featuredProductIds = chatMessages.filter(item => item.type === 'product').map(item => item.productKey);
  const isAdminView = userData?.role === 'admin';

  const streamProducts = useMemo(() => {
    if (seller?.hasAuction) {
      return Object.values(productDetails).filter(p => (p as any).isAuctionItem);
    }
    return allStreamProducts;
  }, [seller]);


  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === STREAM_TERMINATED_KEY && event.newValue === streamId) {
            setIsStreamTerminated(true);
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [streamId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [chatMessages]);

  useEffect(() => {
    let sellerData: any = null;
    const sellerFromList = liveSellers.find(s => s.id === streamId || s.name === streamId);

    if (sellerFromList) {
        sellerData = sellerFromList;
    } else {
        const liveStreamDataRaw = localStorage.getItem('liveStream');
        if (liveStreamDataRaw) {
            const liveStreamData = JSON.parse(liveStreamDataRaw);
            const sellerIdFromStorage = liveStreamData.seller?.uid || streamId;

            if (sellerIdFromStorage === streamId) {
                sellerData = {
                    ...liveStreamData.seller,
                    id: streamId,
                    viewers: Math.floor(Math.random() * 5000),
                    productId: liveStreamData.product?.id,
                    avatarUrl: liveStreamData.seller.photoURL
                };
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

    const joinInterval = setInterval(() => {
        const newUser = mockNewUsers[Math.floor(Math.random() * mockNewUsers.length)];
        const newMessage = {
            id: Date.now(),
            type: 'join',
            user: newUser,
            message: 'joined the stream'
        };
        // @ts-ignore
        setChatMessages(prev => [...prev, newMessage]);
    }, Math.random() * (15000 - 5000) + 5000);

    return () => clearInterval(joinInterval);
  }, [streamId, user]);


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

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newChatMessage.trim()) return;

      const newMessage = {
          id: Date.now(),
          type: 'chat',
          user: user?.displayName || 'Guest',
          message: newChatMessage.trim(),
      };
      // @ts-ignore
      setChatMessages(prev => [...prev, newMessage]);
      setNewChatMessage("");
  };

   const addEmoji = (emoji: string) => {
        setNewChatMessage(prev => prev + emoji);
    };

    const handleFollowToggle = () => {
        if (!user) {
            toast({
                variant: 'destructive',
                title: 'Login Required',
                description: 'You must be logged in to follow a seller.',
            });
            return;
        }
        if (seller) {
            toggleFollow(user.uid, seller.id);
            setIsFollowing(prev => !prev);
        }
    };
    
    const handleTerminateStream = () => {
        localStorage.setItem(STREAM_TERMINATED_KEY, streamId);
        // Trigger for current tab since storage event doesn't fire on the same page
        setIsStreamTerminated(true);
        toast({
            variant: "destructive",
            title: "Stream Terminated",
            description: `The live stream by ${seller.name} has been stopped.`,
        });
        // No need to redirect admin immediately, let them see the result
    };
    
    const handleReportComment = (comment: any) => {
        const storedFlaggedComments = JSON.parse(localStorage.getItem(FLAGGED_COMMENTS_KEY) || '[]');
        const updatedFlaggedComments = [...storedFlaggedComments, { ...comment, streamId }];
        localStorage.setItem(FLAGGED_COMMENTS_KEY, JSON.stringify(updatedFlaggedComments));
        toast({
            title: "Comment Reported",
            description: "Thank you for your feedback. Our moderators will review it.",
        });
    };

    const handleSeek = (direction: 'forward' | 'backward') => {
        if (videoRef.current) {
            const seekTime = direction === 'forward' ? 10 : -10;
            videoRef.current.currentTime += seekTime;
            setSeekIndicator(direction);
            setTimeout(() => setSeekIndicator(null), 500);
        }
    };

    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const videoRect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - videoRect.left;
        if (clickX < videoRect.width / 2) {
            handleSeek('backward');
        } else {
            handleSeek('forward');
        }
    };

    const handleSingleClick = () => {
        if(videoRef.current) {
            if (videoRef.current.paused) {
                videoRef.current.play();
            } else {
                videoRef.current.pause();
            }
            setIsPaused(videoRef.current.paused);
        }
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (doubleClickTimeoutRef.current) {
            clearTimeout(doubleClickTimeoutRef.current);
            doubleClickTimeoutRef.current = null;
            handleDoubleClick(e);
        } else {
            doubleClickTimeoutRef.current = setTimeout(() => {
                handleSingleClick();
                doubleClickTimeoutRef.current = null;
            }, 300);
        }
    };


  if (!seller) {
    return <div className="h-screen w-full flex items-center justify-center"><LoadingSpinner /></div>;
  }
  
  const sellerProfileUrl = `/seller/profile?userId=${seller.id}`;

  return (
    <>
     <AlertDialog open={isStreamTerminated}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-destructive"/> Stream Terminated by Admin</AlertDialogTitle>
                <AlertDialogDescription>
                    This live stream has been ended by an administrator due to a violation of community guidelines.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogAction onClick={() => router.push('/live-selling')}>Back to Live Selling</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    <div className="h-screen w-full flex flex-col lg:flex-row bg-background text-foreground">
      {/* Video Player Section */}
      <div className="flex-grow bg-black flex flex-col relative group">
        <header className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent z-10 text-white transition-opacity duration-300 opacity-100 group-hover:opacity-100">
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 hover:text-white" onClick={() => router.push('/live-selling')}>
              <ArrowLeft />
            </Button>
            <Link href={sellerProfileUrl} className="flex items-center gap-3 group/profile">
                <Avatar>
                  <AvatarImage src={seller.avatarUrl} alt={seller.name} />
                  <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold group-hover/profile:underline">{seller.name}</h2>
                  <div className="flex items-center gap-2 text-xs">
                    <Badge variant="default" className="h-5">LIVE</Badge>
                     <Dialog>
                        <DialogTrigger asChild>
                             <div className="flex items-center gap-1 cursor-pointer hover:text-white/80">
                                <Users className="h-3 w-3" />
                                <span>{seller.viewers}</span>
                            </div>
                        </DialogTrigger>
                        {isAdminView && (
                             <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Live Viewers ({mockViewers.length})</DialogTitle>
                                </DialogHeader>
                                <ScrollArea className="h-80">
                                    <div className="p-4 space-y-4">
                                        {mockViewers.map(viewer => (
                                            <Link
                                                key={viewer.userId}
                                                href={`/admin/users/${viewer.userId}`}
                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted"
                                            >
                                                <Avatar>
                                                    <AvatarImage src={viewer.avatar} alt={viewer.name} />
                                                    <AvatarFallback>{viewer.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <p className="font-semibold">{viewer.name}</p>
                                            </Link>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </DialogContent>
                        )}
                     </Dialog>
                    {seller.hasAuction && (
                        <Badge variant="purple">
                            <Gavel className="mr-1 h-3 w-3" />
                            Auction
                        </Badge>
                    )}
                  </div>
                </div>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {!isChatVisible && (
              <Button variant="secondary" size="sm" onClick={() => setIsChatVisible(true)}>
                <PanelRightOpen className="mr-2 h-4 w-4" />
                Show Chat
              </Button>
            )}
            {!isAdminView && (
              <Button variant={isFollowing ? 'outline' : 'secondary'} size="sm" onClick={handleFollowToggle}>
                <UserPlus className="mr-2 h-4 w-4" />
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
        </header>
        
        <div className="flex-1 relative flex items-center justify-center cursor-pointer" onClick={handleClick}>
             <div 
                className="absolute inset-0 z-10" 
            >
                {/* Seek Indicators */}
                <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 text-white/80 transition-opacity duration-300 pointer-events-none">
                    {seekIndicator === 'backward' && <Rewind className="h-12 w-12" />}
                </div>
                 <div className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 text-white/80 transition-opacity duration-300 pointer-events-none">
                    {seekIndicator === 'forward' && <FastForward className="h-12 w-12" />}
                </div>
            </div>

            <video 
                ref={videoRef} 
                src="https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
                className="w-full h-full object-cover" 
                autoPlay 
                muted 
                loop
                playsInline
            />
            
             {/* Player Controls Overlay */}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <Button variant="ghost" size="icon" className="h-16 w-16 text-white pointer-events-auto" onClick={(e) => {
                    e.stopPropagation(); // Prevent click from bubbling to the container
                    if (videoRef.current) {
                        videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
                        setIsPaused(videoRef.current.paused);
                    }
                }}>
                    {isPaused ? <Play className="h-12 w-12" /> : <Pause className="h-12 w-12" />}
                </Button>
            </div>

            <StreamTimer />
            
            <div className="absolute bottom-16 sm:bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                 <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 hover:text-white" onClick={() => {
                     if (videoRef.current) {
                         videoRef.current.muted = !videoRef.current.muted;
                         setIsMuted(videoRef.current.muted);
                     }
                 }}>
                    {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                </Button>
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
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                    <Button variant="ghost" size="icon" className="h-16 w-16 text-white" onClick={() => {
                         if (videoRef.current) {
                            videoRef.current.play();
                            setIsPaused(false);
                        }
                    }}>
                        <Play className="h-12 w-12 fill-white" />
                    </Button>
                </div>
            )}
        </div>
      </div>

      {/* Chat and Details Section */}
       {isChatVisible && (
          <aside className="w-full lg:w-96 h-1/2 lg:h-screen border-l flex flex-col relative">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-lg">Live Chat</h3>
              <div className="flex items-center gap-1">
                 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsProductListOpen(prev => !prev)}>
                    <List />
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
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
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action will immediately terminate the stream for {seller.name} and all viewers.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleTerminateStream}>Confirm</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </>
                         ) : (
                            <>
                                <DropdownMenuItem>
                                    <Flag className="mr-2 h-4 w-4" />
                                    <span>Report</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <MessageCircle className="mr-2 h-4 w-4" />
                                    <span>Feedback</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <LifeBuoy className="mr-2 h-4 w-4" />
                                    <span>Help</span>
                                </DropdownMenuItem>
                            </>
                         )}
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsChatVisible(false)}>
                    <PanelRightClose />
                </Button>
              </div>
            </div>
            <ScrollArea className="flex-grow p-4 space-y-4" ref={scrollAreaRef}>
              {chatMessages.map(item => (
                 item.type === 'chat' ? (
                    <div key={item.id} className="flex items-start gap-2 text-sm group/chatitem">
                        <Avatar className="h-8 w-8">
                            <AvatarFallback>{item.user!.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                            <p className="font-semibold">{item.user}</p>
                            <p className="text-muted-foreground">{item.message}</p>
                        </div>
                        {!isAdminView && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover/chatitem:opacity-100 transition-opacity">
                                        <Flag className="h-3 w-3 text-muted-foreground" />
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
                ) : item.type === 'join' ? (
                    <div key={item.id} className="text-center text-xs text-muted-foreground italic my-2">
                        <span>{item.user} {item.message}</span>
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
            <div className="p-3 border-t">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <div className="relative flex-grow">
                        <Input 
                            placeholder="Say something..." 
                            className="pr-10"
                            value={newChatMessage}
                            onChange={(e) => setNewChatMessage(e.target.value)}
                        />
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full">
                                    <Smile className="h-5 w-5 text-muted-foreground" />
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
                    <Button type="submit" size="icon" disabled={!newChatMessage.trim()}>
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>

            {isProductListOpen && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="font-bold text-lg">{seller.hasAuction ? "Auction Items" : "Products in Stream"}</h3>
                        <Button variant="ghost" size="icon" onClick={() => setIsProductListOpen(false)} className="h-8 w-8">
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
            )}
          </aside>
       )}
    </div>
    </>
  );
}
