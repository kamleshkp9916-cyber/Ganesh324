
"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Star, ThumbsUp, ThumbsDown, MessageSquare, ShoppingCart, ShieldCheck, Heart, Share2, Truck, Tag, Banknote, Ticket, ChevronDown, RotateCcw, Sparkles, CheckCircle, Users, HelpCircle, Send, Image as ImageIcon, Edit, Trash2, Flag, Play, Loader2, Package, Plus, X, Video, Search } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { addRecentlyViewed, addToCart, addToWishlist, isWishlisted, Product, isProductInCart, getRecentlyViewed, getCart } from '@/lib/product-history';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { format, addDays, parse, differenceInDays } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
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
import { Label } from '@/components/ui/label';
import { EditAddressForm } from './edit-address-form';
import { updateUserData } from '@/lib/follow-data';
import { useDebounce } from '@/hooks/use-debounce';
import { Popover, PopoverContent, PopoverTrigger, PopoverAnchor } from '@/components/ui/popover';


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
    const { user, userData } = useAuth();
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
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    
    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const [searchSuggestions, setSearchSuggestions] = useState<any[]>([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    
    useEffect(() => {
        const details = productDetails[productId as keyof typeof productDetails] || null;
        setProduct(details);
        if(details) {
            setCurrentPrice(details.price);
            setCurrentHighlights(details.highlights ? details.highlights.split('\\\\n').filter((h:string) => h.trim() !== '') : []);
            if(details.images.length > 0) {
                setSelectedImage(details.images[0]);
            }
            if (details.availableSizes?.split(',').map((s:string) => s.trim()).length > 0) {
                setSelectedSize(details.availableSizes.split(',').map((s:string) => s.trim())[0]);
            }
            if (details.availableColors?.split(',').map((s:string) => s.trim()).length > 0) {
                setSelectedColor(details.availableColors.split(',').map((s:string) => s.trim())[0]);
            }
        }
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

                if (variant.image?.preview) setSelectedImage(variant.image.preview);
                else setSelectedImage(product.images[0]);
                
                if (variant.highlights) setCurrentHighlights(variant.highlights.split('\\\\n').filter((h: string) => h.trim() !== ''));
                else setCurrentHighlights(product.highlights ? product.highlights.split('\\\\n').filter((h:string) => h.trim() !== '') : []);

            } else {
                 setCurrentPrice(product.price);
                 setSelectedImage(product.images[0]);
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

    // Effect for handling search
    useEffect(() => {
        if (debouncedSearchQuery.trim() === '') {
          setSearchSuggestions([]);
          return;
        }
    
        const terms = debouncedSearchQuery.toLowerCase().split(/\s+/).filter(Boolean);
        if (terms.length === 0) {
          setSearchSuggestions([]);
          return;
        }
    
        const allProducts = Object.values(productDetails);
        const filtered = allProducts.filter(p => 
          terms.every(term => p.keywords.some(kw => kw.startsWith(term)))
        );
        setSearchSuggestions(filtered.slice(0, 5));
      }, [debouncedSearchQuery]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const terms = searchQuery.toLowerCase().split(/\s+/).filter(Boolean);
        if (terms.length === 0) {
          setSearchResults([]);
          setShowSearchResults(true);
          setSearchSuggestions([]);
          return;
        }

        const allProducts = Object.values(productDetails);
        const results = allProducts.filter(p => 
            terms.every(term => p.keywords.some(kw => kw.startsWith(term)))
        );
        setSearchResults(results);
        setShowSearchResults(true);
        setSearchSuggestions([]);
    };

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

    const fetchReviews = () => {
        if (product) {
            setReviews(getReviews(product.key));
        }
    };
    
    useEffect(() => {
        const fetchTaggedPosts = async () => {
            if (!product) return;
            try {
                const db = getFirestoreDb();
                const postsRef = collection(db, "posts");
                const q = query(postsRef, where("taggedProducts.key", "==", product.key));
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
        
        const productsKey = `sellerProducts_${''}${productToSellerMapping[productId]?.name}`;
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
            setRecentlyViewedItems(getRecentlyViewed().filter(p => p.id !== product.id)); 
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
            setIsQnaDialogOpen(false);
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
    
    const handleAddressSave = (address: any) => {
        toast({
            title: "Address Selected!",
            description: "Your delivery address has been set for this session."
        });
        if(user){
            // In a real app this would be a main selected address, here we just update for the view
            const newUserData = { ...userData, addresses: [address, ...userData?.addresses?.filter((a: any) => a.id !== address.id) || []] };
            // Not calling updateUserData here to avoid constant writes, this is a view-only change for this page
        }
        setIsAddressDialogOpen(false);
    }
    
     const handleAddressesUpdate = (newAddresses: any[]) => {
        if(user){
          updateUserData(user.uid, { addresses: newAddresses });
        }
      }

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

    return (
        <>
            <div className="min-h-screen bg-background">
                 <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                     <Popover open={searchSuggestions.length > 0 && searchQuery.length > 0} onOpenChange={(open) => {if(!open) setSearchSuggestions([])}}>
                        <PopoverAnchor asChild>
                            <form className="relative flex-grow max-w-md mx-4" onSubmit={handleSearchSubmit}>
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={`Search...`}
                                    className="pl-9 rounded-full"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => {if(searchQuery) setShowSearchResults(false)}}
                                />
                            </form>
                        </PopoverAnchor>
                         <PopoverContent className="w-[--radix-popover-trigger-width] p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                            {searchSuggestions.map(suggestion => (
                                <div 
                                    key={suggestion.key} 
                                    className="p-2 hover:bg-accent cursor-pointer text-sm"
                                    onClick={() => {
                                        setSearchQuery(suggestion.name);
                                        setSearchSuggestions([]);
                                        handleSearchSubmit(new Event('submit') as any);
                                    }}
                                >
                                    {suggestion.name}
                                </div>
                            ))}
                        </PopoverContent>
                    </Popover>
                    <Button asChild variant="ghost" className="relative">
                        <Link href="/cart">
                            My Cart
                            <ShoppingCart className="ml-2 h-5 w-5" />
                            {cartCount > 0 && (
                                <Badge variant="destructive" className="absolute -top-1 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                                    {cartCount}
                                </Badge>
                            )}
                        </Link>
                    </Button>
                </header>
                
                 {showSearchResults ? (
                    <main className="container mx-auto py-6">
                        <Button variant="outline" onClick={() => setShowSearchResults(false)}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Product
                        </Button>
                        <h2 className="text-2xl font-bold my-4">Search Results for "{searchQuery}"</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {searchResults.map(p => (
                                <Link href={`/product/${p.key}`} key={p.id} className="group block">
                                    <Card className="w-full group overflow-hidden h-full flex flex-col">
                                        <div className="relative aspect-square bg-muted">
                                            <Image src={p.images[0]} alt={p.name} fill sizes="(max-width: 640px) 50vw, 20vw" className="object-cover transition-transform group-hover:scale-105" data-ai-hint={p.hint} />
                                        </div>
                                        <div className="p-3">
                                            <h4 className="font-semibold truncate text-sm">{p.name}</h4>
                                            <p className="font-bold">{p.price}</p>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </main>
                 ) : (
                    <main className="container mx-auto py-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            <Card>
                                <CardContent className="p-4">
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <div className="aspect-square w-full relative bg-muted rounded-lg overflow-hidden mb-4 cursor-pointer">
                                                {selectedImage && (
                                                    <Image
                                                        src={selectedImage}
                                                        alt={product.name}
                                                        fill
                                                        sizes="(max-width: 768px) 100vw, 50vw"
                                                        className="object-contain"
                                                    />
                                                )}
                                            </div>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-3xl max-h-[90vh]">
                                            <div className="relative aspect-square w-full">
                                                {selectedImage && (
                                                    <Image
                                                        src={selectedImage}
                                                        alt={product.name}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                )}
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                    <ScrollArea>
                                        <div className="flex gap-2 pb-2">
                                            {product.images.map((img: string, index: number) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setSelectedImage(img)}
                                                    className={cn(
                                                        "w-16 h-16 rounded-md overflow-hidden border-2 flex-shrink-0",
                                                        selectedImage === img ? 'border-primary' : 'border-transparent'
                                                    )}
                                                >
                                                    <Image
                                                        src={img}
                                                        alt={`Thumbnail ${''}${index + 1}`}
                                                        width={64}
                                                        height={64}
                                                        className="object-cover w-full h-full"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                        <ScrollBar orientation="horizontal" />
                                    </ScrollArea>
                                </CardContent>
                            </Card>
                            <div className="flex flex-col gap-4">
                                 <div className="flex justify-between items-start">
                                    <div>
                                        {product.brand && <p className="text-sm font-medium text-primary mb-1">{product.brand}</p>}
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{product.name}</h1>
                                            {product.key && <Badge variant="outline">{product.key}</Badge>}
                                            {product.isFromStream && <Badge variant="purple"><Video className="mr-1 h-3 w-3" /> From Stream</Badge>}
                                        </div>
                                        <p className="text-muted-foreground mt-2">{product.description}</p>
                                    </div>
                                    <div className="flex items-center">
                                        <Button variant="ghost" size="icon" onClick={handleWishlistToggle}>
                                            <Heart className={cn("h-6 w-6", wishlisted ? "fill-red-500 text-red-500" : "text-muted-foreground")} />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={handleShare}>
                                            <Share2 className="h-6 w-6" />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                 <Button variant="ghost" size="icon">
                                                    <Flag className="h-6 w-6" />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Report Product?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        If this product violates our community guidelines, please report it. Our team will review it shortly.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={handleReportProduct}>Confirm Report</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-4 flex-wrap">
                                        {currentPrice && <p className="text-3xl font-bold text-foreground">{currentPrice}</p>}
                                        <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1 text-amber-400">
                                                    <Star className="h-5 w-5 fill-current" />
                                                    <span className="font-bold text-lg text-foreground">{averageRating}</span>
                                                </div>
                                                <span className="text-muted-foreground text-sm">({reviews.length} reviews)</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Package className="w-4 h-4" />
                                                <span>{variantStock ?? product.stock} in stock</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                <span>{product.sold} sold</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">(inclusive of all taxes)</p>
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
                            
                                 <div className="flex flex-col gap-2">
                                    {(variantStock !== undefined && variantStock > 0) ? (
                                        <>
                                            {inCart ? (
                                                <Button size="lg" className="w-full" asChild>
                                                    <Link href="/cart">
                                                        Proceed Further
                                                    </Link>
                                                </Button>
                                            ) : (
                                                 <Button size="lg" className="w-full" onClick={handleAddToCart}>
                                                    <ShoppingCart className="mr-2 h-5 w-5" />
                                                    Add to Cart
                                                </Button>
                                            )}
                                            <Button size="lg" className="w-full" onClick={handleBuyNow} variant="outline">
                                                Buy Now
                                            </Button>
                                        </>
                                    ) : (
                                        <Button size="lg" className="w-full" disabled>
                                            Out of Stock
                                        </Button>
                                    )}
                                </div>
                                <Card>
                                    <CardHeader className="p-3 pb-0">
                                        <CardTitle className="text-base">Delivery Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-3">
                                        {user ? (
                                            userData?.addresses && userData.addresses.length > 0 ? (
                                                <div className="text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Truck className="h-5 w-5 text-muted-foreground"/>
                                                        <span>Deliver to <b>{userData.addresses[0].name}</b> - {userData.addresses[0].pincode}</span>
                                                    </div>
                                                    <p className="pl-7 text-muted-foreground">{userData.addresses[0].village}, {userData.addresses[0].city}</p>
                                                    <p className="pl-7 text-green-600 font-semibold mt-1">Delivery by {estimatedDeliveryDate}</p>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-center text-muted-foreground">
                                                    <p>You have no saved addresses.</p>
                                                    <Button asChild variant="link" className="p-0 h-auto">
                                                        <Link href="/setting">Add an address</Link>
                                                    </Button>
                                                    <p>to see delivery information.</p>
                                                </div>
                                            )
                                        ) : (
                                            <div className="space-y-2">
                                                <Label htmlFor="pincode">Check Delivery</Label>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        id="pincode"
                                                        placeholder="Enter Pincode"
                                                        value={pincode}
                                                        onChange={(e) => {
                                                            setPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
                                                            setIsDeliverable(null);
                                                        }}
                                                    />
                                                    <Button onClick={handlePincodeCheck} disabled={pincode.length !== 6 || checkingPincode}>
                                                        {checkingPincode ? <Loader2 className="h-4 w-4 animate-spin"/> : "Check"}
                                                    </Button>
                                                </div>
                                                {isDeliverable !== null && (
                                                    isDeliverable ? (
                                                        <p className="text-sm text-green-600">✓ Delivery available to this pincode. Estimated by {estimatedDeliveryDate}.</p>
                                                    ) : (
                                                        <p className="text-sm text-destructive">✗ Sorry, delivery is not available to this pincode.</p>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
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
                        <div className="md:col-span-2 space-y-8 mt-8">
                            
                             <Card>
                                <CardHeader>
                                <CardTitle>Available Offers</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                {mockAdminOffers.map((offer, index) => (
                                    <div key={index} className="flex items-start gap-3 text-sm">
                                        <div className="flex-shrink-0 mt-1">{offer.icon}</div>
                                        <div>
                                            <h5 className="font-semibold">{offer.title}</h5>
                                            <p className="text-muted-foreground">{offer.description}</p>
                                        </div>
                                    </div>
                                ))}
                                {(product as any).offer?.title && (
                                        <div className="flex items-start gap-3 text-sm">
                                            <div className="flex-shrink-0 mt-1"><Ticket className="h-5 w-5 text-primary" /></div>
                                            <div>
                                                <h5 className="font-semibold">{(product as any).offer.title}</h5>
                                                <p className="text-muted-foreground">{(product as any).offer.description}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                            <Separator />

                            <Card>
                                <CardHeader className="flex items-center justify-between flex-row">
                                    <CardTitle>Highlights</CardTitle>
                                    <Button asChild variant="link">
                                        <Link href={`/product/${productId}/details`}>View Details</Link>
                                    </Button>
                                </CardHeader>
                                <CardContent className="overflow-hidden">
                                    <div className="grid md:grid-cols-2 gap-6 items-center">
                                        <div className="relative aspect-square md:aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                                            <Image
                                                src={product.images[1] || product.images[0]}
                                                alt={`${product.name} highlight`}
                                                fill
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                                className="object-cover"
                                                data-ai-hint={`${product.hint} detail`}
                                            />
                                        </div>
                                        <div className="p-2">
                                            <ul className="space-y-3 text-sm">
                                                {currentHighlights.map((highlight: string, index: number) => (
                                                    <li key={index} className="flex items-start gap-3">
                                                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                                        <span className="text-muted-foreground">{highlight}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Separator />
                            
                            <Card>
                                 <CardHeader className="flex items-center justify-between">
                                    <CardTitle>Ratings & Reviews</CardTitle>
                                    <span className="text-sm font-medium text-muted-foreground">{reviews.length} Reviews</span>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {reviews.length > 0 ? (
                                        reviews.slice(0, 3).map((review) => (
                                            <Card key={review.id} className="bg-muted/50">
                                                <CardContent className="p-4">
                                                    <div className="flex gap-4">
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
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-4">No reviews yet. Be the first to write one!</p>
                                    )}
                                </CardContent>
                                <CardFooter className="flex-col items-stretch gap-4">
                                    {reviews.length > 3 && <Button variant="link" className="w-full">View All {reviews.length} Reviews</Button>}
                                    <Button variant="outline" onClick={openReviewDialog}>Write a Review</Button>
                                </CardFooter>
                            </Card>
                            
                            <Separator />
                            
                            <Card>
                                <CardHeader className="flex items-center justify-between">
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
                                    <Dialog open={isQnaDialogOpen} onOpenChange={setIsQnaDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="w-full">View All & Ask a Question</Button>
                                        </DialogTrigger>
                                        <DialogContent className="max-w-2xl">
                                            <DialogHeader>
                                                <DialogTitle>Questions & Answers</DialogTitle>
                                                <DialogDescription>
                                                    Find answers to your questions or ask a new one.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <ScrollArea className="h-96 pr-6 -mr-6">
                                                <div className="space-y-6">
                                                    {mockQandA.map(qa => (
                                                        <div key={qa.id}>
                                                            <p className="font-semibold text-sm">Q: {qa.question}</p>
                                                            {qa.answer ? (
                                                                <p className="text-sm text-muted-foreground mt-1">A: {qa.answer}</p>
                                                            ) : (
                                                                <p className="text-sm text-muted-foreground mt-1 italic">No answer yet.</p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                            <div className="mt-4 pt-4 border-t">
                                                <h4 className="font-semibold mb-2">Ask a New Question</h4>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        value={newQuestion}
                                                        onChange={(e) => setNewQuestion(e.target.value)}
                                                        placeholder="Type your question here..."
                                                    />
                                                    <Button onClick={handleAskQuestion} disabled={!newQuestion.trim()}>
                                                        <Send className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </CardFooter>
                            </Card>

                            <Separator />
                            <div className="mt-8">
                                <h2 className="text-2xl font-bold mb-4">Similar Products</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {similarProducts.map((p) => (
                                        <Link href={`/product/${p.key}`} key={p.id} className="group block">
                                            <Card className="w-full group overflow-hidden h-full flex flex-col">
                                                <div className="relative aspect-square bg-muted">
                                                    <Image src={p.images[0]} alt={p.name} fill sizes="(max-width: 640px) 50vw, 20vw" className="object-cover transition-transform group-hover:scale-105" data-ai-hint={p.hint} />
                                                </div>
                                                <div className="p-3">
                                                    <h4 className="font-semibold truncate text-sm">{p.name}</h4>
                                                    <p className="font-bold">{p.price}</p>
                                                    <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
                                                        <Star className="w-4 h-4 fill-current" />
                                                        <span>4.8</span>
                                                        <span className="text-muted-foreground">({(product as any).reviews || '1.2k'})</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                                        <div className="flex items-center gap-1"><Package className="w-3 h-3" /> {p.stock} left</div>
                                                        <div className="flex items-center gap-1"><Users className="w-3 h-3" /> {p.sold} sold</div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-8">
                                <h2 className="text-2xl font-bold mb-4">Related Product Streams</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                    {relatedStreams.map((stream: any) => (
                                        <Link href={`/stream/${stream.id}`} key={stream.id} className="group block">
                                            <div className="relative rounded-lg overflow-hidden aspect-[16/9] bg-muted">
                                                <div className="absolute top-2 left-2 z-10"><Badge variant="destructive">LIVE</Badge></div>
                                                <div className="absolute top-2 right-2 z-10">
                                                    <Badge variant="secondary" className="bg-black/50 text-white gap-1.5">
                                                        <Users className="h-3 w-3"/>
                                                        {stream.viewers}
                                                    </Badge>
                                                </div>
                                                <Image
                                                    src={stream.thumbnailUrl}
                                                    alt={`Live stream from ${''}${stream.name}`}
                                                    fill
                                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-2">
                                                    <div className="flex items-start gap-2 text-white">
                                                        <Avatar className="w-8 h-8 border-2 border-background">
                                                            <AvatarImage src={stream.avatarUrl} />
                                                            <AvatarFallback>{stream.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 overflow-hidden">
                                                            <p className="font-semibold text-xs group-hover:underline truncate">{stream.name}</p>
                                                            <p className="text-xs opacity-80">{stream.category}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            
                            {recentlyViewedItems.length > 0 && (
                                <div className="mt-8">
                                    <h2 className="text-2xl font-bold mb-4">Recently Viewed</h2>
                                    <ScrollArea className="w-full whitespace-nowrap">
                                        <div className="flex gap-4 pb-4">
                                            {recentlyViewedItems.map((item) => (
                                            <Link href={`/product/${item.key}`} key={item.id} className="w-40 flex-shrink-0">
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
                                        <ScrollBar orientation="horizontal" />
                                    </ScrollArea>
                                </div>
                            )}
                        </div>
                    </main>
                 )}
                <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                    <ReviewDialog 
                        order={{ products: [product] } as any} 
                        user={user}
                        reviewToEdit={editingReview}
                        onReviewSubmit={handleReviewSubmit}
                        closeDialog={() => setIsReviewDialogOpen(false)}
                    />
                </Dialog>
            </div>
        </>
    );
}

    