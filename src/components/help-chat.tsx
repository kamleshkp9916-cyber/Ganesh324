
"use client";

import { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { X, MessageSquare, Clock, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth.tsx';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Skeleton } from './ui/skeleton';

type ChatStep = 'initial' | 'waiting' | 'connected';
const INITIAL_TIMER = 30; // 30 seconds
const SECOND_TIMER = 15; // 15 seconds

const quickReplies = [
    "Where is my order?",
    "Problem with my item",
    "Payment issue",
];

const LoadingMessage = () => (
    <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-[50px]" />
    </div>
);


export function HelpChat({ onClose }: { onClose: () => void }) {
    const { user } = useAuth();
    const [step, setStep] = useState<ChatStep>('initial');
    const [messages, setMessages] = useState<{ id: number, sender: 'user' | 'bot' | 'system', content: React.ReactNode }[]>([
        { id: 1, sender: 'bot', content: "Hi there! How can I help you today?" }
    ]);
    const [timer, setTimer] = useState(INITIAL_TIMER);
    const [isExecutiveConnecting, setIsExecutiveConnecting] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const retryRef = useRef(false); // To track if we are on the second timer attempt

    const addMessage = (sender: 'user' | 'bot' | 'system', content: React.ReactNode) => {
        setMessages(prev => [...prev, { id: prev.length + 1, sender, content }]);
    };

    const handleQuickReply = (reply: string) => {
        addMessage('user', reply);
        if (reply === "Talk to a support executive") {
            handleTalkToExecutive();
        } else {
            // Simulate a bot response
            setTimeout(() => {
                addMessage('bot', `I see you have an issue with: "${reply}". Could you please provide more details?`);
            }, 500);
        }
    };

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
                           {msg.sender === 'bot' && <MessageSquare className="w-6 h-6 text-primary flex-shrink-0" />}
                           <div className={cn("max-w-[85%] rounded-lg px-3 py-2 text-sm",
                               msg.sender === 'user' ? 'bg-primary text-primary-foreground' :
                               msg.sender === 'system' ? 'text-xs text-muted-foreground italic text-center' : 'bg-muted'
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
                    {step === 'initial' && (
                        <div className="w-full flex flex-wrap gap-2 justify-center">
                            {[...quickReplies, "Talk to a support executive"].map(reply => (
                                <Button key={reply} size="sm" variant="outline" onClick={() => handleQuickReply(reply)}>
                                    {reply}
                                </Button>
                            ))}
                        </div>
                    )}
                     {step === 'waiting' && (
                        <div className="w-full text-center text-sm text-muted-foreground p-2">
                           <div className="flex items-center justify-center gap-2">
                             <Clock className="w-4 h-4 animate-spin" />
                             <span>Connecting... {timer}s</span>
                           </div>
                        </div>
                    )}
                     {step === 'connected' && (
                        <div className="w-full text-center text-sm text-green-600 p-2">
                           <div className="flex items-center justify-center gap-2">
                             <UserCheck className="w-4 h-4" />
                             <span>Connected to Support Executive</span>
                           </div>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}

