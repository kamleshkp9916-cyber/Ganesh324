
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from '@/components/ui/sheet';
import { ArrowLeft, MoreVertical, ChevronRight, Send } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function LiveStreamPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userName = searchParams.get('userName') || `User ${params.id}`;
    const userImage = searchParams.get('userImage') || 'https://placehold.co/40x40.png';

    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState(initialComments);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (loading) return;

        const commentInterval = setInterval(() => {
            setComments(prevComments => {
                const nextMockComment = mockNewComments[Math.floor(Math.random() * mockNewComments.length)];
                const allComments = [...prevComments, { ...nextMockComment, id: Date.now() }];
                // Keep only the last 4 comments
                return allComments.slice(Math.max(allComments.length - 4, 0));
            });
        }, 3000);

        return () => clearInterval(commentInterval);
    }, [loading]);

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
    
    if (loading) {
        return <LiveStreamSkeleton />;
    }

    return (
        <div className="relative h-screen bg-black text-white flex flex-col">
            {/* Header */}
            <header className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/50 to-transparent">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-white" onClick={() => router.back()}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <Avatar className="h-10 w-10 border-2 border-red-500">
                        <AvatarImage src={userImage} alt={userName} data-ai-hint="profile picture" />
                        <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{userName}</p>
                        <div className="flex items-center gap-1">
                            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
                            <span className="text-xs text-red-400 font-bold">Live</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" className="rounded-full bg-white text-black hover:bg-white/90 h-8">Follow</Button>
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
                            className="bg-black/30 border-red-500 border-2 rounded-full text-white placeholder:text-gray-300 focus:ring-red-500 focus:ring-2"
                        />
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
