
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, MoreVertical, Send, Smile, Eye, Plus, Check, ShoppingBag, Gavel } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const initialComments = [
    {
        id: 1,
        user: "@GaneshPr324",
        comment: "nice one I love it.........",
        avatar: "https://placehold.co/32x32.png"
    },
    {
        id: 2,
        user: "@Samael99",
        comment: "How much for this?",
        avatar: "https://placehold.co/32x32.png"
    }
];

const mockNewComments = [
    { user: "@Alex_123", comment: "Looks amazing!", avatar: "https://placehold.co/32x32.png" },
    { user: "@BellaCiao", comment: "I want one!", avatar: "https://placehold.co/32x32.png" },
    { user: "@CryptoKing", comment: "To the moon! 🚀", avatar: "https://placehold.co/32x32.png" },
    { user: "@Fashionista", comment: "So stylish!", avatar: "https://placehold.co/32x32.png" },
];

const emojis = ['😀', '😂', '😍', '🔥', '👍', '❤️', '💰', '🤑', '💵', '💳', '💸', '🎉'];

const initialAuctionItem = {
    id: 'prod-123',
    name: 'Vintage Leather Jacket',
    image: 'https://placehold.co/300x400.png',
    startingBid: 50,
    bidIncrement: 5,
};

export default function LiveStreamPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const userName = searchParams.get('userName') || `User ${params.id}`;
    const userImage = searchParams.get('userImage') || 'https://placehold.co/40x40.png';

    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState(initialComments);
    const [newComment, setNewComment] = useState("");
    const [viewers, setViewers] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [animateFollow, setAnimateFollow] = useState(false);

    // Auction State
    const [auctionItem, setAuctionItem] = useState(initialAuctionItem);
    const [currentBid, setCurrentBid] = useState(initialAuctionItem.startingBid);
    const [highestBidder, setHighestBidder] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isAuctionRunning, setIsAuctionRunning] = useState(true);


    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
            setViewers(Math.floor(Math.random() * 500) + 100);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (loading) return;

        const commentInterval = setInterval(() => {
            setComments(prevComments => {
                const nextMockComment = mockNewComments[Math.floor(Math.random() * mockNewComments.length)];
                const allComments = [...prevComments, { ...nextMockComment, id: Date.now() }];
                return allComments.slice(Math.max(allComments.length - 4, 0));
            });
        }, 3000);
        
        const viewerInterval = setInterval(() => {
            setViewers(prev => prev + Math.floor(Math.random() * 11) - 5);
        }, 5000);

        return () => {
            clearInterval(commentInterval);
            clearInterval(viewerInterval);
        }
    }, [loading]);

    // Auction Timer Effect
    useEffect(() => {
        if (!isAuctionRunning || loading) return;

        if (timeLeft <= 0) {
            setIsAuctionRunning(false);
            toast({
                title: "Auction Ended!",
                description: highestBidder ? `${highestBidder} won the auction for $${currentBid}!` : "The item was not sold.",
            });
            return;
        }

        const auctionTimer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(auctionTimer);
    }, [isAuctionRunning, timeLeft, loading, highestBidder, currentBid, toast]);
    
    const handleFollowClick = () => {
        setIsFollowing(prev => !prev);
        setAnimateFollow(true);
        setTimeout(() => setAnimateFollow(false), 1000); // Animation duration
    };

    const handleSendComment = () => {
        if (newComment.trim() === "") return;
        const commentToSend = {
            id: Date.now(),
            user: "@You",
            comment: newComment,
            avatar: "https://placehold.co/32x32.png"
        };
        setComments(prevComments => {
            const allComments = [...prevComments, commentToSend];
            return allComments.slice(Math.max(allComments.length - 4, 0));
        });
        setNewComment("");
    };

    const handlePlaceBid = () => {
        if (!isAuctionRunning) return;
        const newBid = currentBid + auctionItem.bidIncrement;
        setCurrentBid(newBid);
        setHighestBidder("@You");
        toast({
            title: "Bid Placed!",
            description: `You are now the highest bidder with $${newBid}.`,
        });
    };

    const handleEmojiSelect = (emoji: string) => {
        setNewComment(prev => prev + emoji);
    }
    
    if (loading) {
        return <LiveStreamSkeleton />;
    }

    return (
        <div className="relative h-screen bg-black text-white flex flex-col">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/50 to-transparent">
                <div className="flex items-center gap-2 -ml-3">
                    <Button variant="ghost" size="icon" className="text-white shrink-0" onClick={() => router.back()}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <div className="flex items-center gap-2 bg-black/30 p-2 rounded-full -ml-2">
                        <Avatar className="h-10 w-10 border-2 border-red-500">
                            <AvatarImage src={userImage} alt={userName} data-ai-hint="profile picture" />
                            <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start">
                            <p className="font-semibold">{userName}</p>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                                    <span className="text-xs text-red-400 font-bold">Live</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-300">
                                    <Eye className="h-3 w-3" />
                                    <span>{viewers}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
               
                <div className="flex items-center gap-2 -mr-2">
                    <Button 
                        size="icon" 
                        className={cn(
                            "rounded-full h-8 w-8",
                            isFollowing ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-white text-black hover:bg-white/90",
                            animateFollow && "animate-pulse-red"
                        )}
                        onClick={handleFollowClick}
                    >
                        {isFollowing ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white">
                        <MoreVertical className="h-6 w-6" />
                    </Button>
                </div>
            </header>

            {/* Auction Drawer */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 z-10 m-2 bg-black/50 hover:bg-black/70 text-green-400 rounded-full h-12 w-12">
                        <Gavel className="h-7 w-7" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-gray-900 border-gray-800 text-white w-80 p-0" aria-describedby="auction-sheet-description">
                    <SheetHeader>
                        <SheetTitle className="sr-only">Auction Details</SheetTitle>
                        <SheetDescription id="auction-sheet-description" className="sr-only">
                            Current auction item details and bidding options.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="p-4">
                         <Card className="w-full bg-black/50 border-gray-700 text-white mt-4">
                            <CardContent className="p-3">
                                <div className="relative aspect-[3/4] mb-2">
                                    <Image src={auctionItem.image} alt={auctionItem.name} layout="fill" objectFit="cover" className="rounded-md" data-ai-hint="fashion product" />
                                    <div className="absolute top-1 left-1 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-bold animate-pulse">
                                        AUCTION
                                    </div>
                                </div>
                                <h3 className="font-bold truncate">{auctionItem.name}</h3>
                                <div className="text-sm mt-1">
                                    <p className="text-gray-400">Current Bid</p>
                                    <p className="text-lg font-bold text-green-400">${currentBid}</p>
                                    {highestBidder && <p className="text-xs text-gray-300">by {highestBidder}</p>}
                                </div>
                                 <div className="mt-2">
                                    <Progress value={(timeLeft / 60) * 100} className="h-2 bg-gray-600 [&>div]:bg-red-500" />
                                    <p className="text-xs text-center mt-1 text-red-400">{`Time left: ${String(Math.floor(timeLeft/60)).padStart(2,'0')}:${String(timeLeft%60).padStart(2,'0')}`}</p>
                                </div>
                                <Button 
                                    className="w-full mt-3 bg-red-500 hover:bg-red-600 font-bold" 
                                    onClick={handlePlaceBid}
                                    disabled={!isAuctionRunning}
                                >
                                    <Gavel className="h-4 w-4 mr-2" />
                                    {isAuctionRunning ? `Bid ($${currentBid + auctionItem.bidIncrement})` : 'Auction Ended'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </SheetContent>
            </Sheet>

            {/* Product Drawer */}
            <Sheet>
                <SheetTrigger asChild>
                     <Button variant="ghost" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 z-10 m-2 bg-black/50 hover:bg-black/70 text-red-500 rounded-full h-12 w-12">
                        <ShoppingBag className="h-7 w-7" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-background text-foreground" aria-describedby="products-sheet-description">
                    <SheetHeader>
                        <SheetTitle>Products</SheetTitle>
                        <SheetDescription id="products-sheet-description">
                            Listed products will be shown here.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="p-4">
                        
                    </div>
                </SheetContent>
            </Sheet>

            {/* Main content - Video Placeholder */}
            <main className="flex-1 bg-black" />

            {/* Footer */}
            <footer className="absolute bottom-0 left-0 right-0 p-4 z-10 bg-gradient-to-t from-black/50 to-transparent">
                <div className="flex flex-col gap-3">
                    {/* Comments */}
                    <div className="flex flex-col gap-2 items-start h-40 overflow-y-auto no-scrollbar justify-end">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex items-start gap-2 bg-black/20 p-2 rounded-lg max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={comment.avatar} alt={comment.user} data-ai-hint="profile picture" />
                                    <AvatarFallback>{comment.user.charAt(1)}</AvatarFallback>
                                </Avatar>
                                <div className="text-sm">
                                    <p className="font-semibold text-gray-400">{comment.user}</p>
                                    <p>{comment.comment}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Input 
                                type="text" 
                                placeholder="Type Your Thoughts..........." 
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSendComment(); }}
                                className="bg-black/30 border-red-500 border rounded-full text-white placeholder:text-gray-300 focus:ring-red-500 focus:ring-2 pr-10"
                            />
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-white">
                                        <Smile className="h-5 w-5" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-2 bg-black/50 border-gray-700">
                                    <div className="grid grid-cols-6 gap-2">
                                        {emojis.map((emoji) => (
                                            <button 
                                                key={emoji} 
                                                onClick={() => handleEmojiSelect(emoji)}
                                                className="text-2xl hover:scale-125 transition-transform"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <Button variant="ghost" size="icon" className="text-red-500" onClick={handleSendComment}>
                            <Send className="h-6 w-6" />
                        </Button>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function LiveStreamSkeleton() {
    return (
        <div className="relative h-screen bg-black text-white flex flex-col">
            <header className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-12" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-20 rounded-full" />
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>
            </header>

            <main className="flex-1 bg-black" />
            
            <footer className="p-4 z-10">
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2 items-start">
                        <div className="flex items-start gap-2">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-3 w-40" />
                            </div>
                        </div>
                         <div className="flex items-start gap-2">
                            <Skeleton className="h-6 w-6 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-3 w-32" />
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-12 flex-1 rounded-full" />
                        <Skeleton className="h-10 w-10 rounded-full" />
                    </div>
                </div>
            </footer>
        </div>
    );
}
