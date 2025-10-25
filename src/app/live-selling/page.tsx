
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
import { getCart, addToCart, saveCart } from '@/lib/product-history';
import { Dialog, DialogHeader, DialogTitle, DialogTrigger, DialogContent, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { GoLiveDialog } from '@/components/go-live-dialog';
import { collection, query, orderBy, onSnapshot, Timestamp, deleteDoc, doc, updateDoc, increment, addDoc, serverTimestamp, where, getDocs, runTransaction, limit } from "firebase/firestore";
import { getFirestoreDb, getFirebaseStorage } from '@/lib/firebase';
import { format, formatDistanceToNow } from 'date-fns';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import { isFollowing, toggleFollow, UserData, getUserByDisplayName } from '@/lib/follow-data';
import { productDetails, productToSellerMapping } from '@/lib/product-data';
import { PromotionalCarousel } from '@/components/promotional-carousel';
import { categories } from '@/lib/categories';
import { Separator } from '@/components/ui/separator';
import { ProductSearchWithStreams } from '@/components/ProductSearchWithStreams';
import { motion, AnimatePresence } from 'framer-motion';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { CATEGORY_BANNERS_KEY, CategoryBanners } from '@/app/admin/settings/page';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ProductShelfContent } from '@/components/product-shelf-content';


const liveSellers = [
    { id: 'fashionfinds-uid', name: 'FashionFinds', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/fashion-stream/300/450', category: 'Fashion', subcategory: 'Dresses', viewers: 1200, buyers: 25, rating: 4.8, reviews: 12, hint: 'woman posing stylish outfit', productId: 'prod_1', hasAuction: true, title: 'Unveiling New Vintage Collection' },
    { id: 'gadgetguru-uid', name: 'GadgetGuru', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/tech-stream/300/450', category: 'Electronics', subcategory: 'Smartphones & Accessories', viewers: 2500, buyers: 42, rating: 4.9, reviews: 28, hint: 'unboxing new phone', productId: 'prod_2', hasAuction: false, title: 'Live Unboxing: The Latest Smartphone' },
    { id: 'homehaven-uid', name: 'HomeHaven', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/home-stream/300/450', category: 'Home', subcategory: 'Home Decor', viewers: 850, buyers: 15, rating: 4.7, reviews: 9, hint: 'modern living room decor', productId: 'prod_3', hasAuction: false, title: 'Cozy Living Room Styling Tips' },
    { id: 'beautybox-uid', name: 'BeautyBox', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/beauty-stream/300/450', category: 'Women', subcategory: 'Makeup', viewers: 3100, buyers: 78, rating: 4.9, reviews: 55, hint: 'makeup tutorial', productId: 'prod_4', hasAuction: true, title: 'Get Ready With Me: Summer Glow' },
    { id: 'kitchenwiz-uid', name: 'KitchenWiz', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/kitchen-stream/300/450', category: 'Home', subcategory: 'Kitchen', viewers: 975, buyers: 0, rating: 0, reviews: 0, hint: 'cooking demonstration', productId: 'prod_5', hasAuction: false, title: '5 Easy Meal Prep Ideas' },
    { id: 'fitflow-uid', name: 'FitFlow', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/fitness-stream/300/450', category: 'Men', subcategory: 'Activewear', viewers: 1500, buyers: 33, rating: 4.6, reviews: 18, hint: 'yoga session', productId: 'prod_6', hasAuction: false, title: 'Morning Yoga Flow Session' },
    { id: 'artisanalley-uid', name: 'ArtisanAlley', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/artisan-stream/300/450', category: 'Home', subcategory: 'Home Decor', viewers: 450, buyers: 8, rating: 5.0, reviews: 6, hint: 'pottery making', productId: 'prod_7', hasAuction: true, title: 'Live Pottery: Creating a Ceramic Piece' },
    { id: 'petpalace-uid', name: 'PetPalace', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/pet-stream/300/450', category: 'Home', subcategory: 'Pet Supplies', viewers: 1800, buyers: 50, rating: 4.8, reviews: 30, hint: 'playing with puppy', productId: 'prod_8', hasAuction: false, title: 'Q&A: All About Dog Nutrition' },
    { id: 'booknook-uid', name: 'BookNook', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/book-stream/300/450', category: 'Trending', subcategory: 'Books', viewers: 620, buyers: 12, rating: 4.9, reviews: 10, hint: 'reading book cozy', productId: 'prod_9', hasAuction: false, title: 'Live Reading: New Fantasy Novel' },
    { id: 'gamerguild-uid', name: 'GamerGuild', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/gaming-stream/300/450', category: 'Electronics', subcategory: 'Video Games', viewers: 4200, buyers: 102, rating: 4.9, reviews: 80, hint: 'esports competition', productId: 'prod_10', hasAuction: true, title: "Weekly Esports Tournament Finals" },
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

        const sortedCategories = Object.keys(categoryCounts)
            .sort((a, b) => categoryCounts[b] - categoryCounts[a])
            .slice(0, 7)
            .map((category) => category);
        
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
            <Skeleton className="w-full aspect-[3/4]" />
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
                <Skeleton className="w-full aspect-[3/4] rounded-lg" />
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
  const [activeTab, setActiveTab] = useState("recommended");
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
  
  const [selectedBrowseCategory, setSelectedBrowseCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [isProductOverlayOpen, setIsProductOverlayOpen] = useState(false);
  const [overlayProducts, setOverlayProducts] = useState<any[]>([]);
  const [overlaySeller, setOverlaySeller] = useState<any | null>(null);

  const getProductsForSeller = (sellerId: string): any[] => {
    return Object.values(productDetails).filter(p => productToSellerMapping[p.key]?.uid === sellerId);
  }
  
  const handleAddToCart = (product: any) => {
    handleAuthAction(() => {
        addToCart({ ...product, quantity: 1 });
        setCartCount(getCart().reduce((sum, item) => sum + item.quantity, 0));
        toast({
            title: "Added to Cart!",
            description: `'${product.name}' has been added to your shopping cart.`
        });
    });
  };

  const handleShowMoreProducts = (e: React.MouseEvent, seller: any) => {
    e.preventDefault();
    e.stopPropagation();
    const products = getProductsForSeller(seller.id);
    setOverlayProducts(products);
    setOverlaySeller(seller);
    setIsProductOverlayOpen(true);
  };

  const allSubcategories = useMemo(() => {
    return categories.flatMap(category => 
        category.subcategories.map(subcategory => ({
            ...subcategory,
            categoryName: category.name,
            imageUrl: `https://picsum.photos/seed/${subcategory.name.toLowerCase().replace(/ /g, '-').replace(/&/g, '%26')}/300/400`,
            tags: [subcategory.name.split(' ')[0]],
            viewers: Math.floor(Math.random() * 50000) + 1000
        }))
    );
  }, []);

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
                    subcategory: liveStreamData.product?.subcategory || '',
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

  const handleBuyNow = (product: any) => {
    handleAuthAction(() => {
        if (product) {
            const buyNowCart = [{
                ...product,
                id: product.id,
                key: product.key,
                name: product.name,
                price: product.price,
                imageUrl: product.images[0]?.preview || product.images[0],
                quantity: 1,
            }];
            saveCart(buyNowCart);
            localStorage.setItem('buyNow', 'true');
            router.push('/cart');
        }
    });
  };
  
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
  
  const markAsRead = (id: number) => {
    setNotifications(current => current.map(n => n.id === id ? { ...n, read: true } : n));
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

  const popularProducts = useMemo(() => {
    return Object.values(productDetails)
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 4);
  }, []);
  
    const trendingCategories = useMemo(() => {
        const categoryCounts: Record<string, number> = {};
        allSellers.forEach(seller => {
            categoryCounts[seller.category] = (categoryCounts[seller.category] || 0) + 1;
        });

        const sortedCategories = Object.keys(categoryCounts)
            .sort((a, b) => categoryCounts[b] - categoryCounts[a])
            .slice(0, 4); // Limit to top 4 for example

        return sortedCategories.map(category => ({
            name: category,
            streams: allSellers.filter(s => s.category === category).slice(0, 8)
        }));
    }, [allSellers]);

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
        
        <div className="flex-grow">
            {isSearchOpen ? (
                <ProductSearchWithStreams />
            ) : (
                <div className="mt-0">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
                        <PromotionalCarousel />
                        <Tabs defaultValue="recommended" className="w-full">
                            <TabsList>
                                <TabsTrigger value="recommended">Recommended</TabsTrigger>
                                <TabsTrigger value="browse">Browse</TabsTrigger>
                                <TabsTrigger value="following">Following</TabsTrigger>
                            </TabsList>
                            <TabsContent value="recommended" className="mt-4">
                                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {topLiveStreams.map((seller) => {
                                        const sellerProducts = getProductsForSeller(seller.id);
                                        const productsToShow = sellerProducts.slice(0, 6);
                                        const remainingCount = sellerProducts.length > 5 ? sellerProducts.length - 5 : 0;
                                        
                                        return (
                                        <Card key={seller.id} className="group flex flex-col space-y-2 overflow-hidden border-none shadow-none bg-transparent">
                                            <Link href={`/stream/${seller.id}`} className="block">
                                                <div className="relative rounded-lg overflow-hidden aspect-[16/9] bg-muted w-full">
                                                    <div className="absolute top-2 left-2 z-10"><Badge variant="destructive">LIVE</Badge></div>
                                                    <div className="absolute top-2 right-2 z-10"><Badge variant="secondary" className="bg-black/50 text-white"><Users className="w-3 h-3 mr-1"/>{seller.viewers.toLocaleString()}</Badge></div>
                                                    <Image src={seller.thumbnailUrl} alt={`Live stream from ${seller.name}`} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover w-full h-full transition-transform group-hover:scale-105" />
                                                </div>
                                                <div className="flex items-start gap-2 mt-2">
                                                    <Avatar className="w-8 h-8">
                                                        <AvatarImage src={seller.avatarUrl} alt={seller.name} />
                                                        <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="font-semibold text-sm leading-tight group-hover:underline truncate">{seller.title || seller.name}</p>
                                                        <p className="text-xs text-primary font-semibold mt-0.5">#{seller.category.toLowerCase().replace(/\s+/g, '')}</p>
                                                    </div>
                                                </div>
                                            </Link>
                                            <div className="flex items-center gap-1.5 mt-auto flex-shrink-0 pt-2 w-full justify-start pb-2">
                                                {productsToShow.slice(0, remainingCount > 0 ? 5 : 6).map((p, i) => (
                                                    <Link href={`/product/${p.key}`} key={p.key} className="block" onClick={(e) => e.stopPropagation()}>
                                                        <div className="w-10 h-10 bg-muted rounded-md border overflow-hidden hover:ring-2 hover:ring-primary">
                                                            <Image src={p.images[0]?.preview || p.images[0]} alt={p.name} width={40} height={40} className="object-cover w-full h-full" />
                                                        </div>
                                                    </Link>
                                                ))}
                                                {remainingCount > 0 && (
                                                     <Sheet>
                                                        <SheetTrigger asChild>
                                                            <button className="w-10 h-10 bg-muted rounded-md border flex items-center justify-center text-xs font-semibold text-muted-foreground hover:bg-secondary">
                                                                +{remainingCount}
                                                            </button>
                                                        </SheetTrigger>
                                                        <SheetContent side="bottom" className="h-[60vh] flex flex-col p-0" onClick={(e) => e.stopPropagation()}>
                                                             <ProductShelfContent 
                                                                sellerProducts={sellerProducts}
                                                                handleAddToCart={handleAddToCart}
                                                                handleBuyNow={handleBuyNow}
                                                                isMobile={true}
                                                                onClose={() => {
                                                                    const closeButton = document.querySelector('[data-radix-collection-item] > button');
                                                                    if (closeButton instanceof HTMLElement) closeButton.click();
                                                                }}
                                                                toast={toast}
                                                            />
                                                        </SheetContent>
                                                    </Sheet>
                                                )}
                                            </div>
                                        </Card>
                                        )
                                    })}
                                </div>
                            </TabsContent>
                             <TabsContent value="browse" className="mt-4">
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                    {allSubcategories.map((sub, index) => (
                                        <Link href={`/${sub.categoryName.toLowerCase()}/${sub.name.toLowerCase().replace(/ /g, '-').replace(/&/g, '%26')}`} key={index} className="group block space-y-2">
                                            <Card className="overflow-hidden">
                                                <div className="aspect-[3/4] bg-muted relative">
                                                    <Image
                                                        src={sub.imageUrl}
                                                        alt={sub.name}
                                                        fill
                                                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                                                        className="object-cover group-hover:scale-105 transition-transform"
                                                    />
                                                </div>
                                            </Card>
                                            <div>
                                                <p className="font-semibold text-sm truncate group-hover:text-primary">{sub.name}</p>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                  <div className="flex items-center gap-1">
                                                    <Users className="w-3 h-3" />
                                                    {sub.viewers.toLocaleString()} watching
                                                  </div>
                                                  <Badge variant="outline">{sub.categoryName}</Badge>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="following">
                                <div className="text-center py-20 text-muted-foreground">
                                    <p>Following content coming soon.</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            )}
        </div>
        <div className="mt-12">
          <Footer />
        </div>
      </div>
      <AnimatePresence>
        {isProductOverlayOpen && (
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed inset-0 bg-background z-50 flex flex-col"
            >
                <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
                    <div>
                        <h2 className="text-lg font-bold">Products by {overlaySeller?.name}</h2>
                        <p className="text-sm text-muted-foreground">{overlayProducts.length} items</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsProductOverlayOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <ScrollArea className="flex-grow">
                     <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {overlayProducts.map(product => (
                            <Link href={`/product/${product.key}`} key={product.id} className="group block" onClick={() => setIsProductOverlayOpen(false)}>
                                <Card className="w-full group overflow-hidden h-full flex flex-col">
                                    <div className="aspect-square bg-muted rounded-t-lg overflow-hidden relative">
                                        <Image
                                            src={product.images?.[0]?.preview || product.images?.[0] || "https://placehold.co/200x200.png"}
                                            alt={product.name}
                                            fill
                                            className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                                        />
                                    </div>
                                    <div className="p-2">
                                        <h4 className="font-semibold truncate text-xs">{product.name}</h4>
                                        <p className="font-bold text-foreground text-sm">{product.price.toLocaleString()}</p>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </ScrollArea>
            </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
