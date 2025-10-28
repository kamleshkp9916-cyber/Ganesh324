
"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Star, ThumbsUp, ThumbsDown, MessageSquare, ShoppingCart, ShieldCheck, Heart, Share2, Truck, Tag, Banknote, Ticket, ChevronDown, RotateCcw, Sparkles, CheckCircle, Users, HelpCircle, Send, Image as ImageIcon, Edit, Trash2, Flag, Play, Loader2, Package, Plus, X, Video, Search, AlertTriangle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { addRecentlyViewed, addToCart, addToWishlist, isWishlisted, Product, isProductInCart, getRecentlyViewed, getCart, saveCart } from '@/lib/product-history';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { format, addDays, parse, differenceInDays, intervalToDuration, formatDuration } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter, DialogClose } from './ui/dialog';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { Textarea } from './ui/textarea';
import { productDetails } from '@/lib/product-data';
import { getReviews, Review, updateReview, deleteReview, addReview } from '@/lib/review-data';
import { useAuth } from '@/hooks/use-auth.tsx';
import { ReviewDialog } from './delivery-info-client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { getFirestoreDb } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { Label } from './ui/label';
import { EditAddressForm } from './edit-address-form';
import { updateUserData } from '@/lib/follow-data';
import ProductSearch from '@/components/ProductSearch';
import { SimilarProductsOverlay } from './similar-products-overlay';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { FeedbackDialog } from './feedback-dialog';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { COUPONS_KEY, Coupon } from '@/app/admin/settings/page';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { ProductShelfContent } from './product-shelf-content';


const CountdownTimer = ({ expiryDate, onExpire }: { expiryDate: string | Date, onExpire: () => void }) => {
    const [timeLeft, setTimeLeft] = useState<Duration | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const expiry = new Date(expiryDate);
            const duration = intervalToDuration({ start: now, end: expiry });

            if (expiry > now) {
                setTimeLeft(duration);
            } else {
                setTimeLeft(null);
                onExpire();
                clearInterval(timer);
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [expiryDate, onExpire]);

    if (!timeLeft) {
        return null; // Or some 'Expired' message
    }

    return (
        <span className="font-mono text-destructive tracking-widest">
            {formatDuration(timeLeft, { format: ['days', 'hours', 'minutes', 'seconds'] })}
        </span>
    );
};

const mockQandA = [
    { id: 1, question: "Does this camera come with a roll of film?", questioner: "Alice", answer: "Yes, it comes with one 24-exposure roll of color film to get you started!", answerer: "GadgetGuru" },
    { id: 2, question: "Is the battery for the light meter included?", questioner: "Bob", answer: "It is! We include a fresh battery so you can start shooting right away.", answerer: "GadgetGuru" },
    { id: 3, question: "What is the warranty on this?", questioner: "Charlie", answer: "We offer a 6-month warranty on all our refurbished vintage cameras.", answerer: "GadgetGuru" },
    { id: 4, question: "Can you ship this to the UK?", questioner: "Diana", answer: null, answerer: null },
    { id: 5, question: "Is the camera strap original?", questioner: "Eve", answer: "This one comes with a new, high-quality leather strap, not the original.", answerer: "GadgetGuru" },
];

const mockAdminOffers = [
    { icon: <Ticket className="h-5 w-5 text-primary" />, title: "Special Price", description: "Get this for ₹11,000 using the code VINTAGE10", code: 'VINTAGE10' },
    { icon: <Banknote className="h-5 w-5 text-primary" />, title: "Bank Offer", description: "10% Instant Discount on HDFC Bank Credit Card", code: null },
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
    'prod_30': { name: 'Everyday', avatarUrl: 'https://placehold.co/80x80.png', uid: 'everyday-uid' },
    'prod_31': { name: 'SunChaser', avatarUrl: 'https://placehold.co/80x80.png', uid: 'sunchaser-uid' },
    'prod_32': { name: 'Elegance', avatarUrl: 'https://placehold.co/80x80.png', uid: 'elegance-uid' },
    'prod_33': { name: 'SleekFit', avatarUrl: 'https://placehold.co/80x80.png', uid: 'sleekfit-uid' }
};

const liveSellers = [
    { id: 'fashionfinds-uid', name: 'FashionFinds', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/fashion-stream/300/450', category: 'Fashion', viewers: 1200, buyers: 25, rating: 4.8, reviews: 12, hint: 'woman posing stylish outfit', productId: 'prod_1', hasAuction: true },
    { id: 'gadgetguru-uid', name: 'GadgetGuru', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/tech-stream/300/450', category: 'Electronics', viewers: 2500, buyers: 42, rating: 4.9, reviews: 28, hint: 'unboxing new phone', productId: 'prod_2', hasAuction: false },
    { id: 'homehaven-uid', name: 'HomeHaven', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/home-stream/300/450', category: 'Home Goods', viewers: 850, buyers: 15, rating: 4.7, reviews: 9, hint: 'modern living room decor', productId: 'prod_3', hasAuction: false },
    { id: 'beautybox-uid', name: 'BeautyBox', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/beauty-stream/300/450', category: 'Beauty', viewers: 3100, buyers: 78, rating: 4.9, reviews: 55, hint: 'makeup tutorial', productId: 'prod_4', hasAuction: true },
    { id: 'kitchenwiz-uid', name: 'KitchenWiz', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/kitchen-stream/300/450', category: 'Kitchenware', viewers: 975, buyers: 0, rating: 0, reviews: 0, hint: 'cooking demonstration', productId: 'prod_5', hasAuction: false },
    { id: 'fitflow-uid', name: 'FitFlow', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/fitness-stream/300/450', category: 'Fitness', viewers: 1500, buyers: 33, rating: 4.6, reviews: 18, hint: 'yoga session', productId: 'prod_6', hasAuction: false },
    { id: 'artisanalley-uid', name: 'ArtisanAlley', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/artisan-stream/300/450', category: 'Handmade', viewers: 450, buyers: 8, rating: 5.0, reviews: 6, hint: 'pottery making', productId: 'prod_7', hasAuction: true },
    { id: 'petpalace-uid', name: 'PetPalace', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/pet-stream/300/450', category: 'Pet Supplies', viewers: 1800, buyers: 50, rating: 4.8, reviews: 30, hint: 'playing with puppy', productId: 'prod_8', hasAuction: false },
    { id: 'booknook-uid', name: 'BookNook', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/book-stream/300/450', category: 'Books', viewers: 620, buyers: 12, rating: 4.9, reviews: 10, hint: 'reading book cozy', productId: 'prod_9', hasAuction: false },
    { id: 'gamerguild-uid', name: 'GamerGuild', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://picsum.photos/seed/gaming-stream/300/450', category: 'Gaming', viewers: 4200, buyers: 102, rating: 4.9, reviews: 80, hint: 'esports competition', productId: 'prod_10', hasAuction: true },
];

const mockReviews = [
    { id: 1, userId: 'user1', author: 'Ganesh', avatar: 'https://placehold.co/40x40.png?text=G', rating: 5, text: 'This camera is a dream! It takes beautiful, authentic photos and is in perfect condition. The seller was super helpful with my questions before I bought it. Highly recommend!', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=800&fit=crop' },
    { id: 2, userId: 'user2', author: 'Alex', avatar: 'https://placehold.co/40x40.png?text=A', rating: 4, text: "Really happy with this purchase. It's a bit heavier than I expected, but it feels solid and well-made. The image quality is superb for a vintage camera.", date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), imageUrl: 'https://images.unsplash.com/photo-1502920923512-3b053c00473a?w=800&h=800&fit=crop' },
    { id: 3, userId: 'user3', author: 'Priya', avatar: 'https://placehold.co/40x40.png?text=P', rating: 5, text: "Arrived faster than expected and was packaged very securely. The camera works perfectly. Can't wait to shoot my first roll of film!", date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), imageUrl: 'https://images.unsplash.com/photo-1510127034890-ba27088e2591?w=800&h=800&fit=crop' }
];

const reportReasons = [
    { value: "inaccurate", label: "Inaccurate product information" },
    { value: "prohibited", label: "Prohibited item" },
    { value: "offensive", label: "Offensive content" },
    { value: "scam", label: "Scam or fraud" },
    { value: "other", label: "Other" },
];

const ReportDialog = ({ onSubmit }: { onSubmit: (reason: string, details: string) => void }) => {
    const [reason, setReason] = useState("");
    const [details, setDetails] = useState("");

    const handleSubmit = () => {
        onSubmit(reason, details);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Report Product</DialogTitle>
                <DialogDescription>
                    Help us understand the problem. Why are you reporting this product?
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <RadioGroup value={reason} onValueChange={setReason}>
                    <div className="space-y-2">
                        {reportReasons.map(r => (
                            <div key={r.value} className="flex items-center">
                                <RadioGroupItem value={r.value} id={`report-${r.value}`} />
                                <Label htmlFor={`report-${r.value}`} className="ml-2 cursor-pointer">{r.label}</Label>
                            </div>
                        ))}
                    </div>
                </RadioGroup>
                {reason === 'other' && (
                    <Textarea 
                        placeholder="Please provide more details..." 
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                    />
                )}
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleSubmit} disabled={!reason || (reason === 'other' && !details.trim())}>Submit Report</Button>
            </DialogFooter>
        </DialogContent>
    )
};

export function ProductDetailClient({ productId }: { productId: string }) {
    const router = useRouter();
    const { user, userData } = useAuth();
    
    const { toast } = useToast();
    const [wishlisted, setWishlisted] = useState(false);
    const [inCart, setInCart] = useState(false);
    const [pincode, setPincode] = useState("");
    const [isDeliverable, setIsDeliverable] = useState<boolean | null>(null);
    const [checkingPincode, setCheckingPincode] = useState(false);
    const [newQuestion, setNewQuestion] = useState("");
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
    const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
    const [editingReview, setEditingReview] = useState<Review | undefined>(undefined);
    const [taggedPosts, setTaggedPosts] = useState<any[]>([]);
    const [recentlyViewedItems, setRecentlyViewedItems] = useState<Product[]>([]);
    const [sellerProducts, setSellerProducts] = useState<any[]>([]);
    const [isQnaDialogOpen, setIsQnaDialogOpen] = useState(false);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [cartCount, setCartCount] = useState(0);

    const [currentPrice, setCurrentPrice] = useState<string | null>(null);
    const [currentHighlights, setCurrentHighlights] = useState<string[]>([]);
    const [selectedMedia, setSelectedMedia] = useState<{type: 'image' | 'video', url: string} | null>(null);
    
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSimilarOverlay, setShowSimilarOverlay] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
    const [hasPurchased, setHasPurchased] = useState(false);
    const [activeOffer, setActiveOffer] = useState<Coupon | null>(null);
    const [isReportOpen, setIsReportOpen] = useState(false);
    
    const [allOffers] = useLocalStorage<Coupon[]>(COUPONS_KEY, []);

    const product = useMemo(() => productDetails[productId as keyof typeof productDetails] || null, [productId]);
    
    const { compareAtPrice, discountPercentage } = useMemo(() => {
        if (!product || !currentPrice) return { compareAtPrice: null, discountPercentage: null };

        const sellingPrice = parseFloat(currentPrice.replace(/[^0-9.-]+/g, ''));
        
        if (product.discountPercentage && product.discountPercentage > 0) {
            const originalPrice = sellingPrice / (1 - (product.discountPercentage / 100));
             return {
                compareAtPrice: `₹${originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                discountPercentage: product.discountPercentage
            };
        }

        return { compareAtPrice: null, discountPercentage: null };
    }, [product, currentPrice]);

    const handleOfferExpired = useCallback(() => {
        setActiveOffer(null);
        toast({
            title: "Offer Expired",
            description: "The special offer for this product has just expired.",
        });
    }, [toast]);
    
    useEffect(() => {
        const currentProduct = productDetails[productId as keyof typeof productDetails] || null;

        if (currentProduct) {
            document.title = currentProduct.name;
            const productForHistory: Product = {
                id: currentProduct.id,
                key: currentProduct.key,
                name: currentProduct.name,
                price: currentProduct.price,
                imageUrl: currentProduct.images[0],
                hint: currentProduct.hint,
                brand: currentProduct.brand,
                category: currentProduct.category,
            };
            addRecentlyViewed(productForHistory);
            setRecentlyViewedItems(getRecentlyViewed().filter(p => p.key !== currentProduct.key)); 

            setWishlisted(isWishlisted(currentProduct.id));
            const existingReviews = getReviews(currentProduct.key);
            setReviews(existingReviews.length > 0 ? existingReviews : mockReviews);

            setCurrentPrice(currentProduct.price);
            setCurrentHighlights(currentProduct.highlights ? currentProduct.highlights.split('\\\\n').filter((h:string) => h.trim() !== '') : []);
            const mediaItems = [...(currentProduct.media || []), ...currentProduct.images.map((url: string) => ({type: 'image', url: url}))];
            const uniqueMedia = Array.from(new Map(mediaItems.map(item => [item.url, item])).values());
            if(uniqueMedia.length > 0) {
                setSelectedMedia(uniqueMedia[0] as any);
            }

            if (currentProduct.availableSizes?.split(',').map((s:string) => s.trim()).length > 0) {
                setSelectedSize(currentProduct.availableSizes.split(',').map((s:string) => s.trim())[0]);
            }
            if (currentProduct.availableColors?.split(',').map((s:string) => s.trim()).length > 0) {
                setSelectedColor(currentProduct.availableColors.split(',').map((s:string) => s.trim())[0]);
            }

            const fetchTaggedPosts = async () => {
                try {
                    const db = getFirestoreDb();
                    const postsRef = collection(db, "posts");
                    const q = query(postsRef, where("taggedProducts.key", "==", currentProduct.key));
                    const querySnapshot = await getDocs(q);
                    const postsData = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        timestamp: doc.data().timestamp ? formatDistanceToNow(new Date((doc.data().timestamp as any).seconds * 1000), { addSuffix: true }) : 'just now'
                    }));
                    setTaggedPosts(postsData);
                } catch (error) {
                    console.error("Error fetching tagged posts:", error);
                }
            };
            fetchTaggedPosts();

            // Find applicable offer
            const productCategory = currentProduct.category;
            const applicableOffer = allOffers.find(offer =>
                (offer.applicableCategories?.includes('All') || (productCategory && offer.applicableCategories?.includes(productCategory))) &&
                (!offer.minOrderValue || parseFloat(currentProduct.price.replace(/[^0-9.-]+/g, '')) >= offer.minOrderValue) &&
                (!offer.expiresAt || new Date(offer.expiresAt) > new Date())
            );
            setActiveOffer(applicableOffer || null);
        }
    }, [productId, allOffers]); 

    useEffect(() => {
        if (product) {
            setInCart(isProductInCart(product.id, selectedSize || undefined, selectedColor || undefined));
        }
    }, [product, selectedSize, selectedColor, cartCount]);


    useEffect(() => {
        if (!user || !product) {
            setHasPurchased(false);
            return;
        }

        const checkPurchase = async () => {
            try {
                const db = getFirestoreDb();
                const ordersRef = collection(db, 'orders');
                const q = query(ordersRef, where('userId', '==', user.uid));
                const querySnapshot = await getDocs(q);
                
                const purchased = querySnapshot.docs.some(doc => {
                    const order = doc.data();
                    const isDelivered = order.timeline.some((t: any) => t.status === 'Delivered' && t.completed);
                    return isDelivered && order.products.some((p: any) => p.key === product.key);
                });
                
                setHasPurchased(purchased);
            } catch (error) {
                console.error("Error checking purchase history:", error);
            }
        };

        checkPurchase();
    }, [user, product]);
    
    useEffect(() => {
      setShowSearchResults(false);
      setSearchQuery('');
      setSearchResults([]);
    }, [productId]);

    const availableSizes = useMemo(() => product?.availableSizes ? product.availableSizes.split(',').map((s: string) => s.trim()) : [], [product]);
    const availableColors = useMemo(() => product?.availableColors ? product.availableColors.split(',').map((s: string) => s.trim()) : [], [product]);

    const variantStock = useMemo(() => {
        if (!product || !product.variants || product.variants.length === 0) {
            return product?.stock;
        }
        const variant = product.variants.find((v: any) => 
            (!v.size || v.size === selectedSize) && 
            (!v.color || v.color === selectedColor)
        );
        return variant ? variant.stock : 0;
    }, [product, selectedSize, selectedColor]);
    
     useEffect(() => {
        if (product?.variants?.length > 0) {
            const variant = product.variants.find((v: any) => 
                (v.size ? v.size === selectedSize : true) && 
                (v.color ? v.color === selectedColor : true)
            );
            if (variant) {
                if (variant.price) setCurrentPrice(`₹${''}${variant.price.toFixed(2)}`);
                else setCurrentPrice(product.price);

                if (variant.image?.preview) setSelectedMedia({ type: 'image', url: variant.image.preview });
                else setSelectedMedia({ type: 'image', url: product.images[0] });
                
                if (variant.highlights) setCurrentHighlights(variant.highlights.split('\\\\n').filter((h: string) => h.trim() !== ''));
                else setCurrentHighlights(product.highlights ? product.highlights.split('\\\\n').filter((h:string) => h.trim() !== '') : []);

            } else {
                 setCurrentPrice(product.price);
                 setSelectedMedia({ type: 'image', url: product.images[0] });
                 setCurrentHighlights(product.highlights ? product.highlights.split('\\\\n').filter((h:string) => h.trim() !== '') : []);
            }
        }
    }, [selectedSize, selectedColor, product]);

     useEffect(() => {
        const updateCartCount = () => {
            if (typeof window !== 'undefined') {
                const items = getCart();
                const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
                setCartCount(totalItems);
            }
        };

        updateCartCount();

        window.addEventListener('storage', updateCartCount);
        return () => window.removeEventListener('storage', updateCartCount);
    }, []);

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
        const fallbackStreams = liveSellers.filter(s => s.productId !== product.key);
        
        let i = 0;
        while(streams.length < 6 && i < fallbackStreams.length) {
            if (!streams.some(s => s.id === fallbackStreams[i].id)) {
                streams.push(fallbackStreams[i]);
            }
            i++;
        }
        return streams.slice(0,51);
    }, [product]);
    
    const similarProducts = useMemo(() => {
        if (!product) return [];
        return Object.values(productDetails).filter(p => p.category === product.category && p.key !== product.key).slice(0, 5);
    }, [product]);


    const estimatedDeliveryDate = useMemo(() => {
        const today = new Date();
        const deliveryDate = addDays(today, 5);
        return format(deliveryDate, 'E, MMM dd');
    }, []);

    const fetchReviews = useCallback(() => {
        if (product) {
            const existingReviews = getReviews(product.key);
            setReviews(existingReviews.length > 0 ? existingReviews : mockReviews);
        }
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

    const handleAuthAction = (callback: () => void) => {
        if (!user) {
            setIsAuthDialogOpen(true);
        } else {
            callback();
        }
    };

    const handleAddToCart = useCallback(() => {
        handleAuthAction(() => {
            if (product) {
                const productForCart: CartProduct = {
                    id: product.id,
                    key: product.key,
                    name: product.name,
                    price: currentPrice || product.price,
                    imageUrl: product.images[0],
                    hint: product.hint,
                    brand: product.brand,
                    category: product.category,
                    quantity: 1,
                    size: selectedSize || undefined,
                    color: selectedColor || undefined,
                };
                addToCart(productForCart);
                setCartCount(getCart().reduce((sum, item) => sum + item.quantity, 0));
                toast({
                    title: "Added to Cart!",
                    description: `${product.name} has been added to your shopping cart.`,
                });
            }
        });
    }, [product, currentPrice, selectedSize, selectedColor, toast, handleAuthAction]);
    
    const handleWishlistToggle = () => {
        handleAuthAction(() => {
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
        });
    };
    
    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({
            title: "Link Copied!",
            description: "Product link copied to clipboard.",
        });
    };

    const handleReportProduct = (reason: string, details: string) => {
        console.log("Reporting product:", { productId: product?.key, reason, details });
        toast({
            title: "Product Reported",
            description: "Thank you for your feedback. Our moderation team will review this product shortly.",
        });
        setIsReportOpen(false);
    };
    
    const handleBuyNow = () => {
        handleAuthAction(() => {
            if (product) {
                if (!userData?.addresses || userData.addresses.length === 0) {
                    setIsAddressDialogOpen(true);
                    return;
                }
                const buyNowCart: CartProduct[] = [{
                    ...product,
                    id: product.id,
                    key: product.key,
                    name: product.name,
                    price: currentPrice || product.price,
                    imageUrl: product.images[0],
                    quantity: 1,
                    size: selectedSize || undefined,
                    color: selectedColor || undefined,
                }];
                saveCart(buyNowCart);
                localStorage.setItem('buyNow', 'true');
                router.push('/cart');
            }
        });
    };
    
    const handleAskQuestion = () => {
        handleAuthAction(() => {
            if (newQuestion.trim()) {
                console.log("New question:", newQuestion);
                toast({
                    title: "Question Submitted!",
                    description: "Your question has been sent to the seller. You will be notified when they answer.",
                });
                setNewQuestion("");
                setIsQnaDialogOpen(false);
            }
        });
    };

    const handleReviewSubmit = (review: Review) => {
        if (!product || !user) return;

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
        fetchReviews();
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
        handleAuthAction(() => {
            const userHasReviewed = reviews.some(r => r.userId === user!.uid);
            if(userHasReviewed) {
                 toast({ variant: 'destructive', title: 'Already Reviewed', description: 'You have already submitted a review for this product.' });
                 return;
            }
             if (!hasPurchased) {
                toast({ variant: 'destructive', title: 'Purchase Required', description: 'You must purchase this item to leave a review.' });
                return;
            }
            setEditingReview(undefined);
            setIsReviewDialogOpen(true);
        });
    };
    
    const handleAddressSave = (address: any) => {
        // If they just added their first address, proceed with the "Buy Now" action
        if (userData?.addresses?.length === 0) {
            handleBuyNow();
        } else {
             toast({
                title: "Address Updated",
                description: "Your delivery address has been successfully updated.",
            });
        }
        setIsAddressDialogOpen(false);
    };
    
     const handleAddressesUpdate = (newAddresses: any[]) => {
        if(user){
          updateUserData(user.uid, { addresses: newAddresses });
        }
      }
      
    const onSearchComplete = useCallback((results: any[], query: string) => {
      setSearchResults(results);
      setSearchQuery(query);
      setShowSearchResults(results.length > 0 || query.length > 0);
    }, []);

    const handleSimilarClick = () => {
        setIsScanning(true);
        setIsLoadingSimilar(true);
        setTimeout(() => {
            setIsScanning(false);
            setShowSimilarOverlay(true);
            setTimeout(() => {
                setIsLoadingSimilar(false);
            }, 1000);
        }, 1500);
    };

    const renderDescriptionWithHashtags = (text: string) => {
        const parts = text.split(/(#\\w+)/g);
        return parts.map((part, index) => {
            if (part.startsWith('#')) {
                return (
                    <button 
                        key={index} 
                        className="text-primary hover:underline font-semibold"
                        onClick={() => onSearchComplete([], part)}
                    >
                        {part}
                    </button>
                );
            }
            return part;
        });
    };

    const renderSearchResults = () => (
        <div className="container mx-auto py-6">
            <h2 className="text-2xl font-bold mb-4">
                Search Results for "{searchQuery}"
            </h2>
            {searchResults.length > 0 ? (
                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {searchResults.map((p) => (
                         <Link href={`/product/${p.key || p.id}`} key={p.id} className="group block">
                            <Card className="w-full group overflow-hidden">
                                <div className="aspect-square bg-muted rounded-t-lg overflow-hidden relative">
                                    <Image 
                                        src={p.images?.[0] || "https://placehold.co/200x200.png"}
                                        alt={p.name}
                                        fill
                                        className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                                    />
                                </div>
                                <div className="p-3">
                                    <h4 className="font-semibold truncate text-sm">{p.name}</h4>
                                    <p className="font-bold text-foreground">{p.price}</p>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <p>No products found for "{searchQuery}".</p>
                </div>
            )}
        </div>
    );

    if (!product) {
        return (
             <div className="flex flex-col h-screen items-center justify-center text-center p-4">
                 <div className="w-full max-w-sm mx-auto">
                    <ProductSearch onSearchComplete={onSearchComplete} />
                 </div>
                <h2 className="text-2xl font-semibold mt-4">Product not found</h2>
                <p className="text-muted-foreground">This product may have been removed or is unavailable.</p>
                <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
            </div>
        );
    }
    
    const mediaItems = useMemo(() => {
        const allMedia = [...(product.media || []), ...product.images.map((url: string) => ({type: 'image', url: url}))];
        return Array.from(new Map(allMedia.map((item: any) => [item.url, item])).values());
    }, [product.media, product.images]);


    const seller = productToSellerMapping[product.key];
    const sellerLiveStream = liveSellers.find(s => s.id === seller.uid);
    const reviewImages = reviews.map(r => r.imageUrl).filter(Boolean) as string[];

    const stock = variantStock ?? product.stock;

    return (
        <>
             <AlertDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <DialogTitle>Authentication Required</DialogTitle>
                        <DialogDescription>
                            You need to be logged in to perform this action. Please log in or create an account to continue.
                        </DialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => router.push(`/signup?redirect=${productId}`)}>Create Account</AlertDialogAction>
                        <AlertDialogAction onClick={() => router.push(`/?redirect=${productId}`)}>Login</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                <ReportDialog onSubmit={handleReportProduct} />
            </Dialog>
            <div className="min-h-screen bg-background">
                <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
                    <Button variant="ghost" size="icon" onClick={() => {
                        if (showSearchResults) {
                            setShowSearchResults(false);
                            setSearchQuery('');
                            setSearchResults([]);
                        } else {
                            router.back()
                        }
                    }}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div className="flex-grow max-w-md mx-4">
                        <ProductSearch onSearchComplete={onSearchComplete} />
                    </div>
                    <div className="flex items-center">
                        <Button asChild variant="ghost" className="relative">
                            <Link href="/cart">
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                <span className="hidden sm:inline">My Cart</span>
                                {cartCount > 0 && (
                                    <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                                        {cartCount}
                                    </Badge>
                                )}
                            </Link>
                        </Button>
                    </div>
                </header>

                <main>
                    {showSearchResults ? renderSearchResults() : (
                        <div className="container mx-auto py-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                                <div className="relative">
                                    <Dialog>
                                        <Card className="bg-transparent border-none shadow-none">
                                            <CardContent className="p-0">
                                                <DialogTrigger asChild>
                                                    <div className="aspect-square w-full bg-muted rounded-lg overflow-hidden mb-4 cursor-pointer group relative">
                                                        {selectedMedia?.type === 'image' && selectedMedia.url && (
                                                            <Image
                                                                src={selectedMedia.url}
                                                                alt={product.name}
                                                                fill
                                                                sizes="(max-width: 768px) 100vw, 50vw"
                                                                className="object-contain"
                                                            />
                                                        )}
                                                        {selectedMedia?.type === 'video' && (
                                                            <video src={selectedMedia.url} className="w-full h-full object-contain" controls autoPlay muted loop />
                                                        )}
                                                        {isScanning && (
                                                            <div className="absolute inset-0 bg-black/30 overflow-hidden">
                                                                <div className="scan-animation"></div>
                                                            </div>
                                                        )}
                                                        {product.isFromStream && (
                                                            <Badge variant="purple" className="absolute z-10 top-2 left-2">
                                                                <Video className="h-3 w-3 mr-1"/> From Stream
                                                            </Badge>
                                                        )}
                                                        <div className="absolute top-2 right-2 z-20 flex flex-col gap-2">
                                                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full" onClick={(e) => { e.stopPropagation(); handleWishlistToggle(); }}>
                                                                <Heart className={cn("h-4 w-4", wishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
                                                            </Button>
                                                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full" onClick={(e) => { e.stopPropagation(); handleShare(); }}>
                                                                <Share2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full" onClick={(e) => { e.stopPropagation(); handleAuthAction(() => setIsReportOpen(true)); }}>
                                                                <Flag className="h-4 w-4" />
                                                            </Button>
                                                             <FeedbackDialog>
                                                                <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full">
                                                                    <MessageSquare className="h-4 w-4" />
                                                                </Button>
                                                            </FeedbackDialog>
                                                        </div>
                                                    </div>
                                                </DialogTrigger>
                                                
                                                <ScrollArea>
                                                  <div className="flex gap-2 pb-2">
                                                      {mediaItems.map((item: any, index: number) => (
                                                          <button
                                                              key={index}
                                                              onClick={() => setSelectedMedia(item)}
                                                              className={cn(
                                                                  "w-16 h-16 rounded-md overflow-hidden border-2 flex-shrink-0 relative",
                                                                  selectedMedia?.url === item.url ? 'border-primary' : 'border-transparent'
                                                              )}
                                                          >
                                                              {item.type === 'image' ? (
                                                                  <Image
                                                                      src={item.url}
                                                                      alt={`Thumbnail ${''}${index + 1}`}
                                                                      width={64}
                                                                      height={64}
                                                                      className="object-cover w-full h-full"
                                                                  />
                                                              ) : (
                                                                  <>
                                                                      <video src={item.url} className="object-cover w-full h-full" />
                                                                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                                          <Play className="h-6 w-6 text-white" />
                                                                      </div>
                                                                  </>
                                                              )}
                                                          </button>
                                                      ))}
                                                  </div>
                                                  <ScrollBar orientation="horizontal" />
                                                </ScrollArea>
                                            </CardContent>
                                        </Card>
                                         <DialogContent className="max-w-3xl h-auto max-h-[90vh]">
                                            <DialogHeader>
                                                <DialogTitle>{product.name}</DialogTitle>
                                            </DialogHeader>
                                            <div className="relative aspect-square w-full">
                                                {selectedMedia?.type === 'image' && selectedMedia.url && (
                                                    <Image src={selectedMedia.url} alt={product.name} fill className="object-contain" />
                                                )}
                                                 {selectedMedia?.type === 'video' && (
                                                    <video src={selectedMedia.url} className="w-full h-full object-contain" controls autoPlay muted loop />
                                                )}
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                    <Button size="lg" className="w-full rounded-full bg-black/50 text-white backdrop-blur-sm flex items-center gap-1.5 mt-4" onClick={handleSimilarClick} disabled={isScanning}>
                                        {isScanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                        <span>Find Similar Products</span>
                                    </Button>
                                    {showSimilarOverlay && <SimilarProductsOverlay
                                        isOpen={showSimilarOverlay}
                                        onClose={() => setShowSimilarOverlay(false)}
                                        similarProducts={similarProducts}
                                        relatedStreams={relatedStreams}
                                        isLoading={isLoadingSimilar}
                                    />}
                                    {seller && sellerLiveStream && (
                                         <div className="mt-2 text-center">
                                            <Button asChild variant="secondary" className="w-full">
                                                <Link href={`/stream/${sellerLiveStream.id}`}>
                                                    <Video className="mr-2 h-4 w-4 text-primary" />
                                                    View Live Stream
                                                </Link>
                                            </Button>
                                             <p className="text-xs text-muted-foreground mt-1">See this product in action and ask questions in real-time.</p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="lg:col-span-1 space-y-4">
                                    <div className="text-sm font-mono text-muted-foreground">
                                        {product.key}
                                    </div>
                                    <div className='space-y-2'>
                                        {product.brand && <p className="text-sm font-medium text-primary">{product.brand}</p>}
                                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{product.name}</h1>
                                        <p className="text-muted-foreground text-sm">{renderDescriptionWithHashtags(product.description)}</p>
                                    </div>
                                     <div className="flex flex-col gap-2">
                                        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
                                            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                                <p className={cn("text-3xl font-bold text-foreground", compareAtPrice && "text-muted-foreground line-through text-2xl")}>{compareAtPrice ? compareAtPrice : currentPrice}</p>
                                                {compareAtPrice && <p className="text-3xl font-bold text-destructive">{currentPrice}</p>}
                                                {discountPercentage && <Badge variant="destructive">{discountPercentage}% OFF</Badge>}
                                            </div>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">(inclusive of all taxes)</p>
                                        <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1 text-amber-400">
                                                        <Star className="h-5 w-5 fill-current" />
                                                        <span className="font-bold text-base text-foreground">{averageRating}</span>
                                                    </div>
                                                    <span>({reviews.length} reviews)</span>
                                            </div>
                                            <span className="text-muted-foreground/50 hidden sm:inline">|</span>
                                            <div className={cn(
                                                "flex items-center gap-1",
                                                stock < 20 && "text-destructive font-semibold"
                                            )}>
                                                {stock < 20 ? <AlertTriangle className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                                                {stock < 20 ? `Only ${stock} left!` : `${stock} in stock`}
                                            </div>
                                            <span className="text-muted-foreground/50 hidden sm:inline">|</span>
                                            <div className="flex items-center gap-1"><Users className="w-4 h-4" /> {product.sold} sold</div>
                                        </div>
                                    </div>
                                    {availableColors.length > 0 && (
                                        <div className="space-y-2">
                                            <Label className="font-semibold">Color: <span className="font-normal">{selectedColor}</span></Label>
                                            <div className="flex flex-wrap gap-2">
                                                {availableColors.map((color: string) => (
                                                    <Button
                                                        key={color}
                                                        variant={selectedColor === color ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => setSelectedColor(color)}
                                                    >
                                                        {color}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {availableSizes.length > 0 && (
                                        <div className="space-y-2">
                                            <Label className="font-semibold">Size: <span className="font-normal">{selectedSize}</span></Label>
                                            <div className="flex flex-wrap gap-2">
                                                {availableSizes.map((size: string) => (
                                                    <Button
                                                        key={size}
                                                        variant={selectedSize === size ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => setSelectedSize(size)}
                                                        className="w-12"
                                                    >
                                                        {size}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                
                                    <div className="flex flex-col gap-2 pt-2">
                                        {(variantStock !== undefined && variantStock > 0) ? (
                                            <div className="flex flex-col gap-2">
                                                {inCart ? (
                                                    <Button size="lg" className="w-full" asChild>
                                                        <Link href="/cart">Go to Cart</Link>
                                                    </Button>
                                                ) : (
                                                    <Button size="lg" className="w-full" variant="outline" onClick={handleAddToCart}>
                                                        <ShoppingCart className="mr-2 h-5 w-5" />
                                                        Add to Cart
                                                    </Button>
                                                )}
                                                <Button size="lg" className="w-full" onClick={handleBuyNow}>
                                                    Buy Now
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button size="lg" className="w-full" disabled>
                                                Out of Stock
                                            </Button>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-4 pt-4 w-full">
                                        <Card className='p-4'>
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold text-base">Delivery Information</h4>
                                            {user && userData?.addresses && userData.addresses.length > 0 && (
                                                <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="link" className="p-0 h-auto text-xs">
                                                            <Edit className="mr-1 h-3 w-3" /> Change
                                                        </Button>
                                                    </DialogTrigger>
                                                     <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Change Delivery Address</DialogTitle>
                                                        </DialogHeader>
                                                        <EditAddressForm 
                                                            onSave={handleAddressSave}
                                                            onCancel={() => setIsAddressDialogOpen(false)}
                                                            onAddressesUpdate={handleAddressesUpdate}
                                                        />
                                                    </DialogContent>
                                                </Dialog>
                                            )}
                                        </div>
                                         {user && userData?.addresses && userData.addresses.length > 0 ? (
                                            <div className="w-full rounded-md text-sm mt-2">
                                                <div className="flex items-start gap-3">
                                                    <Truck className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="font-semibold text-foreground">Deliver to {userData.addresses[0].name} - {userData.addresses[0].pincode}</p>
                                                        <p className="text-xs text-muted-foreground">{userData.addresses[0].village}, {userData.addresses[0].city}</p>
                                                        <p className="text-xs text-muted-foreground">{userData.addresses[0].phone}</p>
                                                    </div>
                                                </div>
                                                <p className="text-muted-foreground font-semibold !mt-2">Delivery by {estimatedDeliveryDate}</p>
                                            </div>
                                        ) : (
                                            <div className='mt-2'>
                                                <div className="flex items-center gap-2">
                                                    <Input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="Enter Pincode" className="max-w-xs h-9" />
                                                    <Button variant="outline" size="sm" onClick={handlePincodeCheck} disabled={checkingPincode}>
                                                        {checkingPincode ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Check
                                                    </Button>
                                                </div>
                                                {isDeliverable !== null && (
                                                    <p className={cn("text-xs mt-2", isDeliverable ? "text-green-600" : "text-destructive")}>
                                                        {isDeliverable ? `Delivery available to ${pincode} by ${estimatedDeliveryDate}` : `Delivery not available to ${pincode}`}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        </Card>
                                        <Card className='p-4 space-y-4'>
                                            <div className="flex items-start gap-3">
                                                <RotateCcw className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="font-semibold">7-Day Return Policy</p>
                                                    <p className="text-xs text-muted-foreground">Return this item within 7 days of delivery for a refund.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <Banknote className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="font-semibold">Online Payment Only</p>
                                                    <p className="text-xs text-muted-foreground">Currently, we are only accepting online payments. COD is not available.</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <ShieldCheck className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="font-semibold">100% Genuine</p>
                                                    <p className="text-xs text-muted-foreground">All products are sourced directly from brands and verified sellers.</p>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-full mt-8 space-y-8">
                                <Card>
                                     <CardHeader>
                                        <CardTitle>Available Offers</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                         <div className="space-y-3">
                                            {mockAdminOffers.map((offer: any, index: number) => (
                                                <div key={index} className="flex items-start gap-3 text-sm">
                                                    {offer.icon}
                                                    <div>
                                                        <h5 className="font-semibold">{offer.title}</h5>
                                                        <p className="text-muted-foreground">{offer.description}</p>
                                                    </div>
                                                    {offer.code && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="ml-auto"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(offer.code);
                                                                toast({ title: 'Code Copied!', description: `${offer.code} copied to clipboard.` });
                                                            }}
                                                        >
                                                            Copy Code
                                                        </Button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                                 <div className="space-y-3">
                                    <h2 className="text-xl font-bold">Highlights</h2>
                                     {product.highlightsImage && (
                                        <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden relative">
                                            <Image src={product.highlightsImage} alt={`${''}${product.name} highlights`} layout="fill" className="object-contain" />
                                        </div>
                                    )}
                                    <ul className="space-y-3 text-sm">
                                        {currentHighlights.map((highlight: string, index: number) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                                <span className="text-muted-foreground">{highlight}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="text-center">
                                        <Button asChild variant="link">
                                            <Link href={`/product/${productId}/details`}>View All Details</Link>
                                        </Button>
                                    </div>
                                </div>
                                <Separator />
                                <Card>
                                     <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="flex items-center gap-2">Ratings & Reviews 
                                                <Badge variant="outline" className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                    {averageRating}
                                                </Badge>
                                            </CardTitle>
                                            <span className="text-sm font-medium text-muted-foreground">{reviews.length} Reviews</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {reviewImages.length > 0 && (
                                            <div className="grid grid-cols-4 gap-2">
                                                {reviewImages.slice(0, 4).map((img, index) => (
                                                    <Dialog key={index}>
                                                        <DialogTrigger asChild>
                                                            <div className={cn("relative aspect-square rounded-md overflow-hidden cursor-pointer", index === 3 && reviewImages.length > 4 && "bg-black/50")}>
                                                                <Image src={img} alt={`Review image ${index + 1}`} layout="fill" className="object-cover" />
                                                                {index === 3 && reviewImages.length > 4 && (
                                                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg">
                                                                        +{reviewImages.length - 4}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-4xl p-0">
                                                            <Carousel className="w-full">
                                                                <CarouselContent>
                                                                    {reviewImages.map((img, idx) => (
                                                                        <CarouselItem key={idx}>
                                                                            <div className="aspect-video relative">
                                                                                <Image src={img} alt={`Review image slide ${idx + 1}`} layout="fill" className="object-contain" />
                                                                            </div>
                                                                        </CarouselItem>
                                                                    ))}
                                                                </CarouselContent>
                                                                <CarouselPrevious />
                                                                <CarouselNext />
                                                            </Carousel>
                                                        </DialogContent>
                                                    </Dialog>
                                                ))}
                                            </div>
                                        )}
                                        {reviews.length > 0 ? (
                                            <div className="space-y-4">
                                                {reviews.slice(0, 3).map((review) => (
                                                    <div key={review.id} className="flex gap-4 border-t pt-4 first:border-t-0 first:pt-0">
                                                        <Avatar className="mt-1">
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
                                                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{review.text}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground text-center py-4">No reviews yet. Be the first to write one!</p>
                                        )}
                                    </CardContent>
                                     <CardFooter className="flex-col sm:flex-row items-stretch sm:items-center sm:justify-center gap-4">
                                        <Button variant="outline" className="w-full sm:w-auto" asChild>
                                            <Link href={`/product/${productId}/reviews`}>View All {reviews.length} Reviews</Link>
                                        </Button>
                                        <Button variant="default" className="w-full sm:w-auto" onClick={openReviewDialog}>
                                            <Star className="mr-2 h-4 w-4" />
                                            Write a Review
                                        </Button>
                                    </CardFooter>
                                </Card>
                                <Separator />
                                
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <CardTitle>Questions & Answers</CardTitle>
                                        <span className="text-sm font-medium text-muted-foreground">{mockQandA.length} Q&As</span>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {mockQandA.slice(0,3).map(qa => (
                                            <div key={qa.id}>
                                                <p className="font-semibold text-sm">Q: {qa.question}</p>
                                                {qa.answer ? (
                                                    <p className="text-sm text-muted-foreground mt-1">A: {qa.answer}</p>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground mt-1 italic">No answer yet.</p>
                                                )}
                                            </div>
                                        ))}
                                    </CardContent>
                                    <CardFooter>
                                        <Button asChild variant="outline" className="w-full">
                                            <Link href={`/product/${productId}/qna`}>View All & Ask a Question</Link>
                                        </Button>
                                    </CardFooter>
                                </Card>

                                <Separator />
                                 <div className="mt-4">
                                    <h2 className="text-2xl font-bold mb-4">Related Product Streams</h2>
                                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {relatedStreams.map((stream: any) => {
                                            const sellerProducts = getProductsForSeller(stream.id);
                                            const productsToShow = sellerProducts.slice(0, 3);
                                            return (
                                                <Card key={stream.id} className="group flex flex-col space-y-2 overflow-hidden border-none shadow-none bg-transparent">
                                                    <Link href={`/stream/${stream.id}`} className="block">
                                                        <div className="relative aspect-[16/9] bg-muted rounded-lg overflow-hidden">
                                                            <Image src={stream.thumbnailUrl} alt={`Live stream from ${stream.name}`} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover w-full h-full transition-transform group-hover:scale-105" />
                                                            <div className="absolute top-3 left-3 z-10"><Badge variant="destructive" className="gap-1.5"><div className="h-2 w-2 rounded-full bg-white animate-pulse" />LIVE</Badge></div>
                                                            <div className="absolute top-2 right-2 z-10">
                                                                <Badge variant="secondary" className="bg-black/40 text-white font-semibold backdrop-blur-sm">
                                                                    <Users className="w-3 h-3 mr-1"/>{stream.viewers.toLocaleString()}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start gap-2 mt-2">
                                                                <Avatar className="w-8 h-8">
                                                                <AvatarImage src={stream.avatarUrl} alt={stream.name} />
                                                                <AvatarFallback>{stream.name.charAt(0)}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 overflow-hidden">
                                                                <p className="font-semibold text-sm leading-tight group-hover:underline truncate">{stream.title || stream.name}</p>
                                                                <p className="text-xs text-muted-foreground">{stream.name}</p>
                                                                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                                                    <p className="text-xs text-primary font-semibold">{stream.category}</p>
                                                                    {stream.subcategory && <Badge variant="outline" className="text-xs">{stream.subcategory}</Badge>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                    <div className="flex items-center gap-1.5 mt-auto flex-shrink-0 pt-2 w-full justify-start pb-2 pl-2">
                                                        {productsToShow.map((p: any, i: number) => (
                                                            <Link href={`/product/${p.key}`} key={p.key} className="block" onClick={(e) => e.stopPropagation()}>
                                                                <div className="w-10 h-10 bg-muted rounded-md border overflow-hidden hover:ring-2 hover:ring-primary">
                                                                    <Image src={p.images[0]?.preview || p.images[0]} alt={p.name} width={40} height={40} className="object-cover w-full h-full" />
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </Card>
                                            )
                                        })}
                                    </div>
                                </div>
                                <Card className="mt-6">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold">Sold By</h3>
                                            <Button asChild variant="outline" size="sm">
                                                <Link href={`/seller/profile?userId=${seller.uid}`}>View Profile</Link>
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-4">
                                            <Avatar>
                                                <AvatarImage src={seller.avatarUrl} />
                                                <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <Link href={`/seller/profile?userId=${seller.uid}`} className="font-semibold hover:underline">{seller.name}</Link>
                                                <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
                                                    <Star className="w-4 h-4 fill-current" />
                                                    <span>4.8</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                                {recentlyViewedItems.length > 0 && (
                                    <div className="mt-8">
                                        <h2 className="text-2xl font-bold mb-4">Recently Viewed</h2>
                                        <div className="overflow-x-auto no-scrollbar">
                                            <div className="flex gap-4 pb-4">
                                                {recentlyViewedItems.map((item) => (
                                                <Link href={`/product/${item.key}`} key={item.key} className="w-40 flex-shrink-0">
                                                    <Card className="overflow-hidden group h-full">
                                                    <div className="aspect-square bg-muted relative">
                                                        <Image src={item.imageUrl} alt={item.name} fill sizes="160px" className="object-cover" />
                                                    </div>
                                                    <div className="p-2">
                                                        <p className="text-xs font-semibold truncate group-hover:underline">{item.name}</p>
                                                        <p className="text-sm font-bold">{item.price}</p>
                                                        <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
                                                            <Star className="w-3 h-3 fill-current" />
                                                            <span>4.8</span>
                                                            <span className="text-muted-foreground">({(product as any).reviews || '1.2k'})</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                                            <div className="flex items-center gap-1"><Package className="w-2.5 h-2.5" /> {(product as any).stock} left</div>
                                                            <div className="flex items-center gap-1"><Users className="w-2.5 h-2.5" /> {(product as any).sold} sold</div>
                                                        </div>
                                                    </div>
                                                    </Card>
                                                </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
                <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                    <ReviewDialog 
                        order={{ products: [product] } as any} 
                        user={user}
                        reviewToEdit={editingReview}
                        onReviewSubmit={handleReviewSubmit}
                        closeDialog={() => setIsReviewDialogOpen(false)}
                    />
                </Dialog>
                <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
                    <DialogContent className="max-w-lg h-auto max-h-[85vh] flex flex-col">
                        <DialogHeader>
                            <DialogTitle>Add Delivery Address</DialogTitle>
                            <DialogDescription>Please provide a delivery address before proceeding.</DialogDescription>
                        </DialogHeader>
                        <EditAddressForm 
                            onSave={handleAddressSave}
                            onCancel={() => setIsAddressDialogOpen(false)}
                            onAddressesUpdate={handleAddressesUpdate}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}
