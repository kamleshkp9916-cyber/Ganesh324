
"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Star, ThumbsUp, ThumbsDown, MessageSquare, ShoppingCart, ShieldCheck, Heart, Share2, Truck, Tag, Banknote, Ticket, ChevronDown, RotateCcw, Sparkles, CheckCircle, Users, HelpCircle, Send, Image as ImageIcon, Edit, Trash2, Flag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { addRecentlyViewed, addToCart, addToWishlist, isWishlisted, Product, isProductInCart, getRecentlyViewed } from '@/lib/product-history';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { format, addDays, parse, differenceInDays } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import { productDetails } from '@/lib/product-data';
import { getReviews, Review, updateReview, deleteReview } from '@/lib/review-data';
import { useAuth } from '@/hooks/use-auth.tsx';
import { ReviewDialog } from './delivery-info-client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { getFirestoreDb } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';


const mockQandA = [
    { id: 1, question: "Does this camera come with a roll of film?", questioner: "Alice", answer: "Yes, it comes with one 24-exposure roll of color film to get you started!", answerer: "GadgetGuru" },
    { id: 2, question: "Is the battery for the light meter included?", questioner: "Bob", answer: "It is! We include a fresh battery so you can start shooting right away.", answerer: "GadgetGuru" },
    { id: 3, question: "What is the warranty on this?", questioner: "Charlie", answer: "We offer a 6-month warranty on all our refurbished vintage cameras.", answerer: "GadgetGuru" },
    { id: 4, question: "Can you ship this to the UK?", questioner: "Diana", answer: null, answerer: null },
    { id: 5, question: "Is the camera strap original?", questioner: "Eve", answer: "This one comes with a new, high-quality leather strap, not the original.", answerer: "GadgetGuru" },
];

const mockAdminOffers = [
    { icon: <Ticket className="h-5 w-5 text-primary" />, title: "Special Price", description: "Get this for ₹11,000 using the code VINTAGE10" },
    { icon: <Banknote className="h-5 w-5 text-primary" />, title: "Bank Offer", description: "10% Instant Discount on HDFC Bank Credit Card" },
];

const productToSellerMapping: { [key: string]: { name: string; avatarUrl: string, uid: string } } = {
    'prod_1': { name: 'FashionFinds', avatarUrl: 'https://placehold.co/80x80.png', uid: 'fashionfinds-uid' },
    'prod_2': { name: 'GadgetGuru', avatarUrl: 'https://placehold.co/80x80.png', uid: 'gadgetguru-uid' },
    'prod_3': { name: 'HomeHaven', avatarUrl: 'https://placehold.co/80x80.png', uid: 'homehaven-uid' },
    'prod_4': { name: 'BeautyBox', avatarUrl: 'https://placehold.co/80x80.png', uid: 'beautybox-uid' },
    'prod_5': { name: 'KitchenWiz', avatarUrl: 'https://placehold.co/80x80.png', uid: 'kitchenwiz-uid' },
    'prod_6': { name: 'FitFlow', avatarUrl: 'https://placehold.co/80x80.png', uid: 'fitflow-uid' },
    'prod_7': { name: 'ArtisanAlley', avatarUrl: 'https://placehold.co/80x80.png', uid: 'artisanalley-uid' },
    'prod_8': { name: 'PetPalace', avatarUrl: 'https://placehold.co/80x80.png', uid: 'petpalace-uid' },
    'prod_9': { name: 'BookNook', avatarUrl: 'https://placehold.co/80x80.png', uid: 'booknook-uid' },
    'prod_10': { name: 'GamerGuild', avatarUrl: 'https://placehold.co/80x80.png', uid: 'gamerguild-uid' },
    'prod_11': { name: 'FashionFinds', avatarUrl: 'https://placehold.co/80x80.png', uid: 'fashionfinds-uid' },
    'prod_12': { name: 'FashionFinds', avatarUrl: 'https://placehold.co/80x80.png', uid: 'fashionfinds-uid' },
    'prod_13': { name: 'Modern Man', avatarUrl: 'https://placehold.co/80x80.png', uid: 'modernman-uid' },
    'prod_14': { name: 'Casual Co.', avatarUrl: 'https://placehold.co/80x80.png', uid: 'casualco-uid' },
    'prod_15': { name: 'BeautyBox', avatarUrl: 'https://placehold.co/80x80.png', uid: 'beautybox-uid' },
    'prod_16': { name: 'BeautyBox', avatarUrl: 'https://placehold.co/80x80.png', uid: 'beautybox-uid' },
    'prod_17': { name: 'BeautyBox', avatarUrl: 'https://placehold.co/80x80.png', uid: 'beautybox-uid' },
    'prod_18': { name: 'BeautyBox', avatarUrl: 'https://placehold.co/80x80.png', uid: 'beautybox-uid' },
    'prod_19': { name: 'QuickFlex', avatarUrl: 'https://placehold.co/80x80.png', uid: 'quickflex-uid' },
    'prod_20': { name: 'GentleStep', avatarUrl: 'https://placehold.co/80x80.png', uid: 'gentlestep-uid' },
    'prod_21': { name: 'SunShield', avatarUrl: 'https://placehold.co/80x80.png', uid: 'sunshield-uid' },
    'prod_22': { name: 'Aura Jewels', avatarUrl: 'https://placehold.co/80x80.png', uid: 'aurajewels-uid' },
    'prod_23': { name: 'BreezyWear', avatarUrl: 'https://placehold.co/80x80.png', uid: 'breezywear-uid' },
    'prod_24': { name: 'Elegance', avatarUrl: 'https://placehold.co/80x80.png', uid: 'elegance-uid' },
    'prod_25': { name: 'KitchenPro', avatarUrl: 'https://placehold.co/80x80.png', uid: 'kitchenpro-uid' },
    'prod_26': { name: 'CozyHome', avatarUrl: 'https://placehold.co/80x80.png', uid: 'cozyhome-uid' },
    'prod_27': { name: 'AudioBlast', avatarUrl: 'https://placehold.co/80x80.png', uid: 'audioblast-uid' },
    'prod_28': { name: 'LittleSprout', avatarUrl: 'https://placehold.co/80x80.png', uid: 'littlesprout-uid' },
    'prod_29': { name: 'StretchyPants', avatarUrl: 'https://placehold.co/80x80.png', uid: 'stretchypants-uid' },
};

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

export function ProductDetailClient({ productId }: { productId: string }) {
    const router = useRouter();
    const { user } = useAuth();
    const [product, setProduct] = useState<any>(null);
    const { toast } = useToast();
    const [wishlisted, setWishlisted] = useState(false);
    const [inCart, setInCart] = useState(false);
    const [pincode, setPincode] = useState("");
    const [isDeliverable, setIsDeliverable] = useState<boolean | null>(null);
    const [checkingPincode, setCheckingPincode] = useState(false);
    const [newQuestion, setNewQuestion] = useState("");
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
    const [editingReview, setEditingReview] = useState<Review | undefined>(undefined);
    const [taggedPosts, setTaggedPosts] = useState<any[]>([]);
    const [recentlyViewedItems, setRecentlyViewedItems] = useState<Product[]>([]);
    const [sellerProducts, setSellerProducts] = useState<any[]>([]);

    const averageRating = useMemo(() => {
        if (reviews.length === 0) return '0.0';
        const total = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (total / reviews.length).toFixed(1);
    }, [reviews]);
    
    const relatedStreams = useMemo(() => {
        if (!product) return [];
        let streams = liveSellers.filter(
            s => s.category === product.category && s.productId !== product.key
        );
         if (streams.length > 50) {
            return streams.slice(0, 51);
        }
        // Fallback to show some streams if none match the category, excluding the current one
        const fallbackStreams = liveSellers.filter(s => s.productId !== product.key);
        
        // Add from fallback until we have 6 total, avoiding duplicates
        let i = 0;
        while(streams.length < 6 && i < fallbackStreams.length) {
            if (!streams.some(s => s.id === fallbackStreams[i].id)) {
                streams.push(fallbackStreams[i]);
            }
            i++;
        }
        return streams.slice(0,51);
    }, [product]);

    const estimatedDeliveryDate = useMemo(() => {
        const today = new Date();
        const deliveryDate = addDays(today, 5);
        return format(deliveryDate, 'E, MMM dd');
    }, []);

    const fetchReviews = () => {
        if (product) {
            setReviews(getReviews(product.key));
        }
    };
    
    useEffect(() => {
        const details = productDetails[productId as keyof typeof productDetails] || null;
        setProduct(details);
    }, [productId]);

    useEffect(() => {
        const fetchTaggedPosts = async () => {
            if (!product) return;
            try {
                const db = getFirestoreDb();
                const postsRef = collection(db, "posts");
                // The query requires an index. Since we can't create one, we'll remove the ordering.
                const q = query(postsRef, where("taggedProducts.key", "==", product.key));
                const querySnapshot = await getDocs(q);
                const postsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    timestamp: doc.data().timestamp ? formatDistanceToNow(new Date((doc.data().timestamp).seconds * 1000), { addSuffix: true }) : 'just now'
                }));
                setTaggedPosts(postsData);
            } catch (error) {
                console.error("Error fetching tagged posts:", error);
            }
        };
        
        const productsKey = `sellerProducts_${productToSellerMapping[productId]?.name}`;
        const storedProducts = localStorage.getItem(productsKey);
        if (storedProducts) {
            setSellerProducts(JSON.parse(storedProducts));
        }

        if (product) {
            document.title = product.name;
            const productForHistory: Product = {
                id: product.id,
                key: product.key,
                name: product.name,
                price: product.price,
                imageUrl: product.images[0],
                hint: product.hint,
                brand: product.brand,
                category: product.category,
            };
            addRecentlyViewed(productForHistory);
            setWishlisted(isWishlisted(product.id));
            setInCart(isProductInCart(product.id));
            setRecentlyViewedItems(getRecentlyViewed().filter(p => p.id !== product.id)); // Exclude current product
            fetchReviews();
            fetchTaggedPosts();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [product, productId]);


    const handlePincodeCheck = () => {
        if (pincode.length !== 6) {
            toast({ variant: "destructive", title: "Invalid Pincode", description: "Please enter a valid 6-digit pincode." });
            return;
        }
        setCheckingPincode(true);
        setTimeout(() => {
            setIsDeliverable(true);
            setCheckingPincode(false);
        }, 1000);
    };

    const handleAddToCart = () => {
        if (product) {
            const productForCart: Product = {
                id: product.id,
                key: product.key,
                name: product.name,
                price: product.price,
                imageUrl: product.images[0],
                hint: product.hint,
                brand: product.brand,
                category: product.category,
            };
            addToCart({ ...productForCart, quantity: 1 });
            setInCart(true);
            toast({
                title: "Added to Cart!",
                description: `${product.name} has been added to your shopping cart.`,
            });
        }
    };
    
    const handleWishlistToggle = () => {
        if (product) {
            const productForWishlist: Product = {
                id: product.id,
                key: product.key,
                name: product.name,
                price: product.price,
                imageUrl: product.images[0],
                hint: product.hint,
                brand: product.brand,
                category: product.category,
            };
            addToWishlist(productForWishlist);
            const newWishlistedState = isWishlisted(product.id);
            setWishlisted(newWishlistedState);
            toast({
                title: newWishlistedState ? "Added to Wishlist" : "Removed from Wishlist",
                description: `${product.name} has been ${newWishlistedState ? 'added to' : 'removed from'} your wishlist.`,
            });
        }
    };
    
    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({
            title: "Link Copied!",
            description: "Product link copied to clipboard.",
        });
    };

    const handleReportProduct = () => {
        toast({
            title: "Product Reported",
            description: "Thank you for your feedback. Our moderation team will review this product shortly.",
        });
    };
    
    const handleBuyNow = () => {
        if (product) {
            router.push(`/cart?buyNow=true&productId=${product.key}`);
        }
    };
    
    const handleAskQuestion = () => {
        if (newQuestion.trim()) {
            console.log("New question:", newQuestion);
            toast({
                title: "Question Submitted!",
                description: "Your question has been sent to the seller. You will be notified when they answer.",
            });
            setNewQuestion("");
        }
    };

    const handleReviewSubmit = (review: Review) => {
        if (!product || !user) {
            toast({ variant: 'destructive', title: "Error", description: "You must be logged in to submit a review." });
            return;
        }
        if (editingReview) {
             updateReview(product.key, review);
             toast({
                title: "Review Updated!",
                description: "Thank you for updating your feedback.",
            });
        } else {
             addReview(product.key, review);
             toast({
                title: "Review Submitted!",
                description: "Thank you for your feedback. It is now visible on the product page.",
            });
        }
        fetchReviews(); // Re-fetch to show updated list
    };

    const handleEditReview = (review: Review) => {
        setEditingReview(review);
        setIsReviewDialogOpen(true);
    };

    const handleDeleteReview = (reviewId: number) => {
        if (!product) return;
        deleteReview(product.key, reviewId);
        toast({ title: "Review Deleted", description: "Your review has been removed." });
        fetchReviews();
    };

    const openReviewDialog = () => {
        if (!user) {
            toast({ variant: 'destructive', title: 'Login Required', description: 'You must be logged in to write a review.' });
            return;
        }
        const userHasReviewed = reviews.some(r => r.userId === user.uid);
        if(userHasReviewed) {
             toast({ variant: 'destructive', title: 'Already Reviewed', description: 'You have already submitted a review for this product.' });
             return;
        }
        setEditingReview(undefined);
        setIsReviewDialogOpen(true);
    };

    if (!product) {
        return (
             <div className="flex flex-col h-screen items-center justify-center text-center p-4">
                 <div className="w-full max-w-sm mx-auto">
                    
                 </div>
                <h2 className="text-2xl font-semibold mt-4">Product not found</h2>
                <p className="text-muted-foreground">This product may have been removed or is unavailable.</p>
                <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
            </div>
        );
    }

    const seller = productToSellerMapping[product.key];
    
    const productSpecificDetails = [
        { label: 'Brand', value: product.brand },
        { label: 'Category', value: product.category },
        { label: 'Model Number', value: (product as any).modelNumber },
        { label: 'Color', value: (product as any).color },
        { label: 'Size', value: (product as any).size },
        { label: 'Country of Origin', value: (product as any).origin },
    ].filter(detail => detail.value);

    const productHighlights = product.highlights ? product.highlights.split('\\n').filter(h => h.trim() !== '') : [];

    return (
        <div className="min-h-screen bg-background">
            <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold truncate">{product.name}</h1>
                <div className="w-10"></div>
            </header>

            <main className="container mx-auto py-6">
                <Card>
                    <CardContent className="p-4 md:p-6">
                         <div className="flex flex-col gap-8">
                            {/* Main Product Info Section */}
                            <div className="flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-sm font-medium text-primary mb-1">{product.brand}</p>
                                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{product.name}</h1>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="secondary">{product.key}</Badge>
                                             {reviews.length > 0 && (
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1">
                                                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                                        <span className="font-semibold text-sm">{averageRating}</span>
                                                    </div>
                                                    <span className="text-muted-foreground text-sm">({reviews.length} reviews)</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <Button variant="ghost" size="icon" onClick={handleWishlistToggle}>
                                            <Heart className={cn("h-6 w-6", wishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
                                        </Button>
                                         <Button variant="ghost" size="icon" onClick={handleShare}>
                                            <Share2 className="h-6 w-6" />
                                        </Button>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-foreground">{product.price}</p>
                                    <p className="text-sm text-muted-foreground">(inclusive of all taxes)</p>
                                </div>
                                {product.offer?.title && (
                                    <Card className="bg-primary/10 border-primary/20">
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Ticket className="h-5 w-5 text-primary" />
                                                {product.offer.title}
                                            </CardTitle>
                                            <CardDescription>{product.offer.description}</CardDescription>
                                        </CardHeader>
                                    </Card>
                                )}
                                <p className="text-muted-foreground">{product.description}</p>
                                <div className="flex flex-col gap-2">
                                    {inCart ? (
                                        <Button asChild size="lg" className="w-full">
                                            <Link href="/cart">
                                                <ShoppingCart className="mr-2 h-5 w-5" />
                                                Go to Cart
                                            </Link>
                                        </Button>
                                    ) : (
                                        <Button size="lg" className="w-full" onClick={handleAddToCart}>
                                            <ShoppingCart className="mr-2 h-5 w-5" />
                                            Add to Cart
                                        </Button>
                                    )}
                                    <Button size="lg" className="w-full" variant="secondary" onClick={handleBuyNow}>
                                        Buy Now
                                    </Button>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground pt-4">
                                    <Link href="/help" className="flex flex-col items-center gap-1 hover:text-primary">
                                        <RotateCcw className="h-6 w-6" />
                                        <span>7-Day Return Policy</span>
                                    </Link>
                                    <Link href="/help" className="flex flex-col items-center gap-1 hover:text-primary">
                                        <Banknote className="h-6 w-6" />
                                        <span>Pay on Delivery</span>
                                    </Link>
                                    <Link href="/help" className="flex flex-col items-center gap-1 hover:text-primary">
                                        <ShieldCheck className="h-6 w-6" />
                                        <span>100% Genuine</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Details and highlights sections... */}
                            <div className="mt-8 space-y-6">
                                {/* Delivery Section */}
                                <div className="py-4 border-t">
                                     <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="font-semibold mb-2">Delivery</h3>
                                            <div className="flex items-center gap-2 mt-2">
                                                <Input
                                                    placeholder="Enter Pincode"
                                                    maxLength={6}
                                                    className="max-w-[150px]"
                                                    value={pincode}
                                                    onChange={(e) => setPincode(e.target.value.replace(/\\D/g, ''))}
                                                />
                                                <Button variant="link" className="p-0 h-auto" onClick={handlePincodeCheck} disabled={checkingPincode}>
                                                    {checkingPincode ? <LoadingSpinner className="h-4 w-4" /> : "Check"}
                                                </Button>
                                            </div>
                                            {isDeliverable === true ? (
                                                <p className="text-sm text-green-600 mt-2">Yay! Delivery is available to this pincode.</p>
                                            ) : isDeliverable === false ? (
                                                    <p className="text-sm text-destructive mt-2">Sorry, delivery is not available to this pincode.</p>
                                            ) : (
                                                    <p className="text-xs text-muted-foreground mt-2">Check if we can deliver to your location.</p>
                                            )}
                                        </div>
                                        <div className="text-sm">
                                                <div className="flex items-center gap-3">
                                                <Truck className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                                <div>
                                                    <p className="font-semibold">Get it by {estimatedDeliveryDate}</p>
                                                    <p className="text-xs text-muted-foreground">Standard Delivery</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
