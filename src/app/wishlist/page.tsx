
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, ShoppingCart, Star, Video } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { getWishlist, removeFromWishlist, Product } from '@/lib/product-history';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { productDetails } from '@/lib/product-data';
import { Badge } from '@/components/ui/badge';

function EmptyWishlist() {
    const router = useRouter();
    return (
        <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-4 flex-grow justify-center">
            <Heart className="w-16 h-16 text-border" />
            <h3 className="text-xl font-semibold">Your Wishlist is Empty</h3>
            <p>Looks like you haven't added anything to your wishlist yet.</p>
            <Button onClick={() => router.push('/live-selling')}>Explore Products</Button>
        </div>
    );
}

const mockReviews = [
    { id: 1, author: 'Alex Smith', avatar: 'https://placehold.co/40x40.png', rating: 5, date: '2 weeks ago', text: 'Absolutely love this camera! It takes stunning photos with a really cool vintage vibe. It was packaged securely and arrived on time. Highly recommend this seller!' },
    { id: 2, author: 'Jane Doe', avatar: 'https://placehold.co/40x40.png', rating: 4, date: '1 month ago', text: 'Great product, works as described. The seller was very helpful in the live stream answering all my questions. Only reason for 4 stars is that the shipping took a day longer than expected.' },
    { id: 3, author: 'Chris Wilson', avatar: 'https://placehold.co/40x40.png', rating: 5, date: '3 months ago', text: "Fantastic find! I've been looking for a camera like this for ages. The condition is excellent. The entire process from watching the stream to delivery was seamless." },
];
const averageRating = (mockReviews.reduce((acc, review) => acc + review.rating, 0) / mockReviews.length).toFixed(1);

export default function WishlistPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !loading) {
      if (user) {
        setWishlistItems(getWishlist());
      } else {
        router.replace('/');
      }
    }
  }, [user, loading, isMounted, router]);

  const handleRemoveFromWishlist = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromWishlist(productId);
    setWishlistItems(getWishlist());
    toast({
      title: "Removed from Wishlist",
      description: "The item has been removed from your wishlist.",
    });
  };
  
   if (!isMounted || loading || !user) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner />
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Wishlist</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
            {wishlistItems.length === 0 ? (
                <EmptyWishlist />
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {wishlistItems.map((product) => {
                        const details = productDetails[product.key as keyof typeof productDetails];
                        const stock = details?.stock || 0;
                        const isFromStream = details?.isFromStream || false; // Assuming you add this to product-data
                        return (
                             <Link href={`/product/${product.key}`} key={product.id} className="group block">
                                <Card className="w-full overflow-hidden h-full flex flex-col">
                                    <div className="relative aspect-square bg-muted">
                                        <Image 
                                            src={product.imageUrl}
                                            alt={product.name}
                                            fill
                                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                                            className="object-cover"
                                            data-ai-hint={product.hint}
                                        />
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                            onClick={(e) => handleRemoveFromWishlist(e, product.id)}
                                        >
                                            <Heart className="h-4 w-4 fill-current" />
                                        </Button>
                                        {isFromStream && stock > 0 && (
                                            <Badge className="absolute top-2 left-2 z-10" variant="purple">
                                                <Video className="h-3 w-3 mr-1"/> From Stream
                                            </Badge>
                                        )}
                                        {stock === 0 && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <Badge variant="destructive" className="text-sm">Out of Stock</Badge>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 flex-grow flex flex-col">
                                        <h4 className="font-semibold truncate text-sm flex-grow">{product.name}</h4>
                                        <p className="font-bold text-foreground mt-1">{product.price}</p>
                                        <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
                                            <Star className="w-4 h-4 fill-current" />
                                            <span>{averageRating}</span>
                                            <span className="text-muted-foreground">({mockReviews.length} reviews)</span>
                                        </div>
                                         {stock > 0 && stock < 20 && (
                                            <p className="text-xs text-destructive font-semibold mt-1">Only {stock} left!</p>
                                        )}
                                    </div>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
      </main>
    </div>
  );
}

