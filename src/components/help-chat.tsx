
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { X, MessageSquare, Clock, UserCheck, Send, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth.tsx';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { Input } from './ui/input';
import { Order } from '@/lib/order-data';

type ChatStep = 'initial' | 'waiting' | 'connected' | 'chatting';
type Message = { id: number, sender: 'user' | 'bot' | 'system', content: React.ReactNode, hideAvatar?: boolean };
type ConversationState = {
    message: string;
    quickReplies: string[];
}

const INITIAL_TIMER = 30;
const SECOND_TIMER = 15;

const initialQuickReplies = [
    "Where is my order?",
    "Problem with my item",
    "Payment issue",
    "Can I change my delivery address?",
    "Talk to a support executive",
];

const LoadingMessage = () => (
    <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-[50px]" />
    </div>
);

const QuickReplyButtons = ({ replies, onSelect, onBack, showBack }: { replies: string[], onSelect: (reply: string) => void, onBack?: () => void, showBack?: boolean }) => (
    <div className="w-full flex flex-wrap gap-2 justify-start mt-2">
        {replies.map(reply => (
            <Button key={reply} size="sm" variant="outline" onClick={() => onSelect(reply)}>
                {reply}
            </Button>
        ))}
        {showBack && (
            <Button size="sm" variant="ghost" onClick={onBack}>
                <ArrowLeft className="mr-2 h-4 w-4"/> Go Back
            </Button>
        )}
    </div>
);


export function HelpChat({ order, onClose }: { order: Order, onClose: () => void }) {
    const { user } = useAuth();
    const [step, setStep] = useState<ChatStep>('initial');
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [conversationHistory, setConversationHistory] = useState<ConversationState[]>([]);
    const [currentQuickReplies, setCurrentQuickReplies] = useState(initialQuickReplies);
    const [interactions, setInteractions] = useState(0);

    const [timer, setTimer] = useState(INITIAL_TIMER);
    const [isExecutiveConnecting, setIsExecutiveConnecting] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const retryRef = useRef(false);

     useEffect(() => {
        const initialState = {
            message: "Hi there! How can I help you today?",
            quickReplies: initialQuickReplies
        };
        setMessages([
             { id: 1, sender: 'bot', content: initialState.message },
             { id: 2, sender: 'bot', content: <QuickReplyButtons replies={initialState.quickReplies} onSelect={handleQuickReply} />, hideAvatar: true },
        ]);
        setConversationHistory([initialState]);
    }, []);

    const addMessage = (sender: 'user' | 'bot' | 'system', content: React.ReactNode, hideAvatar: boolean = false) => {
        setMessages(prev => [...prev, { id: prev.length + 1, sender, content, hideAvatar }]);
    };
    
    const showQuickReplies = (message: string, replies: string[]) => {
        const newState: ConversationState = { message, quickReplies: replies };
        setConversationHistory(prev => [...prev, newState]);
        setCurrentQuickReplies(replies);
        
        addMessage('bot', message, false);
        addMessage('bot', <QuickReplyButtons replies={replies} onSelect={handleQuickReply} onBack={handleBack} showBack={conversationHistory.length > 1} />, true);
    }
    
    const handleBack = () => {
        const history = [...conversationHistory];
        history.pop(); // Remove current state
        const prevState = history[history.length - 1];

        if (prevState) {
            setConversationHistory(history);
            setCurrentQuickReplies(prevState.quickReplies);
            addMessage('system', 'Going back to previous options...');
            addMessage('bot', prevState.message, false);
            addMessage('bot', <QuickReplyButtons replies={prevState.quickReplies} onSelect={handleQuickReply} onBack={handleBack} showBack={history.length > 1}/>, true);
        }
    }

    const handleQuickReply = (reply: string) => {
        setMessages(prev => prev.slice(0, -1)); // Remove the old buttons
        addMessage('user', reply);
        setInteractions(prev => prev + 1);

        const remainingReplies = currentQuickReplies.filter(r => r !== reply);
        
        let responseMessage = "";
        let nextReplies = remainingReplies;
        
        setTimeout(() => {
            switch (reply) {
                case "Talk to a support executive":
                    handleTalkToExecutive();
                    return; // Exit here as handleTalkToExecutive manages its own flow
                case "Where is my order?":
                    const lastStatus = [...order.timeline].reverse().find(step => step.completed)?.status || "Order details being processed.";
                    responseMessage = `Your order is currently at: ${lastStatus}. Is there anything else I can help with?`;
                    break;
                case "Problem with my item":
                    responseMessage = "I'm sorry to hear that. Could you please describe the problem with your item?";
                    nextReplies = []; // Expect user input
                    break;
                case "Payment issue":
                    responseMessage = "I understand you're having a payment issue. For security, let's connect you with a support executive to resolve this.";
                    nextReplies = ["Talk to a support executive"];
                    break;
                 case "Can I change my delivery address?":
                    responseMessage = "For security reasons, the delivery address cannot be changed after an order is confirmed. You would need to cancel this order and place a new one with the correct address. Can I help with anything else?";
                    break;
                default:
                    responseMessage = `I see you have an issue with: "${reply}". Could you please provide more details?`;
                    nextReplies = []; // Expect user input
                    break;
            }

            if (interactions >= 1 && !nextReplies.includes("Talk to a support executive")) {
                 nextReplies.push("Talk to a support executive");
            }
            
            if (nextReplies.length > 0) {
                 showQuickReplies(responseMessage, nextReplies);
            } else {
                 addMessage('bot', responseMessage);
            }
        }, 800);
    };
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        addMessage('user', inputValue);
        setInputValue('');
        setInteractions(prev => prev + 1);

        setTimeout(() => {
            const nextReplies = initialQuickReplies.filter(r => r !== 'Problem with my item');
            showQuickReplies("Thanks for the information. Here are some other options that might help:", nextReplies);
        }, 800);
    }

    const handleTalkToExecutive = () => {
        setStep('waiting');
        setMessages(prev => prev.filter(m => m.sender !== 'bot' || typeof m.content !== 'object')); // Clean up buttons
        addMessage('system', `Please wait while we connect you to an executive. Estimated wait time: ${INITIAL_TIMER} seconds.`);
        startTimer(INITIAL_TIMER);
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

    const canType = step === 'initial' || step === 'connected';

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Card className="w-80 h-[450px] flex flex-col shadow-2xl rounded-xl">
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
                <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto">
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
                    {isExecutiveConnecting && (
                        <div className="flex items-end gap-2 justify-start">
                             <MessageSquare className="w-6 h-6 text-primary flex-shrink-0" />
                             <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                                <LoadingMessage />
                             </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="p-2 border-t">
                    {step === 'waiting' ? (
                        <div className="w-full text-center text-sm text-muted-foreground p-2">
                           <div className="flex items-center justify-center gap-2">
                             <Clock className="w-4 h-4 animate-spin" />
                             <span>Connecting... {timer}s</span>
                           </div>
                        </div>
                    ) : (
                         <form onSubmit={handleSendMessage} className="w-full flex items-center gap-2">
                             <Input 
                                placeholder="Type your message..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                autoComplete="off"
                                disabled={!canType}
                             />
                             <Button type="submit" size="icon" disabled={!inputValue.trim() || !canType}>
                                <Send className="w-4 h-4" />
                             </Button>
                        </form>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
