
"use client"

import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { ArrowLeft, MoreHorizontal, Edit, UserPlus, MessageSquare, Star, Users, Video, Search, ShoppingBag, Flag, Share2, MessageCircle, LifeBuoy } from 'lucide-react';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EditProfileForm } from '@/components/edit-profile-form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { getUserData, updateUserData, UserData } from '@/lib/follow-data';
import { useAuthActions } from '@/lib/auth';
import { ProfileCard } from '@/components/profile-card';
import { FeedbackDialog } from '@/components/feedback-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';


const mockSellers: Record<string, UserData> = {
    'fashionfinds-uid': { uid: 'fashionfinds-uid', displayName: 'FashionFinds', email: 'fashion@finds.com', photoURL: 'https://placehold.co/128x128.png?text=F', role: 'seller', followers: 1200, following: 150, bio: 'Curator of vintage and modern fashion.', location: 'Paris, France', phone: '', addresses: [], color: '#ffffff' },
    'gadgetguru-uid': { uid: 'gadgetguru-uid', displayName: 'GadgetGuru', email: 'guru@gadgets.com', photoURL: 'https://placehold.co/128x128.png?text=G', role: 'seller', followers: 2500, following: 50, bio: 'Latest and greatest in tech reviewed.', location: 'San Francisco, USA', phone: '', addresses: [], color: '#ffffff' },
    'homehaven-uid': { uid: 'homehaven-uid', displayName: 'HomeHaven', email: 'contact@homehaven.com', photoURL: 'https://placehold.co/128x128.png?text=H', role: 'seller', followers: 850, following: 200, bio: 'Making your house a home, one decor piece at a time.', location: 'Stockholm, Sweden', phone: '', addresses: [], color: '#ffffff' },
    'beautybox-uid': { uid: 'beautybox-uid', displayName: 'BeautyBox', email: 'info@beautybox.com', photoURL: 'https://placehold.co/128x128.png?text=B', role: 'seller', followers: 3100, following: 80, bio: 'Your one-stop shop for cosmetics and skincare.', location: 'Seoul, South Korea', phone: '', addresses: [], color: '#ffffff' },
    'kitchenwiz-uid': { uid: 'kitchenwiz-uid', displayName: 'KitchenWiz', email: 'support@kitchenwiz.com', photoURL: 'https://placehold.co/128x128.png?text=K', role: 'seller', followers: 975, following: 120, bio: 'Innovative tools for the modern chef.', location: 'Milan, Italy', phone: '', addresses: [], color: '#ffffff' },
    'fitflow-uid': { uid: 'fitflow-uid', displayName: 'FitFlow', email: 'getfit@fitflow.com', photoURL: 'https://placehold.co/128x128.png?text=F', role: 'seller', followers: 1500, following: 300, bio: 'Activewear and equipment for your fitness journey.', location: 'Los Angeles, USA', phone: '', addresses: [], color: '#ffffff' },
    'artisanalley-uid': { uid: 'artisanalley-uid', displayName: 'ArtisanAlley', email: 'hello@artisanalley.com', photoURL: 'https://placehold.co/128x128.png?text=A', role: 'seller', followers: 450, following: 450, bio: 'Handcrafted goods with a story.', location: 'Kyoto, Japan', phone: '', addresses: [], color: '#ffffff' },
    'petpalace-uid': { uid: 'petpalace-uid', displayName: 'PetPalace', email: 'woof@petpalace.com', photoURL: 'https://placehold.co/128x128.png?text=P', role: 'seller', followers: 1800, following: 220, bio: 'Everything your furry friends could ever want.', location: 'London, UK', phone: '', addresses: [], color: '#ffffff' },
    'booknook-uid': { uid: 'booknook-uid', displayName: 'BookNook', email: 'read@booknook.com', photoURL: 'https://placehold.co/128x128.png?text=B', role: 'seller', followers: 620, following: 500, bio: 'A cozy corner for book lovers.', location: 'Edinburgh, Scotland', phone: '', addresses: [], color: '#ffffff' },
    'gamerguild-uid': { uid: 'gamerguild-uid', displayName: 'GamerGuild', email: 'gg@gamerguild.com', photoURL: 'https://placehold.co/128x128.png?text=G', role: 'seller', followers: 4200, following: 10, bio: 'Top-tier gaming gear and accessories.', location: 'Taipei, Taiwan', phone: '', addresses: [], color: '#ffffff' },
};


export default function SellerProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userIdFromQuery = searchParams.get('userId');
  const { user, userData, loading } = useAuth();
  const { updateUserProfile } = useAuthActions();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState<UserData | null>(null);
  const [isProfileEditDialogOpen, setIsProfileEditDialogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [key, setKey] = useState(0);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchProfileData = async () => {
        if (!isMounted || !userIdFromQuery) {
            setProfileData(null);
            return;
        }
        
        // Use mock data as the primary source
        const mockData = mockSellers[userIdFromQuery];

        if (mockData) {
            setProfileData(mockData);
        } else {
            // Fallback to Firestore only if not in mock data
            const data = await getUserData(userIdFromQuery);
            if (data) {
                setProfileData(data);
            } else {
                console.error("Seller not found with UID:", userIdFromQuery);
                setProfileData(null);
            }
        }
    };
    
    fetchProfileData();

  }, [isMounted, key, userIdFromQuery]);


  const handleProfileSave = async (data: any) => {
      if(!profileData || !user) return;

      const updatedDetails: Partial<UserData> = {
          displayName: `${data.firstName} ${data.lastName}`,
          bio: data.bio,
          location: data.location,
          phone: `+91 ${data.phone}`,
          photoURL: data.photoURL
      };

      await updateUserProfile(user, updatedDetails);
      const newProfileData = await getUserData(profileData.uid);
      if (newProfileData) {
        setProfileData(newProfileData);
      }
      setIsProfileEditDialogOpen(false);
  };
  
   const onFollowToggle = () => {
    setKey(prev => prev + 1);
  };
  
  const handleAddressesUpdate = async (newAddresses: any[]) => {
      if(profileData && user && profileData.uid === user.uid) {
          await updateUserData(user.uid, { addresses: newAddresses });
          setKey(prev => prev + 1);
      }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
        title: "Link Copied!",
        description: "Profile link copied to clipboard.",
    });
  };

  const handleReport = () => {
      setIsReportDialogOpen(true);
  };
  
  const confirmReport = () => {
    toast({
        title: "Profile Reported",
        description: "Thank you for your feedback. Our team will review this profile.",
    });
    setIsReportDialogOpen(false);
  };

  if (!isMounted || loading || !profileData) {
      return (
          <div className="flex items-center justify-center min-h-screen">
              <LoadingSpinner />
          </div>
      )
  }
  
  const isOwnProfile = user?.uid === profileData.uid;

  return (
    <>
     <AlertDialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Report this profile?</AlertDialogTitle>
                    <AlertDialogDescription>
                        If this user is violating community guidelines, please report them.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmReport}>Report</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    <Dialog open={isProfileEditDialogOpen} onOpenChange={setIsProfileEditDialogOpen}>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold truncate">{profileData.displayName}</h1>
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-6 w-6" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                         {isOwnProfile ? (
                             <DropdownMenuItem onSelect={() => setIsProfileEditDialogOpen(true)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit Profile</span>
                            </DropdownMenuItem>
                         ) : (
                             <DropdownMenuItem onSelect={handleReport}>
                                <Flag className="mr-2 h-4 w-4" />
                                <span>Report User</span>
                            </DropdownMenuItem>
                         )}
                        <DropdownMenuItem onSelect={handleShare}>
                            <Share2 className="mr-2 h-4 w-4" />
                            <span>Share Profile</span>
                        </DropdownMenuItem>
                         <DropdownMenuSeparator />
                        <FeedbackDialog>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <MessageCircle className="mr-2 h-4 w-4" />
                                <span>Feedback</span>
                            </DropdownMenuItem>
                        </FeedbackDialog>
                         <DropdownMenuItem onSelect={() => router.push('/help')}>
                            <LifeBuoy className="mr-2 h-4 w-4" />
                            <span>Help & Support</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            <main className="flex-grow pb-20">
                <ProfileCard 
                    key={key}
                    profileData={profileData} 
                    isOwnProfile={isOwnProfile}
                    onAddressesUpdate={handleAddressesUpdate}
                    onFollowToggle={onFollowToggle}
                />
            </main>
        </div>
        {isOwnProfile && (
            <DialogContent className="max-w-lg w-[95vw] h-auto max-h-[85vh] flex flex-col p-0 rounded-lg">
                <DialogHeader className="p-6 pb-4">
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <EditProfileForm 
                    currentUser={profileData}
                    onSave={handleProfileSave}
                    onCancel={() => setIsProfileEditDialogOpen(false)}
                />
            </DialogContent>
        )}
    </Dialog>
    </>
  );
}
