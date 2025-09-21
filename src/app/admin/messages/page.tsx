
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Search, MoreVertical, Smile, Paperclip, MessageSquare, Share2, MessageCircle, LifeBuoy, Download, ShieldCheck, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAuthActions } from '@/lib/auth';
import { useDebounce } from '@/hooks/use-debounce';
import { ChatMessage, ConversationItem, Message, Conversation } from '@/components/messaging/common';

// Mock data until flows are restored
const mockChatDatabase: Record<string, Message[]> = {
  "FashionFinds": [
    { id: 1, text: "Hey! I saw your stream and I'm interested in the vintage camera. Is it still available?", sender: 'customer', timestamp: '10:00 AM' },
    { id: 2, text: "Hi there! Yes, it is. It's in great working condition.", sender: 'seller', timestamp: '10:01 AM' },
    { id: 3, text: "Awesome! Could you tell me a bit more about the lens?", sender: 'customer', timestamp: '10:01 AM' },
  ],
  "GadgetGuru": [
      { id: 1, text: "I have a question about the X-1 Drone.", sender: 'customer', timestamp: 'Yesterday' },
      { id: 2, text: "Sure, what would you like to know?", sender: 'seller', timestamp: 'Yesterday' },
  ]
};

const mockConversations: Conversation[] = [
    { userId: "FashionFinds", userName: "FashionFinds", avatarUrl: "https://placehold.co/40x40.png", lastMessage: "Awesome! Could you tell me a bit more about the lens?", lastMessageTimestamp: "10:01 AM", unreadCount: 1 },
    { userId: "GadgetGuru", userName: "GadgetGuru", avatarUrl: "https://placehold.co/40x40.png", lastMessage: "Sure, what would you like to know?", lastMessageTimestamp: "Yesterday", unreadCount: 0 },
];

export default function AdminMessagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userData, loading } = useAuth();
  const { signOut } = useAuthActions();
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

  const preselectUserId = searchParams.get('userId');
  const preselectUserName = searchParams.get('userName');

  useEffect(() => {
    if (user && userData?.role === 'admin') {
        const fetchConversations = async () => {
            try {
                let allConvos = [...mockConversations];
                let convoToSelect: Conversation | null = null;

                if (preselectUserId) {
                    const existingConvo = allConvos.find(c => c.userId === preselectUserId);
                    if (existingConvo) {
                        convoToSelect = existingConvo;
                    } else {
                         const executiveConvo = {
                            userId: preselectUserId,
                            userName: preselectUserName || 'Live Chat User',
                            avatarUrl: `https://placehold.co/40x40.png?text=${(preselectUserName || 'U').charAt(0)}`,
                            lastMessage: 'New live chat request.',
                            lastMessageTimestamp: 'now',
                            unreadCount: 1,
                            isExecutive: true,
                        };
                        allConvos = [executiveConvo, ...allConvos];
                        convoToSelect = executiveConvo;
                    }
                } else if (allConvos.length > 0) {
                    convoToSelect = allConvos[0];
                }
                
                setConversations(allConvos);

                if (convoToSelect) {
                    handleSelectConversation(convoToSelect);
                }

            } catch (error) {
                console.error("Failed to fetch conversations:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchConversations();
    }
  }, [user, userData, preselectUserId, preselectUserName]);
  
  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight });
  }, [messages]);

  const handleSelectConversation = async (convo: Conversation) => {
    setSelectedConversation(convo);
    setIsChatLoading(true);
    setMessages([]);
    try {
        let chatHistory = mockChatDatabase[convo.userId] || [];
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
    
    const from = 'StreamCart';

    const optimisticMessage: Message = {
        id: Math.random(),
        text: newMessage,
        sender: from,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, optimisticMessage]);
    setNewMessage("");
  };
  
  if (loading || isLoading) {
    return <div className="h-screen w-full flex items-center justify-center"><LoadingSpinner /></div>;
  }
  
  if (!user || userData?.role !== 'admin') {
      router.push('/');
      return null;
  }

  return (
    <div className="h-screen w-full flex bg-background text-foreground">
        <aside className="w-full md:w-1/3 lg:w-1/4 h-full border-r flex-col hidden md:flex">
             <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10 shrink-0 h-16">
                <nav className="flex flex-row items-center gap-5 text-sm">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0"><Menu className="h-5 w-5" /></Button>
                        </SheetTrigger>
                        <SheetContent side="left">
                             <SheetHeader>
                                <SheetTitle className="sr-only">Admin Navigation Menu</SheetTitle>
                            </SheetHeader>
                             <nav className="grid gap-6 text-lg font-medium">
                                <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-semibold"><ShieldCheck className="h-6 w-6" /><span>Admin Panel</span></Link>
                                <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
                                <Link href="/admin/orders" className="text-muted-foreground hover:text-foreground">Orders</Link>
                                <Link href="/admin/users" className="text-muted-foreground hover:text-foreground">Users</Link>
                                <Link href="/admin/inquiries" className="text-muted-foreground hover:text-foreground">Inquiries</Link>
                                <Link href="/admin/messages" className="hover:text-foreground">Messages</Link>
                                <Link href="/admin/products" className="text-muted-foreground hover:text-foreground">Products</Link>
                                <Link href="/admin/live-control" className="text-muted-foreground hover:text-foreground">Live Control</Link>
                                 <Link href="/admin/settings" className="text-muted-foreground hover:text-foreground">Settings</Link>
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base"><ShieldCheck className="h-6 w-6" /><span className="sr-only">Admin</span></Link>
                     <Link href="/admin/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">Dashboard</Link>
                    <Link href="/admin/messages" className="font-semibold text-primary transition-colors hover:text-primary">Messages</Link>
                </nav>
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
                        onClick={() => handleSelectConversation(convo)}
                        isSelected={selectedConversation?.userId === convo.userId}
                    />
                ))}
            </div>
        </aside>
        
        <main className="w-full md:w-2/3 lg:w-3/4 h-full flex flex-col">
            <header className="p-4 border-b flex items-center justify-between shrink-0 h-16">
                <div className="flex items-center gap-2">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="shrink-0 md:hidden"><Menu className="h-5 w-5" /></Button>
                        </SheetTrigger>
                        <SheetContent side="left">
                             <SheetHeader>
                                <SheetTitle className="sr-only">Admin Navigation Menu</SheetTitle>
                            </SheetHeader>
                             <nav className="grid gap-6 text-lg font-medium">
                                <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-semibold"><ShieldCheck className="h-6 w-6" /><span>Admin Panel</span></Link>
                                <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
                                <Link href="/admin/orders" className="text-muted-foreground hover:text-foreground">Orders</Link>
                                <Link href="/admin/users" className="text-muted-foreground hover:text-foreground">Users</Link>
                                <Link href="/admin/inquiries" className="text-muted-foreground hover:text-foreground">Inquiries</Link>
                                <Link href="/admin/messages" className="hover:text-foreground">Messages</Link>
                                <Link href="/admin/products" className="text-muted-foreground hover:text-foreground">Products</Link>
                                <Link href="/admin/live-control" className="text-muted-foreground hover:text-foreground">Live Control</Link>
                                 <Link href="/admin/settings" className="text-muted-foreground hover:text-foreground">Settings</Link>
                            </nav>
                        </SheetContent>
                    </Sheet>
                    {selectedConversation ? (
                         <Link href={`/admin/users/${selectedConversation.userId}`} className="cursor-pointer group">
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
                    ) : <div/>}

                </div>
                <div className="flex items-center gap-2">
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full">
                                <Avatar className="h-9 w-9"><AvatarImage src={user?.photoURL || 'https://placehold.co/40x40.png'} /><AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback></Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => router.push('/profile')}>Profile</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => router.push('/settings')}>Settings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={signOut}>Logout</DropdownMenuItem>
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
                ) : messages.length > 0 ? (
                    messages.map(msg => <ChatMessage key={msg.id} msg={msg} currentUserName="StreamCart" />)
                ) : (
                     <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <MessageSquare className="h-16 w-16 mb-4"/>
                        <h2 className="text-xl font-semibold">{selectedConversation ? `Start a conversation with ${selectedConversation.userName}` : 'No messages yet'}</h2>
                     </div>
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
                        disabled={!selectedConversation}
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim() || !selectedConversation}>
                        <Send className="h-5 w-5"/>
                    </Button>
                </form>
            </footer>
        </main>
    </div>
  );
}
