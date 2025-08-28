
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, CreditCard, Download, Lock, Coins } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function WalletPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [balance, setBalance] = useState(10500.00);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefresh = () => {
      setIsRefreshing(true);
      setTimeout(() => {
        // Simulate fetching a new balance
        setBalance(prev => prev + (Math.random() * 1000 - 500));
        setIsRefreshing(false);
        toast({
            title: "Balance Updated",
            description: "Your wallet balance has been refreshed.",
        })
      }, 1000);
  }

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center"><LoadingSpinner /></div>;
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
        <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'}/>
                    <AvatarFallback className="text-lg">{user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
                </Avatar>
                <h1 className="text-xl font-bold">{user.displayName}</h1>
            </div>
        </div>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow p-4 md:p-6 flex flex-col">
        <div className="flex flex-col items-center justify-center gap-8">
            <Card className="w-full max-w-md shadow-lg">
                <CardContent className="p-6 flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <p>Available Balance</p>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRefresh} disabled={isRefreshing}>
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </Button>
                    </div>
                    <p className="text-4xl font-extrabold tracking-tighter">
                        {'₹' + balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </CardContent>
            </Card>
            
            <div className="w-full max-w-md grid grid-cols-1 gap-4">
                 <Button variant="outline" className="h-14 gap-4 justify-start p-4">
                    <CreditCard className="h-6 w-6" />
                    <span className="font-semibold">UPI Deposit</span>
                </Button>
                 <Button variant="outline" className="h-14 gap-4 justify-start p-4">
                    <Download className="h-6 w-6" />
                    <span className="font-semibold">Withdraw</span>
                </Button>
                 <Button variant="outline" className="h-14 gap-4 justify-start p-4">
                    <Lock className="h-6 w-6" />
                    <span className="font-semibold">Blocked Margin</span>
                </Button>
                 <Button variant="outline" className="h-14 gap-4 justify-start p-4">
                    <Coins className="h-6 w-6" />
                    <span className="font-semibold">Exchange to Coin</span>
                </Button>
            </div>
        </div>
      </main>
    </div>
  );
}
