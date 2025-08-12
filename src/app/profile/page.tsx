
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Grid3x3, Heart, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState({
    name: 'bantypr324',
    username: '@bantypr324',
    avatarUrl: 'https://placehold.co/100x100.png',
    following: 200,
    followers: 100,
    bio: 'Digital creator | Fashion enthusiast | Shop my looks 👇',
  });

  const userPosts = [
    { id: 1, imageUrl: 'https://placehold.co/300x400.png', caption: 'Post 1', hint: 'fashion clothing' },
    { id: 2, imageUrl: 'https://placehold.co/300x400.png', caption: 'Post 2', hint: 'street style' },
    { id: 3, imageUrl: 'https://placehold.co/300x400.png', caption: 'Post 3', hint: 'summer outfit' },
    { id: 4, imageUrl: 'https://placehold.co/300x400.png', caption: 'Post 4', hint: 'accessories details' },
    { id: 5, imageUrl: 'https://placehold.co/300x400.png', caption: 'Post 5', hint: 'casual look' },
    { id: 6, imageUrl: 'https://placehold.co/300x400.png', caption: 'Post 6', hint: 'formal wear' },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); 
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Profile</h1>
        <div className="w-10"></div>
      </header>

      <main className="p-4 space-y-4">
        <Card>
            <CardContent className="pt-6">
                {loading ? (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <Skeleton className="w-28 h-28 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-6 w-32" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <Skeleton className="h-4 w-48" />
                        </div>
                        <Separator />
                        <div className="flex justify-around">
                            <div className="text-center space-y-1">
                                <Skeleton className="h-5 w-8 mx-auto" />
                                <Skeleton className="h-4 w-12" />
                            </div>
                            <div className="text-center space-y-1">
                                <Skeleton className="h-5 w-8 mx-auto" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                            <div className="text-center space-y-1">
                                <Skeleton className="h-5 w-8 mx-auto" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        </div>
                         <div className="mt-6 flex gap-2">
                            <Skeleton className="h-10 flex-1" />
                        </div>
                    </div>
                ) : (
                    <>
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
                                <p className="font-bold text-xl">{userPosts.length}</p>
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
                    </>
                )}
            </CardContent>
        </Card>
        
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts"><Grid3x3 className="w-4 h-4 mr-2" /> Posts</TabsTrigger>
            <TabsTrigger value="likes"><Heart className="w-4 h-4 mr-2" /> Likes</TabsTrigger>
            <TabsTrigger value="replies"><MessageSquare className="w-4 h-4 mr-2" /> Reply</TabsTrigger>
          </TabsList>
          <TabsContent value="posts">
             {loading ? (
              <div className="grid grid-cols-3 gap-1 mt-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="relative aspect-square">
                    <Skeleton className="w-full h-full rounded-md" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 mt-4">
                {userPosts.map(post => (
                  <div key={post.id} className="relative aspect-square">
                    <Image src={post.imageUrl} alt={post.caption} fill className="object-cover rounded-md" data-ai-hint={post.hint} />
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
           <TabsContent value="likes">
             {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Skeleton className="h-8 w-48" />
                </div>
            ) : (
                <div className="flex items-center justify-center h-48">
                    <p className="text-muted-foreground">No liked posts yet.</p>
                </div>
            )}
          </TabsContent>
          <TabsContent value="replies">
             {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Skeleton className="h-8 w-48" />
                </div>
            ) : (
                <div className="flex items-center justify-center h-48">
                    <p className="text-muted-foreground">No replies yet.</p>
                </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

    