
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Send, Search, MoreVertical, Image as ImageIcon, Smile, Paperclip, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { getMessages, sendMessage, getConversations, Message, Conversation } from '@/ai/flows/chat-flow';
import { getExecutiveMessages, sendExecutiveMessage } from '@/ai/flows/executive-chat-flow';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

function ChatMessage({ msg, currentUserName }: { msg: Message, currentUserName: string | null }) {
    // For customer, 'them' is the seller and 'me' is the customer
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

export default function MessagePage() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && userData) {
        const fetchConversations = async () => {
            try {
                const sellerConvos = await getConversations();
                
                // Check if an executive chat exists
                const execMessages = await getExecutiveMessages(userData.uid);
                let executiveConversation: Conversation | null = null;
                if (execMessages.length > 0) {
                    const lastMessage = execMessages[execMessages.length - 1];
                    executiveConversation = {
                        userId: userData.uid, // Use user's UID for executive chat ID
                        userName: 'StreamCart',
                        avatarUrl: 'https://placehold.co/40x40/000000/FFFFFF?text=SC',
                        lastMessage: lastMessage.text || 'Image Sent',
                        lastMessageTimestamp: lastMessage.timestamp,
                        unreadCount: 0,
                        isExecutive: true,
                    };
                }

                let allConvos = [...sellerConvos];
                if (executiveConversation) {
                    allConvos = [executiveConversation, ...allConvos];
                }

                setConversations(allConvos);
                if (allConvos.length > 0) {
                    handleSelectConversation(allConvos[0]);
                }
            } catch (error) {
                console.error("Failed to fetch conversations:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchConversations();
    }
  }, [user, userData]);
  
  useEffect(() => {
    chatContainerRef.current?.scrollTo({ top: chatContainerRef.current.scrollHeight });
  }, [messages]);

  const handleSelectConversation = async (convo: Conversation) => {
    setSelectedConversation(convo);
    setIsChatLoading(true);
    setMessages([]);
    try {
        let chatHistory;
        if (convo.isExecutive) {
            chatHistory = await getExecutiveMessages(convo.userId);
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

    const optimisticMessage: Message = {
        id: Math.random(),
        text: newMessage,
        sender: userData.displayName, // Customer is the sender
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, optimisticMessage]);
    const currentMessage = newMessage;
    setNewMessage("");

    try {
        let updatedMessages;
        if (selectedConversation.isExecutive) {
            updatedMessages = await sendExecutiveMessage(selectedConversation.userId, { text: currentMessage }, 'customer');
        } else {
            updatedMessages = await sendMessage(selectedConversation.userId, { text: currentMessage }, 'customer');
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
      router.push('/');
      return null;
  }

  return (
    <div className="h-screen w-full flex bg-background text-foreground">
        <aside className="w-full md:w-1/3 lg:w-1/4 h-full border-r flex flex-col">
            <header className="p-4 border-b flex items-center justify-between sticky top-0 bg-background z-10 shrink-0">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.back()}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                     <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => router.push('/live-selling')}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-xl font-bold">Chats</h1>
                </div>
                <Button variant="ghost" size="icon">
                    <Search className="h-5 w-5" />
                </Button>
            </header>
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
        
        <main className="w-full md:w-2/3 lg:w-3/4 h-full flex-col hidden md:flex">
             {selectedConversation ? (
                <>
                    <header className="p-4 border-b flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src={selectedConversation.avatarUrl} />
                                <AvatarFallback>{selectedConversation.userName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h2 className="font-semibold">{selectedConversation.userName}</h2>
                                <p className="text-xs text-muted-foreground">Online</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
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
                            messages.map(msg => <ChatMessage key={msg.id} msg={msg} currentUserName={userData?.displayName || null} />)
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
