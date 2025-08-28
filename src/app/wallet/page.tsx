
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Bell, RefreshCw, HelpCircle, Landmark, Lock, Repeat, Smartphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth.tsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { BottomNav } from '@/components/bottom-nav';

const ActionButton = ({ icon, label, subLabel }: { icon: React.ReactNode, label: string, subLabel?: string }) => (
    <div className="flex flex-col items-center gap-2">
        <Button variant="outline" className="h-14 w-14 rounded-full bg-muted shadow-sm">
            {icon}
        </Button>
        <div className="text-center">
            <p className="text-xs font-medium">{label}</p>
            {subLabel && <p className="text-xs text-muted-foreground">{subLabel}</p>}
        </div>
    </div>
);

const TransactionItem = ({ name, date, amount }: { name: string, date: string, amount: string }) => (
    <div className="flex items-center justify-between py-4">
        <div>
            <p className="font-semibold">To {name}</p>
            <p className="text-sm text-muted-foreground">{date}</p>
        </div>
        <p className="font-bold text-lg">₹{amount}</p>
    </div>
);


export default function WalletPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    
    if (loading) {
        return <div className="h-screen w-full flex items-center justify-center"><LoadingSpinner /></div>;
    }

    if (!user) {
        router.push('/');
        return null;
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <header className="p-4 flex items-center justify-between sticky top-0 bg-background z-10">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <div className="flex flex-col items-center">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user.photoURL || undefined} />
                        <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <p className="text-sm font-medium mt-1">@{user.displayName?.replace(' ', '') || 'user'}324</p>
                </div>
                <Button variant="ghost" size="icon">
                    <Bell className="h-6 w-6" />
                </Button>
            </header>

            <main className="flex-grow px-4 pb-24">
                <Card className="bg-foreground text-background text-center rounded-2xl shadow-lg my-4">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                            <p>Available Margin</p>
                            <RefreshCw className="h-4 w-4" />
                        </div>
                        <p className="text-4xl font-bold tracking-tight mt-2">INR 15,00000.00</p>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-4 gap-4 my-8">
                    <ActionButton icon={<Smartphone className="h-6 w-6" />} label="UPI Deposit" />
                    <ActionButton icon={<Landmark className="h-6 w-6" />} label="Withdraw" />
                    <ActionButton icon={<Lock className="h-6 w-6" />} label="Blocked Margin" />
                    <ActionButton icon={<Repeat className="h-6 w-6" />} label="Exchange Into" subLabel="coin" />
                </div>
                
                <div>
                    <h2 className="text-xl font-bold">Transaction</h2>
                    <div className="divide-y">
                        <TransactionItem name="Paul Seller" date="10th July 2025" amount="10,000.0" />
                        <TransactionItem name="Jonhnson Seller" date="10th July 2025" amount="10,000.0" />
                    </div>
                </div>

            </main>

            <Button variant="secondary" size="icon" className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg">
                <HelpCircle className="h-7 w-7" />
            </Button>
            
            <BottomNav />
        </div>
    );
}
