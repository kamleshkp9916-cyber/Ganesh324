
"use client";

import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Edit, Mail, Phone, MapPin, Camera, Truck } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState, useRef } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { DialogHeader, DialogTitle } from './ui/dialog';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';

// Mock data generation for fields not in auth object
const bios = [
  "Live selling enthusiast. Love finding great deals!",
  "Collector of rare finds and vintage electronics.",
  "Fashionista and beauty guru. Join my stream for the latest trends.",
  "Home decor expert. Let's make your space beautiful.",
  "Tech reviewer and gadget lover. Unboxing the future."
];
const locations = ["New York, USA", "London, UK", "Tokyo, Japan", "Sydney, Australia", "Paris, France"];
const addresses = [
    "123 Main St, Anytown, USA 12345",
    "456 Oak Ave, Springfield, USA 67890",
    "789 Pine Ln, Metropolis, USA 11223",
]

const generatePlaceholderDetails = () => {
  return {
    bio: bios[Math.floor(Math.random() * bios.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    phone: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
    following: Math.floor(Math.random() * 500),
    followers: Math.floor(Math.random() * 10000),
    likes: Math.floor(Math.random() * 100000),
    deliveryAddress: addresses[Math.floor(Math.random() * addresses.length)],
  };
};

export function ProfileCard({ onEdit }: { onEdit?: () => void }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [placeholder, setPlaceholder] = useState<ReturnType<typeof generatePlaceholderDetails> | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [tempAddress, setTempAddress] = useState('');


  useEffect(() => {
    if (user) {
      const details = generatePlaceholderDetails();
      setPlaceholder(details);
      setDeliveryAddress(details.deliveryAddress);
    }
  }, [user]);

  const handleProfileImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditAddress = () => {
    setTempAddress(deliveryAddress);
    setIsEditingAddress(true);
  };

  const handleSaveAddress = () => {
    setDeliveryAddress(tempAddress);
    setIsEditingAddress(false);
  };

  const handleCancelEdit = () => {
    setIsEditingAddress(false);
  };

  if (loading) {
      return (
          <div className="flex items-center justify-center min-h-[400px]">
              <LoadingSpinner />
          </div>
      )
  }

  if (!user) {
    return (
         <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-4">
             <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
             <p className="text-muted-foreground mb-6">Please log in to view your profile.</p>
             <Button onClick={() => router.push('/')}>Go to Login</Button>
        </div>
    );
  }

  return (
    <div className="relative">
        <DialogHeader>
          <DialogTitle className="sr-only">User Profile</DialogTitle>
        </DialogHeader>

        {placeholder ? (
            <Card className="overflow-hidden border-0 shadow-none rounded-lg">
                <div 
                  className="p-8 flex flex-col items-center gap-4 relative bg-cover bg-center bg-primary/10"
                >
                   <div className={cn(
                       "absolute inset-0 bg-primary/10"
                   )} />
                    
                    <div className="relative z-10">
                        <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                            <AvatarImage src={profileImage || user.photoURL || `https://placehold.co/128x128.png?text=${user.displayName?.charAt(0)}`} alt={user.displayName || ""} />
                            <AvatarFallback className="text-4xl">{user.displayName?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <Button
                            size="icon"
                            variant="outline"
                            className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-background/70 hover:bg-background"
                            onClick={() => profileFileInputRef.current?.click()}
                        >
                            <Camera className="h-4 w-4" />
                            <span className="sr-only">Change profile image</span>
                        </Button>
                        <input
                            type="file"
                            ref={profileFileInputRef}
                            onChange={handleProfileImageUpload}
                            className="hidden"
                            accept="image/*"
                        />
                    </div>
                    
                    <div className="text-center relative z-10 text-foreground">
                        <h2 className="text-3xl font-bold">{user.displayName}</h2>
                        <p className="text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex gap-8 pt-4 relative z-10 text-foreground">
                        <div className="text-center">
                            <p className="text-2xl font-bold">{placeholder.following}</p>
                            <p className="text-sm text-muted-foreground">Following</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{(placeholder.followers / 1000).toFixed(1)}k</p>
                            <p className="text-sm text-muted-foreground">Followers</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{(placeholder.likes / 1000).toFixed(1)}k</p>
                            <p className="text-sm text-muted-foreground">Likes</p>
                        </div>
                    </div>
                </div>
                <ScrollArea className="h-[40vh]">
                    <CardContent className="p-6 space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold">About Me</h3>
                                <Button variant="ghost" size="icon" onClick={onEdit}>
                                    <Edit className="h-5 w-5" />
                                    <span className="sr-only">Edit Profile</span>
                                </Button>
                            </div>
                            <p className="text-muted-foreground italic">"{placeholder.bio}"</p>
                        </div>

                        <Separator />
                        
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-muted-foreground" />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-muted-foreground" />
                                    <span>{placeholder.phone}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MapPin className="w-5 h-5 text-muted-foreground" />
                                    <span>{placeholder.location}</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold">Delivery Address</h3>
                                {!isEditingAddress && (
                                    <Button variant="ghost" size="icon" onClick={handleEditAddress}>
                                        <Edit className="h-5 w-5" />
                                        <span className="sr-only">Edit Address</span>
                                    </Button>
                                )}
                            </div>
                            {isEditingAddress ? (
                                <div className="space-y-2">
                                    <Textarea 
                                        value={tempAddress}
                                        onChange={(e) => setTempAddress(e.target.value)}
                                        className="min-h-[80px]"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="sm" onClick={handleCancelEdit}>Cancel</Button>
                                        <Button size="sm" onClick={handleSaveAddress}>Save</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-3">
                                    <Truck className="w-5 h-5 text-muted-foreground mt-1 flex-shrink-0" />
                                    <span className="text-muted-foreground">{deliveryAddress}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </ScrollArea>
            </Card>
        ) : (
            <div className="flex items-center justify-center p-10 min-h-[400px]">
                <LoadingSpinner />
            </div>
        )}
    </div>
  );
}
