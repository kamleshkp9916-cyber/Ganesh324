
"use client";

import React from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { Edit, Mail, Phone, MapPin, Camera, Truck, Star, ThumbsUp, ShoppingBag, Eye, Award, History, Search, Plus, Trash2, Heart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState, useRef, useMemo } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
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

const mockProducts = [
    { id: 1, name: 'Vintage Camera', price: '₹12,500', imageUrl: 'https://placehold.co/300x300.png', hint: 'vintage film camera' },
    { id: 2, name: 'Wireless Headphones', price: '₹4,999', imageUrl: 'https://placehold.co/300x300.png', hint: 'modern headphones' },
    { id: 3, name: 'Handcrafted Vase', price: '₹2,100', imageUrl: 'https://placehold.co/300x300.png', hint: 'ceramic vase' },
    { id: 4, name: 'Smart Watch', price: '₹8,750', imageUrl: 'https://placehold.co/300x300.png', hint: 'smartwatch face' },
    { id: 5, name: 'Leather Backpack', price: '₹6,200', imageUrl: 'https://placehold.co/300x300.png', hint: 'brown leather backpack' },
];

// This is now a "seeder" for demonstration purposes
const initialRecentlyViewedItems = [
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

const PaymentIcon = ({method}: {method: {type: string, provider?: string}}) => {
    if (method.type === 'COD') return <Truck className="w-4 h-4 text-muted-foreground" />;
    if (method.provider?.toLowerCase().includes('wallet')) return <Wallet className="w-4 h-4 text-muted-foreground" />;
    return <CreditCard className="w-4 h-4 text-muted-foreground" />;
}
  
const paymentLabel = (method: {type: string, provider?: string}) => {
    if (method.type === 'COD') return 'Paid with Cash on Delivery';
    return `Paid with ${method.provider}`;
}

export function ProfileCard({ onEdit, profileData, isOwnProfile, onAddressesUpdate }: { onEdit?: () => void, profileData: any, isOwnProfile: boolean, onAddressesUpdate: (addresses: any) => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  const [addresses, setAddresses] = useState(profileData.addresses);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAddress, setEditingAddress] = useState(null);
  const [recentlyViewedItems, setRecentlyViewedItems] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);

  // Seed recently viewed items for demo purposes
  useEffect(() => {
    const items = getRecentlyViewed();
    if (items.length === 0) {
      initialRecentlyViewedItems.forEach(item => addRecentlyViewed(item));
    }
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    setRecentlyViewedItems(getRecentlyViewed());
    setWishlist(getWishlist().map(p => p.id));
    setTimeout(() => {
        setIsLoadingContent(false);
    }, 1000)
  }, []);


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
  }, [searchTerm, recentlyViewedItems]);

  const filteredReviews = useMemo(() => {
    if (!searchTerm) return mockReviews;
    return mockReviews.filter(review =>
      review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.review.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

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
        newAddresses.push({ ...data, id: Date.now() });
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

  const openAddressDialog = (address: any = null) => {
    setEditingAddress(address);
    setIsAddressDialogOpen(true);
  }

  return (
    <Dialog open={isAddressDialogOpen} onOpenChange={(isOpen) => { if(!isOpen) setEditingAddress(null); setIsAddressDialogOpen(isOpen);}}>
        <div 
            className="p-6 flex flex-col items-center gap-4 relative bg-cover bg-center bg-primary/10"
        >
            <div className={cn("absolute inset-0 bg-primary/10")} />
            
            <div className="relative z-10">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                    <AvatarImage src={profileImage || user?.photoURL || `https://placehold.co/128x128.png?text=${user?.displayName?.charAt(0)}`} alt={user?.displayName || ""} />
                    <AvatarFallback className="text-4xl">{user?.displayName?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
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
            
            <div className="text-center relative z-10 text-foreground">
                <div className="flex items-center gap-2">
                    <h2 className="text-3xl font-bold">{profileData.displayName}</h2>
                    {profileData.topAchievement && (
                        <Badge variant="secondary" className="text-sm">
                            {React.cloneElement(profileData.topAchievement.icon, { className: "w-4 h-4 mr-1.5" })}
                            {profileData.topAchievement.name}
                        </Badge>
                    )}
                </div>
                {isOwnProfile && <p className="text-muted-foreground">{profileData.email}</p>}
            </div>
            <div className="flex gap-8 pt-4 relative z-10 text-foreground">
                <div className="text-center">
                    <p className="text-2xl font-bold">{profileData.following}</p>
                    <p className="text-sm text-muted-foreground">Following</p>
                </div>
                <div className="text-center">
                    <p className="text-2xl font-bold">{(profileData.followers / 1000).toFixed(1)}k</p>
                    <p className="text-sm text-muted-foreground">Followers</p>
                </div>
            </div>
        </div>

        <div className="p-4 sm:p-6">
            <CardContent className="p-0 space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-2">About Me</h3>
                    <p className="text-muted-foreground italic">"{profileData.bio}"</p>
                </div>

                <Separator />
                
                {isOwnProfile && (
                    <>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-muted-foreground" />
                                <span>{profileData.email}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-muted-foreground" />
                                <span>{profileData.phone}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <MapPin className="w-5 h-5 text-muted-foreground" />
                                <span>{profileData.location}</span>
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
                        <div className="space-y-4">
                            {addresses.map((address: any) => (
                                <Card key={address.id} className="p-4">
                                    <div className="flex justify-between items-start">
                                        <div className="text-sm text-muted-foreground">
                                            <p className="font-semibold text-foreground">{address.name}</p>
                                            <p>{address.village}, {address.district}</p>
                                            <p>{address.city}, {address.state} - {address.pincode}</p>
                                            <p>Phone: {address.phone}</p>
                                        </div>
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
                                </Card>
                            ))}
                        </div>
                    </div>
                    <Separator />
                    </>
                )}


                <div className="w-full max-w-4xl mx-auto">
                    <Tabs defaultValue={!isOwnProfile ? "products" : "recent"} className="w-full">
                        <ScrollArea className="w-full whitespace-nowrap">
                             <TabsList className={cn("grid w-full", !isOwnProfile ? "grid-cols-1" : "grid-cols-3")}>
                                {!isOwnProfile && <TabsTrigger value="products">Listed Products</TabsTrigger>}
                                {isOwnProfile && <TabsTrigger value="recent">Recently Viewed</TabsTrigger>}
                                {isOwnProfile && <TabsTrigger value="reviews">My Reviews</TabsTrigger>}
                                {isOwnProfile && <TabsTrigger value="achievements">Achievements</TabsTrigger>}
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
                                            <Card key={item.id} className="w-full group overflow-hidden">
                                                <div className="relative aspect-square bg-muted rounded-t-lg">
                                                    <Image 
                                                        src={item.imageUrl}
                                                        alt={item.name}
                                                        layout="fill"
                                                        className="object-cover"
                                                        data-ai-hint={item.hint}
                                                    />
                                                     <Button
                                                        size="icon"
                                                        variant="secondary"
                                                        className={cn("absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity",
                                                          wishlist.includes(item.id) && "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        )}
                                                        onClick={() => handleWishlistToggle(item)}
                                                        disabled={wishlist.includes(item.id)}
                                                    >
                                                        <Heart className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="p-3">
                                                    <h4 className="font-semibold truncate text-sm">{item.name}</h4>
                                                    <p className="text-primary font-bold">{item.price}</p>
                                                </div>
                                            </Card>
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
            </CardContent>
        </div>
        <DialogContent className="max-w-lg h-auto max-h-[85vh] flex flex-col">
            <DialogHeader>
                <DialogTitle>{editingAddress ? 'Edit' : 'Add New'} Delivery Address</DialogTitle>
            </DialogHeader>
            <EditAddressForm 
                currentAddress={editingAddress}
                onSave={handleAddressSave} 
                onCancel={() => setIsAddressDialogOpen(false)}
            />
        </DialogContent>
    </Dialog>
  );
}
