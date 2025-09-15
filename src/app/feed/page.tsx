
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Flag, MessageCircle, MoreHorizontal, Share2, Heart, MessageSquare, Save, Trash2, Home, Compass, Star, Send, Settings, BarChart, Search, Plus, RadioTower, Users } from 'lucide-react';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { getFirestoreDb, getFirebaseStorage } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, where, doc, deleteDoc, runTransaction, increment, serverTimestamp, addDoc, Timestamp } from 'firebase/firestore';
import { format, formatDistanceToNow } from 'date-fns';
import { toggleFollow, isFollowing, UserData } from '@/lib/follow-data';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { CreatePostForm } from '@/components/create-post-form';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const reportReasons = [
    { id: "spam", label: "It's spam" },
    { id: "hate", label: "Hate speech or symbols" },
    { id: "false", label: "False information" },
    { id: "bullying", label: "Bullying or harassment" },
];

const mockFollowers = [
    { id: 1, name: "Wade Warren", country: "United States", avatar: "https://placehold.co/40x40.png" },
    { id: 2, name: "Esther Howard", country: "Canada", avatar: "https://placehold.co/40x40.png" },
    { id: 3, name: "Robert Fox", country: "United Kingdom", avatar: "https://placehold.co/40x40.png" },
];

const liveSellers = [
    { id: '1', name: 'FashionFinds', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Fashion', viewers: 1200, buyers: 25, rating: 4.8, reviews: 12, hint: 'woman posing stylish outfit', productId: 'prod_1', hasAuction: true },
    { id: '2', name: 'GadgetGuru', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Electronics', viewers: 2500, buyers: 42, rating: 4.9, reviews: 28, hint: 'unboxing new phone', productId: 'prod_2', hasAuction: false },
    { id: '3', name: 'HomeHaven', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Home Goods', viewers: 850, buyers: 15, rating: 4.7, reviews: 9, hint: 'modern living room decor', productId: 'prod_3', hasAuction: false },
    { id: '4', name: 'BeautyBox', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Beauty', viewers: 3100, buyers: 78, rating: 4.9, reviews: 55, hint: 'makeup tutorial', productId: 'prod_4', hasAuction: true },
    { id: '5', name: 'KitchenWiz', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Kitchenware', viewers: 975, buyers: 0, rating: 0, reviews: 0, hint: 'cooking demonstration', productId: 'prod_5', hasAuction: false },
    { id: '6', name: 'FitFlow', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Fitness', viewers: 1500, buyers: 33, rating: 4.6, reviews: 18, hint: 'yoga session', productId: 'prod_6', hasAuction: false },
    { id: '7', name: 'ArtisanAlley', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Handmade', viewers: 450, buyers: 8, rating: 5.0, reviews: 6, hint: 'pottery making', productId: 'prod_7', hasAuction: true },
    { id: '8', name: 'PetPalace', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Pet Supplies', viewers: 1800, buyers: 50, rating: 4.8, reviews: 30, hint: 'playing with puppy', productId: 'prod_8', hasAuction: false },
    { id: '9', name: 'BookNook', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Books', viewers: 620, buyers: 12, rating: 4.9, reviews: 10, hint: 'reading book cozy', productId: 'prod_9', hasAuction: false },
    { id: '10', name: 'GamerGuild', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Gaming', viewers: 4200, buyers: 102, rating: 4.9, reviews: 80, hint: 'esports competition', productId: 'prod_10', hasAuction: true },
];

function FeedPostSkeleton() {
    return (
        <Card className="overflow-hidden border-none shadow-none bg-transparent">
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
                <Skeleton className="w-full aspect-[4/3] rounded-lg" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>
        </Card>
    );
}

export default function FeedPage() {
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuth();
  const [feed, setFeed] = useState<any[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState("");
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const userPosts = useMemo(() => {
    if (!user) return [];
    return feed.filter(post => post.sellerId === user.uid);
  }, [feed, user]);
  
  const trendingTopics = useMemo(() => {
    const hashtagCounts: { [key: string]: number } = {};
    feed.forEach(post => {
      const hashtags = post.tags?.split(' ').filter((tag: string) => tag.startsWith('#')) || [];
      hashtags.forEach((tag: string) => {
        const cleanedTag = tag.substring(1);
        hashtagCounts[cleanedTag] = (hashtagCounts[cleanedTag] || 0) + 1;
      });
    });
    return Object.entries(hashtagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, posts]) => ({ topic, posts: `${posts} post${posts > 1 ? 's' : ''}` }));
  }, [feed]);

  const trendingStreams = useMemo(() => {
    return [...liveSellers].sort((a,b) => b.viewers - a.viewers).slice(0, 4);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    setIsLoadingFeed(true);
    const db = getFirestoreDb();
    const postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    
    const mockPost = {
        id: "mock1",
        sellerName: "Jerome Bell",
        avatarUrl: "https://placehold.co/40x40/FFC107/000000?text=J",
        content: "NFTs, presented in high-definition 3D avatars, are created by the HALO label with the Decentralized 3D Artist Community. NFT owners can easily control the avatar's movements and expressions on social platforms like Discord, YouTube and TikTok, or online meetings.",
        tags: "#NFT #color #mint #nftdrop #nftnews",
        images: [
            { id: 1, url: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&q=80" },
            { id: 2, url: "https://images.unsplash.com/photo-1621419790382-026d3d9547a4?w=800&q=80" },
            { id: 3, url: "https://images.unsplash.com/photo-1617791160536-595cfb24464a?w=800&q=80" },
            { id: 4, url: "https://images.unsplash.com/photo-1614088484193-a4e9b89791f1?w=800&q=80" },
            { id: 5, url: "https://images.unsplash.com/photo-1632516643720-e7f5d7d6086f?w=800&q=80" },
        ],
        likes: 1200,
        comments: 45,
        timestamp: new Date().toISOString()
    };

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp ? format(new Date((doc.data().timestamp as Timestamp).seconds * 1000), 'PPp') : 'just now'
        }));
        
        const formattedMockPost = {
            ...mockPost,
            timestamp: format(new Date(mockPost.timestamp), 'PPp')
        }

        setFeed([formattedMockPost, ...postsData]);
        setIsLoadingFeed(false);
    });

    return () => unsubscribe();
  }, [isMounted]);
  
  if (!isMounted || authLoading) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  }
  
  if (!user || !userData) {
    router.push('/');
    return null;
  }

  const handleShare = (postId: string) => {
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

  return (
    <>
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
    <div className="min-h-screen bg-background text-foreground">
        <div className="grid lg:grid-cols-[18rem_1fr_22rem] min-h-screen">
          {/* Sidebar */}
          <aside className="border-r p-6 flex-col hidden lg:flex">
              <div className="text-center mb-8">
                  <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-primary">
                      <AvatarImage src={userData.photoURL || undefined} alt={userData.displayName}/>
                      <AvatarFallback className="text-3xl">{userData.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">{userData.displayName}</h2>
                  <p className="text-sm text-muted-foreground">Graphic / UI Designer</p>
                  <p className="text-xs text-muted-foreground mt-2 font-mono break-all">{userData.uid.substring(0, 15)}...{userData.uid.substring(userData.uid.length - 4)}</p>
              </div>
               <div className="flex justify-around mb-8 text-center">
                  <div>
                      <p className="font-bold text-lg">{userPosts.length}</p>
                      <p className="text-xs text-muted-foreground">Posts</p>
                  </div>
                  <div>
                      <p className="font-bold text-lg">298.4K</p>
                      <p className="text-xs text-muted-foreground">Followers</p>
                  </div>
                  <div>
                      <p className="font-bold text-lg">2.07M</p>
                      <p className="text-xs text-muted-foreground">Following</p>
                  </div>
              </div>
              <nav className="space-y-2 flex-grow">
                  <Button variant="ghost" className="w-full justify-start gap-3"><Home /> Feed</Button>
                  <Button variant="ghost" className="w-full justify-start gap-3"><Compass /> Explore</Button>
                  <Button variant="ghost" className="w-full justify-start gap-3"><Heart /> My favorites</Button>
                  <Button variant="ghost" className="w-full justify-start gap-3"><Send /> Direct</Button>
                  <Button variant="ghost" className="w-full justify-start gap-3"><BarChart /> Stats</Button>
                  <Button variant="ghost" className="w-full justify-start gap-3"><Settings /> Settings</Button>
              </nav>
               <div className="mt-8">
                    <h3 className="font-semibold text-sm mb-4">Follower</h3>
                    <div className="space-y-4">
                        {mockFollowers.map(f => (
                            <div key={f.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={f.avatar}/>
                                        <AvatarFallback>{f.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-sm">{f.name}</p>
                                        <p className="text-xs text-muted-foreground">{f.country}</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MessageSquare className="h-4 w-4 text-muted-foreground"/>
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 border-r">
              <div className="p-6">
                  <div className="relative mb-6">
                      <Input placeholder="Search items, collections, and accounts" className="pl-10 h-12 rounded-lg bg-muted border-none"/>
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
                  </div>
                  
                   <div className="mb-6">
                      <CreatePostForm />
                   </div>

                  <section>
                      <h2 className="text-xl font-bold mb-4">Feeds</h2>
                      <div className="space-y-8">
                          {isLoadingFeed ? (
                              <>
                                <FeedPostSkeleton />
                                <FeedPostSkeleton />
                              </>
                          ) : (
                              feed.map(post => (
                                  <Card key={post.id} className="border-none shadow-none bg-transparent">
                                      <div className="p-4 flex items-center justify-between">
                                           <div className="flex items-center gap-3">
                                              <Avatar className="h-10 w-10">
                                                  <AvatarImage src={post.avatarUrl} />
                                                  <AvatarFallback>{post.sellerName.charAt(0)}</AvatarFallback>
                                              </Avatar>
                                              <div>
                                                <p className="font-semibold">{post.sellerName}</p>
                                                <p className="text-xs text-muted-foreground">@{post.sellerName.toLowerCase().replace(' ', '')}</p>
                                              </div>
                                          </div>
                                          <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                      </div>
                                       {post.images && (
                                           <div className="grid grid-cols-3 grid-rows-2 gap-1 px-4 h-96">
                                              <div className="col-span-2 row-span-2 rounded-l-lg overflow-hidden"><Image src={post.images[0].url} alt="Post image 1" width={400} height={400} className="w-full h-full object-cover"/></div>
                                              <div className="col-span-1 row-span-1 rounded-tr-lg overflow-hidden"><Image src={post.images[1].url} alt="Post image 2" width={200} height={200} className="w-full h-full object-cover"/></div>
                                              <div className="col-span-1 row-span-1 rounded-br-lg overflow-hidden relative">
                                                <Image src={post.images[2].url} alt="Post image 3" width={200} height={200} className="w-full h-full object-cover"/>
                                                {post.images.length > 3 && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-2xl font-bold">
                                                        +{post.images.length - 3}
                                                    </div>
                                                )}
                                              </div>
                                           </div>
                                       )}
                                      <div className="p-4">
                                          <p className="text-sm text-muted-foreground">{post.content}</p>
                                          <p className="text-sm text-primary mt-2">{post.tags}</p>
                                      </div>
                                  </Card>
                              ))
                          )}
                      </div>
                  </section>
              </div>
          </main>
          {/* Right Column */}
           <aside className="p-6 hidden lg:block space-y-6">
              <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Trending</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {trendingTopics.map((topic, index) => (
                            <div key={index}>
                                <Link href="#" className="font-semibold hover:underline">#{topic.topic}</Link>
                                <p className="text-xs text-muted-foreground">{topic.posts}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Trending Streams</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {trendingStreams.map((stream) => (
                            <Link href={`/stream/${stream.id}`} key={stream.id} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Avatar className="h-10 w-10">
                                            <AvatarImage src={stream.avatarUrl}/>
                                            <AvatarFallback>{stream.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-0.5 animate-pulse">
                                          <RadioTower className="h-2 w-2 text-white"/>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm group-hover:underline">{stream.name}</p>
                                        <p className="text-xs text-muted-foreground">{stream.category}</p>
                                    </div>
                                </div>
                                 <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Users className="h-3 w-3"/>
                                    {stream.viewers}
                                 </div>
                            </Link>
                        ))}
                    </div>
                </CardContent>
              </Card>
          </aside>
        </div>
    </div>
    </>
  );
}

    