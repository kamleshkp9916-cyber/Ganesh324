
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search, MoreVertical, Briefcase, Calendar, Cake } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import Link from 'next/link';

function VerifiedIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.454-12.68a.75.75 0 011.04-.208z"
        clipRule="evenodd"
      />
    </svg>
  );
}

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

  const userPosts = [
    { id: 1, imageUrl: 'https://placehold.co/300x400.png', caption: 'Post 1', hint: 'fashion clothing' },
    { id: 2, imageUrl: 'https://placehold.co/300x400.png', caption: 'Post 2', hint: 'street style' },
    { id: 3, imageUrl: 'https://placehold.co/300x400.png', caption: 'Post 3', hint: 'summer outfit' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between bg-transparent">
        <Button variant="ghost" size="icon" className="bg-black/50 hover:bg-black/70" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6 text-white" />
        </Button>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="bg-black/50 hover:bg-black/70">
                <Search className="h-6 w-6 text-white" />
            </Button>
            <Button variant="ghost" size="icon" className="bg-black/50 hover:bg-black/70">
                <MoreVertical className="h-6 w-6 text-white" />
            </Button>
        </div>
      </header>

      <main className="flex flex-col">
        <div className="relative h-48 bg-muted">
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
                        <h2 className="text-2xl font-bold">{userProfile.name}</h2>
                        <VerifiedIcon className="w-5 h-5 text-blue-500" />
                        <Link href="#" className="text-sm text-blue-500 hover:underline">Get Verified</Link>
                    </div>
                    <p className="text-muted-foreground">{userProfile.username}</p>
                    <p className="mt-2 text-sm flex items-center gap-1.5">
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
          <TabsList className="grid w-full grid-cols-4 rounded-none border-b">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="replies">Replies</TabsTrigger>
            <TabsTrigger value="highlights">Highlights</TabsTrigger>
            <TabsTrigger value="articles">Articles</TabsTrigger>
          </TabsList>
          <TabsContent value="posts" className="p-0">
             {loading ? (
              <div className="grid grid-cols-3 gap-1 mt-0.5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="relative aspect-[3/4]">
                    <Skeleton className="w-full h-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-0.5 mt-0.5">
                {userPosts.map(post => (
                  <div key={post.id} className="relative aspect-[3/4]">
                    <Image src={post.imageUrl} alt={post.caption} fill className="object-cover" data-ai-hint={post.hint} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
           <TabsContent value="replies">
                <div className="flex items-center justify-center h-48">
                    <p className="text-muted-foreground">No replies yet.</p>
                </div>
          </TabsContent>
          <TabsContent value="highlights">
                <div className="flex items-center justify-center h-48">
                    <p className="text-muted-foreground">No highlights yet.</p>
                </div>
          </TabsContent>
          <TabsContent value="articles">
                <div className="flex items-center justify-center h-48">
                    <p className="text-muted-foreground">No articles yet.</p>
                </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

