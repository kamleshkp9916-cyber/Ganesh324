
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Heart, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { getWishlist, removeFromWishlist, Product } from '@/lib/product-history';
import { useState, useEffect } from 'react';
import Link from 'next/link';

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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (user) {
        setWishlistItems(getWishlist());
    }
  }, [user]);

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
  
   if (loading || !isClient) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner />
        </div>
    )
  }

  if (!user) {
    return (
         <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
             <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
             <p className="text-muted-foreground mb-6">Please log in to view your wishlist.</p>
             <Button onClick={() => router.push('/')}>Go to Login</Button>
        </div>
    );
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
                    {wishlistItems.map((product) => (
                         <Link href={`/product/${product.id}`} key={product.id} className="group block">
                            <Card className="w-full overflow-hidden h-full flex flex-col">
                                <div className="relative aspect-square bg-muted">
                                    <Image 
                                        src={product.imageUrl}
                                        alt={product.name}
                                        layout="fill"
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
                                </div>
                                <div className="p-3 flex-grow flex flex-col">
                                    <h4 className="font-semibold truncate text-sm flex-grow">{product.name}</h4>
                                    <p className="text-primary font-bold mt-1">{product.price}</p>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
