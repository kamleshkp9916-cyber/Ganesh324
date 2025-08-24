
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Star, ThumbsUp, ThumbsDown, MessageSquare, ShoppingCart, ShieldCheck, Heart, Share2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { addRecentlyViewed, addToCart, addToWishlist, isWishlisted, Product, isProductInCart } from '@/lib/product-history';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

// Mock data - in a real app this would come from a database
const productDetails = {
    'prod_1': { id: 1, key: 'prod_1', name: 'Vintage Camera', brand: 'RetroCam', category: 'Electronics', price: '₹12,500.00', images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], hint: 'vintage camera', description: 'A classic 35mm film camera from the 70s. Fully functional with a sharp 50mm f/1.8 lens. Perfect for enthusiasts and collectors. Captures authentic vintage-style photos with a distinct, nostalgic feel.' },
    'prod_2': { id: 2, key: 'prod_2', name: 'Wireless Headphones', brand: 'SoundWave', category: 'Electronics', price: '₹4,999.00', images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], hint: 'headphones', description: 'Experience immersive sound with these noise-cancelling over-ear headphones. Features a 20-hour battery life, plush earcups for all-day comfort, and crystal-clear microphone for calls.' },
    'prod_3': { id: 3, key: 'prod_3', name: 'Handcrafted Vase', brand: 'Artisan Home', category: 'Home Goods', price: '₹2,100.00', images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], hint: 'ceramic vase', description: 'A beautiful, minimalist ceramic vase, handcrafted by local artisans. Its elegant design complements any home decor style. Each piece is unique.' },
    'prod_4': { id: 4, key: 'prod_4', name: 'Smart Watch', brand: 'TimeWarp', category: 'Electronics', price: '₹8,750.00', images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], hint: 'smart watch', description: 'Stay connected and track your fitness with this advanced smartwatch. Features a vibrant AMOLED display, heart rate monitoring, GPS, and a wide range of smart notifications.' },
    'prod_5': { id: 5, key: 'prod_5', name: 'Leather Backpack', brand: 'UrbanCarry', category: 'Fashion', price: '₹6,200.00', images: ['https://placehold.co/600x600.png', 'https://placehold.co/600x600.png', 'https://placehold.co/600x600.png'], hint: 'brown leather backpack', description: 'A stylish and durable handmade genuine leather backpack. With multiple compartments, it is perfect for daily use, work, or short trips. Ages beautifully over time.' },
    'prod_6': { id: 6, key: 'prod_6', name: 'Fitness Mat', brand: 'ZenFlex', category: 'Fitness', price: '₹1,500.00', images: ['https://placehold.co/600x600.png'], hint: 'fitness mat', description: 'High-density foam mat for all types of yoga, pilates, and floor exercises. Non-slip surface ensures stability.' },
    'prod_7': { id: 7, key: 'prod_7', name: 'Pottery Kit', brand: 'ClayWorks', category: 'Handmade', price: '₹3,000.00', images: ['https://placehold.co/600x600.png'], hint: 'pottery kit', description: 'A complete starter kit for pottery enthusiasts, including clay, tools, and a guide.' },
    'prod_8': { id: 8, key: 'prod_8', name: 'Dog Bed', brand: 'Pawsome', category: 'Pet Supplies', price: '₹2,500.00', images: ['https://placehold.co/600x600.png'], hint: 'dog bed', description: 'An orthopedic dog bed for maximum comfort and joint support for your furry friend.' },
    'prod_9': { id: 9, key: 'prod_9', name: 'Signed Novel', brand: 'Bookish', category: 'Books', price: '₹1,800.00', images: ['https://placehold.co/600x600.png'], hint: 'book cover', description: 'A first edition novel, signed by the author. A must-have for collectors.' },
    'prod_10': { id: 10, key: 'prod_10', name: 'Gaming Mouse', brand: 'ClickFast', category: 'Gaming', price: '₹4,200.00', images: ['https://placehold.co/600x600.png'], hint: 'gaming mouse', description: 'An ergonomic gaming mouse with customizable RGB lighting and programmable buttons.' },
};

const mockReviews = [
    { id: 1, author: 'Alex Smith', avatar: 'https://placehold.co/40x40.png', rating: 5, date: '2 weeks ago', text: 'Absolutely love this camera! It takes stunning photos with a really cool vintage vibe. It was packaged securely and arrived on time. Highly recommend this seller!' },
    { id: 2, author: 'Jane Doe', avatar: 'https://placehold.co/40x40.png', rating: 4, date: '1 month ago', text: 'Great product, works as described. The seller was very helpful in the live stream answering all my questions. Only reason for 4 stars is that the shipping took a day longer than expected.' },
    { id: 3, author: 'Chris Wilson', avatar: 'https://placehold.co/40x40.png', rating: 5, date: '3 months ago', text: "Fantastic find! I've been looking for a camera like this for ages. The condition is excellent. The entire process from watching the stream to delivery was seamless." },
];

const averageRating = (mockReviews.reduce((acc, review) => acc + review.rating, 0) / mockReviews.length).toFixed(1);

export function ProductDetailClient({ productId }: { productId: string }) {
    const router = useRouter();
    
    const [product, setProduct] = useState<(typeof productDetails)[keyof typeof productDetails] | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const { toast } = useToast();
    const [wishlisted, setWishlisted] = useState(false);
    const [inCart, setInCart] = useState(false);

    useEffect(() => {
        if (productId) {
            const castProductId = productId as keyof typeof productDetails;
            const details = productDetails[castProductId] || null;
            
            if(details){
                setProduct(details);
                if (details.images && details.images.length > 0) {
                    setSelectedImage(details.images[0]);
                }
                document.title = "Product Detail";
                const productForHistory: Product = {
                    id: details.id,
                    key: details.key,
                    name: details.name,
                    price: details.price,
                    imageUrl: details.images[0],
                    hint: details.hint,
                    brand: details.brand,
                    category: details.category,
                };
                addRecentlyViewed(productForHistory);
                setWishlisted(isWishlisted(details.id));
                setInCart(isProductInCart(details.id));
            }
        }
    }, [productId]);
    
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
            setInCart(true); // Update state to reflect it's in the cart
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
            addToWishlist(productForWishlist); // This function toggles
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


    if (!product) {
        return <div className="flex h-screen items-center justify-center"><LoadingSpinner /></div>;
    }

    const relatedProducts = Object.values(productDetails).filter(
        p => p.category === product.category && p.id !== product.id
    ).slice(0, 6);

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
                        
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                            <span className="text-sm font-medium">Safe and Secure Shopping</span>
                        </div>

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
                            <Button size="lg" className="w-full" variant="outline">
                                Buy Now
                            </Button>
                        </div>
                    </div>
                </div>
                
                 {/* Related Products Section */}
                <div className="mt-16">
                     <h2 className="text-2xl font-bold mb-6">Related Products</h2>
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
