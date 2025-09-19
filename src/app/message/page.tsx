

"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Search, MoreVertical, Smile, Paperclip, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChatMessage, ConversationItem, Message, Conversation } from '@/components/messaging/common';


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

export const ConversationList = ({ conversations, selectedConversation, onSelectConversation, isIntegrated = false }: { conversations: Conversation[], selectedConversation: Conversation | null, onSelectConversation: (convo: Conversation) => void, isIntegrated?: boolean }) => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredConversations = useMemo(() => {
        if (!searchTerm) return conversations;
        return conversations.filter(convo => convo.userName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [conversations, searchTerm]);
    
    return (
         <div className="w-full h-full flex flex-col bg-background">
            <header className={cn("p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10 shrink-0", isIntegrated && "hidden")}>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-xl font-bold">Chats</h1>
                </div>
            </header>
            <div className="p-4 border-b">
                 <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search conversations..."
                        className="pl-8 w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <div className="p-2 flex-grow overflow-y-auto">
                {filteredConversations.map(convo => (
                    <ConversationItem 
                        key={convo.userId} 
                        convo={convo} 
                        onClick={() => onSelectConversation(convo)}
                        isSelected={selectedConversation?.userId === convo.userId}
                    />
                ))}
            </div>
        </div>
    );
};

export const ChatWindow = ({ conversation, userData, isIntegrated = false, onBack }: { conversation: Conversation, userData: any, isIntegrated?: boolean, onBack: () => void }) => {
    const isMobile = useIsMobile();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inputValue, setInputValue] = useState("");
    const chatContainerRef = useRef<HTMLDivElement>(null);
    
     useEffect(() => {
        const fetchMessages = () => {
            setIsLoading(true);
            setMessages([]);
            setTimeout(() => {
                try {
                    let chatHistory;
                    if (conversation.isExecutive) {
                        chatHistory = mockChatDatabase['StreamCart'] || [];
                    } else {
                        chatHistory = mockChatDatabase[conversation.userId] || [];
                    }
                    setMessages(chatHistory);
                } catch (error) {
                    console.error("Failed to fetch messages for", conversation.userId, error);
                } finally {
                    setIsLoading(false);
                }
            }, 500);
        }
        fetchMessages();
    }, [conversation]);
    
    useEffect(() => {
        chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !userData) return;

        const optimisticMessage: Message = {
            id: Math.random(),
            text: inputValue,
            sender: 'customer',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, optimisticMessage]);
        setInputValue("");
    };

    return (
         <div className="flex flex-col h-full w-full bg-background">
            <header className="p-4 border-b flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    {(isMobile && !isIntegrated) && (
                        <Button variant="ghost" size="icon" onClick={onBack}>
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    )}
                    <Link href={conversation.isExecutive ? `#` : `/seller/profile?userId=${conversation.userId}`} className="cursor-pointer group">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={conversation.avatarUrl} />
                                <AvatarFallback>{conversation.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="font-semibold group-hover:underline">{conversation.userName}</h2>
                                <p className="text-xs text-muted-foreground">Online</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </header>
            <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto bg-muted/20">
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-2/3" />
                        <Skeleton className="h-12 w-1/2 ml-auto" />
                    </div>
                ) : (
                    messages.map(msg => <ChatMessage key={msg.id} msg={msg} currentUserName={userData?.displayName || null} />)
                )}
            </div>
            <footer className="p-4 border-t shrink-0 bg-background">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                     <Input 
                        placeholder="Type a message" 
                        className="flex-grow" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                    <Button type="submit" size="icon" disabled={!inputValue.trim()}>
                        <Send className="h-5 w-5"/>
                    </Button>
                </form>
            </footer>
        </div>
    )
}

export function MessagesView({ userData, isIntegrated = false }: { userData: any, isIntegrated?: boolean }) {
    const router = useRouter();
    const isMobile = useIsMobile();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        const fetchConversations = async () => {
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
    
    if(isMobile && !isIntegrated) {
        return selectedConversation ? (
             <ChatWindow 
                conversation={selectedConversation}
                userData={userData}
                isIntegrated={false}
                onBack={() => setSelectedConversation(null)}
            />
        ) : (
            <ConversationList
                conversations={conversations}
                selectedConversation={selectedConversation}
                onSelectConversation={setSelectedConversation}
            />
        );
    }

    return (
        <div className="flex h-full">
            <div className="h-full w-1/3 flex-col border-r hidden md:flex">
                 <ConversationList
                    conversations={conversations}
                    selectedConversation={selectedConversation}
                    onSelectConversation={setSelectedConversation}
                    isIntegrated={isIntegrated}
                />
            </div>
            <div className="h-full w-2/3 flex-col hidden md:flex">
                {selectedConversation ? (
                     <ChatWindow 
                        conversation={selectedConversation}
                        userData={userData}
                        isIntegrated={isIntegrated}
                        onBack={() => {}}
                    />
                ) : (
                     <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <MessageSquare className="h-16 w-16 mb-4"/>
                        <h2 className="text-xl font-semibold">Select a chat</h2>
                        <p>Choose a conversation to start messaging.</p>
                    </div>
                 )}
            </div>
        </div>
    );
}

export default function MessagePage() {
    const router = useRouter();
    const { user, userData, loading } = useAuth();
    
    useEffect(() => {
        if (!loading && !user) {
            router.replace('/?showLogin=true');
        }
    }, [user, loading, router]);
    
    if (loading || !user || !userData) {
        return <div className="h-screen w-full flex items-center justify-center"><LoadingSpinner /></div>;
    }
    
    return (
        <div className="h-screen w-full">
            <MessagesView userData={userData} />
        </div>
    );
}
