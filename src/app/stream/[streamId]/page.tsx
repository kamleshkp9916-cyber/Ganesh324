

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
  Reddit,
  ArrowUp,
  GripHorizontal,
  Package,
  Reply,
  Check,
  FileEdit,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from 'next/image';
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
import { Sparkles } from 'lucide-react';


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

const productToSellerMapping: { [key: string]: { name: string; avatarUrl: string, uid: string } } = {
    'prod_1': { name: 'FashionFinds', avatarUrl: 'https://placehold.co/80x80.png', uid: '1' },
    'prod_2': { name: 'GadgetGuru', avatarUrl: 'https://placehold.co/80x80.png', uid: '2' },
    'prod_3': { name: 'HomeHaven', avatarUrl: 'https://placehold.co/80x80.png', uid: '3' },
    'prod_4': { name: 'BeautyBox', avatarUrl: 'https://placehold.co/80x80.png', uid: '4' },
    'prod_5': { name: 'KitchenWiz', avatarUrl: 'https://placehold.co/80x80.png', uid: '5' },
    'prod_6': { name: 'FitFlow', avatarUrl: 'https://placehold.co/80x80.png', uid: '6' },
    'prod_7': { name: 'ArtisanAlley', avatarUrl: 'https://placehold.co/80x80.png', uid: '7' },
    'prod_8': { name: 'PetPalace', avatarUrl: 'https://placehold.co/80x80.png', uid: '8' },
    'prod_9': { name: 'BookNook', avatarUrl: 'https://placehold.co/80x80.png', uid: '9' },
    'prod_10': { name: 'GamerGuild', avatarUrl: 'https://placehold.co/80x80.png', uid: '10' },
};

const mockChatMessages: any[] = [
    { id: 1, user: 'Ganesh', text: 'This looks amazing! 🔥 #newpurchase', avatar: 'https://placehold.co/40x40.png', userId: 'user1' },
    { id: 2, user: 'Alex', text: 'What is the material?', avatar: 'https://placehold.co/40x40.png', userId: 'user2' },
    { id: 3, user: 'Jane', text: 'I just bought one! So excited. 🤩 #newpurchase', avatar: 'https://placehold.co/40x40.png', userId: 'user3' },
    { id: 4, type: 'system', text: 'Chris joined the stream.' },
    { id: 5, user: 'FashionFinds', text: "Hey Alex, it's 100% genuine leather!", avatar: 'https://placehold.co/40x40.png', isSeller: true, userId: '1' },
    { id: 6, type: 'system', text: 'Maria purchased a Vintage Camera.' },
    { id: 7, user: 'David', text: 'Do you ship to the US?', avatar: 'https://placehold.co/40x40.png', userId: 'user4' },
    { id: 8, user: 'FashionFinds', text: 'Yes David, we offer international shipping!', avatar: 'https://placehold.co/40x40.png', isSeller: true, userId: '1' },
    { id: 9, user: 'Sarah', text: 'This is my first time here, loving the vibe!', avatar: 'https://placehold.co/40x40.png', userId: 'user5' },
    { id: 10, type: 'auction', productId: 'prod_1', active: false, initialTime: 0 },
    { id: 11, user: 'Mike', text: 'BID ₹8,500', avatar: 'https://placehold.co/40x40.png', userId: 'user6', isBid: true },
    { id: 12, user: 'Laura', text: 'BID ₹9,000', avatar: 'https://placehold.co/40x40.png', userId: 'user7', isBid: true },
    { id: 13, user: 'FashionFinds', text: 'Laura with a bid of ₹9,000! Going once...', avatar: 'https://placehold.co/40x40.png', isSeller: true, userId: '1' },
    { id: 14, user: 'Emily', text: 'How long does the battery last on the light meter?', avatar: 'https://placehold.co/40x40.png', userId: 'user8' },
    { id: 15, type: 'auction', productId: 'prod_4', active: true, initialTime: 30 },
    { id: 99, type: 'product_pin', productId: 'prod_2', text: 'Special offer on these headphones!' },
    { id: 16, user: 'FashionFinds', text: '@Emily It lasts for about a year with average use!', avatar: 'https://placehold.co/40x40.png', isSeller: true, userId: '1' },
    { id: 17, type: 'system', text: 'Robert purchased Wireless Headphones.' },
    { id: 18, user: 'Ganesh', text: 'Can you show the back of the camera?', avatar: 'https://placehold.co/40x40.png', userId: 'user1' },
    { id: 19, user: 'FashionFinds', text: 'Sure thing, Ganesh! Here is a view of the back.', avatar: 'https://placehold.co/40x40.png', isSeller: true, userId: '1' },
    { id: 20, user: 'Chloe', text: 'Just tuned in, what did I miss?', avatar: 'https://placehold.co/40x40.png', userId: 'user9' },
    { id: 21, user: 'FashionFinds', text: 'Welcome Chloe! We just finished an auction, but we have more exciting products coming up. Stick around!', avatar: 'https://placehold.co/40x40.png', isSeller: true, userId: '1' },
    { id: 22, user: 'Oliver', text: 'Is this real leather?', avatar: 'https://placehold.co/40x40.png?text=O', userId: 'user10' },
    { id: 23, user: 'Mia', text: 'Just followed! Love your stuff.', avatar: 'https://placehold.co/40x40.png?text=M', userId: 'user11' },
    { id: 24, user: 'Liam', text: 'How much is shipping?', avatar: 'https://placehold.co/40x40.png?text=L', userId: 'user12' },
    { id: 25, type: 'system', text: 'Emma purchased a Smart Watch.' },
    { id: 26, user: 'FashionFinds', text: '@Liam shipping is a flat rate of ₹50 anywhere in India!', avatar: 'https://placehold.co/40x40.png', isSeller: true, userId: '1' },
    { id: 27, user: 'Ava', text: 'Can you show a close-up of the stitching?', avatar: 'https://placehold.co/40x40.png?text=A', userId: 'user13' },
    { id: 28, user: 'Noah', text: 'BID ₹9,100', avatar: 'https://placehold.co/40x40.png?text=N', userId: 'user14', isBid: true },
    { id: 29, user: 'Noah', text: 'BID ₹9,600', avatar: 'https://placehold.co/40x40.png?text=N', userId: 'user14', isBid: true },
    { id: 30, user: 'Sophia', text: 'Great stream! Thanks!', avatar: 'https://placehold.co/40x40.png?text=S', userId: 'user15' },
    { id: 31, user: 'FashionFinds', text: "This is an example of a seller's message in the chat.", avatar: 'https://placehold.co/40x40.png', isSeller: true, userId: '1' },
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

const ProductShelfContent = ({ sellerProducts, handleAddToCart, handleBuyNow, isMobile, onClose, toast }: { sellerProducts: any[], handleAddToCart: (product: any) => void, handleBuyNow: (product: any) => void, isMobile: boolean, onClose: () => void, toast: any }) => {
    return (
        <>
            {isMobile && (
                <SheetHeader className="p-4 border-b">
                    <SheetTitle>Products in this Stream</SheetTitle>
                </SheetHeader>
            )}
             <ScrollArea className={cn("h-full", isMobile && "no-scrollbar")}>
                <div className={cn("p-4", isMobile ? "grid grid-cols-2 gap-4" : "flex gap-4")}>
                    {sellerProducts.length > 0 ? (
                        sellerProducts.map((product: any, index: number) => (
                            <Card key={index} className="w-full overflow-hidden h-full flex flex-col flex-shrink-0 first:ml-0.5 last:mr-0.5" style={{width: isMobile ? 'auto': '160px'}}>
                                <Link href={`/product/${product.key}`} className="group block">
                                    <div className="relative aspect-square bg-muted">
                                        <Image
                                            src={product.images[0]?.preview || product.images[0]}
                                            alt={product.name}
                                            fill
                                            sizes="50vw"
                                            className="object-cover transition-transform group-hover:scale-105"
                                        />
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
                                            <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => { handleAddToCart(product); onClose(); }}><ShoppingCart className="mr-1 h-3 w-3" /> Cart</Button>
                                            <Button size="sm" className="w-full text-xs h-8" onClick={() => { handleBuyNow(product); onClose(); }}>Buy Now</Button>
                                        </>
                                    ) : (
                                        <Button size="sm" className="w-full text-xs h-8" onClick={() => { toast({ title: "We'll let you know!", description: `You will be notified when ${product.name} is back in stock.`}); onClose(); }}>Notify Me</Button>
                                    )}
                                </CardFooter>
                            </Card>
                        ))
                    ) : (
                        <div className="col-span-full text-center text-muted-foreground py-10 w-full">No products to show.</div>
                    )}
                </div>
            </ScrollArea>
        </>
    );
};

const ProductShelf = ({ sellerProducts, handleAddToCart, handleBuyNow, toast }: { sellerProducts: any[], handleAddToCart: (product: any) => void, handleBuyNow: (product: any) => void, toast: any }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isMobile = useIsMobile();
    
    if (isMobile) {
        return (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                     <Button variant="outline" className="w-full justify-center">
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 sm:mr-1" />
                            <span>Products ({sellerProducts.length})</span>
                        </div>
                    </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[80vh] flex flex-col p-0">
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
                <Button variant="outline" className="w-full justify-center">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 sm:mr-1" />
                        <span>Products ({sellerProducts.length})</span>
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
                                            <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => { handleAddToCart(product); }}><ShoppingCart className="mr-1 h-3 w-3" /> Cart</Button>
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

const ProductPromoCard = ({ msg, handlers }: { msg: any, handlers: any }) => {
    const { product } = msg;

    return (
         <Card className="overflow-hidden bg-card/80 border-primary/20 p-0 animate-in fade-in-0 slide-in-from-bottom-2">
            <div className="relative aspect-video">
                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0" />
                 <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="bg-gradient-to-r from-primary to-purple-500 text-white border-transparent shadow-lg">
                        <Sparkles className="w-3 h-3 mr-1.5"/>Featured Product
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
    )
}


export default function StreamPage() {
    const router = useRouter();
    const params = useParams();
    const streamId = params.streamId as string;
    const { user } = useAuth();
    const { toast } = useToast();
    const { minimizedStream, minimizeStream, closeMinimizedStream, isMinimized } = useMiniPlayer();
    const [isLoading, setIsLoading] = useState(true);
    const [walletBalance, setWalletBalance] = useState(42580.22);
    const [bidAmount, setBidAmount] = useState<number | string>("");
    const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [bankAccounts, setBankAccounts] = useState([
        { id: 1, bankName: 'HDFC Bank', accountNumber: 'XXXX-XXXX-XX12-3456' },
    ]);
    const [pinnedMessages, setPinnedMessages] = useState<any[]>([]);
    const [isFollowingState, setIsFollowingState] = useState(false);
    
    const [chatMessages, setChatMessages] = useState(mockChatMessages);
    const [auctionTime, setAuctionTime] = useState<number | null>(null);
    const [highestBid, setHighestBid] = useState<number>(9600);
    const [totalBids, setTotalBids] = useState<number>(4);
    
    const [activeAuction, setActiveAuction] = useState<any | null>(null);
    const [isBidDialogOpen, setIsBidDialogOpen] = useState(false);
    const [isBidHistoryOpen, setIsBidHistoryOpen] = useState(false);
    const isMobile = useIsMobile();
    
    const { ref: auctionCardRef, inView: auctionCardInView } = useInView({ threshold: 0.99 });
    
    const seller = useMemo(() => liveSellers.find(s => s.id === streamId), [streamId]);
    const showPinnedAuction = !auctionCardInView && activeAuction && seller?.hasAuction;
    
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
    const progressContainerRef = useRef<HTMLDivElement>(null);
    const inlineAuctionCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
    
    const [isPaused, setIsPaused] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [skipInterval, setSkipInterval] = useState(10);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isLive, setIsLive] = useState(isMobile ? false : true);
    const mainScrollRef = useRef<HTMLDivElement>(null);
    const [hydrated, setHydrated] = useState(false);
    const [showGoToTop, setShowGoToTop] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [mobileView, setMobileView] = useState<'stream' | 'chat'>('stream');
    const [activeQuality, setActiveQuality] = useState('Auto');


    useEffect(() => {
        setHydrated(true);
        if (minimizedStream && minimizedStream.id !== streamId) {
            closeMinimizedStream();
        }
    }, [minimizedStream, streamId, closeMinimizedStream]);

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
        if (!seller) return;
        
        let liveStreamData: any = {};
        if (typeof window !== 'undefined') {
            const storedData = localStorage.getItem('liveStream');
            if (storedData) {
                liveStreamData = JSON.parse(storedData);
            }
        }

        const intervalSeconds = liveStreamData?.promotionInterval || 300; // 5 minutes default

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

        }, intervalSeconds * 1000);
    
        return () => clearInterval(interval);
    }, [seller]);
    
    const relatedStreams = useMemo(() => {
        if (!seller) return [];
        let streams = liveSellers.filter(
            s => s.category === seller.category && s.id !== seller.id
        );
        if (streams.length > 50) {
            return streams.slice(0, 51);
        }
        // Fallback to show some streams if none match the category, excluding the current one
        const fallbackStreams = liveSellers.filter(s => s.id !== seller.id);
        
        // Add from fallback until we have 6 total, avoiding duplicates
        let i = 0;
        while(streams.length < 6 && i < fallbackStreams.length) {
            if (!streams.some(s => s.id === fallbackStreams[i].id)) {
                streams.push(fallbackStreams[i]);
            }
            i++;
        }
        return streams.slice(0,51);
    }, [seller]);
    
    const formatTime = (timeInSeconds: number) => {
        if (isNaN(timeInSeconds) || timeInSeconds < 0) return '00:00';
        const date = new Date(0);
        date.setSeconds(timeInSeconds);
        const timeString = date.toISOString().substr(11, 8);
        return timeString.startsWith('00:') ? timeString.substr(3) : timeString;
    };
    
   useEffect(() => {
        const currentActiveAuction = chatMessages.find(msg => msg.type === 'auction' && msg.active);

        if (currentActiveAuction && (!activeAuction || activeAuction.id !== currentActiveAuction.id)) {
            setActiveAuction(currentActiveAuction);
            setAuctionTime(currentActiveAuction.initialTime);
        } else if (activeAuction && !chatMessages.some(msg => msg.type === 'auction' && msg.id === activeAuction.id && msg.active)) {
             const auctionEndedMessageExists = chatMessages.some(msg => msg.type === 'auction_end' && msg.auctionId === activeAuction.id);
            if (!auctionEndedMessageExists && seller?.hasAuction) {
                 const winningBid = [...chatMessages].reverse().find(m => m.isBid);
                const winnerMessage = {
                    id: Date.now(),
                    type: 'auction_end',
                    auctionId: activeAuction.id,
                    winner: winningBid ? winningBid.user : "No one",
                    winnerAvatar: winningBid ? winningBid.avatar : null,
                    winningBid: winningBid ? winningBid.text.replace('BID ', '') : 'No bids',
                    productName: productDetails[activeAuction.productId as keyof typeof productDetails].name,
                };
                setChatMessages(prev => [...prev, winnerMessage]);
            }
            setActiveAuction(null);
        }
    }, [chatMessages, activeAuction, seller?.hasAuction]);
    
    useEffect(() => {
        let timer: NodeJS.Timeout | undefined;
        if (auctionTime !== null && auctionTime > 0 && activeAuction?.active) {
            timer = setInterval(() => {
                setAuctionTime(prev => {
                    if (prev === null || prev <= 1) {
                        clearInterval(timer!);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (auctionTime === 0 && activeAuction?.active) {
            setChatMessages(prev => prev.map(msg => msg.id === activeAuction.id ? { ...msg, active: false } : msg));
        }
        return () => { if (timer) clearInterval(timer) };
    }, [auctionTime, activeAuction]);

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
            video.currentTime = duration;
            setIsLive(true);
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
                const isCurrentlyLive = (video.duration - video.currentTime) < 2;
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
    }, [duration, isLive, isMuted, isMinimized, streamId]);
    
    const handleToggleFullscreen = () => {
        const elem = playerRef.current;
        if (!elem) return;
    
        if (!document.fullscreenElement) {
            elem.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${'\\`'}${err.message}${'\\`'} (${'\\`'}${err.name}${'\\`'})`);
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

    const handleReportMessage = (messageId: number) => {
        toast({
            title: "Message Reported",
            description: "The message has been reported and will be reviewed by our moderation team.",
        });
    };
    
    const handleAddToCart = (product: any) => {
      if (product) {
        addToCart({ ...product, quantity: 1 });
        toast({
          title: "Added to Cart!",
          description: `'${product.name}' has been added to your shopping cart.`,
        });
      }
    };
    const handleBuyNow = (product: any) => {
      if (product) {
        router.push(`/cart?buyNow=true&productId=${product.key}`);
      }
    };

    const handleWithdraw = (amount: number, bankAccountId: string) => {
        const selectedAccount = bankAccounts.find(acc => String(acc.id) === bankAccountId);
        const cashAvailable = walletBalance - 2640; // Mock blocked margin
        if (amount > cashAvailable) {
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
    
    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({
            title: "Stream Link Copied!",
            description: "The link to this stream has been copied to your clipboard.",
        });
    };

     const handleTogglePinMessage = (msgId: number) => {
        const msg = chatMessages.find(m => m.id === msgId);
        if (!msg) return;

        const isProductPin = msg.type === 'product_pin';
        const isOfferPin = msg.type === 'offer_pin';

        let itemToPin:any = {};

        if (isProductPin) {
             itemToPin = { 
                id: msg.id, 
                type: 'product',
                product: productDetails['prod_1']
            };
        } else if (isOfferPin) {
             itemToPin = { 
                id: msg.id,
                type: 'offer',
                title: '🎉 Special Offer!',
                description: 'Use code LIVE10 for 10% off your entire order.'
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
    };
    
    const handlePlaceBid = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!activeAuction) return;

        const bidValue = Number(bidAmount);
        if (bidValue <= highestBid) {
            toast({ variant: 'destructive', title: 'Invalid Bid', description: `Your bid must be higher than the current bid of ₹${highestBid.toLocaleString()}.` });
            return;
        }
        if (bidValue > walletBalance) {
            toast({ variant: 'destructive', title: 'Insufficient Funds', description: 'Your bid exceeds your wallet balance.' });
            return;
        }

        const newMsg: any = {
            id: Date.now(),
            user: user?.displayName?.split(' ')[0] || 'You',
            userId: user?.uid,
            text: `BID ₹${bidValue.toLocaleString()}`,
            avatar: user?.photoURL || 'https://placehold.co/40x40.png',
            isBid: true,
        };

        setChatMessages(prev => [...prev, newMsg]);
        setHighestBid(bidValue);
        setTotalBids(prev => prev + 1);
        setWalletBalance(prev => prev - bidValue);
        setBidAmount("");
        setIsBidDialogOpen(false);
        
        toast({ title: 'Bid Placed!', description: `Your bid of ₹${bidValue.toLocaleString()} has been placed.` });
    };
    
    const handleFollowToggle = async (sellerId: string) => {
        if (!user) return; // Or prompt to login
        await toggleFollow(user.uid, sellerId);
        setIsFollowingState(prev => !prev);
        toast({
            title: isFollowingState ? 'Unfollowed' : 'Followed',
            description: `You are now ${isFollowingState ? 'no longer following' : 'following'} ${seller?.name}.`
        });
    };

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
    
    const handlers = {
        onReply: (msg: any) => {
            console.log("Replying to", msg);
        },
        onTogglePin: handleTogglePinMessage,
        onReportMessage: handleReportMessage,
        onReportStream: () => setIsReportOpen(true),
        onAddToCart: handleAddToCart,
        onBuyNow: handleBuyNow,
        onBid: () => setIsBidDialogOpen(true),
        onViewBids: (e: React.MouseEvent) => { e.stopPropagation(); setIsBidHistoryOpen(true); },
        toast,
    };

    const scrollToAuction = (auctionId: string) => {
        inlineAuctionCardRefs.current[auctionId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    if (isMinimized(streamId)) {
        return (
            <div className="flex h-screen items-center justify-center bg-black">
                <div className="text-center text-white">
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
                    <Skeleton className="w-full aspect-video" />
                    <div className="p-4 space-y-3">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                    </div>
                </div>
            </div>
        );
    }
    
    const renderWithHashtags = (text: string) => {
        if (!text) return text;
        const parts = text.split(/(#\w+)/g);
        return parts.map((part, index) => {
            if (part.startsWith('#')) {
                return <Link key={index} href={`/feed?filter=${part.substring(1)}`} className="text-primary hover:underline">{part}</Link>;
            }
            return part;
        });
    };
    
    return (
        <React.Fragment>
            <Dialog open={isBidDialogOpen} onOpenChange={setIsBidDialogOpen}>
                {/* Bid Dialog Content */}
            </Dialog>
            <Dialog open={isBidHistoryOpen} onOpenChange={setIsBidHistoryOpen}>
                {/* Bid History Content */}
            </Dialog>
             <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                <ReportDialog onSubmit={(reason, details) => {
                    console.log("Report submitted", { reason, details });
                    toast({ title: "Report Submitted", description: "Thank you for your feedback. Our team will review this stream." });
                    setIsReportOpen(false);
                }} />
            </Dialog>
            
             <div className={cn("bg-black text-foreground", isMobile ? 'flex flex-col h-dvh' : 'h-screen')}>
                 {isMobile === undefined ? (
                    <div className="flex h-screen items-center justify-center">
                        <LoadingSpinner />
                    </div>
                 ) : isMobile ? (
                     <MobileLayout {...{ router, videoRef, playerRef, handlePlayPause, handleShare, handleMinimize, handleToggleFullscreen, isPaused, seller, streamData, handleFollowToggle, isFollowingState, sellerProducts, handlers, relatedStreams, isChatOpen, setIsChatOpen, renderWithHashtags, chatMessages, pinnedMessages, activeAuction, auctionTime, highestBid, totalBids, walletBalance, inlineAuctionCardRefs, onClose: () => setIsChatOpen(false), handleAddToCart, handleBuyNow, mobileView, setMobileView, isMuted, setIsMuted, handleGoLive, handleSeek, isLive, formatTime, currentTime, duration, buffered, handleProgressClick, progressContainerRef, activeQuality, setActiveQuality }} />
                 ) : (
                    <DesktopLayout 
                        {...{ router, videoRef, playerRef, handlePlayPause, handleShare, handleMinimize, handleToggleFullscreen, isPaused, seller, streamData, handleFollowToggle, isFollowingState, sellerProducts, handlers, relatedStreams, isChatOpen, setIsChatOpen, renderWithHashtags, chatMessages, pinnedMessages, activeAuction, auctionTime, highestBid, totalBids, walletBalance, inlineAuctionCardRefs, onClose: () => setIsChatOpen(false), handleAddToCart, handleBuyNow, mobileView, setMobileView, isMuted, setIsMuted, handleGoLive, handleSeek, isLive, formatTime, currentTime, duration, buffered, handleProgressClick, progressContainerRef, mainScrollRef, handleMainScroll, showGoToTop, scrollToTop, activeQuality, setActiveQuality }}
                    />
                 )}
            </div>
        </React.Fragment>
    );
}

const DesktopLayout = (props: any) => (
<div className="flex flex-col h-screen overflow-hidden">
    <header className="p-3 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b h-16 shrink-0 w-full">
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
        <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
                <Link href="/cart">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    My Cart
                </Link>
            </Button>
        </div>
    </header>
    <div className="flex-1 grid grid-cols-[1fr,384px] overflow-hidden">
        <main className="flex-1 overflow-y-auto no-scrollbar" ref={props.mainScrollRef} onScroll={props.handleMainScroll}>
            <div className="w-full aspect-video bg-black relative" ref={props.playerRef}>
                <video ref={props.videoRef} src={props.streamData.streamUrl || "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"} className="w-full h-full object-cover" loop />
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
                              <Button
                                variant="destructive"
                                className="gap-1.5 h-8 text-xs sm:text-sm"
                                onClick={props.handleGoLive}
                                disabled={props.isLive}
                            >
                                <div className={cn("h-2 w-2 rounded-full bg-white", !props.isLive && "animate-pulse")} />
                                {props.isLive ? 'LIVE' : 'Go Live'}
                            </Button>
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
                <StreamInfo {...props}/>
                <RelatedContent {...props} />
            </div>
        </main>

        <aside className="relative h-full w-[384px] flex-shrink-0 flex flex-col bg-card overflow-hidden border-l">
            <ChatPanel
                seller={props.seller}
                chatMessages={props.chatMessages}
                pinnedMessages={props.pinnedMessages}
                activeAuction={props.activeAuction}
                auctionTime={props.auctionTime}
                highestBid={props.highestBid}
                totalBids={props.totalBids}
                walletBalance={props.walletBalance}
                handlers={props.handlers}
                inlineAuctionCardRefs={props.inlineAuctionCardRefs}
                onClose={() => {}}
            />
        </aside>
    </div>
</div>
);

const MobileLayout = (props: any) => {
    const { isMuted, setIsMuted, handleGoLive, isLive, formatTime, currentTime, duration, handleShare, handleToggleFullscreen, progressContainerRef, handleProgressClick, isPaused, handlePlayPause, handleSeek, handleMinimize, activeQuality, setActiveQuality } = props;
    return (
        <div className="flex flex-col h-dvh overflow-hidden relative">
            <header className="p-3 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b h-16 shrink-0 w-full">
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

            <div className="w-full aspect-video bg-black relative flex-shrink-0" ref={props.playerRef}>
                <video ref={props.videoRef} src={props.streamData.streamUrl || "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"} className="w-full h-full object-cover" loop onClick={handlePlayPause}/>
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
                             <Button
                                variant="destructive"
                                className="gap-1 h-7 px-2 text-xs"
                                onClick={handleGoLive}
                                disabled={isLive}
                            >
                                <div className={cn("h-1.5 w-1.5 rounded-full bg-white", !isLive && "animate-pulse")} />
                                {isLive ? 'LIVE' : 'Go Live'}
                            </Button>
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
                             <StreamInfo {...props}/>
                            <RelatedContent {...props}/>
                        </div>
                    </ScrollArea>
                ) : (
                    <div className="h-full flex flex-col bg-background">
                        <ChatPanel {...props} onClose={() => props.setMobileView('stream')} />
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
};

const StreamInfo = (props: any) => {
    const { seller, streamData, handleFollowToggle, isFollowingState, renderWithHashtags } = props;
    
    return (
        <div className="space-y-4">
             <div className="mb-4">
                <h2 className="font-bold text-lg">Topic</h2>
                <div className="text-sm text-muted-foreground mt-1 space-y-4">
                    <p>{renderWithHashtags(streamData.description || "Welcome to the live stream!")}</p>
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
                        {seller.hasAuction && (
                            <Badge variant="info">
                                <Gavel className="mr-1 h-3 w-3" />
                                Auction
                            </Badge>
                        )}
                    </div>
                </Link>
                  <Button
                    onClick={() => seller && handleFollowToggle(seller.id)}
                    variant={isFollowingState ? "outline" : "default"}
                    className="flex-shrink-0"
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    {isFollowingState ? "Following" : "Follow"}
                </Button>
            </div>
            
            <ProductShelf {...props} />
        </div>
    );
};

const RelatedContent = ({ relatedStreams }: { relatedStreams: any[] }) => (
     <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
        <h4 className="font-semibold">Related Streams</h4>
        <Button asChild variant="link" size="sm" className="text-xs">
            <Link href="/live-selling">More</Link>
        </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-4 gap-2 sm:gap-4">
            {relatedStreams.map((s: any) => (
                <Link href={`/stream/${s.id}`} key={s.id} className="group">
                    <div className="relative rounded-lg overflow-hidden aspect-[16/9] bg-muted">
                        <div className="absolute top-2 left-2 z-10"><Badge variant="destructive">LIVE</Badge></div>
                        <div className="absolute top-2 right-2 z-10"><Badge variant="secondary" className="bg-background/60 backdrop-blur-sm"><Users className="w-3 h-3 mr-1.5" />{s.viewers.toLocaleString()}</Badge></div>
                    </div>
                    <div className="flex items-start gap-2 mt-2">
                        <Avatar className="w-7 h-7">
                            <AvatarImage src={s.avatarUrl} alt={s.name} />
                            <AvatarFallback>{s.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 overflow-hidden">
                            <div className="flex items-center gap-1.5">
                                <p className="font-semibold text-xs group-hover:underline truncate">{s.name}</p>
                                {s.hasAuction && (
                                    <Badge variant="info" className="text-xs font-bold px-1.5 py-0">
                                        Auction
                                    </Badge>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground">{s.category}</p>
                            <p className="text-xs text-primary font-semibold mt-0.5">#{s.category.toLowerCase().replace(/\s+/g, '')}</p>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    </div>
);


const ChatPanel = ({
  seller,
  chatMessages,
  pinnedMessages,
  activeAuction,
  auctionTime,
  highestBid,
  totalBids,
  walletBalance,
  handlers,
  inlineAuctionCardRefs,
  onClose,
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
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ name: string; id: string } | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {user} = useAuth();
  
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

    handlers.onSendMessage(messageToSend);
    setNewMessage("");
    setReplyingTo(null);
  };
  
  const handleReply = (msg: any) => {
    setReplyingTo({ name: msg.user, id: msg.userId });
    textareaRef.current?.focus();
  }

  return (
    <div className='h-full flex flex-col bg-[#0b0b0c]'>
      <header className="p-3 flex items-center justify-between z-10 flex-shrink-0 h-16 border-b border-[rgba(255,255,255,0.04)] sticky top-0 bg-[#0f1113]/80 backdrop-blur-sm">
        <h3 className="font-bold text-lg text-white">Live Chat</h3>
        <div className="flex items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 relative text-muted-foreground hover:text-white">
                <Pin className="h-5 w-5" />
                {pinnedMessages && pinnedMessages.length > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />}
              </Button>
            </PopoverTrigger>
             <PopoverContent align="end" className="w-80 bg-[#141516] border-gray-800 text-white p-0">
                <div className="p-3 border-b border-gray-700">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                        <Pin className="h-4 w-4" /> Pinned Items
                    </h4>
                </div>
                 <ScrollArea className="h-80">
                     <div className="p-3 space-y-3">
                        {pinnedMessages && pinnedMessages.length > 0 ? (
                            pinnedMessages.map((item) => (
                                <div key={item.id} className="text-xs p-2 rounded-md bg-white/5">
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
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
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
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <ScrollArea className="flex-grow" ref={chatContainerRef} onScroll={handleManualScroll}>
          <div className="p-3 space-y-3">
             {chatMessages.map((msg) => {
                  if (msg.type === 'system') {
                      return <div key={msg.id} className="text-xs text-center text-[#9AA1A6] italic py-1">{msg.text}</div>
                  }
                  if (msg.type === 'product_promo') {
                    return <div key={msg.id} className="p-1.5"><ProductPromoCard msg={msg} handlers={handlers} /></div>;
                  }
                  if (!msg.user) return null;

                  const isSellerMessage = msg.userId === seller?.id;
                  
                  return (
                     <div key={msg.id} className="flex items-start gap-2 w-full group animate-message-in">
                         <Avatar className="h-7 w-7 mt-0.5 border border-[rgba(255,255,255,0.04)]">
                             <AvatarImage src={msg.avatar} />
                             <AvatarFallback className="bg-gradient-to-br from-red-500 to-yellow-500 text-white font-bold">{msg.user.charAt(0)}</AvatarFallback>
                         </Avatar>
                          <div className="flex-grow">
                             <p className="leading-snug break-words text-xs text-[#E6ECEF]">
                                 <span className={cn("font-semibold mr-1.5", isSellerMessage && "text-amber-400")}>
                                     {msg.user}
                                     {isSellerMessage && <Badge variant="secondary" className="ml-1.5 px-1.5 py-0 text-xs">Seller</Badge>}
                                :</span>
                                 <span className="text-sm">
                                    {msg.replyingTo && <span className="text-blue-400 font-semibold mr-1">@{msg.replyingTo}</span>}
                                    {msg.text.split(' ').map((part: string, index: number) => 
                                        part.startsWith('@') ? (
                                            <span key={index} className="text-blue-400 font-semibold">{part} </span>
                                        ) : (
                                            part + ' '
                                        )
                                    )}
                                 </span>
                             </p>
                          </div>
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                      <MoreVertical className="w-4 h-4" />
                                  </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                  <DropdownMenuItem onSelect={() => handleReply(msg)}>
                                      <Reply className="mr-2 h-4 w-4" />Reply
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onSelect={() => handlers.onReportMessage(msg.id)}>
                                    <Flag className="mr-2 h-4 w-4" />Report
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                      </div>
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
      <footer className="p-3 bg-transparent flex-shrink-0">
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
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleNewMessageSubmit(e);
                        }
                    }}
                    rows={1}
                    className='flex-grow resize-none max-h-24 px-4 pr-12 py-3 min-h-11 rounded-full bg-[#0f1113] text-white placeholder:text-[#7d8488] border-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-[#E43F3F]/30'
                />
                <Popover>
                    <PopoverTrigger asChild>
                         <Button variant="ghost" size="icon" type="button" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-muted-foreground hover:text-white">
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
             <Button type="submit" size="icon" disabled={!newMessage.trim()} className="rounded-full flex-shrink-0 h-11 w-11 bg-[#E43F3F] hover:bg-[#E43F3F]/90 active:scale-105 transition-transform">
                <Send className="h-5 w-5" />
            </Button>
          </form>
        </footer>
    </div>
  );
};
