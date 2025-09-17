

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
  Loader2,
  FileEdit,
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
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { CreatePostForm, PostData } from '@/components/create-post-form';
import { getCart } from '@/lib/product-history';
import { Dialog, DialogHeader, DialogTitle, DialogTrigger, DialogContent, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { GoLiveDialog } from '@/components/go-live-dialog';
import { collection, query, orderBy, onSnapshot, Timestamp, deleteDoc, doc, updateDoc, increment, addDoc, serverTimestamp, where, getDocs, runTransaction, limit, Unsubscribe } from "firebase/firestore";
import { getFirestoreDb, getFirebaseStorage } from '@/lib/firebase';
import { format, formatDistanceToNowStrict, isThisWeek, isThisYear } from 'date-fns';
import { ref as storageRef, deleteObject, uploadString, getDownloadURL } from 'firebase/storage';
import { isFollowing, toggleFollow, UserData, getUserByDisplayName, getFollowing } from '@/lib/follow-data';
import { productDetails } from '@/lib/product-data';
import { PromotionalCarousel } from '@/components/promotional-carousel';
import { Logo } from '@/components/logo';
import { categories } from '@/lib/categories';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getMessages, sendMessage, getConversations, Message as ChatMessageData, Conversation } from '@/ai/flows/chat-flow';
import { getExecutiveMessages, sendExecutiveMessage } from '@/ai/flows/executive-chat-flow';
import { useIsMobile } from '@/hooks/use-mobile';
import { getSavedPosts, isPostSaved, toggleSavePost } from '@/lib/post-history';


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
            </div>
            <div className="px-4 pb-4 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="w-full aspect-video rounded-lg" />
            </div>
        </Card>
    );
}

const SidebarContent = ({ userData, userPosts, feedFilter, setFeedFilter, activeView, setActiveView }: { userData: UserData, userPosts: any[], feedFilter: 'global' | 'following', setFeedFilter: (filter: 'global' | 'following') => void, activeView: 'feed' | 'messages' | 'saves', setActiveView: (view: 'feed' | 'messages' | 'saves') => void }) => {
    const router = useRouter();
    return (
        <div className="p-6 flex flex-col h-full">
             <div className="flex items-center gap-2 mb-8">
                 <Button variant="ghost" size="icon" className="-ml-2" onClick={() => router.push('/live-selling')}>
                    <ArrowLeft />
                </Button>
                <div className="flex-grow" />
            </div>
            <div className="flex flex-col items-center text-center mb-8">
                <Avatar className="h-20 w-20 mb-3">
                    <AvatarImage src={userData.photoURL || undefined} alt={userData.displayName} />
                    <AvatarFallback>{userData.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="font-bold text-lg">{userData.displayName}</p>
                <p className="text-sm text-muted-foreground">@{userData.displayName.toLowerCase().replace(' ', '')}</p>

                <div className="flex justify-around mt-4 w-full text-center">
                    <div>
                        <p className="font-bold text-lg">{userPosts.length}</p>
                        <p className="text-xs text-muted-foreground">Posts</p>
                    </div>
                    <div>
                        <p className="font-bold text-lg">{userData.followers || 0}</p>
                        <p className="text-xs text-muted-foreground">Followers</p>
                    </div>
                    <div>
                        <p className="font-bold text-lg">{userData.following || 0}</p>
                        <p className="text-xs text-muted-foreground">Following</p>
                    </div>
                </div>
                <Separator className="my-4" />
            </div>
            <nav className="space-y-1 flex-grow">
                <Collapsible defaultOpen>
                    <CollapsibleTrigger asChild>
                         <Button variant="ghost" className="w-full justify-start gap-3 text-base data-[active=true]:bg-primary/10 data-[active=true]:text-primary" data-active={activeView === 'feed'} onClick={() => setActiveView('feed')}>
                            <Home /> Feed
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-8 space-y-1 mt-1">
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground data-[active=true]:text-primary data-[active=true]:bg-primary/10" data-active={feedFilter === 'global' && activeView === 'feed'} onClick={() => { setFeedFilter('global'); setActiveView('feed'); }}>
                            <Globe className="w-4 h-4" /> Global
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground data-[active=true]:text-primary data-[active=true]:bg-primary/10" data-active={feedFilter === 'following' && activeView === 'feed'} onClick={() => { setFeedFilter('following'); setActiveView('feed'); }}>
                            <Users className="w-4 h-4" /> Following
                        </Button>
                    </CollapsibleContent>
                </Collapsible>
                 <Button variant="ghost" className="w-full justify-start gap-3 text-base data-[active=true]:bg-primary/10 data-[active=true]:text-primary" data-active={activeView === 'messages'} onClick={() => setActiveView('messages')}>
                    <MessageSquare /> Messages
                </Button>
                 <Button variant="ghost" className="w-full justify-start gap-3 text-base data-[active=true]:bg-primary/10 data-[active=true]:text-primary" data-active={activeView === 'saves'} onClick={() => setActiveView('saves')}>
                    <Save /> Saves
                 </Button>
                 <Link href="/setting" className={cn(buttonVariants({ variant: 'ghost' }), "w-full justify-start gap-3 text-base")}>
                    <Settings /> Settings
                </Link>
            </nav>
        </div>
    );
};


const RealtimeTimestamp = ({ date, isEdited }: { date: Date | string, isEdited?: boolean }) => {
    const [relativeTime, setRelativeTime] = useState('');

    const formatTimestamp = useCallback((d: Date): string => {
        const now = new Date();
        const diffInSeconds = (now.getTime() - d.getTime()) / 1000;
        if (diffInSeconds < 60 * 60 * 24) {
            const distance = formatDistanceToNowStrict(d, { addSuffix: false });
            return distance.replace(/about /g, '').replace(/ seconds?/, 's').replace(/ minutes?/, 'm').replace(/ hours?/, 'h');
        }
        if (isThisWeek(d, { weekStartsOn: 1 })) {
            return format(d, 'E'); // Mon, Tue
        }
        if (isThisYear(d)) {
            return format(d, 'MMM d'); // Sep 12
        }
        return format(d, 'MMM d, yyyy'); // Sep 12, 2024
    }, []);

    useEffect(() => {
      const d = new Date(date);
      setRelativeTime(formatTimestamp(d));

      const interval = setInterval(() => {
        setRelativeTime(formatTimestamp(d));
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }, [date, formatTimestamp]);

    return (
        <>
            {relativeTime}
            {isEdited && <span className="text-muted-foreground/80"> • Edited</span>}
        </>
    );
  };

const FeedPost = ({ 
    post, 
    onDelete, 
    onEdit, 
    onShare,
    onReport,
    onSaveToggle,
    isSaved,
    currentUser,
} : {
    post: any,
    onDelete: (post: any) => void,
    onEdit: (post: any) => void,
    onShare: (postId: string) => void,
    onReport: () => void,
    onSaveToggle: (post: any) => void,
    isSaved: boolean,
    currentUser: User | null
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
    
    const contentWithoutHashtags = useMemo(() => {
        if (!post.content) return '';
        return post.content.replace(/#(\w+)/g, '').trim();
    }, [post.content]);

    const imageCount = post.images?.length || 0;


    return (
        <Dialog>
            <Card className={cn("border-x-0 border-t-0 rounded-none shadow-none bg-transparent")}>
                <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-transparent border-none" aria-describedby={undefined}>
                    <DialogHeader className="sr-only">
                        <DialogTitle>Post Image</DialogTitle>
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
                <div className="p-4 flex items-center justify-between">
                    <Link href={`/seller/profile?userId=${post.sellerId}`} className="flex items-center gap-3 group">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={post.avatarUrl} />
                            <AvatarFallback>{post.sellerName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold group-hover:underline">{post.sellerName}</p>
                            <p className="text-xs text-muted-foreground">
                                <RealtimeTimestamp date={post.timestamp} isEdited={!!post.lastEditedAt} />
                            </p>
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
                                        <Edit className="mr-2 h-4 w-4" /> Edit Post
                                    </DropdownMenuItem>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete Post
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
                                <Save className={cn("mr-2 h-4 w-4", isSaved && "fill-current")} /> {isSaved ? 'Unsave Post' : 'Save Post'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => onShare(post.id)}><Share2 className="mr-2 h-4 w-4" /> Share</DropdownMenuItem>
                            <DropdownMenuItem onSelect={onReport}><Flag className="mr-2 h-4 w-4" /> Report</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="p-4">
                    {contentWithoutHashtags && <p className="text-sm text-muted-foreground">{contentWithoutHashtags}</p>}
                    {Array.isArray(post.tags) && post.tags.length > 0 && (
                        <p className="text-sm text-primary mt-2">
                            {post.tags.map((tag: string, index: number) => (
                                <span key={index} className="text-primary">{`#${tag} `}</span>
                            ))}
                        </p>
                    )}
                </div>
                {imageCount > 0 && (
                    <div className="px-4">
                        <div className={cn(
                            "grid gap-1 rounded-lg overflow-hidden",
                            imageCount === 1 && "grid-cols-1",
                            imageCount === 2 && "grid-cols-2",
                            imageCount >= 3 && "grid-cols-2"
                        )}>
                            {post.images.slice(0, 4).map((image: any, index: number) => (
                                <DialogTrigger key={image.id || index} asChild>
                                    <div
                                        className={cn(
                                            "cursor-pointer relative group bg-muted",
                                            imageCount === 1 && "aspect-video",
                                            imageCount === 2 && "aspect-square",
                                            imageCount >= 3 && index === 0 && "row-span-2 aspect-[2/3]",
                                            imageCount >= 3 && index > 0 && "aspect-square",
                                            imageCount === 4 && "aspect-square",
                                        )}
                                        onClick={() => setViewingImage(image.url)}
                                    >
                                        <Image src={image.url} alt={`Post image ${index + 1}`} fill className="object-cover w-full h-full" />
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
                <div className="px-4 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" className="flex items-center gap-1.5">
                            <ArrowUp className="w-4 h-4"/>
                            <span>Upvote</span>
                        </Button>
                        <span>{post.likes || 0}</span>
                        <Button variant="ghost" size="icon"><ArrowDown /></Button>
                    </div>
                    <Button variant="ghost" className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4"/>
                        <span>{post.comments || 0} Comments</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onShare(post.id)}>
                        <Share2 />
                    </Button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-px bg-border/20 opacity-50"></div>
            </Card>
        </Dialog>
    )
}

function ChatMessage({ msg, currentUserName }: { msg: ChatMessageData, currentUserName: string | null }) {
    const isMe = msg.sender === 'customer' || msg.sender === currentUserName;
    return (
        <div className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
            {!isMe && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://placehold.co/40x40.png`} />
                    <AvatarFallback>{'S'}</AvatarFallback>
                </Avatar>
            )}
            <div className={`max-w-[70%] rounded-lg px-3 py-2 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {msg.text && <p className="text-sm">{msg.text}</p>}
                {msg.image && (
                    <Image src={msg.image} alt="Sent image" width={200} height={200} className="rounded-md mt-2" />
                )}
                <p className={`text-xs mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'} text-right`}>
                    {msg.timestamp}
                </p>
            </div>
        </div>
    );
}

function ConversationItem({ convo, onClick, isSelected }: { convo: Conversation, onClick: () => void, isSelected: boolean }) {
    return (
        <div 
            className={cn(
                "flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted",
                isSelected && "bg-muted"
            )}
            onClick={onClick}
        >
            <Avatar className="h-12 w-12">
                <AvatarImage src={convo.avatarUrl} alt={convo.userName} />
                <AvatarFallback>{convo.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow overflow-hidden">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold truncate">{convo.userName}</h4>
                    <p className="text-xs text-muted-foreground flex-shrink-0">{convo.lastMessageTimestamp}</p>
                </div>
                <div className="flex justify-between items-start">
                    <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                    {convo.unreadCount > 0 && (
                        <Badge className="bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center text-xs ml-2 flex-shrink-0">
                            {convo.unreadCount}
                        </Badge>
                    )}
                </div>
            </div>
        </div>
    );
}

const MessagesView = ({ userData, onBack, isMobile, onSwitchToFeed }: { userData: UserData, onBack: () => void, isMobile: boolean, onSwitchToFeed: () => void }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<ChatMessageData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = useState("");
    
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const sellerConvos = await getConversations();
                
                const execMessages = await getExecutiveMessages(userData.uid);
                let executiveConversation: Conversation | null = null;
                if (execMessages.length > 0) {
                    const lastMessage = execMessages[execMessages.length - 1];
                    executiveConversation = {
                        userId: userData.uid,
                        userName: 'StreamCart',
                        avatarUrl: 'https://placehold.co/40x40/000000/FFFFFF?text=SC',
                        lastMessage: lastMessage.text || 'Image Sent',
                        lastMessageTimestamp: lastMessage.timestamp,
                        unreadCount: 0,
                        isExecutive: true,
                    };
                }

                let allConvos = [...sellerConvos];
                if (executiveConversation) {
                    allConvos = [executiveConversation, ...allConvos];
                }

                setConversations(allConvos);
                if (allConvos.length > 0 && !isMobile) {
                    handleSelectConversation(allConvos[0]);
                }
            } catch (error) {
                console.error("Failed to fetch conversations:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchConversations();
    }, [userData, isMobile]);
    
    const handleSelectConversation = async (convo: Conversation) => {
        setSelectedConversation(convo);
        setIsChatLoading(true);
        setMessages([]);
        try {
            let chatHistory;
            if (convo.isExecutive) {
                chatHistory = await getExecutiveMessages(convo.userId);
            } else {
                chatHistory = await getMessages(convo.userId);
            }
            setMessages(chatHistory);
        } catch (error) {
            console.error("Failed to fetch messages for", convo.userId, error);
        } finally {
            setIsChatLoading(false);
        }
    }
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation || !userData) return;

        const optimisticMessage: ChatMessageData = {
            id: Math.random(),
            text: newMessage,
            sender: 'customer',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, optimisticMessage]);
        const currentMessage = newMessage;
        setNewMessage("");

        try {
            let updatedMessages;
            if (selectedConversation.isExecutive) {
                updatedMessages = await sendExecutiveMessage(selectedConversation.userId, { text: currentMessage }, 'customer');
            } else {
                updatedMessages = await sendMessage(selectedConversation.userId, { text: currentMessage }, 'customer');
            }
            setMessages(updatedMessages);
        } catch (error) {
            console.error("Failed to send message", error);
             setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id)); // Revert on error
        }
    };
    
    useEffect(() => {
        chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight });
    }, [messages]);
    
    const conversationListContent = (
         <aside className="w-full h-full border-r flex-col flex bg-background">
            <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10 shrink-0">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold">Chats</h1>
                </div>
            </header>
            <div className="p-4 border-b">
                 <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search conversations..."
                        className="pl-8 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="p-2 flex-grow overflow-y-auto">
                {conversations.map(convo => (
                    <ConversationItem 
                        key={convo.userId} 
                        convo={convo} 
                        onClick={() => handleSelectConversation(convo)}
                        isSelected={selectedConversation?.userId === convo.userId}
                    />
                ))}
            </div>
        </aside>
    );

    const chatWindowContent = (
        <main className="w-full h-full flex flex-col bg-background">
            {selectedConversation ? (
                <>
                    <header className="p-4 border-b flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            {isMobile && (
                                <Button variant="ghost" size="icon" onClick={() => setSelectedConversation(null)}>
                                    <ArrowLeft className="h-6 w-6" />
                                </Button>
                            )}
                            <Link href={selectedConversation.isExecutive ? `#` : `/seller/profile?userId=${selectedConversation.userId}`} className="cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={selectedConversation.avatarUrl} />
                                        <AvatarFallback>{selectedConversation.userName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="font-semibold group-hover:underline">{selectedConversation.userName}</h2>
                                        <p className="text-xs text-muted-foreground">Online</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </header>
                    <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto bg-muted/20">
                        {isChatLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-12 w-2/3" />
                                <Skeleton className="h-12 w-1/2 ml-auto" />
                            </div>
                        ) : (
                            messages.map(msg => <ChatMessage key={msg.id} msg={msg} currentUserName={userData?.displayName || null} />)
                        )}
                    </div>
                    <footer className="p-4 border-t shrink-0">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                             <Input 
                                placeholder="Type a message" 
                                className="flex-grow" 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                                <Send className="h-5 w-5"/>
                            </Button>
                        </form>
                    </footer>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <MessageSquare className="h-16 w-16 mb-4"/>
                    <h2 className="text-xl font-semibold">Select a chat</h2>
                    <p>Choose a conversation to start messaging.</p>
                </div>
            )}
        </main>
    );

    if(isMobile) {
        return selectedConversation ? chatWindowContent : conversationListContent;
    }

    return (
        <div className="flex h-full">
            <div className="w-1/3 lg:w-1/4">
                {conversationListContent}
            </div>
            <div className="w-2/3 lg:w-3/4">
                {chatWindowContent}
            </div>
        </div>
    )
}

export default function FeedPage() {
  type ActiveView = 'feed' | 'messages' | 'saves';
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const [feed, setFeed] = useState<any[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState("");
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [feedFilter, setFeedFilter] = useState<'global' | 'following'>('global');
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [postToEdit, setPostToEdit] = useState<any | null>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('feed');
  const [savedPosts, setSavedPosts] = useState<any[]>([]);

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
    
    if (!searchTerm) return currentFeed;

    return currentFeed.filter(item => 
        item.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, feed, feedFilter, followingIds, user, activeView, savedPosts]);

  const userPosts = useMemo(() => {
    if (!user) return [];
    return feed.filter(post => post.sellerId === user.uid);
  }, [feed, user]);
  
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
                timestamp: doc.data().timestamp ? (doc.data().timestamp as Timestamp).toDate() : new Date()
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
        if (postToEdit) { // This is an edit
            const db = getFirestoreDb();
            const postRef = doc(db, 'posts', postToEdit.id);
            
            const dataToUpdate: any = {
                content: postData.content,
                location: postData.location,
                tags: Array.from(postData.content.matchAll(/#(\w+)/g) || []).map((match: any) => match[1]),
                lastEditedAt: serverTimestamp(),
            };
            
            await updateDoc(postRef, dataToUpdate);
            toast({ title: "Post Updated!", description: "Your changes have been saved." });
            
        } else { // This is a new post
            const db = getFirestoreDb();
            const dataToSave: any = {
                content: postData.content,
                location: postData.location,
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
        onFinishEditing(); // This will clear the form state
    }
  };
  
  if (!isMounted || authLoading) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  }
  
  if (!user || !userData) {
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
      setIsFormSubmitting(false); // Make sure to reset submission state
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
    loadSavedPosts(); // Re-load saved posts to update the state
  };
  
  return (
    <Dialog>
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
      
    <div className="min-h-screen bg-background text-foreground">
        <div className="grid lg:grid-cols-[18rem_1fr] min-h-screen">
          {/* Sidebar */}
          <aside className="border-r hidden lg:flex">
             <SidebarContent userData={userData} userPosts={userPosts} feedFilter={feedFilter} setFeedFilter={setFeedFilter} activeView={activeView} setActiveView={setActiveView} />
          </aside>
          
          <div className="flex h-screen">
                {activeView === 'messages' ? (
                    <div className="w-full h-full">
                      <MessagesView userData={userData} onBack={() => setActiveView('feed')} isMobile={isMobile} onSwitchToFeed={() => setActiveView('feed')} />
                    </div>
                ) : (
                    <div className="flex flex-1 min-w-0">
                        {/* Main Content */}
                        <main className="flex-1 min-w-0 border-r h-screen overflow-y-hidden flex flex-col">
                           <div className="p-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-30 flex items-center gap-2">
                                <Sheet>
                                    <SheetTrigger asChild>
                                        <Button variant="ghost" size="icon" className="lg:hidden">
                                            <Menu className="h-6 w-6" />
                                        </Button>
                                    </SheetTrigger>
                                    <SheetContent side="left" className="p-0">
                                        <SheetHeader className="sr-only">
                                            <SheetTitle>Sidebar Menu</SheetTitle>
                                        </SheetHeader>
                                        <SidebarContent userData={userData} userPosts={userPosts} feedFilter={feedFilter} setFeedFilter={setFeedFilter} activeView={activeView} setActiveView={setActiveView} />
                                    </SheetContent>
                                </Sheet>
                                <div className="relative w-full">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        placeholder="Search feed..."
                                        className="bg-transparent rounded-full pl-10"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex-grow overflow-y-auto thin-scrollbar pb-32">
                                <section>
                                    <div className="divide-y divide-border/20">
                                        {isLoadingFeed ? (
                                            <>
                                                <div className="py-8"><FeedPostSkeleton /></div>
                                                <div className="py-8"><FeedPostSkeleton /></div>
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
                                                />
                                            ))
                                        )}
                                    </div>
                                </section>
                            </div>
                        </main>
                        {/* Right Column */}
                        <aside className="p-6 hidden lg:block space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Trending</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {trendingTopics.map((topic, index) => (
                                            <div key={index}>
                                                <Link href="#" className="font-semibold hover:underline">#{topic.topic}</Link>
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
                        </aside>
                    </div>
                )}
          </div>
        </div>
        {activeView === 'feed' && (
            <div className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none">
                <div className="lg:grid lg:grid-cols-[18rem_1fr_22rem]">
                    <div className="lg:col-start-2 w-full lg:w-[80%] mx-auto pointer-events-auto">
                        <div className="p-3 bg-background/80 backdrop-blur-sm rounded-t-lg">
                            <CreatePostForm
                                onPost={handlePostSubmit}
                                postToEdit={postToEdit}
                                onFinishEditing={onFinishEditing}
                                isSubmitting={isFormSubmitting}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
    </Dialog>
  );
}
