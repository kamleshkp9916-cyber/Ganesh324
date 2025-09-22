
"use client";

import Link from 'next/link';
import { Home, Save, MessageSquare, Globe, Users, ArrowLeft, HelpCircle, FileText, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { UserData } from '@/lib/follow-data';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebar } from './ui/sidebar';
import { format } from 'url';
import { ScrollArea } from './ui/scroll-area';
import { Logo } from './logo';


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
            return isPathMatch && !activeTab && !feedFilter;
        }

        return isPathMatch;
    }
    
    const handleNavigation = (href: string | { pathname: string, query?: any }) => {
        if (typeof href === 'string') {
            router.push(href);
        } else {
            router.push(format(href));
        }
        setOpen(false); // Close sidebar on navigation
    };
    
    const isFeedActive = isActive('/feed', null, 'global') || isActive('/feed', null, 'following') || (pathname === '/feed' && !activeTab && !feedFilter);
    const isMessagesActive = isActive('/feed', 'messages');

    return (
        <div className="p-4 flex flex-col h-full bg-sidebar-background text-sidebar-foreground">
            <div className="flex items-center justify-between gap-2 mb-8 flex-shrink-0">
                <Link href="/live-selling" className="flex items-center gap-2">
                    <Logo className="h-8 w-8 text-foreground" />
                    <span className="font-bold text-xl">StreamCart</span>
                </Link>
            </div>
             <ScrollArea className="-mx-4">
                <div className="px-4">
                    <div className="flex flex-col items-center text-center mb-6">
                        <Avatar className="h-20 w-20 mb-3 border-2 border-primary">
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
                    </div>
                     <Separator className="my-4 bg-border/50" />
                    <nav className="space-y-1">
                        <Button asChild variant="ghost" className={cn("w-full justify-start gap-3 text-base h-11", isFeedActive && "bg-secondary text-secondary-foreground")}>
                           <Link href="/feed" onClick={() => setOpen(false)}><Home /> Feed</Link>
                        </Button>
                        <Button asChild variant="ghost" className={cn("w-full justify-start gap-3 text-base h-11", isActive('/feed', 'saves') && "bg-secondary text-secondary-foreground")}>
                             <Link href={{ pathname: '/feed', query: { tab: 'saves' } }} onClick={() => setOpen(false)}><Save /> Saves</Link>
                        </Button>
                        <Button asChild variant="ghost" className={cn("w-full justify-start gap-3 text-base h-11", isMessagesActive && "bg-secondary text-secondary-foreground")}>
                           <Link href={{ pathname: '/feed', query: { tab: 'messages' } }} onClick={() => setOpen(false)}><MessageSquare /> Messages</Link>
                        </Button>
                    </nav>
                </div>
            </ScrollArea>
             <div className="mt-auto flex-shrink-0 pt-4 border-t border-border/50 text-sm">
                <div className="flex flex-row items-center justify-center gap-4">
                    <Button asChild variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary">
                        <Link href="/help">Help</Link>
                    </Button>
                     <Button asChild variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary">
                        <Link href="/contact">Contact</Link>
                    </Button>
                    <Button asChild variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary">
                       <Link href="/privacy-and-security">Privacy</Link>
                    </Button>
                    <Button variant="link" className="p-0 h-auto text-muted-foreground hover:text-primary">
                       Feedback
                    </Button>
                </div>
            </div>
        </div>
    );
};
