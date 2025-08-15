
"use client";

import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Edit, Mail, Phone, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { DialogHeader, DialogTitle, DialogClose } from './ui/dialog';

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

const generateRandomUser = () => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return {
    displayName: `${firstName} ${lastName}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    photoURL: `https://placehold.co/128x128.png?text=${firstName.charAt(0)}${lastName.charAt(0)}`,
    bio: bios[Math.floor(Math.random() * bios.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    phone: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`
  };
};

export function ProfileCard({ onEdit }: { onEdit?: () => void }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [randomUser, setRandomUser] = useState<ReturnType<typeof generateRandomUser> | null>(null);
  
  useEffect(() => {
    if (user) {
      setRandomUser(generateRandomUser());
    }
  }, [user]);

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
        <DialogHeader className="absolute top-4 right-4 z-10">
            <DialogClose asChild>
                <Button variant="ghost" size="icon" onClick={onEdit}>
                    <Edit className="h-5 w-5" />
                    <span className="sr-only">Edit Profile</span>
                </Button>
            </DialogClose>
        </DialogHeader>

        {randomUser ? (
            <Card className="overflow-hidden border-0 shadow-none rounded-lg">
                <div className="bg-primary/10 p-8 flex flex-col items-center gap-4">
                    <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                        <AvatarImage src={randomUser.photoURL} alt={randomUser.displayName} />
                        <AvatarFallback className="text-4xl">{randomUser.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="text-center">
                        <h2 className="text-3xl font-bold">{randomUser.displayName}</h2>
                        <p className="text-muted-foreground">{user.email}</p>
                    </div>
                </div>
                <CardContent className="p-6 space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">About Me</h3>
                        <p className="text-muted-foreground italic">"{randomUser.bio}"</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-muted-foreground" />
                            <span>{randomUser.email}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-muted-foreground" />
                            <span>{randomUser.phone}</span>
                        </div>
                            <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-muted-foreground" />
                            <span>{randomUser.location}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        ) : (
            <div className="flex items-center justify-center p-10 min-h-[400px]">
                <LoadingSpinner />
            </div>
        )}
    </div>
  );
}
