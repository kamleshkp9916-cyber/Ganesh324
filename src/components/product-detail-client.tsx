
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
import { ScrollArea } from './ui/scroll-area';
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
    'prod_1': { name: 'FashionFinds', avatarUrl: 'https://placehold.co/80x80.png', uid: 'FashionFinds' },
    'prod_2': { name: 'GadgetGuru', avatarUrl: 'https://placehold.co/80x80.png', uid: 'GadgetGuru' },
    'prod_3': { name: 'HomeHaven', avatarUrl: 'https://placehold.co/80x80.png', uid: 'HomeHaven' },
    'prod_4': { name: 'BeautyBox', avatarUrl: 'https://placehold.co/80x80.png', uid: 'BeautyBox' },
    'prod_5': { name: 'KitchenWiz', avatarUrl: 'https://placehold.co/80x80.png', uid: 'KitchenWiz' },
    'prod_6': { name: 'FitFlow', avatarUrl: 'https://placehold.co/80x80.png', uid: 'FitFlow' },
    'prod_7': { name: 'ArtisanAlley', avatarUrl: 'https://placehold.co/80x80.png', uid: 'ArtisanAlley' },
    'prod_8': { name: 'PetPalace', avatarUrl: 'https://placehold.co/80x80.png', uid: 'PetPalace' },
    'prod_9': { name: 'BookNook', avatarUrl: 'https://placehold.co/80x80.png', uid: 'BookNook' },
    'prod_10': { name: 'GamerGuild', avatarUrl: 'https://placehold.co/80x80.png', uid: 'GamerGuild' },
};

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


export function ProductDetailClient({ productId }: { productId: string }) {
    const router = useRouter();
    const { user } = useAuth();
    const [product, setProduct] = useState<any>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
        if (streams.length > 5) {
            return streams.slice(0, 6);
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
        return streams.slice(0,6);
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
                const q = query(postsRef, where("taggedProduct.id", "==", product.id), orderBy("timestamp", "desc"));
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

        if (product) {
            setSelectedImage(product.images[0]);
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
    }, [product]);


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
        if (review.id) { // Editing existing review
            updateReview(product.key, review);
            toast({ title: "Review Updated!", description: "Your review has been successfully updated." });
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
             <div className="flex flex-col h-screen items-center justify-center">
                <p className="text-2xl font-semibold mb-4">Product Not Found</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    const seller = productToSellerMapping[product.key];
    const sellerProducts = Object.values(productDetails)
        .filter(p => productToSellerMapping[p.key]?.name === seller.name && p.id !== product.id)
        .slice(0, 10);

    const relatedProducts = Object.values(productDetails).filter(
        p => p.category === product.category && p.id !== product.id
    ).slice(0, 10);

    const productSpecificDetails = [
        { label: 'Brand', value: product.brand },
        { label: 'Category', value: product.category },
        { label: 'Model Number', value: (product as any).modelNumber },
        { label: 'Color', value: (product as any).color },
        { label: 'Size', value: (product as any).size },
        { label: 'Country of Origin', value: (product as any).origin },
    ].filter(detail => detail.value);

    const productHighlights = product.highlights ? product.highlights.split('\n').filter(h => h.trim() !== '') : [];

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
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Product Image Gallery */}
                    <div className="flex flex-col-reverse md:flex-row gap-4">
                         <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 md:pr-2 no-scrollbar md:max-h-[500px]">
                           {product.images.map((img: string, index: number) => (
                               <div 
                                    key={index}
                                    className={cn(
                                        "w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2",
                                        selectedImage === img ? "border-primary" : "border-transparent"
                                    )}
                                    onClick={() => setSelectedImage(img)}
                               >
                                   <Image src={img} alt={`${product.name} thumbnail ${index + 1}`} width={100} height={100} className="object-cover w-full h-full" />
                               </div>
                           ))}
                        </div>
                        <div className="flex-1 aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center relative">
                            {selectedImage && <Image src={selectedImage} alt={product.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover w-full h-full" data-ai-hint={product.hint} />}
                            <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
                                 <Button
                                    size="icon"
                                    variant="secondary"
                                    className={cn("h-10 w-10 rounded-full", wishlisted && "bg-destructive text-destructive-foreground hover:bg-destructive/90")}
                                    onClick={handleWishlistToggle}
                                >
                                    <Heart className={cn("h-5 w-5", wishlisted && "fill-current")} />
                                </Button>
                                 <Button
                                    size="icon"
                                    variant="secondary"
                                    className="h-10 w-10 rounded-full"
                                    onClick={handleShare}
                                >
                                    <Share2 className="h-5 w-5" />
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            size="icon"
                                            variant="secondary"
                                            className="h-10 w-10 rounded-full"
                                        >
                                            <Flag className="h-5 w-5" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Report this product?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                If this product violates our community guidelines or seems suspicious, please report it. Our team will review it shortly.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleReportProduct}>Report Product</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col gap-4">
                        <div>
                             <p className="text-sm font-medium text-primary mb-1">{product.brand}</p>
                            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">{product.name}</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary">{product.key}</Badge>
                            </div>
                            {reviews.length > 0 && (
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={cn("h-5 w-5", Number(averageRating) > i ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
                                        ))}
                                    </div>
                                    <span className="text-muted-foreground text-sm">({averageRating} based on {reviews.length} reviews)</span>
                                </div>
                            )}
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
                </div>

                <div className="mt-8 space-y-6">
                     <div className="py-4 border-y">
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="font-semibold mb-2">Delivery</h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <Input
                                        placeholder="Enter Pincode"
                                        maxLength={6}
                                        className="max-w-[150px]"
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
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
                    
                    <Collapsible>
                        <CollapsibleTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                                View Available Offers
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                             <Card className="mt-2">
                                <CardHeader>
                                    <CardTitle className="text-lg">Available Offers</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {mockAdminOffers.map((offer, index) => (
                                        <div key={index} className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-1">{offer.icon}</div>
                                            <div>
                                                <h5 className="font-semibold">{offer.title}</h5>
                                                <p className="text-sm text-muted-foreground">{offer.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </CollapsibleContent>
                    </Collapsible>

                     <div className="py-4 border-t">
                        <CardHeader className="p-0">
                            <CardTitle className="text-lg">Product Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 pt-4">
                            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                {productSpecificDetails.map(detail => (
                                     <React.Fragment key={detail.label}>
                                        <dt className="text-muted-foreground">{detail.label}</dt>
                                        <dd className="font-medium">{detail.value}</dd>
                                    </React.Fragment>
                                ))}
                            </dl>
                        </CardContent>
                    </div>
                     <div className="py-4 border-t">
                        <CardHeader className="p-0">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-primary"/> Product Highlights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 pt-4 grid md:grid-cols-2 gap-4">
                             {productHighlights.length > 0 && (
                                <ul className="list-disc list-inside text-muted-foreground space-y-2 text-sm my-auto">
                                    {productHighlights.map((highlight: string, index: number) => (
                                        <li key={index}>{highlight}</li>
                                    ))}
                                </ul>
                            )}
                            {product.images.length > 1 && (
                                 <div className="aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer group">
                                     <Image src={product.images[1]} alt={`${product.name} highlight`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                                 </div>
                            )}
                        </CardContent>
                    </div>
                </div>

                {/* Seller Info Section */}
                 <div className="mt-8 py-4 border-t">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <Link href={`/seller/profile?userId=${seller.name}`} className="flex items-center gap-3 group">
                                    <Avatar>
                                        <AvatarImage src={seller.avatarUrl} alt={seller.name} />
                                        <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Sold by</p>
                                        <h4 className="font-semibold group-hover:underline">{seller.name}</h4>
                                    </div>
                                </Link>
                                <Button asChild variant="outline">
                                    <Link href={`/seller/profile?userId=${seller.name}`}>
                                        View Profile
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <h5 className="font-semibold text-sm mb-2">More from this seller</h5>
                             <div className="relative">
                                <ScrollArea>
                                    <div className="flex gap-4 pb-4">
                                        {sellerProducts.map(p => (
                                            <Link href={`/product/${p.key}`} key={p.id} className="w-32 flex-shrink-0">
                                                <Card className="overflow-hidden group">
                                                    <div className="aspect-square bg-muted relative">
                                                        <Image src={p.images[0]} alt={p.name} fill sizes="128px" className="object-cover group-hover:scale-105 transition-transform" data-ai-hint={p.hint} />
                                                    </div>
                                                    <div className="p-3">
                                                        <h4 className="font-semibold text-xs truncate">{p.name}</h4>
                                                        <p className="text-foreground text-sm font-bold">{p.price}</p>
                                                    </div>
                                                </Card>
                                            </Link>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </CardContent>
                    </Card>
                </div>


                {/* Q&A Section */}
                <div className="mt-8 py-4 border-t">
                    <CardHeader className="p-0 mb-4">
                        <CardTitle>Questions & Answers</CardTitle>
                    </CardHeader>
                    <div className="space-y-6">
                        {mockQandA.slice(0, 4).map(qna => (
                            <div key={qna.id} className="text-sm">
                                <div className="flex items-center gap-2 font-semibold">
                                    <HelpCircle className="w-4 h-4 text-primary" />
                                    <p>{qna.question}</p>
                                </div>
                                <div className="flex items-start gap-2 mt-2 pl-6">
                                    <Avatar className="w-5 h-5 mt-1">
                                        <AvatarFallback className="text-xs">S</AvatarFallback>
                                    </Avatar>
                                    {qna.answer ? (
                                        <p className="text-muted-foreground">{qna.answer}</p>
                                    ) : (
                                        <p className="text-muted-foreground italic">The seller has not answered this question yet.</p>
                                    )}
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-between items-center mt-6">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant="link">View all questions</Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
                                    <DialogHeader>
                                        <DialogTitle>All Questions & Answers</DialogTitle>
                                        <DialogDescription>Find answers to your questions or ask a new one.</DialogDescription>
                                    </DialogHeader>
                                    <div className="flex-grow overflow-hidden">
                                        <ScrollArea className="h-full pr-6">
                                            <div className="space-y-6">
                                                {mockQandA.map(qna => (
                                                    <div key={qna.id} className="text-sm">
                                                        <div className="flex items-center gap-2 font-semibold">
                                                            <HelpCircle className="w-4 h-4 text-primary" />
                                                            <p>{qna.question}</p>
                                                        </div>
                                                        <div className="flex items-start gap-2 mt-2 pl-6">
                                                             <Avatar className="w-5 h-5 mt-1">
                                                                <AvatarFallback className="text-xs">S</AvatarFallback>
                                                            </Avatar>
                                                            {qna.answer ? (
                                                                <p className="text-muted-foreground">{qna.answer}</p>
                                                            ) : (
                                                                <p className="text-muted-foreground italic">Not answered yet.</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </div>
                                    <div className="mt-auto pt-4 border-t">
                                        <h4 className="font-semibold mb-2">Ask a Question</h4>
                                        <div className="flex gap-2">
                                            <Textarea placeholder="Type your question here..." value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} />
                                            <Button onClick={handleAskQuestion}>Ask</Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                            
                        </div>
                    </div>
                </div>

                 {/* Reviews Section */}
                <div className="mt-8 py-4 border-t">
                     <div className="mb-4 flex items-center justify-between">
                        <CardTitle>Ratings & Reviews</CardTitle>
                        <Button variant="outline" onClick={openReviewDialog}>Write a Review</Button>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center justify-center gap-2 p-6 bg-muted rounded-lg">
                            <h2 className="text-5xl font-bold">{averageRating}</h2>
                            <div className="flex items-center gap-1">
                                 {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={cn("h-6 w-6", Number(averageRating) > i ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground">Based on {reviews.length} reviews</p>
                        </div>
                        <div className="md:col-span-2 space-y-6">
                           {reviews.map(review => (
                                <div key={review.id} className="flex gap-4">
                                    <Avatar>
                                        <AvatarImage src={review.avatar} alt={review.author} />
                                        <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-grow">
                                        <div className="flex items-center justify-between">
                                            <h5 className="font-semibold">{review.author}</h5>
                                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(review.date), { addSuffix: true })}</p>
                                        </div>
                                         <div className="flex items-center gap-1 mt-1">
                                             {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={cn("h-4 w-4", i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
                                            ))}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">{review.text}</p>
                                        {review.imageUrl && (
                                            <Image src={review.imageUrl} alt="Review image" width={80} height={80} className="mt-2 rounded-md object-cover" />
                                        )}
                                        <div className="flex items-center gap-4 mt-3 text-muted-foreground">
                                            <button className="flex items-center gap-1.5 text-xs hover:text-primary">
                                                <ThumbsUp className="w-4 h-4" />
                                                Helpful (12)
                                            </button>
                                             <button className="flex items-center gap-1.5 text-xs hover:text-destructive">
                                                <ThumbsDown className="w-4 h-4" />
                                                Report
                                            </button>
                                            {user && user.uid === review.userId && (
                                                <div className="ml-auto flex items-center gap-2">
                                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditReview(review)}>
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Review?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete this review? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => handleDeleteReview(review.id)}>Delete</AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                           ))}
                           {reviews.length === 0 && <p className="text-center text-muted-foreground py-8">No reviews yet. Be the first to write one!</p>}
                        </div>
                    </div>
                </div>

                {/* Related Streams Section */}
                {relatedStreams.length > 0 && (
                    <div className="mt-8 py-4 border-t">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold">Related Live Streams</h3>
                            <Button asChild variant="link">
                                <Link href="/live-selling">
                                    More
                                </Link>
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
                            {relatedStreams.map((stream) => (
                                <div key={stream.id} className="group relative rounded-lg overflow-hidden shadow-lg">
                                    <div className="absolute top-2 left-2 z-10"><Badge variant="destructive">LIVE</Badge></div>
                                    <div className="absolute top-2 right-2 z-10"><Badge variant="secondary" className="bg-background/60 backdrop-blur-sm"><Users className="w-3 h-3 mr-1.5" />{stream.viewers}</Badge></div>
                                    <Link href={`/stream/${stream.id}`} className="cursor-pointer">
                                        <Image
                                            src={stream.thumbnailUrl}
                                            alt={`Live stream from ${stream.name}`}
                                            width={300}
                                            height={450}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            data-ai-hint={stream.hint}
                                        />
                                    </Link>
                                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                        <div className="flex items-start gap-2">
                                            <Link href={`/seller/profile?userId=${stream.name}`} onClick={(e) => e.stopPropagation()} className="relative z-20">
                                                <Avatar className="h-8 w-8 border-2 border-primary"><AvatarImage src={stream.avatarUrl} alt={stream.name} /><AvatarFallback>{stream.name.charAt(0)}</AvatarFallback></Avatar>
                                            </Link>
                                            <div className="flex-1">
                                                <Link href={`/seller/profile?userId=${stream.name}`} onClick={(e) => e.stopPropagation()} className="relative z-20 hover:underline"><h3 className="font-semibold text-sm text-primary-foreground truncate">{stream.name}</h3></Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Recently Viewed Section */}
                {recentlyViewedItems.length > 0 && (
                    <div className="mt-8 py-4 border-t">
                        <CardHeader className="p-0 mb-4">
                            <CardTitle>Recently Viewed</CardTitle>
                        </CardHeader>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4">
                            {recentlyViewedItems.map(p => (
                                <Link href={`/product/${p.key}`} key={p.id}>
                                    <Card className="overflow-hidden group">
                                        <div className="aspect-square bg-muted relative">
                                            <Image src={p.imageUrl} alt={p.name} fill sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw" className="object-cover group-hover:scale-105 transition-transform" data-ai-hint={p.hint} />
                                        </div>
                                        <div className="p-2 sm:p-3">
                                            <h4 className="font-semibold text-xs sm:text-sm truncate">{p.name}</h4>
                                            <p className="text-foreground font-bold text-sm sm:text-base">{p.price}</p>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}


                {/* Tagged Posts Section */}
                {taggedPosts.length > 0 && (
                    <div className="mt-8 py-4 border-t">
                        <CardHeader className="p-0 mb-4">
                            <CardTitle>Related Posts</CardTitle>
                        </CardHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {taggedPosts.map(post => (
                                <Card key={post.id} className="overflow-hidden">
                                    <div className="p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarImage src={post.avatarUrl} alt={post.sellerName} />
                                                <AvatarFallback>{post.sellerName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{post.sellerName}</p>
                                                <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm line-clamp-3">{post.content}</p>
                                    </div>
                                    {post.mediaUrl && (
                                        <div className="w-full aspect-video bg-muted relative">
                                            <Image src={post.mediaUrl} alt="Post media" fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" />
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </main>
            
            <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                 <ReviewDialog
                    reviewToEdit={editingReview}
                    onReviewSubmit={handleReviewSubmit}
                    closeDialog={() => setIsReviewDialogOpen(false)}
                    user={user}
                    order={undefined}
                 />
            </Dialog>
        </div>
    );
}
