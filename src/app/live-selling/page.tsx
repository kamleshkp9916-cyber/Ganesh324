
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Clapperboard,
  Home,
  Bookmark,
  Heart,
  Star,
  Zap,
  ChevronDown,
  Search,
  Bell,
  Plus,
  Settings,
  Users,
  Menu,
  User,
  ShoppingBag,
  Award,
  MessageSquare,
  Shield,
  FileText,
  LifeBuoy,
  Wallet,
  List,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import { Skeleton } from '@/components/ui/skeleton';
import Autoplay from "embla-carousel-autoplay";
import { Logo } from '@/components/logo';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth.tsx';
import { useAuthActions } from '@/lib/auth';


const liveSellers = [
    {
      id: 1,
      name: 'FashionFinds',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Fashion',
      viewers: 1200,
      hint: 'woman posing stylish outfit',
    },
    {
      id: 2,
      name: 'GadgetGuru',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Electronics',
      viewers: 2500,
      hint: 'unboxing new phone',
    },
    {
      id: 3,
      name: 'HomeHaven',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Home Goods',
      viewers: 850,
      hint: 'modern living room decor',
    },
    {
      id: 4,
      name: 'BeautyBox',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Beauty',
      viewers: 3100,
      hint: 'makeup tutorial',
    },
    {
      id: 5,
      name: 'KitchenWiz',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Kitchenware',
      viewers: 975,
      hint: 'cooking demonstration',
    },
    {
      id: 6,
      name: 'FitFlow',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Fitness',
      viewers: 1500,
      hint: 'yoga session',
    },
    {
      id: 7,
      name: 'ArtisanAlley',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Handmade',
      viewers: 450,
      hint: 'pottery making',
    },
    {
      id: 8,
      name: 'PetPalace',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Pet Supplies',
      viewers: 1800,
      hint: 'playing with puppy',
    },
    {
      id: 9,
      name: 'BookNook',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Books',
      viewers: 620,
      hint: 'reading book cozy',
    },
    {
      id: 10,
      name: 'GamerGuild',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/300x450.png',
      category: 'Gaming',
      viewers: 4200,
      hint: 'esports competition',
    },
]

const offerSlides = [
  {
    id: 1,
    imageUrl: 'https://placehold.co/1200x400.png',
    title: 'Flash Sale!',
    description: 'Up to 50% off on electronics.',
    hint: 'electronics sale',
  },
  {
    id: 2,
    imageUrl: 'https://placehold.co/1200x400.png',
    title: 'New Arrivals',
    description: 'Check out the latest fashion trends.',
    hint: 'fashion clothing runway',
  },
  {
    id: 3,
    imageUrl: 'https://placehold.co/1200x400.png',
    title: 'Home Decor Deals',
    description: 'Beautify your space for less.',
    hint: 'modern living room',
  },
];


export default function LiveSellingPage() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);
  const [api, setApi] = useState<CarouselApi>()
  const [currentSlide, setCurrentSlide] = useState(0)
  const { user } = useAuth();
  const { signOut } = useAuthActions();

  const filterButtons = ['All', 'Fashion', 'Electronics', 'Home Goods', 'Beauty', 'Popular'];

  const onSelect = useCallback((api: CarouselApi) => {
    if (!api) return;
    setCurrentSlide(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!api) {
      return
    }
 
    onSelect(api);
    api.on('select', onSelect);
    api.on('reInit', onSelect)
  }, [api, onSelect])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingOffers(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

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


  return (
      <div className="flex min-h-screen bg-background text-foreground" style={{ background: 'radial-gradient(ellipse at top, hsl(var(--primary) / 0.15), hsl(var(--background)) 70%)' }}>
        <div className="flex-1 flex flex-col">
           <header className="p-4 flex items-center justify-between sticky top-0 bg-background/30 backdrop-blur-sm z-10 border-b border-border/50">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold tracking-tight text-primary">Live Shopping</h1>
                </div>
                <div className="flex items-center gap-2" ref={searchRef}>
                    <div className={cn(
                        "relative flex items-center transition-all duration-300 ease-in-out",
                        isSearchExpanded ? "w-48" : "w-10"
                    )}>
                        <Search className={cn("h-5 w-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2", isSearchExpanded ? 'block' : 'hidden')} />
                        <Input 
                            placeholder="Search streams..." 
                            className={cn(
                                "bg-card pl-10 pr-4 rounded-full transition-all duration-300 ease-in-out",
                                isSearchExpanded ? "opacity-100 w-full" : "opacity-0 w-0"
                            )}
                            onFocus={() => setIsSearchExpanded(true)}
                        />
                         
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-foreground rounded-full bg-card hover:bg-accent absolute right-0 top-1/2 -translate-y-1/2"
                            onClick={() => setIsSearchExpanded(p => !p)}
                        >
                            <Search className={cn("h-5 w-5", isSearchExpanded && "hidden")} />
                        </Button>
                   </div>
                    <Button variant="ghost" size="icon" className="text-foreground rounded-full bg-card hover:bg-accent">
                        <Plus />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-foreground rounded-full bg-card hover:bg-accent">
                        <Bell />
                    </Button>
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                             <Avatar className="h-9 w-9 cursor-pointer">
                                {user ? (
                                <>
                                    <AvatarImage src={user.photoURL || 'https://placehold.co/40x40.png'} alt={user.displayName || "User"} />
                                    <AvatarFallback>{user.displayName ? user.displayName.charAt(0) : 'U'}</AvatarFallback>
                                </>
                                ) : (
                                <AvatarFallback>
                                    <User className="h-5 w-5" />
                                </AvatarFallback>
                                )}
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56" align="end">
                             {user ? (
                                <>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.displayName}</p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                            {user.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild><Link href="/profile"><User className="mr-2" />Profile</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="/wallet"><Wallet className="mr-2" />Wallet</Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="/setting"><Settings className="mr-2" />Setting</Link></DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={signOut}><LogOut className="mr-2" />Log Out</DropdownMenuItem>
                                </>
                             ) : (
                                <>
                                    <DropdownMenuLabel>Welcome, Guest!</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild><Link href="/"><Button className="w-full justify-start" variant="ghost"><User className="mr-2" />Login</Button></Link></DropdownMenuItem>
                                    <DropdownMenuItem asChild><Link href="/signup"><Button className="w-full justify-start" variant="ghost"><Plus className="mr-2" />Create Account</Button></Link></DropdownMenuItem>
                                </>
                             )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
              <div className="mb-6">
                  {isLoadingOffers ? (
                    <Skeleton className="w-full aspect-[3/1] rounded-lg" />
                  ) : (
                    <div>
                        <Carousel
                            className="w-full"
                            plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]}
                            opts={{ loop: true }}
                            setApi={setApi}
                        >
                            <CarouselContent>
                                {offerSlides.map((slide) => (
                                <CarouselItem key={slide.id}>
                                    <Card className="overflow-hidden bg-card">
                                    <CardContent className="relative p-0 flex items-center justify-center aspect-[3/1]">
                                        <Image
                                        src={slide.imageUrl}
                                        alt={slide.title}
                                        layout="fill"
                                        objectFit="cover"
                                        className="brightness-75"
                                        data-ai-hint={slide.hint}
                                        />
                                        <div className="absolute text-center text-primary-foreground p-4">
                                        <h2 className="text-2xl md:text-4xl font-extrabold tracking-tighter">{slide.title}</h2>
                                        <p className="text-sm md:text-lg">{slide.description}</p>
                                        </div>
                                    </CardContent>
                                    </Card>
                                </CarouselItem>
                                ))}
                            </CarouselContent>
                        </Carousel>
                        <div className="flex justify-center gap-2 mt-4">
                            {offerSlides.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => api?.scrollTo(index)}
                                    className={cn(
                                        "h-2 w-2 rounded-full transition-colors",
                                        index === currentSlide ? 'bg-primary' : 'bg-muted'
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                    {filterButtons.map((filter) => (
                    <Button key={filter} variant="outline" className="bg-card/50 rounded-full">
                        {filter}
                    </Button>
                    ))}
                     <Button variant="ghost" className="bg-card/50 rounded-full">
                        Filters
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {liveSellers.map((seller) => (
                        <div key={seller.id} className="group relative cursor-pointer rounded-lg overflow-hidden shadow-lg hover:shadow-primary/50 transition-shadow duration-300">
                             <div className="absolute top-2 left-2 z-10">
                                <Badge className="bg-destructive text-destructive-foreground animate-pulse-red">
                                    LIVE
                                </Badge>
                             </div>
                             <div className="absolute top-2 right-2 z-10">
                                <Badge variant="secondary" className="bg-background/60 backdrop-blur-sm">
                                    <Users className="w-3 h-3 mr-1.5" />
                                    {seller.viewers}
                                </Badge>
                             </div>

                            <Image 
                                src={seller.thumbnailUrl} 
                                alt={`Live stream from ${seller.name}`} 
                                width={300} 
                                height={450} 
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                data-ai-hint={seller.hint}
                            />
                             <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8 border-2 border-primary">
                                        <AvatarImage src={seller.avatarUrl} alt={seller.name} />
                                        <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold text-sm text-primary-foreground truncate">{seller.name}</h3>
                                        <p className="text-xs text-muted-foreground">{seller.category}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
      </div>
  );
}
