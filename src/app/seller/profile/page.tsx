
"use client";

import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, buttonVariants } from '@/components/ui/button';
import { ArrowLeft, MoreHorizontal, Edit, Share2, Flag, MessageSquare, LifeBuoy, Shield } from 'lucide-react';
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { ProfileCard } from '@/components/profile-card';
import { getUserData, updateUserData, UserData } from '@/lib/follow-data';
import { useAuthActions } from '@/lib/auth';
import { FeedbackDialog } from '@/components/feedback-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';


export default function SellerProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userIdFromQuery = searchParams.get('userId');
  const { user, userData, loading } = useAuth();
  const { updateUserProfile } = useAuthActions();
  const { toast } = useToast();

  const [profileData, setProfileData] = useState<UserData | null>(null);
  const [isProfileEditDialogOpen, setIsProfileEditDialogOpen] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [key, setKey] = useState(0);

  const isOwnProfile = !userIdFromQuery || (user && user.uid === userIdFromQuery);
  const targetUserId = userIdFromQuery || user?.uid;

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!targetUserId) {
        if (!loading) router.push('/'); // Redirect if no user and no target
        return;
      };

      const data = isOwnProfile && userData ? userData : await getUserData(targetUserId);
      
      if (data) {
        setProfileData(data);
      } else if (!loading) {
        // If still no data after loading, maybe user doesn't exist
        toast({variant: 'destructive', title: 'User not found'});
        router.push('/live-selling');
      }
    };
    
    fetchProfileData();
  }, [user, userData, targetUserId, isOwnProfile, key, loading, router, toast]);


  const handleAuthAction = (callback: () => void) => {
    if (!user) {
        setIsAuthDialogOpen(true);
    } else {
        callback();
    }
  };

  const handleProfileSave = async (data: any) => {
      if (user) {
          const updatedData: Partial<UserData> = {
              displayName: `${data.firstName} ${data.lastName}`,
              bio: data.bio,
              location: data.location,
              phone: `+91 ${data.phone}`,
              photoURL: data.photoURL,
              instagram: data.instagram,
              twitter: data.twitter,
              youtube: data.youtube,
              facebook: data.facebook,
              twitch: data.twitch,
              color: data.color
          };
          
          await updateUserProfile(user, updatedData);
          setKey(prev => prev + 1); // Re-fetch data
      }
      setIsProfileEditDialogOpen(false);
  };
  
  const handleAddressesUpdate = (newAddresses: any) => {
    if(profileData && isOwnProfile){
      updateUserData(profileData.uid, { addresses: newAddresses });
      setKey(prev => prev + 1);
    }
  }
  
  const onFollowToggle = () => {
    setKey(prev => prev + 1);
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
        title: "Link Copied!",
        description: "Profile link copied to clipboard.",
    });
  };

  const handleReport = () => {
      handleAuthAction(() => setIsReportDialogOpen(true));
  };
  
  const confirmReport = () => {
    toast({
        title: "Profile Reported",
        description: "Thank you for your feedback. Our team will review this profile.",
    });
    setIsReportDialogOpen(false);
  };


  if (loading || !profileData) {
      return (
          <div className="flex items-center justify-center min-h-screen">
              <LoadingSpinner />
          </div>
      )
  }

  // This check is slightly redundant due to the useEffect logic, but it's a good safeguard.
  if (isOwnProfile && !user) {
    router.replace('/');
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
  }


  return (
    <>
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
                    <AlertDialogAction asChild><Link href="/signup">Create Account</Link></AlertDialogAction>
                    <AlertDialogAction asChild><Link href="/">Login</Link></AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        
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
                         <DropdownMenuItem onSelect={() => handleAuthAction(() => router.push('/help'))}>
                            <LifeBuoy className="mr-2 h-4 w-4" />
                            <span>Help & Support</span>
                        </DropdownMenuItem>
                         <DropdownMenuItem onSelect={() => handleAuthAction(() => router.push('/privacy-and-security'))}>
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Privacy & Security</span>
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
                    handleAuthAction={handleAuthAction}
                />
            </main>
            <div className="p-4 border-t sticky bottom-0 bg-background">
                 <Button asChild className="w-full">
                     <Link href="/tickets">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Help & Support
                    </Link>
                </Button>
            </div>
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
