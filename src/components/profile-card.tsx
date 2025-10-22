
"use client";

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Edit, Mail, Phone, MapPin, Camera, Truck, Star, ThumbsUp, ShoppingBag, Eye, Award, History, Search, Plus, Trash2, Heart, MessageSquare, StarIcon, UserPlus, Users, PackageSearch, Loader2, UserCheck, Instagram, Twitter, Youtube, Video, Facebook, Twitch, Play } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    { id: 'bb_prod_1', name: 'Vitamin C Serum', category: "Beauty", price: 2500, stock: 50, images: [{ preview: "https://placehold.co/200x200.png?text=Serum" }], hint: "skincare serum" },
    { id: 'bb_prod_2', name: 'Matte Lipstick', category: "Beauty", price: 1200, stock: 100, images: [{ preview: "https://placehold.co/200x200.png?text=Lipstick" }], hint: "red lipstick" },
    { id: 'bb_prod_3', name: 'Eyeshadow Palette', category: "Beauty", price: 3500, stock: 30, images: [{ preview: "https://placehold.co/200x200.png?text=Palette" }], hint: "eyeshadow palette" },
    { id: 'bb_prod_4', name: 'Hydrating Face Mask', category: "Beauty", price: 800, stock: 75, images: [{ preview: "https://placehold.co/200x200.png?text=Mask" }], hint: "face mask" },
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
    { id: 'gadgetguru-uid', title: 'Unboxing the Latest Tech', date: '3 days ago', views: '1.2M', thumbnailUrl: 'https://placehold.co/400x225.png?text=Past+Stream+1' },
    { id: 'fashionfinds-uid', title: 'Fall Fashion Lookbook', date: '1 week ago', views: '890k', thumbnailUrl: 'https://placehold.co/400x225.png?text=Past+Stream+2' },
    { id: 'kitchenwiz-uid', title: 'Kitchen Gadgets You Need', date: '2 weeks ago', views: '2.1M', thumbnailUrl: 'https://placehold.co/400x225.png?text=Past+Stream+3' },
    { id: 'beautybox-uid', title: 'Morning Skincare Routine', date: '1 month ago', views: '500k', thumbnailUrl: 'https://placehold.co/400x225.png?text=Past+Stream+4' },
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

export function ProfileCard({ profileData, isOwnProfile, onAddressesUpdate, onFollowToggle: onFollowToggleProp }: { profileData: UserData, isOwnProfile: boolean, onAddressesUpdate: (addresses: any[]) => void, onFollowToggle?: () => void }) {
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

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  
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
    const postsQuery = query(collection(db, "posts"), where("sellerId", "==", profileData.uid), orderBy("sellerId", "desc"));
    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp ? formatDistanceToNow(new Date((doc.data().timestamp as Timestamp).seconds * 1000), { addSuffix: true }) : 'just now'
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
        description: `${''}${product.name} has been added to your wishlist.`
    });
  };
  
  const handleFollowToggle = async () => {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Login Required",
            description: "You need to be logged in to follow users."
        });
        return;
    }
    setIsFollowed(prev => !prev);
    await toggleFollow(user.uid, profileData.uid);
    if (onFollowToggleProp) {
        onFollowToggleProp();
    }
    loadFollowData(); // Reload data to update dialog list
  };

  const sellerAverageRating = (mockReviews.reduce((acc, review) => acc + review.rating, 0) / mockReviews.length).toFixed(1);
  
  const showAdminView = userData?.role === 'admin';

  return (
    <>
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative bg-card">
          <div className="relative z-10 flex-shrink-0">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={profileImage || profileData?.photoURL || `https://placehold.co/128x128.png?text=${displayName.charAt(0)}`} alt={displayName} />
                  <AvatarFallback className="text-4xl">{displayName.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
              </Avatar>
          </div>
          
          <div className="relative z-10 text-foreground flex-grow text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-2xl sm:text-3xl font-bold">{displayName}</h2>
                  {profileData.role === 'seller' && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          {sellerAverageRating}
                      </Badge>
                  )}
              </div>
              {isOwnProfile && <p className="text-sm text-muted-foreground">{profileData.email}</p>}
              
              <div className="flex justify-center sm:justify-start gap-6 sm:gap-8 pt-2 sm:pt-4 text-left">
                  <Dialog>
                      <DialogTrigger asChild>
                          <div className="text-left cursor-pointer">
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
                    <div className="flex justify-center sm:justify-start gap-2 mt-4">
                         <Button onClick={handleFollowToggle} variant={isFollowed ? "outline" : "default"}>
                            {isFollowed ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                            {isFollowed ? "Following" : "Follow"}
                        </Button>
                        <Button variant="outline" onClick={() => setIsChatOpen(true)}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Message
                        </Button>
                    </div>
              )}
          </div>
      </div>

      <div className="p-4 sm:p-6">
          <CardContent className="p-0 space-y-6">
              <div className="space-y-3">
                  <h3 className="text-lg font-semibold mb-2">About {displayName.split(' ')[0]}</h3>
                  <p className="text-sm text-muted-foreground italic">"{profileData.bio || 'No bio provided.'}"</p>
                   {(profileData.instagram || profileData.twitter || profileData.youtube || profileData.facebook || profileData.twitch) && (
                      <div className="pt-2 space-y-2 text-sm">
                        <div className="flex flex-col space-y-2">
                          {profileData.instagram && <a href={profileData.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:underline"><Instagram /><span>{profileData.instagram}</span></a>}
                          {profileData.twitter && <a href={profileData.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:underline"><Twitter /><span>{profileData.twitter}</span></a>}
                          {profileData.youtube && <a href={profileData.youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:underline"><Youtube /><span>{profileData.youtube}</span></a>}
                          {profileData.facebook && <a href={profileData.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:underline"><Facebook /><span>{profileData.facebook}</span></a>}
                          {profileData.twitch && <a href={profileData.twitch} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:underline"><Twitch /><span>{profileData.twitch}</span></a>}
                        </div>
                      </div>
                  )}
              </div>
              
              {(isOwnProfile || showAdminView) && (
                  <>
                  <Separator />
                  <div>
                      <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                          <div className="flex items-center gap-3">
                              <Mail className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{profileData.email}</span>
                          </div>
                          <div className="flex items-center gap-3">
                              <Phone className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                              <span>{profileData.phone || 'Not provided'}</span>
                          </div>
                          <div className="flex items-center gap-3">
                              <MapPin className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                              <span>{profileData.location || 'Not provided'}</span>
                          </div>
                      </div>
                  </div>
                  <Separator />
                  <div>
                      <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold">Delivery Addresses</h3>
                          {isOwnProfile && (
                            <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                                <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add/Manage
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg h-auto max-h-[85vh] flex flex-col">
                                    <DialogHeader>
                                        <DialogTitle>Manage Delivery Addresses</DialogTitle>
                                    </DialogHeader>
                                    <EditAddressForm 
                                        onSave={(addr) => {
                                            const newAddresses = profileData.addresses ? [...profileData.addresses] : [];
                                            const existingIndex = newAddresses.findIndex(a => a.id === addr.id);
                                            if (existingIndex > -1) {
                                                newAddresses[existingIndex] = addr;
                                            } else {
                                                newAddresses.push({ ...addr, id: Date.now() });
                                            }
                                            onAddressesUpdate(newAddresses);
                                            setIsAddressDialogOpen(false);
                                        }}
                                        onCancel={() => setIsAddressDialogOpen(false)}
                                        onAddressesUpdate={onAddressesUpdate}
                                    />
                                </DialogContent>
                            </Dialog>
                          )}
                      </div>
                      {addresses && addresses.length > 0 ? (
                        <div className="space-y-2">
                            {addresses.map((address: any) => (
                                <div key={address.id} className="p-3 rounded-lg border bg-muted/50">
                                    <p className="font-semibold text-foreground">{address.name}</p>
                                    <p className="text-sm text-muted-foreground">{address.village}, {address.district}, {address.city}, {address.state} - {address.pincode}</p>
                                    <p className="text-sm text-muted-foreground">Phone: {address.phone}</p>
                                </div>
                            ))}
                        </div>
                      ) : (
                         <div className="text-center py-8 text-muted-foreground">No addresses added yet.</div>
                      )}
                  </div>
                  <Separator />
                  </>
              )}
              
              <div className="w-full max-w-full mx-auto">
                   <Tabs defaultValue="posts" className="w-full">
                      <ScrollArea className="w-full whitespace-nowrap">
                            <TabsList className="inline-flex">
                              {profileData.role === 'seller' && <TabsTrigger value="products">Listed Products</TabsTrigger>}
                              <TabsTrigger value="posts">Posts</TabsTrigger>
                              <TabsTrigger value="sessions">Sessions</TabsTrigger>
                              
                               {(isOwnProfile) && (
                                <>
                                    <TabsTrigger value="recent">Recently Viewed</TabsTrigger>
                                    <TabsTrigger value="reviews">My Reviews</TabsTrigger>
                                    <TabsTrigger value="achievements">Achievements</TabsTrigger>
                                    <TabsTrigger value="orders">Orders</TabsTrigger>
                                </>
                               )}
                          </TabsList>
                      </ScrollArea>
                      <TabsContent value="sessions" className="mt-4">
                            {sellerLiveStreams.length > 0 && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold mb-2">Currently Live</h3>
                                    {sellerLiveStreams.map((stream: any) => (
                                        <Link href={`/stream/${stream.id}`} key={stream.id} className="group block">
                                            <Card className="overflow-hidden bg-muted/50">
                                                <div className="relative aspect-[16/9] bg-muted">
                                                    <Image src={stream.thumbnailUrl} alt={stream.name} layout="fill" className="object-cover group-hover:scale-105 transition-transform" />
                                                    <div className="absolute inset-0 bg-black/30" />
                                                    <div className="absolute top-2 left-2 z-10"><Badge variant="destructive">LIVE</Badge></div>
                                                    <div className="absolute bottom-2 left-2 z-10 text-white">
                                                        <h4 className="font-bold">{stream.title || `${stream.name}'s Stream`}</h4>
                                                        <p className="text-xs">{stream.viewers.toLocaleString()} viewers</p>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            )}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Past Streams</h3>
                                <div className="md:hidden space-y-4">
                                     {mockPastStreams.map(stream => (
                                        <Link href={`/stream/${stream.id}?isPast=true`} key={stream.id} className="group block">
                                            <Card className="overflow-hidden bg-card border-border/50 shadow-sm transition-all hover:shadow-md">
                                                <div className="relative aspect-video bg-muted overflow-hidden">
                                                    <Image 
                                                        src={stream.thumbnailUrl} 
                                                        alt={stream.title} 
                                                        fill
                                                        sizes="100vw"
                                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                        <Play className="h-12 w-12 text-white/70 group-hover:text-white group-hover:scale-110 transition-all" />
                                                    </div>
                                                </div>
                                                <div className="p-3">
                                                    <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{stream.title}</h4>
                                                    <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                                                        <span>{stream.date}</span>
                                                        <span>{stream.views} views</span>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                                <div className="hidden md:block">
                                    <ScrollArea>
                                        <div className="flex gap-4 pb-4">
                                            {mockPastStreams.map(stream => (
                                                <Link href={`/stream/${stream.id}?isPast=true`} key={stream.id} className="group block w-64 flex-shrink-0">
                                                    <Card className="overflow-hidden bg-card border-border/50 shadow-sm transition-all hover:shadow-md">
                                                        <div className="relative aspect-video bg-muted overflow-hidden">
                                                            <Image 
                                                                src={stream.thumbnailUrl} 
                                                                alt={stream.title} 
                                                                fill
                                                                sizes="256px"
                                                                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                                                <Play className="h-12 w-12 text-white/70 group-hover:text-white group-hover:scale-110 transition-all" />
                                                            </div>
                                                        </div>
                                                        <div className="p-3">
                                                            <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{stream.title}</h4>
                                                            <div className="flex justify-between items-center text-xs text-muted-foreground mt-1">
                                                                <span>{stream.date}</span>
                                                                <span>{stream.views} views</span>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                </Link>
                                            ))}
                                        </div>
                                        <ScrollBar orientation="horizontal" />
                                    </ScrollArea>
                                </div>
                            </div>
                        </TabsContent>
                      <TabsContent value="orders" className="mt-4">
                           <Card>
                                <CardHeader>
                                    <CardTitle>My Orders</CardTitle>
                                    <CardDescription>A list of all orders you've placed.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {isLoadingOrders ? (
                                        <div className="flex justify-center py-8"><Skeleton className="w-full h-24" /></div>
                                    ) : userOrders.length > 0 ? (
                                        <div className="divide-y">
                                            {userOrders.map((order: any) => (
                                                <Link href={`/delivery-information/${order.id}`} key={order.id} className="block p-3 hover:bg-muted/50 rounded-lg">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <p className="font-semibold">{order.id}</p>
                                                        <Badge variant={getStatusFromTimeline(order.timeline) === 'Delivered' ? 'success' : 'outline'}>{getStatusFromTimeline(order.timeline)}</Badge>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                                                            <Image src={order.products[0].imageUrl} alt={order.products[0].name} width={64} height={64} className="object-cover" />
                                                        </div>
                                                        <div className="flex-grow">
                                                            <p className="font-medium text-sm leading-tight">{order.products[0].name}{order.products.length > 1 && ` + ${order.products.length - 1} more`}</p>
                                                            <p className="text-xs text-muted-foreground">Order Date: {order.orderDate}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold text-sm">₹{order.total.toFixed(2)}</p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                         <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4">
                                            <PackageSearch className="w-16 h-16 text-border" />
                                            <h3 className="text-xl font-semibold">No Orders Found</h3>
                                            <p>Your orders will appear here once you've made a purchase.</p>
                                        </div>
                                    )}
                                </CardContent>
                           </Card>
                      </TabsContent>

                      <TabsContent value="products" className="mt-4">
                           <div className="flex flex-wrap gap-2 mb-4">
                              {productCategories.map(category => (
                                  <Button
                                      key={category}
                                      variant={activeCategory === category ? 'default' : 'outline'}
                                      size="sm"
                                      onClick={() => setActiveCategory(category)}
                                  >
                                      {category}
                                  </Button>
                              ))}
                          </div>
                          {isLoadingContent ? <ProductSkeletonGrid /> : (
                                  filteredProducts.length > 0 ? (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                      {filteredProducts.map((product: any) => (
                                          <Link href={`/product/${product.id}`} key={product.id} className="group block">
                                              <Card className="w-full group overflow-hidden">
                                                  <div className="aspect-square bg-muted rounded-t-lg overflow-hidden relative">
                                                      <Image 
                                                          src={product.images?.[0]?.preview || "https://placehold.co/200x200.png"}
                                                          alt={product.name}
                                                          fill
                                                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                                          className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                                                          data-ai-hint={product.hint || 'product image'}
                                                      />
                                                       {product.stock === 0 && (
                                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                                <Badge variant="destructive">Out of Stock</Badge>
                                                            </div>
                                                        )}
                                                  </div>
                                                  <div className="p-3">
                                                      <h4 className="font-semibold truncate text-sm">{product.name}</h4>
                                                      <p className="font-bold text-foreground">₹{product.price.toLocaleString()}</p>
                                                      <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
                                                          <Star className="w-4 h-4 fill-current" />
                                                          <span>{averageRating}</span>
                                                          <span className="text-muted-foreground">({mockReviews.length})</span>
                                                      </div>
                                                  </div>
                                              </Card>
                                          </Link>
                                      ))}
                                  </div>
                              ) : (
                                  <p className="text-muted-foreground text-center py-8">No products found for this category.</p>
                              )
                          )}
                      </TabsContent>

                      <TabsContent value="posts" className="mt-4 space-y-4">
                           {isLoadingContent ? (
                             <Card><CardContent className="p-4 space-y-4"><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></CardContent></Card>
                           ) : userPosts.length > 0 ? (
                                userPosts.map(post => (
                                   <Card key={post.id} className="overflow-hidden">
                                       <div className="p-4">
                                           <div className="flex items-center gap-3 mb-3">
                                               <Avatar className="h-10 w-10">
                                                   <AvatarImage src={post.avatarUrl} alt={post.sellerName} />
                                                   <AvatarFallback>{post.sellerName.charAt(0)}</AvatarFallback>
                                               </Avatar>
                                               <div className="flex-grow">
                                                   <p className="font-semibold">{post.sellerName}</p>
                                                   <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                                               </div>
                                           </div>
                                       </div>
                                       <div className="px-4 pb-4">
                                           <p className="text-sm mb-2">{post.content}</p>
                                            {post.mediaUrl &&
                                               <div className="w-full max-w-sm bg-muted rounded-lg overflow-hidden">
                                                   {post.mediaType === 'video' ? (
                                                       <video src={post.mediaUrl} controls className="w-full h-auto object-cover" />
                                                   ) : (
                                                       <Image src={post.mediaUrl} alt="Feed item" width={400} height={300} className="w-full h-auto object-cover" />
                                                   )}
                                               </div>
                                           }
                                       </div>
                                       <div className="px-4 pb-3 flex justify-between items-center text-sm text-muted-foreground">
                                           <div className="flex items-center gap-4">
                                               <button className="flex items-center gap-1.5 hover:text-primary">
                                                   <Heart className="w-4 h-4" />
                                                   <span>{post.likes}</span>
                                               </button>
                                               <button className="flex items-center gap-1.5 hover:text-primary">
                                                   <MessageSquare className="w-4 h-4" />
                                                   <span>{post.replies}</span>
                                               </button>
                                           </div>
                                           {post.location && <span className="text-xs">{post.location}</span>}
                                       </div>
                                   </Card>
                               ))
                            ) : (
                               <Card className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4">
                                    <h3 className="text-xl font-semibold">No Posts Yet</h3>
                                    <p>This seller hasn't posted anything yet.</p>
                                    {isOwnProfile && <p>Why not create your first post?</p>}
                                    {isOwnProfile && (
                                        <div className="w-full max-w-lg p-4">
                                            <CreatePostForm onPost={async (data) => console.log(data)} onFinishEditing={() => {}} isSubmitting={false} />
                                        </div>
                                    )}
                                </Card>
                            )}
                      </TabsContent>

                      <TabsContent value="recent" className="mt-4">
                            {isLoadingContent ? <ProductSkeletonGrid /> : (
                              filteredRecentlyViewed.length > 0 ? (
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                      {filteredRecentlyViewed.map((item) => (
                                          <Link href={`/product/${item.key}`} key={item.id} className="group block">
                                              <Card className="w-full group overflow-hidden">
                                                  <div className="relative aspect-square bg-muted rounded-t-lg">
                                                      <Image 
                                                          src={item.imageUrl}
                                                          alt={item.name}
                                                          fill
                                                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                                          className="object-cover"
                                                          data-ai-hint={item.hint}
                                                      />
                                                        <Button
                                                          size="icon"
                                                          variant="secondary"
                                                          className={cn("absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10",
                                                            wishlist.includes(item.id) && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                          )}
                                                          onClick={(e) => { e.preventDefault(); handleWishlistToggle(item); }}
                                                          disabled={wishlist.includes(item.id)}
                                                      >
                                                          <Heart className="h-4 w-4" />
                                                      </Button>
                                                  </div>
                                                  <div className="p-3">
                                                      <h4 className="font-semibold truncate text-sm">{item.name}</h4>
                                                      <p className="font-bold text-foreground">{item.price}</p>
                                                      <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
                                                          <Star className="w-4 h-4 fill-current" />
                                                          <span>{averageRating}</span>
                                                          <span className="text-muted-foreground">({mockReviews.length})</span>
                                                      </div>
                                                  </div>
                                              </Card>
                                          </Link>
                                      ))}
                                  </div>
                              ) : (
                                    <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4 flex-grow justify-center">
                                      <Eye className="w-16 h-16 text-border" />
                                      <h3 className="text-xl font-semibold">No Recently Viewed Items</h3>
                                      <p>Items you view will show up here for 24 hours.</p>
                                  </div>
                              )
                          )}
                      </TabsContent>

                        <TabsContent value="reviews" className="mt-4 space-y-4">
                            {isLoadingContent ? <div className="space-y-4"><ReviewSkeleton /><ReviewSkeleton /></div> : (
                                filteredReviews.length > 0 ? (
                                    filteredReviews.map(review => (
                                        <Card key={review.id} className="overflow-hidden">
                                            <div className="p-4 flex gap-4">
                                                {review.imageUrl && (
                                                    <Link href={`/product/${review.productId}`}>
                                                        <Image
                                                            src={review.imageUrl}
                                                            alt={review.productName}
                                                            width={80}
                                                            height={80}
                                                            className="rounded-md object-cover"
                                                            data-ai-hint={review.hint || ''}
                                                        />
                                                    </Link>
                                                )}
                                                <div className="flex-grow">
                                                    <Link href={`/product/${review.productId}`} className="hover:underline">
                                                        <h4 className="font-semibold">{review.productName}</h4>
                                                    </Link>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={cn("w-4 h-4", i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
                                                        ))}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mt-2">{review.text}</p>
                                                </div>
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <p className="text-muted-foreground text-center py-8">You haven't written any reviews yet.</p>
                                )
                            )}
                        </TabsContent>
                      
                      <TabsContent value="achievements" className="mt-4">
                        {isLoadingContent ? <ProductSkeletonGrid /> : mockAchievements.length > 0 ? (
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
                        ) : (
                             <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4 flex-grow justify-center">
                                <Award className="w-16 h-16 text-border" />
                                <h3 className="text-xl font-semibold">No Achievements Yet</h3>
                                <p>Keep shopping and interacting to unlock achievements!</p>
                            </div>
                        )}
                      </TabsContent>
                  </Tabs>
              </div>
          </CardContent>
      </div>
      {isChatOpen && !isOwnProfile && (
          <ChatPopup 
              user={{ displayName, photoURL: profileData.photoURL || '' }}
              onClose={() => setIsChatOpen(false)} 
          />
      )}
    </>
  );
}
