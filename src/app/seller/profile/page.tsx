
"use client"

import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter } from 'next/navigation';
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


export default function SellerProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [profileData, setProfileData] = useState<UserData | null>(null);
  const [isProfileEditDialogOpen, setProfileEditDialogOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [key, setKey] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !loading && user) {
        const sellerDetailsRaw = localStorage.getItem('sellerDetails');
        if (sellerDetailsRaw) {
            const details = JSON.parse(sellerDetailsRaw);
            // Use a consistent UID for sellers based on their email
            const sellerUid = `seller_${details.email}`;
            
            const existingData = getUserData(sellerUid, {
                 displayName: details.name,
                 email: details.email,
                 photoURL: user?.photoURL || `https://placehold.co/128x128.png`,
                 role: 'seller'
            });
            
            const updatedData = {
                ...existingData,
                // Make sure all details from registration are present
                ...details, 
                uid: sellerUid,
                displayName: details.name,
                email: details.email,
                phone: details.phone || existingData.phone,
                bio: details.bio || existingData.bio,
                location: details.location || existingData.location,
                addresses: details.addresses || existingData.addresses,
            };

            setProfileData(updatedData);
            // Ensure the global user data store is up-to-date
            updateUserData(sellerUid, updatedData);
        } else if (!loading) {
             router.push('/seller/register');
        }
    }
  }, [user, loading, router, isMounted, key]);


  const handleProfileSave = (data: any) => {
      if(!profileData) return;

      const updatedDetails = {
          ...profileData,
          displayName: `${data.firstName} ${data.lastName}`,
          name: `${data.firstName} ${data.lastName}`,
          bio: data.bio,
          location: data.location,
          phone: `+91 ${data.phone}`,
          addresses: data.addresses,
      };

      updateUserData(profileData.uid, updatedDetails);
      localStorage.setItem('sellerDetails', JSON.stringify(updatedDetails));
      setProfileData(updatedDetails);
      setProfileEditDialogOpen(false);
  };
  
  const handleAddressesUpdate = (newAddresses: any) => {
    if(!profileData) return;
    const updatedDetails = { ...profileData, addresses: newAddresses };
    updateUserData(profileData.uid, updatedDetails);
    localStorage.setItem('sellerDetails', JSON.stringify(updatedDetails));
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

  if (!user) {
    return (
         <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
             <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
             <p className="text-muted-foreground mb-6">Please log in to view your profile.</p>
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
                         <DropdownMenuItem onSelect={() => setProfileEditDialogOpen(true)}>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Edit Profile</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </header>

            <main className="flex-grow">
                <ProfileCard
                    key={key} 
                    profileData={profileData} 
                    isOwnProfile={true}
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
