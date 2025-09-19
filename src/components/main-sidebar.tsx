
"use client";

import Link from 'next/link';
import { Home, Save, MessageSquare, Settings, Globe, Users, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { UserData } from '@/lib/follow-data';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface MainSidebarProps {
    userData: UserData;
    userPosts: any[];
}

export function MainSidebar({ userData, userPosts }: MainSidebarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const isActive = (path: string, filter?: 'global' | 'following') => {
        if (pathname !== path) return false;
        if (filter) {
            return searchParams.get('filter') === filter || (!searchParams.get('filter') && filter === 'global');
        }
        return true;
    }

    const createQueryString = (name: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set(name, value)
        return params.toString()
    }
    
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
                         <Button asChild variant="ghost" className="w-full justify-start gap-3 text-base" data-active={isActive('/feed')}>
                            <Link href="/feed"><Home /> Feed</Link>
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-8 space-y-1 mt-1">
                        <Button asChild variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground data-[active=true]:text-primary data-[active=true]:bg-primary/10" data-active={isActive('/feed', 'global')}>
                            <Link href="/feed?filter=global"><Globe className="w-4 h-4" /> Global</Link>
                        </Button>
                        <Button asChild variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground data-[active=true]:text-primary data-[active=true]:bg-primary/10" data-active={isActive('/feed', 'following')}>
                           <Link href={{ pathname: '/feed', query: { filter: 'following' } }}><Users className="w-4 h-4" /> Following</Link>
                        </Button>
                    </CollapsibleContent>
                </Collapsible>
                 <Button asChild variant="ghost" className="w-full justify-start gap-3 text-base" data-active={isActive('/feed', 'saves')}>
                    <Link href={{ pathname: '/feed', query: { tab: 'saves' } }}><Save /> Saves</Link>
                 </Button>
                 <Button asChild variant="ghost" className="w-full justify-start gap-3 text-base" data-active={isActive('/message')}>
                    <Link href="/message"><MessageSquare /> Messages</Link>
                 </Button>
                 <Link href="/setting" className={cn(
                     "flex items-center w-full p-2 rounded-md hover:bg-muted justify-start gap-3 text-base",
                     "text-foreground hover:bg-accent hover:text-accent-foreground" // Re-using Button styles in a Link
                 )}>
                    <Settings /> Settings
                </Link>
            </nav>
        </div>
    );
};
