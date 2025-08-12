
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';

export default function ProfilePage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState({
    name: 'bantypr324',
    username: '@bantypr324',
    avatarUrl: 'https://placehold.co/100x100.png',
    following: 200,
    followers: 100,
    bio: 'Digital creator | Fashion enthusiast | Shop my looks 👇',
    postsCount: 6,
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Profile</h1>
        <div className="w-10"></div>
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
                        <p className="font-bold text-xl">{userProfile.postsCount}</p>
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
      </main>
    </div>
  );
}
