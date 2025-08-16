
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Clapperboard,
  Home,
  Bookmark,
  Heart,
  Star,
  Zap,
  ChevronDown,
  Search,
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
  UserPlus
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
import { Logo } from '@/components/logo';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useAuthActions } from '@/lib/auth';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Footer } from '@/components/footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreatePostForm, PostData } from '@/components/create-post-form';
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
import { Separator } from '@/components/ui/separator';


const liveSellers = [
    {
      id: 1,
      name: 'FashionFinds',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Fashion',
      viewers: 1200,
      hint: 'woman posing stylish outfit',
    },
    {
      id: 2,
      name: 'GadgetGuru',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Electronics',
      viewers: 2500,
      hint: 'unboxing new phone',
    },
    {
      id: 3,
      name: 'HomeHaven',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Home Goods',
      viewers: 850,
      hint: 'modern living room decor',
    },
    {
      id: 4,
      name: 'BeautyBox',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Beauty',
      viewers: 3100,
      hint: 'makeup tutorial',
    },
    {
      id: 5,
      name: 'KitchenWiz',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Kitchenware',
      viewers: 975,
      hint: 'cooking demonstration',
    },
    {
      id: 6,
      name: 'FitFlow',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Fitness',
      viewers: 1500,
      hint: 'yoga session',
    },
    {
      id: 7,
      name: 'ArtisanAlley',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Handmade',
      viewers: 450,
      hint: 'pottery making',
    },
    {
      id: 8,
      name: 'PetPalace',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Pet Supplies',
      viewers: 1800,
      hint: 'playing with puppy',
    },
    {
      id: 9,
      name: 'BookNook',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Books',
      viewers: 620,
      hint: 'reading book cozy',
    },
    {
      id: 10,
      name: 'GamerGuild',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Gaming',
      viewers: 4200,
      hint: 'esports competition',
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

export default function LiveSellingPage() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);
  const [api, setApi] = useState<CarouselApi>()
  const [currentSlide, setCurrentSlide] = useState(0)
  const { user, loading } = useAuth();
  const { signOut } = useAuthActions();
  const [followingList, setFollowingList] = useState(initialFollowing);
  const [mockFollowingFeed, setMockFollowingFeed] = useState(initialMockFeed);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState("");
  const { toast } = useToast();
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("live");
  const createPostFormRef = useRef<HTMLDivElement>(null);
  const [suggestedUsers, setSuggestedUsers] = useState<typeof allSuggestedUsers>([]);

  useEffect(() => {
    setSuggestedUsers(shuffleArray([...allSuggestedUsers]).slice(0, 3));
  }, []);

  const handleCreatePost = (postData: PostData) => {
    if (!user) return;

    const newPost = {
      id: mockFollowingFeed.length + 1,
      sellerName: user.displayName || 'You',
      avatarUrl: user.photoURL || 'https://placehold.co/40x40.png',
      timestamp: 'Just now',
      content: postData.content,
      productImageUrl: postData.media?.url || 'https://placehold.co/400x300.png', // Placeholder for now
      hint: 'new user post',
      likes: 0,
      replies: 0,
      location: postData.location,
    };

    setMockFollowingFeed([newPost, ...mockFollowingFeed]);
    toast({
      title: "Post Created!",
      description: "Your post has been added to the feed.",
    });
  };

  const handleReply = (sellerName: string) => {
    setReplyTo(sellerName);
    // Smooth scroll to the form if it exists
    createPostFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  
  const handleClearReply = () => {
    setReplyTo(null);
  };

  const handleUnfollow = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    setFollowingList(currentList => currentList.filter(user => user.id !== userId));
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
    console.log("Submitting report for reason:", selectedReportReason);
    toast({
        title: "Report Submitted",
        description: "Thank you for your feedback. We will review this post.",
    });
    setIsReportDialogOpen(false);
    setSelectedReportReason("");
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
  }, [api, onSelect])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingOffers(false);
    }, 1500);
    return () => clearTimeout(timer);
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


  return (
      <div className="flex min-h-screen bg-background text-foreground" style={{ background: 'radial-gradient(ellipse at top, hsl(var(--primary) / 0.15), hsl(var(--background)) 70%)' }}>
            <div className="flex-1 flex flex-col">
            <header className="p-4 flex items-center justify-between sticky top-0 bg-background/30 backdrop-blur-sm z-10 border-b border-border/50">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold tracking-tight text-primary">Live Shopping</h1>
                    </div>
                    <div className="flex items-center gap-2" ref={searchRef}>
                        <div className={cn(
                            "relative flex items-center transition-all duration-300 ease-in-out",
                            isSearchExpanded ? "w-48" : "w-10"
                        )}>
                            <Search className={cn("h-5 w-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2", isSearchExpanded ? 'block' : 'hidden')} />
                            <Input 
                                placeholder="Search streams..." 
                                className={cn(
                                    "bg-card pl-10 pr-4 rounded-full transition-all duration-300 ease-in-out",
                                    isSearchExpanded ? "opacity-100 w-full" : "opacity-0 w-0"
                                )}
                                onFocus={() => setIsSearchExpanded(true)}
                            />
                            
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-foreground rounded-full bg-card hover:bg-accent absolute right-0 top-1/2 -translate-y-1/2"
                                onClick={() => setIsSearchExpanded(p => !p)}
                            >
                                <Search className={cn("h-5 w-5", isSearchExpanded && "hidden")} />
                            </Button>
                    </div>
                        <Button variant="ghost" size="icon" className="text-foreground rounded-full bg-card hover:bg-accent">
                            <Plus />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-foreground rounded-full bg-card hover:bg-accent">
                            <Bell />
                        </Button>
                        
                        {loading ? (
                            <Skeleton className="h-9 w-9 rounded-full" />
                        ) : user ? (
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
                                         <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>
                                                <Users className="mr-2 h-4 w-4" />
                                                <span>Following</span>
                                                <span className="ml-auto">{followingList.length}</span>
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuPortal>
                                                <DropdownMenuSubContent className="p-0">
                                                    <DropdownMenuLabel>
                                                        <div className="flex items-center justify-between">
                                                          <span>Following</span>
                                                          <Badge variant="secondary">{followingList.length}</Badge>
                                                        </div>
                                                    </DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                     <ScrollArea className="h-48">
                                                        <div className="p-1">
                                                            {followingList.length > 0 ? (
                                                                followingList.map((followedUser) => (
                                                                    <DropdownMenuItem key={followedUser.id} className="justify-between" onSelect={(e) => e.preventDefault()}>
                                                                        <Link href={`/profile?userId=${followedUser.id}`} className="flex items-center gap-2 flex-grow">
                                                                            <Avatar className="h-6 w-6">
                                                                                <AvatarImage src={followedUser.avatar} />
                                                                                <AvatarFallback>{followedUser.name.charAt(0)}</AvatarFallback>
                                                                            </Avatar>
                                                                            <span className="text-xs">{followedUser.name}</span>
                                                                        </Link>
                                                                        <Button variant="outline" size="sm" className="h-6 px-2 text-xs ml-2" onClick={(e) => handleUnfollow(e, followedUser.id)}>
                                                                            Unfollow
                                                                        </Button>
                                                                    </DropdownMenuItem>
                                                                ))
                                                            ) : (
                                                                <div className="text-center text-xs text-muted-foreground p-4">
                                                                    Not following anyone.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </ScrollArea>
                                                </DropdownMenuSubContent>
                                            </DropdownMenuPortal>
                                        </DropdownMenuSub>
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
                                        <Link href="/terms-and-conditions"><FileText className="mr-2 h-4 w-4" /><span>Term & Conditions</span></Link>
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

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <Tabs defaultValue="live" className="w-full" onValueChange={setActiveTab}>
                        <div className="flex justify-center mb-6">
                            <TabsList>
                                <TabsTrigger value="live">Live Shopping</TabsTrigger>
                                <TabsTrigger value="feeds">Feeds</TabsTrigger>
                            </TabsList>
                        </div>

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
                                                <CardContent className="relative p-0 flex items-center justify-center aspect-[3/1]">
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
                                <Button key={filter} variant="outline" className="bg-card/50 rounded-full">
                                    {filter}
                                </Button>
                                ))}
                                <Button variant="ghost" className="bg-card/50 rounded-full">
                                    Filters
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {liveSellers.map((seller) => (
                                    <div key={seller.id} className="group relative cursor-pointer rounded-lg overflow-hidden shadow-lg hover:shadow-primary/50 transition-shadow duration-300">
                                        <div className="absolute top-2 left-2 z-10">
                                            <Badge className="bg-destructive text-destructive-foreground">
                                                LIVE
                                            </Badge>
                                        </div>
                                        <div className="absolute top-2 right-2 z-10">
                                            <Badge variant="secondary" className="bg-background/60 backdrop-blur-sm">
                                                <Users className="w-3 h-3 mr-1.5" />
                                                {seller.viewers}
                                            </Badge>
                                        </div>

                                        <Image 
                                            src={seller.thumbnailUrl} 
                                            alt={`Live stream from ${seller.name}`} 
                                            width={300} 
                                            height={450} 
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            data-ai-hint={seller.hint}
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8 border-2 border-primary">
                                                    <AvatarImage src={seller.avatarUrl} alt={seller.name} />
                                                    <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h3 className="font-semibold text-sm text-primary-foreground truncate">{seller.name}</h3>
                                                    <p className="text-xs text-muted-foreground">{seller.category}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="feeds" className="pb-28">
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
                             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                <div className="lg:col-span-8 space-y-4">
                                    {mockFollowingFeed.map(item => (
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
                                                                <MoreHorizontal className="w-4 h-4" />
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
                                                                            <DropdownMenuItem key={reason.id} onClick={() => { setSelectedReportReason(reason.id); setIsReportDialogOpen(true); }}>
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
                                                    <div className="w-full max-w-sm bg-muted rounded-lg overflow-hidden">
                                                        <Image src={item.productImageUrl} alt="Feed item" width={400} height={300} className="w-full h-auto object-cover" data-ai-hint={item.hint} />
                                                    </div>
                                                </div>
                                            </div>
                                             <div className="px-4 pb-3 flex justify-between items-center text-sm text-muted-foreground">
                                                <div className="flex items-center gap-4">
                                                    <button className="flex items-center gap-1.5 hover:text-primary">
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
                                    ))}
                                </div>
                                <div className="hidden lg:block lg:col-span-4">
                                     <div className="sticky top-20 space-y-6">
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
                                                        <Button size="sm" variant="outline">Follow</Button>
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </main>
                <Footer />
            </div>
            {user && activeTab === 'feeds' && (
                <CreatePostForm
                    ref={createPostFormRef}
                    replyTo={replyTo}
                    onClearReply={handleClearReply}
                    onCreatePost={handleCreatePost}
                />
            )}
      </div>
  );
}
