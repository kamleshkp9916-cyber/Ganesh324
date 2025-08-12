
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Share2, Grid3x3, Clapperboard, Heart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    { id: 1, type: 'image', src: 'https://placehold.co/300x400.png', caption: 'My new favorite dress!' },
    { id: 2, type: 'image', src: 'https://placehold.co/300x400.png', caption: 'Obsessed with these shoes.' },
    { id: 3, type: 'video', src: 'https://placehold.co/300x400.png', caption: 'A quick look at my latest haul.' },
    { id: 4, type: 'image', src: 'https://placehold.co/300x400.png', caption: 'Casual Friday vibes.' },
    { id: 5, type: 'video', src: 'https://placehold.co/300x400.png', caption: 'Styling this vintage jacket.' },
    { id: 6, type: 'image', src: 'https://placehold.co/300x400.png', caption: 'Weekend getaway outfit.' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">{userProfile.name}</h1>
        <Button variant="ghost" size="icon">
            <Share2 className="h-5 w-5" />
        </Button>
      </header>

      <main className="p-4">
        <Card>
            <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                    <Avatar className="w-28 h-28 border-4 border-primary">
                        <AvatarImage src={userProfile.avatarUrl} alt={userProfile.username} data-ai-hint="profile picture" />
                        <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h2 className="text-2xl font-bold mt-4">{userProfile.name}</h2>
                    <p className="text-muted-foreground">{userProfile.username}</p>
                    <p className="mt-2 text-sm max-w-md">{userProfile.bio}</p>
                </div>
                <Separator className="my-6" />
                <div className="flex justify-around">
                    <div className="text-center">
                        <p className="font-bold text-xl">{posts.length}</p>
                        <p className="text-sm text-muted-foreground">Posts</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-xl">{userProfile.followers}</p>
                        <p className="text-sm text-muted-foreground">Followers</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-xl">{userProfile.following}</p>
                        <p className="text-sm text-muted-foreground">Following</p>
                    </div>
                </div>
                 <div className="mt-6 flex gap-2">
                    <Button className="flex-1 font-semibold"><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button>
                </div>
            </CardContent>
        </Card>

        <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">My Posts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {posts.map(post => (
                    <Card key={post.id} className="overflow-hidden">
                        <div className="aspect-video relative">
                             <Image src={post.src} alt="post" layout="fill" className="object-cover" data-ai-hint="fashion clothes" />
                             {post.type === 'video' && 
                                <div className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white">
                                    <Clapperboard className="w-4 h-4" />
                                </div>
                             }
                        </div>
                        <div className="p-4">
                            <p className="text-sm">{post.caption}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
      </main>
    </div>
  );
}
