
"use client";

import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, HelpCircle, Send } from 'lucide-react';
import { productDetails } from '@/lib/product-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

const mockQandA = [
    { id: 1, question: "Does this camera come with a roll of film?", questioner: "Alice", answer: "Yes, it comes with one 24-exposure roll of color film to get you started!", answerer: "GadgetGuru", timestamp: new Date(Date.now() - 2 * 60 * 1000) },
    { id: 2, question: "Is the battery for the light meter included?", questioner: "Bob", answer: "It is! We include a fresh battery so you can start shooting right away.", answerer: "GadgetGuru", timestamp: new Date(Date.now() - 5 * 60 * 1000) },
    { id: 3, question: "What is the warranty on this?", questioner: "Charlie", answer: "We offer a 6-month warranty on all our refurbished vintage cameras.", answerer: "GadgetGuru", timestamp: new Date(Date.now() - 10 * 60 * 1000) },
    { id: 4, question: "Can you ship this to the UK?", questioner: "Diana", answer: null, answerer: null, timestamp: new Date(Date.now() - 30 * 60 * 1000) },
    { id: 5, question: "Is the camera strap original?", questioner: "Eve", answer: "This one comes with a new, high-quality leather strap, not the original.", answerer: "GadgetGuru", timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
];

export default function ProductQnaPage() {
    const router = useRouter();
    const params = useParams();
    const { productId } = params;
    const { user } = useAuth();
    const { toast } = useToast();
    const [newQuestion, setNewQuestion] = useState("");
    const [qnaList, setQnaList] = useState(mockQandA);

    const product = productDetails[productId as keyof typeof productDetails];

    const handleAskQuestion = () => {
        if (!user) {
            toast({
                title: "Login Required",
                description: "You must be logged in to ask a question.",
                variant: "destructive"
            });
            return;
        }
        if (newQuestion.trim()) {
             const newQuestionObject = {
                id: Date.now(),
                question: newQuestion,
                questioner: user.displayName || 'You',
                answer: null,
                answerer: null,
                timestamp: new Date(),
            };
            setQnaList(prevList => [newQuestionObject, ...prevList]);

            toast({
                title: "Question Submitted!",
                description: "Your question has been sent to the seller. You will be notified when they answer.",
            });
            setNewQuestion("");
        }
    };
    
    if (!product) {
        return (
             <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="h-screen bg-background text-foreground flex flex-col">
            <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold truncate">Questions & Answers</h1>
                <div className="w-10"></div>
            </header>
            <div className="flex-grow overflow-hidden flex flex-col">
                <ScrollArea className="flex-grow">
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

                            <Card>
                                <CardHeader>
                                    <CardTitle>All Questions</CardTitle>
                                     <CardDescription>Find answers to what other customers are asking.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {qnaList.map(qa => (
                                        <div key={qa.id}>
                                            <div className="flex items-start gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarFallback>{qa.questioner.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-sm">{qa.questioner}</p>
                                                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(qa.timestamp, { addSuffix: true })}</p>
                                                    </div>
                                                    <p className="text-sm">{qa.question}</p>
                                                </div>
                                            </div>
                                            {qa.answer ? (
                                                <div className="flex items-start gap-3 mt-3 pl-8">
                                                     <Avatar className="h-8 w-8">
                                                         <AvatarImage src={`https://placehold.co/40x40.png?text=${qa.answerer?.charAt(0)}`} />
                                                        <AvatarFallback>{qa.answerer?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                         <div className="flex items-center gap-2">
                                                            <p className="font-semibold text-sm text-primary">{qa.answerer}</p>
                                                            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(qa.timestamp.getTime() + 60000), { addSuffix: true })}</p>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">{qa.answer}</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-start gap-3 mt-3 pl-8">
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src={`https://placehold.co/40x40.png?text=S`} />
                                                        <AvatarFallback>S</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-semibold text-sm text-primary">Seller</p>
                                                        <p className="text-sm text-muted-foreground italic">Pending answer from seller...</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {qnaList.length === 0 && (
                                        <p className="text-center text-muted-foreground py-8">No questions have been asked yet.</p>
                                    )}
                                </CardContent>
                            </Card>
                         </div>
                     </div>
                </ScrollArea>
                 <div className="sticky bottom-0 bg-background border-t p-4 flex-shrink-0">
                     <div className="max-w-4xl mx-auto">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Ask a Question</CardTitle>
                            </CardHeader>
                            <CardContent>
                                 <div className="flex items-center gap-2">
                                    <Input
                                        value={newQuestion}
                                        onChange={(e) => setNewQuestion(e.target.value)}
                                        placeholder="Type your question here..."
                                        onKeyDown={(e) => { if (e.key === 'Enter') handleAskQuestion()}}
                                    />
                                    <Button onClick={handleAskQuestion} disabled={!newQuestion.trim()}>
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
