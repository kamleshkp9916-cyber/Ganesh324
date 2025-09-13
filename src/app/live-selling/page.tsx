

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
  List,
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
  Gavel,
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
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth.tsx';
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
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { CreatePostForm } from '@/components/create-post-form';
import { getCart } from '@/lib/product-history';
import { Dialog, DialogHeader, DialogTitle, DialogTrigger, DialogContent, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { GoLiveDialog } from '@/components/go-live-dialog';
import { collection, query, orderBy, onSnapshot, Timestamp, deleteDoc, doc, updateDoc, increment, addDoc, serverTimestamp, where, getDocs, runTransaction } from "firebase/firestore";
import { getFirestoreDb, getFirebaseStorage } from '@/lib/firebase';
import { formatDistanceToNow } from 'date-fns';
import { ref as storageRef, deleteObject } from 'firebase/storage';
import { isFollowing, toggleFollow, UserData, getUserByDisplayName } from '@/lib/follow-data';
import { productDetails } from '@/lib/product-data';
import { PromotionalCarousel } from '@/components/promotional-carousel';
import { Logo } from '@/components/logo';
import { categories } from '@/lib/categories';


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

const reportReasons = [
    { id: "spam", label: "It's spam" },
    { id: "hate", label: "Hate speech or symbols" },
    { id: "false", label: "False information" },
    { id: "bullying", label: "Bullying or harassment" },
];

const mockNotifications = [
    { id: 1, title: 'Your order has shipped!', description: 'Your Vintage Camera is on its way.', time: '15m ago', read: false, href: '/orders' },
    { id: 2, title: 'Flash Sale Alert!', description: 'GadgetGuru is having a 50% off flash sale now!', time: '1h ago', read: false, href: '/seller/profile?userId=GadgetGuru' },
    { id: 3, title: 'New message from HomeHaven', description: '"Yes, the blue vases are back in stock!"', time: '4h ago', read: true, href: '/message' },
];

function LiveSellerSkeleton() {
    return (
        <div className="group relative rounded-lg overflow-hidden shadow-lg">
            <Skeleton className="w-full aspect-[2/3]" />
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div>
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-3 w-16" />
                    </div>
                </div>
            </div>
        </div>
    );
}

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
                timestamp: doc.data().timestamp ? formatDistanceToNow(new Date((doc.data().timestamp as Timestamp).seconds * 1000), { addSuffix: true }) : 'just now'
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

        // Also increment the replies count on the post
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
                <DialogFooter className="p-4 border-t">
                    <form onSubmit={handlePostComment} className="w-full flex items-center gap-2">
                        <Input 
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                        />
                        <Button type="submit" disabled={!newComment.trim()}><Send className="w-4 h-4" /></Button>
                    </form>
                </DialogFooter>
            </SheetContent>
        </Sheet>
    )
}

export default function LiveSellingPage() {
  const [isLoadingSellers, setIsLoadingSellers] = useState(true);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const { user, userData, loading: authLoading } = useAuth();
  const { signOut } = useAuthActions();
  const [feed, setFeed] = useState<any[]>([]);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState("");
  const { toast } = useToast();
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [suggestedUsers, setSuggestedUsers] = useState<UserData[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);
  const createPostFormRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [allSellers, setAllSellers] = useState(liveSellers);
  const [notifications, setNotifications] = useState(mockNotifications);
  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  const [activeLiveFilter, setActiveLiveFilter] = useState('All');
  const [cartCount, setCartCount] = useState(0);
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [feedFilter, setFeedFilter] = useState('global');
  const [userPosts, setUserPosts] = useState<any[]>([]);

  const liveStreamFilterButtons = useMemo(() => {
    const categories = new Set(allSellers.map(s => s.category));
    return ['All', ...Array.from(categories)];
  }, [allSellers]);
  
  const loadData = useCallback(() => {
    if (typeof window !== 'undefined') {
        setCartCount(getCart().reduce((sum, item) => sum + item.quantity, 0));
        
        const liveStreamDataRaw = localStorage.getItem('liveStream');
        if (liveStreamDataRaw) {
            try {
                const liveStreamData = JSON.parse(liveStreamDataRaw);
                const newSellerCard = {
                    id: liveStreamData.seller.uid,
                    name: liveStreamData.seller.name,
                    avatarUrl: liveStreamData.seller.photoURL || 'https://placehold.co/40x40.png',
                    thumbnailUrl: liveStreamData.product?.image?.preview || 'https://placehold.co/300x450.png',
                    category: liveStreamData.product?.category || 'General',
                    viewers: Math.floor(Math.random() * 5000),
                    buyers: Math.floor(Math.random() * 100),
                    rating: 4.5,
                    reviews: Math.floor(Math.random() * 50),
                    hint: liveStreamData.product?.name?.toLowerCase() || 'live stream',
                    productId: liveStreamData.product?.id,
                    isMyStream: true,
                    hasAuction: liveStreamData.isAuction,
                };
                setAllSellers(currentSellers => {
                    const existingSellers = currentSellers.filter(s => s.id !== newSellerCard.id);
                    return [newSellerCard, ...existingSellers];
                });
            } catch (error) {
                console.error("Error parsing live stream data from localStorage", error);
            }
        } else {
            setAllSellers(currentSellers => currentSellers.filter(s => !s.isMyStream));
        }
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const trendingTopics = useMemo(() => {
    const hashtagCounts: { [key: string]: number } = {};
    feed.forEach(post => {
      const hashtags = post.content.match(/#\w+/g) || [];
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

  const mostReachedPosts = useMemo(() => {
    return [...feed].sort((a, b) => (b.likes + b.replies) - (a.likes + a.replies)).slice(0, 5);
  }, [feed]);

 useEffect(() => {
    if (!isMounted) return;

    const sellersTimer = setTimeout(() => setIsLoadingSellers(false), 1000);

    const db = getFirestoreDb();
    let postsQuery;

    if (activeTab === 'feeds') {
      setIsLoadingFeed(true);
      if (feedFilter === 'following' && user) {
        if (followingIds.length > 0) {
          postsQuery = query(collection(db, "posts"), where("sellerId", "in", followingIds), orderBy("timestamp", "desc"));
        } else {
          setFeed([]);
          setUserPosts([]);
          setIsLoadingFeed(false);
          return () => clearTimeout(sellersTimer);
        }
      } else {
        postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
      }
      
      const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp ? formatDistanceToNow(new Date((doc.data().timestamp as Timestamp).seconds * 1000), { addSuffix: true }) : 'just now'
        }));
        setFeed(postsData);
        if(user) {
          const userSpecificPosts = postsData.filter(p => p.sellerId === user.uid);
          setUserPosts(userSpecificPosts);
        }
        setIsLoadingFeed(false);
      });
      
      return () => {
        clearTimeout(sellersTimer);
        unsubscribe();
      };
    } else {
      postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
       const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
        const postsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp ? formatDistanceToNow(new Date((doc.data().timestamp as Timestamp).seconds * 1000), { addSuffix: true }) : 'just now'
        }));
        setFeed(postsData);
      });
      setIsLoadingFeed(false);
      return () => {
        clearTimeout(sellersTimer);
        unsubscribe();
      }
    }
  }, [isMounted, activeTab, feedFilter, user, followingIds]);
  
   useEffect(() => {
    if (isMounted) {
      loadData();
      
      const handleStorageChange = (event: StorageEvent) => {
          if (event.key === 'liveStream' || event.key === 'streamcart_cart' || event.key === null) {
              loadData();
          }
      };
      window.addEventListener('storage', handleStorageChange);

      return () => {
          window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [isMounted, loadData]);
  
  const handleFollowToggle = async (targetId: string) => {
    if (!user) {
        handleAuthAction();
        return;
    }
    await toggleFollow(user.uid, targetId);
    setFollowingIds(prev =>
      prev.includes(targetId) ? prev.filter(id => id !== targetId) : [...prev, targetId]
    );
  };
  
   useEffect(() => {
    const checkFollowing = async () => {
        if (!user) return;
        const promises = suggestedUsers.map(u => isFollowing(user.uid, u.uid));
        const results = await Promise.all(promises);
        const following = suggestedUsers.filter((u, index) => results[index]);
        setFollowingIds(following.map(u => u.uid));
    };

    if (suggestedUsers.length > 0) {
        checkFollowing();
    }
  }, [user, suggestedUsers]);

  const handleAuthAction = (cb?: () => void) => {
    if (!user) {
        setIsAuthDialogOpen(true);
        return false;
    }
    if (cb) cb();
    return true;
  };

  const topLiveStreams = useMemo(() => {
    let sellers = [...allSellers];
     if (searchTerm) {
        sellers = sellers.filter(seller => 
            seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seller.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }
    return sellers.sort((a, b) => b.viewers - a.viewers).slice(0, 8);
  }, [allSellers, searchTerm]);

  const filteredLiveSellers = useMemo(() => {
    let sellers = [...allSellers];

    if (activeLiveFilter !== 'All') {
        sellers = sellers.filter(seller => seller.category === activeLiveFilter);
    }
    
    if (searchTerm) {
        sellers = sellers.filter(seller => 
            seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            seller.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    return sellers;
  }, [searchTerm, allSellers, activeLiveFilter]);

  const filteredFeed = useMemo(() => {
    if (!searchTerm) return feed;
    return feed.filter(item => 
        item.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, feed]);

  const productCategories = useMemo(() => {
    const categories = new Set(Object.values(productDetails).map(p => p.category));
    return ['All', ...Array.from(categories)];
  }, []);

  const filteredProducts = useMemo(() => {
    let products = liveSellers.map(seller => {
        const product = productDetails[seller.productId as keyof typeof productDetails];
        return { ...seller, product };
    }).filter(item => item && item.product);

    if (productCategoryFilter !== 'All') {
      products = products.filter(item => item?.product.category === productCategoryFilter);
    }

    if (searchTerm) {
        products = products.filter(item => 
            item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.product.brand.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    return products;
  }, [productCategoryFilter, searchTerm]);
  

  const handleReply = (sellerName: string) => {
    handleAuthAction(() => {
      setReplyTo(sellerName);
      if (createPostFormRef.current) {
        createPostFormRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    });
  };

  const handleShare = (postId: number) => {
    const link = `${window.location.origin}/post/${postId}`;
    navigator.clipboard.writeText(link);
    toast({
        title: "Link Copied!",
        description: "The post link has been copied to your clipboard.",
    });
  };

  const submitReport = () => {
    handleAuthAction(() => {
        console.log("Submitting report for reason:", selectedReportReason);
        toast({
            title: "Report Submitted",
            description: "Thank you for your feedback. We will review this post.",
        });
        setIsReportDialogOpen(false);
        setSelectedReportReason("");
    });
  };
  
  const handleProductCategorySelect = (category: string) => {
    setProductCategoryFilter(category);
  };
  
  const handleLiveFilterSelect = (filter: string) => {
    setActiveLiveFilter(filter);
    setActiveTab('live');
  };
  
  const markAsRead = (id: number) => {
    setNotifications(current => current.map(n => n.id === id ? { ...n, read: true } : n));
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
    if (!handleAuthAction()) return;

    const db = getFirestoreDb();
    const postRef = doc(db, 'posts', postId);
    const likeRef = doc(db, `posts/${postId}/likes`, user!.uid);

    try {
        await runTransaction(db, async (transaction) => {
            const likeDoc = await transaction.get(likeRef);
            if (likeDoc.exists()) {
                // User has already liked, so unlike
                transaction.delete(likeRef);
                transaction.update(postRef, { likes: increment(-1) });
            } else {
                // User has not liked, so like
                transaction.set(likeRef, { likedAt: serverTimestamp() });
                transaction.update(postRef, { likes: increment(1) });
            }
        });
    } catch (error) {
        console.error("Error toggling like:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not update like status. Please try again."
        });
    }
};

  const getCategoryUrl = (categoryName: string) => `/${categoryName.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
        <AlertDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Authentication Required</AlertDialogTitle>
                    <AlertDialogDescription>
                        You need to be logged in to perform this action. Please log in or create an account to continue.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => router.push('/signup')}>Create Account</AlertDialogAction>
                    <AlertDialogAction onClick={() => router.push('/')}>Login</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
             <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                     <div className="flex items-center gap-1 sm:gap-2">
                         <Link href="/live-selling" className="flex items-center gap-2 -ml-2">
                             <Logo className="h-7 w-7" />
                             <span className="font-bold text-lg hidden sm:inline-block">StreamCart</span>
                         </Link>
                    </div>

                    <div className="flex-1 flex justify-center px-4">
                         <div className={cn("relative transition-all duration-300 w-full max-w-sm sm:max-w-md lg:max-w-lg", isSearchOpen ? "w-full" : "w-auto")}>
                                <Input 
                                placeholder="Search..." 
                                className={cn("rounded-full bg-muted h-10 pl-10 peer")}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground peer-focus:text-foreground")}/>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-1 sm:gap-2">
                         <Button variant="ghost" className="hidden sm:inline-flex" asChild>
                            <Link href="/listed-products">
                                <ShoppingBag className="mr-2 h-4 w-4"/>
                                Products
                            </Link>
                        </Button>
                        
                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" size="icon" className="relative">
                                    <Bell className="h-5 w-5" />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                        </span>
                                    )}
                                </Button>
                            </DropdownMenuTrigger>
                             <DropdownMenuContent align="end" className="w-80">
                                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {notifications.map(n => (
                                    <Link key={n.id} href={n.href} passHref>
                                        <DropdownMenuItem className={cn("flex-col items-start gap-1", !n.read && "bg-primary/5")} onSelect={() => markAsRead(n.id)}>
                                            <div className="flex justify-between w-full">
                                                <p className={cn("font-semibold", !n.read && "text-primary")}>{n.title}</p>
                                                <p className="text-xs text-muted-foreground">{n.time}</p>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{n.description}</p>
                                        </DropdownMenuItem>
                                    </Link>
                                ))}
                                {notifications.length === 0 && (
                                    <p className="text-center text-sm text-muted-foreground p-4">No new notifications.</p>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                     <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'}/>
                                        <AvatarFallback>{user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User/>}</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            {user && userData ? (
                                <DropdownMenuContent align="end" className="w-64">
                                    <DropdownMenuLabel>
                                        <div>{userData?.displayName}</div>
                                        <div className="text-xs text-muted-foreground font-normal">{userData?.email}</div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                     {userData?.role === 'admin' && (
                                        <DropdownMenuItem onSelect={() => router.push('/admin/dashboard')}>
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            <span>Admin Dashboard</span>
                                        </DropdownMenuItem>
                                    )}
                                    {(userData?.role === 'seller') && (
                                        <DropdownMenuItem onSelect={() => router.push('/seller/dashboard')}>
                                            <LayoutDashboard className="mr-2 h-4 w-4" />
                                            <span>Seller Dashboard</span>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onSelect={() => router.push('/profile')}>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>My Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => router.push('/orders')}>
                                        <Package className="mr-2 h-4 w-4" />
                                        <span>My Orders</span>
                                    </DropdownMenuItem>
                                     <DropdownMenuItem onSelect={() => router.push('/wishlist')}>
                                        <Heart className="mr-2 h-4 w-4" />
                                        <span>My Wishlist</span>
                                    </DropdownMenuItem>
                                     <DropdownMenuItem onSelect={() => router.push('/cart')}>
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        <span>My Cart</span>
                                         {cartCount > 0 && <Badge variant="destructive" className="ml-auto">{cartCount}</Badge>}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => router.push('/wallet')}>
                                        <Wallet className="mr-2 h-4 w-4" />
                                        <span>My Wallet</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                     <DropdownMenuItem onSelect={() => router.push('/setting')}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Settings</span>
                                    </DropdownMenuItem>
                                     <DropdownMenuItem onSelect={() => router.push('/help')}>
                                        <LifeBuoy className="mr-2 h-4 w-4" />
                                        <span>Help</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => router.push('/privacy-and-security')}>
                                        <Shield className="mr-2 h-4 w-4" />
                                        <span>Privacy & Security</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuSub>
                                        <DropdownMenuSubTrigger>
                                            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 mr-2" />
                                            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 mr-2" />
                                            <span>Theme</span>
                                        </DropdownMenuSubTrigger>
                                        <DropdownMenuPortal>
                                            <DropdownMenuSubContent>
                                                <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
                                            </DropdownMenuSubContent>
                                        </DropdownMenuPortal>
                                    </DropdownMenuSub>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => signOut(userData?.role === 'seller')}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            ) : (
                                 <DropdownMenuContent align="end">
                                    <DropdownMenuItem onSelect={() => router.push('/')}>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Login or Sign Up</span>
                                    </DropdownMenuItem>
                                 </DropdownMenuContent>
                            )}
                        </DropdownMenu>
                        
                        {(userData?.role === 'seller' || userData?.role === 'admin') && (
                             <Dialog>
                                <DialogTrigger asChild>
                                    <Button size="sm" className="hidden lg:flex">
                                        <RadioTower className="mr-2 h-4 w-4"/> Go Live
                                    </Button>
                                </DialogTrigger>
                                <GoLiveDialog />
                            </Dialog>
                        )}
                    </div>
                </div>
            </header>
            
            <div className="bg-background border-b sticky top-16 z-40">
                 <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <TabsList className="p-1.5 h-auto rounded-full bg-muted">
                        <TabsTrigger value="all" className="rounded-full px-4 py-1.5 text-sm font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">All</TabsTrigger>
                        <TabsTrigger value="live" className="rounded-full px-4 py-1.5 text-sm font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Live Shopping</TabsTrigger>
                        <TabsTrigger value="feeds" className="rounded-full px-4 py-1.5 text-sm font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">Feeds</TabsTrigger>
                    </TabsList>
                </div>
            </div>
                 
                 {activeTab !== 'feeds' && (
                     <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                         <PromotionalCarousel />
                     </div>
                 )}
                
                <div className="pb-20">
                    <TabsContent value="all" className="space-y-8 mt-0">
                    <section>
                            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-4">
                                <h2 className="text-2xl font-bold flex items-center gap-2"><Flame className="text-primary" /> Top Live Streams</h2>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 md:gap-4 px-2 md:px-4">
                                {topLiveStreams.map((seller: any) => (
                                <div key={seller.id} className="group relative rounded-lg overflow-hidden shadow-lg">
                                    <div className="absolute top-2 left-2 z-10"><Badge variant="destructive">LIVE</Badge></div>
                                    <div className="absolute top-2 right-2 z-10"><Badge variant="secondary" className="bg-background/60 backdrop-blur-sm"><Users className="w-3 h-3 mr-1.5" />{seller.viewers}</Badge></div>
                                    <Link href={`/stream/${seller.id}`} className="cursor-pointer">
                                        <Image 
                                            src={seller.thumbnailUrl} 
                                            alt={`Live stream from ${seller.name}`} 
                                            width={300} 
                                            height={450} 
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            data-ai-hint={seller.hint}
                                        />
                                    </Link>
                                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                        <div className="flex items-start gap-2">
                                            <Link href={`/seller/profile?userId=${seller.name}`} onClick={(e) => e.stopPropagation()} className="relative z-20">
                                                <Avatar className="h-8 w-8 border-2 border-primary"><AvatarImage src={seller.avatarUrl} alt={seller.name} /><AvatarFallback>{seller.name.charAt(0)}</AvatarFallback></Avatar>
                                            </Link>
                                            <div className="flex-1">
                                                <Link href={`/seller/profile?userId=${seller.name}`} onClick={(e) => e.stopPropagation()} className="relative z-20 hover:underline"><h3 className="font-semibold text-sm text-primary-foreground truncate">{seller.name}</h3></Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            </div>
                        </section>
                        
                        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                             <h2 className="text-2xl font-bold flex items-center gap-2 mb-4"><Star className="text-primary" /> Popular Products</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-4">
                                {filteredProducts.map((item: any) => {
                                    if (!item || !item.product) return null;
                                    const { product } = item;
                                    return (
                                        <Card key={product.key} className="group relative rounded-lg overflow-hidden shadow-lg">
                                            <Link href={`/product/${product.key}`} className="cursor-pointer">
                                                <div className="overflow-hidden">
                                                    <Image 
                                                        src={item.thumbnailUrl.replace('450', '300')} 
                                                        alt={`Product from ${item.name}`} 
                                                        width={300} 
                                                        height={300} 
                                                        className="w-full h-full object-cover aspect-square transition-transform duration-300 group-hover:scale-105"
                                                        data-ai-hint={item.hint}
                                                    />
                                                </div>
                                                <div className="p-3">
                                                    <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                                                    <p className="font-bold text-lg">{product.price}</p>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                        <div className="flex items-center gap-1 text-amber-500">
                                                            <Star className="h-4 w-4 fill-current"/>
                                                            <span>{item.rating}</span>
                                                        </div>
                                                        <span>({item.buyers} buyers)</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        </Card>
                                    );
                                })}
                            </div>
                        </section>
                        <section className="mt-8">
                            <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-4">
                                 <h2 className="text-2xl font-bold flex items-center gap-2"><TrendingUp className="text-primary" /> Most Reached Posts</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 px-4 sm:px-6 lg:px-8">
                                {mostReachedPosts.map(post => (
                                     <Card key={post.id} className="overflow-hidden flex flex-col">
                                        <div className="p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={post.avatarUrl} alt={post.sellerName} />
                                                        <AvatarFallback>{post.sellerName.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-grow">
                                                        <p className="font-semibold text-primary">{post.sellerName}</p>
                                                        <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 -mr-2 -mt-2">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onSelect={() => handleShare(post.id)}>
                                                            <Share2 className="mr-2 h-4 w-4" />
                                                            <span>Share</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onSelect={submitReport}>
                                                            <Flag className="mr-2 h-4 w-4" />
                                                            <span>Report</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                            <p className="text-sm line-clamp-2">{post.content}</p>
                                        </div>
                                        <div className="mt-auto px-4 pb-3 flex justify-between items-center text-sm text-muted-foreground">
                                            <div className="flex items-center gap-4">
                                                <button className="flex items-center gap-1.5 hover:text-primary">
                                                    <Heart className="w-4 h-4" />
                                                    <span>{post.likes || 0}</span>
                                                </button>
                                                <button className="flex items-center gap-1.5 hover:text-primary">
                                                    <MessageSquare className="w-4 h-4" />
                                                    <span>{post.replies || 0}</span>
                                                </button>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    </TabsContent>

                    <TabsContent value="live" className="mt-0">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                            <div className="flex flex-wrap gap-2 mb-6">
                                {liveStreamFilterButtons.map((filter) => (
                                <Button 
                                    key={filter} 
                                    variant={activeLiveFilter === filter ? 'default' : 'outline'} 
                                    size="sm" 
                                    className="bg-card/50 rounded-full text-xs md:text-sm h-8 md:h-9"
                                    onClick={() => setActiveLiveFilter(filter)}
                                >
                                    {filter}
                                </Button>
                                ))}
                                <Button variant="ghost" size="sm" className="bg-card/50 rounded-full text-xs md:text-sm h-8 md:h-9">
                                    Filters
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </div>

                            {isLoadingSellers ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {Array.from({ length: 12 }).map((_, index) => (
                                        <LiveSellerSkeleton key={index} />
                                    ))}
                                </div>
                            ) : filteredLiveSellers.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                    {filteredLiveSellers.map((seller: any) => (
                                        <div key={seller.id} className="group relative rounded-lg overflow-hidden shadow-lg">
                                            <div className="absolute top-2 left-2 z-10">
                                                <Badge variant="destructive">
                                                    LIVE
                                                </Badge>
                                            </div>
                                            {seller.isMyStream && (
                                                <div className="absolute top-10 left-2 z-10">
                                                    <Badge variant="secondary" className="bg-purple text-purple-foreground">
                                                        Your Stream
                                                    </Badge>
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2 z-10">
                                                <Badge variant="secondary" className="bg-background/60 backdrop-blur-sm">
                                                    <Users className="w-3 h-3 mr-1.5" />
                                                    {seller.viewers}
                                                </Badge>
                                            </div>

                                            <Link href={`/stream/${seller.id}`} className="cursor-pointer">
                                                <Image 
                                                    src={seller.thumbnailUrl} 
                                                    alt={`Live stream from ${seller.name}`} 
                                                    width={300} 
                                                    height={450} 
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    data-ai-hint={seller.hint}
                                                />
                                            </Link>
                                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                                <div className="flex items-start gap-2">
                                                    <Link href={`/seller/profile?userId=${seller.name}`} onClick={(e) => e.stopPropagation()} className="relative z-20">
                                                        <Avatar className="h-8 w-8 border-2 border-primary">
                                                            <AvatarImage src={seller.avatarUrl} alt={seller.name} />
                                                            <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                    </Link>
                                                    <div className="flex-1">
                                                        <Link href={`/seller/profile?userId=${seller.name}`} onClick={(e) => e.stopPropagation()} className="relative z-20 hover:underline">
                                                            <h3 className="font-semibold text-sm text-primary-foreground truncate">{seller.name}</h3>
                                                        </Link>
                                                        {seller.hasAuction && (
                                                            <Badge variant="purple" className="mt-1">
                                                                <Gavel className="mr-1 h-3 w-3" />
                                                                Auction
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <p className="text-lg font-semibold">No results found</p>
                                    <p>Try searching for something else or changing the filter.</p>
                                </div>
                            )}
                    </div>
                    </TabsContent>

                    <TabsContent value="feeds" className="w-full mt-0">
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
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                             <div className="hidden lg:block lg:col-span-1 space-y-4 lg:sticky top-24">
                                {user && userData && (
                                    <Card>
                                        <CardContent className="p-4 space-y-3 text-center">
                                            <Avatar className="h-16 w-16 mx-auto">
                                                <AvatarImage src={userData.photoURL} alt={userData.displayName} />
                                                <AvatarFallback>{userData.displayName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-bold">{userData.displayName}</h3>
                                                <p className="text-sm text-muted-foreground">@{userData.userId?.substring(1)} • {userData.location || 'Unknown'}</p>
                                            </div>
                                            <div className="flex justify-around pt-2">
                                                <div>
                                                     <p className="font-bold">{userPosts.length}</p>
                                                    <p className="text-xs text-muted-foreground">Posts</p>
                                                </div>
                                                <div>
                                                    <p className="font-bold">4.2k</p>
                                                    <p className="text-xs text-muted-foreground">Likes</p>
                                                </div>
                                                <div>
                                                    <p className="font-bold">312</p>
                                                    <p className="text-xs text-muted-foreground">Saves</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                            <div className="lg:col-span-2 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Button variant={feedFilter === 'global' ? 'secondary' : 'ghost'} onClick={() => setFeedFilter('global')}>Global</Button>
                                    <Button variant={feedFilter === 'following' ? 'secondary' : 'ghost'} onClick={() => handleAuthAction(() => setFeedFilter('following'))}>Following</Button>
                                </div>
                            {isLoadingFeed ? (
                                <>
                                    <FeedPostSkeleton />
                                    <FeedPostSkeleton />
                                </>
                            ) : filteredFeed.length > 0 ? (
                                filteredFeed.map((item) => (
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
                                                                            <DropdownMenuItem key={reason.id} onClick={() => { handleAuthAction(() => { setSelectedReportReason(reason.id); setIsReportDialogOpen(true); }); }}>
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
                                                <Button variant="ghost" className="flex items-center gap-1.5">
                                                    <Save className="w-5 h-5" />
                                                    <span>Save</span>
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
                                    <p className="text-lg font-semibold">No results found for "{searchTerm}"</p>
                                    <p>Try searching for something else in the feed.</p>
                                </div>
                            )}
                            </div>
                            <div className="lg:col-span-1 space-y-4 lg:sticky top-24">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Hash className="h-5 w-5 text-primary"/>
                                            Trending
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {trendingTopics.map((topic, index) => (
                                            <div key={index} className="text-sm cursor-pointer group">
                                                <p className="font-semibold group-hover:underline">#{topic.topic}</p>
                                                <p className="text-xs text-muted-foreground">{topic.posts}</p>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <UserPlus className="h-5 w-5 text-primary"/>
                                            Who to follow
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {suggestedUsers.map(u => (
                                            <div key={u.id} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={u.avatar} alt={u.name} />
                                                        <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold text-sm">{u.name}</p>
                                                        <p className="text-xs text-muted-foreground">{u.handle}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    variant={followingIds.includes(u.uid) ? "outline" : "default"}
                                                    onClick={() => handleFollowToggle(u.uid)}
                                                >
                                                    {followingIds.includes(u.uid) ? 'Following' : 'Follow'}
                                                </Button>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Video className="h-5 w-5 text-primary"/>
                                            Top Live Streams
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {topLiveStreams.slice(0, 1).map((seller) => (
                                            <Link href={`/stream/${seller.id}`} key={seller.id} className="group relative cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-primary/50 transition-shadow duration-300 block">
                                                <div className="absolute top-1.5 left-1.5 z-10">
                                                    <Badge variant="destructive" className="text-xs px-1.5 py-0.5 h-auto">LIVE</Badge>
                                                </div>
                                                <div className="absolute top-1.5 right-1.5 z-10">
                                                    <Badge variant="secondary" className="bg-background/60 backdrop-blur-sm text-xs px-1.5 py-0.5 h-auto">
                                                        <Users className="w-2.5 h-2.5 mr-1" />
                                                        {(seller.viewers / 1000).toFixed(1)}k
                                                    </Badge>
                                                </div>
                                                <Image 
                                                    src={seller.thumbnailUrl} 
                                                    alt={`Live stream from ${seller.name}`} 
                                                    width={300} 
                                                    height={450} 
                                                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                                                    data-ai-hint={seller.hint}
                                                />
                                                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-8 w-8 border-2 border-primary">
                                                            <AvatarImage src={seller.avatarUrl} alt={seller.name} />
                                                            <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <h3 className="font-semibold text-sm text-primary-foreground truncate">{seller.name}</h3>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                        {user && (
                                <CreatePostForm ref={createPostFormRef} replyTo={replyTo} onClearReply={() => setReplyTo(null)} />
                            )}
                    </TabsContent>
                </div>
            <Footer />
        </Tabs>
    </div>
  );
}



