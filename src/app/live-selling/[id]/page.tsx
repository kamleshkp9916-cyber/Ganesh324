
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ArrowLeft, MoreVertical, ChevronRight, Send, Smile, Eye, Plus, Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

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

export default function LiveStreamPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userName = searchParams.get('userName') || `User ${params.id}`;
    const userImage = searchParams.get('userImage') || 'https://placehold.co/40x40.png';

    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState(initialComments);
    const [newComment, setNewComment] = useState("");
    const [viewers, setViewers] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);
    const [animateFollow, setAnimateFollow] = useState(false);

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
                 <div className="-ml-4">
                    <Button variant="ghost" size="icon" className="text-white shrink-0" onClick={() => router.back()}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </div>
                <div className="flex items-center gap-2 bg-black/30 p-2 rounded-full">
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
               
                <div className="flex items-center gap-2">
                    <Button 
                        size="icon" 
                        className={cn(
                            "rounded-full h-8 w-8",
                            isFollowing ? "bg-destructive text-black hover:bg-destructive/90" : "bg-white text-black hover:bg-white/90",
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

            {/* Product Drawer */}
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="absolute left-0 top-1/2 -translate-y-1/2 z-10 m-2 bg-black/30 hover:bg-black/50 text-white rounded-full">
                        <ChevronRight className="h-6 w-6" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="bg-background text-foreground" aria-describedby="products-sheet-description">
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
            <footer className="p-4 z-10 bg-gradient-to-t from-black/50 to-transparent">
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
                        <Input 
                            type="text" 
                            placeholder="Type Your Thoughts..........." 
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSendComment(); }}
                            className="bg-black/30 border-red-500 border rounded-full text-white placeholder:text-gray-300 focus:ring-red-500 focus:ring-2"
                        />
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-white">
                                    <Smile className="h-6 w-6" />
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

    

    