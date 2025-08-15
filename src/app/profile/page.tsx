
"use client";

import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit, Mail, Phone, User, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EditAddressForm } from '@/components/edit-address-form';

// Mock data generation
const firstNames = ["Samael", "John", "Jane", "Alex", "Emily", "Chris", "Michael"];
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
    phone: `+91 ${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    address: {
        name: currentUser.displayName || `${firstName} ${lastName}`,
        village: "123 Main St",
        district: "Koregaon",
        city: "Anytown",
        state: "Maharashtra",
        country: "India",
        pincode: "123456"
    }
  };
};


export default function ProfilePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [profileData, setProfileData] = useState<ReturnType<typeof generateRandomUser> | null>(null);
  const [isAddressDialogOpen, setIsAddressDialogOpen] = useState(false);
  
  useEffect(() => {
    if (user) {
      if (!profileData) {
        setProfileData(generateRandomUser(user));
      }
    }
  }, [user, profileData]);

  const handleAddressSave = (data: any) => {
    if(profileData){
        const newAddress = {
            name: data.name,
            village: data.village,
            district: data.district,
            city: data.city,
            state: data.state,
            country: data.country,
            pincode: data.pincode,
        }
        setProfileData({
            ...profileData,
            address: newAddress,
            phone: data.phone,
        });
    }
    setIsAddressDialogOpen(false);
  }

  if (loading) {
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
    <Dialog open={isAddressDialogOpen} onOpenChange={setIsAddressDialogOpen}>
        <div className="min-h-screen bg-background text-foreground">
            <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold">My Profile</h1>
                <Button variant="ghost" size="icon">
                    <Edit className="h-5 w-5" />
                </Button>
            </header>

            <main className="p-4 sm:p-6 md:p-8">
            {profileData ? (
                <div className="max-w-3xl mx-auto">
                    <Card className="overflow-hidden">
                        <div className="bg-primary/10 p-8 flex flex-col items-center gap-4">
                        <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                                <AvatarImage src={profileData.photoURL} alt={profileData.displayName} />
                                <AvatarFallback className="text-4xl">{profileData.displayName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="text-center">
                                <h2 className="text-3xl font-bold">{profileData.displayName}</h2>
                                <p className="text-muted-foreground">{profileData.email}</p>
                            </div>
                        </div>
                        <CardContent className="p-6 space-y-6">
                        <div>
                                <h3 className="text-lg font-semibold mb-2">About Me</h3>
                                <p className="text-muted-foreground italic">"{profileData.bio}"</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-muted-foreground" />
                                    <span>{profileData.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-muted-foreground" />
                                    <span>{profileData.phone}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-muted-foreground" />
                                    <span>{profileData.location}</span>
                                </div>
                            </div>

                             <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-lg font-semibold">Delivery Address</h3>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <Edit className="h-5 w-5" />
                                            <span className="sr-only">Edit Address</span>
                                        </Button>
                                    </DialogTrigger>
                                </div>
                                <div className="text-sm text-muted-foreground p-4 border rounded-lg bg-muted/50">
                                    <p className="font-semibold text-foreground">{profileData.address.name}</p>
                                    <p>{profileData.address.village}, {profileData.address.district}</p>
                                    <p>{profileData.address.city}, {profileData.address.state} - {profileData.address.pincode}</p>
                                    <p>{profileData.address.country}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <div className="flex items-center justify-center p-10">
                    <LoadingSpinner />
                </div>
            )}
            </main>
        </div>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
            <DialogHeader className="p-6 pb-4 border-b">
                <DialogTitle>Edit Delivery Address</DialogTitle>
            </DialogHeader>
            {profileData && (
                <EditAddressForm 
                    currentAddress={profileData.address}
                    currentPhone={profileData.phone}
                    onSave={handleAddressSave} 
                    onCancel={() => setIsAddressDialogOpen(false)}
                />
            )}
        </DialogContent>
    </Dialog>
  );
}
