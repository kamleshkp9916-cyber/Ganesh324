
"use client";

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Edit, Mail, Phone, MapPin, Camera, Truck, Star, ThumbsUp, ThumbsDown, ShoppingBag, Eye, Award, History, Search, Plus, Trash2, Heart, MessageSquare, StarIcon, UserPlus, Users, Package, PackageSearch, Loader2, UserCheck, Instagram, Twitter, Youtube, Video, Facebook, Twitch, Play, MoreHorizontal, ArrowUp, ArrowDown, Flag } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { EditAddressForm } from './edit-address-form';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CreditCard, Wallet } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { getRecentlyViewed, addRecentlyViewed, addToWishlist, getWishlist, Product } from '@/lib/product-history';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import Link from 'next/link';
import { CreatePostForm, PostData } from './create-post-form';
import { ChatPopup } from './chat-popup';
import { toggleFollow, getUserData, getFollowers, getFollowing, isFollowing as isFollowingBackend, UserData, updateUserData } from '@/lib/follow-data';
import { getUserReviews, Review } from '@/lib/review-data';
import { getFirestore, collection, query, where, getDocs, orderBy, onSnapshot, serverTimestamp, addDoc, Timestamp } from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase';
import { getStatusFromTimeline } from '@/lib/order-data';
import { formatDistanceToNow } from 'date-fns';
import { productDetails } from '@/lib/product-data';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from './ui/dropdown-menu';

const mockReviews = [
    { id: 1, productName: 'Wireless Headphones', rating: 5, review: 'Absolutely amazing sound quality and comfort. Best purchase this year!', date: '2 weeks ago', imageUrl: 'https://placehold.co/100x100.png', hint: 'modern headphones', productInfo: 'These are the latest model with active noise cancellation and a 20-hour battery life. Sold by GadgetGuru.' },
    { id: 2, productName: 'Smart Watch', rating: 4, review: 'Great features and battery life. The strap could be a bit more comfortable, but overall a solid watch.', date: '1 month ago', imageUrl: null, hint: null, productInfo: 'Series 8 Smart Watch with GPS and cellular capabilities. Water-resistant up to 50m. Sold by TechWizard.' },
    { id: 3, productName: 'Vintage Camera', rating: 5, review: "A beautiful piece of equipment. It works flawlessly and I've gotten so many compliments on it.", date: '3 months ago', imageUrl: 'https://placehold.co/100x100.png', hint: 'vintage film camera', productInfo: 'A fully refurbished 1975 film camera with a 50mm f/1.8 lens. A rare find! Sold by RetroClicks.' },
];

const averageRating = (mockReviews.reduce((acc, review) => acc + review.rating, 0) / mockReviews.length).toFixed(1);

const mockAchievements = [
    { id: 1, name: 'Top Shopper', icon: <ShoppingBag />, description: 'Made over 50 purchases' },
    { id: 2, name: 'Power Viewer', icon: <Eye />, description: 'Watched over 100 hours of streams' },
    { id: 3, name: 'Review Pro', icon: <ThumbsUp />, description: 'Wrote more than 20 helpful reviews' },
    { id: 4, name: 'Pioneer', icon: <Award />, description: 'Joined within the first month of launch' },
    { id: 5, name: 'One Year Club', icon: <History />, description: 'Member for over a year' },
    { id: 6, name: 'Deal Hunter', icon: <Search />, description: 'Snagged 10+ flash sale items' },
];

const mockBeautyBoxProducts = [
    { id: 'bb_prod_1', name: 'Vitamin C Serum', category: "Beauty", price: 2500, stock: 50, sold: 200, images: [{ preview: "https://placehold.co/200x200.png?text=Serum" }], hint: "skincare serum" },
    { id: 'bb_prod_2', name: 'Matte Lipstick', category: "Beauty", price: 1200, stock: 100, sold: 500, images: [{ preview: "https://placehold.co/200x200.png?text=Lipstick" }], hint: "red lipstick" },
    { id: 'bb_prod_3', name: 'Eyeshadow Palette', category: "Beauty", price: 3500, stock: 30, sold: 150, images: [{ preview: "https://placehold.co/200x200.png?text=Palette" }], hint: "eyeshadow palette" },
    { id: 'bb_prod_4', name: 'Hydrating Face Mask', category: "Beauty", price: 800, stock: 75, sold: 400, images: [{ preview: "https://placehold.co/200x200.png?text=Mask" }], hint: "face mask" },
];

const liveSellers = [
    { id: 'fashionfinds-uid', name: 'FashionFinds', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Fashion', viewers: 1200, buyers: 25, rating: 4.8, reviews: 12, hint: 'woman posing stylish outfit', productId: 'prod_1', hasAuction: true },
    { id: 'gadgetguru-uid', name: 'GadgetGuru', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Electronics', viewers: 2500, buyers: 42, rating: 4.9, reviews: 28, hint: 'unboxing new phone', productId: 'prod_2', hasAuction: false },
    { id: 'homehaven-uid', name: 'HomeHaven', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Home Goods', viewers: 850, buyers: 15, rating: 4.7, reviews: 9, hint: 'modern living room decor', productId: 'prod_3', hasAuction: false },
    { id: 'beautybox-uid', name: 'BeautyBox', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Beauty', viewers: 3100, buyers: 78, rating: 4.9, reviews: 55, hint: 'makeup tutorial', productId: 'prod_4', hasAuction: true },
    { id: 'kitchenwiz-uid', name: 'KitchenWiz', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Kitchenware', viewers: 975, buyers: 0, rating: 0, reviews: 0, hint: 'cooking demonstration', productId: 'prod_5', hasAuction: false },
    { id: 'fitflow-uid', name: 'FitFlow', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Fitness', viewers: 1500, buyers: 33, rating: 4.6, reviews: 18, hint: 'yoga session', productId: 'prod_6', hasAuction: false },
    { id: 'artisanalley-uid', name: 'ArtisanAlley', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Handmade', viewers: 450, buyers: 8, rating: 5.0, reviews: 6, hint: 'pottery making', productId: 'prod_7', hasAuction: true },
    { id: 'petpalace-uid', name: 'PetPalace', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Pet Supplies', viewers: 1800, buyers: 50, rating: 4.8, reviews: 30, hint: 'playing with puppy', productId: 'prod_8', hasAuction: false },
    { id: 'booknook-uid', name: 'BookNook', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Books', viewers: 620, buyers: 12, rating: 4.9, reviews: 10, hint: 'reading book cozy', productId: 'prod_9', hasAuction: false },
    { id: 'gamerguild-uid', name: 'GamerGuild', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Gaming', viewers: 4200, buyers: 102, rating: 4.9, reviews: 80, hint: 'esports competition', productId: 'prod_10', hasAuction: true },
];

const mockPastStreams = [
    { id: 'gadgetguru-uid', title: 'Unboxing the Latest Tech', description: 'Join me as I unbox and review the most anticipated gadgets of the month. We\'ll take a look at the new smartphone, a pair of noise-cancelling headphones, and a surprise gadget you won\'t want to miss. Get ready for in-depth analysis, first impressions, and maybe a few giveaways!', date: '3 days ago', views: '1.2M', duration: '45:12', thumbnailUrl: 'https://placehold.co/400x225.png?text=Past+Stream+1' },
    { id: 'fashionfinds-uid', title: 'Fall Fashion Lookbook', description: 'Discover the key trends for this fall season. I\'ll be styling five essential looks, from cozy knits to statement coats. We\'ll discuss color palettes, textures, and how to mix and match pieces to create your perfect autumn wardrobe. Get your notepads ready!', date: '1 week ago', views: '890k', duration: '1:02:30', thumbnailUrl: 'https://placehold.co/400x225.png?text=Past+Stream+2' },
    { id: 'kitchenwiz-uid', title: 'Kitchen Gadgets You Need', description: 'Tired of tedious meal prep? I\'m showcasing five game-changing kitchen gadgets that will save you time and effort. From a high-speed blender to a smart air fryer, see them in action and learn some new recipes along the way. Your kitchen will thank you!', date: '2 weeks ago', views: '2.1M', duration: '33:45', thumbnailUrl: 'https://placehold.co/400x225.png?text=Past+Stream+3' },
    { id: 'beautybox-uid', title: 'Morning Skincare Routine', description: 'A step-by-step guide to my go-to morning skincare routine for a glowing complexion. We\'ll cover cleansers, serums, moisturizers, and of course, SPF! I\'ll share my holy grail products and answer all your skincare questions. Let\'s get glowing!', date: '1 month ago', views: '500k', duration: '25:00', thumbnailUrl: 'https://placehold.co/400x225.png?text=Past+Stream+4' },
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

export function ProfileCard({ profileData, isOwnProfile, onAddressesUpdate, onFollowToggle: onFollowToggleProp, handleAuthAction }: { profileData: UserData, isOwnProfile: boolean, onAddressesUpdate: (addresses: any[]) => void, onFollowToggle?: () => void, handleAuthAction: (callback: () => void) => void }) {
  const { user, userData } = useAuth();
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [addresses, setAddresses] = useState(profileData.addresses || []);
  const [defaultAddressId, setDefaultAddressId] = useState((profileData.addresses && profileData.addresses[0]?.id) || null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAddress, setEditingAddress] = useState(null);
  const [recentlyViewedItems, setRecentlyViewedItems] = useState<Product[]>([]);
  const [myReviews, setMyReviews] = useState<Review[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const displayName = profileData.displayName || (profileData as any).name || "";
  const getProductsKey = (name: string) => `sellerProducts_${name}`;
  const [sellerProducts, setSellerProducts] = useState<any[]>([]);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [followerList, setFollowerList] = useState<any[]>([]);
  
  const [isFollowed, setIsFollowed] = useState(false);

  const [activeCategory, setActiveCategory] = useState("All");
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const router = useRouter();
  
  const loadFollowData = async () => {
    if (user) {
        setIsFollowed(await isFollowingBackend(user.uid, profileData.uid));
        
        if (isOwnProfile) {
          setFollowingList(await getFollowing(user.uid));
        }

        setFollowerList(await getFollowers(profileData.uid));
    }
  };

  useEffect(() => {
    if (user) {
       loadFollowData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profileData.uid, isOwnProfile]);
  
  // Fetch user orders
  useEffect(() => {
    const fetchOrders = async () => {
        if (!isOwnProfile) return;
        setIsLoadingOrders(true);
        try {
            const db = getFirestoreDb();
            const ordersRef = collection(db, 'orders');
            const q = query(ordersRef, where('userId', '==', profileData.uid), orderBy('orderDate', 'desc'));
            const snapshot = await getDocs(q);
            const orders = snapshot.docs.map(doc => ({...doc.data(), id: doc.id}));
            setUserOrders(orders);
        } catch (error) {
            console.error("Error fetching orders:", error);
            toast({variant: 'destructive', title: "Error", description: "Could not fetch order history."});
        } finally {
            setIsLoadingOrders(false);
        }
    };
    fetchOrders();
  }, [profileData.uid, isOwnProfile, toast]);


  // Load data from localStorage on mount and add storage listener
  useEffect(() => {
    const productsKey = getProductsKey(displayName);
    const loadData = () => {
      setRecentlyViewedItems(getRecentlyViewed());
      setWishlist(getWishlist().map(p => p.id));
      if (profileData.role === 'seller') {
          const storedProducts = localStorage.getItem(productsKey);
          let productsToShow = [];
          if (storedProducts) {
              productsToShow = JSON.parse(storedProducts);
          } else if (displayName === 'BeautyBox') {
              productsToShow = mockBeautyBoxProducts;
          }
          setSellerProducts(productsToShow.length > 0 ? productsToShow : mockBeautyBoxProducts);
      }
      if (user) {
          setMyReviews(getUserReviews(user.uid));
      }
    };
    
    loadData();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === productsKey || event.key === 'streamcart_recently_viewed' || event.key === 'streamcart_wishlist' || event.key === 'streamcart_reviews') {
        loadData();
      }
      if(event.key?.startsWith('following_')) {
          loadFollowData();
      }
    };
    
    // Listen to firestore posts
    const db = getFirestoreDb();
    const postsQuery = query(collection(db, "posts"), where("sellerId", "==", profileData.uid), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp, // Keep it as a Timestamp for now
        }));
        setUserPosts(postsData);
    });
    
    setTimeout(() => {
        setIsLoadingContent(false);
    }, 1000);

    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
        unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData.role, displayName, profileData.uid, user]);


  const productCategories = useMemo(() => {
    const categories = new Set(sellerProducts.map(p => p.category));
    return ["All", ...Array.from(categories)];
  }, [sellerProducts]);

  const filteredProducts = useMemo(() => {
    let products = sellerProducts;
    if (activeCategory !== 'All') {
        products = products.filter(p => p.category === activeCategory);
    }
    if (searchTerm) {
        products = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    return products;
  }, [searchTerm, sellerProducts, activeCategory]);

   const sellerLiveStreams = useMemo(() => {
        return liveSellers.filter(s => s.id === profileData.uid);
    }, [profileData.uid]);

    
  const filteredUserPosts = useMemo(() => {
    const mockSellerPost = {
        id: 'mock-post-for-seller',
        sellerId: profileData.uid,
        sellerName: profileData.displayName,
        avatarUrl: profileData.photoURL,
        timestamp: new Date(), // This will be a JS Date object
        content: `Welcome to my page! Check out our latest products and live streams. #welcome #${profileData.displayName.toLowerCase().replace(/\s+/g, '')}`,
        images: [{ url: 'https://placehold.co/600x400.png' }],
        likes: 15,
        replies: 2,
    };
      
    // Combine mock post with real posts, ensuring no duplicates if mock is somehow in db
    const combined = [...userPosts];
    if (!userPosts.find(p => p.id === mockSellerPost.id)) {
        combined.unshift(mockSellerPost);
    }

    return combined;
  }, [userPosts, profileData.uid, profileData.displayName, profileData.photoURL]);


  const filteredRecentlyViewed = useMemo(() => {
    if (!searchTerm) return recentlyViewedItems;
    return recentlyViewedItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, recentlyViewedItems]);

  const filteredReviews = useMemo(() => {
    if (!searchTerm) return myReviews;
    return myReviews.filter(review =>
      review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, myReviews]);
  
  const handleWishlistToggle = (product: Product) => {
    addToWishlist(product);
    setWishlist(getWishlist().map(p => p.id));
    toast({
        title: "Added to Wishlist!",
        description: `${product.name} has been added to your wishlist.`
    });
  };
  
  const handleFollowToggle = async () => {
    handleAuthAction(async () => {
        setIsFollowed(prev => !prev);
        await toggleFollow(user!.uid, profileData.uid);
        if (onFollowToggleProp) {
            onFollowToggleProp();
        }
        loadFollowData();
    });
  };

  const handleReportPost = () => {
      handleAuthAction(() => {
          toast({ title: 'Post Reported', description: 'Thank you for your feedback.' });
      });
  };

  const renderContentWithHashtags = (text: string) => {
    const parts = text.split(/(#\w+)/g);
    return parts.map((part, index) => {
        if (part.startsWith('#')) {
            return (
                <button key={index} className="text-primary hover:underline font-semibold">
                    {part}
                </button>
            );
        }
        return part;
    });
  };

  const sellerAverageRating = (mockReviews.reduce((acc, review) => acc + review.rating, 0) / mockReviews.length).toFixed(1);
  
  const showAdminView = userData?.role === 'admin';

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 relative p-4 sm:p-6">
          <div className="relative z-10 flex-shrink-0">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={profileImage || profileData?.photoURL || `https://placehold.co/128x128.png?text=${displayName.charAt(0)}`} alt={displayName} />
                  <AvatarFallback className="text-4xl">{displayName.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
              </Avatar>
          </div>
          
          <div className="relative z-10 flex flex-col items-center sm:items-start text-foreground flex-grow text-center sm:text-left">
              <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl font-bold">{displayName}</h2>
                  {profileData.role === 'seller' && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {sellerAverageRating}
                      </Badge>
                  )}
              </div>
              {isOwnProfile && <p className="text-sm text-muted-foreground">{profileData.email}</p>}
              
              <div className="flex gap-6 pt-2 sm:pt-4">
                  <Dialog>
                      <DialogTrigger asChild>
                          <div className="text-center cursor-pointer">
                              <p className="text-xl sm:text-2xl font-bold">{followingList.length}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground">Following</p>
                          </div>
                      </DialogTrigger>
                      <DialogContent>
                          <DialogHeader>
                              <DialogTitle>Following</DialogTitle>
                          </DialogHeader>
                          <ScrollArea className="h-80">
                              <div className="p-4 space-y-4">
                                  {followingList.map(followedUser => (
                                      <div key={followedUser?.uid} className="flex items-center justify-between group">
                                          <Link href={`/seller/profile?userId=${followedUser?.uid}`} className="flex items-center gap-3">
                                              <Avatar>
                                                  <AvatarImage src={followedUser?.photoURL} />
                                                  <AvatarFallback>{followedUser?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                              </Avatar>
                                              <div>
                                                  <p className="font-semibold group-hover:underline">{followedUser?.displayName || 'Unnamed User'}</p>
                                                  <p className="text-sm text-muted-foreground">@{followedUser?.displayName?.toLowerCase().replace(' ', '') || 'user'}</p>
                                              </div>
                                          </Link>
                                          {isOwnProfile && (
                                               <Button variant="outline" size="sm" onClick={() => handleFollowToggle()}>Unfollow</Button>
                                          )}
                                      </div>
                                  ))}
                                  {followingList.length === 0 && (
                                      <p className="text-center text-muted-foreground py-8">Not following anyone yet.</p>
                                  )}
                              </div>
                          </ScrollArea>
                      </DialogContent>
                  </Dialog>
                  <Dialog>
                        <DialogTrigger asChild>
                            <div className="cursor-pointer">
                                <p className="text-xl sm:text-2xl font-bold">{(followerList.length) > 1000 ? `${(followerList.length/1000).toFixed(1)}k` : (followerList.length)}</p>
                                <p className="text-xs sm:text-sm text-muted-foreground">Followers</p>
                            </div>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Followers</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="h-80">
                                  <div className="p-4 space-y-4">
                                    {followerList.map(follower => (
                                        <div key={follower?.uid} className="flex items-center justify-between group">
                                            <Link href={`/seller/profile?userId=${follower?.uid}`} className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={follower?.photoURL} />
                                                    <AvatarFallback>{follower?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold group-hover:underline">{follower?.displayName || 'Unnamed User'}</p>
                                                    <p className="text-sm text-muted-foreground">@{follower?.displayName?.toLowerCase().replace(' ', '') || 'user'}</p>
                                                </div>
                                            </Link>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={`/profile?userId=${follower?.uid}`}>View</Link>
                                            </Button>
                                        </div>
                                    ))}
                                    {followerList.length === 0 && (
                                        <p className="text-center text-muted-foreground py-8">No followers yet.</p>
                                    )}
                                </div>
                            </ScrollArea>
                        </DialogContent>
                    </Dialog>
              </div>

                {!isOwnProfile && profileData.role === 'seller' && (
                    <div className="flex gap-2 mt-4">
                         <Button onClick={handleFollowToggle} variant={isFollowed ? "outline" : "default"}>
                            {isFollowed ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                            {isFollowed ? "Following" : "Follow"}
                        </Button>
                        <Button variant="outline" onClick={() => handleAuthAction(() => router.push(`/feed?tab=messages&userId=${profileData.uid}&userName=${profileData.displayName}`))}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Message
                        </Button>
                    </div>
              )}
          </div>
      </div>

      <div className="p-4 sm:p-6">
        <Tabs defaultValue="posts" className="w-full">
            <TabsList className="w-full overflow-x-auto no-scrollbar justify-start">
                {profileData.role === 'seller' && <TabsTrigger value="products">Listed Products</TabsTrigger>}
                <TabsTrigger value="posts">Posts</TabsTrigger>
                {profileData.role === 'seller' && <TabsTrigger value="sessions">Sessions</TabsTrigger>}
                {isOwnProfile && (
                    <>
                        <TabsTrigger value="recent">Recently Viewed</TabsTrigger>
                        <TabsTrigger value="reviews">My Reviews</TabsTrigger>
                        <TabsTrigger value="achievements">Achievements</TabsTrigger>
                        <TabsTrigger value="orders">Orders</TabsTrigger>
                    </>
                )}
            </TabsList>
            <TabsContent value="products" className="mt-4">
                {/* Product content goes here */}
            </TabsContent>
            <TabsContent value="posts" className="mt-4">
                {/* Post content goes here */}
            </TabsContent>
            {/* Other tabs content */}
        </Tabs>
      </div>
    </>
  );
}
