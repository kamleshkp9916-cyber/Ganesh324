

"use client";

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreVertical, Search, Send, Smile, Paperclip, MessageSquare, Menu, FileText, ImageIcon, Trash2, Edit, Flag, Link as Link2, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useMemo, useState, useEffect, useRef } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '../ui/sheet';
import { MainSidebar } from '../main-sidebar';
import { useAuth, type UserData } from '@/hooks/use-auth';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { allOrderData, getStatusFromTimeline, Order } from '@/lib/order-data';


export type Message = { id: number | string, text?: string, sender: string, timestamp: string, image?: string };
export type Conversation = { userId: string, userName: string, avatarUrl: string, lastMessage: string, lastMessageTimestamp: string, unreadCount: number, isExecutive?: boolean };

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


export function ChatMessage({ msg, currentUserName, onDelete }: { msg: Message, currentUserName: string | null, onDelete: (id: string | number) => void }) {
    const isMe = msg.sender === 'customer' || msg.sender === currentUserName || (currentUserName === 'StreamCart' && msg.sender === 'StreamCart');

    let avatarInitial = 'S'; // Seller/System default
    if (msg.sender === 'customer') {
        avatarInitial = 'C';
    } else if (msg.sender !== 'StreamCart' && msg.sender.length > 0) {
        avatarInitial = msg.sender.charAt(0).toUpperCase();
    }


    return (
        <div className={`group flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
             {!isMe && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://placehold.co/40x40.png`} />
                    <AvatarFallback>{avatarInitial}</AvatarFallback>
                </Avatar>
            )}
            <div className={`max-w-[70%] rounded-lg px-3 py-2 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                {msg.image && (
                    <Image src={msg.image} alt="Sent image" width={200} height={200} className="rounded-md mt-2" />
                )}
                <p className={`text-xs mt-1 ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'} text-right`}>
                    {msg.timestamp}
                </p>
            </div>
             {isMe && (
                <AlertDialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-destructive" onSelect={(e) => e.preventDefault()}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Message?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDelete(msg.id)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
             )}
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


export const ConversationList = ({ conversations, selectedConversation, onSelectConversation, userData, userPosts }: { conversations: Conversation[], selectedConversation: Conversation | null, onSelectConversation: (convo: Conversation) => void, userData: UserData, userPosts: any[] }) => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredConversations = useMemo(() => {
        if (!searchTerm) return conversations;
        return conversations.filter(convo => convo.userName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [conversations, searchTerm]);
    
    return (
         <div className="w-full h-full flex flex-col bg-background">
            <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10 shrink-0 h-16">
                <div className="flex items-center gap-2">
                     <Sheet>
                        <SheetTrigger asChild>
                             <Button variant="outline" size="icon" className="shrink-0 md:hidden"><Menu className="h-5 w-5" /></Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-80">
                            <MainSidebar userData={userData} userPosts={userPosts} />
                        </SheetContent>
                    </Sheet>
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

export const ChatWindow = ({ conversation, userData, onBack }: { conversation: Conversation, userData: any, onBack: () => void }) => {
    const isMobile = useIsMobile();
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [inputValue, setInputValue] = useState("");
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isOrderSelectOpen, setIsOrderSelectOpen] = useState(false);
    const [userOrders, setUserOrders] = useState<Order[]>([]);

    useEffect(() => {
        // In a real app, you'd fetch this. For demo, we use mock data.
        if(userData) {
            const orders = Object.values(allOrderData as any).filter((o: any) => o.userId === userData.uid || !o.userId);
            setUserOrders(orders as Order[]);
        }
    }, [userData]);
    
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

    const handleSendMessage = async (e?: React.FormEvent, content?: {text?: string, image?: string}) => {
        if (e) e.preventDefault();
        const messageContent = content || { text: inputValue.trim() };
        if (!messageContent.text && !messageContent.image) return;

        if (!content) {
            setInputValue('');
        }

        const optimisticMessage: Message = {
            id: Math.random(),
            ...messageContent,
            sender: 'customer',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, optimisticMessage]);
    };
    
    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleSendMessage(undefined, { image: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const addEmoji = (emoji: string) => {
        setInputValue(prev => prev + emoji);
    };

    const handleDeleteMessage = (id: string | number) => {
        setMessages(prev => prev.filter(m => m.id !== id));
    };

    const handleSendOrderStatus = (order: Order) => {
        const statusMessage = `I have a question about my order:
- **Order ID:** ${order.orderId}
- **Product:** ${order.products[0].name}
- **Status:** ${getStatusFromTimeline(order.timeline)}`;
        handleSendMessage(undefined, { text: statusMessage });
        setIsOrderSelectOpen(false);
    };

    return (
        <Dialog open={isOrderSelectOpen} onOpenChange={setIsOrderSelectOpen}>
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
                 <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem>
                            <Flag className="mr-2 h-4 w-4" /> Report
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>
            <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto bg-muted/20">
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-2/3" />
                        <Skeleton className="h-12 w-1/2 ml-auto" />
                    </div>
                ) : (
                    messages.map(msg => <ChatMessage key={msg.id} msg={msg} currentUserName={userData?.displayName || null} onDelete={handleDeleteMessage}/>)
                )}
            </div>
            <footer className="p-4 border-t shrink-0 bg-background">
                 <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                     <Popover>
                        <PopoverTrigger asChild>
                            <Button type="button" variant="ghost" size="icon" className="flex-shrink-0 rounded-full">
                                <PlusCircle className="h-5 w-5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2">
                            <div className="grid gap-1">
                                <DialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start"
                                    >
                                        <FileText className="mr-2 h-4 w-4" />
                                        Order Status
                                    </Button>
                                </DialogTrigger>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <ImageIcon className="mr-2 h-4 w-4" />
                                    Send Image
                                </Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <input type="file" ref={fileInputRef} onChange={handleImageSelect} className="hidden" accept="image/*" />

                    <div className="relative flex-grow">
                         <Input 
                            placeholder="Type a message" 
                            className="flex-grow pr-10 rounded-full bg-muted border-transparent focus:border-primary focus:bg-background" 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground rounded-full">
                                    <Smile className="h-5 w-5"/>
                                </Button>
                            </PopoverTrigger>
                             <PopoverContent className="w-80 h-64">
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

                    <Button type="submit" size="icon" disabled={!inputValue.trim()} className="rounded-full flex-shrink-0">
                        <Send className="h-5 w-5"/>
                    </Button>
                </form>
            </footer>
        </div>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share Order Status</DialogTitle>
                    <DialogDescription>Select an order to share its details in the chat.</DialogDescription>
                </DialogHeader>
                <ScrollArea className="h-80 my-4">
                    <div className="space-y-2 pr-4">
                    {userOrders.filter(order => order.products && order.products.length > 0).map(order => (
                        <div key={order.orderId} className="flex items-center gap-3 p-2 border rounded-lg hover:bg-muted">
                            <Image src={order.products[0].imageUrl} alt={order.products[0].name} width={40} height={40} className="rounded-md" />
                            <div className="flex-grow">
                                <p className="font-semibold text-sm">{order.products[0].name}</p>
                                <p className="text-xs text-muted-foreground">{order.orderId}</p>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => handleSendOrderStatus(order)}>Share</Button>
                        </div>
                    ))}
                    {userOrders.length === 0 && <p className="text-center text-muted-foreground py-8">No recent orders found.</p>}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
};

    
