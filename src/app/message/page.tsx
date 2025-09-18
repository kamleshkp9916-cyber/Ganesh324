
"use client";

import Link from 'next/link';
import {
  MessageSquare,
  ArrowLeft,
  Search,
  Send
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useIsMobile } from '@/hooks/use-mobile';

type Message = { id: number | string, text?: string, sender: string, timestamp: string, image?: string };
type Conversation = { userId: string, userName: string, avatarUrl: string, lastMessage: string, lastMessageTimestamp: string, unreadCount: number, isExecutive?: boolean };

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


function ChatMessage({ msg, currentUserName }: { msg: Message, currentUserName: string | null }) {
    const isMe = msg.sender === 'customer' || msg.sender === currentUserName;
    return (
        <div className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
            {!isMe && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://placehold.co/40x40.png`} />
                    <AvatarFallback>{'S'}</AvatarFallback>
                </Avatar>
            )}
            <div className={`max-w-[70%] rounded-lg px-3 py-2 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {msg.text && <p className="text-sm">{msg.text}</p>}
                {msg.image && (
                    <Image src={msg.image} alt="Sent image" width={200} height={200} className="rounded-md mt-2" />
                )}
                <p className={`text-xs mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'} text-right`}>
                    {msg.timestamp}
                </p>
            </div>
        </div>
    );
}

function ConversationItem({ convo, onClick, isSelected }: { convo: Conversation, onClick: () => void, isSelected: boolean }) {
    return (
        <div 
            className={cn(
                "flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted",
                isSelected && "bg-muted"
            )}
            onClick={onClick}
        >
            <Avatar className="h-12 w-12">
                <AvatarImage src={convo.avatarUrl} alt={convo.userName} />
                <AvatarFallback>{convo.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow overflow-hidden">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold truncate">{convo.userName}</h4>
                    <p className="text-xs text-muted-foreground flex-shrink-0">{convo.lastMessageTimestamp}</p>
                </div>
                <div className="flex justify-between items-start">
                    <p className="text-sm text-muted-foreground truncate">{convo.lastMessage}</p>
                    {convo.unreadCount > 0 && (
                        <Badge className="bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center text-xs ml-2 flex-shrink-0">
                            {convo.unreadCount}
                        </Badge>
                    )}
                </div>
            </div>
        </div>
    );
}

const MessagesView = ({ userData }: { userData: any }) => {
    const router = useRouter();
    const isMobile = useIsMobile();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [inputValue, setInputValue] = useState("");
    
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
                    handleSelectConversation(allConvos[0]);
                }
            } catch (error) {
                console.error("Failed to fetch conversations:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchConversations();
    }, [userData, isMobile]);
    
    const handleSelectConversation = async (convo: Conversation) => {
        setSelectedConversation(convo);
        setIsChatLoading(true);
        setMessages([]);
        setTimeout(() => {
            try {
                let chatHistory;
                if (convo.isExecutive) {
                    chatHistory = mockChatDatabase['StreamCart'] || [];
                } else {
                    chatHistory = mockChatDatabase[convo.userId] || [];
                }
                setMessages(chatHistory);
            } catch (error) {
                console.error("Failed to fetch messages for", convo.userId, error);
            } finally {
                setIsChatLoading(false);
            }
        }, 500);
    }
    
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !selectedConversation || !userData) return;

        const optimisticMessage: Message = {
            id: Math.random(),
            text: inputValue,
            sender: 'customer',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, optimisticMessage]);
        setInputValue("");

        // Mock sending message
    };
    
    useEffect(() => {
        chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight });
    }, [messages]);
    
    const conversationListContent = (
         <aside className="w-full h-full border-r flex-col flex bg-background">
            <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10 shrink-0">
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
                {conversations.map(convo => (
                    <ConversationItem 
                        key={convo.userId} 
                        convo={convo} 
                        onClick={() => handleSelectConversation(convo)}
                        isSelected={selectedConversation?.userId === convo.userId}
                    />
                ))}
            </div>
        </aside>
    );

    const chatWindowContent = (
        <main className="w-full h-full flex flex-col bg-background">
            {selectedConversation ? (
                <>
                    <header className="p-4 border-b flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            {isMobile && (
                                <Button variant="ghost" size="icon" onClick={() => setSelectedConversation(null)}>
                                    <ArrowLeft className="h-6 w-6" />
                                </Button>
                            )}
                            <Link href={selectedConversation.isExecutive ? `#` : `/seller/profile?userId=${selectedConversation.userId}`} className="cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={selectedConversation.avatarUrl} />
                                        <AvatarFallback>{selectedConversation.userName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h2 className="font-semibold group-hover:underline">{selectedConversation.userName}</h2>
                                        <p className="text-xs text-muted-foreground">Online</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </header>
                    <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto bg-muted/20">
                        {isChatLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-12 w-2/3" />
                                <Skeleton className="h-12 w-1/2 ml-auto" />
                            </div>
                        ) : (
                            messages.map(msg => <ChatMessage key={msg.id} msg={msg} currentUserName={userData?.displayName || null} />)
                        )}
                    </div>
                    <footer className="p-4 border-t shrink-0">
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
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <MessageSquare className="h-16 w-16 mb-4"/>
                    <h2 className="text-xl font-semibold">Select a chat</h2>
                    <p>Choose a conversation to start messaging.</p>
                </div>
            )}
        </main>
    );

    if(isMobile) {
        return selectedConversation ? chatWindowContent : conversationListContent;
    }

    return (
        <div className="flex h-full">
            <div className="w-1/3 lg:w-1/4">
                {conversationListContent}
            </div>
            <div className="w-2/3 lg:w-3/4">
                {chatWindowContent}
            </div>
        </div>
    )
}

export default function MessagePage() {
    const router = useRouter();
    const { user, userData, loading } = useAuth();

    if (loading) {
        return <div className="h-screen w-full flex items-center justify-center"><LoadingSpinner /></div>;
    }

    if (!user || !userData) {
        router.push('/');
        return null;
    }
    
    return (
        <div className="h-screen w-full">
            <MessagesView userData={userData} />
        </div>
    )

    