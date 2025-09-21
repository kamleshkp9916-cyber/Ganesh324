

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
  BookText,
  ArrowLeft,
  PanelLeft,
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
import { useRouter, useSearchParams } from 'next/navigation';
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
import { ConversationList, ChatWindow, Conversation } from '@/components/messaging/common';
import { MainSidebar } from '@/components/main-sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

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
    { userId: "FashionFinds", userName: "FashionFinds", avatarUrl: "https://placehold.co/40x40.png", lastMessage: "Awesome! Could you tell me a bit more about the lens?", lastMessageTimestamp: "10:01 AM", unreadCount: 1 },
    { userId: "GadgetGuru", userName: "GadgetGuru", avatarUrl: "https://placehold.co/40x40.png", lastMessage: "Sure, what would you like to know?", lastMessageTimestamp: "Yesterday", unreadCount: 0 },
];

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
    isSaved,
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
    isSaved: boolean,
    currentUser: User | null,
    highlightTerm?: string,
    onHashtagClick: (tag: string) => void;
    onCommentClick: (post: any) => void;
}) => {
    
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const { toast } = useToast();

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


    return (
        <Dialog>
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
                <div className="absolute top-0 left-0 right-0 h-px bg-border/20 opacity-50"></div>
                <div className="p-4">
                    <div className="flex items-start justify-between">
                        <Link href={`/seller/profile?userId=${post.sellerId}`} className="flex items-center gap-3 group">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={post.avatarUrl} />
                                <AvatarFallback>{post.sellerName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <span className="font-semibold group-hover:underline">
                                    <Highlight text={post.sellerName} highlight={highlightTerm} />
                                </span>
                                <div className="text-xs text-muted-foreground font-normal">
                                    {post.timestamp}
                                </div>
                            </div>
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {currentUser && currentUser.uid === post.sellerId && (
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
                <div className="absolute bottom-0 left-0 right-0 h-px bg-border/20 opacity-50"></div>
            </Card>
        </Dialog>
    )
}

function FeedPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTabParam = searchParams.get('tab');
  const feedFilterParam = searchParams.get('filter');

  const { user, userData, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
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

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const activeView = (activeTabParam === 'saves' || activeTabParam === 'messages') ? activeTabParam : 'feed';
  const feedFilter = feedFilterParam === 'following' ? 'following' : 'global';
  const showSuggestions = debouncedSearchTerm.length > 0 && (searchSuggestions.users.length > 0 || searchSuggestions.hashtags.length > 0 || searchSuggestions.posts.length > 0);


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

  const loadConversations = useCallback(() => {
    const preselectUserId = searchParams.get('userId');
    const preselectUserName = searchParams.get('userName');
    let allConvos = [...mockConversations];

    if (preselectUserId && isMobile) {
        const existingConvo = allConvos.find(c => c.userId === preselectUserId);
        if (existingConvo) {
            setSelectedConversation(existingConvo);
        }
    }
    setConversations(allConvos);

  }, [searchParams, isMobile]);

  useEffect(() => {
    setIsMounted(true);
    loadFollowData();
    loadSavedPosts();
    loadConversations();
    
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'streamcart_saved_posts') {
            loadSavedPosts();
        }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    }
  }, [loadFollowData, loadSavedPosts, loadConversations]);

  const userPosts = useMemo(() => {
    if (!user) return [];
    return feed.filter(post => post.sellerId === user.uid);
  }, [feed, user]);
  
  const filteredFeed = useMemo(() => {
    let currentFeed: any[] = [];
    if (activeView === 'feed') {
        currentFeed = feed;
        if (feedFilter === 'following' && user) {
            currentFeed = currentFeed.filter(post => 
                followingIds.includes(post.sellerId) || post.sellerId === user.uid
            );
        }
    } else if (activeView === 'saves') {
        currentFeed = savedPosts;
    }
    
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    if (!lowercasedSearchTerm) return currentFeed;

    if(lowercasedSearchTerm.startsWith('#')) {
        return currentFeed.filter(item => 
            (item.tags && item.tags.some((tag: string) => tag.toLowerCase().includes(lowercasedSearchTerm.substring(1))))
        );
    }

    return currentFeed.filter(item => 
        item.sellerName.toLowerCase().includes(lowercasedSearchTerm) || item.content.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [searchTerm, feed, feedFilter, followingIds, user, activeView, savedPosts]);

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
            setFeed(postsData);
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
            };
            
            await updateDoc(postRef, dataToUpdate);
            toast({ title: "Post Updated!", description: "Your changes have been saved." });
            
        } else {
            const db = getFirestoreDb();
            const dataToSave: any = {
                content: postData.content,
                tags: Array.from(postData.content.matchAll(/#(\w+)/g) || []).map((match: any) => match[1]),
                taggedProduct: postData.taggedProduct ? {
                    id: postData.taggedProduct.id,
                    name: postData.taggedProduct.name,
                    price: postData.taggedProduct.price,
                    image: postData.taggedProduct.images[0]?.preview,
                } : null,
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
  
  const handleMobileConversationSelect = (convo: Conversation) => {
    if (isMobile) {
        setSelectedConversation(convo);
    }
  }

  const renderMessages = () => {
    if (isMobile) {
        if (selectedConversation) {
            return <ChatWindow conversation={selectedConversation} userData={userData} onBack={() => setSelectedConversation(null)} />;
        } else {
            return <ConversationList conversations={conversations} selectedConversation={null} onSelectConversation={handleMobileConversationSelect} />;
        }
    }
    // Desktop view
    return (
        <div className="flex h-full border-t">
            <div className="w-full md:w-1/3 border-r h-full overflow-y-auto">
                 <ConversationList conversations={conversations} selectedConversation={selectedConversation} onSelectConversation={setSelectedConversation} />
            </div>
            <div className="hidden md:flex w-2/3 h-full">
                {selectedConversation ? (
                    <ChatWindow conversation={selectedConversation} userData={userData} onBack={() => {}} />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Select a conversation
                    </div>
                )}
            </div>
        </div>
    );
  }

  return (
    <>
      <AlertDialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Report Post</AlertDialogTitle>
            <AlertDialogDescription>
                Please select a reason for reporting this post. Your feedback is important to us.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="grid gap-2">
                {reportReasons.map(reason => (
                    <Button
                        key={reason.id}
                        variant={selectedReportReason === reason.id ? "secondary" : "ghost"}
                        onClick={() => setSelectedReportReason(reason.id)}
                        className="justify-start"
                    >
                        {reason.label}
                    </Button>
                ))}
            </div>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedReportReason("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={submitReport} disabled={!selectedReportReason}>
                Submit Report
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
        <div className={cn("min-h-screen bg-background text-foreground", isMobile && activeView === 'messages' && "h-screen")}>
            <div className="grid md:grid-cols-[250px_1fr] lg:grid-cols-[250px_1fr_350px]">
                
                <aside className="hidden md:flex flex-col h-screen border-r sticky top-0">
                    <MainSidebar userData={userData!} userPosts={userPosts} />
                </aside>

                <main className={cn("min-w-0 h-screen flex flex-col", activeView === 'messages' && "h-full")}>
                    <header className="p-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-30 flex items-center gap-2 justify-between">
                        <SidebarTrigger />
                        {activeView !== 'messages' && (
                            <Popover open={showSuggestions} onOpenChange={(open) => !open && setSearchSuggestions({users:[], hashtags:[], posts:[]})}>
                                <PopoverAnchor asChild>
                                    <div className="relative w-full max-w-sm">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            placeholder="Search for users, posts, #tags"
                                            className="bg-transparent rounded-full pl-10"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </PopoverAnchor>
                                <PopoverContent className="w-[--radix-popover-trigger-width] mt-2 p-2 max-h-80 overflow-y-auto" align="start">
                                    <div className="space-y-4">
                                        {searchSuggestions.users.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold text-sm px-2 mb-1">Users</h4>
                                                {searchSuggestions.users.map(u => (
                                                    <button key={u.uid} className="w-full text-left p-2 rounded-md hover:bg-accent" onClick={() => handleSearchFilter('user', u.uid)}>
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-8 w-8"><AvatarImage src={u.photoURL} /><AvatarFallback>{u.displayName.charAt(0)}</AvatarFallback></Avatar>
                                                            <Highlight text={u.displayName} highlight={debouncedSearchTerm} />
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {searchSuggestions.hashtags.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold text-sm px-2 mb-1">Hashtags</h4>
                                                {searchSuggestions.hashtags.map(h => (
                                                    <button key={h} className="w-full text-left p-2 rounded-md hover:bg-accent" onClick={() => handleSearchFilter('hashtag', h)}>
                                                        <div className="flex items-center gap-2 font-semibold">
                                                            <Hash className="h-4 w-4 text-muted-foreground" />
                                                            <Highlight text={h} highlight={debouncedSearchTerm.replace('#', '')} />
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {searchSuggestions.posts.length > 0 && (
                                            <div>
                                                <h4 className="font-semibold text-sm px-2 mb-1">Posts</h4>
                                                {searchSuggestions.posts.map(p => (
                                                    <div key={p.id} className="p-2 text-sm text-muted-foreground truncate">
                                                        <BookText className="h-4 w-4 inline-block mr-2" />
                                                        <Highlight text={p.content} highlight={debouncedSearchTerm} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {(searchSuggestions.users.length + searchSuggestions.hashtags.length + searchSuggestions.posts.length) === 0 && debouncedSearchTerm.length > 0 && (
                                            <p className="text-center text-sm text-muted-foreground p-4">No results found.</p>
                                        )}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        )}
                        <div/>
                    </header>
                    
                    <div className="flex-grow overflow-y-auto no-scrollbar max-w-3xl w-full mx-auto">
                        {activeView === 'messages' ? renderMessages() :
                        (
                            <section>
                                {activeView === 'saves' ? (
                                    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
                                        {filteredFeed.map(post => (
                                            <FeedPost 
                                                key={post.id}
                                                post={post}
                                                currentUser={user}
                                                onDelete={handleDeletePost}
                                                onEdit={handleEditPost}
                                                onShare={handleShare}
                                                onReport={() => setIsReportDialogOpen(true)}
                                                onSaveToggle={handleSaveToggle}
                                                isSaved={isPostSaved(post.id)}
                                                highlightTerm={debouncedSearchTerm}
                                                onHashtagClick={(tag) => setSearchTerm(`#${tag}`)}
                                                onCommentClick={(post) => setSelectedPostForComments(post)}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/20">
                                        {isLoadingFeed ? (
                                            <>
                                                <FeedPostSkeleton />
                                                <FeedPostSkeleton />
                                            </>
                                        ) : (
                                            filteredFeed.map(post => (
                                                <FeedPost 
                                                    key={post.id}
                                                    post={post}
                                                    currentUser={user}
                                                    onDelete={handleDeletePost}
                                                    onEdit={handleEditPost}
                                                    onShare={handleShare}
                                                    onReport={() => setIsReportDialogOpen(true)}
                                                    onSaveToggle={handleSaveToggle}
                                                    isSaved={isPostSaved(post.id)}
                                                    highlightTerm={debouncedSearchTerm}
                                                    onHashtagClick={(tag) => setSearchTerm(`#${tag}`)}
                                                    onCommentClick={(post) => setSelectedPostForComments(post)}
                                                />
                                            ))
                                        )}
                                    </div>
                                )}
                                {filteredFeed.length === 0 && !isLoadingFeed && (
                                    <div className="text-center py-16 text-muted-foreground">
                                        <h3 className="text-lg font-semibold">No Posts Found</h3>
                                        <p className="text-sm">Try changing your filters or searching for something else.</p>
                                    </div>
                                )}
                            </section>
                        )}
                    </div>
                    {activeView === 'feed' && (
                         <div className="w-full max-w-3xl mx-auto pointer-events-auto mt-auto">
                            <div className="p-3 bg-background/80 backdrop-blur-sm rounded-t-lg">
                                <CreatePostForm
                                    onPost={handlePostSubmit}
                                    postToEdit={postToEdit}
                                    onFinishEditing={onFinishEditing}
                                    isSubmitting={isFormSubmitting}
                                />
                            </div>
                        </div>
                    )}
                </main>
                 <aside className="hidden lg:flex flex-col h-screen border-l sticky top-0">
                    {selectedPostForComments ? (
                        <CommentColumn 
                            post={selectedPostForComments} 
                            onClose={() => setSelectedPostForComments(null)} 
                        />
                    ) : (
                        activeView !== 'messages' && (
                            <div className="p-6 space-y-6 h-full overflow-y-auto no-scrollbar">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Trending</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {trendingTopics.map((topic, index) => (
                                                <div key={index}>
                                                    <Link href="#" className="font-semibold hover:underline" onClick={() => setSearchTerm(`#${topic.topic}`)}>#{topic.topic}</Link>
                                                    <p className="text-xs text-muted-foreground">{topic.posts}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Trending Streams</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {trendingStreams.map((stream) => (
                                                <Link href={`/stream/${stream.id}`} key={stream.id} className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarImage src={stream.avatarUrl}/>
                                                                <AvatarFallback>{stream.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-0.5 animate-pulse">
                                                            <RadioTower className="h-2 w-2 text-white"/>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-sm group-hover:underline">{stream.name}</p>
                                                            <p className="text-xs text-muted-foreground">{stream.category}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Users className="h-3 w-3"/>
                                                        {stream.viewers}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )
                    )}
                </aside>
            </div>
        </div>
    </>
  )
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
