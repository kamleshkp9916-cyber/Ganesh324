
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Wallet, ShieldCheck, Banknote, Plus, Trash2, Edit } from 'lucide-react';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AddBankForm, WithdrawForm } from '@/components/settings-forms';

interface BankAccount {
    id: number;
    bankName: string;
    accountNumber: string;
    ifsc: string;
}

export default function SettingPage() {
    const router = useRouter();
    const { user, loading } = useAuth();
    const [isMounted, setIsMounted] = useState(false);
    const [sellerDetails, setSellerDetails] = useState<any>(null);
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
        { id: 1, bankName: 'HDFC Bank', accountNumber: 'XXXX-XXXX-XX12-3456', ifsc: 'HDFC0001234' },
    ]);

    useEffect(() => {
        setIsMounted(true);
        if (typeof window !== 'undefined') {
            const storedDetails = localStorage.getItem('sellerDetails');
            if (storedDetails) {
                setSellerDetails(JSON.parse(storedDetails));
            }
        }
    }, []);
    
    const handleAddBankAccount = (data: Omit<BankAccount, 'id'>) => {
        const newAccount = {
            ...data,
            id: Date.now(),
            accountNumber: `XXXX-XXXX-XX${data.accountNumber.slice(-4)}`,
        };
        setBankAccounts(prev => [...prev, newAccount]);
    };

    const handleDeleteBankAccount = (id: number) => {
        setBankAccounts(prev => prev.filter(acc => acc.id !== id));
    };

    if (!isMounted || loading) {
        return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>;
    }
    
    if (!user) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                 <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
                 <p className="text-muted-foreground mb-6">Please log in to view your settings.</p>
                 <Button onClick={() => router.push('/')}>Go to Login</Button>
            </div>
        );
    }
    
    if (!sellerDetails) {
        return (
             <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
                 <h2 className="text-2xl font-semibold mb-4">Seller Account Not Found</h2>
                 <p className="text-muted-foreground mb-6">You need to register as a seller to access these settings.</p>
                 <Button onClick={() => router.push('/seller/register')}>Register as Seller</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/40 text-foreground flex flex-col">
            <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold">Account & Wallet</h1>
                <div className="w-10"></div>
            </header>

            <main className="flex-grow p-4 md:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto grid gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <Wallet className="h-6 w-6 text-primary" />
                                <span>Wallet</span>
                            </CardTitle>
                            <CardDescription>View your balance and manage withdrawals.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4 md:grid-cols-2">
                             <div className="flex flex-col p-6 bg-primary/10 rounded-lg">
                                <p className="text-sm text-muted-foreground">Available Balance</p>
                                <p className="text-3xl font-bold tracking-tight">₹5,000.00</p>
                            </div>
                            <div className="flex items-center justify-center">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button size="lg" className="w-full md:w-auto">Withdraw Balance</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Withdraw Funds</DialogTitle>
                                            <DialogDescription>
                                                Enter the amount you wish to withdraw and select a bank account.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <WithdrawForm bankAccounts={bankAccounts} />
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <ShieldCheck className="h-6 w-6 text-primary" />
                                <span>Identity Verification</span>
                            </CardTitle>
                            <CardDescription>Your verified PAN and Aadhar details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                             <div className="flex items-center justify-between p-4 border rounded-lg">
                                <p className="font-medium">PAN Card</p>
                                <p className="font-mono text-muted-foreground">{`******${sellerDetails.pan.slice(-4)}`}</p>
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg">
                                <p className="font-medium">Aadhar Card</p>
                                <p className="font-mono text-muted-foreground">{`********${sellerDetails.aadhar.slice(-4)}`}</p>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                 <div className="flex items-center gap-3">
                                    <Banknote className="h-6 w-6 text-primary" />
                                    <span>Bank Accounts</span>
                                </div>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="outline" size="sm"><Plus className="mr-2 h-4 w-4" /> Add New</Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                         <DialogHeader>
                                            <DialogTitle>Add New Bank Account</DialogTitle>
                                        </DialogHeader>
                                        <AddBankForm onSave={handleAddBankAccount} />
                                    </DialogContent>
                                </Dialog>
                            </CardTitle>
                             <CardDescription>Manage your linked bank accounts for withdrawals.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {bankAccounts.length > 0 ? (
                                bankAccounts.map(account => (
                                    <div key={account.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div>
                                            <p className="font-semibold">{account.bankName}</p>
                                            <p className="text-sm text-muted-foreground font-mono">{account.accountNumber}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDeleteBankAccount(account.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                           ) : (
                                <div className="text-center text-muted-foreground py-8">No bank accounts added.</div>
                           )}
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}
