
"use client";

import Link from 'next/link';
import {
  Clapperboard,
  Home,
  Bookmark,
  Heart,
  Star,
  Zap,
  ChevronDown,
  Bell,
  Plus,
  Settings,
  Users,
  Menu,
  User,
  Award,
  MessageSquare,
  Shield,
  FileText,
  LifeBuoy,
  Wallet,
  ShoppingBag,
  LogOut,
  MoreHorizontal,
  Flag,
  Share2,
  MessageCircle,
  Clipboard,
  Hash,
  UserPlus,
  Video,
  Globe,
  File,
  X,
  ShoppingCart,
  Moon,
  Sun,
  Search,
  LayoutDashboard,
  Repeat,
  Laptop,
  Briefcase,
  Gavel,
  RadioTower,
  Trash2,
  Send,
  ArrowUp,
  ArrowDown,
  Tv,
  Tags,
  Flame,
  TrendingUp,
  Save,
  Package,
  List,
  Sparkles,
  Edit,
  Download,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useAuthActions } from '@/lib/auth';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { ScrollArea } from '@/components/ui/scroll-area';
import { Footer } from '@/components/footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { CreatePostForm, PostData } from '@/components/create-post-form';
import { getCart } from '@/lib/product-history';
import { Dialog, DialogHeader, DialogTitle, DialogTrigger, DialogContent, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { GoLiveDialog } from '@/components/go-live-dialog';
import { collection, query, orderBy, onSnapshot, Timestamp, deleteDoc, doc, updateDoc, increment, addDoc, serverTimestamp, where, getDocs, runTransaction, limit, Unsubscribe } from "firebase/firestore";
import { getFirestoreDb, getFirebaseStorage } from '@/lib/firebase';
import { format, formatDistanceToNow, formatDistanceToNowStrict, isThisWeek, isThisYear } from 'date-fns';
import { ref as storageRef, deleteObject, uploadString, getDownloadURL } from 'firebase/storage';
import { isFollowing, toggleFollow, UserData, getUserByDisplayName, getFollowing } from '@/lib/follow-data';
import { productDetails } from '@/lib/product-data';
import { PromotionalCarousel } from '@/components/promotional-carousel';
import { Logo } from '@/components/logo';
import { categories } from '@/lib/categories';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useIsMobile } from '@/hooks/use-mobile';
import { getSavedPosts, isPostSaved, toggleSavePost } from '@/lib/post-history';
import { useDebounce } from '@/hooks/use-debounce';
import { Highlight } from '@/components/highlight';
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from '@/components/ui/popover';
import { CommentColumn } from '@/components/feed/comment-column';
import { MainSidebar } from '@/components/main-sidebar';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { ConversationList, ChatWindow, Conversation, Message } from '@/components/messaging/common';
import { addToCart } from '@/lib/product-history';

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

const reportReasons = [
    { id: "spam", label: "It's spam" },
    { id: "hate", label: "Hate speech or symbols" },
    { id: "false", label: "False information" },
    { id: "bullying", label: "Bullying or harassment" },
];

const mockFollowers = [
    { id: 1, name: "Wade Warren", country: "United States", avatar: "https://placehold.co/40x40.png" },
    { id: 2, name: "Esther Howard", country: "Canada", avatar: "https://placehold.co/40x40.png" },
    { id: 3, name: "Robert Fox", country: "United Kingdom", avatar: "https://placehold.co/40x40.png" },
];

const liveSellersData = [
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

const mockConversations: Conversation[] = [
    { conversationId: '1', userId: "support", userName: "StreamCart Support", avatarUrl: "https://placehold.co/40x40/000000/FFFFFF?text=SC", lastMessage: "Yes, we can help with that!", lastMessageTimestamp: "10:30 AM", unreadCount: 1, isExecutive: true },
    { conversationId: '2', userId: "FashionFinds", userName: "FashionFinds", avatarUrl: "https://placehold.co/40x40.png", lastMessage: "Awesome! Could you tell me a bit more about the lens?", lastMessageTimestamp: "10:01 AM", unreadCount: 0 },
    { conversationId: '3', userId: "GadgetGuru", userName: "GadgetGuru", avatarUrl: "https://placehold.co/40x40.png", lastMessage: "Sure, what would you like to know?", lastMessageTimestamp: "Yesterday", unreadCount: 0 },
];

const mockMessages: Record<string, Message[]> = {
  "support": [
    { id: 1, senderId: 'customer', text: 'I have an issue with my recent order.', timestamp: '10:28 AM', status: 'read' },
    { id: 2, senderId: 'support', text: 'Hello! I can certainly help you with that. Can you please provide me with the order ID?', timestamp: '10:29 AM' },
    { id: 3, senderId: 'customer', text: 'It is #ORD5896.', timestamp: '10:29 AM', status: 'read' },
    { id: 4, senderId: 'support', text: 'Thank you. One moment while I look that up for you.', timestamp: '10:30 AM' },
  ],
  "FashionFinds": [
    { id: 1, text: "Hey! I saw your stream and I'm interested in the vintage camera. Is it still available?", senderId: 'customer', timestamp: '10:00 AM', status: 'read' },
    { id: 2, text: "Hi there! Yes, it is. It's in great working condition.", senderId: 'seller', timestamp: '10:01 AM' },
    { id: 3, text: "Awesome! Could you tell me a bit more about the lens?", senderId: 'customer', timestamp: '10:01 AM', status: 'delivered' },
  ],
  "GadgetGuru": [
      { id: 1, text: "I have a question about the X-1 Drone.", senderId: 'customer', timestamp: 'Yesterday', status: 'read' },
      { id: 2, text: "Sure, what would you like to know?", senderId: 'seller', timestamp: 'Yesterday' },
  ]
};

function FeedPostSkeleton() {
    return (
        <Card className="overflow-hidden border-none shadow-none bg-transparent">
            <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-grow space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                    </div>
                </div>
                <Skeleton className="w-full aspect-video rounded-lg" />
                <div className="space-y-3 mt-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        </Card>
    );
}

const FeedPost = ({ 
    post, 
    onDelete, 
    onEdit, 
    onShare,
    onReport,
    onSaveToggle,
    onFollowToggle,
    onAddToCart,
    onBuyNow,
    isSaved,
    isFollowing: initialIsFollowing,
    currentUser,
    highlightTerm,
    onHashtagClick,
    onCommentClick,
} : {
    post: any,
    onDelete: (post: any) => void,
    onEdit: (post: any) => void,
    onShare: (postId: string) => void,
    onReport: () => void,
    onSaveToggle: (post: any) => void,
    onFollowToggle: (targetId: string) => void,
    onAddToCart: (product: any) => void,
    onBuyNow: (product: any) => void,
    isSaved: boolean,
    isFollowing: boolean,
    currentUser: User | null,
    highlightTerm?: string,
    onHashtagClick: (tag: string) => void;
    onCommentClick: (post: any) => void;
}) => {
    
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const { toast } = useToast();
    const [isFollowingState, setIsFollowingState] = useState(initialIsFollowing);

    const handleDownloadImage = (url: string) => {
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const blobUrl = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = blobUrl;
                a.download = `streamcart_image_${Date.now()}.jpg`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(blobUrl);
                a.remove();
            })
            .catch(() => toast({ variant: 'destructive', title: 'Download failed' }));
    };
    
    const imageCount = post.images?.length || 0;
    
    const renderContentWithHashtags = (text: string) => {
        const parts = text.split(/(#\w+)/g);
        return parts.map((part, index) => {
            if (part.startsWith('#')) {
                const tag = part.substring(1);
                return (
                    <button key={index} className="text-primary hover:underline" onClick={() => onHashtagClick(tag)}>
                       <Highlight text={part} highlight={highlightTerm} />
                    </button>
                );
            }
            return <Highlight key={index} text={part} highlight={highlightTerm} />;
        });
    };

    const isOwnPost = currentUser?.uid === post.sellerId;


    return (
        <Dialog>
            <Collapsible>
            <Card className={cn("border-x-0 border-t-0 rounded-none shadow-none bg-transparent")}>
                <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-transparent border-none" aria-describedby={undefined}>
                    <DialogHeader className="sr-only">
                        <DialogTitle>Post Image</DialogTitle>
                        <DialogDescription>Viewing post image</DialogDescription>
                    </DialogHeader>
                    <div className="relative">
                        {viewingImage && <Image src={viewingImage} alt="Full screen post image" width={1200} height={900} className="w-full h-full object-contain" />}
                        <Button 
                            variant="secondary" 
                            size="icon" 
                            className="absolute bottom-4 right-4 z-10"
                            onClick={() => viewingImage && handleDownloadImage(viewingImage)}
                        >
                            <Download />
                        </Button>
                    </div>
                </DialogContent>
                <div className="p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <Link href={`/seller/profile?userId=${post.sellerId}`} className="group flex-shrink-0">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={post.avatarUrl} />
                                    <AvatarFallback>{post.sellerName.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </Link>
                            <div className="flex-grow">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Link href={`/seller/profile?userId=${post.sellerId}`} className="group">
                                        <span className="font-semibold group-hover:underline">
                                            <Highlight text={post.sellerName} highlight={highlightTerm} />
                                        </span>
                                    </Link>
                                    {!isOwnPost && (
                                        <Button
                                            variant={isFollowingState ? "outline" : "secondary"}
                                            size="sm"
                                            className="h-6 px-2 text-xs"
                                            onClick={() => {
                                                onFollowToggle(post.sellerId);
                                                setIsFollowingState(prev => !prev);
                                            }}
                                        >
                                            <UserPlus className="mr-1 h-3 w-3" />
                                            {isFollowingState ? "Following" : "Follow"}
                                        </Button>
                                    )}
                                     {post.taggedProducts && post.taggedProducts.length > 0 && (
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                                                <ShoppingBag className="w-4 h-4"/>
                                            </Button>
                                        </CollapsibleTrigger>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground font-normal">
                                    {post.timestamp}
                                </div>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {isOwnPost && (
                                    <>
                                        <DropdownMenuItem onSelect={() => onEdit(post)}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>This will permanently delete your post.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => onDelete(post)}>Delete</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                        <DropdownMenuSeparator />
                                    </>
                                )}
                                <DropdownMenuItem onClick={() => onSaveToggle(post)}>
                                    <Save className={cn("mr-2 h-4 w-4", isSaved && "fill-current")} /> {isSaved ? 'Unsave' : 'Save'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onSelect={() => onShare(post.id)}><Share2 className="mr-2 h-4 w-4" /> Share</DropdownMenuItem>
                                <DropdownMenuItem onSelect={onReport}><Flag className="mr-2 h-4 w-4" /> Report</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <CollapsibleContent>
                        {post.taggedProducts && post.taggedProducts.length > 0 && (
                            <Card className="my-2">
                                <CardContent className="p-3 space-y-2">
                                    {post.taggedProducts.map((product: any) => (
                                        <div key={product.key} className="flex items-center gap-4">
                                            <Link href={`/product/${product.key}`}>
                                                <Image src={product.image || product.images?.[0].preview} alt={product.name} width={60} height={60} className="rounded-md" />
                                            </Link>
                                            <div className="flex-grow">
                                                <Link href={`/product/${product.key}`} className="hover:underline">
                                                    <h4 className="font-semibold text-sm">{product.name}</h4>
                                                </Link>
                                                <p className="font-bold text-lg">{product.price}</p>
                                                <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <Button size="sm" variant="outline" className="flex-1 h-7 text-xs" onClick={() => onAddToCart(product)}><ShoppingCart className="mr-2 h-4 w-4" /> Cart</Button>
                                                <Button size="sm" className="flex-1 h-7 text-xs" onClick={() => onBuyNow(product)}>Buy</Button>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </CollapsibleContent>

                     <div className="pt-4 text-sm text-muted-foreground whitespace-pre-wrap">
                        {renderContentWithHashtags(post.content)}
                    </div>
                </div>

                {imageCount > 0 && (
                    <div className="px-4">
                         <div
                            className={cn(
                                "grid gap-1 rounded-lg overflow-hidden",
                                imageCount === 1 ? "grid-cols-1" : "grid-cols-2"
                            )}
                        >
                            {post.images.slice(0, 4).map((image: any, index: number) => (
                                <DialogTrigger key={image.id || index} asChild>
                                <div
                                    className={cn(
                                    "cursor-pointer relative group bg-muted",
                                    imageCount === 1 ? "aspect-video" : "aspect-square"
                                    )}
                                    onClick={() => setViewingImage(image.url)}
                                >
                                    <Image
                                    src={image.url}
                                    alt={`Post image ${index + 1}`}
                                    fill
                                    className="object-cover w-full h-full"
                                    />
                                    {index === 3 && imageCount > 4 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-2xl font-bold">
                                        +{imageCount - 4}
                                    </div>
                                    )}
                                </div>
                                </DialogTrigger>
                            ))}
                        </div>
                    </div>
                )}
                <div className="px-4 pb-4 mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" className="flex items-center gap-1.5 px-2">
                            <ArrowUp className="w-4 h-4"/>
                            <span>{post.likes || 0}</span>
                        </Button>
                        <Button variant="ghost" className="flex items-center gap-1.5 px-2">
                            <ArrowDown className="w-4 h-4"/>
                            <span>{post.downvotes || 0}</span>
                        </Button>
                    </div>
                    <Button variant="ghost" className="flex items-center gap-1.5" onClick={() => onCommentClick(post)}>
                        <MessageSquare className="w-4 h-4"/>
                        <span>{post.replies || 0} Comments</span>
                    </Button>
                </div>
            </Card>
            </Collapsible>
        </Dialog>
    )
}

function FeedPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  const { user, userData, loading: authLoading } = useAuth();
  const [feed, setFeed] = useState<any[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState("");
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [postToEdit, setPostToEdit] = useState<any | null>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<{users: UserData[], hashtags: string[], posts: any[]}>({users: [], hashtags: [], posts: []});
  const [selectedPostForComments, setSelectedPostForComments] = useState<any | null>(null);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [mainTab, setMainTab] = useState('feed');
  const [feedTab, setFeedTab] = useState('for-you');
  const [savesSubTab, setSavesSubTab] = useState('saved-posts');
  
  const { open, setOpen } = useSidebar();

  const showSuggestions = debouncedSearchTerm.length > 0 && (searchSuggestions.users.length > 0 || searchSuggestions.hashtags.length > 0 || searchSuggestions.posts.length > 0);

  const handleSelectConversation = (convo: Conversation) => {
    setSelectedConversation(convo);
    // @ts-ignore
    setCurrentMessages(mockMessages[convo.userId] || []);
  };

  const handleSendMessage = (text: string) => {
    if (!selectedConversation || !user) return;
    const newMessage: Message = {
      id: Date.now(),
      senderId: user.uid,
      text: text,
      timestamp: format(new Date(), 'p'),
      status: 'sent',
    };
    setCurrentMessages(prev => [...prev, newMessage]);
    // This is mock, so we're not persisting it.
    toast({ title: "Message Sent (Mock)" });

    // Simulate delivered and read status
    setTimeout(() => {
        setCurrentMessages(prev => prev.map(m => m.id === newMessage.id ? {...m, status: 'delivered'} : m));
    }, 500);
     setTimeout(() => {
        setCurrentMessages(prev => prev.map(m => m.id === newMessage.id ? {...m, status: 'read'} : m));
    }, 2000);
  }

  const handleDeleteConversation = (conversationId: string) => {
      setConversations(prev => prev.filter(c => c.conversationId !== conversationId));
      if (selectedConversation?.conversationId === conversationId) {
          setSelectedConversation(null);
          setCurrentMessages([]);
      }
      toast({ title: "Conversation Deleted" });
  };


  const handleSearchFilter = (type: 'user' | 'hashtag', value: string) => {
    if (type === 'hashtag') {
        setSearchTerm(`#${value}`);
    } else if (type === 'user') {
        router.push(`/seller/profile?userId=${value}`);
    }
    setSearchSuggestions({users: [], hashtags: [], posts: []});
  }

  useEffect(() => {
    const getSuggestions = async () => {
        if (debouncedSearchTerm.trim() === '') {
            setSearchSuggestions({users: [], hashtags: [], posts: []});
            return;
        }

        setIsSuggestionLoading(true);
        const lowercasedTerm = debouncedSearchTerm.toLowerCase();
        
        const db = getFirestoreDb();
        const usersRef = collection(db, "users");
        const userQuery = query(usersRef, 
            where("displayName", ">=", debouncedSearchTerm), 
            where("displayName", "<=", debouncedSearchTerm + '\uf8ff'),
            limit(3)
        );
        const userSnapshot = await getDocs(userQuery);
        const users = userSnapshot.docs.map(doc => doc.data() as UserData);

        const posts = feed.filter(post => 
            post.content.toLowerCase().includes(lowercasedTerm)
        ).slice(0, 5);
        
        const hashtags = Array.from(new Set(feed.flatMap(post => 
            (post.tags || []).filter((tag: string) => tag.toLowerCase().includes(lowercasedTerm.replace('#', '')))
        ))).slice(0, 5);

        setSearchSuggestions({users, hashtags, posts});
        setIsSuggestionLoading(false);
    }
    getSuggestions();
  }, [debouncedSearchTerm, feed]);

  const loadFollowData = useCallback(async () => {
    if (user) {
      const followingUsers = await getFollowing(user.uid);
      setFollowingIds(followingUsers.map(u => u.uid));
    }
  }, [user]);
  
  const loadSavedPosts = useCallback(() => {
    setSavedPosts(getSavedPosts());
  }, []);

  useEffect(() => {
    setIsMounted(true);
    loadFollowData();
    loadSavedPosts();
    
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'streamcart_saved_posts') {
            loadSavedPosts();
        }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    }
  }, [loadFollowData, loadSavedPosts]);

 useEffect(() => {
    if (isMounted) {
        const tabFromUrl = searchParams.get('tab');
        if (tabFromUrl && ['feed', 'saves', 'messages'].includes(tabFromUrl)) {
            setMainTab(tabFromUrl);
        } else if (pathname === '/feed') {
            setMainTab('feed');
        }
        
        if (mainTab === 'messages') {
            setConversations(mockConversations);
            if (mockConversations.length > 0 && !isMobile) {
                handleSelectConversation(mockConversations[0]);
            }
        }
    }
}, [mainTab, isMobile, isMounted, searchParams, pathname]);



  const userPosts = useMemo(() => {
    if (!user) return [];
    return feed.filter(post => post.sellerId === user.uid);
  }, [feed, user]);
  
  const filteredFeed = useMemo(() => {
    let currentFeed: any[] = [];
    if (feedTab === 'for-you') {
        currentFeed = feed;
    } else if (feedTab === 'following' && user) {
        currentFeed = feed.filter(post => 
            followingIds.includes(post.sellerId) || post.sellerId === user.uid
        );
    }
    
    const lowercasedSearchTerm = debouncedSearchTerm.toLowerCase();
    if (!lowercasedSearchTerm) return currentFeed;

    if(lowercasedSearchTerm.startsWith('#')) {
        return currentFeed.filter(item => 
            (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(lowercasedSearchTerm.substring(1))))
        );
    }

    return currentFeed.filter(item => 
        item.sellerName.toLowerCase().includes(lowercasedSearchTerm) || item.content.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [debouncedSearchTerm, feed, feedTab, followingIds, user]);
  
  const filteredSavedPosts = useMemo(() => {
      if (!debouncedSearchTerm) return savedPosts;
      const lowercasedSearchTerm = debouncedSearchTerm.toLowerCase();
      if(lowercasedSearchTerm.startsWith('#')) {
        return savedPosts.filter(item => 
            (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(lowercasedSearchTerm.substring(1))))
        );
    }
    return savedPosts.filter(item => 
        item.sellerName.toLowerCase().includes(lowercasedSearchTerm) || item.content.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [debouncedSearchTerm, savedPosts]);


  const trendingTopics = useMemo(() => {
    const hashtagCounts: { [key: string]: number } = {};
    feed.forEach(post => {
        const hashtags = Array.from(post.content.matchAll(/#(\w+)/g)).map((match: any) => match[1]);
        hashtags.forEach((tag: string) => {
            if (tag) {
                hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1;
            }
        });
    });
    return Object.entries(hashtagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([topic, posts]) => ({ topic, posts, posts: `${posts} post${posts > 1 ? 's' : ''}` }));
  }, [feed]);

  const trendingStreams = useMemo(() => {
    return [...liveSellersData].sort((a,b) => b.viewers - a.viewers).slice(0, 4);
  }, []);

  const setupFeedListener = useCallback(() => {
        setIsLoadingFeed(true);
        const db = getFirestoreDb();
        const postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
            const postsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp ? formatDistanceToNow(new Date((doc.data().timestamp as Timestamp).seconds * 1000), { addSuffix: true }) : 'just now'
            }));

            const mockDemoPost = {
                id: 'demo-post-1',
                sellerId: 'demo-seller',
                sellerName: 'Demo Seller',
                avatarUrl: 'https://placehold.co/40x40.png?text=D',
                timestamp: formatDistanceToNow(new Date(), { addSuffix: true }),
                content: 'This is a sample post for demonstration purposes. You can edit this to see how posts will look on the feed! #demopost #example',
                tags: ['demopost', 'example'],
                likes: 123,
                replies: 45,
                images: [{ url: 'https://placehold.co/600x400.png', id: 'demo-img-1' }],
                taggedProducts: [
                    {
                        id: 'prod_1',
                        key: 'prod_1',
                        name: 'Vintage Camera',
                        price: '₹12,500.00',
                        image: 'https://images.unsplash.com/photo-1497008323932-4f726e0f13f5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHx2aW50YWdlJTIwY2FtZXJhfGVufDB8fHx8MTc1NjI4NzMwOHww&ixlib=rb-4.1.0&q=80&w=1080',
                        stock: 15,
                    }
                ]
            };
            
            setFeed([mockDemoPost, ...postsData]);
            setIsLoadingFeed(false);
        }, (error) => {
            console.error("Error fetching feed:", error);
            toast({
                title: "Error",
                description: "Could not fetch the feed. Please try again later.",
                variant: "destructive"
            })
            setIsLoadingFeed(false);
        });
        return unsubscribe;
    }, [toast]);

  useEffect(() => {
    if (!isMounted) return;

    const unsubscribe = setupFeedListener();

    return () => {
        if (unsubscribe) {
            unsubscribe();
        }
    };
  }, [isMounted, setupFeedListener]);

 const handlePostSubmit = async (postData: PostData) => {
    if ((!postData.content.trim() && (!postData.media || postData.media.length === 0)) || !user || !userData) return;
    
    setIsFormSubmitting(true);
    
    try {
        if (postToEdit) {
            const db = getFirestoreDb();
            const postRef = doc(db, 'posts', postToEdit.id);
            
            const dataToUpdate: any = {
                content: postData.content,
                tags: Array.from(postData.content.matchAll(/#(\w+)/g) || []).map((match: any) => match[1]),
                lastEditedAt: serverTimestamp(),
                taggedProducts: postData.taggedProducts
            };
            
            await updateDoc(postRef, dataToUpdate);
            toast({ title: "Post Updated!", description: "Your changes have been saved." });
            
        } else {
            const db = getFirestoreDb();
            const dataToSave: any = {
                content: postData.content,
                tags: Array.from(postData.content.matchAll(/#(\w+)/g) || []).map((match: any) => match[1]),
                taggedProducts: postData.taggedProducts,
                sellerId: user.uid,
                sellerName: userData.displayName,
                avatarUrl: userData.photoURL,
                timestamp: serverTimestamp(),
                likes: 0,
                replies: 0,
                images: [],
            };

            const mediaUploads = await Promise.all(
                (postData.media || []).map(async (mediaFile) => {
                    if (!mediaFile.file) return null;
                    const storage = getFirebaseStorage();
                    const filePath = `posts/${user.uid}/${Date.now()}_${mediaFile.file.name}`;
                    const fileRef = storageRef(storage, filePath);
                    const uploadResult = await uploadString(fileRef, mediaFile.url, 'data_url');
                    return { type: mediaFile.type, url: await getDownloadURL(uploadResult.ref) };
                })
            );
            
            dataToSave.images = mediaUploads.filter((m): m is { type: 'image', url: string } => !!m && m.type === 'image').map(m => ({ url: m.url, id: Date.now() + Math.random() }));

            await addDoc(collection(db, "posts"), dataToSave);
            
            toast({ title: "Post Created!", description: "Your post has been successfully shared." });
        }
    } catch (error: any) {
        console.error("Error submitting post:", error);
        toast({
            variant: 'destructive',
            title: "Submission Error",
            description: `A database error occurred: ${error.message}. This could be due to Firestore security rules.`
        });
    } finally {
        onFinishEditing();
    }
  };
  
  if (!isMounted || authLoading || !userData) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  }
  
  if (!user) {
    router.push('/');
    return null;
  }

  const handleShare = (postId: string) => {
    const link = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(link);
    toast({
        title: "Link Copied!",
        description: "The post link has been copied to your clipboard.",
    });
  };

  const submitReport = () => {
    console.log("Submitting report for reason:", selectedReportReason);
    toast({
        title: "Report Submitted",
        description: "Thank you for your feedback. We will review this post.",
    });
    setIsReportDialogOpen(false);
    setSelectedReportReason("");
  };

  const handleEditPost = (post: any) => {
      setPostToEdit(post);
  };
  
  const onFinishEditing = () => {
      setPostToEdit(null);
      setIsFormSubmitting(false);
  };

  const handleDeletePost = async (post: any) => {
      if (!post || !post.id) return;
      setDeletingPostId(post.id);
      const db = getFirestoreDb();
      const postRef = doc(db, 'posts', post.id);

      try {
          if (post.images && post.images.length > 0) {
              const storage = getFirebaseStorage();
              const deletePromises = post.images.map((image: {url: string}) => {
                  if (image.url && image.url.includes('firebasestorage.googleapis.com')) {
                      try {
                          const mediaRef = storageRef(storage, image.url);
                          return deleteObject(mediaRef);
                      } catch (e) {
                          console.warn("Could not create storage ref for deletion. URL might be invalid:", image.url, e);
                          return Promise.resolve();
                      }
                  }
                  return Promise.resolve();
              });
              await Promise.all(deletePromises);
          }
          
          await deleteDoc(postRef);

          toast({
              title: "Post Deleted",
              description: "Your post has been successfully removed.",
          });
      } catch (error) {
          console.error("Error deleting post: ", error);
          toast({
              variant: 'destructive',
              title: "Error",
              description: "Could not delete the post. Please try again."
          });
      } finally {
          setDeletingPostId(null);
      }
  };
  
  const handleSaveToggle = (post: any) => {
    toggleSavePost(post);
    loadSavedPosts();
  };

  const handleFollowToggle = async (targetId: string) => {
    if (!user) return;
    await toggleFollow(user.uid, targetId);
    loadFollowData();
  };

  const handleAddToCart = (product: any) => {
    addToCart({ ...product, quantity: 1 });
    toast({
        title: "Added to Cart!",
        description: `${product.name} has been added to your cart.`
    });
  };

  const handleBuyNow = (product: any) => {
    router.push(`/cart?buyNow=true&productId=${product.key}`);
  };
  
  const renderPostList = (posts: any[], isLoading: boolean) => {
      if (isLoading) {
          return (
              <div className="divide-y divide-border/20">
                  <FeedPostSkeleton />
                  <FeedPostSkeleton />
              </div>
          );
      }
      if (posts.length > 0) {
          return (
            <div className="divide-y divide-border/20">
                {posts.map(post => (
                    <FeedPost 
                        key={post.id}
                        post={post}
                        currentUser={user}
                        onDelete={handleDeletePost}
                        onEdit={handleEditPost}
                        onShare={handleShare}
                        onReport={() => setIsReportDialogOpen(true)}
                        onSaveToggle={handleSaveToggle}
                        onFollowToggle={handleFollowToggle}
                        onAddToCart={handleAddToCart}
                        onBuyNow={handleBuyNow}
                        isSaved={isPostSaved(post.id)}
                        isFollowing={followingIds.includes(post.sellerId)}
                        highlightTerm={debouncedSearchTerm}
                        onHashtagClick={(tag) => setSearchTerm(`#${tag}`)}
                        onCommentClick={(post) => setSelectedPostForComments(post)}
                    />
                ))}
            </div>
          );
      }
      return (
         <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-semibold">No posts to show</p>
            <p>Follow sellers or explore topics to see posts here.</p>
        </div>
      );
  };
  
  const renderFeedContent = () => (
    <>
      <Tabs value={feedTab} onValueChange={setFeedTab} className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 sticky top-16 z-20 backdrop-blur-sm">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <TabsTrigger value="for-you" className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">For You</TabsTrigger>
                  <TabsTrigger value="following" className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">Following</TabsTrigger>
              </div>
          </TabsList>
      </Tabs>
      {renderPostList(filteredFeed, isLoadingFeed)}
    </>
  );

  const renderSavesContent = () => (
    <>
      <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-sm border-b border-border/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4">
                <Tabs value={savesSubTab} onValueChange={setSavesSubTab} className="w-full">
                    <TabsList className="w-full justify-start rounded-none bg-transparent p-0">
                        <TabsTrigger value="saved-posts" className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">Saved Posts</TabsTrigger>
                        <TabsTrigger value="upvoted-posts" className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">Upvoted Posts</TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>
      </div>
      <Tabs value={savesSubTab} onValueChange={setSavesSubTab} className="w-full">
            <TabsContent value="saved-posts" className="mt-0">
                {renderPostList(filteredSavedPosts, false)}
            </TabsContent>
            <TabsContent value="upvoted-posts" className="mt-0">
                <div className="text-center py-20 text-muted-foreground">
                    <Heart className="h-12 w-12 mx-auto mb-4"/>
                    <p className="text-lg font-semibold">No upvoted posts yet</p>
                    <p>Posts you upvote will appear here.</p>
                </div>
            </TabsContent>
        </Tabs>
    </>
  );
  
  const renderMessagesContent = () => (
       <div className="h-full flex overflow-hidden">
          <div className={cn(
              "h-full w-full flex-col border-r md:flex md:w-full lg:w-2/5",
              isMobile && selectedConversation && "hidden"
          )}>
              <ConversationList
                  conversations={conversations}
                  selectedConversation={selectedConversation}
                  onSelectConversation={handleSelectConversation}
                  onDeleteConversation={handleDeleteConversation}
              />
          </div>
          <div className={cn(
              "h-full w-full flex-col md:flex md:w-full lg:w-3/5",
              isMobile && !selectedConversation && "hidden"
          )}>
             {selectedConversation && userData ? (
                  <ChatWindow 
                      key={selectedConversation.userId}
                      conversation={selectedConversation}
                      userData={userData}
                      messages={currentMessages || []}
                      onSendMessage={handleSendMessage}
                      onBack={() => setSelectedConversation(null)}
                  />
              ) : (
                  <div className="hidden md:flex flex-col items-center justify-center h-full text-muted-foreground">
                      <MessageSquare className="h-16 w-16 mb-4"/>
                      <h2 className="text-xl font-semibold">Select a chat</h2>
                      <p>Choose a conversation to start messaging.</p>
                  </div>
              )}
          </div>
      </div>
  );
  
  const renderMainContent = () => {
    switch (mainTab) {
        case 'saves':
            return renderSavesContent();
        case 'messages':
            return renderMessagesContent();
        case 'feed':
        default:
            return renderFeedContent();
    }
  };


  return (
    <div className="h-screen w-full">
         <div className={cn(
             "grid h-screen w-full", 
             (mainTab === 'feed' || mainTab === 'saves') && "lg:grid-cols-[260px_1fr_320px]",
             (mainTab === 'messages') && "lg:grid-cols-[260px_1fr]"
         )}>
                <aside className={cn("h-screen flex-col border-r border-border/50 sticky top-0 hidden lg:flex")}>
                    <MainSidebar userData={userData!} userPosts={userPosts} />
                </aside>

                 <div className="flex flex-col h-screen">
                     <div className={cn("flex flex-1 overflow-hidden", isMobile && selectedPostForComments && "hidden")}>
                        <div className="flex-1 flex flex-col h-full">
                           <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm p-4 border-b border-border/50 flex items-center gap-2">
                                <Button variant="outline" size="icon" className="shrink-0 lg:hidden" onClick={() => setOpen(true)}>
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Toggle navigation menu</span>
                                </Button>
                                <Popover open={showSuggestions}>
                                    <PopoverAnchor asChild>
                                        <div className="relative flex-grow">
                                            <Input
                                                placeholder="Search feed..."
                                                className="rounded-full bg-muted border-transparent focus:bg-background focus:border-border"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </PopoverAnchor>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                        <ScrollArea className="max-h-80">
                                            {isSuggestionLoading ? <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div> : 
                                            (
                                                <>
                                                    {searchSuggestions.users.length === 0 && searchSuggestions.hashtags.length === 0 && searchSuggestions.posts.length === 0 ? (
                                                        <div className="p-4 text-center text-sm text-muted-foreground">No results found.</div>
                                                    ) : (
                                                        <>
                                                            {searchSuggestions.users.length > 0 && <div className="px-3 py-1.5 text-sm font-semibold">Users</div>}
                                                            {searchSuggestions.users.map(u => (
                                                                <button key={u.uid} onClick={() => handleSearchFilter('user', u.uid)} className="relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-3 py-1.5 text-sm outline-none transition-colors hover:bg-secondary focus:bg-secondary">
                                                                    <Avatar className="h-6 w-6 mr-2"><AvatarImage src={u.photoURL}/><AvatarFallback>{u.displayName.charAt(0)}</AvatarFallback></Avatar>
                                                                    {u.displayName}
                                                                </button>
                                                            ))}
                                                            {searchSuggestions.hashtags.length > 0 && <div className="px-3 py-1.5 text-sm font-semibold">Hashtags</div>}
                                                            {searchSuggestions.hashtags.map(h => (
                                                                <button key={h} onClick={() => handleSearchFilter('hashtag', h)} className="relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-3 py-1.5 text-sm outline-none transition-colors hover:bg-secondary focus:bg-secondary">#{h}</button>
                                                            ))}
                                                            {searchSuggestions.posts.length > 0 && <div className="px-3 py-1.5 text-sm font-semibold">Posts</div>}
                                                            {searchSuggestions.posts.map(p => (
                                                                <button key={p.id} onClick={() => setSearchTerm(p.content.substring(0,20))} className="relative flex w-full cursor-default select-none items-center gap-2 rounded-sm px-3 py-1.5 text-sm outline-none transition-colors hover:bg-secondary focus:bg-secondary">
                                                                    <span className="truncate">{p.content}</span>
                                                                </button>
                                                            ))}
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </ScrollArea>
                                    </PopoverContent>
                                </Popover>
                                <Button asChild variant="ghost" size="icon">
                                    <Link href="/live-selling">
                                        <Home className="h-5 w-5" />
                                    </Link>
                                </Button>
                            </div>

                           <div className="w-full flex-grow overflow-y-auto no-scrollbar">
                               {renderMainContent()}
                           </div>
                           
                           {mainTab === 'feed' && (
                                <div className="w-full pointer-events-auto mt-auto">
                                    <div className="p-3 bg-background/80 backdrop-blur-sm rounded-t-lg border-t border-border/50">
                                        <CreatePostForm
                                            onPost={handlePostSubmit}
                                            postToEdit={postToEdit}
                                            onFinishEditing={onFinishEditing}
                                            isSubmitting={isFormSubmitting}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                     <Sheet open={!!selectedPostForComments} onOpenChange={(open) => !open && setSelectedPostForComments(null)}>
                        <SheetContent side={isMobile ? "bottom" : "right"} className={cn(isMobile ? "h-[85vh] p-0" : "lg:w-96 p-0 border-l")}>
                            <CommentColumn post={selectedPostForComments} onClose={() => setSelectedPostForComments(null)} />
                        </SheetContent>
                    </Sheet>
                </div>

                {(mainTab === 'feed' || mainTab === 'saves') && (
                    <aside className="h-screen flex-col border-l border-border/50 sticky top-0 hidden lg:flex">
                    <div className="p-4 flex flex-col h-full bg-sidebar-background text-sidebar-foreground">
                            <div className="flex-shrink-0">
                            </div>

                            <ScrollArea className="-mx-4 mt-4">
                                <div className="px-4">
                                    <Card className="bg-muted/30">
                                        <CardHeader>
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <TrendingUp className="h-5 w-5 text-primary" />
                                                Trending Topics
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-3">
                                                {trendingTopics.map(topic => (
                                                    <li key={topic.topic}>
                                                        <button onClick={() => setSearchTerm(`#${topic.topic}`)} className="font-semibold hover:underline text-left w-full">
                                                            #{topic.topic}
                                                        </button>
                                                        <p className="text-xs text-muted-foreground">{topic.posts}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>

                                    <Card className="bg-muted/30 mt-6">
                                        <CardHeader>
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <RadioTower className="h-5 w-5 text-destructive animate-pulse" />
                                                Trending Streams
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            {trendingStreams.map(stream => (
                                                <Link href={`/stream/${stream.id}`} key={stream.id} className="flex items-center gap-3 group">
                                                    <Avatar className="h-9 w-9">
                                                        <AvatarImage src={stream.avatarUrl} alt={stream.name} />
                                                        <AvatarFallback>{stream.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-sm group-hover:underline">{stream.name}</p>
                                                        <p className="text-xs text-muted-foreground">{stream.category}</p>
                                                    </div>
                                                    <div className="flex items-center text-xs text-muted-foreground gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {stream.viewers}
                                                    </div>
                                                </Link>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </div>
                            </ScrollArea>
                        </div>
                    </aside>
                )}
            </div>
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="left" className="p-0 w-80 lg:hidden">
                <MainSidebar userData={userData!} userPosts={userPosts} />
            </SheetContent>
        </Sheet>
    </div>
  );
}

export default function FeedPage() {
    return (
        <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>}>
            <SidebarProvider>
                <FeedPageContent />
            </SidebarProvider>
        </React.Suspense>
    )
}

    

    



    