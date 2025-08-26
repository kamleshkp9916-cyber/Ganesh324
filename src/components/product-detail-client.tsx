
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Star, ThumbsUp, ThumbsDown, MessageSquare, ShoppingCart, ShieldCheck, Heart, Share2, Truck, Tag, Banknote, Ticket, ChevronDown } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { addRecentlyViewed, addToCart, addToWishlist, isWishlisted, Product, isProductInCart } from '@/lib/product-history';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { format, addDays } from 'date-fns';
import { Input } from './ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';


// Mock data - in a real app this would come from a database
export const productDetails = {
    'prod_1': { id: 1, key: 'prod_1', name: 'Vintage Camera', brand: 'RetroCam', category: 'Electronics', price: '₹12,500.00', images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], hint: 'vintage camera', description: 'A classic 35mm film camera from the 70s. Fully functional with a sharp 50mm f/1.8 lens. Perfect for enthusiasts and collectors. Captures authentic vintage-style photos with a distinct, nostalgic feel.', modelNumber: 'RC-1975' },
    'prod_2': { id: 2, key: 'prod_2', name: 'Wireless Headphones', brand: 'SoundWave', category: 'Electronics', price: '₹4,999.00', images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], hint: 'headphones', description: 'Experience immersive sound with these noise-cancelling over-ear headphones. Features a 20-hour battery life, plush earcups for all-day comfort, and crystal-clear microphone for calls.', modelNumber: 'SW-PRO2' },
    'prod_3': { id: 3, key: 'prod_3', name: 'Handcrafted Vase', brand: 'Artisan Home', category: 'Home Goods', price: '₹2,100.00', images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], hint: 'ceramic vase', description: 'A beautiful, minimalist ceramic vase, handcrafted by local artisans. Its elegant design complements any home decor style. Each piece is unique.', origin: 'India' },
    'prod_4': { id: 4, key: 'prod_4', name: 'Smart Watch', brand: 'TimeWarp', category: 'Electronics', price: '₹8,750.00', images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], hint: 'smart watch', description: 'Stay connected and track your fitness with this advanced smartwatch. Features a vibrant AMOLED display, heart rate monitoring, GPS, and a wide range of smart notifications.', modelNumber: 'TW-X1' },
    'prod_5': { id: 5, key: 'prod_5', name: 'Leather Backpack', brand: 'UrbanCarry', category: 'Fashion', price: '₹6,200.00', images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], hint: 'brown leather backpack', description: 'A stylish and durable handmade genuine leather backpack. With multiple compartments, it is perfect for daily use, work, or short trips. Ages beautifully over time.', size: 'L', color: 'Tan Brown' },
    'prod_6': { id: 6, key: 'prod_6', name: 'Fitness Mat', brand: 'ZenFlex', category: 'Fitness', price: '₹1,500.00', images: ['https://placehold.co/600x600.png'], hint: 'fitness mat', description: 'High-density foam mat for all types of yoga, pilates, and floor exercises. Non-slip surface ensures stability.' },
    'prod_7': { id: 7, key: 'prod_7', name: 'Pottery Kit', brand: 'ClayWorks', category: 'Handmade', price: '₹3,000.00', images: ['https://placehold.co/600x600.png'], hint: 'pottery kit', description: 'A complete starter kit for pottery enthusiasts, including clay, tools, and a guide.', origin: 'India' },
    'prod_8': { id: 8, key: 'prod_8', name: 'Dog Bed', brand: 'Pawsome', category: 'Pet Supplies', price: '₹2,500.00', images: ['https://placehold.co/600x600.png'], hint: 'dog bed', description: 'An orthopedic dog bed for maximum comfort and joint support for your furry friend.' },
    'prod_9': { id: 9, key: 'prod_9', name: 'Signed Novel', brand: 'Bookish', category: 'Books', price: '₹1,800.00', images: ['https://placehold.co/600x600.png'], hint: 'book cover', description: 'A first edition novel, signed by the author. A must-have for collectors.' },
    'prod_10': { id: 10, key: 'prod_10', name: 'Gaming Mouse', brand: 'ClickFast', category: 'Gaming', price: '₹4,200.00', images: ['https://placehold.co/600x600.png'], hint: 'gaming mouse', description: 'An ergonomic gaming mouse with customizable RGB lighting and programmable buttons.', modelNumber: 'CF-ZPRO' },
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

                        <p className="text-3xl font-bold text-foreground">{product.price}</p>
                        
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
                    </div>
                </div>

                <div className="mt-12 space-y-8">
                    <div>
                        <h3 className="font-semibold mb-2">Check Delivery Availability</h3>
                        <div className="flex items-center gap-2 mt-2">
                            <Input
                                placeholder="Enter Pincode"
                                maxLength={6}
                                className="max-w-[150px]"
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                            />
                            <Button variant="outline" onClick={handlePincodeCheck} disabled={checkingPincode}>
                                {checkingPincode ? <LoadingSpinner className="h-4 w-4" /> : "Check"}
                            </Button>
                        </div>
                        {isDeliverable === true && (
                            <div className="flex items-center gap-2 mt-2 text-green-600">
                                <Truck className="h-5 w-5" />
                                <p className="text-sm">Deliverable! Estimated delivery by <span className="font-bold">{estimatedDeliveryDate}</span>.</p>
                            </div>
                        )}
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

                     <Collapsible defaultOpen>
                        <CollapsibleTrigger asChild>
                            <Button variant="outline" className="w-full justify-between">
                                Product Details
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                             <Card className="mt-2">
                                <CardContent className="pt-6">
                                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        {productSpecificDetails.map(detail => (
                                             <React.Fragment key={detail.label}>
                                                <dt className="text-muted-foreground">{detail.label}</dt>
                                                <dd className="font-medium">{detail.value}</dd>
                                            </React.Fragment>
                                        ))}
                                    </dl>
                                </CardContent>
                            </Card>
                        </CollapsibleContent>
                    </Collapsible>
                </div>
                
                 {/* Related Products Section */}
                <div className="mt-16">
                     <h2 className="text-2xl font-bold mb-6">Related Products</h2>
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
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
                <Card className="mt-12">
                    <CardHeader>
                        <CardTitle>Customer Reviews</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
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
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
