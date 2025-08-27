
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Star, ThumbsUp, ThumbsDown, MessageSquare, ShoppingCart, ShieldCheck, Heart, Share2, Truck, Tag, Banknote, Ticket, ChevronDown, RotateCcw, Sparkles, CheckCircle, Users } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { addRecentlyViewed, addToCart, addToWishlist, isWishlisted, Product, isProductInCart } from '@/lib/product-history';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { format, addDays } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';


// Mock data - in a real app this would come from a database
export const productDetails = {
    'prod_1': { id: 1, key: 'prod_1', name: 'Vintage Camera', brand: 'RetroCam', category: 'Electronics', price: '₹12,500.00', images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], hint: 'vintage camera', description: 'A classic 35mm film camera from the 70s. Fully functional with a sharp 50mm f/1.8 lens. Perfect for enthusiasts and collectors. Captures authentic vintage-style photos with a distinct, nostalgic feel.', modelNumber: 'RC-1975', highlights: "Sharp 50mm f/1.8 Lens\nFully manual controls\nAuthentic vintage aesthetic\nDurable metal body" },
    'prod_2': { id: 2, key: 'prod_2', name: 'Wireless Headphones', brand: 'SoundWave', category: 'Electronics', price: '₹4,999.00', images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], hint: 'headphones', description: 'Experience immersive sound with these noise-cancelling over-ear headphones. Features a 20-hour battery life, plush earcups for all-day comfort, and crystal-clear microphone for calls.', modelNumber: 'SW-PRO2', highlights: "Active Noise Cancellation\n20-hour battery life\nCrystal-clear microphone\nBluetooth 5.2 Connectivity" },
    'prod_3': { id: 3, key: 'prod_3', name: 'Handcrafted Vase', brand: 'Artisan Home', category: 'Home Goods', price: '₹2,100.00', images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], hint: 'ceramic vase', description: 'A beautiful, minimalist ceramic vase, handcrafted by local artisans. Its elegant design complements any home decor style. Each piece is unique.', origin: 'India', highlights: "Handcrafted by local artisans\nMinimalist design\nMade from ethically sourced clay" },
    'prod_4': { id: 4, key: 'prod_4', name: 'Smart Watch', brand: 'TimeWarp', category: 'Electronics', price: '₹8,750.00', images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], hint: 'smart watch', description: 'Stay connected and track your fitness with this advanced smartwatch. Features a vibrant AMOLED display, heart rate monitoring, GPS, and a wide range of smart notifications.', modelNumber: 'TW-X1', highlights: "Vibrant AMOLED Display\nHeart Rate & SpO2 Monitoring\nBuilt-in GPS\n5-day battery life" },
    'prod_5': { id: 5, key: 'prod_5', name: 'Leather Backpack', brand: 'UrbanCarry', category: 'Fashion', price: '₹6,200.00', images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], hint: 'brown leather backpack', description: 'A stylish and durable handmade genuine leather backpack. With multiple compartments, it is perfect for daily use, work, or short trips. Ages beautifully over time.', size: 'L', color: 'Tan Brown', highlights: "Genuine Full-Grain Leather\nMultiple compartments including laptop sleeve\nHand-stitched for durability" },
    'prod_6': { id: 6, key: 'prod_6', name: 'Fitness Mat', brand: 'ZenFlex', category: 'Fitness', price: '₹1,500.00', images: ['https://placehold.co/600x600.png'], hint: 'fitness mat', description: 'High-density foam mat for all types of yoga, pilates, and floor exercises. Non-slip surface ensures stability.', highlights: "High-density foam\nNon-slip surface\nIncludes carrying strap" },
    'prod_7': { id: 7, key: 'prod_7', name: 'Pottery Kit', brand: 'ClayWorks', category: 'Handmade', price: '₹3,000.00', images: ['https://placehold.co/600x600.png'], hint: 'pottery kit', description: 'A complete starter kit for pottery enthusiasts, including clay, tools, and a guide.', origin: 'India', highlights: "Includes 1kg air-dry clay\n8-piece toolset\nBeginner-friendly guide book" },
    'prod_8': { id: 8, key: 'prod_8', name: 'Dog Bed', brand: 'Pawsome', category: 'Pet Supplies', price: '₹2,500.00', images: ['https://placehold.co/600x600.png'], hint: 'dog bed', description: 'An orthopedic dog bed for maximum comfort and joint support for your furry friend.', highlights: "Orthopedic memory foam\nMachine-washable cover\nAvailable in 3 sizes" },
    'prod_9': { id: 9, key: 'prod_9', name: 'Signed Novel', brand: 'Bookish', category: 'Books', price: '₹1,800.00', images: ['https://placehold.co/600x600.png'], hint: 'book cover', description: 'A first edition novel, signed by the author. A must-have for collectors.', highlights: "First edition print\nHand-signed by the author\nIncludes certificate of authenticity" },
    'prod_10': { id: 10, key: 'prod_10', name: 'Gaming Mouse', brand: 'ClickFast', category: 'Gaming', price: '₹4,200.00', images: ['https://placehold.co/600x600.png'], hint: 'gaming mouse', description: 'An ergonomic gaming mouse with customizable RGB lighting and programmable buttons.', modelNumber: 'CF-ZPRO', highlights: "16,000 DPI sensor\nCustomizable RGB lighting\n8 programmable buttons" },
};


const mockReviews = [
    { id: 1, author: 'Alex Smith', avatar: 'https://placehold.co/40x40.png', rating: 5, date: '2 weeks ago', text: 'Absolutely love this camera! It takes stunning photos with a really cool vintage vibe. It was packaged securely and arrived on time. Highly recommend this seller!' },
    { id: 2, author: 'Jane Doe', avatar: 'https://placehold.co/40x40.png', rating: 4, date: '1 month ago', text: 'Great product, works as described. The seller was very helpful in the live stream answering all my questions. Only reason for 4 stars is that the shipping took a day longer than expected.' },
    { id: 3, author: 'Chris Wilson', avatar: 'https://placehold.co/40x40.png', rating: 5, date: '3 months ago', text: "Fantastic find! I've been looking for a camera like this for ages. The condition is excellent. The entire process from watching the stream to delivery was seamless." },
];

const mockOffers = [
    { icon: <Ticket className="h-5 w-5 text-primary" />, title: "Special Price", description: "Get this for ₹11,000 using the code VINTAGE10" },
    { icon: <Banknote className="h-5 w-5 text-primary" />, title: "Bank Offer", description: "10% Instant Discount on HDFC Bank Credit Card" },
];

const liveSellers = [
    { id: 1, name: 'FashionFinds', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', viewers: 1200, hint: 'woman posing stylish outfit' },
    { id: 2, name: 'GadgetGuru', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', viewers: 2500, hint: 'unboxing new phone' },
    { id: 3, name: 'HomeHaven', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', viewers: 850, hint: 'modern living room decor' },
    { id: 4, name: 'BeautyBox', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', viewers: 3100, hint: 'makeup tutorial' },
    { id: 5, name: 'KitchenWiz', avatarUrl: 'https://placehold.co/40x40.png', thumbnailUrl: 'https://placehold.co/300x450.png', viewers: 975, hint: 'cooking demonstration' },
];

const averageRating = (mockReviews.reduce((acc, review) => acc + review.rating, 0) / mockReviews.length).toFixed(1);

export function ProductDetailClient({ productId }: { productId: string }) {
    const router = useRouter();
    
    const product = productDetails[productId as keyof typeof productDetails] || null;

    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const { toast } = useToast();
    const [wishlisted, setWishlisted] = useState(false);
    const [inCart, setInCart] = useState(false);
    const [pincode, setPincode] = useState("");
    const [isDeliverable, setIsDeliverable] = useState<boolean | null>(null);
    const [checkingPincode, setCheckingPincode] = useState(false);


    useEffect(() => {
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
        }
    }, [product]);

    const estimatedDeliveryDate = useMemo(() => {
        const today = new Date();
        const deliveryDate = addDays(today, 5);
        return format(deliveryDate, 'E, MMM dd');
    }, []);

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
    
    const handleBuyNow = () => {
        if (product) {
            router.push(`/cart?buyNow=true&productId=${product.key}`);
        }
    };

    if (!product) {
        return (
             <div className="flex flex-col h-screen items-center justify-center">
                <p className="text-2xl font-semibold mb-4">Product Not Found</p>
                <Button onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    const relatedProducts = Object.values(productDetails).filter(
        p => p.category === product.category && p.id !== product.id
    ).slice(0, 6);

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

            <main className="container mx-auto py-8">
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    {/* Product Image Gallery */}
                    <div className="flex flex-col-reverse md:flex-row gap-4">
                         <div className="flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 md:pr-2 no-scrollbar md:max-h-[500px]">
                           {product.images.map((img, index) => (
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
                            {selectedImage && <Image src={selectedImage} alt={product.name} width={600} height={600} className="object-cover w-full h-full" data-ai-hint={product.hint} />}
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
                            </div>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col gap-4">
                        <div>
                             <p className="text-sm font-medium text-primary mb-1">{product.brand}</p>
                            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">{product.name}</h1>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={cn("h-5 w-5", Number(averageRating) > i ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
                                    ))}
                                </div>
                                <span className="text-muted-foreground text-sm">({averageRating} based on {mockReviews.length} reviews)</span>
                            </div>
                        </div>

                        <div>
                            <p className="text-3xl font-bold text-foreground">{product.price}</p>
                            <p className="text-sm text-muted-foreground">(inclusive of all taxes)</p>
                        </div>
                        
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
                            <Button size="lg" className="w-full" variant="outline" onClick={handleBuyNow}>
                                Buy Now
                            </Button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground pt-4">
                            <div className="flex flex-col items-center gap-1">
                                <RotateCcw className="h-6 w-6" />
                                <span>7-Day Return Policy</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <Banknote className="h-6 w-6" />
                                <span>Pay on Delivery</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <ShieldCheck className="h-6 w-6" />
                                <span>100% Genuine</span>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="mt-12 space-y-8">
                     <div className="py-8 border-y">
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
                                    {mockOffers.map((offer, index) => (
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

                     <div className="py-8 border-t">
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
                     {productHighlights.length > 0 && (
                        <div className="py-8 border-t">
                             <CardHeader className="p-0">
                                <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary"/> Highlights</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 pt-4">
                                <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                                    {productHighlights.map((highlight, index) => (
                                        <li key={index}>{highlight}</li>
                                    ))}
                                </ul>
                            </CardContent>
                        </div>
                    )}
                </div>

                <div className="mt-16">
                     <h2 className="text-2xl font-bold mb-6">Related Products</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {relatedProducts.map(related => (
                            <Link href={`/product/${related.key}`} key={related.id} className="group block">
                                <Card className="overflow-hidden h-full flex flex-col p-2">
                                    <div className="aspect-square bg-muted relative rounded-md overflow-hidden">
                                        <Image src={related.images[0]} alt={related.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300"/>
                                    </div>
                                    <CardContent className="p-2 flex-grow flex flex-col">
                                        <h3 className="font-semibold truncate group-hover:underline text-xs flex-grow">{related.name}</h3>
                                        <p className="font-bold text-sm mt-1">{related.price}</p>
                                        <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
                                            <Star className="w-3 h-3 fill-current" />
                                            <span>{averageRating}</span>
                                            <span className="text-muted-foreground text-xs">({mockReviews.length})</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
                
                {/* Reviews Section */}
                <div className="mt-12 py-8 border-t">
                    <CardHeader className="p-0 mb-6">
                        <CardTitle>Customer Reviews</CardTitle>
                    </CardHeader>
                    <div className="space-y-6">
                        {mockReviews.map(review => (
                            <div key={review.id} className="flex gap-4">
                                <Avatar>
                                    <AvatarImage src={review.avatar} alt={review.author} />
                                    <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold">{review.author}</p>
                                        <p className="text-xs text-muted-foreground">{review.date}</p>
                                    </div>
                                     <div className="flex items-center gap-1 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={cn("h-4 w-4", i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
                                        ))}
                                    </div>
                                    <p className="mt-2 text-sm text-muted-foreground">{review.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                 {/* Live Streams Section */}
                <div className="mt-12 py-8 border-t">
                    <h2 className="text-2xl font-bold mb-6">Related Live Streams</h2>
                    <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar">
                        {liveSellers.map((seller) => (
                            <Link href={`/stream/${seller.id}`} key={seller.id} className="group block flex-shrink-0 w-48">
                                <Card className="w-full overflow-hidden h-full flex flex-col relative">
                                    <div className="aspect-[2/3] bg-muted relative">
                                        <Image 
                                            src={seller.thumbnailUrl}
                                            alt={seller.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform"
                                            data-ai-hint={seller.hint}
                                        />
                                        <div className="absolute top-2 left-2 z-10">
                                            <Badge className="bg-destructive text-destructive-foreground">LIVE</Badge>
                                        </div>
                                         <div className="absolute top-2 right-2 z-10">
                                            <Badge variant="secondary" className="bg-background/60 backdrop-blur-sm">
                                                <Users className="w-3 h-3 mr-1.5" />
                                                {seller.viewers}
                                            </Badge>
                                        </div>
                                    </div>
                                     <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-8 w-8 border-2 border-primary">
                                                <AvatarImage src={seller.avatarUrl} alt={seller.name} />
                                                <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <p className="font-semibold text-sm text-primary-foreground truncate">{seller.name}</p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Similar Products Section */}
                <div className="mt-12 py-8 border-t">
                     <h2 className="text-2xl font-bold mb-6">Similar Products</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {relatedProducts.slice(0, 4).map(related => (
                            <Link href={`/product/${related.key}`} key={related.id} className="group block">
                                <Card className="overflow-hidden h-full flex flex-col p-2">
                                    <div className="aspect-square bg-muted relative rounded-md overflow-hidden">
                                        <Image src={related.images[0]} alt={related.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300"/>
                                    </div>
                                    <CardContent className="p-2 flex-grow flex flex-col">
                                        <h3 className="font-semibold truncate group-hover:underline text-xs flex-grow">{related.name}</h3>
                                        <p className="font-bold text-sm mt-1">{related.price}</p>
                                        <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
                                            <Star className="w-3 h-3 fill-current" />
                                            <span>{averageRating}</span>
                                            <span className="text-muted-foreground text-xs">({mockReviews.length})</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

    
