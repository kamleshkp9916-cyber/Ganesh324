
"use client";

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
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

const shows = [
    {
      title: 'Dead Ringers',
      season: 'Season 2',
      year: 2023,
      rating: 5.6,
      imageUrl: 'https://placehold.co/300x450/f44336/ffffff.png',
      hint: 'red dress',
    },
    {
      title: 'Lockwood & co',
      season: 'Season 2',
      year: 2023,
      rating: 7.4,
      imageUrl: 'https://placehold.co/300x450.png',
      hint: 'people standing night',
    },
    {
      title: 'Wilderness',
      season: 'Season 2',
      year: 2023,
      rating: 6.3,
      imageUrl: 'https://placehold.co/300x450.png',
      hint: 'couple sitting',
    },
    {
      title: 'Obsession',
      season: 'Season 1',
      year: 2023,
      rating: 5.1,
      imageUrl: 'https://placehold.co/300x450.png',
      hint: 'man woman intense',
    },
    {
      title: 'Who is erin carter?',
      season: 'Season 1',
      year: 2023,
      rating: 6.5,
      imageUrl: 'https://placehold.co/300x450.png',
      hint: 'woman gun',
    },
    {
      title: 'The lake',
      season: 'Season 2',
      year: 2023,
      rating: 7.4,
      imageUrl: 'https://placehold.co/300x450.png',
      hint: 'people beach summer',
    },
    {
      title: 'Outlander',
      season: 'Season 7',
      year: 2023,
      rating: 8.4,
      imageUrl: 'https://placehold.co/300x450.png',
      hint: 'couple historic clothing',
    },
    {
      title: 'Shining Vale',
      season: 'Season 2',
      year: 2023,
      rating: 7.2,
      imageUrl: 'https://placehold.co/300x450.png',
      hint: 'woman smiling',
    },
    {
        title: 'The Night Agent',
        season: 'Season 1',
        year: 2023,
        rating: 7.5,
        imageUrl: 'https://placehold.co/300x450.png',
        hint: 'man looking serious',
    },
    {
        title: 'The Ultimatum',
        season: 'Season 2',
        year: 2023,
        rating: 6.1,
        imageUrl: 'https://placehold.co/300x450.png',
        hint: 'woman green dress',
    },
    {
        title: 'Kaleidoscope',
        season: 'Season 1',
        year: 2023,
        rating: 7.0,
        imageUrl: 'https://placehold.co/300x450.png',
        hint: 'group colorful background',
    },
    {
        title: 'Fake Profile',
        season: 'Season 1',
        year: 2023,
        rating: 6.0,
        imageUrl: 'https://placehold.co/300x450.png',
        hint: 'couple in love',
    }
  ];

export default function LiveSellingPage() {
  const sidebarIcons = [
    { icon: Home, tooltip: 'Home', active: true },
    { icon: Clapperboard, tooltip: 'Movie' },
    { icon: Heart, tooltip: 'Favorite' },
    { icon: Star, tooltip: 'Rated' },
    { icon: Bookmark, tooltip: 'Library' },
  ];

  const filterButtons = ['TV Shows', 'Genre', 'Country', 'Year', 'Rating', 'Quality', 'Recently updated'];

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
            <div className="relative h-80 w-full">
                <Image src="https://placehold.co/1200x400.png" layout="fill" objectFit="cover" alt="Hero background" data-ai-hint="fantasy movie poster"/>
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <header className="absolute top-0 left-0 right-0 p-4 flex items-center justify-end">
                    <div className="flex items-center gap-4">
                        <div className="relative w-full max-w-[180px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                           <Input placeholder="Search" className="bg-background/50 pl-10 rounded-full" />
                       </div>
                        <Button variant="ghost" size="icon" className="text-white rounded-full bg-white/10 hover:bg-white/20">
                            <Plus />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-white rounded-full bg-white/10 hover:bg-white/20">
                            <Bell />
                        </Button>
                        <Avatar className="h-9 w-9">
                            <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="female person"/>
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                    </div>
                </header>
                <div className="absolute bottom-0 left-0 p-8 text-white">
                    <h1 className="text-5xl font-extrabold tracking-tight">TV Shows</h1>
                    <p className="mt-2 max-w-xl text-muted-foreground">Watch past seasons of exclusive shows, current-season episodes the day after they air, 40+ acclaimed series from FX, classic favorites, and tons more.</p>
                </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-wrap gap-2 mb-6">
                    {filterButtons.map((filter) => (
                    <Button key={filter} variant="outline" className="bg-card">
                        {filter}
                        <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                    ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {shows.map((show, index) => (
                        <div key={index} className="space-y-2">
                            <div className="aspect-[2/3] rounded-lg overflow-hidden">
                                 <Image src={show.imageUrl} alt={show.title} width={300} height={450} className="w-full h-full object-cover" data-ai-hint={show.hint}/>
                            </div>
                            <div>
                                <div className="flex justify-between items-center text-xs text-muted-foreground">
                                    <span>{show.year}</span>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                        <span>{show.rating}</span>
                                    </div>
                                </div>
                                <h3 className="font-semibold truncate">{show.title}</h3>
                                <p className="text-xs text-muted-foreground">{show.season}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
  );
}
