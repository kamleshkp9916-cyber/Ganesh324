
"use client";

import Link from 'next/link';
import { Home, Save, MessageSquare, Settings, Globe, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { UserData } from '@/lib/follow-data';
import { useRouter } from 'next/navigation';

interface MainSidebarProps {
    userData: UserData;
    userPosts: any[];
    feedFilter: 'global' | 'following';
    setFeedFilter: (filter: 'global' | 'following') => void;
    activeView: 'feed' | 'saves' | 'messages';
    setActiveView: (view: 'feed' | 'saves' | 'messages') => void;
}

export function MainSidebar({ userData, userPosts, feedFilter, setFeedFilter, activeView, setActiveView }: MainSidebarProps) {
    const router = useRouter();
    return (
        <div className="p-6 flex flex-col h-full">
             <div className="flex items-center gap-2 mb-8">
                 <Button variant="ghost" size="icon" className="-ml-2" onClick={() => router.push('/live-selling')}>
                    <ArrowLeft />
                </Button>
                <div className="flex-grow" />
            </div>
            <div className="flex flex-col items-center text-center mb-8">
                <Avatar className="h-20 w-20 mb-3">
                    <AvatarImage src={userData.photoURL || undefined} alt={userData.displayName} />
                    <AvatarFallback>{userData.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <p className="font-bold text-lg">{userData.displayName}</p>
                <p className="text-sm text-muted-foreground">@{userData.displayName.toLowerCase().replace(' ', '')}</p>

                <div className="flex justify-around mt-4 w-full text-center">
                    <div>
                        <p className="font-bold text-lg">{userPosts.length}</p>
                        <p className="text-xs text-muted-foreground">Posts</p>
                    </div>
                    <div>
                        <p className="font-bold text-lg">{userData.followers || 0}</p>
                        <p className="text-xs text-muted-foreground">Followers</p>
                    </div>
                    <div>
                        <p className="font-bold text-lg">{userData.following || 0}</p>
                        <p className="text-xs text-muted-foreground">Following</p>
                    </div>
                </div>
                <Separator className="my-4" />
            </div>
            <nav className="space-y-1 flex-grow">
                <Collapsible defaultOpen>
                    <CollapsibleTrigger asChild>
                         <Button variant="ghost" className="w-full justify-start gap-3 text-base data-[active=true]:bg-primary/10 data-[active=true]:text-primary" data-active={activeView === 'feed'} onClick={() => router.push('/feed')}>
                            <Home /> Feed
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-8 space-y-1 mt-1">
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground data-[active=true]:text-primary data-[active=true]:bg-primary/10" data-active={feedFilter === 'global' && activeView === 'feed'} onClick={() => { setFeedFilter('global'); setActiveView('feed'); }}>
                            <Globe className="w-4 h-4" /> Global
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground data-[active=true]:text-primary data-[active=true]:bg-primary/10" data-active={feedFilter === 'following' && activeView === 'feed'} onClick={() => { setFeedFilter('following'); setActiveView('feed'); }}>
                            <Users className="w-4 h-4" /> Following
                        </Button>
                    </CollapsibleContent>
                </Collapsible>
                 <Button variant="ghost" className="w-full justify-start gap-3 text-base data-[active=true]:bg-primary/10 data-[active=true]:text-primary" data-active={activeView === 'saves'} onClick={() => setActiveView('saves')}>
                    <Save /> Saves
                 </Button>
                 <Button variant="ghost" className="w-full justify-start gap-3 text-base data-[active=true]:bg-primary/10 data-[active=true]:text-primary" data-active={activeView === 'messages'} onClick={() => setActiveView('messages')}>
                    <MessageSquare /> Messages
                 </Button>
                 <Link href="/setting" className="flex items-center w-full p-2 rounded-md hover:bg-muted justify-start gap-3 text-base">
                    <Settings /> Settings
                </Link>
            </nav>
        </div>
    );
};
