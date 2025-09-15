
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Flag, MessageCircle, MoreHorizontal, Share2, Heart, MessageSquare, Save, Trash2 } from 'lucide-react';
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
import { Send } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { CreatePostForm } from '@/components/create-post-form';
import { cn } from '@/lib/utils';

const reportReasons = [
    { id: "spam", label: "It's spam" },
    { id: "hate", label: "Hate speech or symbols" },
    { id: "false", label: "False information" },
    { id: "bullying", label: "Bullying or harassment" },
];

function FeedPostSkeleton() {
    return (
        <Card className="overflow-hidden">
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
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="w-full aspect-video rounded-lg" />
            </div>
        </Card>
    );
}

function CommentSheet({ postId, trigger }: { postId: string, trigger: React.ReactNode }) {
    const { user, userData } = useAuth();
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const db = getFirestoreDb();
        const commentsQuery = query(collection(db, `posts/${postId}/comments`), orderBy("timestamp", "asc"));
        const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
            const commentsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp ? format(new Date((doc.data().timestamp as Timestamp).seconds * 1000), 'PPp') : 'just now'
            }));
            setComments(commentsData);
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, [postId]);

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !user || !userData) return;
        
        const db = getFirestoreDb();
        await addDoc(collection(db, `posts/${postId}/comments`), {
            authorName: userData.displayName,
            authorId: user.uid,
            authorAvatar: userData.photoURL,
            text: newComment.trim(),
            timestamp: serverTimestamp(),
        });

        await updateDoc(doc(db, 'posts', postId), {
            replies: increment(1)
        });

        setNewComment("");
    };

    return (
         <Sheet>
            <SheetTrigger asChild>{trigger}</SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] flex flex-col p-0">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle>Comments</SheetTitle>
                </SheetHeader>
                <ScrollArea className="flex-1 px-4">
                    {isLoading ? (
                        <div className="space-y-4 py-4">
                             <Skeleton className="h-10 w-full" />
                             <Skeleton className="h-10 w-full" />
                        </div>
                    ) : comments.length > 0 ? (
                        <div className="space-y-4 py-4">
                            {comments.map(comment => (
                                <div key={comment.id} className="flex items-start gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={comment.authorAvatar} />
                                        <AvatarFallback>{comment.authorName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow bg-muted p-2 rounded-lg">
                                        <div className="flex justify-between items-center text-xs">
                                            <p className="font-semibold">{comment.authorName}</p>
                                            <p className="text-muted-foreground">{comment.timestamp}</p>
                                        </div>
                                        <p className="text-sm">{comment.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No comments yet. Be the first to reply!</p>
                    )}
                </ScrollArea>
                <div className="p-4 border-t">
                    <form onSubmit={handlePostComment} className="w-full flex items-center gap-2">
                        <Input 
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <Button type="submit" disabled={!newComment.trim()}><Send className="w-4 h-4" /></Button>
                    </form>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default function FeedPage() {
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuth();
  const [feed, setFeed] = useState<any[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState("");
  const { toast } = useToast();
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [feedFilter, setFeedFilter] = useState('global');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    setIsLoadingFeed(true);
    const db = getFirestoreDb();
    let postsQuery;

    if (feedFilter === 'following' && user) {
        // In a real app, you'd fetch the user's following list first.
        // For now, this will likely be empty unless you manually follow someone.
        if (followingIds.length > 0) {
            postsQuery = query(collection(db, "posts"), where("sellerId", "in", followingIds), orderBy("timestamp", "desc"));
        } else {
            setFeed([]);
            setIsLoadingFeed(false);
            return;
        }
    } else {
        postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    }

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp ? format(new Date((doc.data().timestamp as Timestamp).seconds * 1000), 'PPp') : 'just now'
        }));
        setFeed(postsData);
        setIsLoadingFeed(false);
    });

    return () => unsubscribe();
  }, [isMounted, feedFilter, user, followingIds]);

  if (!isMounted || authLoading) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  }
  
  if (!user) {
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

  const handleDeletePost = async (postId: string, mediaUrl: string | null) => {
    const db = getFirestoreDb();
    const postRef = doc(db, 'posts', postId);
    
    try {
        await deleteDoc(postRef);
        if (mediaUrl) {
            const storage = getFirebaseStorage();
            const mediaRef = storageRef(storage, mediaUrl);
            await deleteObject(mediaRef);
        }
        toast({
            title: "Post Deleted",
            description: "Your post has been successfully removed.",
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

  const handleLikePost = async (postId: string) => {
    const db = getFirestoreDb();
    const postRef = doc(db, 'posts', postId);
    const likeRef = doc(db, `posts/${postId}/likes`, user!.uid);

    try {
        await runTransaction(db, async (transaction) => {
            const likeDoc = await transaction.get(likeRef);
            if (likeDoc.exists()) {
                transaction.delete(likeRef);
                transaction.update(postRef, { likes: increment(-1) });
            } else {
                transaction.set(likeRef, { likedAt: serverTimestamp() });
                transaction.update(postRef, { likes: increment(1) });
            }
        });
    } catch (error) {
        console.error("Error toggling like:", error);
    }
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
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Feed</h1>
        <div className="w-10"></div>
      </header>

      <main className="container mx-auto max-w-2xl py-6 space-y-4">
        <div className="flex items-center gap-2">
            <Button variant={feedFilter === 'global' ? 'secondary' : 'ghost'} onClick={() => setFeedFilter('global')}>Global</Button>
            <Button variant={feedFilter === 'following' ? 'secondary' : 'ghost'} onClick={() => setFeedFilter('following')}>Following</Button>
        </div>
        <CreatePostForm />
        
        {isLoadingFeed ? (
            <>
                <FeedPostSkeleton />
                <FeedPostSkeleton />
            </>
        ) : feed.length > 0 ? (
            feed.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                    <div className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={item.avatarUrl} alt={item.sellerName} />
                                    <AvatarFallback>{item.sellerName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-semibold text-primary">{item.sellerName}</p>
                                    <p className="text-xs text-muted-foreground">{item.timestamp} • {item.location || 'Card'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {user && user.uid === item.sellerId && (
                                    <Badge variant="outline">Your post</Badge>
                                )}
                                    <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        {user && user.uid === item.sellerId && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onSelect={(e) => e.preventDefault()}>
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        <span>Delete Post</span>
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>This will permanently delete your post. This action cannot be undone.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeletePost(item.id, item.mediaUrl)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                        <DropdownMenuItem onClick={() => handleShare(item.id)}>
                                            <Share2 className="mr-2 h-4 w-4" />
                                            <span>Share</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <a href={`mailto:feedback@example.com?subject=Feedback on post ${item.id}`}>
                                                <MessageCircle className="mr-2 h-4 w-4" />
                                                <span>Feedback</span>
                                            </a>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuSub>
                                            <DropdownMenuSubTrigger>
                                                <Flag className="mr-2 h-4 w-4" />
                                                <span>Report</span>
                                            </DropdownMenuSubTrigger>
                                            <DropdownMenuPortal>
                                                <DropdownMenuSubContent>
                                                    <DropdownMenuLabel>Report this post</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    {reportReasons.map(reason => (
                                                        <DropdownMenuItem key={reason.id} onClick={() => { setSelectedReportReason(reason.id); setIsReportDialogOpen(true); }}>
                                                            <span>{reason.label}</span>
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuSubContent>
                                            </DropdownMenuPortal>
                                        </DropdownMenuSub>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </div>
                    
                    <div className="px-4 pb-4">
                        <p className="text-sm mb-4">{item.content}</p>
                        {item.mediaUrl &&
                            <div className="w-full bg-muted rounded-lg overflow-hidden aspect-video relative">
                                {item.mediaType === 'video' ? (
                                    <video src={item.mediaUrl} controls className="w-full h-full object-cover" />
                                ) : (
                                    <Image src={item.mediaUrl} alt="Feed item" fill className="object-cover" />
                                )}
                            </div>
                        }
                    </div>
                    <div className="px-4 pb-3 flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" className="flex items-center gap-1.5" onClick={() => handleLikePost(item.id)}>
                                <Heart className={cn("w-5 h-5", item.likes > 0 && "fill-destructive text-destructive")} />
                                <span>{item.likes || 0}</span>
                            </Button>
                            <CommentSheet
                                postId={item.id}
                                trigger={
                                    <Button variant="ghost" className="flex items-center gap-1.5">
                                        <MessageSquare className="w-5 h-5" />
                                        <span>{item.replies || 0}</span>
                                    </Button>
                                }
                            />
                            <Button variant="ghost" size="icon" className="flex items-center gap-1.5">
                                <Save className="w-5 h-5" />
                            </Button>
                        </div>
                            {item.likes > 70 && (
                            <Badge variant="outline">+12 new likes</Badge>
                            )}
                    </div>
                </Card>
            ))
        ) : (
            <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg font-semibold">No posts to show</p>
                <p>{feedFilter === 'following' ? "Follow some sellers to see their posts here." : "It's quiet in here. Why not create the first post?"}</p>
            </div>
        )}
      </main>
    </div>
    </>
  );
}
