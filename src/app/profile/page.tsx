
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Share2, Grid3x3, Clapperboard, Heart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

export default function ProfilePage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState({
    name: 'bantypr324',
    username: '@bantypr324',
    avatarUrl: 'https://placehold.co/100x100.png',
    following: 200,
    followers: 100,
    bio: 'Digital creator | Fashion enthusiast | Shop my looks 👇',
  });

  const posts = [
    { id: 1, type: 'image', src: 'https://placehold.co/300x400.png' },
    { id: 2, type: 'image', src: 'https://placehold.co/300x400.png' },
    { id: 3, type: 'video', src: 'https://placehold.co/300x400.png' },
    { id: 4, type: 'image', src: 'https://placehold.co/300x400.png' },
    { id: 5, type: 'video', src: 'https://placehold.co/300x400.png' },
    { id: 6, type: 'image', src: 'https://placehold.co/300x400.png' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Profile</h1>
        <div className="w-10"></div>
      </header>

      <main className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-24 h-24">
            <AvatarImage src={userProfile.avatarUrl} alt={userProfile.username} data-ai-hint="profile picture" />
            <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex gap-4 text-center">
            <div>
              <p className="font-bold text-lg">{posts.length}</p>
              <p className="text-sm text-muted-foreground">Posts</p>
            </div>
            <div>
              <p className="font-bold text-lg">{userProfile.followers}</p>
              <p className="text-sm text-muted-foreground">Followers</p>
            </div>
            <div>
              <p className="font-bold text-lg">{userProfile.following}</p>
              <p className="text-sm text-muted-foreground">Following</p>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <p className="font-semibold">{userProfile.name}</p>
          <p className="text-sm text-muted-foreground">{userProfile.username}</p>
          <p className="mt-2 text-sm">{userProfile.bio}</p>
        </div>
        <div className="mt-4 flex gap-2">
          <Button className="flex-1 font-semibold">Edit Profile</Button>
          <Button variant="outline" className="flex-1 font-semibold">Share Profile</Button>
        </div>
      </main>

      <Separator className="my-4" />

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts"><Grid3x3 /></TabsTrigger>
          <TabsTrigger value="reels"><Clapperboard /></TabsTrigger>
          <TabsTrigger value="liked"><Heart /></TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
            <div className="grid grid-cols-3 gap-1">
                {posts.filter(p => p.type === 'image').map(post => (
                    <div key={post.id} className="aspect-square relative">
                        <Image src={post.src} alt="post" layout="fill" className="object-cover" data-ai-hint="fashion clothes" />
                    </div>
                ))}
            </div>
        </TabsContent>
        <TabsContent value="reels">
            <div className="grid grid-cols-3 gap-1">
                {posts.filter(p => p.type === 'video').map(post => (
                    <div key={post.id} className="aspect-square relative">
                        <Image src={post.src} alt="reel" layout="fill" className="object-cover" data-ai-hint="fashion video" />
                         <div className="absolute bottom-2 left-2 text-white">
                            <Clapperboard className="w-4 h-4" />
                        </div>
                    </div>
                ))}
            </div>
        </TabsContent>
        <TabsContent value="liked">
            <div className="text-center py-10">
                <p>You haven't liked any posts yet.</p>
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

    