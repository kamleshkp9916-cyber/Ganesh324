
"use client";

import {
  Clapperboard,
  Home,
  Menu,
  Music,
  Bookmark,
  Heart,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { SidebarProvider, Sidebar, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';

export default function LiveSellingPage() {

  const sidebarIcons = [
    { icon: Home, tooltip: 'Home', active: true },
    { icon: Clapperboard, tooltip: 'Movie' },
    { icon: Music, tooltip: 'Music' },
    { icon: TrendingUp, tooltip: 'Trending' },
    { icon: Heart, tooltip: 'Favorite' },
    { icon: Bookmark, tooltip: 'Library' },
  ];

  return (
    <SidebarProvider>
        <div className="flex min-h-screen bg-background text-foreground">
        <Sidebar>
            <div className="sticky top-0 flex h-screen flex-col items-center justify-between border-r border-border bg-background py-4">
                <div className="flex flex-col items-center gap-8">
                
                <nav className="flex flex-col items-center gap-6 mt-8">
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
            </div>
        </Sidebar>
        <SidebarInset>
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-sm md:px-6">
                <h1 className="text-2xl font-bold">Start building from scratch here</h1>
            </header>
            <main className="flex-1 p-4 md:p-6"></main>
        </SidebarInset>
        </div>
    </SidebarProvider>
  );
}
