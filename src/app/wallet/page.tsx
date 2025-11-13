
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RefreshCw, CreditCard, Download, Lock, Coins, Loader2, Bell, ChevronRight, Briefcase, ShoppingBag, BarChart2, Plus, Search, Printer, ArrowLeft, Minus, Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useMemo, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { WithdrawForm } from '@/components/settings-forms';
import { Badge, BadgeProps } from '@/components/ui/badge';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getTransactions, addTransaction, Transaction } from '@/lib/transaction-history';

const mockNotifications = [
    { id: 1, title: 'Deposit Successful', description: '₹1,000.00 has been added to your wallet.', time: '5m ago', read: false, href: '#' },
    { id: 2, title: 'Order Payment', description: 'You paid ₹2,336.40 for order #TXN-984213.', time: '1h ago', read: false, href: '#' },
    { id: 3, title: 'Withdrawal Processed', description: 'Your withdrawal of ₹20,000.00 is successful.', time: '4h ago', read: true, href: '#' },
];

export default function WalletPage() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const markAsRead = (id: number) => {
    setNotifications(current => current.map(n => n.id === id ? { ...n, read: true } : n));
  };
  
  if (loading || !isMounted) {
    return <div className="h-screen w-full flex items-center justify-center bg-background"><LoadingSpinner /></div>;
  }

  if (!user || !userData) {
    router.push('/');
    return null;
  }

  return (
    <Dialog>
    <div className="min-h-screen bg-background text-foreground font-sans">
      <header className="p-4 sm:p-6 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
        <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => router.push('/live-selling')}>
              <ArrowLeft className="h-5 w-5" />
           </Button>
        </div>
        <div className="flex items-center gap-4">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
                        <Bell className="h-5 w-5" />
                         {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                        )}
                    </Button>
                </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="w-80">
                    <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {notifications.map(n => (
                        <Link key={n.id} href={n.href} passHref>
                            <DropdownMenuItem className={cn("flex-col items-start gap-1", !n.read && "bg-primary/5")} onSelect={() => markAsRead(n.id)}>
                                <div className="flex justify-between w-full">
                                    <p className={cn("font-semibold", !n.read && "text-primary")}>{n.title}</p>
                                    <p className="text-xs text-muted-foreground">{n.time}</p>
                                </div>
                                <p className="text-sm text-muted-foreground">{n.description}</p>
                            </DropdownMenuItem>
                        </Link>
                    ))}
                    {notifications.length === 0 && (
                        <p className="text-center text-sm text-muted-foreground p-4">No new notifications.</p>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center gap-2">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={user.photoURL || undefined} />
                    <AvatarFallback>{userData.displayName.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-medium hidden sm:inline">{userData.displayName}</span>
            </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col items-center justify-center text-center py-20 bg-card rounded-lg shadow-lg">
            <Wallet className="h-16 w-16 text-primary mb-4" />
            <h2 className="text-3xl font-bold">Wallet Feature Coming Soon!</h2>
            <p className="text-muted-foreground mt-2 max-w-md">We're working hard to bring you a seamless and secure wallet experience. Stay tuned for updates on easy payments, withdrawals, and exclusive rewards.</p>
            <Button className="mt-6" asChild>
                <Link href="/live-selling">Continue Shopping</Link>
            </Button>
        </div>
      </main>

      <footer className="p-4 sm:p-6 mt-8 border-t text-center text-xs text-muted-foreground">
        <div className="flex justify-center gap-6 mb-2">
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Terms</a>
            <a href="#" className="hover:text-primary">Support</a>
        </div>
        <p>© {new Date().getFullYear()} Nipher. All Rights Reserved.</p>
      </footer>
    </div>
    </Dialog>
  );
}
