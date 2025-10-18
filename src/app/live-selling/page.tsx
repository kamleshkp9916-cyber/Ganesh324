

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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { CreatePostForm } from '@/components/create-post-form';
import { getCart } from '@/lib/product-history';
import { Dialog, DialogHeader, DialogTitle, DialogTrigger, DialogContent, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { GoLiveDialog } from '@/components/go-live-dialog';
import { collection, query, orderBy, onSnapshot, Timestamp, deleteDoc, doc, updateDoc, increment, addDoc, serverTimestamp, where, getDocs, runTransaction, limit } from "firebase/firestore";
import { getFirestoreDb, getFirebaseStorage } from '@/lib/firebase';
import { format, formatDistanceToNow } from 'date-fns';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import { isFollowing, toggleFollow, UserData, getUserByDisplayName } from '@/lib/follow-data';
import { productDetails } from '@/lib/product-data';
import { PromotionalCarousel } from '@/components/promotional-carousel';
import { Logo } from '@/components/logo';
import { categories } from '@/lib/categories';
import { Separator } from '@/components/ui/separator';
import { ProductSearchWithStreams } from '@/components/ProductSearchWithStreams';


const liveSellers = [
    { id: 'fashionfinds-uid', name: 'FashionFinds', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Fashion', viewers: 1200, buyers: 25, rating: 4.8, reviews: 12, hint: 'woman posing stylish outfit', productId: 'prod_1' },
    { id: 'gadgetguru-uid', name: 'GadgetGuru', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Electronics', viewers: 2500, buyers: 42, rating: 4.9, reviews: 28, hint: 'unboxing new phone', productId: 'prod_2' },
    { id: 'homehaven-uid', name: 'HomeHaven', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Home Goods', viewers: 850, buyers: 15, rating: 4.7, reviews: 9, hint: 'modern living room decor', productId: 'prod_3' },
    { id: 'beautybox-uid', name: 'BeautyBox', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Beauty', viewers: 3100, buyers: 78, rating: 4.9, reviews: 55, hint: 'makeup tutorial', productId: 'prod_4' },
    { id: 'kitchenwiz-uid', name: 'KitchenWiz', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Kitchenware', viewers: 975, buyers: 0, rating: 0, reviews: 0, hint: 'cooking demonstration', productId: 'prod_5' },
    { id: 'fitflow-uid', name: 'FitFlow', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Fitness', viewers: 1500, buyers: 33, rating: 4.6, reviews: 18, hint: 'yoga session', productId: 'prod_6' },
    { id: 'artisanalley-uid', name: 'ArtisanAlley', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Handmade', viewers: 450, buyers: 8, rating: 5.0, reviews: 6, hint: 'pottery making', productId: 'prod_7' },
    { id: 'petpalace-uid', name: 'PetPalace', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Pet Supplies', viewers: 1800, buyers: 50, rating: 4.8, reviews: 30, hint: 'playing with puppy', productId: 'prod_8' },
    { id: 'booknook-uid', name: 'BookNook', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Books', viewers: 620, buyers: 12, rating: 4.9, reviews: 10, hint: 'reading book cozy', productId: 'prod_9' },
    { id: 'gamerguild-uid', name: 'GamerGuild', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Gaming', viewers: 4200, buyers: 102, rating: 4.9, reviews: 80, hint: 'esports competition', productId: 'prod_10' },
];

const reportReasons = [
    { id: "spam", label: "It's spam" },
    { id: "hate", label: "Hate speech or symbols" },
    { id: "false", label: "False information" },
    { id: "bullying", label: "Bullying or harassment" },
];

const mockNotifications = [
    { id: 1, title: 'Your order has shipped!', description: 'Your Vintage Camera is on its way.', time: '15m ago', read: false, href: '/orders' },
    { id: 2, title: 'Flash Sale Alert!', description: 'GadgetGuru is having a 50% off flash sale now!', time: '1h ago', read: false, href: '/seller/profile?userId=GadgetGuru' },
    { id: 3, title: 'New message from HomeHaven', description: '"Yes, the blue vases are back in stock!"', time: '4h ago', read: true, href: '/message' },
];

function LiveSellerSkeleton({key}: {key: React.Key}) {
    return (
        <div key={key} className="group relative rounded-lg overflow-hidden shadow-lg">
            <Skeleton className="w-full aspect-[2/3]" />
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div>
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
            </div>
        </div>
    );
}

function FeedPostSkeleton() {
    return (
        <Card className="overflow-hidden">
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

export default function LiveSellingPage() {
  const [isLoadingSellers, setIsLoadingSellers] = useState(true);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const { user, userData, loading: authLoading } = useAuth();
  const { signOut } = useAuthActions();
  const [feed, setFeed] = useState<any[]>([]);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState("");
  const { toast } = useToast();
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [suggestedUsers, setSuggestedUsers] = useState<UserData[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const createPostFormRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [allSellers, setAllSellers] = useState(liveSellers);
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const [activeLiveFilter, setActiveLiveFilter] = useState('All');
  const [cartCount, setCartCount] = useState(0);
  const [activeProductFilter, setActiveProductFilter] = useState('All');


  const liveStreamFilterButtons = useMemo(() => {
    const categories = new Set(allSellers.map(s => s.category));
    return ['All', ...Array.from(categories)];
  }, [allSellers]);

   const productFilterButtons = ['All', 'Electronics', 'Fashion', 'Home', 'Beauty'];
  
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const loadData = () => {
        setCartCount(getCart().reduce((sum, item) => sum + item.quantity, 0));
        
        const liveStreamDataRaw = localStorage.getItem('liveStream');
        if (liveStreamDataRaw) {
            try {
                const liveStreamData = JSON.parse(liveStreamDataRaw);
                const newSellerCard = {
                    id: liveStreamData.seller.uid,
                    name: liveStreamData.seller.name,
                    avatarUrl: liveStreamData.seller.photoURL || 'https://placehold.co/40x40.png',
                    thumbnailUrl: liveStreamData.product?.image?.preview || 'https://placehold.co/300x450.png',
                    category: liveStreamData.product?.category || 'General',
                    viewers: Math.floor(Math.random() * 5000),
                    buyers: Math.floor(Math.random() * 100),
                    rating: 4.5,
                    reviews: Math.floor(Math.random() * 50),
                    hint: liveStreamData.product?.name?.toLowerCase() || 'live stream',
                    productId: liveStreamData.product?.id,
                    isMyStream: true,
                    title: liveStreamData.title,
                };
                setAllSellers(currentSellers => {
                    const existingSellers = currentSellers.filter(s => s.id !== newSellerCard.id);
                    return [newSellerCard, ...existingSellers];
                });
            } catch (error) {
                console.error("Error parsing live stream data from localStorage", error);
            }
        } else {
            setAllSellers(currentSellers => currentSellers.filter(s => !s.isMyStream));
        }
      };

      loadData();
      
      const handleStorageChange = (event: StorageEvent) => {
          if (event.key === 'liveStream' || event.key === 'streamcart_cart' || event.key === null) {
              loadData();
          }
      };
      window.addEventListener('storage', handleStorageChange);

      return () => {
          window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [isMounted]);

  const trendingTopics = useMemo(() => {
    const hashtagCounts: { [key: string]: number } = {};
    feed.forEach(post => {
      const hashtags = post.content.match(/#\w+/g) || [];
      hashtags.forEach((tag: string) => {
        const cleanedTag = tag.substring(1);
        hashtagCounts[cleanedTag] = (hashtagCounts[cleanedTag] || 0) + 1;
      });
    });
    return Object.entries(hashtagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, posts]) => ({ topic, posts: `${posts} post${posts > 1 ? 's' : ''}` }));
  }, [feed]);
  
  const popularProducts = useMemo(() => {
      let products = Object.values(productDetails);
      if (activeProductFilter !== 'All') {
          const lowerCaseFilter = activeProductFilter.toLowerCase();
          if (lowerCaseFilter === 'fashion') {
               products = products.filter(p => ['Women', 'Men', 'Handbags', 'Shoes'].includes(p.category));
          } else {
               products = products.filter(p => p.category.toLowerCase() === lowerCaseFilter);
          }
      }
      return products
          .sort((a,b) => (b.isAuctionItem ? 1 : 0) - (a.isAuctionItem ? 1 : 0))
          .slice(0, 40);
  }, [activeProductFilter]);

  const mostReachedPosts = useMemo(() => {
    return [...feed].sort((a, b) => (b.likes + b.replies) - (a.likes + a.replies)).slice(0, 40);
  }, [feed]);

 useEffect(() => {
    if (!isMounted) return;

    const sellersTimer = setTimeout(() => setIsLoadingSellers(false), 1000);

    const db = getFirestoreDb();
    let postsQuery;

    if (activeTab === 'feeds') {
      setIsLoadingFeed(true);
      postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
      
      const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp ? format(new Date((doc.data().timestamp as Timestamp).seconds * 1000), 'PPp') : 'just now'
        }));
        setFeed(postsData);
        setIsLoadingFeed(false);
      });
      
      return () => {
        clearTimeout(sellersTimer);
        unsubscribe();
      };
    } else {
      postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
       const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp ? format(new Date((doc.data().timestamp as Timestamp).seconds * 1000), 'PPp') : 'just now'
        }));
        setFeed(postsData);
      });
      setIsLoadingFeed(false);
      return () => {
        clearTimeout(sellersTimer);
        unsubscribe();
      }
    }
  }, [isMounted, activeTab, user, followingIds]);
  
  const handleFollowToggle = async (targetId: string) => {
    if (!user) {
        handleAuthAction();
        return;
    }
    await toggleFollow(user.uid, targetId);
    setFollowingIds(prev =>
      prev.includes(targetId) ? prev.filter(id => id !== targetId) : [...prev, targetId]
    );
  };
  
   useEffect(() => {
    const checkFollowing = async () => {
        if (!user) return;
        const promises = suggestedUsers.map(u => isFollowing(user.uid, u.uid));
        const results = await Promise.all(promises);
        const following = suggestedUsers.filter((u, index) => results[index]);
        setFollowingIds(following.map(u => u.uid));
    };

    if (suggestedUsers.length > 0) {
        checkFollowing();
    }
  }, [user, suggestedUsers]);

  const handleAuthAction = (cb?: () => void) => {
    if (!user) {
        setIsAuthDialogOpen(true);
        return false;
    }
    if (cb) cb();
    return true;
  };

  const topLiveStreams = useMemo(() => {
    let sellers = [...allSellers];
     if (searchTerm) {
        sellers = sellers.filter(seller => 
            seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seller.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    return sellers.sort((a, b) => b.viewers - a.viewers).slice(0, 8);
  }, [allSellers, searchTerm]);

  const filteredLiveSellers = useMemo(() => {
    let sellers = [...allSellers];

    if (activeLiveFilter !== 'All') {
        sellers = sellers.filter(seller => seller.category === activeLiveFilter);
    }
    
    if (searchTerm) {
        sellers = sellers.filter(seller => 
            seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seller.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    return sellers;
  }, [searchTerm, allSellers, activeLiveFilter]);

  const filteredFeed = useMemo(() => {
    if (!searchTerm) return feed;
    return feed.filter(item => 
        item.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, feed]);

  

  const handleReply = (sellerName: string) => {
    handleAuthAction(() => {
      setReplyTo(sellerName);
      if (createPostFormRef.current) {
        createPostFormRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    });
  };

  const handleShare = (postId: number) => {
    const link = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(link);
    toast({
        title: "Link Copied!",
        description: "The post link has been copied to your clipboard.",
    });
  };

  const submitReport = () => {
    handleAuthAction(() => {
        console.log("Submitting report for reason:", selectedReportReason);
        toast({
            title: "Report Submitted",
            description: "Thank you for your feedback. We will review this post.",
        });
        setIsReportDialogOpen(false);
        setSelectedReportReason("");
    });
  };
  
  const handleLiveFilterSelect = (filter: string) => {
    setActiveLiveFilter(filter);
    setActiveTab('live');
  };
  
  const markAsRead = (id: number) => {
    setNotifications(current => current.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleDeletePost = async (postId: string, mediaUrl: string | null) => {
    const db = getFirestoreDb();
    const postRef = doc(db, 'posts', postId);
    
    try {
        await deleteDoc(postRef);

        if (mediaUrl) {
            const storage = getFirebaseStorage();
            const mediaRef = storageRef(storage, mediaUrl);
            await deleteObject(mediaRef);
        }

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
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!handleAuthAction()) return;

    const db = getFirestoreDb();
    const postRef = doc(db, 'posts', postId);
    const likeRef = doc(db, `posts/${postId}/likes`, user!.uid);

    try {
        await runTransaction(db, async (transaction) => {
            const likeDoc = await transaction.get(likeRef);
            if (likeDoc.exists()) {
                // User has already liked, so unlike
                transaction.delete(likeRef);
                transaction.update(postRef, { likes: increment(-1) });
            } else {
                // User has not liked, so like
                transaction.set(likeRef, { likedAt: serverTimestamp() });
                transaction.update(postRef, { likes: increment(1) });
            }
        });
    } catch (error) {
        console.error("Error toggling like:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not update like status. Please try again."
        });
    }
};

  const getCategoryUrl = (categoryName: string) => `/${categoryName.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <>
      <div className="flex min-h-screen flex-col bg-background text-foreground">
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
                    <AlertDialogAction onClick={() => router.push('/signup')}>Create Account</AlertDialogAction>
                    <AlertDialogAction onClick={() => router.push('/')}>Login</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col flex-grow">
             <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-sm">
                <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                     <div className="flex items-center gap-1 sm:gap-2">
                         <Link href="/live-selling" className="flex items-center gap-2">
                             <Logo className="h-7 w-7" />
                             <span className="font-bold text-lg hidden sm:inline-block">StreamCart</span>
                         </Link>
                    </div>

                    <div className="hidden sm:flex flex-1 justify-center px-8">
                         <div className={cn(
                            "relative w-full max-w-sm lg:max-w-md transition-all duration-300",
                            isSearchOpen ? "w-full" : "w-auto"
                         )}>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground peer-focus:text-foreground"/>
                                <Input 
                                    placeholder="Search..." 
                                    className="rounded-full bg-muted h-10 pl-10 peer transition-all duration-300"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => setIsSearchOpen(true)}
                                    onBlur={() => setIsSearchOpen(false)}
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1 sm:gap-2">
                        <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setIsSearchOpen(prev => !prev)}>
                            <Search className="h-5 w-5"/>
                        </Button>

                         <Link href="/listed-products" passHref>
                            <Button variant="ghost" size="icon">
                                <ShoppingBag className="h-5 w-5"/>
                            </Button>
                        </Link>
                        
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" size="icon" className="relative">
                                    <Bell className="h-5 w-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                        </span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                             <DropdownMenuContent align="end" className="w-80">
                                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {notifications.map(n => (
                                    <Link key={n.id} href={n.href} passHref>
                                        <DropdownMenuItem className={cn("flex-col items-start gap-1", !n.read && "bg-primary/5")} onSelect={() => markAsRead(n.id)}>
                                            <div className="flex justify-between w-full">
                                                <p className={cn("font-semibold", !n.read && "text-primary")}>{n.title}</p>
                                                <p className="text-xs text-muted-foreground">{n.time}</p>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{n.description}</p>
                                        </DropdownMenuItem>
                                    </Link>
                                ))}
                                {notifications.length === 0 && (
                                    <p className="text-center text-sm text-muted-foreground p-4">No new notifications.</p>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                     <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'}/>
                                        <AvatarFallback>{isMounted && user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User/>}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            {user && userData ? (
                                <DropdownMenuContent align="end" className="w-64">
                                    <DropdownMenuLabel>
                                        <div>{userData?.displayName}</div>
                                        <div className="text-xs text-muted-foreground font-normal">{userData?.email}</div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                     {userData?.role === 'admin' && (
                                        <DropdownMenuItem onSelect={() => router.push('/admin/dashboard')}>
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            <span>Admin Dashboard</span>
                                        </DropdownMenuItem>
                                    )}
                                    {(userData?.role === 'seller') && (
                                        <DropdownMenuItem onSelect={() => router.push('/seller/dashboard')}>
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            <span>Seller Dashboard</span>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onSelect={() => router.push('/profile')}>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>My Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => router.push('/feed')}>
                                        <Tv className="mr-2 h-4 w-4" />
                                        <span>My Feed</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => router.push('/orders')}>
                                        <Package className="mr-2 h-4 w-4" />
                                        <span>My Orders</span>
                                    </DropdownMenuItem>
                                     <DropdownMenuItem onSelect={() => router.push('/wishlist')}>
                                        <Heart className="mr-2 h-4 w-4" />
                                        <span>My Wishlist</span>
                                    </DropdownMenuItem>
                                     <DropdownMenuItem onSelect={() => router.push('/cart')}>
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        <span>My Cart</span>
                                         {cartCount > 0 && <Badge variant="destructive" className="ml-auto">{cartCount}</Badge>}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => router.push('/wallet')}>
                                        <Wallet className="mr-2 h-4 w-4" />
                                        <span>My Wallet</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                     <DropdownMenuItem onSelect={() => router.push('/setting')}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </DropdownMenuItem>
                                     <DropdownMenuItem onSelect={() => router.push('/help')}>
                                        <LifeBuoy className="mr-2 h-4 w-4" />
                                        <span>Help &amp; Support</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => router.push('/privacy-and-security')}>
                                        <Shield className="mr-2 h-4 w-4" />
                                        <span>Privacy &amp; Security</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>
                                            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 mr-2" />
                                            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 mr-2" />
                                            <span>Theme</span>
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => signOut(userData?.role === 'seller')}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            ) : (
                                 <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={() => router.push('/')}>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Login or Sign Up</span>
                                    </DropdownMenuItem>
                                 </DropdownMenuContent>
                            )}
                        </DropdownMenu>
                        
                        {(userData?.role === 'seller' || userData?.role === 'admin') && (
                             <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="hidden lg:flex">
                                        <RadioTower className="mr-2 h-4 w-4"/> Go Live
                                    </Button>
                                </DialogTrigger>
                                <GoLiveDialog />
                            </Dialog>
                        )}
                    </div>
                </div>
                 {isSearchOpen && (
                    <div className="absolute top-16 left-0 w-full p-4 bg-background border-b sm:hidden">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input 
                                placeholder="Search..." 
                                className="rounded-full bg-muted h-10 pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                 )}
            </header>
            
            <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
                    <TabsList className="bg-transparent p-0 h-auto">
                        <TabsTrigger value="all" className="text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4">All</TabsTrigger>
                        <TabsTrigger value="live" className="text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4">Live</TabsTrigger>
                    </TabsList>
                </div>
            </div>

            <div className="flex-grow">
                {isSearchOpen ? (
                    <ProductSearchWithStreams />
                ) : (
                <TabsContent value="all" className="mt-0">
                    <div className="space-y-8 mt-0">
                        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                            <PromotionalCarousel />
                        </div>
                        <section>
                            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-4">
                                <h2 className="text-2xl font-bold flex items-center justify-center gap-2"><Flame className="text-primary" /> Top Live Streams</h2>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-4 px-2 md:px-4">
                                {topLiveStreams.map((seller: any) => (
                                     <Link href={`/stream/${seller.id}`} key={seller.id} className="group">
                                        <div className="relative rounded-lg overflow-hidden aspect-[16/9] bg-muted">
                                            <div className="absolute top-2 left-2 z-10"><Badge variant="destructive">LIVE</Badge></div>
                                            <div className="absolute top-2 right-2 z-10">
                                                <Badge variant="secondary" className="bg-background/60 backdrop-blur-sm gap-1.5">
                                                    <Users className="h-3 w-3"/>
                                                    {seller.viewers}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-2 mt-2">
                                            <Avatar className="w-7 h-7">
                                                <AvatarImage src={seller.avatarUrl} />
                                                <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="font-semibold text-xs group-hover:underline truncate">{seller.name}</p>
                                                <p className="text-xs text-muted-foreground">{seller.category}</p>
                                                <p className="text-xs text-primary font-semibold mt-0.5">#{seller.category.toLowerCase()}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                        
                        <section className="mt-8">
                             <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-4">
                                <h2 className="text-2xl font-bold flex items-center justify-center gap-2"><Sparkles className="text-primary" /> Popular Products</h2>
                            </div>
                             <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex flex-wrap justify-center gap-2">
                                {productFilterButtons.map((filter) => (
                                <Button 
                                    key={filter} 
                                    variant={activeProductFilter === filter ? 'default' : 'outline'} 
                                    size="sm" 
                                    className="rounded-full text-xs md:text-sm h-8 md:h-9"
                                    onClick={() => setActiveProductFilter(filter)}
                                >
                                    {filter}
                                </Button>
                                ))}
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full text-xs md:text-sm h-8 md:h-9"
                                >
                                    <Link href="/listed-products">
                                        More
                                    </Link>
                                </Button>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4 px-2 md:px-4">
                                {popularProducts.map((product: any) => (
                                     <Link href={`/product/${product.key}`} key={product.id} className="group block">
                                        <Card className="w-full overflow-hidden h-full flex flex-col bg-card">
                                            <div className="relative aspect-square bg-muted">
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover transition-transform group-hover:scale-105"
                                                    data-ai-hint={product.hint}
                                                />
                                            </div>
                                            <div className="p-3 flex-grow flex flex-col">
                                                <h4 className="font-semibold truncate text-sm flex-grow">{product.name}</h4>
                                                <p className="font-bold text-foreground mt-1">{product.price}</p>
                                                <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
                                                    <Star className="w-4 h-4 fill-current" />
                                                    <span>4.8</span>
                                                    <span className="text-muted-foreground">({product.reviews || '1.2k'})</span>
                                                </div>
                                                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                                    <div className="flex items-center gap-1"><Package className="w-3 h-3" /> {product.stock} left</div>
                                                    <div className="flex items-center gap-1"><Users className="w-3 h-3" /> {product.sold} sold</div>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </section>
                        
                        <section className="mt-8">
                             <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-4">
                                <h2 className="text-2xl font-bold flex items-center justify-center gap-2"><TrendingUp className="text-primary" /> Most Reached Posts</h2>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 auto-rows-fr gap-4 px-4 sm:px-6 lg:px-8">
                                {mostReachedPosts.map(post => (
                                     <Card key={post.id} className="overflow-hidden flex flex-col bg-card">
                                        <div className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={post.avatarUrl} alt={post.sellerName} />
                                                        <AvatarFallback>{post.sellerName.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold text-primary">{post.sellerName}</p>
                                                        <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 -mr-2 -mt-2">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onSelect={() => handleShare(post.id)}>
                                                            <Share2 className="mr-2 h-4 w-4" />
                                                            <span>Share</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={submitReport}>
                                                            <Flag className="mr-2 h-4 w-4" />
                                                            <span>Report</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <p className="text-sm line-clamp-2">{post.content}</p>
                                        </div>
                                        <div className="mt-auto px-4 pb-3 flex justify-between items-center text-sm text-muted-foreground">
                                            <div className="flex items-center gap-4">
                                                <button className="flex items-center gap-1.5 hover:text-primary">
                                                    <Heart className="w-4 h-4" />
                                                    <span>{post.likes || 0}</span>
                                                </button>
                                                <button className="flex items-center gap-1.5 hover:text-primary">
                                                    <MessageSquare className="w-4 h-4" />
                                                    <span>{post.replies || 0}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    </div>
                </TabsContent>
                )}

                <TabsContent value="live" className="mt-0">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                            <div className="flex flex-wrap gap-2 mb-6">
                                {liveStreamFilterButtons.map((filter) => (
                                <Button 
                                    key={filter} 
                                    variant={activeLiveFilter === filter ? 'default' : 'outline'} 
                                    size="sm" 
                                    className="bg-card/50 rounded-full text-xs md:text-sm h-8 md:h-9"
                                    onClick={() => setActiveLiveFilter(filter)}
                                >
                                    {filter}
                                </Button>
                                ))}
                                <Button variant="ghost" size="sm" className="bg-card/50 rounded-full text-xs md:text-sm h-8 md:h-9">
                                    Filters
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </div>

                            {isLoadingSellers ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {Array.from({ length: 12 }).map((_, index) => (
                                        <LiveSellerSkeleton key={index} />
                                    ))}
                                </div>
                            ) : filteredLiveSellers.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {filteredLiveSellers.map((seller: any) => (
                                        <Link href={`/stream/${seller.id}`} key={seller.id} className="group">
                                            <div className="relative rounded-lg overflow-hidden aspect-[16/9] bg-muted">
                                                <div className="absolute top-2 left-2 z-10"><Badge variant="destructive">LIVE</Badge></div>
                                                <div className="absolute top-2 right-2 z-10">
                                                    <Badge variant="secondary" className="bg-background/60 backdrop-blur-sm gap-1.5">
                                                        <Users className="h-3 w-3"/>
                                                        {seller.viewers}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 mt-2">
                                                <Avatar className="w-7 h-7">
                                                    <AvatarImage src={seller.avatarUrl} />
                                                    <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-xs group-hover:underline truncate">{seller.title || seller.name}</p>
                                                    <p className="text-xs text-muted-foreground">{seller.category}</p>
                                                    <p className="text-xs text-primary font-semibold mt-0.5">#{seller.category.toLowerCase()}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p className="text-lg font-semibold">No results found</p>
                                    <p>Try searching for something else or changing the filter.</p>
                                </div>
                            )}
                    </div>
                    </TabsContent>
            </div>
        </Tabs>
        <div className="mt-12">
          <Footer />
        </div>
      </div>
    </>
  );
}

