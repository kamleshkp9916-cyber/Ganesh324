
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { MessageSquare } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Conversation, ConversationList, ChatWindow, Message } from '@/components/messaging/common';
import { cn } from '@/lib/utils';

// Mock data to replace AI flows
const mockChatDatabase: Record<string, Message[]> = {
  "FashionFinds": [
    { id: 1, text: "Hey! I saw your stream and I'm interested in the vintage camera. Is it still available?", sender: 'customer', timestamp: '10:00 AM' },
    { id: 2, text: "Hi there! Yes, it is. It's in great working condition.", sender: 'seller', timestamp: '10:01 AM' },
    { id: 3, text: "Awesome! Could you tell me a bit more about the lens?", sender: 'customer', timestamp: '10:01 AM' },
  ],
  "GadgetGuru": [
      { id: 1, text: "I have a question about the X-1 Drone.", sender: 'customer', timestamp: 'Yesterday' },
      { id: 2, text: "Sure, what would you like to know?", sender: 'seller', timestamp: 'Yesterday' },
  ],
  "StreamCart": [
      { id: 1, text: "Welcome to StreamCart support!", sender: 'StreamCart', timestamp: 'Yesterday' },
  ]
};

const mockConversations: Conversation[] = [
    { userId: "FashionFinds", userName: "FashionFinds", avatarUrl: "https://placehold.co/40x40.png", lastMessage: "Awesome! Could you tell me a bit more about the lens?", lastMessageTimestamp: "10:01 AM", unreadCount: 1 },
    { userId: "GadgetGuru", userName: "GadgetGuru", avatarUrl: "https://placehold.co/40x40.png", lastMessage: "Sure, what would you like to know?", lastMessageTimestamp: "Yesterday", unreadCount: 0 },
];

export default function MessagePage() {
    const router = useRouter();
    const { user, userData, loading } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const isMobile = useIsMobile();
    
    useEffect(() => {
        const fetchConversations = async () => {
            if (!userData) return;
            try {
                let execMessages = mockChatDatabase['StreamCart'] || [];
                let executiveConversation: Conversation | null = null;
                if (execMessages.length > 0) {
                    const lastMessage = execMessages[execMessages.length - 1];
                    executiveConversation = {
                        userId: userData.uid,
                        userName: 'StreamCart',
                        avatarUrl: 'https://placehold.co/40x40/000000/FFFFFF?text=SC',
                        lastMessage: lastMessage.text || 'Image Sent',
                        lastMessageTimestamp: lastMessage.timestamp,
                        unreadCount: 0,
                        isExecutive: true,
                    };
                }

                let allConvos = [...mockConversations];
                if (executiveConversation) {
                    allConvos = [executiveConversation, ...allConvos];
                }

                setConversations(allConvos);
                if (allConvos.length > 0 && !isMobile) {
                    setSelectedConversation(allConvos[0]);
                }
            } catch (error) {
                console.error("Failed to fetch conversations:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchConversations();
    }, [userData, isMobile]);
    
    useEffect(() => {
        if (!loading && !user) {
            router.replace('/?showLogin=true');
        }
    }, [user, loading, router]);
    
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
