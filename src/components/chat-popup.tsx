
"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, X, PlusCircle, Image as ImageIcon, FileText, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Image from 'next/image';
import { Skeleton } from './ui/skeleton';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { allOrderData, getStatusFromTimeline, Order } from '@/lib/order-data';
import { Badge } from './ui/badge';
import { useAuth } from '@/hooks/use-auth';

interface ChatPopupProps {
  user: { // The seller being messaged
    displayName: string;
    photoURL: string;
  };
  onClose: () => void;
}

type Message = { id: number, text?: string, sender: 'user' | 'bot' | 'system' | 'seller' | 'customer', timestamp: string, image?: string };

const mockChatDatabase: Record<string, Message[]> = {
  "FashionFinds": [
    { id: 1, text: "Hey! I saw your stream and I'm interested in the vintage camera. Is it still available?", sender: 'customer', timestamp: '10:00 AM' },
    { id: 2, text: "Hi there! Yes, it is. It's in great working condition.", sender: 'seller', timestamp: '10:01 AM' },
  ],
  "GadgetGuru": [
      { id: 1, text: "I have a question about the X-1 Drone.", sender: 'customer', timestamp: 'Yesterday' },
      { id: 2, text: "Sure, what would you like to know?", sender: 'seller', timestamp: 'Yesterday' },
  ],
};

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


export function ChatPopup({ user: seller, onClose }: ChatPopupProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOrderSelectOpen, setIsOrderSelectOpen] = useState(false);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    // In a real app, you'd fetch this. For demo, we use mock data.
    if(user) {
        const orders = Object.values(allOrderData as any).filter((o: any) => o.userId === user.uid || !o.userId);
        setUserOrders(orders as Order[]);
    }
  }, [user]);

  useEffect(() => {
    const fetchMessages = () => {
      setIsLoading(true);
      try {
        // Fetch message history between customer and this seller from mock data
        const history = mockChatDatabase[seller.displayName] || []; 
        setMessages(history);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, [seller.displayName]);

  const handleSendMessage = async (e?: React.FormEvent, messageContent?: { text?: string; image?: string }) => {
    if (e) e.preventDefault();
    const content = messageContent || { text: newMessage.trim() };
    if (!content.text && !content.image) return;

    if (!messageContent) {
      setNewMessage('');
    }

    const optimisticMessage: Message = {
      id: Math.random(),
      ...content,
      sender: 'customer',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages(prev => [...prev, optimisticMessage]);

    // Mock receiving a reply
    setTimeout(() => {
        const reply: Message = {
            id: Math.random(),
            sender: 'seller',
            text: "Thanks for your message! We'll get back to you shortly.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, reply]);
    }, 1500);

  };

  const handleSendOrderStatus = (order: Order) => {
    const statusMessage = `I have a question about my order:
    - **Order ID:** ${order.orderId}
    - **Product:** ${order.products[0].name}
    - **Status:** ${getStatusFromTimeline(order.timeline)}`;
    handleSendMessage(undefined, { text: statusMessage });
    setIsOrderSelectOpen(false);
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
    setNewMessage(prev => prev + emoji);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <Dialog open={isOrderSelectOpen} onOpenChange={setIsOrderSelectOpen}>
        <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-80 h-[450px] flex flex-col shadow-2xl rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between p-3 border-b bg-primary/10">
            <div className="flex items-center gap-3">
                <Avatar>
                <AvatarImage src={seller.photoURL} alt={seller.displayName} />
                <AvatarFallback>{seller.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <h3 className="font-semibold">{seller.displayName}</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="h-5 w-5" />
            </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
                <div className="p-4 space-y-4">
                {isLoading ? (
                    <>
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-10 w-3/4 ml-auto" />
                    <Skeleton className="h-10 w-1/2" />
                    </>
                ) : (
                    messages.map((msg) => {
                    const isMyMessage = msg.sender === 'customer';
                    return (
                        <div key={msg.id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] rounded-lg px-3 py-2 ${
                            isMyMessage
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}>
                            {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}
                            {msg.image && (
                                <Image src={msg.image} alt="Sent image" width={150} height={150} className="rounded-md" />
                            )}
                            <p className={`text-xs mt-1 ${
                                isMyMessage
                                ? 'text-primary-foreground/70 text-right'
                                : 'text-muted-foreground text-right'
                            }`}>{msg.timestamp}</p>
                            </div>
                        </div>
                    );
                    })
                )}
                </div>
            </ScrollArea>
            </CardContent>
            <CardFooter className="p-2 border-t">
            <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
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
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageSelect}
                />
                <div className="relative flex-grow">
                    <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    autoComplete="off"
                    className="rounded-full bg-muted pr-10 border-transparent focus:border-primary focus:bg-background"
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
                <Button type="submit" size="icon" disabled={!newMessage.trim()} className="flex-shrink-0 rounded-full">
                <Send className="h-4 w-4" />
                </Button>
            </form>
            </CardFooter>
        </Card>
        </div>
         <DialogContent>
            <DialogHeader>
                <DialogTitle>Share Order Status</DialogTitle>
                <DialogDescription>Select an order to share its details in the chat.</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-80 my-4">
                <div className="space-y-2 pr-4">
                {userOrders.map(order => (
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
  );
}
