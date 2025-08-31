
"use client"

import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreHorizontal, Edit } from 'lucide-react';
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


export default function SellerProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userIdFromQuery = searchParams.get('userId');
  const { user, userData, loading } = useAuth();
  const { updateUserProfile } = useAuthActions();

  const [profileData, setProfileData] = useState<UserData | null>(null);
  const [isProfileEditDialogOpen, setProfileEditDialogOpen] = useState(false);
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
            // If no user in query, it's the logged-in seller viewing their own profile
            if (user && userData?.role === 'seller') {
                targetId = user.uid;
            } else {
                router.push('/seller/login');
                return;
            }
        }
        
        // The userIdFromQuery might not be a UID, it could be a display name from mock data
        const data = await getUserData(targetId);
        
        if (data) {
            setProfileData(data);
        } else {
            console.error("Seller not found:", targetId);
             // Optionally, redirect or show a "not found" page
            // For now, we'll just log the error and the page will show a spinner
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
      setProfileData(newProfileData);
      setProfileEditDialogOpen(false);
  };
  
  const handleAddressesUpdate = (newAddresses: any) => {
    if(!profileData) return;
    const updatedDetails = { ...profileData, addresses: newAddresses };
    updateUserData(profileData.uid, updatedDetails);
    setProfileData(updatedDetails);
  }
  
  const onFollowToggle = () => {
    setKey(prev => prev + 1); // Force re-render to get fresh follow data
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
