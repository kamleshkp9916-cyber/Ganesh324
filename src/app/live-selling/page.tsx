

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
  ShoppingBag,
  Award,
  MessageSquare,
  Shield,
  FileText,
  LifeBuoy,
  Wallet,
  List,
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Skeleton } from '@/components/ui/skeleton';
import Autoplay from "embla-carousel-autoplay";
import { useAuth } from '@/hooks/use-auth.tsx';
import { useAuthActions } from '@/lib/auth';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
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
import { Dialog, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GoLiveDialog } from '@/components/go-live-dialog';
import { collection, query, orderBy, onSnapshot, Timestamp, deleteDoc, doc, updateDoc, increment } from "firebase/firestore";
import { getFirestoreDb, getFirebaseStorage } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import { isFollowing, toggleFollow } from '@/lib/follow-data';

const PROMOTIONAL_SLIDES_KEY = 'streamcart_promotional_slides';

const liveSellers = [
    {
      id: 1,
      name: 'FashionFinds',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Fashion',
      viewers: 1200,
      buyers: 25,
      rating: 4.8,
      reviews: 12,
      hint: 'woman posing stylish outfit',
      productId: 'prod_1',
      hasAuction: true
    },
    {
      id: 2,
      name: 'GadgetGuru',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Electronics',
      viewers: 2500,
      buyers: 42,
      rating: 4.9,
      reviews: 28,
      hint: 'unboxing new phone',
      productId: 'prod_2',
      hasAuction: false
    },
    {
      id: 3,
      name: 'HomeHaven',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Home Goods',
      viewers: 850,
      buyers: 15,
      rating: 4.7,
      reviews: 9,
      hint: 'modern living room decor',
      productId: 'prod_3',
      hasAuction: false
    },
    {
      id: 4,
      name: 'BeautyBox',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Beauty',
      viewers: 3100,
      buyers: 78,
      rating: 4.9,
      reviews: 55,
      hint: 'makeup tutorial',
      productId: 'prod_4',
      hasAuction: true
    },
    {
      id: 5,
      name: 'KitchenWiz',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Kitchenware',
      viewers: 975,
      buyers: 0,
      rating: 0,
      reviews: 0,
      hint: 'cooking demonstration',
      productId: 'prod_5',
      hasAuction: false
    },
    {
      id: 6,
      name: 'FitFlow',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Fitness',
      viewers: 1500,
      buyers: 33,
      rating: 4.6,
      reviews: 18,
      hint: 'yoga session',
      productId: 'prod_6',
      hasAuction: false
    },
    {
      id: 7,
      name: 'ArtisanAlley',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Handmade',
      viewers: 450,
      buyers: 8,
      rating: 5.0,
      reviews: 6,
      hint: 'pottery making',
      productId: 'prod_7',
      hasAuction: true
    },
    {
      id: 8,
      name: 'PetPalace',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Pet Supplies',
      viewers: 1800,
      buyers: 50,
      rating: 4.8,
      reviews: 30,
      hint: 'playing with puppy',
      productId: 'prod_8',
      hasAuction: false
    },
    {
      id: 9,
      name: 'BookNook',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Books',
      viewers: 620,
      buyers: 12,
      rating: 4.9,
      reviews: 10,
      hint: 'reading book cozy',
      productId: 'prod_9',
      hasAuction: false
    },
    {
      id: 10,
      name: 'GamerGuild',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Gaming',
      viewers: 4200,
      buyers: 102,
      rating: 4.9,
      reviews: 80,
      hint: 'esports competition',
      productId: 'prod_10',
      hasAuction: true
    },
]

const initialOfferSlides = [
  {
    id: 1,
    imageUrl: 'https://placehold.co/1200x400.png',
    title: 'Flash Sale!',
    description: 'Up to 50% off on electronics.',
    hint: 'electronics sale',
  },
  {
    id: 2,
    imageUrl: 'https://placehold.co/1200x400.png',
    title: 'New Arrivals',
    description: 'Check out the latest fashion trends.',
    hint: 'fashion clothing runway',
  },
  {
    id: 3,
    imageUrl: 'https://placehold.co/1200x400.png',
    title: 'Home Decor Deals',
    description: 'Beautify your space for less.',
    hint: 'modern living room',
  },
];

const reportReasons = [
    { id: "spam", label: "It's spam" },
    { id: "hate", label: "Hate speech or symbols" },
    { id: "violence", label: "Violence or dangerous organizations" },
    { id: "scam", label: "Scam or fraud" },
    { id: "false", label: "False information" },
    { id: "bullying", label: "Bullying or harassment" },
];

const mockNotifications = [
    { id: 1, title: 'Your order has shipped!', description: 'Your Vintage Camera is on its way.', time: '15m ago', read: false, href: '/orders' },
    { id: 2, title: 'Flash Sale Alert!', description: 'GadgetGuru is having a 50% off flash sale now!', time: '1h ago', read: false, href: '/seller/profile?userId=GadgetGuru' },
    { id: 3, title: 'New message from HomeHaven', description: '"Yes, the blue vases are back in stock!"', time: '4h ago', read: true, href: '/message' },
];

// Function to shuffle an array
const shuffleArray = (array: any[]) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

function LiveSellerSkeleton() {
    return (
        <div className="group relative rounded-lg overflow-hidden shadow-lg">
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
  const [offerSlides, setOfferSlides] = useState<any[]>([]);
  const [isLoadingSellers, setIsLoadingSellers] = useState(true);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [api, setApi] = useState<CarouselApi>()
  const [currentSlide, setCurrentSlide] = useState(0)
  const { user, userData, loading: authLoading } = useAuth();
  const { signOut } = useAuthActions();
  const [feed, setFeed] = useState<any[]>([]);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState("");
  const { toast } = useToast();
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("live");
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const createPostFormRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [allSellers, setAllSellers] = useState(liveSellers);
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [cartCount, setCartCount] = useState(0);
  
   const loadData = useCallback(() => {
    if (typeof window !== 'undefined') {
        setCartCount(getCart().reduce((sum, item) => sum + item.quantity, 0));
        
        const storedSlidesRaw = localStorage.getItem(PROMOTIONAL_SLIDES_KEY);
        if (storedSlidesRaw) {
            const storedSlides = JSON.parse(storedSlidesRaw);
            const now = new Date();
            const activeSlides = storedSlides.filter((slide: any) => {
                return !slide.expiresAt || new Date(slide.expiresAt) >= now;
            });
            setOfferSlides(activeSlides);
        } else {
            setOfferSlides(initialOfferSlides);
        }

        const liveStreamDataRaw = localStorage.getItem('liveStream');
        setAllSellers(prevSellers => {
            let currentSellers = [...liveSellers];
            if (liveStreamDataRaw) {
                const liveStreamData = JSON.parse(liveStreamDataRaw);
                const sellerIsLive = currentSellers.some(s => s.id === liveStreamData.seller.uid);

                if (!sellerIsLive) {
                    const newSellerCard = {
                        id: liveStreamData.seller.uid,
                        name: liveStreamData.seller.name,
                        avatarUrl: liveStreamData.seller.photoURL || 'https://placehold.co/40x40.png',
                        thumbnailUrl: liveStreamData.product.image.preview || 'https://placehold.co/300x450.png',
                        category: liveStreamData.product.category || 'General',
                        viewers: Math.floor(Math.random() * 5000),
                        buyers: Math.floor(Math.random() * 100),
                        rating: 4.5,
                        reviews: Math.floor(Math.random() * 50),
                        hint: liveStreamData.product.name.toLowerCase(),
                        productId: liveStreamData.product.id,
                        isMyStream: true,
                        hasAuction: liveStreamData.isAuction,
                    };
                    return [newSellerCard, ...currentSellers.filter(s => s.id !== newSellerCard.id)];
                } else {
                    // Update existing seller's stream info
                    return currentSellers.map(s => s.id === liveStreamData.seller.uid ? { ...s, isMyStream: true, hasAuction: liveStreamData.isAuction } : s);
                }
            }
            return currentSellers.map(s => ({ ...s, isMyStream: false }));
        });
    }
  }, []);

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

  useEffect(() => {
    setIsMounted(true);
    // Simulate loading spinners
    const sellersTimer = setTimeout(() => setIsLoadingSellers(false), 2000);

    // Listen for real-time post updates from Firestore
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
    });

    return () => {
        clearTimeout(sellersTimer);
        unsubscribe();
    };
  }, []);
  
   useEffect(() => {
    if (isMounted) {
      loadData();
      
      const handleStorageChange = (event: StorageEvent) => {
          if (event.key === 'liveStream' || event.key === 'streamcart_cart' || event.key === PROMOTIONAL_SLIDES_KEY || event.key === null) {
              loadData();
          }
      };
      window.addEventListener('storage', handleStorageChange);

      return () => {
          window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [isMounted, loadData]);

   useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);
  
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
    return [...allSellers].sort((a, b) => b.viewers - a.viewers).slice(0, 3);
  }, [allSellers]);

  const filteredLiveSellers = useMemo(() => {
    let sellers = [...allSellers];

    // Filter by category
    if (activeFilter !== 'All' && activeFilter !== 'Popular') {
        sellers = sellers.filter(seller => seller.category === activeFilter);
    }

    // Sort by popularity if selected
    if (activeFilter === 'Popular') {
        sellers.sort((a, b) => b.viewers - a.viewers);
    }
    
    // Filter by search term
    if (searchTerm) {
        sellers = sellers.filter(seller => 
            seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seller.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    return sellers;
  }, [searchTerm, allSellers, activeFilter]);

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


  const filterButtons = ['All', 'Fashion', 'Electronics', 'Home Goods', 'Beauty', 'Popular'];

  const onSelect = useCallback((api: CarouselApi) => {
    if (!api) return;
    setCurrentSlide(api.selectedScrollSnap());
  }, []);

  const markAsRead = (id: number) => {
    setNotifications(current => current.map(n => n.id === id ? { ...n, read: true } : n));
  };


  useEffect(() => {
    if (!api) {
      return
    }
 
    onSelect(api);
    api.on('select', onSelect);
    api.on('reInit', onSelect)
  }, [api, onSelect]);

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
    if (!user) {
        handleAuthAction();
        return;
    }
    const db = getFirestoreDb();
    const postRef = doc(db, 'posts', postId);
    // This is a simplified like. A real app would track who liked it.
    await updateDoc(postRef, {
        likes: increment(1)
    });
  };
  const handleCommentPost = async (postId: string) => {
    if (!user) {
        handleAuthAction();
        return;
    }
    const db = getFirestoreDb();
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
        replies: increment(1)
    });
    // For demo, just increments. A real app would open a comment modal.
    toast({ title: "Comment added (simulation)!" });
  };


  return (
    <div className="flex min-h-screen bg-background text-foreground">
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
        <div className="flex-1 flex flex-col">
            <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b gap-2 sm:gap-4">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-primary">StreamCart</h1>
                </div>

                <div className="flex-1 flex justify-end items-center gap-1 sm:gap-2">
                     {(!isMounted || authLoading) ? (
                        <Skeleton className="h-9 w-24 rounded-full" />
                    ) : user ? (
                        <div className="flex items-center gap-1 sm:gap-2">
                             {userData?.role === 'seller' && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button size="sm">
                                            <RadioTower className="mr-2 h-4 w-4" /> Go Live
                                        </Button>
                                    </DialogTrigger>
                                    <GoLiveDialog />
                                </Dialog>
                            )}
                            <div ref={searchRef} className="relative flex items-center">
                                 <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 rounded-full flex-shrink-0"
                                  onClick={() => setIsSearchExpanded(p => !p)}
                                >
                                    <Search className="h-5 w-5 text-muted-foreground" />
                                </Button>
                                 <Input
                                    placeholder="Search..."
                                    className={cn(
                                        "bg-muted rounded-full pl-4 pr-10 h-10 transition-all duration-300 ease-in-out",
                                        isSearchExpanded ? 'w-32 sm:w-48' : 'w-0 border-transparent p-0'
                                    )}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative text-foreground rounded-full bg-card hover:bg-accent flex">
                                        <Bell />
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
                                    <Avatar className="h-9 w-9 cursor-pointer">
                                        <AvatarImage src={user.photoURL || 'https://placehold.co/40x40.png'} alt={userData?.displayName || "User"} />
                                        <AvatarFallback>{userData?.displayName ? userData.displayName.charAt(0) : 'U'}</AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64 bg-background" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{userData?.displayName}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                            {user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem asChild>
                                            <Link href="/profile"><User className="mr-2 h-4 w-4" /><span>My Profile</span></Link>
                                        </DropdownMenuItem>
                                         <DropdownMenuItem asChild>
                                            <Link href="/cart" className="flex items-center justify-between">
                                                <div className="flex items-center"><ShoppingCart className="mr-2 h-4 w-4" /><span>My Cart</span></div>
                                                {cartCount > 0 && <Badge variant="destructive">{cartCount}</Badge>}
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/wallet"><Wallet className="mr-2 h-4 w-4" /><span>Wallet</span></Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/orders"><ShoppingBag className="mr-2 h-4 w-4" /><span>Orders</span></Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/setting"><Settings className="mr-2 h-4 w-4" /><span>Settings</span></Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/message"><MessageSquare className="mr-2 h-4 w-4" /><span>Message</span></Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                     <DropdownMenuGroup>
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>
                                                <Sun className="mr-2 h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                                <Moon className="absolute mr-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                                <span>Theme</span>
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuPortal>
                                                <DropdownMenuSubContent>
                                                    <DropdownMenuItem onClick={() => setTheme("light")}>
                                                        <Sun className="mr-2 h-4 w-4" />
                                                        <span>Light</span>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                                                        <Moon className="mr-2 h-4 w-4" />
                                                        <span>Dark</span>
                                                    </DropdownMenuItem>
                                                     <DropdownMenuItem onClick={() => setTheme("system")}>
                                                        <Laptop className="mr-2 h-4 w-4" />
                                                        <span>System</span>
                                                    </DropdownMenuItem>
                                                </DropdownMenuSubContent>
                                            </DropdownMenuPortal>
                                        </DropdownMenuSub>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem asChild>
                                            <Link href="/help"><LifeBuoy className="mr-2 h-4 w-4" /><span>Help 24/7</span></Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={signOut}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log Out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Button asChild variant="outline" size="sm">
                                <Link href="/">Login</Link>
                            </Button>
                            <Button asChild size="sm">
                                    <Link href="/signup">Create Account</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </header>
            
            <main className="flex-1 overflow-y-auto p-2 md:p-4 pb-20 relative">
              <div className="max-w-7xl mx-auto">
                <Tabs defaultValue="live" className="w-full" onValueChange={setActiveTab}>
                    {(!isMounted) ? (
                            <div className="flex justify-center mb-6">
                                <Skeleton className="h-10 w-[200px] rounded-md" />
                            </div>
                        ) : (
                            <div className="flex justify-center mb-6">
                                <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-flex">
                                    <TabsTrigger value="live">Live Shopping</TabsTrigger>
                                    <TabsTrigger value="feeds">Feeds</TabsTrigger>
                                </TabsList>
                            </div>
                    )}
                    

                    <TabsContent value="live">
                        <div className="mb-6">
                        {!isMounted || offerSlides.length === 0 ? (
                            <Skeleton className="w-full aspect-[3/1] rounded-lg" />
                        ) : (
                            <div>
                                <Carousel
                                    className="w-full"
                                    plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]}
                                    opts={{ loop: true }}
                                    setApi={setApi}
                                >
                                    <CarouselContent>
                                        {offerSlides.map((slide) => (
                                        <CarouselItem key={slide.id}>
                                            <Card className="overflow-hidden bg-card">
                                            <CardContent className="relative p-0 flex items-center justify-center aspect-[3/1] md:aspect-[4/1]">
                                                <Image
                                                src={slide.imageUrl}
                                                alt={slide.title}
                                                fill
                                                style={{objectFit: 'cover'}}
                                                className="brightness-75"
                                                data-ai-hint={slide.hint}
                                                />
                                                <div className="absolute text-center text-primary-foreground p-4">
                                                <h2 className="text-2xl md:text-4xl font-extrabold tracking-tighter">{slide.title}</h2>
                                                <p className="text-sm md:text-lg">{slide.description}</p>
                                                </div>
                                            </CardContent>
                                            </Card>
                                        </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                </Carousel>
                                <div className="flex justify-center gap-2 mt-4">
                                    {offerSlides.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => api?.scrollTo(index)}
                                            className={cn(
                                                "h-2 w-2 rounded-full transition-colors",
                                                index === currentSlide ? 'bg-primary' : 'bg-muted'
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {filterButtons.map((filter) => (
                            <Button 
                                key={filter} 
                                variant={activeFilter === filter ? 'default' : 'outline'} 
                                size="sm" 
                                className="bg-card/50 rounded-full text-xs md:text-sm h-8 md:h-9"
                                onClick={() => setActiveFilter(filter)}
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
                                    <div key={seller.id} className="group relative rounded-lg overflow-hidden shadow-lg hover:shadow-primary/50 transition-shadow duration-300">
                                        <div className="absolute top-2 left-2 z-10">
                                            <Badge variant="destructive">
                                                LIVE
                                            </Badge>
                                        </div>
                                         {seller.isMyStream && (
                                            <div className="absolute top-10 left-2 z-10">
                                                <Badge variant="secondary" className="bg-purple text-purple-foreground">
                                                    Your Stream
                                                </Badge>
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 z-10">
                                            <Badge variant="secondary" className="bg-background/60 backdrop-blur-sm">
                                                <Users className="w-3 h-3 mr-1.5" />
                                                {seller.viewers}
                                            </Badge>
                                        </div>

                                        <Link href={`/stream/${seller.id}`} className="cursor-pointer">
                                            <Image 
                                                src={seller.thumbnailUrl} 
                                                alt={`Live stream from ${seller.name}`} 
                                                width={300} 
                                                height={450} 
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                data-ai-hint={seller.hint}
                                            />
                                        </Link>
                                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                            <div className="flex items-start gap-2">
                                                <Link href={`/seller/profile?userId=${seller.name}`} onClick={(e) => e.stopPropagation()} className="relative z-20">
                                                    <Avatar className="h-8 w-8 border-2 border-primary">
                                                        <AvatarImage src={seller.avatarUrl} alt={seller.name} />
                                                        <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                </Link>
                                                <div className="flex-1">
                                                     <Link href={`/seller/profile?userId=${seller.name}`} onClick={(e) => e.stopPropagation()} className="relative z-20 hover:underline">
                                                        <h3 className="font-semibold text-sm text-primary-foreground truncate">{seller.name}</h3>
                                                    </Link>
                                                    {seller.hasAuction && (
                                                        <Badge variant="purple" className="mt-1">
                                                            <Gavel className="mr-1 h-3 w-3" />
                                                            Auction
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div className="text-center py-12 text-muted-foreground">
                                <p className="text-lg font-semibold">No results found</p>
                                <p>Try searching for something else or changing the filter.</p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="feeds" className="w-full">
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
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                            <div className="lg:col-span-2 space-y-4">
                              {isLoadingFeed ? (
                                <>
                                    <FeedPostSkeleton />
                                    <FeedPostSkeleton />
                                </>
                              ) : filteredFeed.length > 0 ? (
                                filteredFeed.map((item) => (
                                    <Card key={item.id} className="overflow-hidden">
                                        <div className="p-4">
                                            <div className="flex items-center gap-3 mb-3">
                                                <Avatar className="h-10 w-10">
                                                    <AvatarImage src={item.avatarUrl} alt={item.sellerName} />
                                                    <AvatarFallback>{item.sellerName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-grow">
                                                    <p className="font-semibold text-primary">{item.sellerName}</p>
                                                    <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                         {user && user.uid === item.sellerId && (
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onSelect={(e) => e.preventDefault()}>
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        <span>Delete Post</span>
                                                                    </DropdownMenuItem>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                        <AlertDialogDescription>This will permanently delete your post. This action cannot be undone.</AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction onClick={() => handleDeletePost(item.id, item.mediaUrl)}>Delete</AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        )}
                                                        <DropdownMenuItem onClick={() => handleShare(item.id)}>
                                                            <Share2 className="mr-2 h-4 w-4" />
                                                            <span>Share</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <a href={`mailto:feedback@example.com?subject=Feedback on post ${item.id}`}>
                                                                <MessageCircle className="mr-2 h-4 w-4" />
                                                                <span>Feedback</span>
                                                            </a>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger>
                                                                <Flag className="mr-2 h-4 w-4" />
                                                                <span>Report</span>
                                                            </DropdownMenuSubTrigger>
                                                            <DropdownMenuPortal>
                                                                <DropdownMenuSubContent>
                                                                    <DropdownMenuLabel>Report this post</DropdownMenuLabel>
                                                                    <DropdownMenuSeparator />
                                                                    {reportReasons.map(reason => (
                                                                        <DropdownMenuItem key={reason.id} onClick={() => { handleAuthAction(() => { setSelectedReportReason(reason.id); setIsReportDialogOpen(true); }); }}>
                                                                            <span>{reason.label}</span>
                                                                        </DropdownMenuItem>
                                                                    ))}
                                                                </DropdownMenuSubContent>
                                                            </DropdownMenuPortal>
                                                        </DropdownMenuSub>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </div>
                                        <div className="px-4 pb-4">
                                            <div className="flex flex-col items-center gap-4 text-center">
                                                <p className="text-sm mb-2">{item.content}</p>
                                                {item.mediaUrl &&
                                                    <div className="w-full max-w-sm bg-muted rounded-lg overflow-hidden">
                                                        {item.mediaType === 'video' ? (
                                                            <video src={item.mediaUrl} controls className="w-full h-auto object-cover" />
                                                        ) : (
                                                            <Image src={item.mediaUrl} alt="Feed item" width={400} height={300} className="w-full h-auto object-cover" />
                                                        )}
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                        <div className="px-4 pb-3 flex justify-between items-center text-sm text-muted-foreground">
                                            <div className="flex items-center gap-4">
                                                <button className="flex items-center gap-1.5 hover:text-primary" onClick={() => handleLikePost(item.id)}>
                                                    <Heart className="mr-2 h-4 w-4" />
                                                    <span>{item.likes}</span>
                                                </button>
                                                <button className="flex items-center gap-1.5 hover:text-primary" onClick={() => handleCommentPost(item.id)}>
                                                    <MessageSquare className="mr-2 h-4 w-4" />
                                                    <span>{item.replies}</span>
                                                </button>
                                            </div>
                                            {item.location && <span className="text-xs">{item.location}</span>}
                                        </div>
                                    </Card>
                                ))
                              ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p className="text-lg font-semibold">No results found for "{searchTerm}"</p>
                                    <p>Try searching for something else in the feed.</p>
                                </div>
                              )}
                            </div>
                            <div className="lg:col-span-1 space-y-4 lg:sticky top-24">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Hash className="h-5 w-5 text-primary"/>
                                            Trending
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {trendingTopics.map((topic, index) => (
                                            <div key={index} className="text-sm cursor-pointer group">
                                                <p className="font-semibold group-hover:underline">#{topic.topic}</p>
                                                <p className="text-xs text-muted-foreground">{topic.posts}</p>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <UserPlus className="h-5 w-5 text-primary"/>
                                            Who to follow
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                         {suggestedUsers.map(u => (
                                            <div key={u.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={u.avatar} alt={u.name} />
                                                        <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold text-sm">{u.name}</p>
                                                        <p className="text-xs text-muted-foreground">{u.handle}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant={followingIds.includes(u.uid) ? "outline" : "default"}
                                                    onClick={() => handleFollowToggle(u.uid)}
                                                >
                                                    {followingIds.includes(u.uid) ? 'Following' : 'Follow'}
                                                </Button>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Video className="h-5 w-5 text-primary"/>
                                            Top Live Streams
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {topLiveStreams.slice(0, 2).map((seller) => (
                                            <Link href={`/stream/${seller.id}`} key={seller.id} className="group relative cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-primary/50 transition-shadow duration-300 block">
                                                <div className="absolute top-1.5 left-1.5 z-10">
                                                    <Badge variant="destructive" className="text-xs px-1.5 py-0.5 h-auto">LIVE</Badge>
                                                </div>
                                                <div className="absolute top-1.5 right-1.5 z-10">
                                                    <Badge variant="secondary" className="bg-background/60 backdrop-blur-sm text-xs px-1.5 py-0.5 h-auto">
                                                        <Users className="w-2.5 h-2.5 mr-1" />
                                                        {(seller.viewers / 1000).toFixed(1)}k
                                                    </Badge>
                                                </div>
                                                <Image 
                                                    src={seller.thumbnailUrl} 
                                                    alt={`Live stream from ${seller.name}`} 
                                                    width={300} 
                                                    height={450} 
                                                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                                                    data-ai-hint={seller.hint}
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-8 w-8 border-2 border-primary">
                                                            <AvatarImage src={seller.avatarUrl} alt={seller.name} />
                                                            <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <h3 className="font-semibold text-sm text-primary-foreground truncate">{seller.name}</h3>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                          </div>
                           {user && (
                                <CreatePostForm ref={createPostFormRef} replyTo={replyTo} onClearReply={() => setReplyTo(null)} />
                            )}
                    </TabsContent>
                </Tabs>
                </div>
            </main>
            <Footer />
        </div>
    </div>
  );
}
