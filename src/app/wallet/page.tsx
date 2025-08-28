
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, CreditCard, Download, Lock, Coins } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const mockTransactions = [
    { name: 'Ganesh Prajapati', date: '27 July, 2024', amount: -5000.00, avatar: 'https://placehold.co/40x40.png' },
    { name: 'Jane Doe', date: '26 July, 2024', amount: -250.00, avatar: 'https://placehold.co/40x40.png' },
    { name: 'Monthly Savings', date: '25 July, 2024', amount: 10000.00, avatar: 'https://placehold.co/40x40.png' },
    { name: 'Alex Smith', date: '24 July, 2024', amount: -1200.00, avatar: 'https://placehold.co/40x40.png' },
];

export default function WalletPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState(10500.00);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
        // Simulate fetching a new balance
        setBalance(balance + (Math.random() * 1000 - 500));
        setIsRefreshing(false);
        toast({
            title: "Balance Updated",
            description: "Your wallet balance has been refreshed.",
        });
    }, 1000);
  };

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center"><LoadingSpinner /></div>;
  }

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/40 text-foreground flex flex-col">
        <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold">Wallet</h1>
            <div className="w-10"></div>
        </header>

        <main className="flex-grow p-4 md:p-6 lg:p-8 space-y-6">
            <div className="max-w-md mx-auto space-y-6">
                <Card className="text-center">
                    <CardHeader>
                        <CardTitle>Available Balance</CardTitle>
                        <CardDescription>This is the total amount available in your wallet.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center gap-2">
                        <div className="flex items-center gap-4">
                            <p className="text-4xl font-bold">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
                                <RefreshCw className={isRefreshing ? 'animate-spin' : ''} />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                 <div className="grid grid-cols-4 gap-2">
                     <Button variant="outline" className="h-20 flex-col gap-1 p-1 hover:bg-destructive hover:text-destructive-foreground text-xs text-center">
                        <CreditCard className="h-5 w-5"/>
                        <span>UPI Deposit</span>
                    </Button>
                     <Button variant="outline" className="h-20 flex-col gap-1 p-1 hover:bg-destructive hover:text-destructive-foreground text-xs text-center">
                        <Download className="h-5 w-5"/>
                        <span>Withdraw</span>
                    </Button>
                     <Button variant="outline" className="h-20 flex-col gap-1 p-1 hover:bg-destructive hover:text-destructive-foreground text-xs text-center">
                        <Lock className="h-5 w-5"/>
                        <span>Blocked Margin</span>
                    </Button>
                     <Button variant="outline" className="h-20 flex-col gap-1 p-1 hover:bg-destructive hover:text-destructive-foreground text-xs text-center">
                        <Coins className="h-5 w-5"/>
                        <span>Exchange to Coin</span>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>A summary of your recent wallet activity.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {mockTransactions.map((transaction, index) => (
                        <div key={index} className="flex items-center">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={transaction.avatar} alt="Avatar" />
                                <AvatarFallback>{transaction.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{transaction.name}</p>
                                <p className="text-sm text-muted-foreground">{transaction.date}</p>
                            </div>
                            <div className={cn(
                                "ml-auto font-medium",
                                transaction.amount > 0 ? 'text-success' : 'text-foreground'
                            )}>
                                {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString('en-IN')}
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

        </main>
    </div>
  );
}
