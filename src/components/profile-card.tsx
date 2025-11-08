
"use client";

import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MapPin, Package, Video, UserPlus, UserCheck, Instagram, Twitter, Youtube, Facebook, Twitch, Award, Users, Home, Star } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { Skeleton } from './ui/skeleton';
import { Badge } from './ui/badge';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { toggleFollow, isFollowing as isFollowingBackend, UserData } from '@/lib/follow-data';
import { getFirestore, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { productDetails } from '@/lib/product-data';
import Link from 'next/link';

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
    { id: 'gadgetguru-uid', title: 'Unboxing the Latest Tech', date: '3 days ago', views: '1.2M', duration: '45:12', thumbnailUrl: 'https://placehold.co/400x225.png?text=Past+Stream+1' },
    { id: 'fashionfinds-uid', title: 'Fall Fashion Lookbook', date: '1 week ago', views: '890k', duration: '1:02:30', thumbnailUrl: 'https://placehold.co/400x225.png?text=Past+Stream+2' },
];

const mockAchievements = [
    { id: 1, name: 'Top Seller', icon: <Award className="h-6 w-6" />, description: 'Achieved top 1% seller status' },
    { id: 2, name: 'Community Pillar', icon: <Users className="h-6 w-6" />, description: 'Over 10,000 followers' },
    { id: 3, name: 'Power Streamer', icon: <Video className="h-6 w-6" />, description: 'Streamed for over 100 hours' },
];

const mockUserOrders = [
    { orderId: '#STREAM619732', date: 'Nov 01, 2025', timeline: [{ status: 'Delivered' }] },
    { orderId: '#MOCK5678', date: 'Oct 26, 2025', timeline: [{ status: 'Cancelled by seller' }] },
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

const renderContentWithHashtags = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(#\w+)/g);
    return parts.map((part, index) => {
        if (part.startsWith('#')) {
            return <button key={index} className="text-primary hover:underline font-semibold">{part}</button>;
        }
        return part;
    });
};

const RealtimeTimestamp = ({ date, isEdited }: { date: Date | string, isEdited?: boolean }) => {
    const [relativeTime, setRelativeTime] = useState('');

    useEffect(() => {
        const update = () => {
            setRelativeTime(formatDistanceToNow(new Date(date), { addSuffix: true }));
        };
        update();
        const interval = setInterval(update, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [date]);

    return <>{relativeTime} {isEdited && <span className="text-muted-foreground/80">• Edited</span>}</>;
};

export function ProfileCard({ profileData, isOwnProfile, onAddressesUpdate, onFollowToggle: onFollowToggleProp, handleAuthAction }: { profileData: UserData, isOwnProfile: boolean, onAddressesUpdate: (addresses: any[]) => void, onFollowToggle?: () => void, handleAuthAction: (callback: () => void) => void }) {
    const { user } = useAuth();
    const router = useRouter();
    const [isLoadingContent, setIsLoadingContent] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sellerProducts, setSellerProducts] = useState<any[]>([]);
    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [isFollowed, setIsFollowed] = useState(false);
    const [activeCategory, setActiveCategory] = useState("All");
    const [userOrders, setUserOrders] = useState<any[]>(mockUserOrders); // Mock for now

    useEffect(() => {
        if (user) {
            isFollowingBackend(user.uid, profileData.uid).then(setIsFollowed);
        }
    }, [user, profileData.uid]);
    
    useEffect(() => {
        const productsKey = `sellerProducts`;
        const storedProducts = localStorage.getItem(productsKey);
        if (storedProducts) {
            setSellerProducts(JSON.parse(storedProducts).filter((p: any) => p.seller === profileData.displayName));
        }

        const db = getFirestoreDb();
        const postsQuery = query(collection(db, "posts"), where("sellerId", "==", profileData.uid), orderBy("timestamp", "desc"));
        const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
            const postsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp,
            }));
            setUserPosts(postsData);
        });

        const timer = setTimeout(() => setIsLoadingContent(false), 500);

        return () => {
            clearTimeout(timer);
            unsubscribe();
        };
    }, [profileData.uid, profileData.displayName]);

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

    const handleFollowToggle = async () => {
        handleAuthAction(async () => {
            setIsFollowed(prev => !prev);
            await toggleFollow(user!.uid, profileData.uid);
            if (onFollowToggleProp) onFollowToggleProp();
        });
    };

    return (
        <>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 relative p-4 sm:p-6">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-lg">
                    <AvatarImage src={profileData.photoURL} alt={profileData.displayName} />
                    <AvatarFallback className="text-4xl">{profileData.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-center sm:items-start text-foreground flex-grow text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl font-bold">{profileData.displayName}</h2>
                    <div className="flex gap-2 items-center">
                        <p className="text-sm text-muted-foreground">@{profileData.displayName.toLowerCase().replace(' ', '')}</p>
                        {profileData.role === 'seller' && (
                            <Badge variant="secondary" className="flex items-center gap-1">
                                <Star className="h-3 w-3" /> 4.8
                            </Badge>
                        )}
                         {profileData.role === 'admin' && <Badge variant="destructive">Admin</Badge>}
                    </div>
                    <div className="flex gap-4 pt-2 sm:pt-4">
                        <div className="text-center">
                            <p className="text-xl sm:text-2xl font-bold">{profileData.following || 0}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">Following</p>
                        </div>
                        <div className="text-center">
                            <p className="text-xl sm:text-2xl font-bold">{profileData.followers || 0}</p>
                            <p className="text-xs sm:text-sm text-muted-foreground">Followers</p>
                        </div>
                    </div>
                    {!isOwnProfile && profileData.role === 'seller' && (
                        <div className="flex gap-2 mt-4">
                            <Button onClick={handleFollowToggle} variant={isFollowed ? "outline" : "default"}>
                                {isFollowed ? <UserCheck className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                {isFollowed ? "Following" : "Follow"}
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="px-4 sm:px-6">
                <Tabs defaultValue="posts" className="w-full">
                    <TabsList className="w-full overflow-x-auto no-scrollbar justify-start">
                        {profileData.role === 'seller' && <TabsTrigger value="products">Listed Products</TabsTrigger>}
                        <TabsTrigger value="posts">Posts</TabsTrigger>
                        {profileData.role === 'seller' && <TabsTrigger value="sessions">Sessions</TabsTrigger>}
                        <TabsTrigger value="about">About</TabsTrigger>
                        {isOwnProfile && <TabsTrigger value="achievements">Achievements</TabsTrigger>}
                        {isOwnProfile && (
                            <TabsTrigger value="orders" onClick={() => router.push(profileData.role === 'seller' ? '/seller/orders' : '/orders')}>
                                Orders
                            </TabsTrigger>
                        )}
                    </TabsList>
                    <TabsContent value="products" className="mt-4">
                        {isLoadingContent ? <ProductSkeletonGrid /> : filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {filteredProducts.map(p => (
                                    <Card key={p.id} className="w-full">
                                        <CardContent className="p-0">
                                            <div className="aspect-square bg-muted rounded-t-lg overflow-hidden relative">
                                                <Image src={p.images[0]?.preview || 'https://placehold.co/200x200.png'} alt={p.name} fill className="object-cover" />
                                            </div>
                                            <div className="p-3">
                                                <h4 className="font-semibold truncate text-sm">{p.name}</h4>
                                                <p className="font-bold text-foreground">₹{p.price.toLocaleString()}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">This seller hasn't listed any products yet.</div>
                        )}
                    </TabsContent>
                    <TabsContent value="posts" className="mt-4">
                       <div className="space-y-4">
                          {userPosts.map(post => (
                              <Card key={post.id}>
                                <CardContent className="p-4">
                                  <div className="flex items-start gap-3">
                                    <Avatar>
                                      <AvatarImage src={post.avatarUrl} />
                                      <AvatarFallback>{post.sellerName?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow">
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <p className="font-semibold">{post.sellerName}</p>
                                          <p className="text-xs text-muted-foreground">
                                              <RealtimeTimestamp date={post.timestamp.toDate()} isEdited={post.lastEditedAt} />
                                          </p>
                                        </div>
                                      </div>
                                      <p className="text-sm mt-2 whitespace-pre-wrap">{renderContentWithHashtags(post.content)}</p>
                                       {post.images && post.images.length > 0 && (
                                            <div className="mt-2 rounded-lg overflow-hidden border">
                                                <Image src={post.images[0].url} alt="Post image" width={400} height={300} className="w-full h-auto object-cover" />
                                            </div>
                                        )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                          ))}
                          {userPosts.length === 0 && (
                              <div className="text-center py-12 text-muted-foreground">This user hasn't posted anything yet.</div>
                          )}
                       </div>
                    </TabsContent>
                    <TabsContent value="sessions" className="mt-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {mockPastStreams.filter(s => s.id === profileData.uid).map(stream => (
                                <Card key={stream.id}>
                                    <CardContent className="p-0">
                                        <div className="aspect-video bg-muted rounded-t-lg overflow-hidden relative">
                                            <Image src={stream.thumbnailUrl} alt={stream.title} fill className="object-cover" />
                                            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded-sm">{stream.duration}</div>
                                        </div>
                                        <div className="p-3">
                                            <h4 className="font-semibold truncate">{stream.title}</h4>
                                            <p className="text-sm text-muted-foreground">{stream.views} views • {stream.date}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                             {mockPastStreams.filter(s => s.id === profileData.uid).length === 0 && (
                                <div className="col-span-full text-center py-12 text-muted-foreground">This seller has no past streams.</div>
                             )}
                         </div>
                    </TabsContent>
                     <TabsContent value="about" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>About {profileData.displayName}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {profileData.bio && <p className="text-sm text-muted-foreground">{profileData.bio}</p>}
                                <Separator />
                                <div className="space-y-2 text-sm">
                                    {profileData.location && <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> <span>{profileData.location}</span></div>}
                                    {profileData.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> <a href={`mailto:${profileData.email}`} className="hover:underline">{profileData.email}</a></div>}
                                    {profileData.phone && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> <span>{profileData.phone}</span></div>}
                                    {profileData.addresses && profileData.addresses.length > 0 && 
                                        <div className="flex items-start gap-2 pt-2">
                                            <Home className="h-4 w-4 text-muted-foreground mt-1" /> 
                                            <div>
                                                <p className="font-semibold text-foreground">Address</p>
                                                <p>{profileData.addresses[0].village}, {profileData.addresses[0].district}</p>
                                                <p>{profileData.addresses[0].city}, {profileData.addresses[0].state} - {profileData.addresses[0].pincode}</p>
                                            </div>
                                        </div>
                                    }
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    {profileData.instagram && <Button asChild variant="outline" size="sm"><Link href={profileData.instagram} target="_blank"><Instagram className="mr-2 h-4 w-4" /> Instagram</Link></Button>}
                                    {profileData.twitter && <Button asChild variant="outline" size="sm"><Link href={profileData.twitter} target="_blank"><Twitter className="mr-2 h-4 w-4" /> Twitter</Link></Button>}
                                    {profileData.youtube && <Button asChild variant="outline" size="sm"><Link href={profileData.youtube} target="_blank"><Youtube className="mr-2 h-4 w-4" /> YouTube</Link></Button>}
                                    {profileData.facebook && <Button asChild variant="outline" size="sm"><Link href={profileData.facebook} target="_blank"><Facebook className="mr-2 h-4 w-4" /> Facebook</Link></Button>}
                                    {profileData.twitch && <Button asChild variant="outline" size="sm"><Link href={profileData.twitch} target="_blank"><Twitch className="mr-2 h-4 w-4" /> Twitch</Link></Button>}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                     {isOwnProfile && (
                        <>
                           <TabsContent value="achievements" className="mt-4">
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                  {mockAchievements.map(ach => (
                                    <Card key={ach.id} className="text-center p-4 flex flex-col items-center justify-center">
                                      <div className="p-3 bg-primary/10 rounded-full mb-2 text-primary">{ach.icon}</div>
                                      <p className="font-semibold text-sm">{ach.name}</p>
                                      <p className="text-xs text-muted-foreground">{ach.description}</p>
                                    </Card>
                                  ))}
                              </div>
                            </TabsContent>
                        </>
                    )}
                </Tabs>
            </div>
        </>
    );
}

    