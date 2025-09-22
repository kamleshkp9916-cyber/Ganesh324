
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { MessageSquare } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ConversationList, ChatWindow, Conversation, Message } from '@/components/messaging/common';
import { cn } from '@/lib/utils';
import { getConversations } from '@/ai/flows/chat-flow';


const mockConversations: Conversation[] = [
    { conversationId: '1', userId: "support", userName: "StreamCart Support", avatarUrl: "https://placehold.co/40x40/000000/FFFFFF?text=SC", lastMessage: "Yes, we can help with that!", lastMessageTimestamp: "10:30 AM", unreadCount: 1, isExecutive: true },
];

const mockMessages: Record<string, Message[]> = {
  "support": [
    { id: 1, senderId: 'customer', text: 'I have an issue with my recent order.', timestamp: '10:28 AM' },
    { id: 2, senderId: 'support', text: 'Hello! I can certainly help you with that. Can you please provide me with the order ID?', timestamp: '10:29 AM' },
    { id: 3, senderId: 'customer', text: 'It is #ORD5896.', timestamp: '10:29 AM' },
    { id: 4, senderId: 'support', text: 'Thank you. One moment while I look that up for you.', timestamp: '10:30 AM' },
  ]
};


export default function MessagePage() {
    const router = useRouter();
    const { user, userData, loading } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const isMobile = useIsMobile();
    
    useEffect(() => {
        if (!loading && user) {
            setIsLoading(true);
            setConversations(mockConversations);
            if (mockConversations.length > 0) {
              const convoToSelect = mockConversations[0];
              setSelectedConversation(convoToSelect);
              setMessages(mockMessages[convoToSelect.userId] || []);
            }
            setIsLoading(false);
        } else if (!loading && !user) {
            router.replace('/?showLogin=true');
        }
    }, [user, loading, router]);
    
    const handleSelectConversation = (convo: Conversation) => {
        setSelectedConversation(convo);
        setMessages(mockMessages[convo.userId] || []);
    };
    
    if (loading || isLoading || !user || !userData) {
        return <div className="h-screen w-full flex items-center justify-center"><LoadingSpinner /></div>;
    }

    return (
        <div className="h-screen w-full flex overflow-hidden">
             {selectedConversation ? (
                 <ChatWindow 
                    key={selectedConversation.userId}
                    conversation={selectedConversation}
                    userData={userData}
                    messages={messages}
                    onSendMessage={(text) => {
                        const newMessage: Message = {
                            id: Date.now(),
                            senderId: user.uid,
                            text,
                            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        };
                        setMessages(prev => [...prev, newMessage]);
                    }}
                    onBack={() => router.back()}
                    isFullScreen={true}
                />
            ) : (
                 <div className="flex flex-col items-center justify-center h-full w-full text-muted-foreground">
                    <MessageSquare className="h-16 w-16 mb-4"/>
                    <h2 className="text-xl font-semibold">No Conversation Selected</h2>
                </div>
             )}
        </div>
    );
}
