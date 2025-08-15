
"use client";

import { useState } from 'react';
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
        {/* Mobile Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-sm md:px-6 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <Logo className="h-8 w-8 text-red-500 lg:hidden" />
            <div className="w-6"></div>
        </header>
        
        <main className="flex-1 p-4 md:p-6">
            <h1 className="text-2xl font-bold">Start building from scratch here</h1>
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
