
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Star, ThumbsUp, ThumbsDown, MessageSquare, ShoppingCart, ShieldCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { addRecentlyViewed, addToCart, Product } from '@/lib/product-history';
import { useToast } from '@/hooks/use-toast';

// Mock data - in a real app this would come from a database
const productDetails = {
    'prod_1': { id: 1, key: 'prod_1', name: 'Vintage Camera', price: '₹12,500.00', imageUrl: 'https://placehold.co/600x600.png', hint: 'vintage camera', description: 'A classic 35mm film camera from the 70s. Fully functional with a sharp 50mm f/1.8 lens. Perfect for enthusiasts and collectors. Captures authentic vintage-style photos with a distinct, nostalgic feel.' },
    'prod_2': { id: 2, key: 'prod_2', name: 'Wireless Headphones', price: '₹4,999.00', imageUrl: 'https://placehold.co/600x600.png', hint: 'headphones', description: 'Experience immersive sound with these noise-cancelling over-ear headphones. Features a 20-hour battery life, plush earcups for all-day comfort, and crystal-clear microphone for calls.' },
    'prod_3': { id: 3, key: 'prod_3', name: 'Handcrafted Vase', price: '₹2,100.00', imageUrl: 'https://placehold.co/600x600.png', hint: 'ceramic vase', description: 'A beautiful, minimalist ceramic vase, handcrafted by local artisans. Its elegant design complements any home decor style. Each piece is unique.' },
    'prod_4': { id: 4, key: 'prod_4', name: 'Smart Watch', price: '₹8,750.00', imageUrl: 'https://placehold.co/600x600.png', hint: 'smart watch', description: 'Stay connected and track your fitness with this advanced smartwatch. Features a vibrant AMOLED display, heart rate monitoring, GPS, and a wide range of smart notifications.' },
    'prod_5': { id: 5, key: 'prod_5', name: 'Leather Backpack', price: '₹6,200.00', imageUrl: 'https://placehold.co/600x600.png', hint: 'brown leather backpack', description: 'A stylish and durable handmade genuine leather backpack. With multiple compartments, it is perfect for daily use, work, or short trips. Ages beautifully over time.' },
    // Adding fallbacks for other product IDs
    'prod_6': { id: 6, key: 'prod_6', name: 'Fitness Mat', price: '₹1,500.00', imageUrl: 'https://placehold.co/600x600.png', hint: 'fitness mat', description: 'High-density foam mat for all types of yoga, pilates, and floor exercises. Non-slip surface ensures stability.' },
    'prod_7': { id: 7, key: 'prod_7', name: 'Pottery Kit', price: '₹3,000.00', imageUrl: 'https://placehold.co/600x600.png', hint: 'pottery kit', description: 'A complete starter kit for pottery enthusiasts, including clay, tools, and a guide.' },
    'prod_8': { id: 8, key: 'prod_8', name: 'Dog Bed', price: '₹2,500.00', imageUrl: 'https://placehold.co/600x600.png', hint: 'dog bed', description: 'An orthopedic dog bed for maximum comfort and joint support for your furry friend.' },
    'prod_9': { id: 9, key: 'prod_9', name: 'Signed Novel', price: '₹1,800.00', imageUrl: 'https://placehold.co/600x600.png', hint: 'book cover', description: 'A first edition novel, signed by the author. A must-have for collectors.' },
    'prod_10': { id: 10, key: 'prod_10', name: 'Gaming Mouse', price: '₹4,200.00', imageUrl: 'https://placehold.co/600x600.png', hint: 'gaming mouse', description: 'An ergonomic gaming mouse with customizable RGB lighting and programmable buttons.' },
};


const mockReviews = [
    { id: 1, author: 'Alex Smith', avatar: 'https://placehold.co/40x40.png', rating: 5, date: '2 weeks ago', text: 'Absolutely love this camera! It takes stunning photos with a really cool vintage vibe. It was packaged securely and arrived on time. Highly recommend this seller!' },
    { id: 2, author: 'Jane Doe', avatar: 'https://placehold.co/40x40.png', rating: 4, date: '1 month ago', text: 'Great product, works as described. The seller was very helpful in the live stream answering all my questions. Only reason for 4 stars is that the shipping took a day longer than expected.' },
    { id: 3, author: 'Chris Wilson', avatar: 'https://placehold.co/40x40.png', rating: 5, date: '3 months ago', text: "Fantastic find! I've been looking for a camera like this for ages. The condition is excellent. The entire process from watching the stream to delivery was seamless." },
];

const averageRating = (mockReviews.reduce((acc, review) => acc + review.rating, 0) / mockReviews.length).toFixed(1);

export default function ProductDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { productId } = params;
    const [product, setProduct] = useState<(typeof productDetails)[keyof typeof productDetails] | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (productId) {
            // @ts-ignore
            const details = productDetails[productId as keyof typeof productDetails] || productDetails['prod_1']; // Fallback
            setProduct(details);
            // Add to recently viewed when component mounts with a valid product
            addRecentlyViewed({
                id: details.id,
                key: details.key,
                name: details.name,
                price: details.price,
                imageUrl: details.imageUrl,
                hint: details.hint,
            });
        }
    }, [productId]);

    const handleAddToCart = () => {
        if (product) {
            addToCart({ ...product, quantity: 1 });
            toast({
                title: "Added to Cart!",
                description: `${product.name} has been added to your shopping cart.`,
            });
        }
    };


    if (!product) {
        return <div className="flex h-screen items-center justify-center"><LoadingSpinner /></div>;
    }

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
                    {/* Product Image */}
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                        <Image src={product.imageUrl} alt={product.name} width={600} height={600} className="object-cover w-full h-full" data-ai-hint={product.hint} />
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col gap-6">
                        <div>
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

                        <Button size="lg" className="w-full" onClick={handleAddToCart}>
                            <ShoppingCart className="mr-2 h-5 w-5" />
                            Add to Cart
                        </Button>
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
