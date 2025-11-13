
"use client";

import Link from 'next/link';
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
  X,
  ArrowLeft,
  ChevronUp,
  RefreshCw, // Added RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
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
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, orderBy, onSnapshot, Timestamp, deleteDoc, doc, addDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getFirestoreDb, getFirebaseStorage } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/use-debounce';
import { CreatePostForm, PostData } from '@/components/create-post-form';
import { productDetails } from '@/lib/product-data';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { addToCart, saveCart } from '@/lib/product-history';
import { toggleSavePost, isPostSaved, getSavedPosts } from '@/lib/post-history';
import { AdminLayout } from '@/components/admin/admin-layout';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ref as storageRef, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


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

const FeedPost = ({ post, onDelete, onEdit, onSaveToggle, isSaved, currentUserId }: { post: any; onDelete: (post: any) => void; onEdit: (post: any) => void; onSaveToggle: (post: any) => void, isSaved: boolean, currentUserId: string }) => {
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
    
    const handleAddToCart = (product: any) => {
        addToCart({ ...product, quantity: 1 });
    };

    const handleBuyNow = (product: any) => {
        saveCart([{ ...product, quantity: 1 }]);
        localStorage.setItem('buyNow', 'true');
        // This would need the router, passed in or via hook
        // router.push('/cart');
    };
    
    const handleNotifyMe = (product: any) => {
        // Placeholder for notification logic
    };
    
    const isOwnPost = currentUserId === post.sellerId;

    return (
         <Collapsible>
            <Card className="w-full">
                <div className="p-4">
                    <div className="flex items-start justify-between">
                        <Link href={`/admin/users/${post.sellerId}`} className="flex items-center gap-3 group">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={post.avatarUrl} />
                                <AvatarFallback>{post.sellerName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold group-hover:underline">{post.sellerName}</span>
                                  {post.role === 'admin' && (
                                    <>
                                      <span className="text-sm text-muted-foreground">• Nipher.in</span>
                                      <Badge variant="destructive">Admin</Badge>
                                    </>
                                  )}
                                  {post.role === 'seller' && (
                                      <Badge variant="secondary">Seller</Badge>
                                  )}
                                </div>
                                <div className="text-xs text-muted-foreground">{post.timestamp}</div>
                            </div>
                        </Link>
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
                                        <DropdownMenuItem onSelect={() => onEdit(post)}>
                                            <Edit className="mr-2 h-4 w-4" /> Edit Post
                                        </DropdownMenuItem>
                                    )}
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
                                    <DropdownMenuItem onClick={() => onSaveToggle(post)}>
                                        <Save className={cn("mr-2 h-4 w-4", isSaved && "fill-current")} /> {isSaved ? 'Unsave' : 'Save'}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
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
                 <CollapsibleContent>
                    {post.taggedProducts && post.taggedProducts.length > 0 && (
                        <Card className="m-4 mt-0">
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
                                                    <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => handleAddToCart(product)}>
                                                        <ShoppingBag className="h-4 w-4" />
                                                    </Button>
                                                    <Button size="sm" className="h-9" onClick={() => handleBuyNow(product)}>
                                                        Buy Now
                                                    </Button>
                                                </>
                                             ) : (
                                                 <Button size="sm" className="h-9" onClick={() => handleNotifyMe(product)}>
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
        </Collapsible>
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
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [postToEdit, setPostToEdit] = useState<any | null>(null);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [feedTab, setFeedTab] = useState("for-you");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    if (!loading && userData?.role !== 'admin') {
      router.replace('/');
    }
  }, [user, userData, loading, router]);
  
  useEffect(() => {
    setSavedPosts(getSavedPosts());
    const handleStorageChange = () => setSavedPosts(getSavedPosts());
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setShowScrollTop(e.currentTarget.scrollTop > 300);
  };
  
  const scrollToTop = () => {
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveToggle = (post: any) => {
    toggleSavePost(post);
  };

  const isPostSavedCheck = (postId: string) => {
    return savedPosts.some(p => p.id === postId);
  };

  const fetchFeed = useCallback(() => {
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

    return unsubscribe;
  }, [toast]);

  useEffect(() => {
    const unsubscribe = fetchFeed();
    return () => unsubscribe();
  }, [fetchFeed]);

  const handleRefresh = () => {
      toast({ title: "Refreshing feed..." });
      fetchFeed();
  };
  
  const handleDeletePost = async (post: any) => {
      if (!post || !post.id) return;
      const db = getFirestoreDb();
      const postRef = doc(db, 'posts', post.id);

      try {
          // Also delete associated images from storage
          if (post.images && post.images.length > 0) {
              const storage = getFirebaseStorage();
              const deletePromises = post.images.map((image: { url: string }) => {
                   if (image.url && image.url.includes('firebasestorage.googleapis.com')) {
                       try {
                           const imageRef = storageRef(storage, image.url);
                           return deleteObject(imageRef);
                       } catch (e) {
                           console.warn("Could not create storage ref for deletion:", image.url, e);
                           return Promise.resolve();
                       }
                   }
                   return Promise.resolve();
              });
              await Promise.all(deletePromises);
          }
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
  
  const handlePostSubmit = async (postData: PostData) => {
    if ((!postData.content.trim() && (!postData.media || postData.media.length === 0)) || !user || !userData) return;
    
    setIsFormSubmitting(true);
    
    try {
        const db = getFirestoreDb();
        const dataToSave: any = {
            content: postData.content,
            taggedProducts: postData.taggedProducts,
            sellerId: user.uid,
            sellerName: "Nipher.in", // Set name to Nipher.in for admins
            avatarUrl: userData.photoURL,
            role: userData.role,
            timestamp: serverTimestamp(),
            likes: 0,
            replies: 0,
        };

        if (postData.media && postData.media.length > 0) {
            const mediaUploads = await Promise.all(
                postData.media.map(async (mediaFile) => {
                    if (!mediaFile.file) return { type: mediaFile.type, url: mediaFile.url };
                    
                    const storage = getFirebaseStorage();
                    const filePath = `posts/${user.uid}/${Date.now()}_${mediaFile.file.name}`;
                    const fileRef = storageRef(storage, filePath);
                    
                    await uploadString(fileRef, mediaFile.url, 'data_url');
                    const downloadURL = await getDownloadURL(fileRef);
                    
                    return { type: mediaFile.type, url: downloadURL };
                })
            );
            
            dataToSave.images = mediaUploads.filter(m => m?.type === 'image');
        }

        if (postToEdit) {
            const postRef = doc(db, 'posts', postToEdit.id);
            await updateDoc(postRef, dataToSave);
            toast({ title: "Post Updated!", description: "Your changes have been saved." });
        } else {
            await addDoc(collection(db, "posts"), dataToSave);
            toast({ title: "Post Created!", description: "Your post has been successfully shared." });
        }
    } catch (error: any) {
        console.error("Error submitting post:", error);
        toast({
            variant: 'destructive',
            title: "Submission Error",
            description: `A database error occurred: ${error.message}.`
        });
    } finally {
        setIsFormSubmitting(false);
        onFinishEditing();
    }
  };
  
  const onFinishEditing = () => {
    setPostToEdit(null);
  };
  
  const handleEditPost = (post: any) => {
      setPostToEdit(post);
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
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <div className="p-4 border-b flex flex-col gap-4 sticky top-0 bg-background z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Global Feed</h1>
             <Tabs defaultValue="for-you" value={feedTab} onValueChange={setFeedTab} className="w-auto">
                <TabsList>
                    <TabsTrigger value="for-you">For You</TabsTrigger>
                    <TabsTrigger value="following">Following</TabsTrigger>
                </TabsList>
             </Tabs>
             <div className="relative ml-auto flex items-center gap-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                placeholder="Search posts or users..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
                 <Button variant="outline" size="icon" onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4" />
                    <span className="sr-only">Refresh feed</span>
                </Button>
            </div>
          </div>
          <CreatePostForm
            onPost={handlePostSubmit}
            postToEdit={postToEdit}
            onFinishEditing={onFinishEditing}
            isSubmitting={isFormSubmitting}
            showTagProduct={false}
          />
        </div>
        <ScrollArea className="flex-grow" onScroll={handleScroll} ref={scrollAreaRef}>
            <div className="max-w-2xl mx-auto space-y-4 py-6 px-4">
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
                    onEdit={handleEditPost}
                    onSaveToggle={handleSaveToggle}
                    isSaved={isPostSavedCheck(post.id)}
                    currentUserId={user!.uid}
                />
                ))
            ) : (
                <div className="text-center py-20 text-muted-foreground">
                No posts found.
                </div>
            )}
            </div>
        </ScrollArea>
        {showScrollTop && (
          <Button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg"
            size="icon"
          >
            <ChevronUp className="h-6 w-6" />
          </Button>
        )}
      </main>
    </AdminLayout>
  );
}

    

    

    

    