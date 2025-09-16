
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Search, MoreVertical, Smile, Paperclip, MessageSquare, Share2, MessageCircle, LifeBuoy, Download } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { getMessages, sendMessage, getConversations, Message, Conversation } from '@/ai/flows/chat-flow';
import { getExecutiveMessages, sendExecutiveMessage } from '@/ai/flows/executive-chat-flow';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toPng } from 'html-to-image';
import { useToast } from '@/hooks/use-toast';

function ChatMessage({ msg, currentUserName }: { msg: Message, currentUserName: string | null }) {
    const isMe = msg.sender === 'seller' || msg.sender === currentUserName;
    return (
        <div className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
            {!isMe && (
                <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://placehold.co/40x40.png`} />
                    <AvatarFallback>{'C'}</AvatarFallback>
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

const ScreenshotDialog = ({ messages, conversation, trigger, currentUserIsSeller }: { messages: Message[], conversation: Conversation, trigger: React.ReactNode, currentUserIsSeller: boolean }) => {
    const screenshotRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const [selectedDate, setSelectedDate] = useState('all');

    const uniqueDates = useMemo(() => {
        const dates = new Set(messages.map(msg => new Date(msg.timestamp).toDateString()));
        return Array.from(dates);
    }, [messages]);

    const filteredMessages = useMemo(() => {
        if (selectedDate === 'all') return messages;
        return messages.filter(msg => new Date(msg.timestamp).toDateString() === selectedDate);
    }, [messages, selectedDate]);

    const handleDownload = async () => {
        if (!screenshotRef.current) return;
        try {
            const dataUrl = await toPng(screenshotRef.current, { cacheBust: true });
            const link = document.createElement('a');
            link.download = `streamcart-chat-${conversation.userName.toLowerCase()}-${selectedDate}.png`;
            link.href = dataUrl;
            link.click();
        } catch (err) {
            console.error(err);
            toast({ title: "Error", description: "Could not generate screenshot.", variant: "destructive" });
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Share Conversation</DialogTitle>
                    <DialogDescription>Select a date to capture and download the conversation.</DialogDescription>
                </DialogHeader>
                <div className="my-4">
                    <Select value={selectedDate} onValueChange={setSelectedDate}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select date" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Conversation</SelectItem>
                            {uniqueDates.map(date => (
                                <SelectItem key={date} value={date}>{new Date(date).toLocaleDateString()}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="h-64 overflow-y-auto border rounded-md p-4 bg-muted/30" ref={screenshotRef}>
                    {filteredMessages.map(msg => <ChatMessage key={msg.id} msg={msg} currentUserName={currentUserIsSeller ? 'seller' : 'customer'} />)}
                </div>
                <DialogFooter>
                    <Button onClick={handleDownload}><Download className="mr-2 h-4 w-4" /> Download</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function SellerMessagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userData, loading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConversations = useMemo(() => {
    if (!searchTerm) return conversations;
    return conversations.filter(convo => convo.userName.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [conversations, searchTerm]);

  const isExecutiveReply = searchParams.get('executive') === 'true';

  useEffect(() => {
    if (user) {
        const fetchConversations = async () => {
            try {
                const convos = await getConversations();
                setConversations(convos);

                if (isExecutiveReply) {
                    const userId = searchParams.get('userId');
                    const userName = searchParams.get('userName');
                    if (userId && userName) {
                        const executiveConvo = {
                            userId: userId,
                            userName: userName,
                            avatarUrl: 'https://placehold.co/40x40/000000/FFFFFF?text=SC',
                            lastMessage: 'New inquiry',
                            lastMessageTimestamp: '',
                            unreadCount: 1,
                            isExecutive: true,
                        };
                        
                        setConversations(prev => {
                            if (prev.some(c => c.userId === userId && c.isExecutive)) {
                                return prev;
                            }
                            return [executiveConvo, ...prev];
                        });
                        handleSelectConversation(executiveConvo);
                    }
                } else if (convos.length > 0) {
                    handleSelectConversation(convos[0]);
                }
            } catch (error) {
                console.error("Failed to fetch conversations:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchConversations();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isExecutiveReply, searchParams]);
  
  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight });
  }, [messages]);

  const handleSelectConversation = async (convo: Conversation) => {
    setSelectedConversation(convo);
    setIsChatLoading(true);
    setMessages([]);
    try {
        let chatHistory;
        if(convo.isExecutive) {
            // Since we are in the seller view, we are replying as the executive
            chatHistory = await getMessages(convo.userId);
        } else {
            chatHistory = await getMessages(convo.userId);
        }
        setMessages(chatHistory);
    } catch (error) {
        console.error("Failed to fetch messages for", convo.userId, error);
    } finally {
        setIsChatLoading(false);
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !userData) return;
    
    const from = selectedConversation.isExecutive ? 'StreamCart' : 'seller';

    const optimisticMessage: Message = {
        id: Math.random(),
        text: newMessage,
        sender: from,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, optimisticMessage]);
    const currentMessage = newMessage;
    setNewMessage("");

    try {
        let updatedMessages;
        if (selectedConversation.isExecutive) {
            updatedMessages = await sendExecutiveMessage(selectedConversation.userId, { text: currentMessage }, from);
        } else {
            updatedMessages = await sendMessage(selectedConversation.userId, { text: currentMessage }, 'seller');
        }
        setMessages(updatedMessages);
    } catch (error) {
        console.error("Failed to send message", error);
         setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id)); // Revert on error
    }
  };
  
  if (loading || isLoading) {
    return <div className="h-screen w-full flex items-center justify-center"><LoadingSpinner /></div>;
  }
  
  if (!user) {
      router.push('/seller/register');
      return null;
  }

  const currentUserName = selectedConversation?.isExecutive ? 'StreamCart' : 'seller';

  return (
    <div className="h-screen w-full flex bg-background text-foreground">
        <aside className="w-full md:w-1/3 lg:w-1/4 h-full border-r flex flex-col">
            <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10 shrink-0">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.back()}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                     <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => router.push('/seller/dashboard')}>
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
                        key={convo.isExecutive ? `exec-${convo.userId}` : convo.userId} 
                        convo={convo} 
                        onClick={() => handleSelectConversation(convo)}
                        isSelected={selectedConversation?.userId === convo.userId}
                    />
                ))}
            </div>
        </aside>
        
        <main className="w-full md:w-2/3 lg:w-3/4 h-full flex-col hidden md:flex">
             {selectedConversation ? (
                <>
                    <header className="p-4 border-b flex items-center justify-between shrink-0">
                         <Link href={`/profile?userId=${selectedConversation.userId}`} className="cursor-pointer group">
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
                        <div className="flex items-center gap-2">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                     <ScreenshotDialog
                                        messages={messages}
                                        conversation={selectedConversation}
                                        currentUserIsSeller={true}
                                        trigger={<DropdownMenuItem onSelect={(e) => e.preventDefault()}><Share2 className="mr-2 h-4 w-4" />Share</DropdownMenuItem>}
                                    />
                                    <DropdownMenuItem>
                                        <MessageCircle className="mr-2 h-4 w-4" />Feedback
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <LifeBuoy className="mr-2 h-4 w-4" />Help
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>
                    <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto bg-muted/20">
                       {isChatLoading ? (
                           <div className="space-y-4">
                               <Skeleton className="h-12 w-2/3" />
                               <Skeleton className="h-12 w-1/2 ml-auto" />
                               <Skeleton className="h-16 w-3/4" />
                               <Skeleton className="h-8 w-1/3 ml-auto" />
                           </div>
                       ) : (
                            messages.map(msg => <ChatMessage key={msg.id} msg={msg} currentUserName={currentUserName} />)
                       )}
                    </div>
                    <footer className="p-4 border-t shrink-0">
                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" type="button"><Smile className="h-5 w-5" /></Button>
                             <Button variant="ghost" size="icon" type="button"><Paperclip className="h-5 w-5" /></Button>
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
             ) : (
                 <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <MessageSquare className="h-16 w-16 mb-4"/>
                    <h2 className="text-xl font-semibold">Select a chat</h2>
                    <p>Choose a conversation to start messaging.</p>
                 </div>
             )}
        </main>
    </div>
  );
}
