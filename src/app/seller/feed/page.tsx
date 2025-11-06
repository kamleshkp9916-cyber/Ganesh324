
"use client";

import Link from 'next/link';
import {
  Clapperboard,
  Home,
  Bookmark,
  Heart,
  Star,
  Zap,
  ChevronDown,
  Bell,
  Plus,
  Settings,
  Users,
  Menu,
  User,
  Award,
  MessageSquare,
  Shield,
  FileText,
  LifeBuoy,
  Wallet,
  ShoppingBag,
  LogOut,
  MoreHorizontal,
  Flag,
  Share2,
  MessageCircle,
  Clipboard,
  Hash,
  UserPlus,
  Video,
  Globe,
  File,
  X,
  ShoppingCart,
  Moon,
  Sun,
  Search,
  LayoutDashboard,
  Repeat,
  Laptop,
  Briefcase,
  RadioTower,
  Trash2,
  Send,
  ArrowUp,
  ArrowDown,
  Tv,
  Tags,
  Flame,
  TrendingUp,
  Save,
  Package,
  List,
  Sparkles,
  Edit,
  UserCheck,
  ArrowLeft,
  Package2,
} from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { useAuthActions } from '@/lib/auth';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuPortal } from '@/components/ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { ScrollArea } from '@/components/ui/scroll-area';
import { Footer } from '@/components/footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from "@/hooks/use-toast";
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
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { CreatePostForm, PostData } from '@/components/create-post-form';
import { getCart, addToCart, saveCart } from '@/lib/product-history';
import { Dialog, DialogHeader, DialogTitle, DialogTrigger, DialogContent, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { GoLiveDialog } from '@/components/go-live-dialog';
import { collection, query, orderBy, onSnapshot, Timestamp, deleteDoc, doc, updateDoc, increment, addDoc, serverTimestamp, where, getDocs, runTransaction, limit, Unsubscribe } from "firebase/firestore";
import { getFirestoreDb, getFirebaseStorage } from '@/lib/firebase';
import { format, formatDistanceToNow, formatDistanceToNowStrict, isThisWeek, isThisYear } from 'date-fns';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import { isFollowing, toggleFollow, UserData, getUserByDisplayName, getFollowing, getOrCreateConversation } from '@/lib/follow-data';
import { productDetails } from '@/lib/product-data';
import { PromotionalCarousel } from '@/components/promotional-carousel';
import { Logo } from '@/components/logo';
import { categories } from '@/lib/categories';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useIsMobile } from '@/hooks/use-mobile';
import { getSavedPosts, isPostSaved, toggleSavePost } from '@/lib/post-history';
import { useDebounce } from '@/hooks/use-debounce';
import { Highlight } from '@/components/highlight';
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from '@/components/ui/popover';
import { CommentColumn } from '@/components/feed/comment-column';
import { MainSidebar } from '@/components/main-sidebar';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';

const liveSellersData = [
    { id: '1', name: 'FashionFinds', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Fashion', viewers: 1200, buyers: 25, rating: 4.8, reviews: 12, hint: 'woman posing stylish outfit', productId: 'prod_1' },
    { id: '2', name: 'GadgetGuru', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', category: 'Electronics', viewers: 2500, buyers: 42, rating: 4.9, reviews: 28, hint: 'unboxing new phone', productId: 'prod_2' },
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
                                                            <ShoppingCart className="h-4 w-4" />
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
                                <DialogTrigger key={image.id || index} asChild>
                                <div
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
                                </DialogTrigger>
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
  const [feed, setFeed] = useState<any[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [postToEdit, setPostToEdit] = useState<any | null>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [savedPosts, setSavedPosts] = useState<any[]>([]);
  const [selectedPostForComments, setSelectedPostForComments] = useState<any | null>(null);
  const { toast } = useToast();

  const userPosts = useMemo(() => {
    if (!user) return [];
    return feed.filter(post => post.sellerId === user.uid);
  }, [feed, user]);

  const onFinishEditing = () => {
      setPostToEdit(null);
      setIsFormSubmitting(false);
  };
  
  const handlePostSubmit = async (postData: PostData) => {
    if ((!postData.content.trim() && (!postData.media || postData.media.length === 0)) || !user || !userData) return;
    
    setIsFormSubmitting(true);
    
    try {
        if (postToEdit) {
            const db = getFirestoreDb();
            const postRef = doc(db, 'posts', postToEdit.id);
            
            const dataToUpdate: any = {
                content: postData.content,
                taggedProducts: postData.taggedProducts
            };
            
            await updateDoc(postRef, dataToUpdate);
            toast({ title: "Post Updated!", description: "Your changes have been saved." });
            
        } else {
            const db = getFirestoreDb();
            const dataToSave: any = {
                content: postData.content,
                taggedProducts: postData.taggedProducts,
                sellerId: user.uid,
                sellerName: userData.displayName,
                avatarUrl: userData.photoURL,
                timestamp: serverTimestamp(),
                likes: 0,
                replies: 0,
                images: [],
            };
            await addDoc(collection(db, "posts"), dataToSave);
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
  };
  
  const handleDeletePost = async (post: any) => {
      if (!post || !post.id) return;
      const db = getFirestoreDb();
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
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
       <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 py-4">
            <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                <Link href="/seller/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base"><Package2 className="h-6 w-6" /><span className="sr-only">Seller</span></Link>
                <Link href="/seller/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">Dashboard</Link>
                <Link href="/seller/orders" className="text-muted-foreground transition-colors hover:text-foreground">Orders</Link>
                <Link href="/seller/products" className="text-muted-foreground transition-colors hover:text-foreground">Products</Link>
                <Link href="/seller/promotions" className="text-muted-foreground transition-colors hover:text-foreground">Promotions</Link>
                <Link href="/seller/feed" className="text-foreground transition-colors hover:text-foreground">Feed</Link>
            </nav>
            <Sheet>
                <SheetTrigger asChild><Button variant="outline" size="icon" className="shrink-0 md:hidden"><Menu className="h-5 w-5" /></Button></SheetTrigger>
                <SheetContent side="left">
                     <nav className="grid gap-6 text-lg font-medium">
                        <Link href="/seller/dashboard" className="flex items-center gap-2 text-lg font-semibold"><Package2 className="h-6 w-6" /><span>Seller Panel</span></Link>
                        <Link href="/seller/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
                        <Link href="/seller/orders" className="text-muted-foreground hover:text-foreground">Orders</Link>
                        <Link href="/seller/products" className="text-muted-foreground hover:text-foreground">Products</Link>
                        <Link href="/seller/promotions" className="text-muted-foreground hover:text-foreground">Promotions</Link>
                        <Link href="/seller/feed" className="hover:text-foreground">Feed</Link>
                    </nav>
                </SheetContent>
            </Sheet>
        </header>

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-xl mx-auto space-y-8">
            <CreatePostForm
                onPost={handlePostSubmit}
                postToEdit={postToEdit}
                onFinishEditing={onFinishEditing}
                isSubmitting={isFormSubmitting}
            />
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
                            isFollowing={false} // A seller can't follow themselves
                            onCommentClick={(post) => setSelectedPostForComments(post)}
                        />
                    ))}
                 </div>
            ) : (
                <Card className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4">
                    <h3 className="text-xl font-semibold">Your Feed is Empty</h3>
                    <p>Create your first post above to engage with your followers!</p>
                </Card>
            )}
        </div>
      </main>
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
