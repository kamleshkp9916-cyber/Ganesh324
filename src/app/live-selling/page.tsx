
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
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
} from "@/components/ui/alert-dialog"
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { CreatePostForm, PostData } from '@/components/create-post-form';


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
      productId: 'prod_1'
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
      productId: 'prod_2'
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
      productId: 'prod_3'
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
      productId: 'prod_4'
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
      productId: 'prod_5'
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
      productId: 'prod_6'
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
      productId: 'prod_7'
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
      productId: 'prod_8'
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
      productId: 'prod_9'
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
      productId: 'prod_10'
    },
]

const offerSlides = [
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

const initialFollowing = [
    { id: 'user1', name: 'CoolCat', avatar: 'https://placehold.co/40x40.png' },
    { id: 'user2', name: 'GamerGirl92', avatar: 'https://placehold.co/40x40.png' },
    { id: 'user3', name: 'TechWizard', avatar: 'https://placehold.co/40x40.png' },
    { id: 'user4', name: 'StyleSavvy', avatar: 'https://placehold.co/40x40.png' },
    { id: 'user5', name: 'FoodieFinds', avatar: 'https://placehold.co/40x40.png' },
    { id: 'user6', name: 'AdventureJunkie', avatar: 'https://placehold.co/40x40.png' },
    { id: 'user7', name: 'BookWorm', avatar: 'https://placehold.co/40x40.png' },
    { id: 'user8', name: 'DIYDan', avatar: 'https://placehold.co/40x40.png' },
];

const initialMockFeed = [
    { id: 1, sellerName: 'FashionFinds', avatarUrl: 'https://placehold.co/40x40.png', timestamp: '2 hours ago', content: 'Just went live with a new collection of summer dresses! 👗☀️', productImageUrl: 'https://placehold.co/400x300.png', hint: 'summer dresses fashion', likes: 120, replies: 15, location: null },
    { id: 2, sellerName: 'GadgetGuru', avatarUrl: 'https://placehold.co/40x40.png', timestamp: '5 hours ago', content: 'Unboxing the new X-1 Drone. You won\'t believe the camera quality! Join the stream now!', productImageUrl: 'https://placehold.co/400x300.png', hint: 'drone flying', likes: 350, replies: 42, location: 'New York, USA' },
    { id: 3, sellerName: 'HomeHaven', avatarUrl: 'https://placehold.co/40x40.png', timestamp: '1 day ago', content: 'Restocked our popular ceramic vase collection. They sell out fast!', productImageUrl: 'https://placehold.co/400x300.png', hint: 'ceramic vases', likes: 88, replies: 9, location: null },
    { id: 4, sellerName: 'BeautyBox', avatarUrl: 'https://placehold.co/40x40.png', timestamp: '2 days ago', content: 'My new skincare routine is a game changer. Live tutorial this Friday!', productImageUrl: 'https://placehold.co/400x300.png', hint: 'skincare products', likes: 210, replies: 25, location: 'Los Angeles, USA' },
];

const reportReasons = [
    { id: "spam", label: "It's spam" },
    { id: "hate", label: "Hate speech or symbols" },
    { id: "violence", label: "Violence or dangerous organizations" },
    { id: "scam", label: "Scam or fraud" },
    { id: "false", label: "False information" },
    { id: "bullying", label: "Bullying or harassment" },
];

const trendingTopics = [
    { id: 1, topic: 'VintageFinds', posts: '1.2k posts' },
    { id: 2, topic: 'TechDeals', posts: '3.4k posts' },
    { id: 3, topic: 'SummerFashion', posts: '5.6k posts' },
    { id: 4, topic: 'HomeDecor', posts: '890 posts' },
];

const allSuggestedUsers = [
    { id: 'retro', name: 'RetroClicks', handle: '@retroclicks', avatar: 'https://placehold.co/40x40.png' },
    { id: 'savvy', name: 'StyleSavvy', handle: '@stylesavvy', avatar: 'https://placehold.co/40x40.png' },
    { id: 'diy', name: 'DIYDan', handle: '@diydan', avatar: 'https://placehold.co/40x40.png' },
    { id: 'artisan', name: 'ArtisanAlley', handle: '@artisanalley', avatar: 'https://placehold.co/40x40.png' },
    { id: 'gamer', name: 'GamerGuild', handle: '@gamerguild', avatar: 'https://placehold.co/40x40.png' },
    { id: 'book', name: 'BookNook', handle: '@booknook', avatar: 'https://placehold.co/40x40.png' },
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
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);
  const [isLoadingSellers, setIsLoadingSellers] = useState(true);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [api, setApi] = useState<CarouselApi>()
  const [currentSlide, setCurrentSlide] = useState(0)
  const { user, loading: authLoading } = useAuth();
  const { signOut } = useAuthActions();
  const [followingList, setFollowingList] = useState(initialFollowing);
  const [mockFeed, setMockFeed] = useState<(typeof initialMockFeed)>([]);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState("");
  const { toast } = useToast();
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("live");
  const [suggestedUsers, setSuggestedUsers] = useState<typeof allSuggestedUsers>([]);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const createPostFormRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allSellers, setAllSellers] = useState(liveSellers);
  
  useEffect(() => {
    setIsMounted(true);
    // Simulate loading data
    const offersTimer = setTimeout(() => setIsLoadingOffers(false), 1500);
    const sellersTimer = setTimeout(() => {
        setIsLoadingSellers(false)
    }, 2000);
    const feedTimer = setTimeout(() => {
        setIsLoadingFeed(false)
        setMockFeed(initialMockFeed);
    }, 2500);

    const checkLiveStream = () => {
        if (typeof window !== 'undefined') {
            const liveStreamDataRaw = localStorage.getItem('liveStream');
            if (liveStreamDataRaw) {
                const liveStreamData = JSON.parse(liveStreamDataRaw);
                const sellerIsLive = allSellers.some(s => s.id === liveStreamData.seller.id);

                if (!sellerIsLive) {
                    const newSellerCard = {
                        id: liveStreamData.seller.id,
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
                    };
                    setAllSellers(prev => [newSellerCard, ...prev.filter(s => s.id !== newSellerCard.id)]);
                }
            } else {
                 setAllSellers(prev => prev.filter(s => !(s as any).isMyStream));
            }
        }
    };
    
    checkLiveStream();
    window.addEventListener('storage', checkLiveStream);


    return () => {
        clearTimeout(offersTimer);
        clearTimeout(sellersTimer);
        clearTimeout(feedTimer);
        window.removeEventListener('storage', checkLiveStream);
    };
  }, []);

  const handleCreatePost = (data: PostData) => {
    if (!user) return;
    const newPost = {
        id: mockFeed.length + 1,
        sellerName: user.displayName || 'You',
        avatarUrl: user.photoURL || 'https://placehold.co/40x40.png',
        timestamp: 'just now',
        content: data.content,
        productImageUrl: data.media?.url || null,
        hint: 'user uploaded content',
        likes: 0,
        replies: 0,
        location: data.location || null,
    };
    setMockFeed([newPost, ...mockFeed]);
    toast({
        title: "Post Created!",
        description: "Your post has been successfully shared.",
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
    return [...allSellers].sort((a, b) => b.viewers - a.viewers).slice(0, 3);
  }, [allSellers]);

  const filteredLiveSellers = useMemo(() => {
    if (!searchTerm) return allSellers;
    return allSellers.filter(seller => 
        seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        seller.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, allSellers]);

  const filteredFeed = useMemo(() => {
    if (!searchTerm) return mockFeed;
    return mockFeed.filter(item => 
        item.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, mockFeed]);

  useEffect(() => {
    setSuggestedUsers(shuffleArray([...allSuggestedUsers]).slice(0, 3));
  }, []);
  
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

  const handleReply = (sellerName: string) => {
    handleAuthAction(() => {
      setReplyTo(sellerName);
      if (createPostFormRef.current) {
        createPostFormRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    });
  };
  
  const handleUnfollow = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    handleAuthAction(() => {
        setFollowingList(currentList => currentList.filter(user => user.id !== userId));
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

  useEffect(() => {
    if (!api) {
      return
    }
 
    onSelect(api);
    api.on('select', onSelect);
    api.on('reInit', onSelect)
  }, [api, onSelect]);

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
            <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b gap-4">
                <div className="flex items-center gap-2">
                    <ShoppingCart className="h-7 w-7 text-primary" />
                    <h1 className="text-2xl font-bold tracking-tight text-primary hidden sm:block">StreamCart</h1>
                </div>

                <div className="flex items-center justify-end gap-2" ref={searchRef}>
                     <div className="relative flex items-center">
                        <Input
                            placeholder="Search..."
                            className={cn(
                                "bg-muted rounded-full transition-all duration-300 ease-in-out h-10 pl-10 pr-4",
                                isSearchExpanded ? "w-48 sm:w-64" : "w-0 opacity-0"
                            )}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                         <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-foreground rounded-full hover:bg-accent h-10 w-10 shrink-0"
                            onClick={() => setIsSearchExpanded(p => !p)}
                        >
                            <Search className="h-5 w-5" />
                        </Button>
                    </div>
                    {(!isMounted || authLoading) ? (
                        <Skeleton className="h-9 w-24 rounded-full" />
                    ) : user ? (
                        <>
                            
                            <Button variant="ghost" size="icon" className="text-foreground rounded-full bg-card hover:bg-accent hidden sm:flex" onClick={() => handleAuthAction()}>
                                <Bell />
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Avatar className="h-9 w-9 cursor-pointer">
                                        <AvatarImage src={user.photoURL || 'https://placehold.co/40x40.png'} alt={user.displayName || "User"} />
                                        <AvatarFallback>{user.displayName ? user.displayName.charAt(0) : 'U'}</AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-64" align="end" forceMount>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.displayName}</p>
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
                                        <Link href="/orders"><ShoppingBag className="mr-2 h-4 w-4" /><span>Orders</span></Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                        <Link href="/wishlist"><Heart className="mr-2 h-4 w-4" /><span>Wishlist</span></Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                        <Link href="/wallet"><Wallet className="mr-2 h-4 w-4" /><span>Wallet</span></Link>
                                        </DropdownMenuItem>
                                        
                                        <DropdownMenuItem asChild>
                                        <Link href="/listed-products"><List className="mr-2 h-4 w-4" /><span>Listed Products</span></Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                        <Link href="/top-seller"><Award className="mr-2 h-4 w-4" /><span>Top Seller</span></Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                        <Link href="/message"><MessageSquare className="mr-2 h-4 w-4" /><span>Message</span></Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem asChild>
                                        <Link href="/setting"><Settings className="mr-2 h-4 w-4" /><span>Setting</span></Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                        <Link href="/privacy-and-security"><Shield className="mr-2 h-4 w-4" /><span>Privacy And Security</span></Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                        <Link href="/terms-and-conditions"><FileText className="mr-2 h-4 w-4" /><span>Term &amp; Conditions</span></Link>
                                        </DropdownMenuItem>
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
                        </>
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
            
            <main className="flex-1 overflow-y-auto p-2 md:p-4">
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
                                    <TabsTrigger value="feeds" disabled={!user}>Feeds</TabsTrigger>
                                </TabsList>
                            </div>
                    )}
                    

                    <TabsContent value="live">
                        <div className="mb-6">
                        {isLoadingOffers ? (
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
                                                layout="fill"
                                                objectFit="cover"
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
                            <Button key={filter} variant="outline" size="sm" className="bg-card/50 rounded-full text-xs md:text-sm h-8 md:h-9">
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
                                            <Badge className="bg-destructive text-destructive-foreground">
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

                                        <Link href={`/product/${seller.productId}`} className="cursor-pointer">
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
                                                <Link href={`/profile?userId=${seller.name}`} onClick={(e) => e.stopPropagation()} className="relative z-20">
                                                    <Avatar className="h-8 w-8 border-2 border-primary">
                                                        <AvatarImage src={seller.avatarUrl} alt={seller.name} />
                                                        <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                </Link>
                                                <div className="flex-1">
                                                    <Link href={`/profile?userId=${seller.name}`} onClick={(e) => e.stopPropagation()} className="relative z-20 hover:underline">
                                                        <h3 className="font-semibold text-sm text-primary-foreground truncate">{seller.name}</h3>
                                                    </Link>
                                                    <p className="text-xs text-muted-foreground">{seller.category}</p>
                                                    {seller.rating > 0 && (
                                                         <Link href={`/profile?userId=${seller.name}`} onClick={(e) => e.stopPropagation()} className="relative z-20">
                                                            <div className="flex items-center gap-1 text-xs text-amber-300 mt-1">
                                                                <Star className="w-3 h-3 fill-current" />
                                                                <span>{seller.rating.toFixed(1)}</span>
                                                                <span className="text-muted-foreground/80">({seller.reviews})</span>
                                                            </div>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div className="text-center py-12 text-muted-foreground">
                                <p className="text-lg font-semibold">No results found for "{searchTerm}"</p>
                                <p>Try searching for something else.</p>
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
                                                    <p className="font-semibold text-destructive">{item.sellerName}</p>
                                                    <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="w-4 h-4 rotate-90" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
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
                                                {item.productImageUrl &&
                                                    <div className="w-full max-w-sm bg-muted rounded-lg overflow-hidden">
                                                        <Image src={item.productImageUrl} alt="Feed item" width={400} height={300} className="w-full h-auto object-cover" data-ai-hint={item.hint} />
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                        <div className="px-4 pb-3 flex justify-between items-center text-sm text-muted-foreground">
                                            <div className="flex items-center gap-4">
                                                <button className="flex items-center gap-1.5 hover:text-primary" onClick={() => handleAuthAction()}>
                                                    <Heart className="w-4 h-4" />
                                                    <span>{item.likes}</span>
                                                </button>
                                                <button className="flex items-center gap-1.5 hover:text-primary" onClick={() => handleReply(item.sellerName)}>
                                                    <MessageSquare className="w-4 h-4" />
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
                                        {trendingTopics.map(topic => (
                                            <div key={topic.id} className="text-sm cursor-pointer group">
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
                                        {suggestedUsers.map(user => (
                                            <div key={user.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={user.avatar} alt={user.name} />
                                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold text-sm">{user.name}</p>
                                                        <p className="text-xs text-muted-foreground">{user.handle}</p>
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="outline" onClick={() => handleAuthAction()}>Follow</Button>
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
                                            <Link href={`/product/${seller.productId}`} key={seller.id} className="group relative cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-primary/50 transition-shadow duration-300 block">
                                                <div className="absolute top-1.5 left-1.5 z-10">
                                                    <Badge className="bg-destructive text-destructive-foreground text-xs px-1.5 py-0.5 h-auto">LIVE</Badge>
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
                                <CreatePostForm
                                ref={createPostFormRef}
                                replyTo={replyTo}
                                onClearReply={() => setReplyTo(null)}
                                onCreatePost={handleCreatePost}
                                />
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
