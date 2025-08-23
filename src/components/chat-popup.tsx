
"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, X, PlusCircle, Image as ImageIcon, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Image from 'next/image';
import { getMessages, sendMessage, Message } from '@/ai/flows/chat-flow';
import { Skeleton } from './ui/skeleton';

interface ChatPopupProps {
  user: {
    displayName: string;
    photoURL: string;
  };
  onClose: () => void;
}

export function ChatPopup({ user, onClose }: ChatPopupProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoading(true);
      try {
        const history = await getMessages(user.displayName);
        setMessages(history);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMessages();
  }, [user.displayName]);

  const handleSendMessage = async (e?: React.FormEvent, messageContent?: { text?: string; image?: string }) => {
    if (e) e.preventDefault();
    const content = messageContent || { text: newMessage.trim() };
    if (!content.text && !content.image) return;

    if (!messageContent) {
      setNewMessage('');
    }

    // Optimistically update the UI
    const optimisticMessage: Message = {
      id: Math.random(), // Temporary ID
      ...content,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      const updatedMessages = await sendMessage(user.displayName, content, 'customer');
      setMessages(updatedMessages);
    } catch (error) {
      console.error("Failed to send message:", error);
      // Revert optimistic update on error if needed
      setMessages(prev => prev.filter(m => m.id !== optimisticMessage.id));
    }
  };

  const handleSendOrderStatus = () => {
    const orderMessage = { text: "Hi, I'd like to check the status of my recent order. The order ID is #12345XYZ." };
    handleSendMessage(undefined, orderMessage);
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

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 h-[450px] flex flex-col shadow-2xl rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between p-3 border-b bg-primary/10">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user.photoURL} alt={user.displayName} />
              <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
            </Avatar>
            <h3 className="font-semibold">{user.displayName}</h3>
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
                messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-lg px-3 py-2 ${
                      msg.sender === 'me'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}>
                      {msg.text && <p className="text-sm">{msg.text}</p>}
                      {msg.image && (
                          <Image src={msg.image} alt="Sent image" width={150} height={150} className="rounded-md" />
                      )}
                      <p className={`text-xs mt-1 ${
                          msg.sender === 'me'
                          ? 'text-primary-foreground/70 text-right'
                          : 'text-muted-foreground text-right'
                      }`}>{msg.timestamp}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-2 border-t">
          <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button type="button" variant="ghost" size="icon">
                        <PlusCircle className="h-5 w-5" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-2">
                    <div className="grid gap-1">
                        <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={handleSendOrderStatus}
                        >
                            <FileText className="mr-2 h-4 w-4" />
                            Order Status
                        </Button>
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
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              autoComplete="off"
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
