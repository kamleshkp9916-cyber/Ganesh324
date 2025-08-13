
"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, MoreVertical, Briefcase, Calendar, Cake, Star, LayoutGrid, MessageCircle, Heart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

function OmIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M7.5 2a2.5 2.5 0 0 1 0 5c-1.5-1.5-5-1.5-5 0s3.5 1.5 5 0a2.5 2.5 0 0 1 0-5"/><path d="M12 12h.01"/><path d="M16.5 12a2.5 2.5 0 0 1 0 5c1.5-1.5 5-1.5 5 0s-3.5 1.5-5 0a2.5 2.5 0 0 1 0-5"/><path d="M4.5 12a2.5 2.5 0 0 1 0-5c-1.5 1.5-5 1.5-5 0s3.5-1.5 5 0a2.5 2.5 0 0 1 0 5"/></svg>
    )
}

function StarOfDavidIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/><path d="M12 22l-3.09-6.26L2 14.73l5-4.87-1.18-6.88L12 6.23l6.18-3.25L17 7.86l5 4.87-6.91 1.01L12 22z"/></svg>
    )
}

function FoldedHandsIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M8 12.5a2.5 2.5 0 0 1-5 0V11a2 2 0 0 1 2-2h3v3.5Z"/><path d="M16 12.5a2.5 2.5 0 0 0 5 0V11a2 2 0 0 0-2-2h-3v3.5Z"/><path d="M10 9V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v5"/><path d="M14 9V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v5"/><path d="M10 16.5c-2 0-3 1-3 2v1a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2v-1c0-1-1-2-3-2Z"/><path d="M14 16.5c2 0 3 1 3 2v1a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-1c0-1 1-2 3-2Z"/></svg>
    )
}


export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const headerRef = useRef<HTMLElement>(null);
  const [userProfile, setUserProfile] = useState({
    name: 'Samael Prajapati',
    username: '@SamaelPr9916',
    avatarUrl: 'https://placehold.co/100x100.png',
    bannerUrl: 'https://placehold.co/600x200.png',
    following: 541,
    followers: 34,
    bio: 'Sanatan Dharma.',
    details: [
        { icon: Briefcase, text: 'Entrepreneur' },
        { icon: Cake, text: 'Born 10 January 2003' },
        { icon: Calendar, text: 'Joined September 2021' },
    ],
  });

  const userPosts = useMemo(() => [
    { id: 1, imageUrl: 'https://placehold.co/300x400.png', caption: 'Post 1', hint: 'fashion clothing' },
    { id: 2, imageUrl: 'https://placehold.co/300x400.png', caption: 'Post 2', hint: 'street style' },
    { id: 3, imageUrl: 'https://placehold.co/300x400.png', caption: 'Post 3', hint: 'summer outfit' },
    { id: 4, imageUrl: 'https://placehold.co/300x400.png', caption: 'Post 4', hint: 'travel photo' },
    { id: 5, imageUrl: 'https://placehold.co/300x400.png', caption: 'Post 5', hint: 'food photography' },
    { id: 6, imageUrl: 'https://placehold.co/300x400.png', caption: 'Post 6', hint: 'architectural design' },
  ], []);

  const filteredPosts = useMemo(() => {
    if (!searchQuery) return userPosts;
    return userPosts.filter(
      (post) =>
        post.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.hint.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, userPosts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsSearchVisible(false);
        setSearchQuery('');
      }
    }
    if (isSearchVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchVisible]);

  return (
    <div className="min-h-screen bg-background text-foreground">
       <header ref={headerRef} className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between bg-transparent">
        <Button variant="ghost" size="icon" onClick={() => {
            if (isSearchVisible) {
                setIsSearchVisible(false);
                setSearchQuery('');
            } else {
                router.back();
            }
        }}>
          <ArrowLeft className="h-6 w-6 text-white" />
        </Button>
        {isSearchVisible ? (
             <div className="relative flex-1 mx-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full rounded-full bg-background/80 text-foreground"
                />
              </div>
        ) : (
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setIsSearchVisible(true)}>
                    <Search className="h-6 w-6 text-white" />
                </Button>
                <Link href="/setting">
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-6 w-6 text-white" />
                    </Button>
                </Link>
            </div>
        )}
      </header>

      <main className="flex flex-col">
        <div className="relative h-40 bg-muted">
             {loading ? <Skeleton className="w-full h-full" /> : 
                <Image src={userProfile.bannerUrl} alt="Banner" layout="fill" objectFit="cover" data-ai-hint="stay positive" />
             }
             <div className="absolute -bottom-12 left-4">
                {loading ? <Skeleton className="w-24 h-24 rounded-full border-4 border-background" /> : 
                    <Avatar className="w-24 h-24 border-4 border-background">
                        <AvatarImage src={userProfile.avatarUrl} alt={userProfile.username} data-ai-hint="profile picture" />
                        <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                }
            </div>
        </div>
        
        <div className="p-4 mt-12">
            <div className="flex justify-end mb-4">
                 {loading ? <Skeleton className="h-9 w-24" /> : <Button variant="outline">Edit profile</Button>}
            </div>

            {loading ? (
                <div className="space-y-3">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-40" />
                    <div className="space-y-2 pt-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-5 w-44" />
                        <Skeleton className="h-5 w-36" />
                    </div>
                    <div className="flex gap-4 pt-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-20" />
                    </div>
                </div>
            ) : (
                <div>
                    <div className="flex items-center gap-1.5">
                        <h2 className="text-xl md:text-2xl font-bold">{userProfile.name}</h2>
                        <Star className="w-5 h-5 text-blue-500" fill="currentColor" />
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground">{userProfile.username}</p>
                    <p className="mt-2 text-sm md:text-base flex items-center gap-1.5">
                        {userProfile.bio}
                        <OmIcon className="w-4 h-4 text-purple-500" />
                        <StarOfDavidIcon className="w-4 h-4 text-purple-500" />
                        <FoldedHandsIcon className="w-4 h-4 text-yellow-500" />
                    </p>
                    <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                        {userProfile.details.map((detail, index) => (
                             <div key={index} className="flex items-center gap-2">
                                <detail.icon className="w-4 h-4" />
                                <span>{detail.text}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 flex gap-4 text-sm">
                        <p><span className="font-bold text-foreground">{userProfile.following}</span> <span className="text-muted-foreground">Following</span></p>
                        <p><span className="font-bold text-foreground">{userProfile.followers}</span> <span className="text-muted-foreground">Followers</span></p>
                    </div>
                </div>
            )}
        </div>
        
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
            <TabsTrigger value="posts"><LayoutGrid className="w-5 h-5" /></TabsTrigger>
            <TabsTrigger value="replies"><MessageCircle className="w-5 h-5" /></TabsTrigger>
            <TabsTrigger value="likes"><Heart className="w-5 h-5" /></TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="p-0">
             {loading ? (
                <div className="grid grid-cols-3 gap-1 mt-0.5">
                    {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="relative aspect-[3/4]">
                        <Skeleton className="w-full h-full" />
                    </div>
                    ))}
                </div>
             ) : (
                filteredPosts.length > 0 ? (
                    <div className="grid grid-cols-3 gap-0.5 mt-0.5">
                        {filteredPosts.map(post => (
                        <div key={post.id} className="relative aspect-[3/4]">
                            <Image src={post.imageUrl} alt={post.caption} fill className="object-cover" data-ai-hint={post.hint} />
                        </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-48">
                        <p className="text-muted-foreground">No posts found.</p>
                    </div>
                )
            )}
          </TabsContent>
           <TabsContent value="replies">
                <div className="flex items-center justify-center h-48">
                    <p className="text-muted-foreground">No replies yet.</p>
                </div>
          </TabsContent>
          <TabsContent value="likes">
                <div className="flex items-center justify-center h-48">
                    <p className="text-muted-foreground">No likes yet.</p>
                </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
