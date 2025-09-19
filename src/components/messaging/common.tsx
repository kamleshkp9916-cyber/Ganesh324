
"use client";

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreVertical, Search, Send, Smile, Paperclip, MessageSquare, Menu } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { MainSidebar } from '../main-sidebar';
import { useAuth } from '@/hooks/use-auth';

export type Message = { id: number | string, text?: string, sender: string, timestamp: string, image?: string };
export type Conversation = { userId: string, userName: string, avatarUrl: string, lastMessage: string, lastMessageTimestamp: string, unreadCount: number, isExecutive?: boolean };


export function ChatMessage({ msg, currentUserName }: { msg: Message, currentUserName: string | null }) {
    const isMe = msg.sender === 'customer' || msg.sender === currentUserName || (currentUserName === 'StreamCart' && msg.sender === 'StreamCart');

    let avatarInitial = 'S'; // Seller/System default
    if (msg.sender === 'customer') {
        avatarInitial = 'C';
    } else if (msg.sender !== 'StreamCart' && msg.sender.length > 0) {
        avatarInitial = msg.sender.charAt(0).toUpperCase();
    }


    return (
        <div className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
            {!isMe && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://placehold.co/40x40.png`} />
                    <AvatarFallback>{avatarInitial}</AvatarFallback>
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

export function ConversationItem({ convo, onClick, isSelected }: { convo: Conversation, onClick: () => void, isSelected: boolean }) {
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


export const ConversationList = ({ conversations, selectedConversation, onSelectConversation }: { conversations: Conversation[], selectedConversation: Conversation | null, onSelectConversation: (convo: Conversation) => void }) => {
    const router = useRouter();
    const { user, userData, userPosts = [], feedFilter = 'global', activeView = 'messages' } = useAuth() as any;
    const [searchTerm, setSearchTerm] = useState('');

    const filteredConversations = useMemo(() => {
        if (!searchTerm) return conversations;
        return conversations.filter(convo => convo.userName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [conversations, searchTerm]);
    
    return (
         <div className="w-full h-full flex flex-col bg-background">
            <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10 shrink-0">
                <div className="flex items-center gap-2">
                    {userData && (
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-6 w-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0">
                                <MainSidebar userData={userData} userPosts={userPosts} feedFilter={feedFilter} setFeedFilter={() => {}} activeView={activeView} setActiveView={(view) => router.push(view === 'feed' ? '/feed' : `/${view}`)} />
                            </SheetContent>
                        </Sheet>
                    )}
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
                    {isMobile && (
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
};
