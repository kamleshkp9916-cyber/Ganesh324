
"use client";

import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreHorizontal, Edit, Share2, Flag } from 'lucide-react';
import React, { useEffect, useState } from 'react';
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
import { ProfileCard } from '@/components/profile-card';
import { getUserData, updateUserData, UserData } from '@/lib/follow-data';
import { useAuthActions } from '@/lib/auth';


export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const { user, userData, loading } = useAuth();
  const { updateUserProfile } = useAuthActions();

  // The profileData state will now hold data for OTHER users being viewed
  const [profileData, setProfileData] = useState<UserData | null>(null);
  const [isProfileEditDialogOpen, setProfileEditDialogOpen] = useState(false);
  const [key, setKey] = useState(0);

  const isOwnProfile = !userId || (user && user.uid === userId);

  useEffect(() => {
    // If we're viewing someone else's profile, fetch their data
    if (!isOwnProfile && userId) {
      getUserData(userId).then(fetchedData => {
          if (fetchedData) {
              setProfileData(fetchedData);
          }
      });
    } else {
      // If it's our own profile, use the data from the auth context
      setProfileData(userData);
    }
  }, [user, userData, userId, isOwnProfile, key]);


  const handleProfileSave = async (data: any) => {
      // We only save if it's the currently logged-in user
      if (user) {
          const updatedData: Partial<UserData> = {
              displayName: `${data.firstName} ${data.lastName}`,
              bio: data.bio,
              location: data.location,
              phone: `+91 ${data.phone}`,
              photoURL: data.photoURL,
          };
          
          await updateUserProfile(user, updatedData);
          // The useAuth hook will automatically update with fresh data
      }
      setProfileEditDialogOpen(false);
  };
  
  const handleAddressesUpdate = (newAddresses: any) => {
    if(profileData && isOwnProfile){
      updateUserData(profileData.uid, { addresses: newAddresses });
      // Re-trigger useEffect to get fresh data
      setKey(prev => prev + 1);
    }
  }
  
  const onFollowToggle = () => {
    setKey(prev => prev + 1);
  };


  if (loading || !profileData) {
      return (
          <div className="flex items-center justify-center min-h-screen">
              <LoadingSpinner />
          </div>
      )
  }

  // Final check to ensure we don't render a page for a logged-out user on their own profile
  if (isOwnProfile && !user) {
    router.replace('/');
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  }


  return (
    <Dialog open={isProfileEditDialogOpen} onOpenChange={setProfileEditDialogOpen}>
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
                             <DropdownMenuItem onSelect={() => setProfileEditDialogOpen(true)}>
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Edit Profile</span>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                            <Share2 className="mr-2 h-4 w-4" />
                            <span>Share Profile</span>
                        </DropdownMenuItem>
                        {!isOwnProfile && (
                            <DropdownMenuItem>
                                <Flag className="mr-2 h-4 w-4" />
                                <span>Report User</span>
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

        <DialogContent className="max-w-lg w-[95vw] h-auto max-h-[85vh] flex flex-col p-0 rounded-lg">
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
