

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
  Search,
  Pin,
  Wallet,
  Plus,
  Download,
  Loader2,
  RefreshCw,
  Coins,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardContent } from "@/components/ui/card";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useAuth } from '@/hooks/use-auth';
import { ScrollArea } from "@/components/ui/scroll-area";
import { toggleFollow, getUserData } from '@/lib/follow-data';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase';
import { Slider } from "@/components/ui/slider";
import { FeedbackDialog } from "@/components/feedback-dialog";
import { Textarea } from "@/components/ui/textarea";
import { categories } from "@/lib/categories";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Logo } from "@/components/logo";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Label } from "@/components/ui/label";
import { WithdrawForm } from "@/components/settings-forms";

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
    { id: 1, user: 'Ganesh', text: 'This looks amazing! 🔥 #newpurchase', avatar: 'https://placehold.co/40x40.png', userColor: '#3498db', userId: 'user1' },
    { id: 2, user: 'Alex', text: 'What is the material?', avatar: 'https://placehold.co/40x40.png', userColor: '#e74c3c', userId: 'user2' },
    { id: 3, user: 'Jane', text: 'I just bought one! So excited. 🤩 #newpurchase', avatar: 'https://placehold.co/40x40.png', userColor: '#9b59b6', userId: 'user3' },
    { id: 4, type: 'system', text: 'Chris joined the stream.' },
    { id: 5, user: 'FashionFinds', text: 'Hey Alex, it\'s 100% genuine leather!', avatar: 'https://placehold.co/40x40.png', userColor: '#f1c40f', isSeller: true, userId: 'FashionFinds' },
    { id: 6, type: 'system', text: 'Maria purchased a Vintage Camera.' },
    { id: 7, user: 'David', text: 'Do you ship to the US?', avatar: 'https://placehold.co/40x40.png', userColor: '#2ecc71', userId: 'user4' },
    { id: 8, user: 'FashionFinds', text: 'Yes David, we offer international shipping!', avatar: 'https://placehold.co/40x40.png', userColor: '#f1c40f', isSeller: true, userId: 'FashionFinds' },
    { id: 9, user: 'Sarah', text: 'This is my first time here, loving the vibe!', avatar: 'https://placehold.co/40x40.png', userColor: '#e67e22', userId: 'user5' },
    { id: 10, type: 'system', text: 'An auction for the Vintage Camera has started! Opening bid: ₹8,000' },
    { id: 11, user: 'Mike', text: 'BID ₹8,500', avatar: 'https://placehold.co/40x40.png', userColor: '#1abc9c', userId: 'user6', isBid: true },
    { id: 12, user: 'Laura', text: 'BID ₹9,000', avatar: 'https://placehold.co/40x40.png', userColor: '#d35400', userId: 'user7', isBid: true },
    { id: 13, user: 'FashionFinds', text: 'Laura with a bid of ₹9,000! Going once...', avatar: 'https://placehold.co/40x40.png', userColor: '#f1c40f', isSeller: true, userId: 'FashionFinds' },
    { id: 14, user: 'Emily', text: 'How long does the battery last on the light meter?', avatar: 'https://placehold.co/40x40.png', userColor: '#8e44ad', userId: 'user8' },
    { id: 15, type: 'system', text: 'Vintage Camera SOLD to Laura for ₹9,000!' },
    { id: 16, user: 'FashionFinds', text: '@Emily It lasts for about a year with average use!', avatar: 'https://placehold.co/40x40.png', userColor: '#f1c40f', isSeller: true, userId: 'FashionFinds' },
    { id: 17, type: 'system', text: 'Robert purchased Wireless Headphones.' },
    { id: 18, user: 'Ganesh', text: 'Can you show the back of the camera?', avatar: 'https://placehold.co/40x40.png', userColor: '#3498db', userId: 'user1' },
    { id: 19, user: 'FashionFinds', text: 'Sure thing, Ganesh! Here is a view of the back.', avatar: 'https://placehold.co/40x40.png', userColor: '#f1c40f', isSeller: true, userId: 'FashionFinds' },
    { id: 20, user: 'Chloe', text: 'Just tuned in, what did I miss?', avatar: 'https://placehold.co/40x40.png', userColor: '#34495e', userId: 'user9' },
    { id: 21, user: 'FashionFinds', text: 'Welcome Chloe! We just finished an auction, but we have more exciting products coming up. Stick around!', avatar: 'https://placehold.co/40x40.png', userColor: '#f1c40f', isSeller: true, userId: 'FashionFinds' },
    { id: 22, user: 'Oliver', text: 'Is this real leather?', avatar: 'https://placehold.co/40x40.png?text=O', userColor: '#27ae60', userId: 'user10' },
    { id: 23, user: 'Mia', text: 'Just followed! Love your stuff.', avatar: 'https://placehold.co/40x40.png?text=M', userColor: '#c0392b', userId: 'user11' },
    { id: 24, user: 'Liam', text: 'How much is shipping?', avatar: 'https://placehold.co/40x40.png?text=L', userColor: '#f39c12', userId: 'user12' },
    { id: 25, type: 'system', text: 'Emma purchased a Smart Watch.' },
    { id: 26, user: 'FashionFinds', text: '@Liam shipping is a flat rate of ₹50 anywhere in India!', avatar: 'https://placehold.co/40x40.png', userColor: '#f1c40f', isSeller: true, userId: 'FashionFinds' },
    { id: 27, user: 'Ava', text: 'Can you show a close-up of the stitching?', avatar: 'https://placehold.co/40x40.png?text=A', userColor: '#7f8c8d', userId: 'user13' },
    { id: 28, user: 'Noah', text: 'BID ₹9,100', avatar: 'https://placehold.co/40x40.png?text=N', userColor: '#2c3e50', userId: 'user14', isBid: true },
    { id: 29, type: 'system', text: 'The auction for the Vintage Camera has ended.' },
    { id: 30, user: 'Sophia', text: 'Great stream! Thanks!', avatar: 'https://placehold.co/40x40.png?text=S', userColor: '#16a085', userId: 'user15' }
];

const mockSellerPosts = [
    { id: 1, content: 'Check out this amazing vintage camera! Perfect for film photography lovers. #vintage #camera', timestamp: '2h ago', mediaUrl: 'https://placehold.co/600x400.png', likes: 152, replies: 12 },
    { id: 2, content: 'Going live in 5 minutes to unbox the new SoundWave Pro 2 headphones. You don\'t want to miss this!', timestamp: '1d ago', mediaUrl: null, likes: 88, replies: 5 },
];

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


export default function StreamPage() {
    const router = useRouter();
    const params = useParams();
    const streamId = params.streamId as string;
    const { user } = useAuth();
    const { toast } = useToast();
    const [walletBalance, setWalletBalance] = useState(42580.22);
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
    const [bankAccounts, setBankAccounts] = useState([
        { id: 1, bankName: 'HDFC Bank', accountNumber: 'XXXX-XXXX-XX12-3456' },
    ]);

    const mockStreamData = {
        id: streamId,
        title: "Live Shopping Event",
        description: "Join us for exclusive deals and a first look at our new collection! #fashion #live",
        status: "live",
        startedAt: new Timestamp(Math.floor(Date.now() / 1000) - 300, 0), // 5 minutes ago
        viewerCount: 12400,
        streamUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    };

    const streamData = mockStreamData;
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    
    const [isPaused, setIsPaused] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [chatMessages, setChatMessages] = useState(mockChatMessages);
    const [newMessage, setNewMessage] = useState("");
    const [isProductListVisible, setIsProductListVisible] = useState(false);
    const [replyingTo, setReplyingTo] = useState<{ name: string; id: string } | null>(null);
    
    const seller = useMemo(() => liveSellers.find(s => s.id === streamId), [streamId]);
    const product = productDetails[seller?.productId as keyof typeof productDetails];

     const sellerProducts = useMemo(() => {
        if (!seller) return [];
        return Object.values(productDetails).filter(p => p.brand === seller.name && p.stock > 0);
    }, [seller]);
    
    const relatedStreams = useMemo(() => {
        if (!product) return [];
        let streams = liveSellers.filter(
            s => s.category === product.category && s.productId !== product.key
        );
        if (streams.length > 5) {
            return streams.slice(0, 6);
        }
        const fallbackStreams = liveSellers.filter(s => s.productId !== product.key);
        
        let i = 0;
        while(streams.length < 6 && i < fallbackStreams.length) {
            if (!streams.some(s => s.id === fallbackStreams[i].id)) {
                streams.push(fallbackStreams[i]);
            }
            i++;
        }
        return streams.slice(0,6);
    }, [product]);
    
    const formatTime = (timeInSeconds: number) => {
        const date = new Date(0);
        date.setSeconds(timeInSeconds);
        const timeString = date.toISOString().substr(11, 8);
        return timeString.startsWith('00:') ? timeString.substr(3) : timeString;
    };

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

    const handleReply = (msgUser: { name: string; id: string }) => {
        if(user?.uid === msgUser.id) return;
        setReplyingTo(msgUser);
        setNewMessage(`@${msgUser.name} `);
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    };
    
    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages, scrollToBottom]);

    const handleNewMessageSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        
        const newMsg: any = {
            id: Date.now(),
            user: user?.displayName?.split(' ')[0] || 'You',
            userId: user?.uid,
            text: newMessage,
            avatar: user?.photoURL || 'https://placehold.co/40x40.png',
            userColor: user?.color || '#ffffff'
        };

        setChatMessages(prev => [...prev, newMsg]);
        setNewMessage("");
        setReplyingTo(null);
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
        router.push(`/cart?buyNow=true&productId=${product.key}`);
      }
    };
    const handleNotifyMe = () => {
        toast({
            title: "You're on the list!",
            description: "We'll notify you when this product is back in stock."
        });
    };
    
    const renderContentWithHashtags = (text: string) => {
        if (!text) return text;
        const parts = text.split(/(@\w+|#\w+)/g);
        return parts.map((part, index) => {
            if (part.startsWith('#')) {
                return <Link key={index} href={`/feed?hashtag=${part.substring(1)}`} className="text-primary hover:underline">{part}</Link>;
            }
            if (part.startsWith('@')) {
                 return <span key={index} className="text-blue-500 font-semibold">{part}</span>;
            }
            return part;
        });
    };

    const addEmoji = (emoji: string) => {
        setNewMessage(prev => prev + emoji);
    };

    const removeMedia = (index: number) => {
        // Dummy function
    }

    const handleWithdraw = (amount: number, bankAccountId: string) => {
        const selectedAccount = bankAccounts.find(acc => String(acc.id) === bankAccountId);
        if (amount > walletBalance) {
           toast({
               variant: 'destructive',
               title: 'Insufficient Balance',
               description: 'You do not have enough funds to complete this withdrawal.'
           });
           return;
        }
        setWalletBalance(prev => prev - amount);
        toast({
           title: "Withdrawal Initiated!",
           description: `₹${amount} is on its way to ${selectedAccount?.bankName}.`,
       });
        setIsWithdrawOpen(false);
     };

    return (
        <div className="h-dvh w-full flex flex-col bg-black text-white">
            <header className="flex-shrink-0 h-16 bg-background/80 backdrop-blur-sm border-b border-border text-foreground flex items-center justify-between px-4 z-40">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft />
                    </Button>
                    <Link href="/live-selling" className="flex items-center gap-2">
                        <Logo className="h-7 w-7" />
                        <span className="font-bold text-lg hidden sm:inline-block">StreamCart</span>
                    </Link>
                </div>
                <div className="relative w-full max-w-md mx-4 hidden lg:block">
                    <Input placeholder="Search..." className="rounded-full bg-muted pr-10" />
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2">
                    <Button asChild variant="ghost" className="relative">
                        <Link href="/cart">
                            <ShoppingCart className="mr-2"/>
                            <span className="hidden sm:inline">My Cart</span>
                        </Link>
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 flex flex-col overflow-hidden">
                     <ScrollArea className="flex-1">
                        <div className="w-full aspect-video bg-black relative group flex-shrink-0" ref={playerRef}>
                            <video ref={videoRef} src={streamData.streamUrl || "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"} className="w-full h-full object-cover" loop />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/60 flex flex-col p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="flex items-center justify-between">
                                    <h1 className="font-bold text-lg hidden sm:block">{streamData.title || "Live Event"}</h1>
                                    <Badge variant="secondary" className="gap-1.5">
                                        <Users className="h-3 w-3" /> {Math.round(streamData.viewerCount / 1000)}K watching
                                    </Badge>
                                </div>
                                <div className="flex-1 flex items-center justify-center gap-4 sm:gap-8">
                                    <Button variant="ghost" size="icon" className="w-14 h-14" onClick={() => handleSeek('backward')}><Rewind className="w-8 h-8" /></Button>
                                    <Button variant="ghost" size="icon" className="w-20 h-20" onClick={handlePlayPause}>
                                        {isPaused ? <Play className="w-12 h-12 fill-current" /> : <Pause className="w-12 h-12 fill-current" />}
                                    </Button>
                                    <Button variant="ghost" size="icon" className="w-14 h-14" onClick={() => handleSeek('forward')}><FastForward className="w-8 h-8" /></Button>
                                </div>
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
                        <div className="bg-background text-foreground p-4">
                            <div className="mb-4">
                                <h2 className="font-bold text-xl">{streamData.title || "Live Stream"}</h2>
                                <p className="text-sm text-muted-foreground">{renderContentWithHashtags(streamData.description) || "Welcome to the live stream!"}</p>
                            </div>
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
                            </div>
                            <div className="mt-6">
                                <h4 className="font-semibold mb-4">Products by {seller?.name}</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {sellerProducts.map(p => (
                                    <Link key={p.key} href={`/product/${p.key}`} className="group">
                                    <Card className="overflow-hidden">
                                        <div className="aspect-square bg-muted relative">
                                        <Image src={p.images[0]} alt={p.name} fill sizes="80px" className="object-cover group-hover:scale-105 transition-transform" />
                                        </div>
                                        <div className="p-2">
                                        <p className="text-xs font-semibold truncate">{p.name}</p>
                                        <p className="font-bold text-base">{p.price}</p>
                                        </div>
                                    </Card>
                                    </Link>
                                ))}
                                {sellerProducts.length === 0 && <p className="text-sm text-muted-foreground col-span-full text-center py-4">This seller has no active products.</p>}
                                </div>
                            </div>
                            <div className="mt-6">
                                <h4 className="font-semibold mb-4">Posts by {seller?.name}</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {mockSellerPosts.map(post => (
                                     <Card key={post.id} className="overflow-hidden flex flex-col bg-card">
                                        <div className="p-3">
                                            <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                <AvatarImage src={seller?.avatarUrl} alt={seller?.name} />
                                                <AvatarFallback>{seller?.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                <p className="font-semibold text-primary text-xs">{seller?.name}</p>
                                                <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                                                </div>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 -mr-2 -mt-2">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => handleShare(post.id)}>
                                                    <Share2 className="mr-2 h-4 w-4" />
                                                    <span>Share</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={handleReportStream}>
                                                    <Flag className="mr-2 h-4 w-4" />
                                                    <span>Report</span>
                                                </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                            </div>
                                            <p className="text-sm line-clamp-2">{post.content}</p>
                                        </div>
                                        {post.mediaUrl && (
                                            <div className="w-full aspect-video bg-muted relative mt-auto">
                                            <Image src={post.mediaUrl} alt="Post media" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
                                            </div>
                                        )}
                                        <div className="p-3 mt-auto flex justify-between items-center text-xs text-muted-foreground">
                                            <div className="flex items-center gap-3">
                                            <button className="flex items-center gap-1 hover:text-primary">
                                                <Heart className="w-3 h-3" />
                                                <span>{post.likes || 0}</span>
                                            </button>
                                            <button className="flex items-center gap-1 hover:text-primary">
                                                <MessageSquare className="w-3 h-3" />
                                                <span>{post.replies || 0}</span>
                                            </button>
                                            </div>
                                        </div>
                                    </Card>
                                  ))}
                                  {mockSellerPosts.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">This seller hasn't posted anything yet.</p>}
                                </div>
                            </div>
                            <div className="mt-8">
                                <h4 className="font-semibold mb-4">Related Streams</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {relatedStreams.map((s: any) => (
                                    <Link href={`/stream/${s.id}`} key={s.id} className="group">
                                    <div className="relative rounded-lg overflow-hidden aspect-[16/9] bg-muted">
                                        <div className="absolute top-2 left-2 z-10"><Badge variant="destructive">LIVE</Badge></div>
                                        <div className="absolute top-2 right-2 z-10">
                                        <Badge variant="secondary" className="bg-background/60 backdrop-blur-sm gap-1.5">
                                            <Users className="h-3 w-3" />
                                            {s.viewers}
                                        </Badge>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2 mt-2">
                                        <Avatar className="w-7 h-7">
                                        <AvatarImage src={s.avatarUrl} />
                                        <AvatarFallback>{s.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <p className="font-semibold text-xs group-hover:underline truncate">{s.name}</p>
                                            {s.hasAuction && (
                                            <Badge variant="purple" className="text-xs font-bold px-1.5 py-0">
                                                Auction
                                            </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">{s.category}</p>
                                        <p className="text-xs text-primary font-semibold mt-0.5 sm:hidden lg:block">#{s.category.toLowerCase()}</p>
                                        </div>
                                    </div>
                                    </Link>
                                ))}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </div>
                 <div className="hidden lg:flex w-[340px] flex-shrink-0 bg-background text-foreground h-full flex-col border-l border-border">
                    <div className="p-4 border-b flex items-center justify-between z-10 flex-shrink-0 h-16">
                        <h3 className="font-bold text-lg">Live Chat</h3>
                        <div className="flex items-center gap-1">
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Wallet className="h-5 w-5 text-muted-foreground" />
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-80">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold">My Wallet</h4>
                                    <Button variant="link" size="sm" asChild className="p-0 h-auto">
                                        <Link href="/wallet">More Details</Link>
                                    </Button>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/50 border">
                                    <p className="text-xs text-muted-foreground">Available Balance</p>
                                    <p className="text-2xl font-bold">₹{walletBalance.toFixed(2)}</p>
                                </div>
                                <div className="text-xs text-muted-foreground space-y-1 mt-2">
                                    <div className="flex justify-between"><span>Blocked Margin:</span> <span className="font-medium text-foreground">₹2,640.00</span></div>
                                    <div className="flex justify-between"><span>StreamCart Coins:</span> <span className="font-medium text-foreground">1,250</span></div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 pt-4">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm"><Plus className="mr-1.5 h-4 w-4" /> Deposit</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Add Funds via UPI</DialogTitle>
                                                <DialogDescription>Scan the QR code with any UPI app to add funds to your wallet.</DialogDescription>
                                            </DialogHeader>
                                            <div className="flex flex-col items-center gap-4 py-4">
                                                <div className="bg-white p-4 rounded-lg">
                                                    <Image src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=streamcart@mock" alt="UPI QR Code" width={200} height={200} />
                                                </div>
                                                <p className="text-sm text-muted-foreground">or pay to UPI ID:</p>
                                                <p className="font-semibold">streamcart@mock</p>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                    <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm"><Download className="mr-1.5 h-4 w-4" /> Withdraw</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Withdraw Funds</DialogTitle>
                                                <DialogDescription>Select an account and enter the amount you wish to withdraw.</DialogDescription>
                                            </DialogHeader>
                                            <WithdrawForm cashAvailable={walletBalance} bankAccounts={bankAccounts} onWithdraw={handleWithdraw} onAddAccount={(newAccount) => { setBankAccounts(prev => [...prev, { ...newAccount, id: Date.now() }]); toast({ title: "Bank Account Added!", description: "You can now select it for withdrawals." }); }} />
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Pin className="h-5 w-5 text-muted-foreground" />
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0" align="end">
                            <div className="p-3 bg-muted/50 space-y-2 rounded-lg border backdrop-blur-sm">
                                <div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                    <Pin className="w-3 h-3" />
                                    <span>Pinned by {seller?.name}</span>
                                </div>
                                <div className="p-2 rounded-md bg-background border">
                                    <div className="flex items-center gap-2">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={seller?.avatarUrl} />
                                        <AvatarFallback>{seller?.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-semibold text-xs">{seller?.name}:</span>
                                    </div>
                                    <p className="text-sm pl-8 mt-1">Welcome everyone! Don't forget to use code LIVE15 for 15% off!</p>
                                </div>
                                </div>
                                <Card className="overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="flex items-center gap-3 p-2">
                                    <Image src={product.images[0]} alt={product.name} width={50} height={50} className="rounded-md" />
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold truncate">{product.name}</p>
                                        <p className="font-bold text-base">{product.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                                    </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-1 grid grid-cols-2 gap-1">
                                    {product.stock > 0 ? (
                                    <>
                                        <Button size="xs" className="w-full text-[10px] h-7" variant="secondary" onClick={() => handleAddToCart(product)}>Add to Cart</Button>
                                        <Button size="xs" className="w-full text-[10px] h-7" onClick={() => handleBuyNow(product)}>
                                        <Zap className="w-3 h-3 mr-1" />
                                        Buy Now
                                        </Button>
                                    </>
                                    ) : (
                                    <Button size="xs" className="w-full text-[10px] h-7 col-span-2" variant="outline" disabled>Out of Stock</Button>
                                    )}
                                </CardFooter>
                                </Card>
                            </div>
                            </PopoverContent>
                        </Popover>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
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
                                    If this stream violates our community guidelines, please report it. Our moderation team will review it shortly.
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
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-2">
                            {chatMessages.map((msg, index) => (
                            <div key={msg.id || index} className="text-sm group relative">
                                {msg.type === 'system' ? (
                                <p className="text-xs text-muted-foreground text-center italic">{msg.text}</p>
                                ) : msg.user ? (
                                <>
                                    <div className="flex items-start gap-2">
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={msg.avatar} />
                                        <AvatarFallback>{msg.user.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <span className={cn("font-semibold pr-1 text-xs", msg.isSeller && "text-amber-400")}>
                                        {msg.user.split(' ')[0]}
                                        {msg.isSeller && (
                                            <Badge variant="secondary" className="ml-1 text-amber-400 border-amber-400/50">
                                            <ShieldCheck className="h-3 w-3 mr-1" />
                                            Admin
                                            </Badge>
                                        )}
                                        </span>
                                        <span className={cn("text-muted-foreground break-words", msg.isBid && "font-bold text-lg text-primary")}>{renderContentWithHashtags(msg.text)}</span>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                        {user?.uid !== msg.userId && (
                                            <DropdownMenuItem onSelect={() => handleReply({ name: msg.user, id: msg.userId })}>
                                            Reply
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onSelect={() => handleReportMessage(msg.id)}>
                                            <Flag className="mr-2 h-4 w-4" /> Report
                                        </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    </div>
                                </>
                                ) : null}
                            </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>
                    <div className="p-3 border-t bg-background flex-shrink-0">
                        {isProductListVisible && (
                        <div className="relative mb-2">
                            <Carousel opts={{ align: "start", dragFree: true }} className="w-full">
                            <CarouselContent className="-ml-2">
                                {(sellerProducts.length > 0 ? sellerProducts : [productDetails['prod_1'], productDetails['prod_2'], { ...productDetails['prod_3'], stock: 0 }]).map((product, index) => (
                                <CarouselItem key={index} className="pl-2 basis-auto">
                                    <div className="w-28">
                                    <Card className="h-full flex flex-col overflow-hidden">
                                        <Link href={`/product/${product.key}`} className="block">
                                        <div className="aspect-square bg-muted rounded-t-lg relative">
                                            <Image src={product.images[0].preview || product.images[0]} alt={product.name} fill className="object-cover" />
                                            <div className="absolute bottom-1 right-1 flex flex-col gap-1 text-right">
                                            <Badge variant="secondary" className="text-xs backdrop-blur-sm bg-background/50">Stock: {product.stock}</Badge>
                                            <Badge variant="secondary" className="text-xs backdrop-blur-sm bg-background/50">Sold: {Math.floor(Math.random() * product.stock)}</Badge>
                                            </div>
                                        </div>
                                        <div className="p-1.5">
                                            <p className="text-[11px] font-semibold truncate leading-tight">{product.name}</p>
                                            <p className="text-xs font-bold">{product.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                                        </div>
                                        </Link>
                                        <CardFooter className="p-1.5 mt-auto grid grid-cols-2 gap-1">
                                        {product.stock > 0 ? (
                                            <>
                                            <Button size="xs" className="w-full text-[10px] h-6" variant="secondary" onClick={() => handleAddToCart(product)}>Add</Button>
                                            <Button size="xs" className="w-full text-[10px] h-6" onClick={() => handleBuyNow(product)}>Buy</Button>
                                            </>
                                        ) : (
                                            <Button size="xs" className="w-full text-[10px] h-6 col-span-2" variant="outline" disabled>Out of Stock</Button>
                                        )}
                                        </CardFooter>
                                    </Card>
                                    </div>
                                </CarouselItem>
                                ))}
                            </CarouselContent>
                            </Carousel>
                        </div>
                        )}
                        <div className="flex items-center gap-1 mb-2">
                        <Button variant={isProductListVisible ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setIsProductListVisible(prev => !prev)}>
                            <ShoppingBag className="h-5 w-5" />
                        </Button>
                        {seller?.hasAuction && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300">
                            <Gavel className="h-5 w-5" />
                            </Button>
                        )}
                        </div>
                        <form onSubmit={handleNewMessageSubmit} className="flex items-center gap-3">
                        <div className="relative flex-grow">
                            <Textarea ref={textareaRef} placeholder={replyingTo ? `@${replyingTo.name} ` : "Send a message..."} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="resize-none pr-10 rounded-2xl bg-muted border-transparent focus:border-primary focus:bg-background h-10 min-h-[40px] pt-2.5 text-sm" rows={1} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleNewMessageSubmit(e); } }} />
                            <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" type="button" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-muted-foreground">
                                <Smile className="h-5 w-5" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 h-64 p-2">
                                <div className="grid grid-cols-8 gap-1 h-full overflow-y-auto no-scrollbar">
                                {emojis.map((emoji, index) => (
                                    <Button key={index} variant="ghost" size="icon" onClick={() => addEmoji(emoji)} className="text-xl">
                                    {emoji}
                                    </Button>
                                ))}
                                </div>
                            </PopoverContent>
                            </Popover>
                        </div>
                        <Button type="submit" size="icon" disabled={!newMessage.trim()} className="rounded-full flex-shrink-0 h-10 w-10">
                            <Send className="h-4 w-4" />
                        </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

    
