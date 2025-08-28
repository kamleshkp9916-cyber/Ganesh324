
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, CreditCard, Download, Lock, Coins } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Separator } from '@/components/ui/separator';

type WalletView = 'balance' | 'deposit' | 'withdraw' | 'margin' | 'exchange';

function PlaceholderView({ title }: { title: string }) {
    return (
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    Content for {title.toLowerCase()} will be displayed here.
                </p>
            </CardContent>
        </Card>
    );
}


export default function WalletPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [balance, setBalance] = useState(10500.00);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<WalletView>('balance');


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
  
  const renderActiveView = () => {
    switch (activeView) {
        case 'deposit':
            return <PlaceholderView title="UPI Deposit" />;
        case 'withdraw':
            return <PlaceholderView title="Withdraw Funds" />;
        case 'margin':
            return <PlaceholderView title="Blocked Margin" />;
        case 'exchange':
            return <PlaceholderView title="Exchange to Coin" />;
        case 'balance':
        default:
            return (
                 <Card className="w-full shadow-lg">
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
            );
    }
  };


  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
        <div className="flex items-center gap-3">
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

      <main className="flex-grow p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="flex justify-around md:flex-col md:justify-start gap-4">
                 <Button variant="outline" size="icon" className="h-14 w-14" onClick={() => setActiveView('deposit')}>
                    <CreditCard className="h-6 w-6" />
                </Button>
                 <Button variant="outline" size="icon" className="h-14 w-14" onClick={() => setActiveView('withdraw')}>
                    <Download className="h-6 w-6" />
                </Button>
                 <Button variant="outline" size="icon" className="h-14 w-14" onClick={() => setActiveView('margin')}>
                    <Lock className="h-6 w-6" />
                </Button>
                 <Button variant="outline" size="icon" className="h-14 w-14" onClick={() => setActiveView('exchange')}>
                    <Coins className="h-6 w-6" />
                </Button>
            </div>
            {renderActiveView()}
        </div>
      </main>
    </div>
  );
}
