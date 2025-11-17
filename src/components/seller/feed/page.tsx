
"use client";

import Link from 'next/link';
import {
  Menu,
  MoreHorizontal,
  MessageSquare,
  Package2,
  CircleUser,
  ShieldCheck,
  Edit,
  Trash2,
  Save,
  Share2,
  Flag,
  UserPlus,
  UserCheck,
  ArrowUp,
  ArrowDown,
  ShoppingBag,
  RadioTower,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useAuthActions } from '@/lib/auth';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
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
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { CreatePostForm, PostData } from '@/components/create-post-form';
import { addToCart, saveCart } from '@/lib/product-history';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { GoLiveDialog } from '@/components/go-live-dialog';
import { collection, query, orderBy, onSnapshot, Timestamp, deleteDoc, doc, updateDoc, increment, addDoc, serverTimestamp, where, getDocs, runTransaction, limit, Unsubscribe, getFirestore } from "firebase/firestore";
import { formatDistanceToNow } from 'date-fns';
import { isFollowing, toggleFollow } from '@/lib/follow-data';
import { productDetails } from '@/lib/product-data';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getSavedPosts, isPostSaved, toggleSavePost } from '@/lib/post-history';
import { CommentColumn } from '@/components/feed/comment-column';
import { useSidebar, SidebarProvider } from '@/components/ui/sidebar';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { SellerHeader } from '@/components/seller/seller-header';


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

const FeedPost = ({ 
    post, 
    onDelete, 
    onEdit, 
    onShare,
    onReport,
    onSaveToggle,
    onFollowToggle,
    onAddToCart,
    onBuyNow,
    onNotifyMe,
    isSaved,
    isFollowing: initialIsFollowing,
    currentUser,
    onCommentClick,
} : {
    post: any,
    onDelete: (post: any) => void,
    onEdit: (post: any) => void,
    onShare: (postId: string) => void,
    onReport: () => void,
    onSaveToggle: (post: any) => void,
    onFollowToggle: (targetId: string) => void,
    onAddToCart: (product: any) => void,
    onBuyNow: (product: any) => void,
    onNotifyMe: (product: any) => void;
    isSaved: boolean,
    isFollowing: boolean,
    currentUser: User | null,
    onCommentClick: (post: any) => void;
}) => {
    
    const [isFollowingState, setIsFollowingState] = useState(initialIsFollowing);

    const renderContentWithHashtags = (text: string) => {
        const parts = text.split(/(#\w+)/g);
        return parts.map((part, index) => {
            if (part.startsWith('#')) {
                return (
                    <span key={index} className="text-primary hover:underline cursor-pointer">
                       {part}
                    </span>
                );
            }
            return part;
        });
    };

    const isOwnPost = currentUser?.uid === post.sellerId;


    return (
        <Dialog>
            <Collapsible>
            <Card className={cn("border-x-0 border-t-0 rounded-none shadow-none bg-transparent")}>
                 <div className="p-4 pb-0">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <Link href={`/seller/profile?userId=${post.sellerId}`} className="group flex-shrink-0">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={post.avatarUrl} />
                                    <AvatarFallback>{post.sellerName.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </Link>
                            <div className="flex-grow">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Link href={`/seller/profile?userId=${post.sellerId}`} className="group">
                                        <span className="font-semibold group-hover:underline">{post.sellerName}</span>
                                    </Link>
                                    {!isOwnPost && (
                                        <Button
                                            variant={isFollowingState ? "outline" : "secondary"}
                                            size="sm"
                                            className="h-7 w-7 p-0 sm:w-auto sm:px-2 text-xs"
                                            onClick={() => {
                                                onFollowToggle(post.sellerId);
                                                setIsFollowingState(prev => !prev);
                                            }}
                                        >
                                            {isFollowingState ? <UserCheck className="h-4 w-4 sm:mr-1.5" /> : <UserPlus className="h-4 w-4 sm:mr-1.5" />}
                                            <span className="hidden sm:inline">{isFollowingState ? "Following" : "Follow"}</span>
                                        </Button>
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground font-normal">
                                    {post.timestamp}
                                </div>
                            </div>
                        </div>
                         <div className="flex items-center gap-2">
                             {post.taggedProducts && post.taggedProducts.length > 0 && (
                                <CollapsibleTrigger asChild>
                                    <Button variant="secondary" size="sm" className="h-7 w-7 p-0 sm:w-auto sm:px-2 text-xs">
                                        <ShoppingBag className="w-4 h-4 sm:mr-1"/>
                                        <span className="hidden sm:inline">View Products</span>
                                    </Button>
                                </CollapsibleTrigger>
                            )}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {isOwnPost && (
                                        <>
                                            <DropdownMenuItem onSelect={() => onEdit(post)}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>This will permanently delete your post.</AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => onDelete(post)}>Delete</AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                            <DropdownMenuSeparator />
                                        </>
                                    )}
                                    <DropdownMenuItem onClick={() => onSaveToggle(post)}>
                                        <Save className={cn("mr-2 h-4 w-4", isSaved && "fill-current")} /> {isSaved ? 'Unsave' : 'Save'}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => onShare(post.id)}><Share2 className="mr-2 h-4 w-4" /> Share</DropdownMenuItem>
                                    <DropdownMenuItem onSelect={onReport}><Flag className="mr-2 h-4 w-4" /> Report</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                <div className="px-4 pt-3">
                     <CollapsibleContent>
                        {post.taggedProducts && post.taggedProducts.length > 0 && (
                            <Card className="mb-3">
                                <CardContent className="p-3 divide-y">
                                    {post.taggedProducts.map((product: any, index: number) => (
                                        <div key={product.key || index} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                                            <Link href={`/product/${product.key}`}>
                                                <Image src={product.image?.preview || product.images?.[0] || 'https://placehold.co/60x60.png'} alt={product.name} width={60} height={60} className="rounded-md" />
                                            </Link>
                                            <div className="flex-grow">
                                                <Link href={`/product/${product.key}`} className="hover:underline">
                                                    <h4 className="font-semibold text-sm">{product.name}</h4>
                                                </Link>
                                                <p className="font-bold text-lg">{product.price}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {product.stock > 0 ? `Stock: ${product.stock}` : <span className="text-destructive font-semibold">Out of Stock</span>}
                                                </p>
                                            </div>
                                             <div className="flex items-center gap-2">
                                                 {product.stock > 0 ? (
                                                    <>
                                                        <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => onAddToCart(product)}>
                                                            <ShoppingBag className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="sm" className="h-9" onClick={() => onBuyNow(product)}>
                                                            Buy Now
                                                        </Button>
                                                    </>
                                                 ) : (
                                                     <Button size="sm" className="h-9" onClick={() => onNotifyMe(product)}>
                                                        Notify Me
                                                    </Button>
                                                 )}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}
                    </CollapsibleContent>
                </div>
                    
                <div className="px-4">
                     <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {renderContentWithHashtags(post.content)}
                    </div>
                </div>

                {post.images && post.images.length > 0 && (
                    <div className="px-4 pt-4">
                         <div
                            className={cn(
                                "grid gap-1 rounded-lg overflow-hidden",
                                post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
                            )}
                        >
                            {post.images.slice(0, 4).map((image: any, index: number) => (
                                <div
                                    key={image.id || index}
                                    className={cn(
                                    "cursor-pointer relative group bg-muted",
                                    post.images.length === 1 ? "aspect-video" : "aspect-square"
                                    )}
                                >
                                    <Image
                                    src={image.url}
                                    alt={`Post image ${index + 1}`}
                                    fill
                                    className="object-cover w-full h-full"
                                    />
                                    {index === 3 && post.images.length > 4 && (
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-2xl font-bold">
                                        +{post.images.length - 4}
                                    </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                <div className="px-4 pb-4 mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" className="flex items-center gap-1.5 px-2">
                            <ArrowUp className="w-4 h-4"/>
                            <span>{post.likes || 0}</span>
                        </Button>
                        <Button variant="ghost" className="flex items-center gap-1.5 px-2">
                            <ArrowDown className="w-4 h-4"/>
                            <span>{post.downvotes || 0}</span>
                        </Button>
                    </div>
                    <Button variant="ghost" className="flex items-center gap-1.5" onClick={() => onCommentClick(post)}>
                        <MessageSquare className="w-4 h-4"/>
                        <span>{post.replies || 0} Comments</span>
                    </Button>
                </div>
            </Card>
            </Collapsible>
        </Dialog>
    )
}

function SellerFeedPage() {
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuth();
  const { signOut } = useAuthActions();
  const [feed, setFeed] = useState<any[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [postToEdit, setPostToEdit] = useState<any | null>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [selectedPostForComments, setSelectedPostForComments] = useState<any | null>(null);
  const { toast } = useToast();
  
  const userPosts = useMemo(() => {
    return feed;
  }, [feed]);

  const onFinishEditing = () => {
      setPostToEdit(null);
      setIsFormSubmitting(false);
  };
  
  const handlePostSubmit = async (postData: PostData) => {
    if ((!postData.content.trim() && (!postData.media || postData.media.length === 0)) || !user || !userData) return;
    
    setIsFormSubmitting(true);
    
    try {
        const db = getFirestore();
        if (postToEdit) {
            const postRef = doc(db, 'posts', postToEdit.id);
            await updateDoc(postRef, {
                content: postData.content,
                taggedProducts: postData.taggedProducts,
                pollOptions: postData.pollOptions || null,
                lastEditedAt: serverTimestamp(),
            });
            toast({ title: "Post Updated!", description: "Your changes have been saved." });
        } else {
            await addDoc(collection(db, "posts"), {
                content: postData.content,
                taggedProducts: postData.taggedProducts,
                pollOptions: postData.pollOptions || null,
                sellerId: user.uid,
                sellerName: userData.displayName,
                avatarUrl: userData.photoURL,
                timestamp: serverTimestamp(),
                likes: 0,
                replies: 0,
                images: [], // Images would be uploaded separately and URLs added here
            });
            toast({ title: "Post Created!", description: "Your post has been successfully shared." });
        }
    } catch (error: any) {
        console.error("Error submitting post:", error);
        toast({
            variant: 'destructive',
            title: "Submission Error",
            description: `A database error occurred: ${error.message}. This could be due to Firestore security rules.`
        });
    } finally {
        onFinishEditing();
    }
  };
  
  const handleEditPost = (post: any) => {
      setPostToEdit(post);
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setTimeout(() => {
          document.getElementById('post-form-textarea')?.focus();
      }, 100);
  };
  
  const handleDeletePost = async (post: any) => {
      if (!post || !post.id) return;
      const db = getFirestore();
      const postRef = doc(db, 'posts', post.id);

      try {
          await deleteDoc(postRef);
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

  const handleShare = (postId: string) => {
    const link = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(link);
    toast({
        title: "Link Copied!",
        description: "The post link has been copied to your clipboard.",
    });
  };

  const handleSaveToggle = (post: any) => {
    toggleSavePost(post);
    setSavedPosts(getSavedPosts());
  };

  const handleFollowToggle = async (targetId: string) => {
    if (!user) return;
    await toggleFollow(user.uid, targetId);
    // You might want to refresh some data here if needed
  };

  const handleAddToCart = (product: any) => {
    addToCart({ ...product, quantity: 1 });
    toast({
        title: "Added to Cart!",
        description: `${product.name} has been added to your cart.`
    });
  };
  
  const handleNotifyMe = (product: any) => {
      toast({
          title: "You're on the list!",
          description: `We'll notify you when ${product.name} is back in stock.`
      })
  }

  const handleBuyNow = (product: any) => {
    router.push(`/cart?buyNow=true&productId=${product.key}`);
  };
  
  useEffect(() => {
    setSavedPosts(getSavedPosts());
    const db = getFirestore();
    const postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp ? formatDistanceToNow(new Date((doc.data().timestamp as Timestamp).seconds * 1000), { addSuffix: true }) : 'just now'
        }));
        setFeed(postsData);
        setIsLoadingFeed(false);
    });
    return () => unsubscribe();
  }, []);

  if (authLoading) {
      return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  }
  
  if (!user || userData?.role !== 'seller') {
      router.push('/');
      return null;
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
       <SellerHeader />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-8 p-4 md:p-8">
            {isLoadingFeed ? (
                 <div className="space-y-4"><FeedPostSkeleton /><FeedPostSkeleton /></div>
            ) : userPosts.length > 0 ? (
                 <div className="divide-y">
                     {userPosts.map(post => (
                        <FeedPost 
                            key={post.id}
                            post={post}
                            currentUser={user}
                            onDelete={handleDeletePost}
                            onEdit={handleEditPost}
                            onShare={handleShare}
                            onReport={() => {}}
                            onSaveToggle={handleSaveToggle}
                            onFollowToggle={handleFollowToggle}
                            onAddToCart={handleAddToCart}
                            onBuyNow={handleBuyNow}
                            onNotifyMe={handleNotifyMe}
                            isSaved={isPostSaved(post.id)}
                            isFollowing={false} 
                            onCommentClick={(post) => setSelectedPostForComments(post)}
                        />
                    ))}
                 </div>
            ) : (
                <Card className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4">
                    <h3 className="text-xl font-semibold">Your Feed is Empty</h3>
                    <p>Create your first post to engage with the community!</p>
                </Card>
            )}
        </div>
      </main>
       <footer className="sticky bottom-0 p-3 bg-background/80 backdrop-blur-sm border-t z-10">
           <div className="max-w-xl mx-auto">
                <CreatePostForm
                    onPost={handlePostSubmit}
                    postToEdit={postToEdit}
                    onFinishEditing={onFinishEditing}
                    isSubmitting={isFormSubmitting}
                />
            </div>
      </footer>
      <Sheet open={!!selectedPostForComments} onOpenChange={(open) => !open && setSelectedPostForComments(null)}>
            <SheetContent className="p-0 w-full max-w-md">
                <CommentColumn post={selectedPostForComments} onClose={() => setSelectedPostForComments(null)} />
            </SheetContent>
        </Sheet>
    </div>
  );
}

export default function SellerFeedPageWrapper() {
    return (
        <SidebarProvider>
            <SellerFeedPage />
        </SidebarProvider>
    )
}

    