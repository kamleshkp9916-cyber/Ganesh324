
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


export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const { user, loading } = useAuth();

  const [profileData, setProfileData] = useState<UserData | null>(null);
  const [isProfileEditDialogOpen, setProfileEditDialogOpen] = useState(false);
  const [key, setKey] = useState(0); // Add a key to force re-renders

  const isOwnProfile = !userId || (user && user.uid === userId);

  useEffect(() => {
    const activeUserId = isOwnProfile ? user?.uid : userId;
    
    if (activeUserId) {
        const activeUser = isOwnProfile ? user : null;
        const role = userId ? 'seller' : 'customer';

        setProfileData(getUserData(activeUserId, {
            displayName: activeUser?.displayName || userId || 'Unknown User',
            email: activeUser?.email || `${userId}@example.com`,
            photoURL: activeUser?.photoURL || '',
            role: role 
        }));
    }
  }, [user, userId, isOwnProfile, key]);


  const handleProfileSave = (data: any) => {
      if (profileData) {
          const updatedData = {
              ...profileData,
              displayName: `${data.firstName} ${data.lastName}`,
              bio: data.bio,
              location: data.location,
              phone: `+91 ${data.phone}`,
              addresses: data.addresses || profileData.addresses,
          };
          updateUserData(profileData.uid, updatedData);
          setProfileData(updatedData);
      }
      setProfileEditDialogOpen(false);
  };
  
  const handleAddressesUpdate = (newAddresses: any) => {
    if(profileData){
      const updatedData = { ...profileData, addresses: newAddresses };
      updateUserData(profileData.uid, updatedData);
      setProfileData(updatedData);
    }
  }
  
  const onFollowToggle = () => {
    // Force a re-render of the component to get fresh data
    setKey(prev => prev + 1);
  };


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

            <main className="flex-grow">
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
