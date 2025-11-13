
"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Search, MoreVertical, MessageSquare, ShieldCheck, Menu, User, Users } from 'lucide-react';
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
import { getFirestore, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase';
import { Separator } from '@/components/ui/separator';


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
  const [searchResults, setSearchResults] = useState<UserData[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const preselectUserId = searchParams.get('userId');
  const preselectUserName = searchParams.get('userName');

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    try {
        const convos = await getConversations(user.uid);
        let allConvos = [...convos];
        let convoToSelect: Conversation | null = null;
        
        if (preselectUserId && userData) {
            const otherUser: Partial<UserData> = { uid: preselectUserId, displayName: preselectUserName || 'New User', photoURL: '' };
            const conversationId = await getOrCreateConversation(user.uid, preselectUserId, userData, otherUser as UserData);
            
            const existingConvo = allConvos.find(c => c.conversationId === conversationId);
            
            if (existingConvo) {
                convoToSelect = existingConvo;
            } else {
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

  useEffect(() => {
    const searchUsers = async () => {
        if (debouncedSearchTerm.trim().length < 2) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        const db = getFirestoreDb();
        const usersRef = collection(db, "users");
        const q = query(
            usersRef,
            where("displayName", ">=", debouncedSearchTerm),
            where("displayName", "<=", debouncedSearchTerm + '\uf8ff'),
            limit(10)
        );
        const querySnapshot = await getDocs(q);
        const users = querySnapshot.docs
            .map(doc => doc.data() as UserData)
            .filter(u => u.role !== 'admin'); // Exclude admins from results
        setSearchResults(users);
        setIsSearching(false);
    };

    searchUsers();
  }, [debouncedSearchTerm]);


  const handleSelectConversation = (convo: Conversation) => {
    setSelectedConversation(convo);
  }
  
  const handleSelectUserFromSearch = async (targetUser: UserData) => {
      if (!user || !userData) return;
      
      const conversationId = await getOrCreateConversation(user.uid, targetUser.uid, userData, targetUser);
      const existingConvo = conversations.find(c => c.conversationId === conversationId);

      if (existingConvo) {
          setSelectedConversation(existingConvo);
      } else {
          const newConvo: Conversation = {
              conversationId: conversationId,
              userId: targetUser.uid,
              userName: targetUser.displayName,
              avatarUrl: targetUser.photoURL,
              lastMessage: 'New conversation started.',
              lastMessageTimestamp: 'now',
              unreadCount: 0,
          };
          setConversations(prev => [newConvo, ...prev]);
          setSelectedConversation(newConvo);
      }
      setSearchTerm('');
      setSearchResults([]);
  };

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

  const renderConversationList = () => {
      if (debouncedSearchTerm.length >= 2) {
          return (
              <>
                  <p className="px-4 py-2 text-xs font-semibold text-muted-foreground">Search Results</p>
                  {isSearching ? (
                      <div className="p-4 text-center"><LoadingSpinner /></div>
                  ) : searchResults.length > 0 ? (
                      searchResults.map(u => (
                          <div key={u.uid} onClick={() => handleSelectUserFromSearch(u)} className="flex items-center gap-3 p-3 hover:bg-secondary cursor-pointer">
                              <Avatar className="h-10 w-10">
                                  <AvatarImage src={u.photoURL} />
                                  <AvatarFallback>{u.displayName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                  <p className="font-semibold text-sm">{u.displayName}</p>
                                  <p className="text-xs text-muted-foreground">{u.email}</p>
                              </div>
                          </div>
                      ))
                  ) : (
                      <p className="p-4 text-center text-sm text-muted-foreground">No users found.</p>
                  )}
                   <Separator className="my-2" />
              </>
          );
      }
      return null;
  };

  return (
    <AdminLayout>
        <div className="h-full w-full flex bg-background text-foreground overflow-hidden">
            <div className={cn(
                "h-full w-full flex-col border-r md:flex md:w-1/3 lg:w-1/4",
                isMobile && selectedConversation && "hidden"
            )}>
                 <div className="p-4 border-b">
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search users or conversations..."
                            className="pl-8 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                {renderConversationList()}
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
                        <p>Select a conversation or search for a user to start messaging.</p>
                    </div>
                )}
            </div>
        </div>
    </AdminLayout>
  );
}
