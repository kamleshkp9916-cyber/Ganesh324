
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { X, MessageSquare, Clock, UserCheck, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth.tsx';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Skeleton } from './ui/skeleton';
import { Input } from './ui/input';
import { Order, getStatusFromTimeline } from '@/lib/order-data';

type ChatStep = 'initial' | 'waiting' | 'connected' | 'chatting';
const INITIAL_TIMER = 30; // 30 seconds
const SECOND_TIMER = 15; // 15 seconds

const initialQuickReplies = [
    "Where is my order?",
    "Problem with my item",
    "Payment issue",
    "Can I change my delivery address?",
];

const LoadingMessage = () => (
    <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-[50px]" />
    </div>
);

const QuickReplyButtons = ({ onSelect }: { onSelect: (reply: string) => void }) => (
    <div className="w-full flex flex-wrap gap-2 justify-start mt-2">
        {[...initialQuickReplies, "Talk to a support executive"].map(reply => (
            <Button key={reply} size="sm" variant="outline" onClick={() => onSelect(reply)}>
                {reply}
            </Button>
        ))}
    </div>
);


export function HelpChat({ order, onClose }: { order: Order, onClose: () => void }) {
    const { user } = useAuth();
    const [step, setStep] = useState<ChatStep>('initial');
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<{ id: number, sender: 'user' | 'bot' | 'system', content: React.ReactNode, hideAvatar?: boolean }[]>([]);
    const [timer, setTimer] = useState(INITIAL_TIMER);
    const [isExecutiveConnecting, setIsExecutiveConnecting] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const retryRef = useRef(false); // To track if we are on the second timer attempt

     useEffect(() => {
        // Initialize with default messages
        setMessages([
             { id: 1, sender: 'bot', content: "Hi there! How can I help you today?" },
             { id: 2, sender: 'bot', content: <QuickReplyButtons onSelect={(reply) => handleQuickReply(reply)} />, hideAvatar: true },
        ]);
    }, []);

    const addMessage = (sender: 'user' | 'bot' | 'system', content: React.ReactNode, hideAvatar: boolean = false) => {
        setMessages(prev => [...prev, { id: prev.length + 1, sender, content, hideAvatar }]);
    };

    const handleQuickReply = (reply: string) => {
        addMessage('user', reply);

        setTimeout(() => {
            switch (reply) {
                case "Talk to a support executive":
                    handleTalkToExecutive();
                    break;
                case "Where is my order?":
                    const lastStatus = [...order.timeline].reverse().find(step => step.completed)?.status || "Order details being processed.";
                    addMessage('bot', `Your order is currently at: ${lastStatus}`);
                    addMessage('bot', <QuickReplyButtons onSelect={(r) => handleQuickReply(r)} />, true);
                    break;
                case "Problem with my item":
                    addMessage('bot', "I'm sorry to hear that. Could you please describe the problem with your item?");
                    break;
                case "Payment issue":
                    addMessage('bot', "I understand you're having a payment issue. For security, let's connect you with a support executive to resolve this.");
                    addMessage('bot', <QuickReplyButtons onSelect={(r) => handleQuickReply(r)} />, true);
                    break;
                 case "Can I change my delivery address?":
                    addMessage('bot', "For security reasons, the delivery address cannot be changed after an order is confirmed. You would need to cancel this order and place a new one with the correct address.");
                    addMessage('bot', <QuickReplyButtons onSelect={(r) => handleQuickReply(r)} />, true);
                    break;
                default:
                    addMessage('bot', `I see you have an issue with: "${reply}". Could you please provide more details?`);
                    break;
            }
        }, 800);
    };
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        addMessage('user', inputValue);
        setInputValue('');

        setTimeout(() => {
            addMessage('bot', "Thanks for the information. Here are some options that might help:");
            addMessage('bot', <QuickReplyButtons onSelect={(reply) => handleQuickReply(reply)} />, true);
        }, 800);
    }

    const handleTalkToExecutive = () => {
        setStep('waiting');
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
                // First timer expired
                retryRef.current = true;
                addMessage('system', `We are experiencing high traffic. Please wait a little longer. New wait time: ${SECOND_TIMER} seconds.`);
                startTimer(SECOND_TIMER);
            } else {
                // Second timer expired, simulate connection
                setStep('connected');
                setIsExecutiveConnecting(true);
                setTimeout(() => {
                    setIsExecutiveConnecting(false);
                    addMessage('bot', <><strong>Support Executive Joined.</strong><br/>Hello, my name is Alex. How can I assist you with your order?</>);
                }, 1500);
            }
        }
    }, [timer, step]);
    
    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        }
    }, []);

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
                    {step === 'initial' || step === 'connected' ? (
                        <form onSubmit={handleSendMessage} className="w-full flex items-center gap-2">
                             <Input 
                                placeholder="Type your message..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                autoComplete="off"
                                disabled={step !== 'initial' && step !== 'connected'}
                             />
                             <Button type="submit" size="icon" disabled={!inputValue.trim()}>
                                <Send className="w-4 h-4" />
                             </Button>
                        </form>
                    ) : step === 'waiting' ? (
                        <div className="w-full text-center text-sm text-muted-foreground p-2">
                           <div className="flex items-center justify-center gap-2">
                             <Clock className="w-4 h-4 animate-spin" />
                             <span>Connecting... {timer}s</span>
                           </div>
                        </div>
                    ) : null}
                </CardFooter>
            </Card>
        </div>
    );
}
