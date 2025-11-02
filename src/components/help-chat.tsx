
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { X, MessageSquare, Clock, UserCheck, Send, ArrowLeft, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth.tsx';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { Input } from './ui/input';
import { Order } from '@/lib/order-data';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { ScrollArea } from './ui/scroll-area';
import { useRouter } from 'next/navigation';

type ChatStep = 'initial' | 'waiting' | 'confirm_executive' | 'connected' | 'chatting';
type Message = { id: number, sender: 'user' | 'bot' | 'system', content: React.ReactNode, hideAvatar?: boolean };

const INITIAL_TIMER = 10;
const SECOND_TIMER = 5;

const defaultInitialQuickReplies = [
    "Where is my order?",
    "Problem with my item",
    "Payment issue",
    "Can I change my delivery address?",
];

const LoadingMessage = () => (
    <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-[50px]" />
        <Skeleton className="h-4 w-[30px]" />
    </div>
);

const QuickReplyButtons = ({ replies, onSelect }: { replies: string[], onSelect: (reply: string) => void }) => (
    <div className="w-full flex flex-wrap gap-2 justify-start mt-2">
        {replies.map(reply => (
            <Button key={reply} size="sm" variant="outline" onClick={() => onSelect(reply)}>
                {reply}
            </Button>
        ))}
    </div>
);


export function HelpChat({ order, onClose, initialOptions, onExecuteAction }: { order: Order | null, onClose: () => void, initialOptions?: string[], onExecuteAction?: (action: string) => void }) {
    const { user, userData } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState<ChatStep>('initial');
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoadingResponse, setIsLoadingResponse] = useState(false);
    
    const [timer, setTimer] = useState(INITIAL_TIMER);
    const [isExecutiveConnecting, setIsExecutiveConnecting] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const retryRef = useRef(false);

     useEffect(() => {
        const initialReplies = initialOptions || defaultInitialQuickReplies;
        const initialState = {
            message: "Hi there! This is an automated assistant. How can I help you today?",
            quickReplies: initialReplies
        };
        addMessageWithReplies('bot', initialState.message, initialState.quickReplies);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }, [messages]);

    const addMessage = (sender: 'user' | 'bot' | 'system', content: React.ReactNode, hideAvatar: boolean = false) => {
        setMessages(prev => [...prev, { id: Date.now() + Math.random(), sender, content, hideAvatar }]);
    };
    
    const addMessageWithReplies = (sender: 'bot' | 'user', message: string, replies: string[]) => {
        addMessage(sender, message);
        if (replies.length > 0) {
            addMessage('bot', <QuickReplyButtons replies={replies} onSelect={handleQuickReply} />, true);
        }
    }

    const processUserQuery = async (query: string) => {
        setIsLoadingResponse(true);
        addMessageWithReplies('bot', "I'm sorry, I'm having trouble understanding. Please try again or connect to a support executive.", ["Talk to a support executive"]);
        setIsLoadingResponse(false);
    }
    
    const handleQuickReply = (reply: string) => {
        setMessages(prev => prev.filter(m => typeof m.content !== 'object')); // Remove the old buttons
        addMessage('user', reply);
        if (reply === "Talk to a support executive") {
            setStep('confirm_executive');
        } else {
            processUserQuery(reply);
        }
    };
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        const query = inputValue.trim();
        if (!query) return;

        setMessages(prev => prev.filter(m => typeof m.content !== 'object'));
        addMessage('user', query);
        setInputValue('');
        processUserQuery(query);
    }

    const handleTalkToExecutive = () => {
        setStep('waiting');
        setMessages(prev => prev.filter(m => typeof m.content !== 'object')); // Clean up buttons
        addMessage('system', `Connecting you to an executive. You will be redirected shortly.`);
        
        // Redirect the admin to the conversation page
        if (user && userData) {
             const adminUrl = `/admin/messages?userId=${user.uid}&userName=${userData.displayName}`;
             window.open(adminUrl, '_blank'); // Open in a new tab for the admin
        }

        // Simulate connecting...
        setTimeout(() => {
            onClose(); // Close the chat popup for the user
        }, 3000);
    };

    const startTimer = (duration: number) => {
        setTimer(duration);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimer(prev => prev - 1);
        }, 1000);
    };

    useEffect(() => {
        if (step === 'waiting' && timer <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            
            if (!retryRef.current) {
                retryRef.current = true;
                addMessage('system', `We are experiencing high traffic. Please wait a little longer. New wait time: ${SECOND_TIMER} seconds.`);
                startTimer(SECOND_TIMER);
            } else {
                setStep('connected');
                setIsExecutiveConnecting(true);
                setTimeout(() => {
                    setIsExecutiveConnecting(false);
                    addMessage('bot', <><strong>Support Executive Joined.</strong><br/>Hello, my name is Alex. How can I assist you with your order?</>);
                }, 1500);
            }
        }
    }, [timer, step]);
    
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        }
    }, []);

    const canType = step === 'initial' || step === 'connected' || step === 'chatting';

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <AlertDialog open={step === 'confirm_executive'} onOpenChange={(open) => !open && setStep('initial')}>
                 <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Connect to Support Executive?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to be connected to a live support agent? An admin will be notified.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setStep('initial')}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleTalkToExecutive}>Yes, Connect</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Card className="w-64 h-[450px] flex flex-col shadow-2xl rounded-xl">
                <CardHeader className="flex flex-row items-center justify-between p-3 border-b bg-card">
                    <div className="flex items-center gap-3">
                         <Avatar>
                            <AvatarImage src={user?.photoURL || undefined} />
                            <AvatarFallback>
                                {user?.displayName ? user.displayName.charAt(0) : 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <h3 className="font-semibold">Help & Support</h3>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                        <X className="h-5 w-5" />
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 p-0 overflow-hidden">
                   <ScrollArea className="h-full" ref={scrollAreaRef}>
                     <div className="p-4 space-y-4">
                        {messages.map(msg => (
                            <div key={msg.id} className={cn("flex items-end gap-2", 
                                msg.sender === 'user' ? 'justify-end' : 
                                msg.sender === 'system' ? 'justify-center' : 'justify-start'
                            )}>
                                {msg.sender === 'bot' && !msg.hideAvatar && <MessageSquare className="w-6 h-6 text-primary flex-shrink-0" />}
                                {msg.sender === 'bot' && msg.hideAvatar && <div className="w-6 h-6 flex-shrink-0" />}

                                <div className={cn("max-w-[85%] rounded-lg px-3 py-2 text-sm",
                                    msg.sender === 'user' ? 'bg-primary text-primary-foreground' :
                                    msg.sender === 'system' ? 'text-xs text-muted-foreground italic text-center w-full' : 
                                    typeof msg.content === 'string' ? 'bg-muted' : ''
                                )}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                         {isLoadingResponse && (
                             <div className="flex items-end gap-2 justify-start">
                                  <MessageSquare className="w-6 h-6 text-primary flex-shrink-0" />
                                  <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                                     <LoadingMessage />
                                  </div>
                             </div>
                         )}
                          {isExecutiveConnecting && (
                             <div className="flex items-end gap-2 justify-start">
                                  <MessageSquare className="w-6 h-6 text-primary flex-shrink-0" />
                                  <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                                     <LoadingMessage />
                                  </div>
                             </div>
                         )}
                     </div>
                   </ScrollArea>
                </CardContent>
                <CardFooter className="p-2 border-t">
                    <form onSubmit={handleSendMessage} className="w-full flex items-center gap-2">
                         <Input 
                            placeholder="Type your message..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            autoComplete="off"
                            disabled={!canType || isLoadingResponse}
                         />
                         <Button type="submit" size="icon" disabled={!inputValue.trim() || !canType || isLoadingResponse}>
                            <Send className="w-4 h-4" />
                         </Button>
                    </form>
                </CardFooter>
            </Card>
        </div>
    );
}
