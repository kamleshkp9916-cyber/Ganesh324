
"use client";

import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreVertical, MessageSquare, Search, Flag, MessageCircle, HelpCircle, Share2, Star, ThumbsUp, ShoppingBag, Eye, Award, History, Edit } from 'lucide-react';
import React,
{ useEffect, useState, useRef, useMemo } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ChatPopup } from '@/components/chat-popup';
import { Footer } from '@/components/footer';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ProfileCard } from '@/components/profile-card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { EditProfileForm } from '@/components/edit-profile-form';


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
  const displayName = currentUser.displayName || `${firstName} ${lastName}`;
  return {
    displayName: displayName,
    email: currentUser.email || `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    photoURL: currentUser.photoURL || `https://placehold.co/128x128.png?text=${firstName.charAt(0)}${lastName.charAt(0)}`,
    bio: bios[Math.floor(Math.random() * bios.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    phone: `+91 ${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    following: Math.floor(Math.random() * 500),
    followers: Math.floor(Math.random() * 20000),
    likes: Math.floor(Math.random() * 100000),
    topAchievement: { name: 'Top Shopper', icon: <ShoppingBag className="w-4 h-4 mr-1.5" /> },
    addresses: [
      {
        id: 1,
        name: displayName,
        village: "Koregaon Park",
        district: "Pune",
        city: "Pune",
        state: "Maharashtra",
        country: "India",
        pincode: "411001",
        phone: `+91 ${Math.floor(1000000000 + Math.random() * 9000000000)}`
      },
       {
        id: 2,
        name: displayName,
        village: "Bandra West",
        district: "Mumbai",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        pincode: "400050",
        phone: `+91 ${Math.floor(1000000000 + Math.random() * 9000000000)}`
      }
    ]
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
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isProfileEditDialogOpen, setProfileEditDialogOpen] = useState(false);

  const isOwnProfile = !userId;

  useEffect(() => {
    // This logic now runs only on the client after the component mounts
    const activeUser = isOwnProfile ? user : { displayName: userId, email: `${userId}@example.com`, photoURL: '' };
    if (activeUser) {
        setProfileData(generateRandomUser(activeUser));
    }
  }, [user, userId, isOwnProfile]);


  const handleAuthAction = (action: () => void) => {
    if (!user) {
        setIsAuthDialogOpen(true);
    } else {
        action();
    }
  };
  
  const handleProfileSave = (data: any) => {
      if (profileData) {
          setProfileData({
              ...profileData,
              displayName: `${data.firstName} ${data.lastName}`,
              bio: data.bio,
              location: data.location,
              phone: `+91 ${data.phone}`,
              addresses: data.addresses || profileData.addresses,
          });
      }
      setProfileEditDialogOpen(false);
  };

  const handleAddressesUpdate = (newAddresses: any) => {
    if(profileData){
      setProfileData({
        ...profileData,
        addresses: newAddresses,
      })
    }
  }


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
    <Dialog open={isProfileEditDialogOpen} onOpenChange={setProfileEditDialogOpen}>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <AlertDialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Authentication Required</AlertDialogTitle>
                        <AlertDialogDescription>
                            You need to be logged in to perform this action. Please log in or create an account to continue.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => router.push('/signup')}>Create Account</AlertDialogAction>
                        <AlertDialogAction onClick={() => router.push('/')}>Login</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className={cn("text-xl font-bold")}>{profileData.displayName}</h1>
                
                {isOwnProfile ? (
                     <DialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Edit className="h-5 w-5" />
                        </Button>
                    </DialogTrigger>
                ): (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <MoreVertical className="h-6 w-6" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <Flag className="mr-2 h-4 w-4" />
                                <span>Report User</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </header>

            <main className="flex-grow">
                <ProfileCard 
                    onEdit={() => setProfileEditDialogOpen(true)} 
                    profileData={profileData} 
                    isOwnProfile={isOwnProfile}
                    onAddressesUpdate={handleAddressesUpdate}
                />
            </main>
            
            {isChatOpen && !isOwnProfile && (
                <ChatPopup 
                    user={{ displayName: profileData.displayName, photoURL: profileData.photoURL }}
                    onClose={() => setIsChatOpen(false)} 
                />
            )}
            <Footer />
        </div>

        <DialogContent className="max-w-lg h-auto max-h-[85vh] flex flex-col p-0">
            <DialogHeader className="p-6 pb-4">
                <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
             <EditProfileForm 
                currentUser={profileData}
                onSave={handleProfileSave}
                onCancel={() => setProfileEditDialogOpen(false)}
             />
        </DialogContent>
    </Dialog>
  );
}
