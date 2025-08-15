
"use client";

import { useState, useRef, useEffect } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const liveSellers = [
    {
      id: 1,
      name: 'FashionFinds',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/400x600.png',
      category: 'Fashion',
      viewers: 1200,
      hint: 'woman posing stylish outfit',
    },
    {
      id: 2,
      name: 'GadgetGuru',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/400x600.png',
      category: 'Electronics',
      viewers: 2500,
      hint: 'unboxing new phone',
    },
    {
      id: 3,
      name: 'HomeHaven',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/400x600.png',
      category: 'Home Goods',
      viewers: 850,
      hint: 'modern living room decor',
    },
    {
      id: 4,
      name: 'BeautyBox',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/400x600.png',
      category: 'Beauty',
      viewers: 3100,
      hint: 'makeup tutorial',
    },
    {
      id: 5,
      name: 'KitchenWiz',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/400x600.png',
      category: 'Kitchenware',
      viewers: 975,
      hint: 'cooking demonstration',
    },
    {
      id: 6,
      name: 'FitFlow',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/400x600.png',
      category: 'Fitness',
      viewers: 1500,
      hint: 'yoga session',
    },
    {
      id: 7,
      name: 'ArtisanAlley',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/400x600.png',
      category: 'Handmade',
      viewers: 450,
      hint: 'pottery making',
    },
    {
      id: 8,
      name: 'PetPalace',
      avatarUrl: 'https://placehold.co/40x40.png',
      thumbnailUrl: 'https://placehold.co/400x600.png',
      category: 'Pet Supplies',
      viewers: 1800,
      hint: 'playing with puppy',
    },
]

export default function LiveSellingPage() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  const sidebarIcons = [
    { icon: Home, tooltip: 'Home', active: true },
    { icon: Clapperboard, tooltip: 'Movie' },
    { icon: Heart, tooltip: 'Favorite' },
    { icon: Star, tooltip: 'Rated' },
    { icon: Bookmark, tooltip: 'Library' },
  ];

  const filterButtons = ['All', 'Fashion', 'Electronics', 'Home Goods', 'Beauty', 'Popular'];

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
      <div className="flex min-h-screen bg-background text-foreground">
        <div className="sticky top-0 flex h-screen w-16 flex-col items-center border-r border-border bg-background py-4 gap-4">
             <Button variant="ghost" size="icon" className="text-muted-foreground mt-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="6" y2="6"/><line x1="3" x2="21" y1="12" y2="12"/><line x1="3" x2="21" y1="18" y2="18"/></svg>
            </Button>
            <div className="flex flex-col items-center gap-2 mt-4 flex-1">
              {sidebarIcons.map(({ icon: Icon, tooltip, active }) => (
                <Button
                  key={tooltip}
                  variant="ghost"
                  size="icon"
                  className={`rounded-lg ${
                    active
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground'
                  } hover:bg-primary/20 hover:text-primary`}
                >
                  <Icon className="h-6 w-6" />
                </Button>
              ))}
            </div>
            <div className="flex flex-col items-center gap-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <Zap className="h-6 w-6" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                <Settings className="h-6 w-6" />
              </Button>
            </div>
        </div>
        <div className="flex-1 flex flex-col">
           <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-10 border-b">
                <h1 className="text-2xl font-bold tracking-tight">Live Shopping</h1>
                <div className="flex items-center gap-2" ref={searchRef}>
                    <div className={cn(
                        "relative flex items-center transition-all duration-300 ease-in-out",
                        isSearchExpanded ? "w-48" : "w-10"
                    )}>
                        <Input 
                            placeholder="Search streams..." 
                            className={cn(
                                "bg-card pl-10 pr-4 rounded-full transition-all duration-300 ease-in-out",
                                isSearchExpanded ? "opacity-100 w-full" : "opacity-0 w-0"
                            )}
                            onFocus={() => setIsSearchExpanded(true)}
                        />
                         <Search className={cn("h-5 w-5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2", isSearchExpanded ? 'block' : 'hidden')} />
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
                    <Link href="/profile" passHref>
                        <Avatar className="h-9 w-9 cursor-pointer">
                            <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="female person"/>
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                    </Link>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                <div className="flex flex-wrap gap-2 mb-6">
                    {filterButtons.map((filter) => (
                    <Button key={filter} variant="outline" className="bg-card rounded-full">
                        {filter}
                    </Button>
                    ))}
                     <Button variant="ghost" className="bg-card rounded-full">
                        Filters
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                                width={400} 
                                height={600} 
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                data-ai-hint={seller.hint}
                            />
                             <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border-2 border-primary">
                                        <AvatarImage src={seller.avatarUrl} alt={seller.name} />
                                        <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="font-semibold text-primary-foreground truncate">{seller.name}</h3>
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

    