
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { UserData } from "@/lib/follow-data";
import { ArrowLeft, Loader2, Search, Send, Smile } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { getMessages, sendMessage, getConversations } from "@/ai/flows/chat-flow";
import { Skeleton } from "../ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

export interface Message {
  id: number | string;
  text?: string;
  imageUrl?: string;
  sender: 'customer' | 'seller' | 'StreamCart';
  timestamp: string;
}

export interface Conversation {
  userId: string;
  userName: string;
  avatarUrl: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  unreadCount: number;
  isExecutive?: boolean;
}

export const ConversationItem = ({ convo, isSelected, onClick }: { convo: Conversation, isSelected: boolean, onClick: () => void }) => (
    <button
        className={cn(
            "w-full text-left p-2 flex items-center gap-3 rounded-lg",
            isSelected ? "bg-primary/10" : "hover:bg-muted"
        )}
        onClick={onClick}
    >
        <Avatar>
            <AvatarImage src={convo.avatarUrl} />
            <AvatarFallback>{convo.userName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow overflow-hidden">
            <div className="flex justify-between items-center">
                <p className="font-semibold text-sm truncate">{convo.userName}</p>
                <p className="text-xs text-muted-foreground flex-shrink-0">{convo.lastMessageTimestamp}</p>
            </div>
            <div className="flex justify-between items-start">
                <p className="text-xs text-muted-foreground truncate">{convo.lastMessage}</p>
                {convo.unreadCount > 0 && (
                    <div className="w-4 h-4 bg-primary text-primary-foreground text-xs flex items-center justify-center rounded-full flex-shrink-0">
                        {convo.unreadCount}
                    </div>
                )}
            </div>
        </div>
    </button>
);


export const ChatMessage = ({ msg, currentUserName }: { msg: Message, currentUserName: string }) => {
    const isMyMessage = msg.sender === currentUserName;
    return (
        <div key={msg.id} className={cn("flex items-end gap-2", isMyMessage ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[75%] rounded-lg px-3 py-2", isMyMessage ? "bg-primary text-primary-foreground" : "bg-muted")}>
                {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                {msg.imageUrl && <img src={msg.imageUrl} alt="sent" className="rounded-md max-w-full h-auto mt-2" />}
                <p className={cn("text-xs mt-1", isMyMessage ? "text-primary-foreground/70 text-right" : "text-muted-foreground text-right")}>
                    {msg.timestamp}
                </p>
            </div>
        </div>
    );
};

export const ConversationList = ({ conversations, selectedConversation, onSelectConversation }: {
    conversations: Conversation[];
    selectedConversation: Conversation | null;
    onSelectConversation: (convo: Conversation) => void;
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const filteredConversations = useMemo(() => {
        if (!searchTerm) return conversations;
        return conversations.filter(convo => convo.userName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [conversations, searchTerm]);

    return (
        <>
            <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10 shrink-0 h-16">
                <div className="flex items-center gap-2">
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
            <ScrollArea className="flex-grow">
                <div className="p-2 space-y-1">
                    {filteredConversations.map(convo => (
                        <ConversationItem
                            key={convo.userId}
                            convo={convo}
                            onClick={() => onSelectConversation(convo)}
                            isSelected={selectedConversation?.userId === convo.userId}
                        />
                    ))}
                </div>
            </ScrollArea>
        </>
    );
};


export const ChatWindow = ({ conversation, userData, onBack }: {
    conversation: Conversation;
    userData: UserData;
    onBack: () => void;
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isChatLoading, setIsChatLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();

    useEffect(() => {
        const fetchMessages = async () => {
            setIsChatLoading(true);
            try {
                const chatHistory = await getMessages(conversation.userId);
                setMessages(chatHistory);
            } catch (error) {
                console.error("Failed to fetch messages for", conversation.userId, error);
            } finally {
                setIsChatLoading(false);
            }
        };
        fetchMessages();
    }, [conversation.userId]);

    useEffect(() => {
        chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !conversation || !userData) return;
        
        const from = userData.role || 'customer';
        const optimisticMessage: Message = {
            id: Math.random(),
            text: newMessage,
            sender: from as 'customer' | 'seller' | 'StreamCart',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, optimisticMessage]);
        const currentMessage = newMessage;
        setNewMessage("");

        try {
            const updatedMessages = await sendMessage(conversation.userId, { text: currentMessage }, from as 'customer' | 'seller' | 'StreamCart');
            setMessages(updatedMessages);
        } catch (error) {
            console.error("Failed to send message", error);
            setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id)); // Revert on error
        }
    };
    
    return (
        <>
            <header className="p-4 border-b flex items-center justify-between shrink-0 h-16">
                <div className="flex items-center gap-2">
                    {isMobile && (
                        <Button variant="ghost" size="icon" onClick={onBack}>
                            <ArrowLeft className="h-6 w-6" />
                        </Button>
                    )}
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={conversation.avatarUrl} />
                            <AvatarFallback>{conversation.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="font-semibold">{conversation.userName}</h2>
                            <p className="text-xs text-muted-foreground">Online</p>
                        </div>
                    </div>
                </div>
            </header>
            <ScrollArea className="flex-grow bg-muted/20" ref={chatContainerRef}>
                <div className="p-4 space-y-4">
                    {isChatLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-12 w-2/3" />
                            <Skeleton className="h-12 w-1/2 ml-auto" />
                            <Skeleton className="h-16 w-3/4" />
                        </div>
                    ) : messages.length > 0 ? (
                        messages.map(msg => <ChatMessage key={msg.id} msg={msg} currentUserName={userData.role || 'customer'} />)
                    ) : (
                        <div className="text-center text-muted-foreground py-8">Start the conversation!</div>
                    )}
                </div>
            </ScrollArea>
            <footer className="p-4 border-t shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" type="button"><Smile className="h-5 w-5" /></Button>
                    <Input 
                        placeholder="Type a message" 
                        className="flex-grow" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                        <Send className="h-5 w-5"/>
                    </Button>
                </form>
            </footer>
        </>
    );
};
