
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

interface ChatPopupProps {
  user: {
    displayName: string;
    photoURL: string;
  };
  onClose: () => void;
}

interface Message {
  id: number;
  text?: string;
  sender: 'me' | 'them';
  timestamp: string;
  image?: string;
}

export function ChatPopup({ user, onClose }: ChatPopupProps) {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hey! I saw your stream and I'm interested in the vintage camera. Is it still available?", sender: 'them', timestamp: '10:00 AM' },
    { id: 2, text: "Hi there! Yes, it is. It's in great working condition.", sender: 'me', timestamp: '10:01 AM' },
    { id: 3, text: "Awesome! Could you tell me a bit more about the lens?", sender: 'them', timestamp: '10:01 AM' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createMessage = (msg: Omit<Message, 'id' | 'timestamp'>): Message => ({
      ...msg,
      id: messages.length + 1,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    setMessages(prev => [...prev, createMessage({ text: newMessage, sender: 'me' })]);
    setNewMessage('');
  };

  const handleSendOrderStatus = () => {
    const orderMessage = "Hi, I'd like to check the status of my recent order. The order ID is #12345XYZ.";
    setMessages(prev => [...prev, createMessage({ text: orderMessage, sender: 'me' })]);
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMessages(prev => [...prev, createMessage({ image: reader.result as string, sender: 'me' })]);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div');
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
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
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
              ))}
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
