
"use client"

import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreHorizontal, Edit, UserPlus, MessageSquare, Star, Users, Video, Search, ShoppingBag } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
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
} from "@/components/ui/dropdown-menu"
import { getUserData, updateUserData, UserData, toggleFollow, isFollowing, getUserByDisplayName } from '@/lib/follow-data';
import { useAuthActions } from '@/lib/auth';
import { ProfileCard } from '@/components/profile-card';


const mockSellerProfiles: { [key: string]: UserData } = {
    'BeautyBox': {
        uid: 'mock_beautybox_uid',
        displayName: 'BeautyBox',
        email: 'beautybox@example.com',
        photoURL: 'https://placehold.co/128x128.png?text=B',
        role: 'seller',
        followers: 31100,
        following: 50,
        bio: 'All things makeup, skincare, and beauty tutorials.',
        location: 'Los Angeles, USA',
        phone: '+1 123 456 7890',
        addresses: [],
        verificationStatus: 'verified',
    }
};


export default function SellerProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userIdFromQuery = searchParams.get('userId');
  const { user, userData, loading } = useAuth();
  const { updateUserProfile } = useAuthActions();

  const [profileData, setProfileData] = useState<UserData | null>(null);
  const [isProfileEditDialogOpen, setIsProfileEditDialogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchProfileData = async () => {
        if (loading || !isMounted) return;

        let targetId: string | null | undefined = userIdFromQuery;
        
        if (!targetId) {
            if (user && userData?.role === 'seller') {
                targetId = user.uid;
            } else {
                return;
            }
        }
        
        let data: UserData | null = null;
        
        if (targetId) {
             // First, try to get by UID, which is the most reliable
            data = await getUserData(targetId);

            // If not found by UID, try by display name
            if (!data) {
                // The URL might contain a display name instead of a UID
                const targetName = decodeURIComponent(targetId);
                data = await getUserByDisplayName(targetName);
            }

            // If STILL not found (i.e., not a real user in DB), check our mock data
            if (!data && mockSellerProfiles[targetId]) {
                data = mockSellerProfiles[targetId];
            }
        }
        
        if (data) {
            setProfileData(data);
        } else {
            console.error("Seller not found:", targetId);
        }
    };
    
    fetchProfileData();

  }, [user, userData, loading, router, isMounted, key, userIdFromQuery]);


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

  if (!isMounted || loading || !profileData) {
      return (
          <div className="flex items-center justify-center min-h-screen">
              <LoadingSpinner />
          </div>
      )
  }
  
  const isOwnProfile = user?.uid === profileData.uid;

  return (
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
                         {isOwnProfile && (
                            <DropdownMenuItem onSelect={() => setIsProfileEditDialogOpen(true)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit Profile</span>
                            </DropdownMenuItem>
                         )}
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
  );
}
