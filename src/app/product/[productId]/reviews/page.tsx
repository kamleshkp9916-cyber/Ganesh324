
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
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';


const mockReviews = [
    { id: 1, userId: 'user1', author: 'Ganesh', avatar: 'https://placehold.co/40x40.png?text=G', rating: 5, text: 'This camera is a dream! It takes beautiful, authentic photos and is in perfect condition. The seller was super helpful with my questions before I bought it. Highly recommend!', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=800&fit=crop' },
    { id: 2, userId: 'user2', author: 'Alex', avatar: 'https://placehold.co/40x40.png?text=A', rating: 4, text: "Really happy with this purchase. It's a bit heavier than I expected, but it feels solid and well-made. The image quality is superb for a vintage camera.", date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), imageUrl: 'https://images.unsplash.com/photo-1502920923512-3b053c00473a?w=800&h=800&fit=crop' },
    { id: 3, userId: 'user3', author: 'Priya', avatar: 'https://placehold.co/40x40.png?text=P', rating: 5, text: "Arrived faster than expected and was packaged very securely. The camera works perfectly. Can't wait to shoot my first roll of film!", date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), imageUrl: 'https://images.unsplash.com/photo-1510127034890-ba27088e2591?w=800&h=800&fit=crop' }
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

    const averageRating = useMemo(() => {
        if (reviews.length === 0) return '0.0';
        const total = reviews.reduce((acc, review) => acc + review.rating, 0);
        return (total / reviews.length).toFixed(1);
    }, [reviews]);
    
    const reviewImages = useMemo(() => reviews.map(r => r.imageUrl).filter(Boolean) as string[], [reviews]);

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
                     <CardTitle className="flex items-center gap-2">Ratings & Reviews 
                        <Badge variant="outline" className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                            {averageRating}
                        </Badge>
                    </CardTitle>
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
                                    {reviewImages.length > 0 && (
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" className="w-full">View All {reviewImages.length} Customer Photos</Button>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-4xl p-0">
                                                <Carousel className="w-full">
                                                    <CarouselContent>
                                                        {reviewImages.map((img, index) => (
                                                            <CarouselItem key={index}>
                                                                <div className="aspect-video relative">
                                                                    <Image src={img} alt={`Review image slide ${index + 1}`} layout="fill" className="object-contain" />
                                                                </div>
                                                            </CarouselItem>
                                                        ))}
                                                    </CarouselContent>
                                                    <CarouselPrevious />
                                                    <CarouselNext />
                                                </Carousel>
                                            </DialogContent>
                                        </Dialog>
                                    )}

                                    {reviews.map(review => (
                                        <Card key={review.id} className="overflow-hidden">
                                            <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
                                                {review.imageUrl && (
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <div className="w-full sm:w-28 h-28 relative flex-shrink-0 rounded-md overflow-hidden group cursor-pointer">
                                                                <Image src={review.imageUrl} alt="Review attachment" layout="fill" className="object-cover group-hover:scale-105 transition-transform" />
                                                            </div>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-3xl h-auto max-h-[80vh]">
                                                            <div className="relative aspect-square">
                                                                <Image src={review.imageUrl} alt="Review full view" layout="fill" className="object-contain" />
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                )}
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
                                                    <p className="text-sm text-muted-foreground mt-2">{review.text}</p>
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
                                            </CardContent>
                                        </Card>
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
