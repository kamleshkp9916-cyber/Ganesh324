
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Star, ThumbsUp, ThumbsDown, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth.tsx';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { Product, getReviews, Review, addReview, updateReview, deleteReview } from '@/lib/review-data';
import { productDetails } from '@/lib/product-data';
import { ReviewDialog } from '@/components/delivery-info-client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const mockReviews = [
    { id: 1, userId: 'user1', author: 'Ganesh', avatar: 'https://placehold.co/40x40.png?text=G', rating: 5, text: 'This camera is a dream! It takes beautiful, authentic photos and is in perfect condition. The seller was super helpful with my questions before I bought it. Highly recommend!', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 2, userId: 'user2', author: 'Alex', avatar: 'https://placehold.co/40x40.png?text=A', rating: 4, text: "Really happy with this purchase. It's a bit heavier than I expected, but it feels solid and well-made. The image quality is superb for a vintage camera.", date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 3, userId: 'user3', author: 'Priya', avatar: 'https://placehold.co/40x40.png?text=P', rating: 5, text: "Arrived faster than expected and was packaged very securely. The camera works perfectly. Can't wait to shoot my first roll of film!", date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString() }
];

export default function ProductReviewsPage() {
    const router = useRouter();
    const params = useParams();
    const { productId } = params;
    const { user } = useAuth();
    const { toast } = useToast();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
    const [editingReview, setEditingReview] = useState<Review | undefined>(undefined);

    const product = productDetails[productId as keyof typeof productDetails];

    const fetchReviews = () => {
        if (product) {
            const existingReviews = getReviews(product.key);
            setReviews(existingReviews.length > 0 ? existingReviews : mockReviews);
        }
    };
    
    useEffect(() => {
        fetchReviews();
    }, [product]);

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
                description: "Thank you for your feedback.",
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

    if (!product) {
        return (
             <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <>
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
            <div className="min-h-screen bg-background text-foreground flex flex-col">
                <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-xl font-bold truncate">Ratings & Reviews</h1>
                    <div className="w-10"></div>
                </header>
                <main className="flex-grow">
                    <ScrollArea className="h-[calc(100vh-120px)]">
                        <div className="container mx-auto py-8">
                            <div className="max-w-4xl mx-auto space-y-8">
                                <Link href={`/product/${productId}`} className="block">
                                     <Card className="hover:bg-muted/50 transition-colors">
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <div className="w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
                                                <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                                            </div>
                                            <div className="flex-grow">
                                                <p className="text-sm text-primary font-semibold">{product.brand}</p>
                                                <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
                                                <p className="text-xl font-bold">{product.price}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>

                                <div className="space-y-4">
                                    {reviews.map(review => (
                                        <Link href={`/product/${productId}`} key={review.id} className="block">
                                            <Card className="hover:shadow-md transition-shadow">
                                                <CardContent className="p-4 flex justify-between items-start gap-4">
                                                    <div className="flex-grow">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar className="h-8 w-8">
                                                                    <AvatarImage src={review.avatar} alt={review.author} />
                                                                    <AvatarFallback>{review.author.charAt(0)}</AvatarFallback>
                                                                </Avatar>
                                                                <div>
                                                                    <h5 className="font-semibold text-sm">{review.author}</h5>
                                                                    <div className="flex items-center gap-1 mt-1">
                                                                        {[...Array(5)].map((_, i) => (
                                                                            <Star key={i} className={cn("h-4 w-4", i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground')} />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-muted-foreground flex-shrink-0 ml-2">{formatDistanceToNow(new Date(review.date), { addSuffix: true })}</p>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{review.text}</p>
                                                         {user?.uid === review.userId && (
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs" onClick={(e) => { e.preventDefault(); handleEditReview(review); }}>
                                                                    <Edit className="mr-1 h-3 w-3" /> Edit
                                                                </Button>
                                                                <AlertDialog>
                                                                    <AlertDialogTrigger asChild>
                                                                        <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs text-destructive hover:text-destructive" onClick={(e) => e.preventDefault()}>
                                                                            <Trash2 className="mr-1 h-3 w-3" /> Delete
                                                                        </Button>
                                                                    </AlertDialogTrigger>
                                                                    <AlertDialogContent>
                                                                        <AlertDialogHeader>
                                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                                            <AlertDialogDescription>This will permanently delete your review.</AlertDialogDescription>
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
                                                     {review.imageUrl && (
                                                        <div className="w-24 h-24 relative flex-shrink-0">
                                                            <Image src={review.imageUrl} alt="Review attachment" layout="fill" className="rounded-md object-cover" />
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                     <div className="sticky bottom-0 bg-background border-t p-4 flex-shrink-0">
                        <div className="max-w-4xl mx-auto">
                            <Button className="w-full" onClick={() => setIsReviewDialogOpen(true)}>
                                <Star className="mr-2 h-4 w-4" />
                                Write a Review
                            </Button>
                        </div>
                    </div>
                </main>
            </div>
             <ReviewDialog
                order={{ products: [product] } as any}
                user={user}
                reviewToEdit={editingReview}
                onReviewSubmit={handleReviewSubmit}
                closeDialog={() => setIsReviewDialogOpen(false)}
            />
        </Dialog>
        </>
    );
}
