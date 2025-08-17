
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LayoutGrid, Wallet, PanelLeft } from 'lucide-react';
import { Footer } from '@/components/footer';
import Link from 'next/link';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/loading-spinner';


export default function OrdersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner />
        </div>
    )
  }

  if (!user) {
    return (
         <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
             <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
             <p className="text-muted-foreground mb-6">Please log in to view your orders.</p>
             <Button onClick={() => router.push('/')}>Go to Login</Button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="flex flex-1">
        <aside className={cn(
            "hidden md:block w-[10%] border-r p-4 transition-all duration-300",
            !isSidebarOpen && "w-0 p-0 border-none overflow-hidden"
        )}>
            <h2 className="text-destructive font-bold text-lg mb-6 whitespace-nowrap">StreamCart</h2>
            <nav className="flex flex-col gap-2">
                <Link href="#" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                    <LayoutGrid className="h-5 w-5" />
                    <span className="whitespace-nowrap">Overview</span>
                </Link>
                <Link href="/wallet" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                    <Wallet className="h-5 w-5" />
                    <span className="whitespace-nowrap">Wallet</span>
                </Link>
            </nav>
        </aside>
        <main className="flex-grow p-4 flex flex-col">
            <header className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden">
                        <PanelLeft />
                    </Button>
                    <div className="flex items-center gap-3">
                        <Avatar>
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'}/>
                            <AvatarFallback>{user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-semibold">{user.displayName}</h3>
                            <p className="text-sm text-muted-foreground">Welcome Back</p>
                        </div>
                    </div>
                </div>
                 <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden md:inline-flex">
                    <PanelLeft />
                </Button>
            </header>
            <div className="flex-grow text-center">
                <p>This is the orders page. You can add content here.</p>
            </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
