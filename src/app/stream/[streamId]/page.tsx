

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
  ShieldCheck,
  StopCircle,
  Rewind,
  FastForward,
  WifiOff,
  ChevronDown,
  Maximize,
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
  Settings2,
  SlidersHorizontal,
  Subtitles,
  History,
  Ticket,
  Award,
  Instagram,
  Twitter,
  Youtube,
  Twitch,
  Facebook,
  ArrowUp,
  GripHorizontal,
  Package,
  Reply,
  Check,
  FileEdit,
  Sparkles,
  UserCheck,
  Clock,
  Trash2,
  MoreHorizontal,
  Banknote,
  DollarSign, // Added for Super Chat
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from 'next/image';
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { productDetails } from "@/lib/product-data";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { addToCart, isProductInCart, getCart, saveCart } from '@/lib/product-history';
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
import { toggleFollow, getUserData, UserData } from '@/lib/follow-data';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { doc, Timestamp, onSnapshot } from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase';
import { Slider } from "@/components/ui/slider";
import { FeedbackDialog } from "@/components/feedback-dialog";
import { Textarea } from "@/components/ui/textarea";
import { categories } from "@/lib/categories";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Label } from "@/components/ui/label";
import { WithdrawForm } from "@/components/settings-forms";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useInView } from "react-intersection-observer";
import { useMiniPlayer } from "@/context/MiniPlayerContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format, formatDistanceToNow, isThisWeek, isThisYear, parseISO, parse } from 'date-fns';
import { ProductShelfContent } from '@/components/product-shelf-content';


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

const liveSellers = [
    { id: 'fashionfinds-uid', name: 'FashionFinds', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Fashion', viewers: 1200, buyers: 25, rating: 4.8, reviews: 12, hint: 'woman posing stylish outfit', productId: 'prod_1', hasAuction: true },
    { id: 'gadgetguru-uid', name: 'GadgetGuru', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Electronics', viewers: 2500, buyers: 42, rating: 4.9, reviews: 28, hint: 'unboxing new phone', productId: 'prod_2', hasAuction: false },
    { id: 'homehaven-uid', name: 'HomeHaven', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Home Goods', viewers: 850, buyers: 15, rating: 4.7, reviews: 9, hint: 'modern living room decor', productId: 'prod_3', hasAuction: false },
    { id: 'beautybox-uid', name: 'BeautyBox', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Beauty', viewers: 3100, buyers: 78, rating: 4.9, reviews: 55, hint: 'makeup tutorial', productId: 'prod_4', hasAuction: true },
    { id: 'kitchenwiz-uid', name: 'KitchenWiz', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Kitchenware', viewers: 975, buyers: 0, rating: 0, reviews: 0, hint: 'cooking demonstration', productId: 'prod_5', hasAuction: false },
    { id: 'fitflow-uid', name: 'FitFlow', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Fitness', viewers: 1500, buyers: 33, rating: 4.6, reviews: 18, hint: 'yoga session', productId: 'prod_6', hasAuction: false },
    { id: 'artisanalley-uid', name: 'ArtisanAlley', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Handmade', viewers: 450, buyers: 8, rating: 5.0, reviews: 6, hint: 'pottery making', productId: 'prod_7', hasAuction: true },
    { id: 'petpalace-uid', name: 'PetPalace', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Pet Supplies', viewers: 1800, buyers: 50, rating: 4.8, reviews: 30, hint: 'playing with puppy', productId: 'prod_8', hasAuction: false },
    { id: 'booknook-uid', name: 'BookNook', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Books', viewers: 620, buyers: 12, rating: 4.9, reviews: 10, hint: 'reading book cozy', productId: 'prod_9', hasAuction: false },
    { id: 'gamerguild-uid', name: 'GamerGuild', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Gaming', viewers: 4200, buyers: 102, rating: 4.9, reviews: 80, hint: 'esports competition', productId: 'prod_10', hasAuction: true },
];

const mockAdminOffers = [
    { icon: <Ticket className="h-5 w-5 text-primary" />, title: "Special Price", description: "Get this for ₹11,000 using the code VINTAGE10" },
    { icon: <Banknote className="h-5 w-5 text-primary" />, title: "Bank Offer", description: "10% Instant Discount on HDFC Bank Credit Card" },
];


const mockChatMessages: any[] = [
    { id: 1, user: 'Ganesh', text: 'This looks amazing! 🔥 #newpurchase', avatar: 'https://placehold.co/40x40.png', userId: 'user1' },
    { id: 2, user: 'Alex', text: 'What is the material?', avatar: 'https://placehold.co/40x40.png', userId: 'user2' },
    { id: 26, isSeller: true, user: 'FashionFinds', text: "Hey @Alex, it's 100% genuine leather! Check the description for more info." },
    { id: 3, user: 'Jane', text: 'I just bought one! So excited. 🤩 #newpurchase', avatar: 'https://placehold.co/40x40.png', userId: 'user3' },
    { id: 4, type: 'system', text: 'Maria purchased a Vintage Camera.' },
    { id: 5, type: 'system', text: 'Michael joined the stream.' },
    { id: 6, user: 'David', text: 'Do you ship to the US?', avatar: 'https://placehold.co/40x40.png', userId: 'user4' },
    { id: 27, isSeller: true, user: 'FashionFinds', text: 'Yes @David, we offer international shipping!' },
    { id: 7, user: 'Sarah', text: 'This is my first time here, loving the vibe!', avatar: 'https://placehold.co/40x40.png', userId: 'user5' },
    { id: 11, user: 'Emily', text: 'How long does the battery last on the light meter?', avatar: 'https://placehold.co/40x40.png', userId: 'user8' },
    { id: 28, isSeller: true, user: 'FashionFinds', text: '@Emily It lasts for about a year with average use!' },
    { id: 14, type: 'system', text: 'Robert purchased Wireless Headphones.' },
    { id: 15, user: 'Ganesh', text: 'Can you show the back of the camera?', avatar: 'https://placehold.co/40x40.png', userId: 'user1' },
    { id: 29, isSeller: true, user: 'FashionFinds', text: 'Sure thing, @Ganesh! Here is a view of the back.' },
    { id: 16, user: 'Chloe', text: 'Just tuned in, what did I miss?', avatar: 'https://placehold.co/40x40.png', userId: 'user9' },
    { id: 30, isSeller: true, user: 'FashionFinds', text: 'Welcome @Chloe! We are showcasing our new collection. Stick around!' },
    { id: 17, user: 'Oliver', text: 'Is this real leather?', avatar: 'https://placehold.co/40x40.png?text=O', userId: 'user10' },
    { id: 18, user: 'Mia', text: 'Just followed! Love your stuff.', avatar: 'https://placehold.co/40x40.png?text=M', userId: 'user11' },
    { id: 19, user: 'Liam', text: 'How much is shipping?', avatar: 'https://placehold.co/40x40.png?text=L', userId: 'user12' },
    { id: 20, type: 'system', text: 'Emma purchased a Smart Watch.' },
    { id: 21, user: 'Ava', text: 'Can you show a close-up of the stitching?', avatar: 'https://placehold.co/40x40.png?text=A', userId: 'user13' },
    { id: 24, user: 'Sophia', text: 'Great stream! Thanks!', avatar: 'https://placehold.co/40x40.png?text=S', userId: 'user15' },
    { id: 31, isSeller: true, user: 'FashionFinds', text: 'You are welcome, @Ganesh! Glad I could help.' },
    { id: 32, type: 'system', text: 'Michael joined the stream.' },
];

const reportReasons = [
    { value: "spam", label: "Spam or misleading" },
    { value: "nudity", label: "Nudity or sexual content" },
    { value: "hate", label: "Hate speech or symbols" },
    { value: "violence", label: "Violent or graphic content" },
    { value: "scam", label: "Scam or fraud" },
    { value: "illegal", label: "Illegal goods or activities" },
    { value: "other", label: "Other" },
];

const qualityLevels = ["1080p", "720p", "480p", "360p", "144p"];

const productToSellerMapping: { [key: string]: { name: string; avatarUrl: string; uid: string } } = {
    'prod_1': { name: 'FashionFinds', avatarUrl: 'https://placehold.co/80x80.png', uid: 'fashionfinds-uid' },
    'prod_2': { name: 'GadgetGuru', avatarUrl: 'https://placehold.co/80x80.png', uid: 'gadgetguru-uid' },
    'prod_3': { name: 'HomeHaven', avatarUrl: 'https://placehold.co/80x80.png', uid: 'homehaven-uid' },
    'prod_4': { name: 'BeautyBox', avatarUrl: 'https://placehold.co/80x80.png', uid: 'beautybox-uid' },
    'prod_5': { name: 'KitchenWiz', avatarUrl: 'https://placehold.co/80x80.png', uid: 'kitchenwiz-uid' },
    'prod_6': { name: 'FitFlow', avatarUrl: 'https://placehold.co/80x80.png', uid: 'fitflow-uid' },
    'prod_7': { name: 'ArtisanAlley', avatarUrl: 'https://placehold.co/80x80.png', uid: 'artisanalley-uid' },
    'prod_8': { name: 'PetPalace', avatarUrl: 'https://placehold.co/80x80.png', uid: 'petpalace-uid' },
    'prod_9': { name: 'BookNook', avatarUrl: 'https://placehold.co/80x80.png', uid: 'booknook-uid' },
    'prod_10': { name: 'GamerGuild', avatarUrl: 'https://placehold.co/80x80.png', uid: 'gamerguild-uid' },
    'prod_11': { name: 'FashionFinds', avatarUrl: 'https://placehold.co/80x80.png', uid: 'fashionfinds-uid' },
    'prod_12': { name: 'FashionFinds', avatarUrl: 'https://placehold.co/80x80.png', uid: 'fashionfinds-uid' },
    'prod_13': { name: 'Modern Man', avatarUrl: 'https://placehold.co/80x80.png', uid: 'modernman-uid' },
    'prod_14': { name: 'Casual Co.', avatarUrl: 'https://placehold.co/80x80.png', uid: 'casualco-uid' },
    'prod_15': { name: 'BeautyBox', avatarUrl: 'https://placehold.co/80x80.png', uid: 'beautybox-uid' },
    'prod_16': { name: 'BeautyBox', avatarUrl: 'https://placehold.co/80x80.png', uid: 'beautybox-uid' },
    'prod_17': { name: 'BeautyBox', avatarUrl: 'https://placehold.co/80x80.png', uid: 'beautybox-uid' },
    'prod_18': { name: 'BeautyBox', avatarUrl: 'https://placehold.co/80x80.png', uid: 'beautybox-uid' },
    'prod_19': { name: 'QuickFlex', avatarUrl: 'https://placehold.co/80x80.png', uid: 'quickflex-uid' },
    'prod_20': { name: 'GentleStep', avatarUrl: 'https://placehold.co/80x80.png', uid: 'gentlestep-uid' },
    'prod_21': { name: 'SunShield', avatarUrl: 'https://placehold.co/80x80.png', uid: 'sunshield-uid' },
    'prod_22': { name: 'Aura Jewels', avatarUrl: 'https://placehold.co/80x80.png', uid: 'aurajewels-uid' },
    'prod_23': { name: 'BreezyWear', avatarUrl: 'https://placehold.co/80x80.png', uid: 'breezywear-uid' },
    'prod_24': { name: 'Elegance', avatarUrl: 'https://placehold.co/80x80.png', uid: 'elegance-uid' },
    'prod_25': { name: 'KitchenPro', avatarUrl: 'https://placehold.co/80x80.png', uid: 'kitchenpro-uid' },
    'prod_26': { name: 'CozyHome', avatarUrl: 'https://placehold.co/80x80.png', uid: 'cozyhome-uid' },
    'prod_27': { name: 'AudioBlast', avatarUrl: 'https://placehold.co/80x80.png', uid: 'audioblast-uid' },
    'prod_28': { name: 'LittleSprout', avatarUrl: 'https://placehold.co/80x80.png', uid: 'littlesprout-uid' },
    'prod_29': { name: 'StretchyPants', avatarUrl: 'https://placehold.co/80x80.png', uid: 'stretchypants-uid' },
    'prod_30': { name: 'Everyday', avatarUrl: 'https://placehold.co/80x80.png', uid: 'everyday-uid' },
    'prod_31': { name: 'SunChaser', avatarUrl: 'https://placehold.co/80x80.png', uid: 'sunchaser-uid' },
    'prod_32': { name: 'Elegance', avatarUrl: 'https://placehold.co/80x80.png', uid: 'elegance-uid' },
    'prod_33': { name: 'SleekFit', avatarUrl: 'https://placehold.co/80x80.png', uid: 'sleekfit-uid' }
};

const ReportDialog = ({ onSubmit }: { onSubmit: (reason: string, details: string) => void }) => {
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");

    const handleSubmit = () => {
        onSubmit(reason, details);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Report Stream</DialogTitle>
                <DialogDescription>
                    Help us understand the problem. What's going on in this stream?
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <RadioGroup value={reason} onValueChange={setReason}>
                    <div className="space-y-2">
                        {reportReasons.map(r => (
                            <div key={r.value} className="flex items-center">
                                <RadioGroupItem value={r.value} id={r.value} />
                                <Label htmlFor={r.value} className="ml-2 cursor-pointer">{r.label}</Label>
                            </div>
                        ))}
                    </div>
                </RadioGroup>
                {reason === 'other' && (
                    <Textarea 
                        placeholder="Please provide more details..." 
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                    />
                )}
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleSubmit} disabled={!reason || (reason === 'other' && !details.trim())}>Submit Report</Button>
            </DialogFooter>
        </DialogContent>
    )
};

const RatingDialog = ({ onRate, sellerName, initialRating }: { onRate: (rating: number) => void, sellerName: string, initialRating: number }) => {
    const [rating, setRating] = useState(initialRating || 0);
    const [hoverRating, setHoverRating] = useState(0);

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Rate the Stream</DialogTitle>
                <DialogDescription>How would you rate your experience with {sellerName}?</DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-center gap-2 py-4">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={cn(
                            "h-10 w-10 cursor-pointer transition-colors",
                            (hoverRating || rating) >= star ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                        )}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                    />
                ))}
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={() => onRate(rating)} disabled={rating === 0}>Submit Rating</Button>
            </DialogFooter>
        </DialogContent>
    );
};

const ProductShelf = ({ sellerProducts, handleAddToCart, handleBuyNow, toast }: { sellerProducts: any[], handleAddToCart: (product: any) => void, handleBuyNow: (product: any) => void, toast: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isMobile = useIsMobile();
    
    if (isMobile) {
        return (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                     <Button variant="outline" className="w-full justify-center group">
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 sm:mr-1" />
                            <span>Products ({sellerProducts.length})</span>
                            <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                        </div>
                    </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[60vh] flex flex-col p-0">
                    <ProductShelfContent 
                        sellerProducts={sellerProducts}
                        handleAddToCart={handleAddToCart}
                        handleBuyNow={handleBuyNow}
                        isMobile={true}
                        onClose={() => setIsOpen(false)}
                        toast={toast}
                    />
                </SheetContent>
            </Sheet>
        );
    }
    
     return (
         <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
                 <Button variant="outline" className="w-full justify-center group">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 sm:mr-1" />
                        <span>Products ({sellerProducts.length})</span>
                        <ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen ? "rotate-180" : "rotate-0")} />
                    </div>
                </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4">
                 <Carousel
                    opts={{
                        align: "start",
                    }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-2">
                        {sellerProducts.map((product, index) => (
                        <CarouselItem key={index} className="basis-auto pl-2">
                            <Card className="w-40 overflow-hidden h-full flex flex-col flex-shrink-0">
                                <Link href={`/product/${product.key}`} className="group block">
                                    <div className="relative aspect-square bg-muted">
                                        <Image
                                            src={product.images[0]?.preview || product.images[0]}
                                            alt={product.name}
                                            fill
                                            sizes="50vw"
                                            className="object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute bottom-2 right-2">
                                            <Button size="icon" className="h-8 w-8 rounded-full bg-black/50 text-white backdrop-blur-sm">
                                                <Sparkles className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {product.stock === 0 && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <Badge variant="destructive">Out of Stock</Badge>
                                            </div>
                                        )}
                                    </div>
                                </Link>
                                <div className="p-2 flex-grow flex flex-col">
                                    <Link href={`/product/${product.key}`} className="group block">
                                        <h4 className="font-semibold truncate text-xs group-hover:underline">{product.name}</h4>
                                        <p className="font-bold text-sm">{product.price}</p>
                                    </Link>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-primary"><Package className="h-3 w-3" /> {product.stock} left</div>
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-primary"><Users className="h-3 w-3" /> {product.sold} sold</div>
                                        <div className="flex items-center gap-1 cursor-pointer hover:text-primary"><Star className="h-3 w-3" /> {product.reviews}</div>
                                    </div>
                                </div>
                                <CardFooter className="p-2 grid grid-cols-1 gap-2">
                                    {product.stock > 0 ? (
                                        <>
                                            <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => { handleAddToCart(product); }}><ShoppingBag className="mr-1 h-3 w-3" /> Cart</Button>
                                            <Button size="sm" className="w-full text-xs h-8" onClick={() => { handleBuyNow(product); }}>Buy Now</Button>
                                        </>
                                    ) : (
                                        <Button size="sm" className="w-full text-xs h-8" onClick={() => { toast({ title: "We'll let you know!", description: `You will be notified when ${product.name} is back in stock.`}); }}>Notify Me</Button>
                                    )}
                                </CardFooter>
                            </Card>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
                    <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
                    </Carousel>
            </CollapsibleContent>
        </Collapsible>
    );
};

const PostShareCard = ({ msg, handlers }: { msg: any, handlers: any }) => {
    const { product, sellerName, text } = msg;
    if (!product) return null;

    return (
        <div className="p-1.5">
            <Card className="overflow-hidden bg-card/80 border-primary/20 p-3 animate-in fade-in-0 slide-in-from-bottom-2">
                <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                    <FileEdit className="w-4 h-4" />
                    <strong>{sellerName}</strong> shared a post
                </div>
                <p className="text-sm italic mb-3">"{text}"</p>
                <div className="flex gap-3">
                    <div className="relative w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                        <Image src={product.images[0]} alt={product.name} fill sizes="80px" className="object-cover" />
                    </div>
                    <div className="flex-grow">
                        <h4 className="font-semibold text-sm">{product.name}</h4>
                        <p className="font-bold text-lg">{product.price}</p>
                        <div className="flex gap-2 mt-2">
                            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handlers.onAddToCart(product)}>
                                <ShoppingCart className="w-3 h-3 mr-1" /> Cart
                            </Button>
                            <Button size="sm" className="text-xs h-7" onClick={() => handlers.onBuyNow(product)}>Buy Now</Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};


const ProductPromoCard = ({ msg, handlers }: { msg: any, handlers: any }) => {
    const { product } = msg;

    return (
       <div className="p-1.5">
            <Card className="overflow-hidden bg-card/80 border-primary/20 p-0 animate-in fade-in-0 slide-in-from-bottom-2">
                <div className="relative aspect-video">
                    <Image src={product.images[0]} alt={product.name} fill sizes="100vw" className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0" />
                    <div className="absolute top-2 left-2">
                         <Badge variant="secondary" className="bg-gradient-to-r from-primary to-purple-500 text-white border-transparent shadow-lg gap-1.5">
                            <Sparkles className="w-3 h-3" />Featured Product
                        </Badge>
                    </div>
                </div>
                <div className="p-2">
                    <h4 className="font-semibold text-sm leading-tight">{product.name}</h4>
                    <p className="font-bold text-lg">{product.price}</p>
                    <div className="flex gap-2 mt-2">
                        <Button size="sm" variant="outline" className="text-xs h-7 flex-1" onClick={() => handlers.onAddToCart(product)}><ShoppingCart className="w-3 h-3 mr-1" /> Cart</Button>
                        <Button size="sm" className="text-xs h-7 flex-1" onClick={() => handlers.onBuyNow(product)}>Buy Now</Button>
                    </div>
                </div>
            </Card>
       </div>
    );
};


const renderWithHashtagsAndLinks = (text: string) => {
    if (!text) return null;
    const regex = /(https?:\/\/[^\s]+|#\w+|@\w+)/g;
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
        if (part.startsWith('http://') || part.startsWith('https://')) {
            return <a key={index} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{part}</a>;
        }
        if (part.startsWith('#')) {
            return <button key={index} className="text-primary font-semibold hover:underline">{part}</button>;
        }
        if (part.startsWith('@')) {
            return <span key={index} className="text-blue-400 font-semibold">{part}</span>;
        }
        return part;
    });
};

const StreamInfo = ({ seller, sellerData, streamData, handleFollowToggle, isFollowingState, isRatingDialogOpen, setIsRatingDialogOpen, handleRateStream, isPastStream, userRating, ...props }: any) => {
    if (!seller) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }
    return (
        <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
            <div className="space-y-4">
                <div className="mb-4">
                    <h2 className="font-bold text-lg">Topic</h2>
                     <div className="text-sm text-muted-foreground mt-1 space-y-4">
                        <div>{renderWithHashtagsAndLinks(streamData.description || "Welcome to the live stream!")}</div>
                         <div className="flex items-center gap-2 text-xs">
                             {streamData.startedAt && (
                                <>
                                    <Clock className="h-4 w-4" />
                                    <span>Started {formatDistanceToNow(new Date(streamData.startedAt), { addSuffix: true })}</span>
                                </>
                             )}
                            {!isPastStream && (
                                <DialogTrigger asChild>
                                    <Button variant="link" className="text-xs p-0 h-auto">
                                        {userRating ? (
                                            <span className="flex items-center gap-1">
                                                You rated: 
                                                <span className="flex text-yellow-400">{[...Array(userRating)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}</span> 
                                                (Undo)
                                            </span>
                                        ) : "Rate Stream"}
                                    </Button>
                                </DialogTrigger>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <Link href={`/seller/profile?userId=${seller.id}`} className="flex items-center gap-3 group flex-grow overflow-hidden">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                            <AvatarImage src={seller.avatarUrl} />
                            <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow overflow-hidden">
                            <h3 className="font-semibold truncate group-hover:underline">{seller.name}</h3>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <Users className="h-3 w-3"/>
                                    <span>{sellerData?.followers ? `${sellerData.followers.toLocaleString()} followers` : 'Loading...'}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-amber-500">
                                    <Star className="h-3 w-3 fill-current" />
                                    <span>{seller.rating}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                    <Button onClick={handleFollowToggle} variant={isFollowingState ? "outline" : "default"} className="flex-shrink-0">
                        {isFollowingState ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                        {isFollowingState ? "Following" : "Follow"}
                    </Button>
                </div>
                
                <ProductShelf {...props} />
            </div>
            <RatingDialog onRate={handleRateStream} sellerName={seller.name} initialRating={userRating} />
        </Dialog>
    );
};

const RelatedContent = ({ relatedStreams }: { relatedStreams: any[] }) => {
    if (!relatedStreams || relatedStreams.length === 0) {
        return null;
    }
    
    return (
     <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
        <h4 className="font-semibold">Related Streams</h4>
        <Button asChild variant="link" size="sm" className="text-xs">
            <Link href="/live-selling">More</Link>
        </Button>
        </div>
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
            {relatedStreams.slice(0,4).map((s: any) => (
                 <Link href={`/stream/${s.id}`} key={s.id} className="group flex flex-col">
                    <div className="relative rounded-lg overflow-hidden aspect-video bg-muted w-full flex-shrink-0">
                        <div className="absolute top-2 left-2 z-10"><Badge variant="destructive">LIVE</Badge></div>
                        <div className="absolute top-2 right-2 z-10"><Badge variant="secondary" className="bg-black/50 text-white"><Users className="w-3 h-3 mr-1.5" />{s.viewers.toLocaleString()}</Badge></div>
                         <Image src={s.thumbnailUrl} alt={`Live stream from ${s.name}`} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover transition-transform group-hover:scale-105" />
                    </div>
                    <div className="flex items-start gap-2 mt-2">
                        <Avatar className="w-7 h-7">
                            <AvatarImage src={s.avatarUrl} alt={s.name} />
                            <AvatarFallback>{s.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-xs group-hover:underline truncate">{s.name}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">{s.category}</p>
                            <p className="text-xs text-primary font-semibold mt-0.5">#{s.category.toLowerCase().replace(/\s+/g, '')}</p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    </div>
    )
};

const StreamPage = () => {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();

    const streamId = params.streamId as string;
    const isPastStream = searchParams.get('isPast') === 'true';

    const { user } = useAuth();
    const { toast } = useToast();
    const { minimizedStream, minimizeStream, closeMinimizedStream, isMinimized } = useMiniPlayer();
    const inlineAuctionCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
    
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [pinnedMessages, setPinnedMessages] = useState<any[]>(mockAdminOffers.map(o => ({...o, type: 'offer', id: o.title })));
    const [isFollowingState, setIsFollowingState] = useState(false);
    
    const [cartCount, setCartCount] = useState(0);
    const [walletBalance, setWalletBalance] = useState(42580.22);
    const [sellerData, setSellerData] = useState<UserData | null>(null);
    
    const isMobile = useIsMobile();
        
    const seller = useMemo(() => liveSellers.find(s => s.id === streamId), [streamId]);

    const product = useMemo(() => {
        if (!seller) return null;
        return productDetails[seller.productId as keyof typeof productDetails] || null;
    }, [seller]);
    
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

    const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
    const [userRating, setUserRating] = useState<number>(0);

    const handleRateStream = (rating: number) => {
        if (!user) return;
        
        setUserRating(rating);
        toast({
            title: `You rated this stream ${rating} stars!`,
            description: "Thanks for your feedback."
        });

        const ratingMessage = {
            id: `rating-${Date.now()}`,
            type: 'system',
            text: `${user.displayName} rated the stream ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}`,
        };
        
        setChatMessages(prev => [...prev, ratingMessage]);

        setIsRatingDialogOpen(false);
    };

    useEffect(() => {
        if (seller) {
            const mockPost = {
                id: 33,
                type: 'post_share',
                sellerName: seller.name,
                text: 'Behind the scenes of our new collection!',
                product: productDetails['prod_5']
            };
    
             const initialMessages = mockChatMessages.map(msg => {
                if (msg.isSeller) {
                    return { ...msg, user: seller.name };
                }
                return msg;
            });

             const existingPostShareIndex = initialMessages.findIndex(m => m.type === 'post_share');

            if (existingPostShareIndex !== -1) {
                // Update existing shared post
                initialMessages[existingPostShareIndex] = { ...initialMessages[existingPostShareIndex], sellerName: seller.name };
            } else {
                 // Add a new one if it doesn't exist
                 initialMessages.push({ ...mockPost, sellerName: seller.name });
            }
            
            setChatMessages(initialMessages);
        }
    }, [seller]);

    useEffect(() => {
        if (streamId) {
            getUserData(streamId).then(data => {
                setSellerData(data);
            });
        }
    }, [streamId]);

    const relatedStreams = useMemo(() => {
        if (!seller) return [];
        let streams = liveSellers.filter(
            s => s.category === seller.category && s.id !== streamId
        );
         if (streams.length > 50) {
            return streams.slice(0, 51);
        }
        const fallbackStreams = liveSellers.filter(s => s.id !== streamId);
        
        let i = 0;
        while(streams.length < 6 && i < fallbackStreams.length) {
            if (!streams.some(s => s.id === fallbackStreams[i].id)) {
                streams.push(fallbackStreams[i]);
            }
            i++;
        }
        return streams.slice(0,51);
    }, [seller, streamId]);
    
    const mockStreamData = {
        id: streamId,
        title: "Live Shopping Event",
        description: "Join us for exclusive deals and a first look at our new collection! #fashion #live Check this out: https://google.com",
        status: "live",
        startedAt: new Date(Date.now() - 5 * 60 * 1000),
        viewerCount: seller?.viewers || 0,
        streamUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    };

    const streamData = mockStreamData;
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<HTMLDivElement>(null);
    const progressContainerRef = useRef<HTMLDivElement>(null);
    
    const [isPaused, setIsPaused] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [skipInterval, setSkipInterval] = useState(10);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLive, setIsLive] = useState(isMobile ? true : false);
    const mainScrollRef = useRef<HTMLDivElement>(null);
    const [hydrated, setHydrated] = useState(false);
    const [showGoToTop, setShowGoToTop] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [mobileView, setMobileView] = useState<'stream' | 'chat'>('stream');
    const [activeQuality, setActiveQuality] = useState('Auto');
    const [isSuperChatOpen, setIsSuperChatOpen] = useState(false);
    
    const handleAuthAction = useCallback((callback?: () => void) => {
        if (!user) {
            setIsAuthDialogOpen(true);
            return false;
        }
        if (callback) callback();
        return true;
    }, [user]);

    useEffect(() => {
        setHydrated(true);
        if (minimizedStream && minimizedStream.id !== streamId) {
            closeMinimizedStream();
        }
    }, [minimizedStream, streamId, closeMinimizedStream]);
    
    useEffect(() => {
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

    const handleMainScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const shouldShow = e.currentTarget.scrollTop > 200;
        if (shouldShow !== showGoToTop) {
            setShowGoToTop(shouldShow);
        }
    };

    const scrollToTop = (ref: React.RefObject<HTMLDivElement>) => {
        ref.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const sellerProducts = useMemo(() => {
        if (!seller) return [];
        return Object.values(productDetails)
            .filter(p => productToSellerMapping[p.key]?.name === seller.name)
            .map(p => ({
                ...p,
                reviews: Math.floor(Math.random() * 200),
                sold: Math.floor(Math.random() * 1000)
            }));
    }, [seller]);
    
    useEffect(() => {
        if (seller) {
            let promotionInterval = 300000; // 5 minutes default
    
            if (typeof window !== 'undefined') {
                try {
                    const storedData = localStorage.getItem('liveStream');
                    if (storedData) {
                        const liveStreamData = JSON.parse(storedData);
                        if (liveStreamData.seller.uid === seller.id && liveStreamData.promotionInterval) {
                            promotionInterval = liveStreamData.promotionInterval * 1000;
                        }
                    }
                } catch (error) {
                    console.error("Error reading live stream data from local storage:", error);
                }
            }
            
             const interval = setInterval(() => {
                const productsWithStock = Object.values(productDetails).filter(p => 
                    productToSellerMapping[p.key]?.name === seller.name && p.stock > 0
                );
                
                if (productsWithStock.length === 0) return;
                
                const randomIndex = Math.floor(Math.random() * productsWithStock.length);
                const randomProduct = productsWithStock[randomIndex];
                
                if (randomProduct) {
                     const promoMessage = {
                        id: `promo-${Date.now()}`,
                        type: 'product_promo',
                        product: randomProduct,
                    };
                    setChatMessages(prev => [...prev, promoMessage]);
                }
    
            }, promotionInterval);
        
            return () => clearInterval(interval);
        }
    }, [seller]);
    

    const formatTime = (timeInSeconds: number) => {
        if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00';
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

    const handleSeek = useCallback((direction: 'forward' | 'backward') => {
        const video = videoRef.current;
        if (!video) return;
        const newTime = direction === 'forward' ? video.currentTime + skipInterval : video.currentTime - skipInterval;
        video.currentTime = Math.max(0, Math.min(duration, newTime));
    }, [duration, skipInterval]);
    
    const handleGoLive = () => {
        const video = videoRef.current;
        if (video) {
            video.currentTime = video.duration;
        }
    };
    
    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const video = videoRef.current;
        const progressContainer = progressContainerRef.current;
        if (!video || !progressContainer) return;

        const rect = progressContainer.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const percentage = clickX / width;
        const newTime = duration * percentage;
        
        video.currentTime = newTime;
    };
    
    useEffect(() => {
        const video = videoRef.current;
        if (isMinimized(streamId)) {
            if(video) video.pause();
            return;
        };

        if (video) {
            const updateProgress = () => {
                setCurrentTime(video.currentTime);
                if (video.buffered.length > 0) {
                    setBuffered(video.buffered.end(video.buffered.length - 1));
                }
                const isCurrentlyLive = (video.duration - video.currentTime) < 2 && !isPastStream;
                if (isLive !== isCurrentlyLive) {
                    setIsLive(isCurrentlyLive);
                }
                
                if (isCurrentlyLive && video.playbackRate !== 1) {
                    video.playbackRate = 1;
                    setPlaybackRate(1);
                }
            };
            const setVideoDuration = () => setDuration(video.duration);
            const onPlay = () => setIsPaused(false);
            const onPause = () => setIsPaused(true);

            video.addEventListener("timeupdate", updateProgress);
            video.addEventListener("progress", updateProgress);
            video.addEventListener("loadedmetadata", setVideoDuration);
            video.addEventListener("play", onPlay);
            video.addEventListener("pause", onPause);

            video.muted = isMuted;
            video.play().catch(() => {
                setIsPaused(true);
            });

            return () => {
                video.removeEventListener("timeupdate", updateProgress);
                video.removeEventListener("progress", updateProgress);
                video.removeEventListener("loadedmetadata", setVideoDuration);
                video.removeEventListener("play", onPlay);
                video.removeEventListener("pause", onPause);
            };
        }
    }, [isMuted, isMinimized, streamId, isLive, isMobile, isPastStream]);
    
    const handleToggleFullscreen = () => {
        const elem = playerRef.current;
        if (!elem) return;
    
        if (!document.fullscreenElement) {
            elem.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: \`${err.message}\` (\`${err.name}\`)`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
    
        document.addEventListener('fullscreenchange', handleFullscreenChange);
    
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);
    
    const handleReportMessage = useCallback((messageId: number) => {
        toast({
            title: "Message Reported",
            description: "The message has been reported and will be reviewed by our moderation team.",
        });
    }, [toast]);
    
    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({
            title: "Stream Link Copied!",
            description: "The link to this stream has been copied to your clipboard.",
        });
    };

     const handleTogglePinMessage = useCallback((msgId: number) => {
        const msg = chatMessages.find(m => m.id === msgId);
        if (!msg) return;

        const isProductPin = msg.type === 'product_pin';

        let itemToPin:any = {};

        if (isProductPin) {
             itemToPin = { 
                id: msg.id, 
                type: 'product',
                product: productDetails['prod_1']
            };
        } else {
             itemToPin = { 
                id: msg.id,
                type: 'message',
                user: msg.user,
                text: msg.text
            };
        }
        
        setPinnedMessages(prev =>
            prev.some(p => p.id === msgId)
                ? prev.filter(p => p.id !== msgId)
                : [itemToPin, ...prev]
        );

        toast({
            title: pinnedMessages.some(p => p.id === msgId) ? "Message Unpinned" : "Message Pinned",
            description: "The message has been updated in the pinned items."
        });
    }, [chatMessages, pinnedMessages, toast]);
    
    const handleFollowToggle = useCallback(() => {
        handleAuthAction(() => setIsFollowingState(prev => !prev));
    }, [handleAuthAction]);

    const handleMinimize = () => {
      if (streamData && seller) {
        minimizeStream({
          id: streamData.id,
          streamUrl: streamData.streamUrl,
          title: seller.name,
        });
        router.push('/live-selling');
      }
    };

    const handleReply = useCallback((msg: any) => {
        // This is now handled within ChatPanel's state
    }, []);

    const handleNewMessageSubmit = useCallback((data: { text: string, amount?: number, paymentMethod?: string }) => {
        handleAuthAction(() => {
            if (!user) return;
            const { text, amount } = data;
            const newMessage: any = {
                id: Date.now(),
                user: user?.displayName || "You",
                userId: user.uid,
                text: text,
                avatar: user.photoURL || 'https://placehold.co/40x40.png',
            };
            if (amount) {
                newMessage.type = 'super_chat';
                newMessage.amount = amount;
            }
            setChatMessages(prev => [...prev, newMessage]);
        });
    }, [user, handleAuthAction]);

    const handleDeleteMessage = useCallback((msgId: number) => {
        setChatMessages(prev => prev.filter(m => m.id !== msgId));
    }, []);
    
    const onReportStream = useCallback(() => {
        handleAuthAction(() => setIsReportOpen(true));
    }, [handleAuthAction]);
    
    const handleAddToCart = useCallback((product: any) => {
        handleAuthAction(() => {
            if (product) {
              addToCart({ ...product, quantity: 1 });
              toast({
                title: "Added to Cart!",
                description: `'${product.name}' has been added to your shopping cart.`,
              });
            }
        });
    }, [toast, handleAuthAction]);
      
    const handleBuyNow = useCallback((product: any) => {
        handleAuthAction(() => {
            if (product) {
                router.push(`/cart?buyNow=true&productId=${product.key}`);
            }
        });
    }, [router, handleAuthAction]);
    
    const handlers = useMemo(() => ({
        onReply: handleReply,
        onTogglePin: handleTogglePinMessage,
        onReportMessage: handleReportMessage,
        onDeleteMessage: handleDeleteMessage,
        onReportStream,
        onAddToCart: handleAddToCart,
        onBuyNow: handleBuyNow,
        toast,
        seller,
        handleNewMessageSubmit,
        handleAuthAction,
    }), [toast, handleReply, handleReportMessage, handleTogglePinMessage, handleDeleteMessage, seller, handleNewMessageSubmit, onReportStream, handleAddToCart, handleBuyNow, handleAuthAction]);
    
    if (isMinimized(streamId)) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <div className="text-center text-foreground">
                    <h1 className="text-2xl font-bold">Stream is minimized</h1>
                    <p className="text-muted-foreground">This stream is currently playing in the mini-player.</p>
                </div>
            </div>
        );
    }

    if (!hydrated) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-background">
                <div className="w-full max-w-4xl">
                    <Skeleton className="w-full aspect-[3/4]" />
                    <div className="p-4 space-y-3">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <React.Fragment>
            <AlertDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Authentication Required</AlertDialogTitle>
                        <AlertDialogDescription>
                            You need to be logged in to perform this action. Please log in or create an account to continue.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => router.push(`/signup?redirect=/stream/${streamId}`)}>Create Account</AlertDialogAction>
                        <AlertDialogAction onClick={() => router.push(`/?redirect=/stream/${streamId}`)}>Login</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                <ReportDialog onSubmit={(reason, details) => {
                    console.log("Report submitted", { reason, details });
                    toast({ title: "Report Submitted", description: "Thank you for your feedback. Our team will review this stream." });
                    setIsReportOpen(false);
                }} />
            </Dialog>

             <div className={cn("bg-background text-foreground", isMobile ? 'flex flex-col h-dvh' : 'h-screen')}>
                 {isMobile === undefined ? (
                    <div className="flex h-screen items-center justify-center">
                        <LoadingSpinner />
                    </div>
                 ) : isMobile ? (
                     <MobileLayout {...{ router, videoRef, playerRef, handlePlayPause, handleShare, handleMinimize, handleToggleFullscreen, isPaused, seller, sellerData, streamData, handleFollowToggle, isFollowingState, sellerProducts, handlers, relatedStreams, isChatOpen, setIsChatOpen, chatMessages, pinnedMessages, onClose: () => setIsChatOpen(false), handleAddToCart, handleBuyNow, mobileView, setMobileView, isMuted, setIsMuted, handleGoLive, handleSeek, isLive, formatTime, currentTime, duration, buffered, handleProgressClick, progressContainerRef, activeQuality, setActiveQuality, product, user, walletBalance, setIsSuperChatOpen, isSuperChatOpen, isPastStream, isRatingDialogOpen, setIsRatingDialogOpen, handleRateStream, userRating, toast }} />
                 ) : (
                    <DesktopLayout 
                        {...{ router, videoRef, playerRef, handlePlayPause, handleShare, handleMinimize, handleToggleFullscreen, isPaused, seller, sellerData, streamData, handleFollowToggle, isFollowingState, sellerProducts, handlers, relatedStreams, isChatOpen, setIsChatOpen, chatMessages, pinnedMessages, onClose: () => setIsChatOpen(false), handleAddToCart, handleBuyNow, mobileView, setMobileView, isMuted, setIsMuted, handleGoLive, handleSeek, isLive, formatTime, currentTime, duration, buffered, handleProgressClick, progressContainerRef, mainScrollRef, handleMainScroll, showGoToTop, scrollToTop, activeQuality, setActiveQuality, product, user, cartCount, walletBalance, setIsSuperChatOpen, isSuperChatOpen, inlineAuctionCardRefs, isPastStream, isRatingDialogOpen, setIsRatingDialogOpen, handleRateStream, userRating, toast }}
                    />
                 )}
            </div>
        </React.Fragment>
    );
};

const MemoizedStreamInfo = React.memo(StreamInfo);
const MemoizedRelatedContent = React.memo(RelatedContent);

const DesktopLayout = React.memo(({ user, handlers, chatMessages, cartCount, walletBalance, isSuperChatOpen, setIsSuperChatOpen, ...props }: any) => {
return (
<div className="flex flex-col h-screen overflow-hidden">
    <header className="p-3 flex items-center justify-between z-40 h-16 shrink-0 w-full">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => props.router.back()}>
                <ArrowLeft className="h-6 w-6" />
            </Button>
            {props.seller && (
                <div className="flex items-center gap-2 overflow-hidden">
                <Avatar className="h-8 w-8">
                <AvatarImage src={props.seller.avatarUrl} />
                <AvatarFallback>{props.seller.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="overflow-hidden">
                <h1 className="text-sm font-bold truncate">{props.seller.name}</h1>
                 <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-3 w-3"/>
                        <span>{props.sellerData?.followers ? `${props.sellerData.followers.toLocaleString()} followers` : 'Loading...'}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-amber-500">
                        <Star className="h-3 w-3 fill-current" />
                        <span>{props.seller.rating}</span>
                    </div>
                </div>
                </div>
            </div>
            )}
        </div>
        <div className="flex items-center gap-2">
            {user ? (
                <Button asChild variant="ghost">
                    <Link href="/cart" className="relative">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        My Cart
                        {cartCount > 0 && (
                            <Badge variant="destructive" className="absolute -top-1 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                                {cartCount}
                            </Badge>
                        )}
                    </Link>
                </Button>
            ) : (
                <Button asChild>
                    <Link href="/">Login / Sign Up</Link>
                </Button>
            )}
        </div>
    </header>
    <div className="flex-1 grid grid-cols-[1fr,384px] overflow-hidden">
        <main className="flex-1 overflow-y-auto no-scrollbar" ref={props.mainScrollRef} onScroll={props.handleMainScroll}>
            <div className="w-full aspect-[3/4] bg-black relative" ref={props.playerRef}>
                <video ref={props.videoRef} src={props.streamData.streamUrl || "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"} className="w-full h-full object-cover" loop />
                 <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                    <Badge variant={props.isPastStream ? 'outline' : 'destructive'} className={cn(props.isPastStream && 'bg-black/50 text-white border-white/30', "gap-1.5")}>
                        {!props.isPastStream && <div className="h-2 w-2 rounded-full bg-white animate-pulse" />}
                        {props.isPastStream ? 'RECORDED' : 'LIVE'}
                    </Badge>
                    <Badge variant="secondary" className="bg-black/50 text-white gap-1.5"><Users className="w-3 h-3"/> {props.streamData.viewerCount.toLocaleString()}</Badge>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                    <div className="w-full cursor-pointer py-1" ref={props.progressContainerRef} onClick={props.handleProgressClick}>
                        <Progress value={(props.currentTime / props.duration) * 100} valueBuffer={(props.buffered / props.duration) * 100} isLive={props.isLive} className="h-2" />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-4">
                              <Button variant="ghost" size="icon" className="w-10 h-10" onClick={props.handlePlayPause}>
                                  {props.isPaused ? <Play className="w-6 h-6 fill-current" /> : <Pause className="w-6 h-6 fill-current" />}
                              </Button>
                              <Button variant="ghost" size="icon" className="w-10 h-10" onClick={() => props.handleSeek('backward')}><Rewind className="w-5 h-5" /></Button>
                              <Button variant="ghost" size="icon" className="w-10 h-10" onClick={() => props.handleSeek('forward')}><FastForward className="w-5 h-5" /></Button>
                              {!props.isPastStream && <Button
                                variant="destructive"
                                className="gap-1.5 h-8 text-xs sm:text-sm"
                                onClick={props.handleGoLive}
                                disabled={props.isLive}
                            >
                                <div className={cn("h-2 w-2 rounded-full bg-white", !props.isLive && "animate-pulse")} />
                                {props.isLive ? 'LIVE' : 'Go Live'}
                            </Button>}
                            <Button variant="ghost" size="icon" onClick={() => props.setIsMuted((prev: any) => !prev)}>
                                {props.isMuted ? <VolumeX /> : <Volume2 />}
                            </Button>
                            <p className="text-sm font-mono">{props.formatTime(props.currentTime)} / {props.formatTime(props.duration)}</p>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                             <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon"><Settings /></Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-0" align="end">
                                    <div className="p-2">
                                        <p className="text-sm font-semibold p-2">Quality</p>
                                        <RadioGroup value={props.activeQuality} onValueChange={props.setActiveQuality}>
                                            <Label className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer text-sm">
                                                Auto <span className="text-xs text-muted-foreground">(Recommended)</span> <RadioGroupItem value="Auto" />
                                            </Label>
                                            {qualityLevels.map(level => (
                                                 <Label key={level} className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer text-sm">
                                                    {level} <RadioGroupItem value={level} />
                                                 </Label>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <Button variant="ghost" size="icon" onClick={props.handleShare}><Share2 /></Button>
                            <Button variant="ghost" size="icon" onClick={props.handleMinimize}><PictureInPicture /></Button>
                            <Button variant="ghost" size="icon" onClick={props.handleToggleFullscreen}><Maximize /></Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-6">
                <MemoizedStreamInfo {...props}/>
                <MemoizedRelatedContent {...props} />
            </div>
        </main>

        <aside className="relative h-full w-[384px] flex-shrink-0 flex flex-col overflow-hidden border-l">
            <ChatPanel
                seller={props.seller}
                chatMessages={chatMessages}
                pinnedMessages={props.pinnedMessages}
                handlers={handlers}
                onClose={() => {}}
                walletBalance={walletBalance}
                isSuperChatOpen={isSuperChatOpen}
                setIsSuperChatOpen={setIsSuperChatOpen}
                inlineAuctionCardRefs={props.inlineAuctionCardRefs}
                isPastStream={props.isPastStream}
            />
        </aside>
    </div>
</div>
)});
DesktopLayout.displayName = "DesktopLayout";

const MobileLayout = React.memo(({ handlers, chatMessages, walletBalance, isPastStream, isSuperChatOpen, setIsSuperChatOpen, ...props }: any) => {
    const { isMuted, setIsMuted, handleGoLive, isLive, formatTime, currentTime, duration, handleShare, handleToggleFullscreen, progressContainerRef, handleProgressClick, isPaused, handlePlayPause, handleSeek, handleMinimize, activeQuality, setActiveQuality } = props;
    return (
        <div className="flex flex-col h-dvh overflow-hidden relative">
            <header className="p-3 flex items-center justify-between sticky top-0 bg-transparent z-30 h-16 shrink-0 w-full">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => props.router.back()}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    {props.seller && (
                    <div className="flex items-center gap-2 overflow-hidden">
                        <Avatar className="h-8 w-8">
                        <AvatarImage src={props.seller.avatarUrl} />
                        <AvatarFallback>{props.seller.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="overflow-hidden">
                        <h1 className="text-sm font-bold truncate">{props.seller.name}</h1>
                        <p className="text-xs text-muted-foreground">{props.streamData.viewerCount.toLocaleString()} viewers</p>
                        </div>
                    </div>
                    )}
                </div>
                 <div className="flex items-center gap-0.5">
                    <Button asChild variant="ghost" size="icon">
                        <Link href="/cart">
                            <ShoppingCart className="h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </header>

            <div className="w-full aspect-[3/4] bg-black relative flex-shrink-0" ref={props.playerRef}>
                <video ref={props.videoRef} src={props.streamData.streamUrl || "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"} className="w-full h-full object-cover" loop onClick={handlePlayPause}/>
                 <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                    <Badge variant={isPastStream ? 'outline' : 'destructive'} className={cn(isPastStream && 'bg-black/50 text-white border-white/30', "gap-1.5")}>
                        {!isPastStream && <div className="h-2 w-2 rounded-full bg-white animate-pulse" />}
                        {isPastStream ? 'RECORDED' : 'LIVE'}
                    </Badge>
                    <Badge variant="secondary" className="bg-black/50 text-white gap-1.5"><Users className="w-3 w-3"/> {props.streamData.viewerCount.toLocaleString()}</Badge>
                </div>
                 <div className="absolute inset-0 bg-black/10 flex items-center justify-center gap-4">
                     <Button variant="ghost" size="icon" className="text-white w-12 h-12" onClick={() => handleSeek('backward')}><Rewind className="w-6 h-6 fill-white"/></Button>
                     <Button variant="ghost" size="icon" className="text-white w-16 h-16" onClick={handlePlayPause}>
                         {isPaused ? <Play className="w-10 h-10 fill-white" /> : <Pause className="w-10 h-10 fill-white" />}
                     </Button>
                     <Button variant="ghost" size="icon" className="text-white w-12 h-12" onClick={() => handleSeek('forward')}><FastForward className="w-6 h-6 fill-white"/></Button>
                </div>
                 <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-2 text-white">
                    <div className="w-full cursor-pointer py-1" ref={progressContainerRef} onClick={handleProgressClick}>
                        <Progress value={(currentTime / duration) * 100} valueBuffer={props.buffered / duration * 100} isLive={isLive} className="h-1.5" />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                             {!isPastStream && <Button
                                variant="destructive"
                                className="gap-1 h-7 px-2 text-xs"
                                onClick={handleGoLive}
                                disabled={isLive}
                            >
                                <div className={cn("h-1.5 w-1.5 rounded-full bg-white", !isLive && "animate-pulse")} />
                                {isLive ? 'LIVE' : 'Go Live'}
                            </Button>}
                            <p className="text-xs font-mono">{formatTime(currentTime)} / {formatTime(duration)}</p>
                        </div>
                        <div className="flex items-center gap-0.5">
                            <Button variant="ghost" size="icon" className="w-9 h-9" onClick={() => setIsMuted((prev: any) => !prev)}>
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </Button>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="w-9 h-9"><Settings className="w-5 h-5" /></Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 p-0" align="end">
                                    <div className="p-2">
                                        <p className="text-sm font-semibold p-2">Quality</p>
                                        <RadioGroup value={activeQuality} onValueChange={setActiveQuality}>
                                            <Label className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer text-sm">
                                                Auto <span className="text-xs text-muted-foreground">(Recommended)</span> <RadioGroupItem value="Auto" />
                                            </Label>
                                            {qualityLevels.map(level => (
                                                 <Label key={level} className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer text-sm">
                                                    {level} <RadioGroupItem value={level} />
                                                 </Label>
                                            ))}
                                        </RadioGroup>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <Button variant="ghost" size="icon" className="w-9 h-9" onClick={handleShare}><Share2 className="w-5 h-5" /></Button>
                            <Button variant="ghost" size="icon" className="w-9 h-9" onClick={handleMinimize}><PictureInPicture className="w-5 h-5"/></Button>
                            <Button variant="ghost" size="icon" className="w-9 h-9" onClick={handleToggleFullscreen}><Maximize className="w-5 h-5"/></Button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 overflow-hidden relative">
                {props.mobileView === 'stream' ? (
                     <ScrollArea className="h-full no-scrollbar">
                        <div className="p-4 space-y-6">
                             <MemoizedStreamInfo {...props}/>
                            <MemoizedRelatedContent {...props} />
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="h-full flex flex-col bg-background">
                        <ChatPanel {...{...props, handlers, chatMessages, walletBalance, setIsSuperChatOpen, isSuperChatOpen, inlineAuctionCardRefs: props.inlineAuctionCardRefs, isPastStream }} onClose={() => props.setMobileView('stream')} />
                    </div>
                )}
            </div>

            {props.mobileView === 'stream' && (
                <div className="fixed bottom-4 left-4 z-20">
                    <Button className="rounded-full shadow-lg h-12 px-6" onClick={() => props.setMobileView('chat')}>
                        <MessageSquare className="mr-2 h-5 w-5"/>
                        Show Chat
                    </Button>
                </div>
            )}
        </div>
    );
});
MobileLayout.displayName = "MobileLayout";

const SuperChatMessage = ({ msg }: { msg: any }) => (
    <div className="my-2 p-3 rounded-lg bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 text-black shadow-lg">
        <div className="flex items-center justify-between mb-1">
             <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7 border-2 border-white/50">
                    <AvatarImage src={msg.avatar} />
                    <AvatarFallback className="bg-yellow-500 text-black font-bold text-xs">{msg.user.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="font-bold text-sm">{msg.user}</p>
             </div>
             <p className="font-bold text-base">₹{msg.amount}</p>
        </div>
        <p className="text-sm font-medium">{renderWithHashtagsAndLinks(msg.text)}</p>
    </div>
);

const SuperChatDialog = ({ walletBalance, handlers, isSuperChatOpen, setIsSuperChatOpen }: { walletBalance?: number, handlers: any, isSuperChatOpen: boolean, setIsSuperChatOpen: (open: boolean) => void }) => {
    const [amount, setAmount] = useState(50);
    const [message, setMessage] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('wallet');

    const handleSendSuperChat = () => {
        if (!message.trim()) {
            handlers.toast({ variant: 'destructive', title: 'Message is empty' });
            return;
        }
        if (paymentMethod === 'wallet' && walletBalance !== undefined && amount > walletBalance) {
            handlers.toast({ variant: 'destructive', title: 'Insufficient Wallet Balance' });
            return;
        }
        handlers.handleNewMessageSubmit({ text: message, amount });
        handlers.toast({ title: 'Super Chat Sent!', description: `You donated ₹${amount}` });
        setIsSuperChatOpen(false);
        setMessage('');
        setAmount(50);
    };

    return (
        <Dialog open={isSuperChatOpen} onOpenChange={setIsSuperChatOpen}>
             <DialogTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="rounded-full flex-shrink-0 h-11 w-11 text-muted-foreground hover:text-foreground">
                    <DollarSign className="h-5 w-5"/>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Send a Super Chat</DialogTitle>
                    <DialogDescription>Highlight your message and support the creator!</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="text-center">
                        <p className="text-4xl font-bold">₹{amount}</p>
                    </div>
                    <Slider defaultValue={[50]} value={[amount]} max={5000} step={10} onValueChange={(value) => setAmount(value[0])} />
                    <div className="grid grid-cols-4 gap-2">
                        {[50, 100, 250, 500].map(val => (
                            <Button key={val} variant="outline" onClick={() => setAmount(val)}>₹{val}</Button>
                        ))}
                    </div>
                    <Textarea placeholder="Your highlighted message..." value={message} onChange={(e) => setMessage(e.target.value)} />
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="flex gap-4 pt-2">
                        <Label htmlFor="pay-wallet" className="flex-1 flex items-center gap-2 p-3 border rounded-md cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                            <RadioGroupItem value="wallet" id="pay-wallet" />
                            <Wallet className="w-5 h-5"/>
                            <div>
                              Wallet
                              <span className="text-xs text-muted-foreground block">Bal: ₹{typeof walletBalance === 'number' ? walletBalance.toFixed(2) : '0.00'}</span>
                            </div>
                        </Label>
                        <Label htmlFor="pay-upi" className="flex-1 flex items-center gap-2 p-3 border rounded-md cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/10">
                            <RadioGroupItem value="upi" id="pay-upi" />
                            <Image src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" width={24} height={24} /> UPI
                        </Label>
                    </RadioGroup>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="ghost">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSendSuperChat} disabled={!message.trim()}>Send Super Chat for ₹{amount}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const ChatMessage = ({ msg, handlers, seller }: { msg: any, handlers: any, seller: any }) => {
    const { user } = useAuth();
    const isMyMessage = msg.userId === user?.uid;
    
    const handleReply = () => handlers.onReply(msg);
    const handleTogglePin = () => handlers.onTogglePin(msg.id);
    const handleReport = () => handlers.onReportMessage(msg.id);
    const handleDelete = () => handlers.onDeleteMessage(msg.id);

    return (
        <div className="flex items-start gap-2 w-full group py-0.5 animate-message-in">
             <Avatar className="h-6 w-6 mt-0.5">
                <AvatarImage src={msg.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-red-500 to-yellow-500 text-white font-bold text-[10px]">
                     {msg.user ? msg.user.charAt(0) : 'S'}
                </AvatarFallback>
            </Avatar>
            <div className="flex-grow">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={cn("font-semibold text-xs break-all", msg.isSeller && "text-yellow-400")}>
                        {msg.user}:
                    </span>
                    {msg.isSeller && <Badge variant="outline" className="mr-1.5 border-yellow-400/50 text-yellow-400 h-4 text-[10px] px-1.5">Seller</Badge>}
                </div>
                 <div className="text-sm whitespace-pre-wrap break-words text-foreground/80 leading-snug">
                    {renderWithHashtagsAndLinks(msg.text)}
                 </div>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity p-1">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={handleReply}><Reply className="mr-2 h-4 w-4" />Reply</DropdownMenuItem>
                    {isMyMessage && (
                        <>
                            <DropdownMenuItem onSelect={handleTogglePin}><Pin className="mr-2 h-4 w-4" />Pin Message</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onSelect={handleDelete}><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
                        </>
                    )}
                    {!isMyMessage && <DropdownMenuItem onSelect={handleReport}><Flag className="mr-2 h-4 w-4" />Report</DropdownMenuItem>}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
};

const ChatPanel = ({
  seller,
  chatMessages,
  pinnedMessages,
  walletBalance,
  handlers,
  onClose,
  isPastStream,
  isSuperChatOpen,
  setIsSuperChatOpen,
}: {
  seller: any;
  chatMessages: any[];
  pinnedMessages: any[];
  activeAuction: any;
  auctionTime: number | null;
  highestBid: number;
  totalBids: number;
  walletBalance: number;
  handlers: any;
  inlineAuctionCardRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  onClose: () => void;
  isPastStream: boolean;
  isSuperChatOpen: boolean;
  setIsSuperChatOpen: (open: boolean) => void;
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ name: string; id: string } | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleAutoScroll = useCallback((behavior: 'smooth' | 'auto' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  const handleManualScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isScrolledUp = target.scrollHeight - target.scrollTop > target.clientHeight + 200;
    setShowScrollToBottom(isScrolledUp);
  };
  
  useEffect(() => {
    handleAutoScroll('auto');
  }, [chatMessages, handleAutoScroll]);

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const handleNewMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    let messageToSend = newMessage;
    if (replyingTo) {
      messageToSend = `@${replyingTo.name.split(' ')[0]} ${newMessage}`;
    }

    handlers.handleNewMessageSubmit({ text: messageToSend });

    setNewMessage("");
    setReplyingTo(null);
  };
  
  const handleReply = (msg: any) => {
    setReplyingTo({ name: msg.user, id: msg.userId });
    textareaRef.current?.focus();
  }

  return (
    <div className='h-full flex flex-col bg-background'>
      <header className="p-3 flex items-center justify-between z-10 flex-shrink-0 h-16 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm">
        <h3 className="font-bold text-lg text-foreground">
            {isPastStream ? 'Chat Replay' : 'Live Chat'}
        </h3>
        <div className="flex items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 relative text-muted-foreground hover:text-foreground">
                <Pin className="h-5 w-5" />
                {pinnedMessages && pinnedMessages.length > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />}
              </Button>
            </PopoverTrigger>
             <PopoverContent align="end" className="w-80 bg-background border-border text-foreground p-0">
                <div className="p-3 border-b">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Pin className="h-4 w-4" /> Pinned Items
                    </h4>
                </div>
                 <ScrollArea className="h-80">
                     <div className="p-3 space-y-3">
                        {pinnedMessages && pinnedMessages.length > 0 ? (
                            pinnedMessages.map((item) => (
                                <div key={item.id} className="text-xs p-2 rounded-md bg-muted">
                                    {item.type === 'message' && (
                                        <>
                                            <p className="font-bold text-primary">{item.user}</p>
                                            <p>{item.text}</p>
                                        </>
                                    )}
                                    {item.type === 'offer' && (
                                        <>
                                            <p className="font-bold text-primary">{item.title}</p>
                                            <p>{item.description}</p>
                                        </>
                                    )}
                                    {item.type === 'product' && (
                                        <div className="flex items-center gap-2">
                                            <Image src={item.product.images[0]} alt={item.product.name} width={40} height={40} className="rounded-md" />
                                            <div>
                                                <p className="font-semibold">{item.product.name}</p>
                                                <p className="font-bold text-primary">{item.product.price}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground text-xs py-4">Pinned items will appear here.</p>
                        )}
                    </div>
                 </ScrollArea>
            </PopoverContent>
          </Popover>
          <DropdownMenu>
             <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <MoreVertical className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                 <DropdownMenuItem onSelect={handlers.onReportStream}>
                    <Flag className="mr-2 h-4 w-4" /> Report Stream
                </DropdownMenuItem>
                <FeedbackDialog>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <MessageCircle className="mr-2 h-4 w-4" />Feedback
                    </DropdownMenuItem>
                </FeedbackDialog>
                <DropdownMenuItem>
                    <LifeBuoy className="mr-2 h-4 w-4" />Help
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <ScrollArea className="flex-grow" ref={chatContainerRef} onScroll={handleManualScroll}>
          <div className="p-3 space-y-2.5">
             {chatMessages.map((msg) => {
                  if (msg.type === 'system') {
                      return <div key={msg.id} className="text-xs text-center text-muted-foreground italic py-1">{msg.text}</div>
                  }
                  if (msg.type === 'product_promo') {
                    return <ProductPromoCard key={msg.id} msg={msg} handlers={handlers} />
                  }
                  if (msg.type === 'post_share') {
                    return <PostShareCard key={msg.id} msg={msg} handlers={handlers} />
                  }
                  if (msg.type === 'super_chat') {
                      return <SuperChatMessage key={msg.id} msg={msg} />;
                  }
                  if (!msg.user) return null;

                  return (
                     <ChatMessage key={msg.id} msg={msg} handlers={{...handlers, onReply: handleReply}} seller={seller} />
                  )
              })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        {showScrollToBottom && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full shadow-lg"
              onClick={() => handleAutoScroll()}
            >
              Jump to latest
            </Button>
          </div>
        )}
      {!isPastStream && <footer className="p-3 bg-transparent flex-shrink-0">
          {replyingTo && (
            <div className="text-xs text-muted-foreground mb-1 px-3 flex justify-between items-center">
              <span>Replying to <span className="text-primary font-semibold">@{replyingTo.name}</span></span>
              <button onClick={() => setReplyingTo(null)} className="p-1 rounded-full hover:bg-muted">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <form onSubmit={handleNewMessageSubmit} className="flex items-center gap-2">
             <div className="relative flex-grow">
                 <Textarea
                    ref={textareaRef}
                    placeholder="Send a message..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={1}
                    className='flex-grow resize-none max-h-24 px-4 pr-12 py-3 min-h-11 rounded-full bg-muted text-foreground placeholder:text-muted-foreground border-transparent focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-primary/30'
                />
                <Popover>
                    <PopoverTrigger asChild>
                         <Button variant="ghost" size="icon" type="button" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-muted-foreground hover:text-foreground">
                            <Smile className="h-5 w-5" />
                        </Button>
                    </PopoverTrigger>
                     <PopoverContent className="w-80 h-64 mb-2">
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
             <SuperChatDialog walletBalance={walletBalance} handlers={handlers} isSuperChatOpen={isSuperChatOpen} setIsSuperChatOpen={setIsSuperChatOpen} />
             <Button type="submit" size="icon" disabled={!newMessage.trim()} className="rounded-full flex-shrink-0 h-11 w-11 bg-primary hover:bg-primary/90 active:scale-105 transition-transform">
                <Send className="h-5 w-5" />
            </Button>
          </form>
        </footer>}
    </div>
  );
};

export default StreamPage;
