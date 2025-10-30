
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, ShoppingCart, Star, Video, Package, Users, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { getWishlist, removeFromWishlist, Product } from '@/lib/product-history';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { productDetails } from '@/lib/product-data';
import { Badge } from '@/components/ui/badge';
import { getUserReviews, Review } from '@/lib/review-data';
import { differenceInHours } from 'date-fns';
import { cn } from '@/lib/utils';


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

export default function WishlistPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [reviews, setReviews] = useState<Record<string, Review[]>>({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !loading) {
      if (user) {
        const items = getWishlist();
        setWishlistItems(items);
        const allReviews: Record<string, Review[]> = {};
        items.forEach(item => {
            allReviews[item.key] = getUserReviews(user.uid).filter(r => r.productId === item.key);
        });
        setReviews(allReviews);
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
                        if (!details) return null;
                        const isNew = details.createdAt && differenceInHours(new Date(), new Date(details.createdAt)) <= 24;

                        const originalPrice = parseFloat(details.price.replace(/[^0-9.-]+/g,""));
                        const hasDiscount = details.discountPercentage && details.discountPercentage > 0;
                        const discountedPrice = hasDiscount ? originalPrice * (1 - details.discountPercentage / 100) : originalPrice;

                        return (
                             <Link href={`/product/${product.key}`} key={product.key} className="group block">
                                <Card className="w-full overflow-hidden h-full flex flex-col">
                                    <div className="relative aspect-square bg-muted">
                                        {isNew && (
                                            <Badge className="absolute top-2 left-2 z-10">NEW</Badge>
                                        )}
                                        {details.isFromStream && (
                                            <Badge variant="purple" className={cn("absolute z-10", isNew ? "top-10 left-2" : "top-2 left-2")}>
                                                <Video className="h-3 w-3 mr-1"/> From Stream
                                            </Badge>
                                        )}
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            className="absolute top-2 right-2 h-8 w-8 rounded-full opacity-100 z-10"
                                            onClick={(e) => handleRemoveFromWishlist(e, product.id)}
                                        >
                                            <Heart className="h-4 w-4 fill-current" />
                                        </Button>
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.name}
                                            fill
                                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                                            className="object-cover transition-transform group-hover:scale-105"
                                            data-ai-hint={product.hint}
                                        />
                                         <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs text-white bg-black/50 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                                            <Star className="w-3 h-3 text-black fill-black" />
                                            <span className="font-bold">4.8</span>
                                        </div>
                                    </div>
                                    <CardContent className="p-3 flex-grow flex flex-col">
                                        <h4 className="font-semibold truncate text-sm flex-grow">{product.name}</h4>
                                         <div className="flex items-baseline gap-x-2 mt-1">
                                            <p className="font-bold text-sm text-foreground">
                                                ₹{discountedPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                            {hasDiscount && (
                                                <>
                                                    <p className="text-xs text-muted-foreground line-through">
                                                        ₹{originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </p>
                                                    <Badge variant="destructive" className="text-[10px] px-1 py-0">({details.discountPercentage}% OFF)</Badge>
                                                </>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                            <div className="flex items-center gap-1"><Package className="w-3 h-3" /> {details.stock} left</div>
                                            <div className="flex items-center gap-1"><Users className="w-3 h-3" /> {details.sold} sold</div>
                                        </div>
                                    </CardContent>
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
