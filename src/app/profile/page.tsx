
"use client";

import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreVertical, MessageSquare, Search, Flag, MessageCircle, HelpCircle, Share2, Star, ThumbsUp, ShoppingBag, Eye, Award, History, CreditCard, Wallet, Truck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ChatPopup } from '@/components/chat-popup';
import { Footer } from '@/components/footer';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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
import { Skeleton } from '@/components/ui/skeleton';


// Mock data generation
const firstNames = ["Ganesh", "John", "Jane", "Alex", "Emily", "Chris", "Michael"];
const lastNames = ["Prajapati", "Doe", "Smith", "Johnson", "Williams", "Brown", "Jones"];
const bios = [
  "Live selling enthusiast. Love finding great deals!",
  "Collector of rare finds and vintage electronics.",
  "Fashionista and beauty guru. Join my stream for the latest trends.",
  "Home decor expert. Let's make your space beautiful.",
  "Tech reviewer and gadget lover. Unboxing the future."
];
const locations = ["New York, USA", "London, UK", "Tokyo, Japan", "Sydney, Australia", "Paris, France"];

const generateRandomUser = (currentUser: any) => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return {
    displayName: currentUser.displayName || `${firstName} ${lastName}`,
    email: currentUser.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    photoURL: currentUser.photoURL || `https://placehold.co/128x128.png?text=${firstName.charAt(0)}${lastName.charAt(0)}`,
    bio: bios[Math.floor(Math.random() * bios.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    following: Math.floor(Math.random() * 500),
    followers: Math.floor(Math.random() * 20000),
    topAchievement: { name: 'Top Shopper', icon: <ShoppingBag className="w-4 h-4 mr-1.5" /> }
  };
};

const mockProducts = [
    { id: 1, name: 'Vintage Camera', price: '₹12,500', imageUrl: 'https://placehold.co/300x300.png', hint: 'vintage film camera' },
    { id: 2, name: 'Wireless Headphones', price: '₹4,999', imageUrl: 'https://placehold.co/300x300.png', hint: 'modern headphones' },
    { id: 3, name: 'Handcrafted Vase', price: '₹2,100', imageUrl: 'https://placehold.co/300x300.png', hint: 'ceramic vase' },
    { id: 4, name: 'Smart Watch', price: '₹8,750', imageUrl: 'https://placehold.co/300x300.png', hint: 'smartwatch face' },
    { id: 5, name: 'Leather Backpack', price: '₹6,200', imageUrl: 'https://placehold.co/300x300.png', hint: 'brown leather backpack' },
];

const recentlyViewedItems = [
    { id: 6, name: 'Noise Cancelling Headphones', price: '₹14,999', imageUrl: 'https://placehold.co/300x300.png', hint: 'sleek black headphones' },
    { id: 7, name: 'Minimalist Wall Clock', price: '₹1,500', imageUrl: 'https://placehold.co/300x300.png', hint: 'modern wall clock' },
    { id: 8, name: 'Running Shoes', price: '₹5,600', imageUrl: 'https://placehold.co/300x300.png', hint: 'colorful running shoes' },
    { id: 9, name: 'Yoga Mat', price: '₹999', imageUrl: 'https://placehold.co/300x300.png', hint: 'rolled up yoga mat' },
    { id: 10, name: 'Portable Blender', price: '₹3,200', imageUrl: 'https://placehold.co/300x300.png', hint: 'blender with fruit' },
];

const mockReviews = [
    { id: 1, productName: 'Wireless Headphones', rating: 5, review: 'Absolutely amazing sound quality and comfort. Best purchase this year!', date: '2 weeks ago', imageUrl: 'https://placehold.co/100x100.png', hint: 'modern headphones', productInfo: 'These are the latest model with active noise cancellation and a 20-hour battery life. Sold by GadgetGuru.', paymentMethod: { type: 'Cashless', provider: 'Visa **** 4567' } },
    { id: 2, productName: 'Smart Watch', rating: 4, review: 'Great features and battery life. The strap could be a bit more comfortable, but overall a solid watch.', date: '1 month ago', imageUrl: 'https://placehold.co/100x100.png', hint: 'smartwatch face', productInfo: 'Series 8 Smart Watch with GPS and cellular capabilities. Water-resistant up to 50m. Sold by TechWizard.', paymentMethod: { type: 'Cashless', provider: 'Wallet' } },
    { id: 3, productName: 'Vintage Camera', rating: 5, review: "A beautiful piece of equipment. It works flawlessly and I've gotten so many compliments on it.", date: '3 months ago', imageUrl: 'https://placehold.co/100x100.png', hint: 'vintage film camera', productInfo: 'A fully refurbished 1975 film camera with a 50mm f/1.8 lens. A rare find! Sold by RetroClicks.', paymentMethod: { type: 'COD' } },
];

const mockAchievements = [
    { id: 1, name: 'Top Shopper', icon: <ShoppingBag />, description: 'Made over 50 purchases' },
    { id: 2, name: 'Power Viewer', icon: <Eye />, description: 'Watched over 100 hours of streams' },
    { id: 3, name: 'Review Pro', icon: <ThumbsUp />, description: 'Wrote more than 20 helpful reviews' },
    { id: 4, name: 'Pioneer', icon: <Award />, description: 'Joined within the first month of launch' },
    { id: 5, name: 'One Year Club', icon: <History />, description: 'Member for over a year' },
    { id: 6, name: 'Deal Hunter', icon: <Search />, description: 'Snagged 10+ flash sale items' },
];

function ProductSkeletonGrid() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="w-full">
                    <Skeleton className="aspect-square w-full rounded-t-lg" />
                    <div className="p-3 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-5 w-1/2" />
                    </div>
                </Card>
            ))}
        </div>
    );
}

function ReviewSkeleton() {
    return (
        <Card className="p-4">
            <div className="flex gap-4">
                <Skeleton className="w-20 h-20 rounded-md" />
                <div className="flex-grow space-y-2">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        </Card>
    );
}


export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const { user, loading } = useAuth();

  const [profileData, setProfileData] = useState<ReturnType<typeof generateRandomUser> | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isLoadingContent, setIsLoadingContent] = useState(true);


  const handleAuthAction = (action: () => void) => {
    if (!user) {
        setIsAuthDialogOpen(true);
    } else {
        action();
    }
  };

  const isOwnProfile = !userId;
  const isSeller = !isOwnProfile;

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return mockProducts;
    return mockProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const filteredRecentlyViewed = useMemo(() => {
    if (!searchTerm) return recentlyViewedItems;
    return recentlyViewedItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const filteredReviews = useMemo(() => {
    if (!searchTerm) return mockReviews;
    return mockReviews.filter(review =>
      review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.review.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  useEffect(() => {
    // This logic now runs only on the client after the component mounts
    const activeUser = isOwnProfile ? user : { displayName: userId, email: `${userId}@example.com`, photoURL: '' };
    if (activeUser) {
        setTimeout(() => {
            setProfileData(generateRandomUser(activeUser));
            setIsLoadingContent(false);
        }, 1500)
    } else {
        setIsLoadingContent(false);
    }
  }, [user, userId, isOwnProfile]);

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


  if (loading || !profileData) {
      return (
          <div className="flex items-center justify-center min-h-screen">
              <LoadingSpinner />
          </div>
      )
  }

  if (!user && isOwnProfile) {
    return (
         <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
             <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
             <p className="text-muted-foreground mb-6">Please log in to your account to view your profile.</p>
             <Button onClick={() => router.push('/')}>Go to Login</Button>
        </div>
    );
  }

  const PaymentIcon = ({method}: {method: {type: string, provider?: string}}) => {
    if (method.type === 'COD') return <Truck className="w-4 h-4 text-muted-foreground" />;
    if (method.provider?.toLowerCase().includes('wallet')) return <Wallet className="w-4 h-4 text-muted-foreground" />;
    return <CreditCard className="w-4 h-4 text-muted-foreground" />;
  }
  
  const paymentLabel = (method: {type: string, provider?: string}) => {
      if (method.type === 'COD') return 'Paid with Cash on Delivery';
      return `Paid with ${method.provider}`;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
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
        <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className={cn("text-xl font-bold", isSeller && "text-destructive")}>{profileData.displayName}</h1>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-6 w-6" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleAuthAction(() => console.log('Report'))}>
                        <Flag className="mr-2 h-4 w-4" />
                        <span>Report</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                         <MessageCircle className="mr-2 h-4 w-4" />
                        <span>Feedback</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                         <HelpCircle className="mr-2 h-4 w-4" />
                        <span>Help</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Share2 className="mr-2 h-4 w-4" />
                        <span>Share</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>

        <main className="flex-grow p-4">
            <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 border-2 mb-4">
                    <AvatarImage src={profileData.photoURL} alt={profileData.displayName} />
                    <AvatarFallback className="text-3xl">{profileData.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex items-center gap-2">
                    <h2 className={cn("text-2xl font-bold", isSeller && "text-destructive")}>{profileData.displayName}</h2>
                    {profileData.topAchievement && (
                        <Badge variant="secondary" className="text-sm">
                            {React.cloneElement(profileData.topAchievement.icon, { className: "w-4 h-4 mr-1.5" })}
                            {profileData.topAchievement.name}
                        </Badge>
                    )}
                </div>
                <p className="text-muted-foreground">{profileData.email}</p>

                 <div className="flex gap-4 mt-4 text-center">
                   <div>
                       <p className="font-bold text-lg">{(profileData.followers / 1000).toFixed(1)}k</p>
                       <p className="text-sm text-muted-foreground">Followers</p>
                   </div>
                </div>

                 {!isOwnProfile && (
                     <div className="mt-4 grid grid-cols-2 gap-2 w-full max-w-sm">
                        <Button 
                            variant={isFollowing ? 'secondary' : 'default'}
                            onClick={() => handleAuthAction(() => setIsFollowing(!isFollowing))}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </Button>
                        <Button variant="outline" onClick={() => handleAuthAction(() => setIsChatOpen(true))}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Message
                        </Button>
                    </div>
                )}

                <div className="mt-6 text-left w-full max-w-4xl mx-auto">
                    <div className="bg-card p-4 rounded-lg shadow-sm">
                        <h3 className="font-semibold">About</h3>
                        <p className="text-sm text-muted-foreground mt-1">{profileData.bio}</p>
                        <h3 className="font-semibold mt-4">Location</h3>
                        <p className="text-sm text-muted-foreground mt-1">{profileData.location}</p>
                    </div>
                </div>
            </div>

            <Separator className="my-6" />

            <div className="w-full max-w-4xl mx-auto">
                <div className="flex justify-end items-center gap-2 mb-4" ref={searchRef}>
                    <div className={cn(
                        "relative flex items-center transition-all duration-300 ease-in-out",
                        isSearchExpanded ? "w-48" : "w-10"
                    )}>
                        <Search className={cn("h-5 w-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2", isSearchExpanded ? 'block' : 'hidden')} />
                        <Input 
                            placeholder="Search content..." 
                            className={cn(
                                "bg-muted pl-10 pr-4 rounded-full transition-all duration-300 ease-in-out",
                                isSearchExpanded ? "opacity-100 w-full" : "opacity-0 w-0"
                            )}
                            onFocus={() => setIsSearchExpanded(true)}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-foreground rounded-full hover:bg-accent absolute right-0 top-1/2 -translate-y-1/2"
                            onClick={() => setIsSearchExpanded(p => !p)}
                        >
                            <Search className={cn("h-5 w-5", isSearchExpanded && "hidden")} />
                        </Button>
                    </div>
                </div>
                <Tabs defaultValue={!isOwnProfile ? "products" : "recent"} className="w-full">
                    <ScrollArea className="w-full whitespace-nowrap">
                         <TabsList className={cn("grid w-full", !isOwnProfile ? "grid-cols-4" : "grid-cols-3")}>
                            {!isOwnProfile && <TabsTrigger value="products">Listed Products</TabsTrigger>}
                            <TabsTrigger value="recent">Recently Viewed</TabsTrigger>
                            <TabsTrigger value="reviews">My Reviews</TabsTrigger>
                            <TabsTrigger value="achievements">Achievements</TabsTrigger>
                        </TabsList>
                    </ScrollArea>

                    {!isOwnProfile && (
                        <TabsContent value="products" className="mt-4">
                            {isLoadingContent ? <ProductSkeletonGrid /> : (
                                 filteredProducts.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {filteredProducts.map((product) => (
                                            <Card key={product.id} className="w-full">
                                                <div className="aspect-square bg-muted rounded-t-lg overflow-hidden">
                                                    <Image 
                                                        src={product.imageUrl}
                                                        alt={product.name}
                                                        width={180}
                                                        height={180}
                                                        className="object-cover w-full h-full"
                                                        data-ai-hint={product.hint}
                                                    />
                                                </div>
                                                <div className="p-3">
                                                    <h4 className="font-semibold truncate">{product.name}</h4>
                                                    <p className="text-primary font-bold">{product.price}</p>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-center py-8">No products found.</p>
                                )
                            )}
                        </TabsContent>
                    )}

                    <TabsContent value="recent" className="mt-4">
                         {isLoadingContent ? <ProductSkeletonGrid /> : (
                            filteredRecentlyViewed.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {filteredRecentlyViewed.map((item) => (
                                        <Card key={item.id} className="w-full">
                                            <div className="aspect-square bg-muted rounded-t-lg overflow-hidden">
                                                <Image 
                                                    src={item.imageUrl}
                                                    alt={item.name}
                                                    width={180}
                                                    height={180}
                                                    className="object-cover w-full h-full"
                                                    data-ai-hint={item.hint}
                                                />
                                            </div>
                                            <div className="p-3">
                                                <h4 className="font-semibold truncate">{item.name}</h4>
                                                <p className="text-primary font-bold">{item.price}</p>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-8">No recently viewed items.</p>
                            )
                        )}
                    </TabsContent>

                    <TabsContent value="reviews" className="mt-4 space-y-4">
                        {isLoadingContent ? <div className="space-y-4"><ReviewSkeleton /><ReviewSkeleton /></div> : (
                            filteredReviews.length > 0 ? (
                                filteredReviews.map(review => (
                                    <Collapsible key={review.id} asChild>
                                        <Card>
                                            <CollapsibleTrigger className="w-full text-left cursor-pointer">
                                                <div className="p-4 flex gap-4">
                                                    <Image src={review.imageUrl} alt={review.productName} width={80} height={80} className="rounded-md object-cover" data-ai-hint={review.hint} />
                                                    <div className="flex-grow">
                                                        <h4 className="font-semibold">{review.productName}</h4>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star key={i} className={cn("w-4 h-4", i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
                                                            ))}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mt-2">{review.review}</p>
                                                        <p className="text-xs text-muted-foreground mt-2 text-right">{review.date}</p>
                                                    </div>
                                                </div>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <div className="border-t p-4 space-y-3">
                                                    <div>
                                                        <h5 className="text-sm font-semibold mb-1">Product Information</h5>
                                                        <p className="text-sm text-muted-foreground">{review.productInfo}</p>
                                                    </div>
                                                    <div>
                                                        <h5 className="text-sm font-semibold mb-1">Payment & Delivery</h5>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <PaymentIcon method={review.paymentMethod} />
                                                            <span>{paymentLabel(review.paymentMethod)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CollapsibleContent>
                                        </Card>
                                    </Collapsible>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-center py-8">You haven't written any reviews yet.</p>
                            )
                        )}
                    </TabsContent>
                    
                    <TabsContent value="achievements" className="mt-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                           {mockAchievements.map(achievement => (
                                <Card key={achievement.id} className="p-4 flex flex-col items-center justify-center text-center gap-2">
                                    <div className="p-3 bg-primary/10 rounded-full text-primary">
                                       {React.cloneElement(achievement.icon, { className: "w-6 h-6" })}
                                    </div>
                                    <h4 className="font-semibold">{achievement.name}</h4>
                                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                                </Card>
                           ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </main>
        
        {isChatOpen && !isOwnProfile && (
            <ChatPopup 
                user={{ displayName: profileData.displayName, photoURL: profileData.photoURL }}
                onClose={() => setIsChatOpen(false)} 
            />
        )}
        <Footer />
    </div>
  );
}

    