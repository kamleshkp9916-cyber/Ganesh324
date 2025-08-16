
"use client";

import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreVertical, Star, Plus, Send, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from '@/components/ui/separator';
import { ChatPopup } from '@/components/chat-popup';


// Mock data generation
const firstNames = ["Ganesh", "John", "Jane", "Alex", "Emily", "Chris", "Michael"];
const lastNames = ["Prajapati", "Doe", "Smith", "Johnson", "Williams", "Brown", "Jones"];
const bios = [
  "Live selling enthusiast. Love finding great deals!",
  "Collector of rare finds and vintage electronics.",
  "Fashionista and beauty guru. Join my stream for the latest trends.",
  "Home decor expert. Let's make your space beautiful.",
  "Tech reviewer and gadget lover. Unboxing the future."
];
const locations = ["New York, USA", "London, UK", "Tokyo, Japan", "Sydney, Australia", "Paris, France"];

const generateRandomUser = (currentUser: any) => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return {
    displayName: currentUser.displayName || `${firstName} ${lastName}`,
    username: currentUser.username || `@${firstName.toLowerCase()}${Math.floor(100 + Math.random() * 900)}`,
    email: currentUser.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    photoURL: currentUser.photoURL || `https://placehold.co/128x128.png?text=${firstName.charAt(0)}${lastName.charAt(0)}`,
    bio: bios[Math.floor(Math.random() * bios.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    following: Math.floor(Math.random() * 500),
    followers: Math.floor(Math.random() * 20000),
  };
};

const listedProducts = Array.from({ length: 6 }, (_, i) => ({
    id: i,
    imageUrl: 'https://placehold.co/200x250.png',
    hint: 'product placeholder'
}));

const userPosts = [
    {
        id: 1,
        text: 'This is a new software and will be launching for such customer who will sell their product in this platform.',
        imageUrl: 'https://placehold.co/400x300.png',
        hint: 'modern office software'
    },
    {
        id: 2,
        text: 'Just unboxed the latest gadget! Stay tuned for the full review stream tomorrow.',
        imageUrl: 'https://placehold.co/400x300.png',
        hint: 'tech gadget unboxing'
    }
];


export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const { user, loading } = useAuth();

  const [profileData, setProfileData] = useState<ReturnType<typeof generateRandomUser> | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const isOwnProfile = !userId;

  useEffect(() => {
    const activeUser = isOwnProfile ? user : { displayName: userId, email: `${userId}@example.com`, photoURL: '' };
    if (activeUser) {
        if (!profileData || (userId && profileData.displayName !== userId)) {
            setProfileData(generateRandomUser(activeUser));
        } else if (isOwnProfile && user && (!profileData || profileData.email !== user.email)) {
            setProfileData(generateRandomUser(user));
        }
    }
  }, [user, userId, isOwnProfile, profileData]);


  if (loading || !profileData) {
      return (
          <div className="flex items-center justify-center min-h-screen">
              <LoadingSpinner />
          </div>
      )
  }

  if (!user && isOwnProfile) {
    return (
         <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
             <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
             <p className="text-muted-foreground mb-6">Please log in to your account to view your profile.</p>
             <Button onClick={() => router.push('/')}>Go to Login</Button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon">
                <MoreVertical className="h-6 w-6" />
            </Button>
        </header>

        <main className="flex-1 overflow-y-auto pb-6">
            <div className="p-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-2">
                        <AvatarImage src={profileData.photoURL} alt={profileData.displayName} />
                        <AvatarFallback className="text-2xl">{profileData.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 grid grid-cols-3 gap-2 text-center">
                       <div>
                           <p className="font-bold text-lg">{profileData.following}</p>
                           <p className="text-xs text-muted-foreground">Following</p>
                       </div>
                       <div>
                           <p className="font-bold text-lg">{(profileData.followers / 1000).toFixed(1)}k</p>
                           <p className="text-xs text-muted-foreground">Followers</p>
                       </div>
                        <div>
                           <p className="font-bold text-lg">{(Math.floor(Math.random() * 50000) / 1000).toFixed(1)}k</p>
                           <p className="text-xs text-muted-foreground">Likes</p>
                       </div>
                    </div>
                </div>
                 <div className="mt-4">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        {profileData.displayName}
                        <Star className="w-5 h-5 text-primary fill-primary" />
                    </h1>
                    <p className="text-sm text-muted-foreground">{profileData.username}</p>
                </div>
                 {!isOwnProfile && (
                     <div className="mt-4 grid grid-cols-3 gap-2">
                        <Button 
                            variant={isFollowing ? 'secondary' : 'default'}
                            onClick={() => setIsFollowing(!isFollowing)}
                            className="col-span-2"
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </Button>
                        <Button variant="outline" onClick={() => setIsChatOpen(true)}>
                            <MessageSquare className="h-5 w-5" />
                        </Button>
                    </div>
                )}
            </div>

            <Tabs defaultValue="info" className="w-full mt-4">
                <TabsList className="grid w-full grid-cols-3 bg-transparent px-4">
                    <TabsTrigger value="info" className="pb-2 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary">Info</TabsTrigger>
                    <TabsTrigger value="products" className="pb-2 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary">Listed Products</TabsTrigger>
                    <TabsTrigger value="posts" className="pb-2 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary">Post</TabsTrigger>
                </TabsList>
                <Separator />
                <TabsContent value="info" className="p-4">
                    <Card>
                        <CardContent className="p-4">
                             <h3 className="font-semibold mb-2">About</h3>
                             <p className="text-sm text-muted-foreground">{profileData.bio}</p>
                             <h3 className="font-semibold mt-4 mb-2">Location</h3>
                             <p className="text-sm text-muted-foreground">{profileData.location}</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="products" className="p-4 space-y-4">
                     <div className="flex items-center justify-between">
                         <h2 className="text-lg font-bold">Listed Products</h2>
                         <Button variant="link" className="text-primary">See All</Button>
                     </div>
                     <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                        {listedProducts.map(product => (
                             <div key={product.id} className="flex-shrink-0">
                                 <Card className="w-32 h-40 overflow-hidden">
                                     <Image src={product.imageUrl} alt="Product" width={128} height={160} className="w-full h-full object-cover" data-ai-hint={product.hint} />
                                 </Card>
                             </div>
                         ))}
                     </div>
                </TabsContent>
                <TabsContent value="posts" className="p-4 space-y-4">
                     <div className="flex items-center justify-between">
                         <h2 className="text-lg font-bold">Post</h2>
                     </div>
                    {userPosts.map(post => (
                    <Card key={post.id}>
                        <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={profileData.photoURL} alt={profileData.displayName} />
                                    <AvatarFallback>{profileData.displayName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center gap-1">
                                        <p className="font-semibold">{profileData.username}</p>
                                        <Star className="w-4 h-4 text-primary fill-primary" />
                                        <Button size="icon" variant="ghost" className="h-5 w-5"><Plus className="h-4 w-4" /></Button>
                                    </div>
                                    <p className="text-sm mt-1">{post.text}</p>
                                </div>
                                <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-5 w-5" />
                                </Button>
                            </div>
                             <div className="relative mt-3">
                                <Image src={post.imageUrl} alt="Post image" width={400} height={300} className="rounded-lg w-full object-cover" data-ai-hint={post.hint} />
                                <Button size="icon" className="absolute bottom-3 right-3 bg-primary rounded-full h-10 w-10">
                                    <Send className="h-5 w-5" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    ))}
                </TabsContent>
            </Tabs>
        </main>
        
        {isChatOpen && !isOwnProfile && (
            <ChatPopup 
                user={{ displayName: profileData.displayName, photoURL: profileData.photoURL }}
                onClose={() => setIsChatOpen(false)} 
            />
        )}
    </div>
  );
}
