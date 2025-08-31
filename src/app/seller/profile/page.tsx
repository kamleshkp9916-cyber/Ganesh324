
"use client"

import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreHorizontal, Edit, UserPlus, MessageSquare, Star, Users, Video, Search, ShoppingBag } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EditProfileForm } from '@/components/edit-profile-form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getUserData, updateUserData, UserData, toggleFollow, isFollowing, getUserByDisplayName } from '@/lib/follow-data';
import { useAuthActions } from '@/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { productDetails } from '@/lib/product-data';


export default function SellerProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userIdFromQuery = searchParams.get('userId');
  const { user, userData, loading } = useAuth();
  const { updateUserProfile } = useAuthActions();

  const [profileData, setProfileData] = useState<UserData | null>(null);
  const [isProfileEditDialogOpen, setIsProfileEditDialogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [key, setKey] = useState(0);
  const [sellerProducts, setSellerProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState("All");
  const [isFollowingState, setIsFollowingState] = useState(false);


  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loadFollowData = async (profileUid: string) => {
      if (user) {
        setIsFollowingState(await isFollowing(user.uid, profileUid));
      }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
        if (loading || !isMounted) return;

        let targetId: string | null | undefined = userIdFromQuery;
        
        if (!targetId) {
            if (user && userData?.role === 'seller') {
                targetId = user.uid;
            } else {
                router.push('/seller/login');
                return;
            }
        }
        
        // Attempt to get user by UID first, then fall back to display name for mock data linking
        let data = await getUserData(targetId);
        if (!data) {
            data = await getUserByDisplayName(targetId);
        }
        
        if (data) {
            setProfileData(data);
            loadFollowData(data.uid);
             if (data.role === 'seller') {
                const productsKey = `sellerProducts_${data.displayName}`;
                const storedProducts = localStorage.getItem(productsKey);
                setSellerProducts(storedProducts ? JSON.parse(storedProducts) : []);
            }
        } else {
            console.error("Seller not found:", targetId);
        }
    };
    
    fetchProfileData();

  }, [user, userData, loading, router, isMounted, key, userIdFromQuery]);


  const handleProfileSave = async (data: any) => {
      if(!profileData || !user) return;

      const updatedDetails: Partial<UserData> = {
          displayName: `${data.firstName} ${data.lastName}`,
          bio: data.bio,
          location: data.location,
          phone: `+91 ${data.phone}`,
          photoURL: data.photoURL
      };

      await updateUserProfile(user, updatedDetails);
      const newProfileData = await getUserData(profileData.uid);
      setProfileData(newProfileData);
      setProfileEditDialogOpen(false);
  };

  const handleFollowToggle = async (targetId: string) => {
    if (!user) return;
    await toggleFollow(user.uid, targetId);
    setKey(prev => prev + 1); // Re-fetch all data to get updated follower counts
  };
  
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

  if (!isMounted || loading || !profileData) {
      return (
          <div className="flex items-center justify-center min-h-screen">
              <LoadingSpinner />
          </div>
      )
  }
  
  const isOwnProfile = user?.uid === profileData.uid;

  return (
    <Dialog open={isProfileEditDialogOpen} onOpenChange={setIsProfileEditDialogOpen}>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold truncate">{profileData.displayName}</h1>
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-6 w-6" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                         {isOwnProfile && (
                            <DropdownMenuItem onSelect={() => setProfileEditDialogOpen(true)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit Profile</span>
                            </DropdownMenuItem>
                         )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            <main className="flex-grow p-4 md:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                        <AvatarImage src={profileData.photoURL} alt={profileData.displayName} />
                        <AvatarFallback className="text-4xl">{profileData.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow text-center sm:text-left">
                        <h2 className="text-3xl font-bold">{profileData.displayName}</h2>
                        <p className="text-muted-foreground mt-1">{profileData.bio || "No bio provided."}</p>
                        <div className="flex justify-center sm:justify-start items-center gap-4 mt-2">
                             <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                <span className="font-semibold">4.8</span>
                                <span className="text-xs text-muted-foreground">(2.1k reviews)</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">{profileData.followers}</span>
                                <span className="text-xs text-muted-foreground">Followers</span>
                            </div>
                        </div>
                        {!isOwnProfile && (
                            <div className="mt-4 flex justify-center sm:justify-start gap-2">
                                <Button onClick={() => handleFollowToggle(profileData.uid)} variant={isFollowingState ? "outline" : "default"}>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    {isFollowingState ? "Following" : "Follow"}
                                </Button>
                                <Button variant="outline">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Message
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
                
                 <Tabs defaultValue="products" className="w-full">
                    <TabsList>
                        <TabsTrigger value="products">Products</TabsTrigger>
                        <TabsTrigger value="streams">Streams</TabsTrigger>
                    </TabsList>
                    <TabsContent value="products" className="mt-4">
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                            <div className="relative flex-grow">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input placeholder="Search products..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {productCategories.map(category => (
                                    <Button key={category} variant={activeCategory === category ? 'default' : 'outline'} size="sm" onClick={() => setActiveCategory(category)}>
                                        {category}
                                    </Button>
                                ))}
                            </div>
                        </div>
                        {filteredProducts.length > 0 ? (
                             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredProducts.map((product) => (
                                    <Link href={`/product/${product.id}`} key={product.id} className="group block">
                                        <Card className="w-full overflow-hidden h-full flex flex-col">
                                            <div className="aspect-square bg-muted rounded-t-lg overflow-hidden relative">
                                                 <Image 
                                                    src={product.images?.[0]?.preview || productDetails[product.id as keyof typeof productDetails]?.images[0] || "https://placehold.co/200x200.png"}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                                                    data-ai-hint={product.hint || 'product image'}
                                                />
                                            </div>
                                             <div className="p-3 flex-grow flex flex-col">
                                                <h4 className="font-semibold truncate text-sm flex-grow">{product.name}</h4>
                                                <p className="font-bold text-foreground mt-1">₹{product.price.toLocaleString()}</p>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                           <div className="text-center py-12 text-muted-foreground">
                                <ShoppingBag className="w-16 h-16 mx-auto text-border" />
                                <h3 className="text-xl font-semibold mt-4">No Products Found</h3>
                                <p>This seller hasn't listed any products in this category yet.</p>
                            </div>
                        )}
                    </TabsContent>
                    <TabsContent value="streams" className="mt-4">
                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {Array.from({length: 4}).map((_, i) => (
                                <Card key={i} className="group">
                                    <div className="aspect-video bg-muted rounded-t-lg relative overflow-hidden">
                                        <Image src={`https://placehold.co/300x169.png?text=Stream+${i+1}`} alt={`Stream ${i+1}`} layout="fill" className="object-cover" />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                                        <p className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-1.5 py-0.5 rounded">1.2M views</p>
                                    </div>
                                    <div className="p-2">
                                        <p className="text-sm font-semibold truncate">Live Unboxing of New Gadgets</p>
                                        <p className="text-xs text-muted-foreground">2 days ago</p>
                                    </div>
                                </Card>
                            ))}
                         </div>
                    </TabsContent>
                 </Tabs>
            </main>
        </div>
        <DialogContent className="max-w-lg w-[95vw] h-auto max-h-[85vh] flex flex-col p-0 rounded-lg">
            <DialogHeader className="p-6 pb-4">
                <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
             <EditProfileForm 
                currentUser={profileData}
                onSave={handleProfileSave}
                onCancel={() => setIsProfileEditDialogOpen(false)}
             />
        </DialogContent>
    </Dialog>
  );
}
