
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
  UserCheck,
  ArrowLeft,
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
import { ref as storageRef, deleteObject } from 'firebase/storage';
import { isFollowing, toggleFollow, UserData, getUserByDisplayName, getFollowing, getOrCreateConversation } from '@/lib/follow-data';
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
    { id: '1', name: 'FashionFinds', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Fashion', viewers: 1200, buyers: 25, rating: 4.8, reviews: 12, hint: 'woman posing stylish outfit', productId: 'prod_1' },
    { id: '2', name: 'GadgetGuru', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Electronics', viewers: 2500, buyers: 42, rating: 4.9, reviews: 28, hint: 'unboxing new phone', productId: 'prod_2' },
    { id: '3', name: 'HomeHaven', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Home Goods', viewers: 850, buyers: 15, rating: 4.7, reviews: 9, hint: 'modern living room decor', productId: 'prod_3' },
    { id: '4', name: 'BeautyBox', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Beauty', viewers: 3100, buyers: 78, rating: 4.9, reviews: 55, hint: 'makeup tutorial', productId: 'prod_4' },
    { id: '5', name: 'KitchenWiz', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Kitchenware', viewers: 975, buyers: 0, rating: 0, reviews: 0, hint: 'cooking demonstration', productId: 'prod_5' },
    { id: '6', name: 'FitFlow', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Fitness', viewers: 1500, buyers: 33, rating: 4.6, reviews: 18, hint: 'yoga session', productId: 'prod_6' },
    { id: '7', name: 'ArtisanAlley', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Handmade', viewers: 450, buyers: 8, rating: 5.0, reviews: 6, hint: 'pottery making', productId: 'prod_7' },
    { id: '8', name: 'PetPalace', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Pet Supplies', viewers: 1800, buyers: 50, rating: 4.8, reviews: 30, hint: 'playing with puppy', productId: 'prod_8' },
    { id: '9', name: 'BookNook', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Books', viewers: 620, buyers: 12, rating: 4.9, reviews: 10, hint: 'reading book cozy', productId: 'prod_9' },
    { id: '10', name: 'GamerGuild', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Gaming', viewers: 4200, buyers: 102, rating: 4.9, reviews: 80, hint: 'esports competition', productId: 'prod_10' },
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
    { id: '1', name: 'FashionFinds', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Fashion', viewers: 1200, buyers: 25, rating: 4.8, reviews: 12, hint: 'woman posing stylish outfit', productId: 'prod_1' },
    { id: '2', name: 'GadgetGuru', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Electronics', viewers: 2500, buyers: 42, rating: 4.9, reviews: 28, hint: 'unboxing new phone', productId: 'prod_2' },
    { id: '3', name: 'HomeHaven', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Home Goods', viewers: 850, buyers: 15, rating: 4.7, reviews: 9, hint: 'modern living room decor', productId: 'prod_3' },
    { id: '4', name: 'BeautyBox', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Beauty', viewers: 3100, buyers: 78, rating: 4.9, reviews: 55, hint: 'makeup tutorial', productId: 'prod_4' },
    { id: '5', name: 'KitchenWiz', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Kitchenware', viewers: 975, buyers: 0, rating: 0, reviews: 0, hint: 'cooking demonstration', productId: 'prod_5' },
    { id: '6', name: 'FitFlow', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Fitness', viewers: 1500, buyers: 33, rating: 4.6, reviews: 18, hint: 'yoga session', productId: 'prod_6' },
    { id: '7', name: 'ArtisanAlley', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Handmade', viewers: 450, buyers: 8, rating: 5.0, reviews: 6, hint: 'pottery making', productId: 'prod_7' },
    { id: '8', name: 'PetPalace', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Pet Supplies', viewers: 1800, buyers: 50, rating: 4.8, reviews: 30, hint: 'playing with puppy', productId: 'prod_8' },
    { id: '9', name: 'BookNook', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Books', viewers: 620, buyers: 12, rating: 4.9, reviews: 10, hint: 'reading book cozy', productId: 'prod_9' },
    { id: '10', name: 'GamerGuild', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Gaming', viewers: 4200, buyers: 102, rating: 4.9, reviews: 80, hint: 'esports competition', productId: 'prod_10' },
];

const mockChatDatabase: Record<string, Message[]> = {
  "FashionFinds": [
    { id: 1, text: "Hey! I saw your stream and I'm interested in the vintage camera. Is it still available?", senderId: 'customer', timestamp: '10:00 AM' },
    { id: 2, text: "Hi there! Yes, it is. It's in great working condition.", senderId: 'seller', timestamp: '10:01 AM' },
    { id: 3, text: "Awesome! Could you tell me a bit more about the lens?", senderId: 'customer', timestamp: '10:01 AM' },
  ],
  "GadgetGuru": [
      { id: 1, text: "I have a question about the X-1 Drone.", senderId: 'customer', timestamp: 'Yesterday' },
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
    onNotifyMe,
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
    onNotifyMe: (product: any) => void;
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
                a.download = "nipher_image_" + Date.now() + ".jpg";
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
                    <span key={index} className="text-primary hover:underline cursor-pointer" onClick={() => onHashtagClick(tag)}>
                       <Highlight text={part} highlight={highlightTerm} />
                    </span>
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
                 <div className="p-4 pb-0">
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
                                            className="h-7 w-7 p-0 sm:w-auto sm:px-2 text-xs"
                                            onClick={() => {
                                                onFollowToggle(post.sellerId);
                                                setIsFollowingState(prev => !prev);
                                            }}
                                        >
                                            {isFollowingState ? <UserCheck className="h-4 w-4 sm:mr-1.5" /> : <UserPlus className="h-4 w-4 sm:mr-1.5" />}
                                            <span className="hidden sm:inline">{isFollowingState ? "Following" : "Follow"}</span>
                                        </Button>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground font-normal">
                                    {post.timestamp}
                                </div>
                            </div>
                        </div>
                         <div className="flex items-center gap-2">
                             {post.taggedProducts && post.taggedProducts.length > 0 && (
                                <CollapsibleTrigger asChild>
                                    <Button variant="secondary" size="sm" className="h-7 w-7 p-0 sm:w-auto sm:px-2 text-xs">
                                        <ShoppingBag className="w-4 h-4 sm:mr-1"/>
                                        <span className="hidden sm:inline">View Products</span>
                                    </Button>
                                </CollapsibleTrigger>
                            )}
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
                    </div>
                </div>

                <div className="px-4 pt-3">
                     <CollapsibleContent>
                        {post.taggedProducts && post.taggedProducts.length > 0 && (
                            <Card className="mb-3">
                                <CardContent className="p-3 divide-y">
                                    {post.taggedProducts.map((product: any, index: number) => (
                                        <div key={product.key || index} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                                            <Link href={`/product/${product.key}`}>
                                                <Image src={product.image?.preview || product.images?.[0] || 'https://placehold.co/60x60.png'} alt={product.name} width={60} height={60} className="rounded-md" />
                                            </Link>
                                            <div className="flex-grow">
                                                <Link href={`/product/${product.key}`} className="hover:underline">
                                                    <h4 className="font-semibold text-sm">{product.name}</h4>
                                                </Link>
                                                <p className="font-bold text-lg">{product.price}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {product.stock > 0 ? `Stock: ${product.stock}` : <span className="text-destructive font-semibold">Out of Stock</span>}
                                                </p>
                                            </div>
                                             <div className="flex items-center gap-2">
                                                 {product.stock > 0 ? (
                                                    <>
                                                        <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => onAddToCart(product)}>
                                                            <ShoppingCart className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" className="h-9" onClick={() => onBuyNow(product)}>
                                                            Buy Now
                                                        </Button>
                                                    </>
                                                 ) : (
                                                     <Button size="sm" className="h-9" onClick={() => onNotifyMe(product)}>
                                                        Notify Me
                                                    </Button>
                                                 )}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </CollapsibleContent>
                </div>
                    
                <div className="px-4">
                     <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {renderContentWithHashtags(post.content)}
                    </div>
                </div>

                {imageCount > 0 && (
                    <div className="px-4 pt-4">
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
  const pathname = usePathname();
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
  const [activeHashtag, setActiveHashtag] = useState<string | null>(null);
  const [savesSubTab, setSavesSubTab] = useState('saved-posts');
  
  const { open, setOpen } = useSidebar();
  const doubleClickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showSuggestions = debouncedSearchTerm.length > 0 && (searchSuggestions.users.length > 0 || searchSuggestions.hashtags.length > 0 || searchSuggestions.posts.length > 0);

   const handleSelectConversation = (convo: Conversation) => {
    setSelectedConversation(convo);
    // @ts-ignore
    setCurrentMessages(mockChatDatabase[convo.userName] || []);
  };

  const handleSendMessage = (text: string) => {
    if (!selectedConversation || !user) return;
    const newMessage: Message = {
      id: Date.now(),
      senderId: user.uid,
      user: userData?.displayName,
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
            (post.content.match(/#(\w+)/g) || []).map((tag: string) => tag.substring(1)).filter((tag: string) => tag.toLowerCase().includes(lowercasedTerm.replace('#', '')))
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
    const handleTabChange = async () => {
      const tabFromUrl = searchParams.get('tab');
      if (tabFromUrl && ['feed', 'saves', 'messages'].includes(tabFromUrl)) {
        setMainTab(tabFromUrl);
      } else if (pathname === '/feed') {
        setMainTab('feed');
      }

      if (tabFromUrl === 'messages' && user && userData) {
        const preselectUserId = searchParams.get('userId');
        const preselectUserName = searchParams.get('userName');

        // This is a simplified version. In a real app, you'd fetch from a backend.
        let allConvos = Object.entries(mockChatDatabase).map(([userName, messages]) => ({
          conversationId: userName, // Using name as ID for mock
          userId: userName, // Using name as ID for mock
          userName: userName,
          avatarUrl: `https://placehold.co/40x40.png?text=${userName.charAt(0)}`,
          lastMessage: messages.length > 0 ? (messages[messages.length - 1].text || "Image") : "No messages yet.",
          lastMessageTimestamp: messages.length > 0 ? messages[messages.length - 1].timestamp : "",
          unreadCount: 0,
        }));
        
        let convoToSelect: Conversation | null = null;
        
        if (preselectUserId) {
          const existingConvo = allConvos.find(c => c.userId === preselectUserId || c.userName === preselectUserName);
          if (existingConvo) {
            convoToSelect = existingConvo;
          } else {
            // Create a new conversation object locally if it doesn't exist
            const otherUser = await getUserByDisplayName(preselectUserName || "") || { photoURL: '' };
            const newConvo: Conversation = {
              conversationId: preselectUserId,
              userId: preselectUserId,
              userName: preselectUserName || 'New Chat',
              avatarUrl: otherUser?.photoURL || `https://placehold.co/40x40.png?text=${(preselectUserName || 'U').charAt(0)}`,
              lastMessage: "Start a new conversation.",
              lastMessageTimestamp: 'now',
              unreadCount: 0,
            };
            allConvos = [newConvo, ...allConvos];
            convoToSelect = newConvo;
            // Add to mock DB for this session
            mockChatDatabase[newConvo.userName] = [];
          }
        } else if (allConvos.length > 0) {
            convoToSelect = allConvos[0];
        }

        setConversations(allConvos);
        
        if (convoToSelect && !isMobile) {
          handleSelectConversation(convoToSelect);
        }
      }
    };
    if (isMounted && user) {
        handleTabChange();
    }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [searchParams, isMounted, user, userData, isMobile]);



  const userPosts = useMemo(() => {
    if (!user) return [];
    return feed.filter(post => post.sellerId === user.uid);
  }, [feed, user]);
  
  const filteredFeed = useMemo(() => {
    let currentFeed: any[] = [];
    if (feedTab === 'following' && user) {
        currentFeed = feed.filter(post => 
            followingIds.includes(post.sellerId) || post.sellerId === user.uid
        );
    } else {
        currentFeed = feed;
    }

    if(activeHashtag) {
        setFeedTab(`hashtag-${activeHashtag}`);
        return currentFeed.filter(item => 
            item.content.toLowerCase().includes(`#${activeHashtag.toLowerCase()}`)
        );
    }
    
    const lowercasedSearchTerm = debouncedSearchTerm.toLowerCase();
    if (!lowercasedSearchTerm) return currentFeed;

    if(lowercasedSearchTerm.startsWith('#')) {
        return currentFeed.filter(item => 
            item.content.toLowerCase().includes(lowercasedSearchTerm)
        );
    }

    return currentFeed.filter(item => 
        item.sellerName.toLowerCase().includes(lowercasedSearchTerm) || item.content.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [debouncedSearchTerm, feed, feedTab, followingIds, user, activeHashtag]);
  
  const filteredSavedPosts = useMemo(() => {
      let postsToFilter = savedPosts;
      if (savesSubTab === 'upvoted-posts') {
          // This is a placeholder for actual upvoted posts logic
          postsToFilter = []; 
      }
      if (!debouncedSearchTerm) return postsToFilter;

      const lowercasedSearchTerm = debouncedSearchTerm.toLowerCase();
      if(lowercasedSearchTerm.startsWith('#')) {
        return postsToFilter.filter(item => 
            (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(lowercasedSearchTerm.substring(1))))
        );
      }
      return postsToFilter.filter(item => 
          item.sellerName.toLowerCase().includes(lowercasedSearchTerm) || item.content.toLowerCase().includes(lowercasedSearchTerm)
      );
  }, [debouncedSearchTerm, savedPosts, savesSubTab]);


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
        .map(([topic, posts]) => ({ topic, posts: `${posts} post${posts > 1 ? 's' : ''}` }));
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
                    productDetails['prod_1'],
                    {...productDetails['prod_3'], stock: 0}
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
  
  const handleRefresh = useCallback(() => {
    toast({ title: "Refreshing feed..." });
    setupFeedListener();
  }, [setupFeedListener, toast]);

 const handleDoubleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (doubleClickTimeoutRef.current) {
      clearTimeout(doubleClickTimeoutRef.current);
      doubleClickTimeoutRef.current = null;
      handleRefresh();
    } else {
      doubleClickTimeoutRef.current = setTimeout(() => {
        doubleClickTimeoutRef.current = null;
        // This is a single click, which is handled by onValueChange.
        // We let the default TabsTrigger behavior handle it.
      }, 300);
    }
  };

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
  
  const handleNotifyMe = (product: any) => {
      toast({
          title: "You're on the list!",
          description: `We'll notify you when ${product.name} is back in stock.`
      })
  }

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
                        onNotifyMe={handleNotifyMe}
                        isSaved={isPostSaved(post.id)}
                        isFollowing={followingIds.includes(post.sellerId)}
                        highlightTerm={debouncedSearchTerm}
                        onHashtagClick={(tag) => {
                            setActiveHashtag(tag);
                            setFeedTab(`hashtag-${tag}`);
                            setSearchTerm('');
                        }}
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
    <Tabs value={feedTab} onValueChange={(value) => {
        if (!value.startsWith('hashtag-')) {
            setActiveHashtag(null);
            setFeedTab(value);
        }
    }} className="w-full h-full flex flex-col">
      <div className="flex-shrink-0 border-b px-4 sm:px-6 lg:px-8">
        <TabsList className="bg-transparent p-0">
          <TabsTrigger value="for-you" onClick={handleDoubleClick} onDoubleClick={(e) => e.preventDefault()} className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-4 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">For You</TabsTrigger>
          <TabsTrigger value="following" onClick={handleDoubleClick} onDoubleClick={(e) => e.preventDefault()} className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-4 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">Following</TabsTrigger>
           {activeHashtag && (
             <TabsTrigger value={`hashtag-${activeHashtag}`} className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-4 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">
                <div className="flex items-center gap-2">
                    <span>#{activeHashtag}</span>
                    <button onClick={(e) => { e.stopPropagation(); setActiveHashtag(null); setFeedTab('for-you'); }} className="rounded-full hover:bg-muted p-0.5">
                        <X className="h-3 w-3" />
                    </button>
                </div>
            </TabsTrigger>
           )}
        </TabsList>
      </div>
      <TabsContent value={feedTab} className="flex-grow mt-0 overflow-y-auto no-scrollbar">
        {renderPostList(filteredFeed, isLoadingFeed)}
      </TabsContent>
    </Tabs>
  );

  const renderSavesContent = () => (
    <Tabs defaultValue="saved-posts" value={savesSubTab} onValueChange={setSavesSubTab} className="w-full h-full flex flex-col">
      <div className="flex-shrink-0 border-b px-4 sm:px-6 lg:px-8">
        <TabsList className="bg-transparent p-0">
          <TabsTrigger value="saved-posts" className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-4 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">Saved Posts</TabsTrigger>
          <TabsTrigger value="upvoted-posts" className="relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-4 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:shadow-none">Upvoted Posts</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="saved-posts" className="flex-grow mt-0 overflow-y-auto no-scrollbar">
        {renderPostList(filteredSavedPosts, false)}
      </TabsContent>
      <TabsContent value="upvoted-posts" className="flex-grow mt-0 overflow-y-auto no-scrollbar">
        <div className="text-center py-20 text-muted-foreground">
          <Heart className="h-12 w-12 mx-auto mb-4"/>
          <p className="text-lg font-semibold">No upvoted posts yet</p>
          <p>Posts you upvote will appear here.</p>
        </div>
      </TabsContent>
    </Tabs>
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
    <div className="h-dvh w-full">
         <div className={cn(
             "grid h-full w-full", 
             (mainTab === 'feed' || mainTab === 'saves') && "lg:grid-cols-[260px_1fr_320px]",
             (mainTab === 'messages') && "lg:grid-cols-[260px_1fr]"
         )}>
                <aside className="h-screen sticky top-0 flex-col border-r border-border/50 hidden lg:flex">
                    <MainSidebar userData={userData!} userPosts={userPosts} />
                </aside>

                 <div className="flex flex-col h-full overflow-hidden">
                    <header className="flex-shrink-0 sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border/50 flex flex-col">
                        <div className="p-4 flex items-center justify-between gap-4">
                            <Button variant="ghost" className="h-10 px-4" onClick={() => router.back()}>
                                <ArrowLeft className="h-5 w-5 mr-2" />
                                Back
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
                        </div>
                    </header>
                    <div className={cn("flex-1 flex flex-col overflow-hidden", isMobile && selectedPostForComments && "hidden")}>
                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            {renderMainContent()}
                        </div>
                        
                        {mainTab === 'feed' && (
                            <div className="flex-shrink-0 mt-auto sticky bottom-0 z-10">
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
                     <Sheet open={!!selectedPostForComments} onOpenChange={(open) => !open && setSelectedPostForComments(null)}>
                        <SheetContent side={isMobile ? "bottom" : "right"} className={cn(isMobile ? "h-[85dvh] p-0" : "lg:w-96 p-0 border-l")}>
                            <CommentColumn post={selectedPostForComments} onClose={() => setSelectedPostForComments(null)} />
                        </SheetContent>
                    </Sheet>
                </div>

                {(mainTab === 'feed' || mainTab === 'saves') && (
                    <aside className="h-screen sticky top-0 flex-col border-l border-border/50 hidden lg:flex">
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
                                                        <button onClick={() => {
                                                            setActiveHashtag(topic.topic);
                                                            setFeedTab(`hashtag-${topic.topic}`);
                                                        }} className="font-semibold hover:underline text-left w-full">
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
    

    
