
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
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Banknote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
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
import { categories } from '@/lib/categories';
import { Separator } from '@/components/ui/separator';
import { ProductSearchWithStreams } from '@/components/ProductSearchWithStreams';
import { motion } from 'framer-motion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useIsMobile } from '@/hooks/use-mobile';


const liveSellers = [
    { id: 'fashionfinds-uid', name: 'FashionFinds', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/fashion-stream/300/450', category: 'Fashion', viewers: 1200, buyers: 25, rating: 4.8, reviews: 12, hint: 'woman posing stylish outfit', productId: 'prod_1', hasAuction: true },
    { id: 'gadgetguru-uid', name: 'GadgetGuru', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/tech-stream/300/450', category: 'Electronics', viewers: 2500, buyers: 42, rating: 4.9, reviews: 28, hint: 'unboxing new phone', productId: 'prod_2', hasAuction: false },
    { id: 'homehaven-uid', name: 'HomeHaven', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/home-stream/300/450', category: 'Home Goods', viewers: 850, buyers: 15, rating: 4.7, reviews: 9, hint: 'modern living room decor', productId: 'prod_3', hasAuction: false },
    { id: 'beautybox-uid', name: 'BeautyBox', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/beauty-stream/300/450', category: 'Beauty', viewers: 3100, buyers: 78, rating: 4.9, reviews: 55, hint: 'makeup tutorial', productId: 'prod_4', hasAuction: true },
    { id: 'kitchenwiz-uid', name: 'KitchenWiz', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/kitchen-stream/300/450', category: 'Kitchenware', viewers: 975, buyers: 0, rating: 0, reviews: 0, hint: 'cooking demonstration', productId: 'prod_5', hasAuction: false },
    { id: 'fitflow-uid', name: 'FitFlow', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/fitness-stream/300/450', category: 'Fitness', viewers: 1500, buyers: 33, rating: 4.6, reviews: 18, hint: 'yoga session', productId: 'prod_6', hasAuction: false },
    { id: 'artisanalley-uid', name: 'ArtisanAlley', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/artisan-stream/300/450', category: 'Handmade', viewers: 450, buyers: 8, rating: 5.0, reviews: 6, hint: 'pottery making', productId: 'prod_7', hasAuction: true },
    { id: 'petpalace-uid', name: 'PetPalace', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/pet-stream/300/450', category: 'Pet Supplies', viewers: 1800, buyers: 50, rating: 4.8, reviews: 30, hint: 'playing with puppy', productId: 'prod_8', hasAuction: false },
    { id: 'booknook-uid', name: 'BookNook', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/book-stream/300/450', category: 'Books', viewers: 620, buyers: 12, rating: 4.9, reviews: 10, hint: 'reading book cozy', productId: 'prod_9', hasAuction: false },
    { id: 'gamerguild-uid', name: 'GamerGuild', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/gaming-stream/300/450', category: 'Gaming', viewers: 4200, buyers: 102, rating: 4.9, reviews: 80, hint: 'esports competition', productId: 'prod_10' },
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

const AnimatedCategoryCard = ({
  item,
  isHovered,
  setHovered,
}: {
  item: any;
  isHovered: boolean;
  setHovered: (val: boolean) => void;
}) => {
  return (
    <motion.div
      className={cn(
        'relative rounded-2xl overflow-hidden cursor-pointer h-40 md:h-full',
        item.gridClass
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      layout
    >
      <Image
        src={item.image}
        alt={item.product || item.category}
        fill
        sizes="(max-width: 768px) 50vw, 33vw"
        className={cn(
          'object-cover transition-transform duration-500',
          isHovered ? 'scale-110' : 'scale-100'
        )}
        data-ai-hint={item.hint}
      />
      <div
        className={cn(
          'absolute inset-0 transition-colors',
          item.bgColor,
          isHovered ? 'bg-opacity-30' : 'bg-opacity-70'
        )}
      />
      <div className="absolute inset-0 p-6 flex flex-col justify-start">
        <p className="text-sm font-semibold opacity-80">{item.category}</p>
        <p className="text-2xl font-bold">{item.product || item.category}</p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
          transition={{ duration: 0.3 }}
          className="mt-auto"
        >
          <Button variant="secondary" className="bg-background/80 backdrop-blur-sm">
            Shop Now <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

const CategoryGrid = () => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const categoryCardsData = useMemo(() => {
        const categoryCounts = Object.values(productDetails).reduce((acc: Record<string, number>, product) => {
            const category = product.category || 'Uncategorized';
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});

        const sortedCategories = Object.entries(categoryCounts)
            .sort(([, countA], [, countB]) => countB - a)
            .slice(0, 7)
            .map(([category]) => category);
        
        const defaultLayout = [
            { gridClass: 'md:row-span-2 md:col-span-2', bgColor: 'bg-gray-100 dark:bg-gray-800' },
            { gridClass: '', bgColor: 'bg-blue-100 dark:bg-blue-900/50' },
            { gridClass: '', bgColor: 'bg-yellow-100 dark:bg-yellow-900/50' },
            { gridClass: '', bgColor: 'bg-rose-100 dark:bg-rose-900/50' },
            { gridClass: '', bgColor: 'bg-green-100 dark:bg-green-900/50' },
            { gridClass: '', bgColor: 'bg-indigo-100 dark:bg-indigo-900/50' },
            { gridClass: 'md:col-span-2', bgColor: 'bg-red-100 dark:bg-red-900/50' },
        ];
        
        const categoryDataMap: Record<string, { product: string; image: string; hint: string }> = {
            'Home': { product: 'SOFA', image: 'https://picsum.photos/seed/sofa/800/800', hint: 'modern sofa' },
            'Women': { product: 'FASHION', image: 'https://picsum.photos/seed/women-fashion/800/800', hint: 'woman fashion' },
            'Men': { product: 'STYLE', image: 'https://picsum.photos/seed/men-style/800/800', hint: 'man style' },
            'Shoes': { product: 'SNEAKERS', image: 'https://picsum.photos/seed/sneakers/800/800', hint: 'blue sneakers' },
            'Kids': { product: 'TOYS', image: 'https://picsum.photos/seed/train/800/800', hint: 'toy train' },
            'Electronics': { product: 'GADGETS', image: 'https://picsum.photos/seed/gadget/800/800', hint: 'gadgets' },
            'Handbags': { product: 'BAGS', image: 'https://picsum.photos/seed/handbag/800/800', hint: 'handbag' },
            'Trending': { product: 'HOT', image: 'https://picsum.photos/seed/hot/800/800', hint: 'trending' },
            'Sale': { product: 'DEALS', image: 'https://picsum.photos/seed/sale/800/800', hint: 'sale deals' },
        };

        return sortedCategories.map((category, index) => {
            const data = categoryDataMap[category] || { product: category.toUpperCase(), image: `https://picsum.photos/seed/${category.toLowerCase()}/800/800`, hint: category.toLowerCase() };
            return {
                category,
                ...data,
                ...defaultLayout[index],
            };
        });

    }, []);

    return (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-4 md:auto-rows-[180px] gap-4">
            {categoryCardsData.map((item, index) => (
                <AnimatedCategoryCard
                    key={item.product + index}
                    item={item}
                    isHovered={hoveredIndex === index}
                    setHovered={(isHovered) => setHoveredIndex(isHovered ? index : null)}
                />
            ))}
        </motion.div>
    );
};

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
  const isMobile = useIsMobile();


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
                    thumbnailUrl: liveStreamData.product?.image?.preview || 'https://picsum.photos/seed/new-stream/300/450',
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

  const mostReachedPosts = useMemo(() => {
    return [...feed].sort((a, b) => (b.likes + b.replies) - (a.likes + a.replies)).slice(0, 4);
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
    return sellers.sort((a, b) => b.viewers - a.viewers);
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
            const mediaRef = ref(storage, mediaUrl);
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

  const renderProductCard = (product: any) => (
    <Link href={`/product/${product.key}`} key={product.id} className="group block">
        <Card className="w-full overflow-hidden h-full flex flex-col bg-card shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="relative aspect-square bg-muted">
                <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform group-hover:scale-105"
                    data-ai-hint={product.hint}
                />
            </div>
            <div className="p-2 flex-grow flex flex-col">
                <h4 className="font-semibold truncate text-xs leading-tight flex-grow">{product.name}</h4>
                <p className="font-bold text-sm mt-0.5">{product.price}</p>
                <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-semibold text-foreground">4.8</span>
                    <span className="text-muted-foreground">({product.reviews || '1.2k'})</span>
                </div>
                 <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                    <div className="flex items-center gap-1"><Package className="w-3 h-3" /> {product.stock}</div>
                    <div className="flex items-center gap-1"><Users className="w-3 h-3" /> {product.sold}</div>
                </div>
            </div>
        </Card>
    </Link>
  );
  
  const mostPopularStreams = useMemo(() => {
    return [...allSellers].sort((a, b) => b.viewers - a.viewers);
  }, [allSellers]);
  
  const popularProducts = useMemo(() => {
    return Object.values(productDetails)
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 4);
  }, []);

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
                                        <span>Help & Support</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => router.push('/privacy-and-security')}>
                                        <Shield className="mr-2 h-4 w-4" />
                                        <span>Privacy & Security</span>
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
                        <TabsTrigger value="all" className="text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4">All</TabsTrigger>
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
                            {isMobile ? (
                                <Carousel className="w-full px-4">
                                    <CarouselContent className="-ml-2">
                                        {topLiveStreams.map((seller: any) => (
                                            <CarouselItem key={seller.id} className="pl-2 basis-3/4 sm:basis-1/2">
                                                 <Link href={`/stream/${seller.id}`} className="group">
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
                                            </CarouselItem>
                                        ))}
                                    </CarouselContent>
                                    <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                                    <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
                                </Carousel>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4 px-2 md:px-4">
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
                                                    <p className="font-semibold text-xs group-hover:underline truncate">{seller.title || seller.name}</p>
                                                    <p className="text-xs text-muted-foreground">{seller.category}</p>
                                                    <p className="text-xs text-primary font-semibold mt-0.5">#{seller.category.toLowerCase()}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </section>
                        
                         <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                             <div className="bg-muted/30 rounded-lg p-4 sm:p-6 lg:p-8">
                                <h2 className="text-3xl font-bold text-center mb-6">Shop by Category</h2>
                                <CategoryGrid />
                              </div>
                        </section>
                        
                         <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                           <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Sparkles className="text-primary" /> Top Picks for You
                                    </CardTitle>
                                    <CardDescription>Our top 10 most viewed products.</CardDescription>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {popularProducts.map(renderProductCard)}
                                </CardContent>
                            </Card>
                        </div>
                        
                        <section className="mt-8">
                             <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-4">
                                <h2 className="text-2xl font-bold flex items-center justify-center gap-2"><TrendingUp className="text-primary" /> Most Reached Posts</h2>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 auto-rows-fr gap-4 px-4 sm:px-6 lg:px-8">
                                {mostReachedPosts.map(post => (
                                     <Card key={post.id} className="overflow-hidden flex flex-col bg-card">
                                        <CardHeader className="p-4">
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
                                        </CardHeader>
                                        <CardFooter className="px-4 pb-3 flex justify-between items-center text-sm text-muted-foreground mt-auto pt-3 border-t">
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
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    </div>
                </TabsContent>
                )}

                <TabsContent value="live" className="mt-0">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                            <PromotionalCarousel />
                            <div className="flex flex-wrap gap-2 mb-6 mt-8">
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                    {Array.from({ length: 12 }).map((_, index) => (
                                        <LiveSellerSkeleton key={index} />
                                    ))}
                                </div>
                            ) : filteredLiveSellers.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
