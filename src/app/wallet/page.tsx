
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, CreditCard, Download, Lock, Coins, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth.tsx';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { WithdrawForm } from '@/components/settings-forms';
import { Badge, BadgeProps } from '@/components/ui/badge';


const initialTransactions = [
    { id: 1, transactionId: 'TXN789012345', name: 'Ganesh Prajapati', date: '27 July, 2024', time: '10:30 PM', amount: -5000.00, avatar: 'https://placehold.co/40x40.png', status: 'Completed' },
    { id: 2, transactionId: 'TXN654321098', name: 'Jane Doe', date: '26 July, 2024', time: '08:15 AM', amount: -250.00, avatar: 'https://placehold.co/40x40.png', status: 'Failed' },
    { id: 3, transactionId: 'TXN543210987', name: 'Monthly Savings', date: '25 July, 2024', time: '09:00 AM', amount: 10000.00, avatar: 'https://placehold.co/40x40.png', status: 'Completed' },
    { id: 4, transactionId: 'TXN432109876', name: 'Alex Smith', date: '24 July, 2024', time: '07:45 PM', amount: -1200.00, avatar: 'https://placehold.co/40x40.png', status: 'Completed' },
];

const paymentMethods = [
    { name: 'PhonePe', icon: 'https://cdn.worldvectorlogo.com/logos/phonepe-1.svg' },
    { name: 'Google Pay', icon: 'https://www.vectorlogo.zone/logos/googlepay/googlepay-icon.svg' },
    { name: 'Paytm', icon: 'https://www.vectorlogo.zone/logos/paytm/paytm-icon.svg' },
    { name: 'Credit/Debit Card', icon: <CreditCard className="h-8 w-8 text-primary" /> },
];

const mockBankAccounts = [
    { id: 1, bankName: 'HDFC Bank', accountNumber: 'XXXX-XXXX-XX12-3456' },
    { id: 2, bankName: 'ICICI Bank', accountNumber: 'XXXX-XXXX-XX98-7654' },
];


export default function WalletPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState(10500.00);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [transactions, setTransactions] = useState(initialTransactions);

  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [bankAccounts, setBankAccounts] = useState(mockBankAccounts);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
        toast({
            variant: 'destructive',
            title: 'Invalid Amount',
            description: 'Please enter a valid amount to deposit.'
        });
        return;
    }
     if (!selectedPaymentMethod) {
        toast({
            variant: 'destructive',
            title: 'Payment Method Required',
            description: 'Please select a payment method to continue.'
        });
        return;
    }

    setIsDepositing(true);
    toast({
        title: 'Processing Payment...',
        description: `Redirecting to ${selectedPaymentMethod}...`
    });

    setTimeout(() => {
        setBalance(prev => prev + amount);
        const newTransaction = {
            id: Date.now(),
            transactionId: `TXN${Date.now()}`,
            name: `${selectedPaymentMethod} Deposit`,
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            amount: amount,
            avatar: user?.photoURL || 'https://placehold.co/40x40.png',
            status: 'Processing'
        };
        // @ts-ignore
        setTransactions(prev => [newTransaction, ...prev]);
        
        setIsDepositing(false);
        setIsDepositOpen(false);
        setDepositAmount('');
        setSelectedPaymentMethod(null);
        toast({
            title: 'Deposit Successful!',
            description: `₹${amount.toFixed(2)} has been added to your wallet.`
        });
        
        // Simulate transaction completion
        setTimeout(() => {
            setTransactions(prev => prev.map(t => t.id === newTransaction.id ? {...t, status: 'Completed'} : t));
        }, 5000);

    }, 2500);
  };

  const handleWithdraw = (amount: number, bankAccountId: string) => {
     const selectedAccount = bankAccounts.find(acc => String(acc.id) === bankAccountId);
     if (amount > balance) {
        toast({
            variant: 'destructive',
            title: 'Insufficient Balance',
            description: 'You do not have enough funds to complete this withdrawal.'
        });
        return;
     }

     setBalance(prev => prev - amount);
     const newTransaction = {
            id: Date.now(),
            transactionId: `TXN${Date.now()}`,
            name: `Withdrawal to ${selectedAccount?.bankName}`,
            date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            amount: -amount,
            avatar: user?.photoURL || 'https://placehold.co/40x40.png',
            status: 'Completed'
     };
     // @ts-ignore
     setTransactions(prev => [newTransaction, ...prev]);
     setIsWithdrawOpen(false);
  };
  
  const getStatusBadgeVariant = (status: string): BadgeProps['variant'] => {
      switch (status) {
          case 'Completed':
              return 'success';
          case 'Processing':
              return 'warning';
          case 'Failed':
              return 'destructive';
          default:
              return 'outline';
      }
  };


  if (loading || !isMounted) {
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
                    <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
                        <DialogTrigger asChild>
                             <Button variant="outline" className="h-20 flex-col gap-1 p-1 text-xs text-center">
                                <CreditCard className="h-5 w-5"/>
                                <span>UPI Deposit</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Add Money to Wallet</DialogTitle>
                                <DialogDescription>Enter an amount and choose your payment method.</DialogDescription>
                            </DialogHeader>
                            <div className="py-4 space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="amount" className="text-lg font-semibold">Amount</Label>
                                     <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">₹</span>
                                        <Input 
                                            id="amount" 
                                            type="number" 
                                            className="h-16 pl-10 text-4xl font-bold"
                                            placeholder="0" 
                                            value={depositAmount}
                                            onChange={(e) => setDepositAmount(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                     <Label className="font-semibold">Select Payment Method</Label>
                                     <div className="grid grid-cols-2 gap-4">
                                        {paymentMethods.map((method) => (
                                            <button
                                                key={method.name}
                                                onClick={() => setSelectedPaymentMethod(method.name)}
                                                className={cn(
                                                    "p-4 border rounded-lg flex flex-col items-center justify-center gap-2 transition-colors",
                                                    selectedPaymentMethod === method.name ? "border-primary ring-2 ring-primary" : "hover:bg-muted"
                                                )}
                                            >
                                                {typeof method.icon === 'string' ? 
                                                    <Image src={method.icon} alt={method.name} width={32} height={32} /> : method.icon
                                                }
                                                <span className="text-sm font-medium">{method.name}</span>
                                            </button>
                                        ))}
                                     </div>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleDeposit} disabled={isDepositing} className="w-full" size="lg">
                                    {isDepositing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Proceed to Pay ₹{depositAmount || 0}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="h-20 flex-col gap-1 p-1 text-xs text-center">
                                <Download className="h-5 w-5"/>
                                <span>Withdraw</span>
                            </Button>
                        </DialogTrigger>
                         <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Withdraw Funds</DialogTitle>
                                <DialogDescription>
                                    Select an account and enter the amount you wish to withdraw.
                                </DialogDescription>
                            </DialogHeader>
                            <WithdrawForm 
                                bankAccounts={bankAccounts} 
                                onWithdraw={handleWithdraw}
                                onAddAccount={(newAccount) => {
                                    setBankAccounts(prev => [...prev, { ...newAccount, id: Date.now() }]);
                                    toast({ title: "Bank Account Added!", description: "You can now select it for withdrawals." });
                                }} 
                            />
                        </DialogContent>
                    </Dialog>
                     <Button variant="outline" className="h-20 flex-col gap-1 p-1 text-xs text-center">
                        <Lock className="h-5 w-5"/>
                        <span>Blocked Margin</span>
                    </Button>
                     <Button variant="outline" className="h-20 flex-col gap-1 p-1 text-xs text-center">
                        <Coins className="h-5 w-5"/>
                        <span>Exchange to Coin</span>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>🧾 Invoices / Billing history</CardTitle>
                    <CardDescription>A summary of your recent wallet activity.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {transactions.map((transaction, index) => (
                        <div key={transaction.id} className="flex items-center">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={transaction.avatar} alt="Avatar" />
                                <AvatarFallback>{transaction.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">{transaction.name}</p>
                                <p className="text-xs text-muted-foreground">{transaction.date}, {transaction.time}</p>
                                <p className="text-xs text-muted-foreground font-mono">ID: {transaction.transactionId}</p>
                            </div>
                             <div className="ml-auto flex items-center gap-2">
                                <div>
                                    <p className={cn(
                                        "font-medium text-right",
                                        transaction.amount > 0 ? 'text-success' : 'text-foreground'
                                    )}>
                                        {transaction.amount > 0 ? '+' : ''}₹{Math.abs(transaction.amount).toLocaleString('en-IN')}
                                    </p>
                                    <Badge variant={getStatusBadgeVariant(transaction.status)} className="mt-1 capitalize float-right">
                                        {transaction.status}
                                    </Badge>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Download className="h-4 w-4" />
                                </Button>
                             </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

        </main>
    </div>
  );
}
