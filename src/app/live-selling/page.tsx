
"use client";

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Bell,
  Bookmark,
  ChevronRight,
  Clapperboard,
  Home,
  Menu,
  MessageCircle,
  Music,
  Play,
  Search,
  Settings,
  Tv,
  Heart,
  Zap,
  TrendingUp,
  Plus,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';

const favoriteStreamers = [
  { name: 'Ninja', avatar: 'https://placehold.co/40x40.png', hint: 'streamer avatar' },
  { name: 'Shroud', avatar: 'https://placehold.co/40x40.png', hint: 'streamer avatar' },
  { name: 'Pokimane', avatar: 'https://placehold.co/40x40.png', hint: 'streamer avatar' },
];

const topCategories = ['Gaming', 'Music', 'Esports', 'Creative'];

export default function LiveSellingPage() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const sidebarIcons = [
    { icon: Home, tooltip: 'Home', active: true },
    { icon: Clapperboard, tooltip: 'Movie' },
    { icon: Music, tooltip: 'Music' },
    { icon: TrendingUp, tooltip: 'Trending' },
    { icon: Heart, tooltip: 'Favorite' },
    { icon: Bookmark, tooltip: 'Library' },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Left Sidebar */}
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
                  active
                    ? 'bg-red-500/20 text-red-500'
                    : 'text-muted-foreground'
                } hover:bg-red-500/20 hover:text-red-500`}
              >
                <Icon className="h-6 w-6" />
              </Button>
            ))}
          </nav>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500">
          <Zap className="h-6 w-6" />
        </Button>
      </aside>

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-sm md:px-6">
          <div className='flex items-center gap-4'>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <nav className="hidden items-center gap-4 md:flex">
                <Link href="#" className="text-sm font-medium hover:text-primary">Watch now</Link>
                <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary">Category</Link>
                <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary">Upcoming</Link>
                <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary">Pricing</Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar className="h-9 w-9">
              <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="user avatar" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
                {/* Hero Section */}
                <section className="relative -mx-4 -mt-4 mb-6 h-80 w-auto overflow-hidden md:-mx-6 md:h-[450px]">
                    <Image
                        src="https://placehold.co/1200x600/000000/ffffff?text=Slime+You+Out"
                        alt="Hero background"
                        layout="fill"
                        objectFit="cover"
                        className="opacity-40"
                        data-ai-hint="drake album art"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                        <h1 className="text-3xl font-bold md:text-5xl">Slime you out</h1>
                        <p className="mt-2 text-lg font-medium text-muted-foreground">Drake ft. SZA</p>
                        <Button className="mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold">
                            <Play className="mr-2 h-5 w-5" />
                            Watch now
                        </Button>
                    </div>
                </section>
                {/* Other content can go here */}
            </div>
             {/* Right Sidebar */}
            <aside className="hidden w-72 flex-col gap-6 border-l border-border bg-background p-4 xl:flex">
                <div>
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Favorite Streamers</h3>
                        <Button variant="ghost" size="sm">See all</Button>
                    </div>
                    <div className="mt-4 flex flex-col gap-4">
                        {favoriteStreamers.map(streamer => (
                            <div key={streamer.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={streamer.avatar} alt={streamer.name} data-ai-hint={streamer.hint} />
                                        <AvatarFallback>{streamer.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{streamer.name}</span>
                                </div>
                                <Button variant="secondary" size="sm">Follow</Button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t border-border pt-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Top Categories</h3>
                        <Button variant="ghost" size="sm">See all</Button>
                    </div>
                     <div className="mt-4 grid grid-cols-2 gap-2">
                        {topCategories.map(category => (
                            <Button key={category} variant="outline" className="justify-start">{category}</Button>
                        ))}
                    </div>
                </div>
            </aside>
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
                      active
                        ? 'text-red-500'
                        : 'text-muted-foreground'
                    } hover:text-red-500`}
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
