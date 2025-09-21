
"use client";

import Link from 'next/link';
import { Home, Save, MessageSquare, Globe, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { UserData } from '@/lib/follow-data';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebar } from './ui/sidebar';

interface MainSidebarProps {
    userData: UserData;
    userPosts: any[];
}

export function MainSidebar({ userData, userPosts }: MainSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { setOpen } = useSidebar();

    const activeTab = searchParams.get('tab');
    const feedFilter = searchParams.get('filter');

    const isActive = (path: string, tab?: string | null, filter?: string | null) => {
        const isPathMatch = pathname === path;
        
        if (tab) {
            return isPathMatch && activeTab === tab;
        }

        if (filter) {
            return isPathMatch && feedFilter === filter;
        }
        
        if (path === '/feed') {
            return isPathMatch && !activeTab; // Only true for the main feed page, not tabs
        }

        return isPathMatch;
    }
    
    const handleNavigation = (href: string | { pathname: string, query?: any }) => {
        router.push(href);
        setOpen(false); // Close sidebar on navigation
    };
    
    const isFeedActive = isActive('/feed', null, 'global') || isActive('/feed', null, 'following') || (pathname === '/feed' && !activeTab && !feedFilter);

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
                <Collapsible defaultOpen={isFeedActive}>
                    <CollapsibleTrigger asChild>
                        <Button asChild variant="ghost" className="w-full justify-start gap-3 text-base" data-active={isFeedActive}>
                            <Link href="/feed"><Home /> Feed</Link>
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-8 space-y-1 mt-1">
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground data-[active=true]:text-primary data-[active=true]:bg-primary/10" data-active={isActive('/feed') && !feedFilter} onClick={() => handleNavigation('/feed')}>
                            <Globe className="w-4 h-4" /> Global
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground data-[active=true]:text-primary data-[active=true]:bg-primary/10" data-active={isActive('/feed', null, 'following')} onClick={() => handleNavigation({ pathname: '/feed', query: { filter: 'following' } })}>
                            <Users className="w-4 h-4" /> Following
                        </Button>
                    </CollapsibleContent>
                </Collapsible>
                <Button variant="ghost" className="w-full justify-start gap-3 text-base data-[active=true]:bg-primary/10 data-[active=true]:text-primary" data-active={isActive('/feed', 'saves')} onClick={() => handleNavigation({ pathname: '/feed', query: { tab: 'saves' } })}>
                    <Save /> Saves
                </Button>
                <Button variant="ghost" className="w-full justify-start gap-3 text-base data-[active=true]:bg-primary/10 data-[active=true]:text-primary" data-active={isActive('/feed', 'messages')} onClick={() => handleNavigation({ pathname: '/feed', query: { tab: 'messages' } })}>
                    <MessageSquare /> Messages
                </Button>
            </nav>
        </div>
    );
};
