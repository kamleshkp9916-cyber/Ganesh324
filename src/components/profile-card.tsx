

"use client";

import React from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Edit, Mail, Phone, MapPin, Camera, Truck, Star, ThumbsUp, ShoppingBag, Eye, Award, History, Search, Plus, Trash2, Heart, MessageSquare, StarIcon, UserPlus, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState, useRef, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
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
import { toggleFollow, getUserData, getFollowers } from '@/lib/follow-data';
import { getUserReviews, Review } from '@/lib/review-data';


const mockReviews = [
    { id: 1, productName: 'Wireless Headphones', rating: 5, review: 'Absolutely amazing sound quality and comfort. Best purchase this year!', date: '2 weeks ago', imageUrl: 'https://placehold.co/100x100.png', hint: 'modern headphones', productInfo: 'These are the latest model with active noise cancellation and a 20-hour battery life. Sold by GadgetGuru.', paymentMethod: { type: 'Cashless', provider: 'Visa **** 4567' } },
    { id: 2, productName: 'Smart Watch', rating: 4, review: 'Great features and battery life. The strap could be a bit more comfortable, but overall a solid watch.', date: '1 month ago', imageUrl: null, hint: null, productInfo: 'Series 8 Smart Watch with GPS and cellular capabilities. Water-resistant up to 50m. Sold by TechWizard.', paymentMethod: { type: 'Cashless', provider: 'Wallet' } },
    { id: 3, productName: 'Vintage Camera', rating: 5, review: "A beautiful piece of equipment. It works flawlessly and I've gotten so many compliments on it.", date: '3 months ago', imageUrl: 'https://placehold.co/100x100.png', hint: 'vintage film camera', productInfo: 'A fully refurbished 1975 film camera with a 50mm f/1.8 lens. A rare find! Sold by RetroClicks.', paymentMethod: { type: 'COD' } },
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

const PaymentIcon = ({method}: {method: {type: string, provider?: string}}) => {
    if (method.type === 'COD') return <Truck className="w-4 h-4 text-muted-foreground" />;
    if (method.provider?.toLowerCase().includes('wallet')) return <Wallet className="w-4 h-4 text-muted-foreground" />;
    return <CreditCard className="w-4 h-4 text-muted-foreground" />;
};

const paymentLabel = (method: {type: string, provider?: string}) => {
    if (method.type === 'COD') return 'Paid with Cash on Delivery';
    return `Paid with ${method.provider}`;
}

export function ProfileCard({ profileData, isOwnProfile, onAddressesUpdate, onFollowToggle }: { profileData: any, isOwnProfile: boolean, onAddressesUpdate: (addresses: any) => void, onFollowToggle?: () => void }) {
  const { user } = useAuth();
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
  const [sellerProducts, setSellerProducts] = useState<any[]>([]);
  const [sellerPosts, setSellerPosts] = useState<any[]>([]);
  const [followingList, setFollowingList] = useState<any[]>([]);
  const [followerList, setFollowerList] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const displayName = profileData.displayName || profileData.name || "";
  const [activeCategory, setActiveCategory] = useState("All");
  
  const getProductsKey = (name: string) => `sellerProducts_${name}`;
  
  const loadFollowData = () => {
    if (user) {
        const currentUserFollowingIds = JSON.parse(localStorage.getItem(`following_${user.uid}`) || '[]');
        setIsFollowing(currentUserFollowingIds.includes(profileData.uid));
        
        if (isOwnProfile) {
          const followedUsers = currentUserFollowingIds.map((id: string) => getUserData(id));
          setFollowingList(followedUsers);
        }

        const followers = getFollowers(profileData.uid);
        setFollowerList(followers);
    }
  };

  useEffect(() => {
    if (user) {
       loadFollowData();
       setMyReviews(getUserReviews(user.uid));
    }
  }, [user, profileData.uid, isOwnProfile]);

  const loadSellerProducts = () => {
    if (profileData.role === 'seller') {
      const productsKey = getProductsKey(displayName);
      const storedProducts = localStorage.getItem(productsKey);
      if (storedProducts) {
        setSellerProducts(JSON.parse(storedProducts));
      } else {
        setSellerProducts([]);
      }
    }
  };

  // Load data from localStorage on mount and add storage listener
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === getProductsKey(displayName)) {
        loadSellerProducts();
      }
      if (event.key === 'mockFeed') {
        const globalFeed = JSON.parse(localStorage.getItem('mockFeed') || '[]');
        setSellerPosts(globalFeed.filter((p: any) => p.sellerName === displayName));
      }
      if(event.key?.startsWith('following_')) {
          loadFollowData();
      }
    };
    
    setRecentlyViewedItems(getRecentlyViewed());
    setWishlist(getWishlist().map(p => p.id));
    loadSellerProducts();

    const globalFeed = JSON.parse(localStorage.getItem('mockFeed') || '[]');
    setSellerPosts(globalFeed.filter((p: any) => p.sellerName === displayName));
    
    setTimeout(() => {
        setIsLoadingContent(false);
    }, 1000);

    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileData.role, displayName]);


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

  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAddressSave = (data: any) => {
    const newAddresses = [...addresses];
    if (editingAddress) {
        const index = newAddresses.findIndex(addr => addr.id === (editingAddress as any).id);
        newAddresses[index] = { ...data, id: (editingAddress as any).id };
    } else {
        const newAddress = { ...data, id: Date.now() };
        newAddresses.push(newAddress);
        if (newAddresses.length === 1) {
            setDefaultAddressId(newAddress.id);
        }
    }
    setAddresses(newAddresses);
    onAddressesUpdate(newAddresses);
    setIsAddressDialogOpen(false);
    setEditingAddress(null);
    toast({ title: 'Address saved successfully!' });
  };

  const handleDeleteAddress = (addressId: number) => {
    const newAddresses = addresses.filter((addr: any) => addr.id !== addressId);
    setAddresses(newAddresses);
    onAddressesUpdate(newAddresses);
    if (defaultAddressId === addressId) {
        setDefaultAddressId(newAddresses[0]?.id || null);
    }
    toast({ title: 'Address removed.' });
  };

  const handleWishlistToggle = (product: Product) => {
    addToWishlist(product);
    setWishlist(getWishlist().map(p => p.id));
    toast({
        title: "Added to Wishlist!",
        description: `${product.name} has been added to your wishlist.`
    });
  };
  
  const handleCreatePost = (data: PostData) => {
    if (!user) return;
    
    const newPost = {
        id: Date.now(),
        sellerName: displayName,
        avatarUrl: profileData.photoURL || `https://placehold.co/40x40.png?text=${displayName.charAt(0)}`,
        timestamp: 'just now',
        content: data.content,
        productImageUrl: data.media?.url || null,
        hint: 'user uploaded content',
        likes: 0,
        replies: 0,
        location: data.location || null,
    };
    
    // Update the global feed
    const globalFeed = JSON.parse(localStorage.getItem('mockFeed') || '[]');
    const updatedGlobalFeed = [newPost, ...globalFeed];
    localStorage.setItem('mockFeed', JSON.stringify(updatedGlobalFeed));
    
    // Dispatch a storage event to notify other tabs/pages
    window.dispatchEvent(new StorageEvent('storage', { key: 'mockFeed' }));

    toast({
        title: "Post Created!",
        description: "Your post has been successfully shared on the main feed.",
    });
  };

  const openAddressDialog = (address: any = null) => {
    setEditingAddress(address);
    setIsAddressDialogOpen(true);
  }
  
  const handleFollowToggle = (targetId: string) => {
    if (!user) return;
    toggleFollow(user.uid, targetId);
    setIsFollowing(prev => !prev);
    if (onFollowToggle) {
        onFollowToggle();
    }
    loadFollowData(); // Reload data to update dialog list
  };

  const sellerAverageRating = (mockReviews.reduce((acc, review) => acc + review.rating, 0) / mockReviews.length).toFixed(1);

  return (
    <>
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative bg-card">
          <div className="relative z-10 flex-shrink-0">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-lg">
                  <AvatarImage src={profileImage || profileData?.photoURL || `https://placehold.co/128x128.png?text=${displayName.charAt(0)}`} alt={displayName} />
                  <AvatarFallback className="text-4xl">{displayName.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
              </Avatar>
                {isOwnProfile && (
                  <>
                      <Button
                          size="icon"
                          variant="outline"
                          className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-background/70 hover:bg-background"
                          onClick={() => profileFileInputRef.current?.click()}
                      >
                          <Camera className="h-4 w-4" />
                          <span className="sr-only">Change profile image</span>
                      </Button>
                      <input
                          type="file"
                          ref={profileFileInputRef}
                          onChange={handleProfileImageUpload}
                          className="hidden"
                          accept="image/*"
                      />
                  </>
              )}
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
                              <p className="text-xl sm:text-2xl font-bold">{profileData.following || 0}</p>
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
                                               <Button variant="outline" size="sm" onClick={() => handleFollowToggle(followedUser.uid)}>Unfollow</Button>
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
                                <p className="text-xl sm:text-2xl font-bold">{(profileData.followers || 0) > 1000 ? `${((profileData.followers || 0)/1000).toFixed(1)}k` : (profileData.followers || 0)}</p>
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
                                            <Link href={`/profile?userId=${follower?.uid}`} className="flex items-center gap-3">
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
                    <div className="mt-4 flex justify-center sm:justify-start gap-2">
                      <Button
                          onClick={() => handleFollowToggle(profileData.uid)}
                          variant={isFollowing ? "outline" : "default"}
                      >
                          <UserPlus className="mr-2 h-4 w-4" />
                          {isFollowing ? "Following" : "Follow"}
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
              
              {isOwnProfile && profileData.role === 'customer' && (
                  <>
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
                          <Button variant="outline" size="sm" onClick={() => openAddressDialog()}>
                              <Plus className="h-4 w-4 mr-2" />
                              Add New
                          </Button>
                      </div>
                      {addresses && addresses.length > 0 ? (
                        <RadioGroup value={String(defaultAddressId)} onValueChange={(val) => setDefaultAddressId(Number(val))} className="space-y-2">
                            {addresses.map((address: any) => (
                                <div key={address.id} className="flex items-center gap-2 p-2 rounded-lg border has-[:checked]:bg-muted/50">
                                    <RadioGroupItem value={String(address.id)} id={`addr-${address.id}`} />
                                    <Label htmlFor={`addr-${address.id}`} className="flex-grow cursor-pointer text-sm">
                                        <div className="flex justify-between items-start">
                                            <div className="text-muted-foreground">
                                                <p className="font-semibold text-foreground">{address.name}</p>
                                                <p>{address.village}, {address.district}</p>
                                                <p>{address.city}, {address.state} - {address.pincode}</p>
                                                <p>Phone: {address.phone}</p>
                                            </div>
                                        </div>
                                    </Label>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openAddressDialog(address)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete this address.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDeleteAddress(address.id)} className={cn(buttonVariants({variant: "destructive"}))}>
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))}
                        </RadioGroup>
                      ) : (
                         <div className="text-center py-8 text-muted-foreground">No addresses added yet.</div>
                      )}
                  </div>
                  <Separator />
                  </>
              )}
              
              <div>
                  <h3 className="text-lg font-semibold mb-2">About {displayName.split(' ')[0]}</h3>
                  <p className="text-sm text-muted-foreground italic">"{profileData.bio || 'No bio provided.'}"</p>
              </div>
              <Separator />


              <div className="w-full max-w-full mx-auto">
                  <Tabs defaultValue={profileData.role === 'seller' ? "products" : "recent"} className="w-full">
                      <ScrollArea className="w-full whitespace-nowrap">
                            <TabsList className="inline-flex">
                              {profileData.role === 'seller' ? (
                                  <>
                                      <TabsTrigger value="products">Listed Products</TabsTrigger>
                                      <TabsTrigger value="posts">Posts</TabsTrigger>
                                  </>
                              ) : (
                                  <>
                                      <TabsTrigger value="recent">Recently Viewed</TabsTrigger>
                                      <TabsTrigger value="reviews">My Reviews</TabsTrigger>
                                      <TabsTrigger value="achievements">Achievements</TabsTrigger>
                                  </>
                              )}
                          </TabsList>
                      </ScrollArea>

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
                                              <Card className="w-full overflow-hidden h-full flex flex-col">
                                                  <div className="aspect-square bg-muted rounded-t-lg overflow-hidden relative">
                                                      <Image 
                                                          src={product.images?.[0]?.preview || "https://placehold.co/200x200.png"}
                                                          alt={product.name}
                                                          fill
                                                          className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                                                          data-ai-hint={product.hint || 'product image'}
                                                      />
                                                       {product.stock === 0 && (
                                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                                <Badge variant="destructive">Out of Stock</Badge>
                                                            </div>
                                                        )}
                                                  </div>
                                                  <div className="p-3 flex-grow flex flex-col">
                                                      <h4 className="font-semibold truncate text-sm flex-grow">{product.name}</h4>
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
                          {isOwnProfile && profileData.role === 'seller' && ( 
                              <div className="mb-6 sticky top-20 z-40">
                                    <CreatePostForm onCreatePost={handleCreatePost} />
                              </div>
                          )}
                            {sellerPosts.length > 0 ? sellerPosts.map(post => (
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
                                      {post.productImageUrl &&
                                          <div className="w-full max-w-sm bg-muted rounded-lg overflow-hidden">
                                              <Image src={post.productImageUrl} alt="Feed item" width={400} height={300} className="w-full h-auto object-cover" data-ai-hint={post.hint} />
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
                          )) : (
                              <p className="text-muted-foreground text-center py-8">This seller hasn't posted anything yet.</p>
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
                                                    <p className="text-xs text-muted-foreground mt-2 text-right">{new Date(review.date).toLocaleDateString()}</p>
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
              user={{ displayName, photoURL: profileData.photoURL }}
              onClose={() => setIsChatOpen(false)} 
          />
      )}
      <Dialog open={isAddressDialogOpen} onOpenChange={(isOpen) => { if(!isOpen) setEditingAddress(null); setIsAddressDialogOpen(isOpen);}}>
        <DialogContent className="max-w-lg h-auto max-h-[85vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>{editingAddress ? 'Edit' : 'Add New'} Delivery Address</DialogTitle>
            </DialogHeader>
            <EditAddressForm 
                onSave={handleAddressSave} 
                onCancel={() => setIsAddressDialogOpen(false)}
            />
        </DialogContent>
      </Dialog>
    </>
  );
}
