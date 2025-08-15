
"use client";

import { useState } from 'react';
import Image from 'next/image';
import {
  Bell,
  Bookmark,
  ChevronDown,
  Clapperboard,
  Home,
  Menu,
  MessageCircle,
  Music,
  Plus,
  Search,
  Star,
  Tv,
  Heart,
  Zap,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Logo } from '@/components/logo';

const shows = [
  {
    title: 'Dead Ringers',
    year: '2023',
    season: 'Season 2',
    rating: '5.6',
    image: 'https://placehold.co/300x450/d32f2f/ffffff?text=Dead+Ringers',
    hint: 'red dress',
  },
  {
    title: 'Lockwood & co',
    year: '2023',
    season: 'Season 2',
    rating: '7.4',
    image: 'https://placehold.co/300x450/223a4a/ffffff?text=Lockwood+&+co',
    hint: 'people holding swords',
  },
  {
    title: 'Wilderness',
    year: '2023',
    season: 'Season 2',
    rating: '6.3',
    image: 'https://placehold.co/300x450/1a2228/ffffff?text=Wilderness',
    hint: 'couple posing',
  },
  {
    title: 'Obsession',
    year: '2023',
    season: 'Season 1',
    rating: '5.1',
    image: 'https://placehold.co/300x450/000000/ffffff?text=Obsession',
    hint: 'man face fire',
  },
  {
    title: "Who is carter?",
    year: '2023',
    season: 'Season 1',
    rating: '6.5',
    image: 'https://placehold.co/300x450/a69a8a/000000?text=Who+is+erin+carter?',
    hint: 'woman holding gun',
  },
  {
    title: 'The Lake',
    year: '2023',
    season: 'Season 2',
    rating: '7.4',
    image: 'https://placehold.co/300x450/9ad5e2/000000?text=The+Lake',
    hint: 'family on dock',
  },
  {
    title: 'Outlander',
    year: '2023',
    season: 'Season 7',
    rating: '8.4',
    image: 'https://placehold.co/300x450/c8c0b8/000000?text=Outlander',
    hint: 'historical couple',
  },
  {
    title: 'Shining Vale',
    year: '2023',
    season: 'Season 2',
    rating: '6.9',
    image: 'https://placehold.co/300x450/a9a4a1/000000?text=Shining+Vale',
    hint: 'woman portrait',
  },
  {
    title: 'The Night Agent',
    year: '2023',
    season: 'Season 1',
    rating: '7.5',
    image: 'https://placehold.co/300x450/b0b0b0/000000?text=The+Night+Agent',
    hint: 'man portrait intense',
  },
  {
    title: 'The Ultimatum',
    year: '2023',
    season: 'Season 2',
    rating: '6.1',
    image: 'https://placehold.co/300x450/007464/ffffff?text=The+Ultimatum',
    hint: 'woman in green dress',
  },
  {
    title: 'Kaleidoscope',
    year: '2023',
    season: 'Season 1',
    rating: '7.1',
    image: 'https://placehold.co/300x450/f0f0f0/000000?text=Kaleidoscope',
    hint: 'colorful bars',
  },
  {
    title: 'Fake Profile',
    year: '2023',
    season: 'Season 1',
    rating: '6.0',
    image: 'https://placehold.co/300x450/8a4f4d/ffffff?text=Fake+Profile',
    hint: 'couple posing romance',
  },
];

const FilterSelect = ({
  placeholder,
  items,
}: {
  placeholder: string
  items: string[]
}) => (
  <Select>
    <SelectTrigger className="w-auto gap-2 rounded-full border-none bg-secondary px-4 py-2 text-sm font-medium focus:ring-primary">
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      {items.map((item) => (
        <SelectItem key={item} value={item.toLowerCase()}>
          {item}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export default function LiveSellingPage() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const sidebarIcons = [
    { icon: Home, tooltip: 'Home' },
    { icon: Clapperboard, tooltip: 'Movies' },
    { icon: Tv, tooltip: 'TV Shows', active: true },
    { icon: Music, tooltip: 'Music' },
    { icon: MessageCircle, tooltip: 'Community' },
    { icon: Heart, tooltip: 'Favorites' },
    { icon: Bookmark, tooltip: 'Watchlist' },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-20 flex-col items-center justify-between border-r border-border bg-background py-4 lg:flex">
        <div className="flex flex-col items-center gap-8">
          <Logo className="h-8 w-8 text-red-500" />
          <nav className="flex flex-col items-center gap-6">
            {sidebarIcons.map(({ icon: Icon, tooltip, active }) => (
              <Button
                key={tooltip}
                variant="ghost"
                size="icon"
                className={`rounded-lg ${
                  active ? 'text-primary' : 'text-muted-foreground'
                } hover:text-primary`}
              >
                <Icon className="h-6 w-6" />
              </Button>
            ))}
          </nav>
        </div>
        <Button variant="ghost" size="icon" className="text-primary">
          <Zap className="h-6 w-6" />
        </Button>
      </aside>

      <div className="flex-1">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-sm md:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search"
              className="w-full max-w-md rounded-full border-none bg-secondary pl-10 focus-visible:ring-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Plus className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-6 w-6" />
            </Button>
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 md:p-6">
          {/* Hero Section */}
          <section className="relative -mx-4 -mt-4 mb-6 h-64 w-auto overflow-hidden md:-mx-6 md:h-80 lg:h-96">
            <Image
              src="https://placehold.co/1600x900.png"
              alt="Hero background"
              layout="fill"
              objectFit="cover"
              className="opacity-20"
              data-ai-hint="fantasy movie poster"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
              <h1 className="text-3xl font-bold md:text-5xl">TV Shows</h1>
              <p className="mt-2 max-w-xl text-muted-foreground">
                Watch past seasons of exclusive shows, current-season episodes
                the day after they air, 40+ acclaimed series from FX, classic
                favorites, and tons more.
              </p>
            </div>
          </section>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <FilterSelect
              placeholder="TV Shows"
              items={['Movies', 'Series', 'Anime']}
            />
            <FilterSelect
              placeholder="Genre"
              items={['Action', 'Comedy', 'Drama', 'Horror']}
            />
            <FilterSelect
              placeholder="Country"
              items={['USA', 'UK', 'Canada']}
            />
            <FilterSelect placeholder="Year" items={['2024', '2023', '2022']} />
            <FilterSelect
              placeholder="Rating"
              items={['9+', '8+', '7+', '6+']}
            />
            <FilterSelect
              placeholder="Quality"
              items={['4K', '1080p', '720p']}
            />
            <div className="ml-auto">
              <FilterSelect
                placeholder="Recently updated"
                items={['Most popular', 'Newest']}
              />
            </div>
          </div>

          {/* Shows Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {shows.map((show, index) => (
              <div key={index} className="group relative">
                <div className="overflow-hidden rounded-lg">
                  <Image
                    src={show.image}
                    alt={show.title}
                    width={300}
                    height={450}
                    className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={show.hint}
                  />
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{show.year}</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-500" />
                      <span>{show.rating}</span>
                    </div>
                  </div>
                  <h3 className="mt-1 font-semibold">{show.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {show.season}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="h-full w-64 border-r border-border bg-background p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col items-center gap-8">
              <Logo className="h-8 w-8 text-red-500" />
              <nav className="flex flex-col items-start gap-4 self-stretch">
                {sidebarIcons.map(({ icon: Icon, tooltip, active }) => (
                  <Button
                    key={tooltip}
                    variant="ghost"
                    className={`w-full justify-start gap-2 ${
                      active ? 'text-primary' : 'text-muted-foreground'
                    } hover:text-primary`}
                  >
                    <Icon className="h-6 w-6" />
                    <span>{tooltip}</span>
                  </Button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
