
"use client";

import { useAuth } from '@/hooks/use-auth.tsx';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreVertical, MessageSquare, Search, Flag, MessageCircle, HelpCircle, Share2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect, useState, useRef, useMemo } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ChatPopup } from '@/components/chat-popup';
import { Footer } from '@/components/footer';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


// Mock data generation
const firstNames = ["Ganesh", "John", "Jane", "Alex", "Emily", "Chris", "Michael"];
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
    following: Math.floor(Math.random() * 500),
    followers: Math.floor(Math.random() * 20000),
  };
};

const mockProducts = [
    { id: 1, name: 'Vintage Camera', price: '₹12,500', imageUrl: 'https://placehold.co/300x300.png', hint: 'vintage film camera' },
    { id: 2, name: 'Wireless Headphones', price: '₹4,999', imageUrl: 'https://placehold.co/300x300.png', hint: 'modern headphones' },
    { id: 3, name: 'Handcrafted Vase', price: '₹2,100', imageUrl: 'https://placehold.co/300x300.png', hint: 'ceramic vase' },
    { id: 4, name: 'Smart Watch', price: '₹8,750', imageUrl: 'https://placehold.co/300x300.png', hint: 'smartwatch face' },
    { id: 5, name: 'Leather Backpack', price: '₹6,200', imageUrl: 'https://placehold.co/300x300.png', hint: 'brown leather backpack' },
];

const mockLikes = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    imageUrl: `https://placehold.co/400x400.png`,
    hint: `abstract pattern ${i+1}`
}));


export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const { user, loading } = useAuth();

  const [profileData, setProfileData] = useState<ReturnType<typeof generateRandomUser> | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isOwnProfile = !userId;

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return mockProducts;
    return mockProducts.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const filteredLikes = useMemo(() => {
    if (!searchTerm) return mockLikes;
    return mockLikes.filter(like =>
      like.hint.toLowerCase().includes(searchTerm.toLowerCase()) || like.id.toString().includes(searchTerm)
    );
  }, [searchTerm]);

  useEffect(() => {
    const activeUser = isOwnProfile ? user : { displayName: userId, email: `${userId}@example.com`, photoURL: '' };
    if (activeUser) {
        if (!profileData || (userId && profileData.displayName !== userId)) {
            setProfileData(generateRandomUser(activeUser));
        } else if (isOwnProfile && user && (!profileData || profileData.email !== user.email)) {
            setProfileData(generateRandomUser(user));
        }
    }
  }, [user, userId, isOwnProfile, profileData]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchRef]);


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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold">{profileData.displayName}</h1>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="h-6 w-6" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                        <Flag className="mr-2 h-4 w-4" />
                        <span>Report</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                         <MessageCircle className="mr-2 h-4 w-4" />
                        <span>Feedback</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                         <HelpCircle className="mr-2 h-4 w-4" />
                        <span>Help</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Share2 className="mr-2 h-4 w-4" />
                        <span>Share</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>

        <main className="flex-grow p-4">
            <div className="flex flex-col items-center">
                <Avatar className="h-24 w-24 border-2 mb-4">
                    <AvatarImage src={profileData.photoURL} alt={profileData.displayName} />
                    <AvatarFallback className="text-3xl">{profileData.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold">{profileData.displayName}</h2>
                <p className="text-muted-foreground">{profileData.email}</p>

                 <div className="flex gap-4 mt-4 text-center">
                   <div>
                       <p className="font-bold text-lg">{profileData.following}</p>
                       <p className="text-sm text-muted-foreground">Following</p>
                   </div>
                   <div>
                       <p className="font-bold text-lg">{(profileData.followers / 1000).toFixed(1)}k</p>
                       <p className="text-sm text-muted-foreground">Followers</p>
                   </div>
                </div>

                 {!isOwnProfile && (
                     <div className="mt-4 grid grid-cols-2 gap-2 w-full max-w-sm">
                        <Button 
                            variant={isFollowing ? 'secondary' : 'default'}
                            onClick={() => setIsFollowing(!isFollowing)}
                        >
                            {isFollowing ? 'Following' : 'Follow'}
                        </Button>
                        <Button variant="outline" onClick={() => setIsChatOpen(true)}>
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Message
                        </Button>
                    </div>
                )}

                <div className="mt-6 text-left w-full max-w-4xl mx-auto">
                    <div className="bg-card p-4 rounded-lg shadow-sm">
                        <h3 className="font-semibold">About</h3>
                        <p className="text-sm text-muted-foreground mt-1">{profileData.bio}</p>
                        <h3 className="font-semibold mt-4">Location</h3>
                        <p className="text-sm text-muted-foreground mt-1">{profileData.location}</p>
                    </div>
                 </div>
                 
                 <div className="mt-4 flex justify-end items-center gap-2 w-full max-w-4xl" ref={searchRef}>
                    <div className={cn(
                        "relative flex items-center transition-all duration-300 ease-in-out",
                        isSearchExpanded ? "w-48" : "w-10"
                    )}>
                        <Search className={cn("h-5 w-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2", isSearchExpanded ? 'block' : 'hidden')} />
                        <Input 
                            placeholder="Search..." 
                            className={cn(
                                "bg-muted pl-10 pr-4 rounded-full transition-all duration-300 ease-in-out",
                                isSearchExpanded ? "opacity-100 w-full" : "opacity-0 w-0"
                            )}
                            onFocus={() => setIsSearchExpanded(true)}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-foreground rounded-full hover:bg-accent absolute right-0 top-1/2 -translate-y-1/2"
                            onClick={() => setIsSearchExpanded(p => !p)}
                        >
                            <Search className={cn("h-5 w-5", isSearchExpanded && "hidden")} />
                        </Button>
                    </div>
                </div>
            </div>

            <Separator className="my-6" />

            <div className="w-full max-w-4xl mx-auto">
                {!isOwnProfile && (
                    <>
                        <section>
                            <h3 className="text-xl font-bold mb-4">Listed Products</h3>
                            {filteredProducts.length > 0 ? (
                                <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                    {filteredProducts.map((product) => (
                                        <Card key={product.id} className="min-w-[180px] shrink-0">
                                            <div className="aspect-square bg-muted rounded-t-lg overflow-hidden">
                                                <Image 
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    width={180}
                                                    height={180}
                                                    className="object-cover w-full h-full"
                                                    data-ai-hint={product.hint}
                                                />
                                            </div>
                                            <div className="p-3">
                                                <h4 className="font-semibold truncate">{product.name}</h4>
                                                <p className="text-primary font-bold">{product.price}</p>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-4">No products found.</p>
                            )}
                        </section>
                        <Separator className="my-6" />
                    </>
                )}

                <section>
                    <h3 className="text-xl font-bold mb-4">Likes</h3>
                     {filteredLikes.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredLikes.map((like) => (
                                <div key={like.id} className="aspect-square bg-muted rounded-lg overflow-hidden">
                                    <Image 
                                        src={like.imageUrl}
                                        alt={`Liked item ${like.id}`}
                                        width={400}
                                        height={400}
                                        className="object-cover w-full h-full"
                                        data-ai-hint={like.hint}
                                    />
                                </div>
                            ))}
                        </div>
                     ) : (
                        <p className="text-muted-foreground text-center py-4">No likes found.</p>
                     )}
                </section>
            </div>
        </main>
        
        {isChatOpen && !isOwnProfile && (
            <ChatPopup 
                user={{ displayName: profileData.displayName, photoURL: profileData.photoURL }}
                onClose={() => setIsChatOpen(false)} 
            />
        )}
        <Footer />
    </div>
  );
}
