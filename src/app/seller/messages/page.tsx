
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Search, MoreVertical, Smile, Paperclip, MessageSquare, Share2, MessageCircle, LifeBuoy, Download } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { getMessages, sendMessage, getConversations } from '@/ai/flows/chat-flow';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toPng } from 'html-to-image';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChatMessage, ConversationItem, Message, Conversation } from '@/components/messaging/common';
import { SellerHeader } from '@/components/seller/seller-header';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDebounce } from '@/hooks/use-debounce';

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
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredConversations = useMemo(() => {
    if (!debouncedSearchTerm) return conversations;
    return conversations.filter(convo => convo.userName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
  }, [conversations, debouncedSearchTerm]);

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
            // This case would be for a seller messaging an executive, not implemented in flows
            chatHistory = [];
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
    
    const from = 'seller';

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
        let updatedMessages = await sendMessage(selectedConversation.conversationId, user!.uid, { text: currentMessage });
        // The flow does not return messages, so we'll rely on the optimistic update
        // setMessages(updatedMessages); 
    } catch (error) {
        console.error("Failed to send message", error);
         setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id)); // Revert on error
    }
  };
  
  if (loading || isLoading) {
    return <div className="h-screen w-full flex items-center justify-center"><LoadingSpinner /></div>;
  }
  
  if (!user || userData?.role !== 'seller') {
      router.push('/');
      return null;
  }

  return (
    <div className="h-screen w-full flex flex-col bg-background text-foreground">
        <SellerHeader />
        <div className="flex-grow flex overflow-hidden">
            <aside className="w-full md:w-1/3 lg:w-1/4 h-full border-r flex-col hidden md:flex">
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
                                key={convo.isExecutive ? `exec-${convo.userId}` : convo.userId} 
                                convo={convo} 
                                onClick={() => handleSelectConversation(convo)}
                                isSelected={selectedConversation?.userId === convo.userId}
                            />
                        ))}
                    </div>
                </ScrollArea>
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
                        <ScrollArea className="flex-grow bg-muted/20" ref={chatContainerRef}>
                           <div className="p-4 space-y-4">
                            {isChatLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-12 w-2/3" />
                                    <Skeleton className="h-12 w-1/2 ml-auto" />
                                    <Skeleton className="h-16 w-3/4" />
                                </div>
                            ) : (
                                messages.map(msg => <ChatMessage key={msg.id} msg={msg} currentUserId={user.uid} />)
                            )}
                            </div>
                        </ScrollArea>
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
    </div>
  );
}
```]} />
```