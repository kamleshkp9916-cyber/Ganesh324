

"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Flag, MessageCircle, MoreHorizontal, Share2, Heart, MessageSquare, Save, Trash2, Home, Compass, Star, Send, Settings, BarChart, Search, Plus } from 'lucide-react';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { getFirestoreDb, getFirebaseStorage } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, where, doc, deleteDoc, runTransaction, increment, serverTimestamp, addDoc, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
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

const stories = [
    { id: 1, name: "John", avatar: "https://placehold.co/80x80/E57373/FFFFFF?text=J" },
    { id: 2, name: "Leo", avatar: "https://placehold.co/80x80/81C784/FFFFFF?text=L" },
    { id: 3, name: "Bayliss", avatar: "https://placehold.co/80x80/64B5F6/FFFFFF?text=B" },
    { id: 4, name: "Haci", avatar: "https://placehold.co/80x80/FFB74D/FFFFFF?text=H" },
    { id: 5, name: "Nick", avatar: "https://placehold.co/80x80/9575CD/FFFFFF?text=N" },
    { id: 6, name: "Bob", avatar: "https://placehold.co/80x80/F06292/FFFFFF?text=B" },
];

const mockFollowers = [
    { id: 1, name: "Wade Warren", country: "United States", avatar: "https://placehold.co/40x40.png" },
    { id: 2, name: "Esther Howard", country: "Canada", avatar: "https://placehold.co/40x40.png" },
    { id: 3, name: "Robert Fox", country: "United Kingdom", avatar: "https://placehold.co/40x40.png" },
]

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
        comments: 45
    };

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp ? format(new Date((doc.data().timestamp as Timestamp).seconds * 1000), 'PPp') : 'just now'
        }));
        setFeed([mockPost, ...postsData]);
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
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <aside className="w-72 border-r p-6 flex-col hidden lg:flex">
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
      <main className="flex-1 min-w-0">
          <div className="p-6">
              <div className="relative mb-6">
                  <Input placeholder="Search items, collections, and accounts" className="pl-10 h-12 rounded-lg bg-muted border-none"/>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"/>
              </div>

              <section className="mb-10">
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">Stories</h2>
                      <Button variant="link" className="p-0 text-sm">Watch all</Button>
                  </div>
                  <div className="flex items-center gap-4">
                        <div className="text-center w-16">
                           <button className="w-16 h-16 rounded-full border-2 border-dashed flex items-center justify-center mb-1 hover:border-primary">
                               <Plus className="h-6 w-6 text-muted-foreground"/>
                           </button>
                           <p className="text-xs truncate">Add story</p>
                        </div>
                      {stories.map(story => (
                          <div key={story.id} className="text-center w-16">
                              <Avatar className="h-16 w-16 border-2 border-primary">
                                  <AvatarImage src={story.avatar} alt={story.name}/>
                                  <AvatarFallback>{story.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <p className="text-xs mt-1 truncate">{story.name}</p>
                          </div>
                      ))}
                  </div>
              </section>

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
    </div>
    </>
  );
}
