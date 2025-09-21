
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { MessageSquare } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ConversationList, ChatWindow, Conversation } from '@/components/messaging/common';
import { cn } from '@/lib/utils';
import { getConversations } from '@/ai/flows/chat-flow';


export default function MessagePage() {
    const router = useRouter();
    const { user, userData, loading } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const isMobile = useIsMobile();
    
    const fetchConversations = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const convos = await getConversations(user.uid);
            
            // Add StreamCart support conversation if not present
            let supportConvo = convos.find(c => c.userId === 'StreamCart');
            if (!supportConvo) {
                supportConvo = {
                    conversationId: [user.uid, 'StreamCart'].sort().join('_'),
                    userId: 'StreamCart',
                    userName: 'StreamCart Support',
                    avatarUrl: 'https://placehold.co/40x40/000000/FFFFFF?text=SC',
                    lastMessage: 'Welcome to StreamCart support!',
                    lastMessageTimestamp: 'Yesterday',
                    unreadCount: 0,
                    isExecutive: true,
                };
                convos.unshift(supportConvo);
            }
            
            setConversations(convos);

            if (convos.length > 0 && !selectedConversation && !isMobile) {
                setSelectedConversation(convos[0]);
            }
        } catch (error) {
            console.error("Failed to fetch conversations:", error);
        } finally {
            setIsLoading(false);
        }
    }, [user, isMobile, selectedConversation]);

    useEffect(() => {
        if (!loading && user) {
            fetchConversations();
        } else if (!loading && !user) {
            router.replace('/?showLogin=true');
        }
    }, [user, loading, router, fetchConversations]);
    
    if (loading || isLoading || !user || !userData) {
        return <div className="h-screen w-full flex items-center justify-center"><LoadingSpinner /></div>;
    }

    return (
        <div className="h-screen w-full flex overflow-hidden">
            <div className={cn(
                "h-full w-full flex-col border-r md:flex md:w-1/3",
                isMobile && selectedConversation && "hidden"
            )}>
                 <ConversationList
                    conversations={conversations}
                    selectedConversation={selectedConversation}
                    onSelectConversation={setSelectedConversation}
                />
            </div>
            
            <div className={cn(
                "h-full w-full flex-col md:flex md:w-2/3",
                isMobile && !selectedConversation && "hidden"
            )}>
                {selectedConversation ? (
                     <ChatWindow 
                        key={selectedConversation.userId}
                        conversation={selectedConversation}
                        userData={userData}
                        onBack={() => setSelectedConversation(null)}
                    />
                ) : (
                     <div className="hidden md:flex flex-col items-center justify-center h-full text-muted-foreground">
                        <MessageSquare className="h-16 w-16 mb-4"/>
                        <h2 className="text-xl font-semibold">Select a chat</h2>
                        <p>Choose a conversation to start messaging.</p>
                    </div>
                 )}
            </div>
        </div>
    );
}
