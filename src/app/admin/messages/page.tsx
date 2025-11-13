
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Search, MoreVertical, MessageSquare, ShieldCheck, Menu } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Link from 'next/link';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAuthActions } from '@/lib/auth';
import { useDebounce } from '@/hooks/use-debounce';
import { ChatWindow, ConversationList, Conversation, Message } from '@/components/messaging/common';
import { getConversations, getOrCreateConversation } from '@/ai/flows/chat-flow';
import { getUserByDisplayName, UserData } from '@/lib/follow-data';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { AdminLayout } from '@/components/admin/admin-layout';


export default function AdminMessagePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, userData, loading } = useAuth();
  const { signOut } = useAuthActions();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const isMobile = useIsMobile();

  const preselectUserId = searchParams.get('userId');
  const preselectUserName = searchParams.get('userName');

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
        const convos = await getConversations(user.uid);
        let allConvos = [...convos];
        let convoToSelect: Conversation | null = null;
        
        if (preselectUserId && userData) {
            // Attempt to find or create a conversation with the preselected user.
            // This is primarily for replying to inquiries where the user might not exist in Firestore yet.
            const otherUser: Partial<UserData> = { uid: preselectUserId, displayName: preselectUserName || 'New User', photoURL: '' };
            const conversationId = await getOrCreateConversation(user.uid, preselectUserId, userData, otherUser as UserData);
            
            const existingConvo = allConvos.find(c => c.conversationId === conversationId);
            
            if (existingConvo) {
                convoToSelect = existingConvo;
            } else {
                 // If the conversation was just created, it might not be in the initial fetch.
                 // We create a temporary object to represent it in the UI until the next fetch.
                 const newConvo: Conversation = {
                    conversationId: conversationId,
                    userId: preselectUserId,
                    userName: preselectUserName || 'Customer',
                    avatarUrl: `https://placehold.co/40x40.png?text=${(preselectUserName || 'U').charAt(0)}`,
                    lastMessage: 'New inquiry.',
                    lastMessageTimestamp: 'now',
                    unreadCount: 1,
                };
                allConvos = [newConvo, ...allConvos];
                convoToSelect = newConvo;
            }
        } else if (allConvos.length > 0) {
            convoToSelect = allConvos[0];
        }
        
        setConversations(allConvos);

        if (convoToSelect && !isMobile) {
            setSelectedConversation(convoToSelect);
        }
    } catch (error) {
        console.error("Failed to fetch conversations:", error);
    } finally {
        setIsLoading(false);
    }
  }, [user, preselectUserId, preselectUserName, userData, isMobile]);

  useEffect(() => {
    if (!loading && user && userData?.role === 'admin') {
      fetchConversations();
    }
  }, [loading, user, userData, fetchConversations]);

  const handleSelectConversation = (convo: Conversation) => {
    setSelectedConversation(convo);
  }

  const filteredConversations = useMemo(() => {
    if (!debouncedSearchTerm) return conversations;
    return conversations.filter(convo => convo.userName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
  }, [conversations, debouncedSearchTerm]);
  
  if (loading || isLoading) {
    return <div className="h-screen w-full flex items-center justify-center"><LoadingSpinner /></div>;
  }
  
  if (!user || userData?.role !== 'admin') {
      router.push('/');
      return null;
  }

  return (
    <AdminLayout>
        <div className="h-full w-full flex bg-background text-foreground overflow-hidden">
            <div className={cn(
                "h-full w-full flex-col border-r md:flex md:w-1/3 lg:w-1/4",
                isMobile && selectedConversation && "hidden"
            )}>
                <ConversationList 
                    conversations={filteredConversations} 
                    selectedConversation={selectedConversation}
                    onSelectConversation={handleSelectConversation}
                />
            </div>
            
            <div className={cn(
                "h-full w-full flex-col md:flex md:w-2/3 lg:w-3/4",
                isMobile && !selectedConversation && "hidden"
            )}>
                {selectedConversation && userData ? (
                    <ChatWindow 
                        key={selectedConversation.conversationId}
                        conversation={selectedConversation}
                        userData={userData}
                        onBack={() => setSelectedConversation(null)}
                    />
                ) : (
                    <div className="hidden md:flex flex-col items-center justify-center h-full text-muted-foreground">
                        <MessageSquare className="h-16 w-16 mb-4"/>
                        <h2 className="text-xl font-semibold">Support Center</h2>
                        <p>Select a conversation to start messaging with customers and sellers.</p>
                    </div>
                )}
            </div>
        </div>
    </AdminLayout>
  );
}
