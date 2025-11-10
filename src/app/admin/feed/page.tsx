
"use client";

import {
  Menu,
  MoreHorizontal,
  Search,
  Edit,
  Trash2,
  Flag,
  Share2,
  UserCheck,
  UserPlus,
  Save,
  ShoppingBag,
  ArrowUp,
  ArrowDown,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, onSnapshot, Timestamp, deleteDoc, doc } from "firebase/firestore";
import { getFirestoreDb } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { AdminLayout } from '@/components/admin/admin-layout';
import Link from 'next/link';

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
                <Skeleton className="w-full aspect-video rounded-lg" />
                <div className="space-y-3 mt-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>
        </Card>
    );
}

const FeedPost = ({ post, onDelete }: { post: any; onDelete: (post: any) => void }) => {
    const renderContentWithHashtags = (text: string) => {
        if (!text) return null;
        const parts = text.split(/(#\w+)/g);
        return parts.map((part, index) => {
            if (part.startsWith('#')) {
                return (
                    <span key={index} className="text-primary hover:underline cursor-pointer">{part}</span>
                );
            }
            return part;
        });
    };

    return (
        <Card className="w-full">
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <Link href={`/admin/users/${post.sellerId}`} className="flex items-center gap-3 group">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={post.avatarUrl} />
                            <AvatarFallback>{post.sellerName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <span className="font-semibold group-hover:underline">{post.sellerName}</span>
                            <div className="text-xs text-muted-foreground">{post.timestamp}</div>
                        </div>
                    </Link>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                        <Trash2 className="mr-2 h-4 w-4" /> Delete Post
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>This will permanently delete this post. This action cannot be undone.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => onDelete(post)}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">
                    {renderContentWithHashtags(post.content)}
                </div>
                {post.images && post.images.length > 0 && (
                    <div className="mt-3 rounded-lg overflow-hidden border aspect-video relative">
                        <Image src={post.images[0].url} alt="Post image" layout="fill" objectFit="cover" />
                    </div>
                )}
            </div>
            <div className="px-4 pb-2 mt-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
                        <ArrowUp className="w-4 h-4"/> <span>{post.likes || 0}</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4"/> <span>{post.replies || 0}</span>
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default function AdminFeedPage() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  const [feed, setFeed] = useState<any[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (!loading && userData?.role !== 'admin') {
      router.replace('/');
    }
  }, [user, userData, loading, router]);

  useEffect(() => {
    setIsLoadingFeed(true);
    const db = getFirestoreDb();
    const postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp ? formatDistanceToNow(new Date((doc.data().timestamp as Timestamp).seconds * 1000), { addSuffix: true }) : 'just now'
        }));
        setFeed(postsData);
        setIsLoadingFeed(false);
    }, (error) => {
        console.error("Error fetching feed:", error);
        toast({
            title: "Error",
            description: "Could not fetch the feed. Please try again later.",
            variant: "destructive"
        })
        setIsLoadingFeed(false);
    });

    return () => unsubscribe();
  }, [toast]);
  
  const handleDeletePost = async (post: any) => {
      if (!post || !post.id) return;
      const db = getFirestoreDb();
      const postRef = doc(db, 'posts', post.id);

      try {
          await deleteDoc(postRef);
          toast({
              title: "Post Deleted",
              description: "The post has been successfully removed.",
          });
      } catch (error) {
          console.error("Error deleting post: ", error);
          toast({
              variant: 'destructive',
              title: "Error",
              description: "Could not delete the post. Please try again."
          });
      }
  };
  
  const filteredFeed = useMemo(() => {
    if (!debouncedSearchTerm) return feed;
    const lowercasedTerm = debouncedSearchTerm.toLowerCase();
    return feed.filter(post => 
        post.content?.toLowerCase().includes(lowercasedTerm) ||
        post.sellerName?.toLowerCase().includes(lowercasedTerm)
    );
  }, [feed, debouncedSearchTerm]);


  return (
    <AdminLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-semibold">Global Feed</h1>
                <p className="text-muted-foreground">Monitor and manage all user-generated posts.</p>
            </div>
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search posts or users..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        <div className="space-y-4">
          {isLoadingFeed ? (
            <div className="space-y-4">
              <FeedPostSkeleton />
              <FeedPostSkeleton />
            </div>
          ) : filteredFeed.length > 0 ? (
            filteredFeed.map(post => (
              <FeedPost
                key={post.id}
                post={post}
                onDelete={handleDeletePost}
              />
            ))
          ) : (
            <div className="text-center py-20 text-muted-foreground">
                No posts found.
            </div>
          )}
        </div>
      </main>
    </AdminLayout>
  );
}
