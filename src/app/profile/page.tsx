
"use client";

import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreVertical, MessageSquare } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ChatPopup } from '@/components/chat-popup';
import { Footer } from '@/components/footer';


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
    email: currentUser.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    photoURL: currentUser.photoURL || `https://placehold.co/128x128.png?text=${firstName.charAt(0)}${lastName.charAt(0)}`,
    bio: bios[Math.floor(Math.random() * bios.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    following: Math.floor(Math.random() * 500),
    followers: Math.floor(Math.random() * 20000),
  };
};


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
        <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold">{profileData.displayName}</h1>
            <Button variant="ghost" size="icon">
                <MoreVertical className="h-6 w-6" />
            </Button>
        </header>

        <main className="flex-grow p-4">
            <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 border-2 mb-4">
                    <AvatarImage src={profileData.photoURL} alt={profileData.displayName} />
                    <AvatarFallback className="text-3xl">{profileData.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{profileData.displayName}</h2>
                <p className="text-muted-foreground">{profileData.email}</p>

                 <div className="flex gap-4 mt-4 text-center">
                   <div>
                       <p className="font-bold text-lg">{profileData.following}</p>
                       <p className="text-sm text-muted-foreground">Following</p>
                   </div>
                   <div>
                       <p className="font-bold text-lg">{(profileData.followers / 1000).toFixed(1)}k</p>
                       <p className="text-sm text-muted-foreground">Followers</p>
                   </div>
                </div>

                 {!isOwnProfile && (
                     <div className="mt-4 grid grid-cols-2 gap-2 w-full max-w-sm">
                        <Button 
                            variant={isFollowing ? 'secondary' : 'default'}
                            onClick={() => setIsFollowing(!isFollowing)}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </Button>
                        <Button variant="outline" onClick={() => setIsChatOpen(true)}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Message
                        </Button>
                    </div>
                )}

                 <div className="mt-6 text-left w-full max-w-sm">
                     <h3 className="font-semibold">About</h3>
                     <p className="text-sm text-muted-foreground mt-1">{profileData.bio}</p>
                     <h3 className="font-semibold mt-4">Location</h3>
                     <p className="text-sm text-muted-foreground mt-1">{profileData.location}</p>
                 </div>
            </div>
        </main>
        
        {isChatOpen && !isOwnProfile && (
            <ChatPopup 
                user={{ displayName: profileData.displayName, photoURL: profileData.photoURL }}
                onClose={() => setIsChatOpen(false)} 
            />
        )}
        <Footer />
    </div>
  );
}
