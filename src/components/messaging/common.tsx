

"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { UserData } from "@/lib/follow-data";
import { ArrowLeft, Loader2, Menu, MoreVertical, Search, Send, Trash2, CheckCheck, Check, Flag, Paperclip, FileText, PlusCircle, Home, Pin, Award, History, Gavel, ShoppingBag, X, Smile } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useCallback, forwardRef } from "react";
import { Skeleton } from "../ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSidebar } from "../ui/sidebar";
import { onSnapshot, collection, query, orderBy, getFirestore, doc, Timestamp } from 'firebase/firestore';
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
                isSelected ? "bg-secondary" : "hover:bg-secondary/50"
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
                    <p className="text-xs text-muted-foreground truncate pr-2">{truncatedMessage}</p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {convo.unreadCount > 0 && (
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
            <div className={cn("max-w-[86%] rounded-[18px] px-3 py-1.5", isMyMessage ? "bg-primary text-primary-foreground" : "bg-[#141516] text-[#E6ECEF]")}>
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
                     <Button variant="outline" size="icon" className="shrink-0 lg:hidden" onClick={() => setOpen(true)}>
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                    <h1 className="text-xl font-bold">Chats</h1>
                </div>
                <Button asChild variant="ghost" size="icon" onClick={() => router.back()}>
                    <Link href="/feed">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
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
                            key={convo.userId}
                            convo={convo}
                            onClick={() => onSelectConversation(convo)}
                            isSelected={selectedConversation?.userId === convo.userId}
                            onDelete={onDeleteConversation ? () => onDeleteConversation(convo.conversationId) : undefined}
                        />
                    ))}
                </div>
            </ScrollArea>
        </>
    );
};


export const ChatWindow = ({ conversation, userData, onBack, messages, onSendMessage, isFullScreen = false }: {
    conversation: Conversation;
    userData: UserData;
    onBack: () => void;
    messages: Message[];
    onSendMessage: (text: string) => void;
    isFullScreen?: boolean;
}) => {
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [newMessage, setNewMessage] = useState("");
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const isMobile = useIsMobile();
    const { user } = useAuth();
    
    useEffect(() => {
        chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !conversation || !user) return;
        
        const currentMessage = newMessage;
        setNewMessage("");
        onSendMessage(currentMessage);
    };
    
    if (!user) return null;

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
                    <DropdownMenuContent>
                        <DropdownMenuItem>
                            <Flag className="mr-2 h-4 w-4" /> Report User
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>
            <ScrollArea className="flex-grow bg-background" ref={chatContainerRef}>
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
                </div>
            </ScrollArea>
            <footer className="p-4 border-t shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                     <Popover>
                        <PopoverTrigger asChild>
                             <Button variant="ghost" size="icon" type="button" className="flex-shrink-0 rounded-full">
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
                            placeholder="Type a message" 
                            className="flex-grow rounded-full bg-muted border-transparent focus:bg-background focus:border-border pr-10" 
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                         <Button variant="ghost" size="icon" type="button" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground">
                            <Smile className="h-5 w-5"/>
                        </Button>
                    </div>
                    <Button type="submit" size="icon" disabled={!newMessage.trim()} className="rounded-full flex-shrink-0">
                        <Send className="h-5 w-5"/>
                    </Button>
                </form>
            </footer>
        </div>
    );
};

export const ChatPanel = ({
  seller,
  chatMessages,
  pinnedMessages,
  activeAuction,
  auctionTime,
  highestBid,
  totalBids,
  walletBalance,
  handlers,
  inlineAuctionCardRefs,
  onClose,
}: {
  seller: any;
  chatMessages: any[];
  pinnedMessages: any[];
  activeAuction: any;
  auctionTime: number | null;
  highestBid: number;
  totalBids: number;
  walletBalance: number;
  handlers: any;
  inlineAuctionCardRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  onClose: () => void;
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [replyingTo, setReplyingTo] = useState<{ name: string; id: string } | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleAutoScroll = useCallback((behavior: 'smooth' | 'auto' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  const handleManualScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isScrolledUp = target.scrollHeight - target.scrollTop > target.clientHeight + 200;
    setShowScrollToBottom(isScrolledUp);
  };
  
  useEffect(() => {
    handleAutoScroll('auto');
  }, [chatMessages, handleAutoScroll]);

  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const handleNewMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    console.log("New Message:", newMessage);

    setNewMessage("");
    setReplyingTo(null);
  };

  return (
    <div className='h-full flex flex-col bg-[#0b0b0c]'>
      <header className="p-3 flex items-center justify-between z-10 flex-shrink-0 h-16 border-b border-[rgba(255,255,255,0.04)] sticky top-0 bg-[#0f1113]/80 backdrop-blur-sm">
        <h3 className="font-bold text-lg text-white">Live Chat</h3>
        <div className="flex items-center gap-1">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 relative text-muted-foreground hover:text-white">
                <Pin className="h-5 w-5" />
                {pinnedMessages.length > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary" />}
              </Button>
            </PopoverTrigger>
          </Popover>
          <DropdownMenu>
             <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white">
                   <MoreVertical className="h-5 w-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <FeedbackDialog>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <MessageCircle className="mr-2 h-4 w-4" />Feedback
                    </DropdownMenuItem>
                </FeedbackDialog>
                <DropdownMenuItem>
                    <LifeBuoy className="mr-2 h-4 w-4" />Help
                </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <ScrollArea className="flex-grow" ref={chatContainerRef} onScroll={handleManualScroll}>
          <div className="p-3 space-y-2.5">
             {chatMessages.map((msg) => {
                  if (msg.type === 'system') {
                      return <div key={msg.id} className="text-xs text-center text-[#9AA1A6] italic py-1">{msg.text}</div>
                  }
                  if (!msg.user) return null;

                  const isMyMessage = msg.userId === seller?.uid;
                  const isSellerMessage = msg.userId === seller?.uid;
                  
                  return (
                     <div key={msg.id} className="flex items-start gap-3 w-full group animate-message-in">
                         <Avatar className="h-9 w-9 mt-0.5 border border-[rgba(255,255,255,0.04)]">
                             <AvatarImage src={msg.avatar} />
                             <AvatarFallback className="bg-gradient-to-br from-red-500 to-yellow-500 text-white font-bold">{msg.user.charAt(0)}</AvatarFallback>
                         </Avatar>
                          <div className="flex-grow">
                            <div className="flex items-baseline gap-2">
                                <b className="text-sm font-semibold text-white" style={{ color: msg.userColor || 'inherit' }}>{msg.user}</b>
                                <p className="text-xs text-muted-foreground flex-shrink-0">
                                  {msg.timestamp}
                                </p>
                                {isSellerMessage && (
                                  <Badge className="text-xs px-1.5 py-0 rounded-full bg-[#E43F3F] text-white shadow-sm">Host</Badge>
                                )}
                            </div>
                           <p className="leading-relaxed break-words text-sm text-[#E6ECEF]">
                                {msg.text}
                            </p>
                          </div>
                          <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                  <button className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity p-1">
                                      <MoreVertical className="w-4 h-4" />
                                  </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                  <DropdownMenuItem onSelect={() => handlers.onReportMessage(msg.id)}>
                                    <Flag className="mr-2 h-4 w-4" />Report
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                          </DropdownMenu>
                      </div>
                  )
              })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        {showScrollToBottom && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20">
            <Button
              variant="secondary"
              size="sm"
              className="rounded-full shadow-lg"
              onClick={() => handleAutoScroll()}
            >
              Jump to latest
            </Button>
          </div>
        )}
      <footer className="p-3 bg-transparent flex-shrink-0">
          <form onSubmit={handleNewMessageSubmit} className="flex items-center gap-2">
             <div className="relative flex-grow">
                 <Textarea
                    ref={textareaRef}
                    placeholder="Send a message..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={1}
                    className='flex-grow resize-none max-h-24 px-4 pr-12 py-3 min-h-11 rounded-full bg-[#0f1113] text-white placeholder:text-[#7d8488] border-none focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:ring-[#E43F3F]/30'
                />
                <Popover>
                    <PopoverTrigger asChild>
                         <Button variant="ghost" size="icon" type="button" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-muted-foreground hover:text-white">
                            <Smile className="h-5 w-5" />
                        </Button>
                    </PopoverTrigger>
                     <PopoverContent className="w-80 h-64 mb-2">
                        <ScrollArea className="h-full">
                            <div className="grid grid-cols-8 gap-1">
                                {emojis.map((emoji, index) => (
                                    <Button key={index} variant="ghost" size="icon" onClick={() => addEmoji(emoji)}>
                                        {emoji}
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                     </PopoverContent>
                </Popover>
             </div>
             <Button type="submit" size="icon" disabled={!newMessage.trim()} className="rounded-full flex-shrink-0 h-11 w-11 bg-[#E43F3F] hover:bg-[#E43F3F]/90 active:scale-105 transition-transform">
                <Send className="h-5 w-5" />
            </Button>
          </form>
        </footer>
    </div>
  );
};
