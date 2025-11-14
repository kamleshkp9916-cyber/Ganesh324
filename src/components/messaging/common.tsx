

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { UserData } from "@/lib/follow-data";
import { ArrowLeft, Menu, MoreVertical, Search, Send, Trash2, CheckCheck, Check, Flag, Paperclip, FileText, PlusCircle, Home, Pin, Award, History, Gavel, ShoppingBag, X, Smile, Reply, TicketX } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useCallback, forwardRef } from "react";
import { Skeleton } from "../ui/skeleton";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useSidebar } from "../ui/sidebar";
import { onSnapshot, collection, query, orderBy, getFirestore, doc, Timestamp, addDoc, serverTimestamp, updateDoc, increment, getDoc } from 'firebase/firestore';
import { getFirestoreDb } from "@/lib/firebase";
import { format } from "date-fns";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "../ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FeedbackDialog } from "../feedback-dialog";
import { MessageCircle, LifeBuoy, Share2, Link as Link2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { productDetails } from "@/lib/product-data";
import Image from "next/image";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";

export interface Message {
  id: number | string;
  text?: string;
  imageUrl?: string;
  senderId?: string; // Made optional for system messages
  user?: string; // Legacy support
  timestamp: string | Timestamp;
  status?: 'sent' | 'delivered' | 'read';
  type?: 'system' | 'auction' | 'auction_end' | 'product_pin' | 'offer_pin';
  isBid?: boolean;
  isSeller?: boolean;
  avatar?: string;
  userColor?: string;
  productId?: string;
  initialTime?: number;
  active?: boolean;
  winner?: string;
  winnerAvatar?: string;
  winningBid?: string;
  productName?: string;
  auctionId?: string;
}

export interface Conversation {
  conversationId: string;
  userId: string;
  userName: string;
  avatarUrl: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  unreadCount: number;
  isExecutive?: boolean;
  status?: 'open' | 'closed';
}

const emojis = [
    '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', '😉', '😊', '😋', '😎', '😍', '😘', '🥰', '😗', '😙', '😚',
    '🙂', '🤗', '🤩', '🤔', '🤨', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '😴',
    '😌', '😛', '😜', '😝', '🤤', '😒', '😓', '😔', '😕', '🙃', '🤑', '😲', '☹️', '🙁', '😖', '😞', '😟', '😤',
    '😢', '😭', '😦', '😧', '😨', '😩', '🤯', '😬', '😰', '😱', '🥵', '🥶', '😳', '🤪', '😵', '😡', '😠', '🤬',
    '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '😇', '🤠', '🤡', '🥳', '🥴', '🥺', '🤥', '🤫', '🤭', '🧐', '🤓', '😈',
    '👿', '👹', '👺', '💀', '👻', '👽', '🤖', '💩', '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👋', '🤚',
    '🖐️', '✋', '🖖', '👏', '🙌', '🙏', '🤝', '💪', '🦾', '🦵', '🦿', '🦶', '👂', '🦻', '👃', '🧠', '🦷', '🦴',
    '👀', '👁️', '👅', '👄', '❤️', '💔', '💕', '💖', '💗', '💓', '💞', '💝', '💟', '✨', '⭐', '🌟', '💫', '💥',
    '💯', '🔥', '🎉', '🎊', '🎁', '🎈',
];


export const ConversationItem = ({ convo, isSelected, onClick, onDelete }: { convo: Conversation, isSelected: boolean, onClick: () => void, onDelete?: () => void }) => {
    const truncatedMessage = convo.lastMessage.split(' ').slice(0, 4).join(' ') + (convo.lastMessage.split(' ').length > 4 ? '...' : '');

    return (
        <div
            className={cn(
                "group relative w-full text-left p-2 flex items-center gap-3 rounded-lg cursor-pointer",
                isSelected ? "bg-secondary" : "hover:bg-secondary/50",
                convo.status === 'closed' && 'opacity-60'
            )}
            onClick={onClick}
        >
            <Avatar className="h-10 w-10">
                <AvatarImage src={convo.avatarUrl} />
                <AvatarFallback>{convo.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow overflow-hidden">
                <div className="flex justify-between items-center">
                    <p className="font-semibold text-sm truncate">{convo.userName}</p>
                     <p className="text-xs text-muted-foreground flex-shrink-0 ml-2">{convo.lastMessageTimestamp}</p>
                </div>
                <div className="flex justify-between items-start mt-0.5">
                    <p className={cn("text-xs text-muted-foreground truncate pr-2", convo.status === 'closed' && "italic")}>
                        {convo.status === 'closed' ? "This conversation is closed." : truncatedMessage}
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {convo.unreadCount > 0 && convo.status !== 'closed' && (
                            <div className="w-4 h-4 bg-primary text-primary-foreground text-xs flex items-center justify-center rounded-full">
                                {convo.unreadCount}
                            </div>
                        )}
                        {onDelete && (
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenuItem className="text-destructive" onSelect={onDelete}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete Chat
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


export const ChatMessage = ({ msg, currentUserId }: { msg: Message, currentUserId?: string }) => {
    const isMyMessage = msg.senderId === currentUserId;
    const timestamp = msg.timestamp instanceof Timestamp ? format(msg.timestamp.toDate(), 'p') : msg.timestamp;

    const renderStatus = () => {
        if (!isMyMessage) return null;
        if (msg.status === 'read') return <CheckCheck className="h-4 w-4 text-blue-400" />;
        if (msg.status === 'delivered') return <CheckCheck className="h-4 w-4" />;
        return <Check className="h-4 w-4" />;
    };

    return (
        <div key={msg.id} className={cn("flex items-end gap-2 group", isMyMessage ? "justify-end" : "justify-start")}>
            {isMyMessage && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                         <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
            <div className={cn("max-w-[86%] rounded-[18px] px-3 py-1.5", isMyMessage ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
                {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                {msg.imageUrl && <img src={msg.imageUrl} alt="sent" className="rounded-md max-w-full h-auto mt-2" />}
                <div className={cn("text-xs mt-1 flex items-center gap-1", isMyMessage ? "text-primary-foreground/70 justify-end" : "text-muted-foreground justify-end")}>
                    <span>{timestamp}</span>
                    {renderStatus()}
                </div>
            </div>
        </div>
    );
};

export const ConversationList = ({ conversations, selectedConversation, onSelectConversation, onDeleteConversation }: {
    conversations: Conversation[];
    selectedConversation: Conversation | null;
    onSelectConversation: (convo: Conversation) => void;
    onDeleteConversation?: (conversationId: string) => void;
}) => {
    const { setOpen } = useSidebar();
    const router = useRouter();
    
    const filteredConversations = useMemo(() => {
        return conversations;
    }, [conversations]);

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
                    />
                </div>
            </div>
            <ScrollArea className="flex-grow">
                <div className="p-2 space-y-1">
                    {filteredConversations.map(convo => (
                        <ConversationItem
                            key={convo.isExecutive ? `exec-${convo.userId}` : convo.conversationId}
                            convo={convo}
                            onClick={() => onSelectConversation(convo)}
                            isSelected={selectedConversation?.conversationId === convo.conversationId}
                            onDelete={onDeleteConversation ? () => onDeleteConversation(convo.conversationId) : undefined}
                        />
                    ))}
                </div>
            </ScrollArea>
        </>
    );
};


export const ChatWindow = ({ conversation, userData, onBack, messages: initialMessages, isFullScreen = false }: {
    conversation: Conversation;
    userData: UserData;
    onBack: () => void;
    messages?: Message[];
    isFullScreen?: boolean;
}) => {
    const [messages, setMessages] = useState<Message[]>(initialMessages || []);
    const [isChatLoading, setIsChatLoading] = useState(true);
    const [newMessage, setNewMessage] = useState("");
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();
    const { user } = useAuth();
    
    const sendMessage = async (conversationId: string, senderId: string, message: { text?: string; imageUrl?: string }) => {
        const db = getFirestoreDb();
        const conversationRef = doc(db, 'conversations', conversationId);
        const messagesRef = collection(conversationRef, 'messages');
    
        const newMessagePayload = {
            ...message,
            senderId: senderId,
            timestamp: serverTimestamp(),
        };
    
        await addDoc(messagesRef, newMessagePayload);
    
        const conversationDoc = await getDoc(conversationRef);
        const conversationData = conversationDoc.data();
        if (conversationData) {
            const otherParticipantId = conversationData.participants.find((p: string) => p !== senderId);
            
            await updateDoc(conversationRef, {
                lastMessage: message.text || 'Image Sent',
                lastMessageTimestamp: serverTimestamp(),
                [`unreadCount.${otherParticipantId}`]: increment(1)
            });
        }
    };

    const handleResolveTicket = async () => {
        const db = getFirestoreDb();
        const conversationRef = doc(db, 'conversations', conversation.conversationId);
        await updateDoc(conversationRef, { status: 'closed' });
        // The onSnapshot listener should update the local state automatically.
    };
    
    useEffect(() => {
        if (!conversation) return;
        setIsChatLoading(true);

        const db = getFirestoreDb();
        const messagesQuery = query(collection(db, `conversations/${conversation.conversationId}/messages`), orderBy("timestamp", "asc"));
        
        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            if (!snapshot.metadata.hasPendingWrites) {
                const fetchedMessages = snapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        timestamp: data.timestamp ? format(data.timestamp.toDate(), 'p') : 'sending...'
                    } as Message;
                });
                setMessages(fetchedMessages);
                setIsChatLoading(false);
            }
        }, (error) => {
            console.error("Error fetching messages:", error);
            setIsChatLoading(false);
        });

        return () => unsubscribe();
    }, [conversation]);
    
    useEffect(() => {
        chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !conversation || !user) return;
        
        const optimisticMessage: Message = {
            id: Math.random(),
            text: newMessage,
            senderId: user?.uid,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, optimisticMessage]);
        const currentMessage = newMessage;
        setNewMessage("");

        try {
            await sendMessage(conversation.conversationId, user.uid, { text: currentMessage });
        } catch (error) {
            console.error("Failed to send message", error);
            setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id)); // Revert on error
        }
    };
    
    if (!user) return null;

    const isChatClosed = conversation.status === 'closed';

    return (
        <div className="h-full flex flex-col">
            <header className="p-3 border-b flex items-center justify-between shrink-0 h-16">
                <div className="flex items-center gap-3">
                    {(isMobile || isFullScreen) && (
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
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                         <DropdownMenuItem onClick={handleResolveTicket} disabled={isChatClosed}>
                            <TicketX className="mr-2 h-4 w-4" />
                            {isChatClosed ? 'Ticket Resolved' : 'Mark as Resolved'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
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
                        messages.map(msg => <ChatMessage key={msg.id} msg={msg} currentUserId={user.uid} />)
                    ) : (
                        <div className="text-center text-muted-foreground py-8">Start the conversation!</div>
                    )}
                    {isChatClosed && (
                         <div className="text-center text-xs text-muted-foreground italic py-4">
                            This conversation has been closed and is now read-only.
                        </div>
                    )}
                </div>
            </ScrollArea>
            <footer className="p-4 border-t shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                     <Popover>
                        <PopoverTrigger asChild>
                             <Button variant="ghost" size="icon" type="button" className="flex-shrink-0 rounded-full" disabled={isChatClosed}>
                                <PlusCircle className="h-5 w-5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2 mb-2">
                             <div className="grid gap-1">
                                <Button variant="ghost" className="w-full justify-start">
                                    <Paperclip className="mr-2 h-4 w-4" /> Order Status
                                </Button>
                                <Button variant="ghost" className="w-full justify-start">
                                    <FileText className="mr-2 h-4 w-4" /> Send Image
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                     <div className="relative flex-grow">
                        <Input 
                            placeholder={isChatClosed ? "This chat is closed" : "Type a message"} 
                            className="flex-grow rounded-full bg-muted border-transparent focus:bg-background focus:border-border pr-10" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            disabled={isChatClosed}
                        />
                         <Button variant="ghost" size="icon" type="button" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground" disabled={isChatClosed}>
                            <Smile className="h-5 w-5"/>
                        </Button>
                    </div>
                    <Button type="submit" size="icon" disabled={!newMessage.trim() || isChatClosed} className="rounded-full flex-shrink-0">
                        <Send className="h-5 w-5"/>
                    </Button>
                </form>
            </footer>
        </div>
    );
};
