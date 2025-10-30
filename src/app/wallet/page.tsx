
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RefreshCw, CreditCard, Download, Lock, Coins, Loader2, Bell, ChevronRight, Briefcase, ShoppingBag, BarChart2, Plus, Search, Printer, ArrowLeft, Minus } from 'lucide-react';
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

const mockBankAccounts = [
    { id: 1, bankName: 'HDFC Bank', accountNumber: 'XXXX-XXXX-XX12-3456' },
    { id: 2, bankName: 'ICICI Bank', accountNumber: 'XXXX-XXXX-XX98-7654' },
];

const AddFundsDialog = () => {
    const [amount, setAmount] = useState<number | string>('');
    const [showQr, setShowQr] = useState(false);

    const handleProceed = () => {
        if (typeof amount === 'number' && amount > 0) {
            setShowQr(true);
        }
    };
    
    const upiUrl = `upi://pay?pa=streamcart@mock&am=${amount}&tn=AddFunds`;

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add Funds to Wallet</DialogTitle>
                {!showQr && <DialogDescription>Enter the amount you wish to add.</DialogDescription>}
            </DialogHeader>
            {!showQr ? (
                <div className="py-4 space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                         <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">₹</span>
                            <Input 
                                id="amount" 
                                type="number" 
                                placeholder="0.00" 
                                value={amount} 
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="pl-6"
                            />
                        </div>
                    </div>
                     <Button className="w-full" onClick={handleProceed} disabled={!amount || Number(amount) <= 0}>
                        Proceed to Pay
                    </Button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4 py-4">
                     <p className="font-bold text-2xl">Pay ₹{Number(amount).toFixed(2)}</p>
                    <div className="bg-white p-4 rounded-lg">
                        <Image src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`} alt="UPI QR Code" width={200} height={200} />
                    </div>
                    <p className="text-sm text-muted-foreground">Scan with any UPI app</p>
                    <Button variant="ghost" onClick={() => setShowQr(false)} className="text-sm">
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        Change Amount
                    </Button>
                </div>
            )}
        </DialogContent>
    );
};


export default function WalletPage() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState(42580.22);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [bankAccounts, setBankAccounts] = useState(mockBankAccounts);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  
  useEffect(() => {
    setIsMounted(true);
    setTransactions(getTransactions());
  }, []);
  
  const markAsRead = (id: number) => {
    setNotifications(current => current.map(n => n.id === id ? { ...n, read: true } : n));
  };
  
    const processingTransactions = useMemo(() => {
    return transactions.filter(t => t.status === 'Processing');
  }, [transactions]);
  
  const blockedMargin = useMemo(() => {
    return processingTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);
  }, [processingTransactions]);


  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
    return transactions.filter(t => 
        (t.transactionId && t.transactionId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.type && t.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, transactions]);

  if (loading || !isMounted) {
    return <div className="h-screen w-full flex items-center justify-center bg-background"><LoadingSpinner /></div>;
  }

  if (!user || !userData) {
    router.push('/');
    return null;
  }

  const handleWithdraw = (amount: number, bankAccountId: string) => {
     const selectedAccount = bankAccounts.find(acc => String(acc.id) === bankAccountId);
     const cashAvailable = balance - blockedMargin;
     if (amount > cashAvailable) {
        toast({
            variant: 'destructive',
            title: 'Insufficient Balance',
            description: 'You do not have enough funds to complete this withdrawal.'
        });
        return;
     }

     const newTransaction: Transaction = {
        id: Date.now(),
        transactionId: `WD-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'Withdrawal',
        description: `To ${selectedAccount?.bankName}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        amount: -amount,
        avatar: 'https://placehold.co/40x40.png?text=W',
        status: 'Completed',
     };

     addTransaction(newTransaction);
     setTransactions(getTransactions());
     setBalance(prev => prev - amount);

     toast({
        title: "Withdrawal Initiated!",
        description: `₹${amount} is on its way to ${selectedAccount?.bankName}.`,
    });
     setIsWithdrawOpen(false);
  };
  
  const handleGenerateInvoice = (transactionId: string) => {
    if (isGeneratingInvoice) return;

    const transaction = transactions.find(t => t.transactionId === transactionId);
    if (!transaction || transaction.type !== 'Order') {
        toast({
            variant: "destructive",
            title: "Invoice Not Available",
            description: "Invoices can only be generated for completed orders.",
        });
        return;
    }
    
    setIsGeneratingInvoice(transactionId);
    toast({
        title: "Generating Invoice...",
        description: "Please wait while we prepare your invoice.",
    });

    setTimeout(() => {
        setIsGeneratingInvoice(null);
        const invoiceUrl = `/invoice/${transactionId}`; 
        window.open(invoiceUrl, '_blank');
        toast({
            title: "Invoice Ready!",
            description: "Your invoice has been opened in a new tab.",
        });
    }, 2000);
  };

  const cashAvailable = balance - blockedMargin;

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card shadow-lg">
               <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Account Balance</CardTitle>
                  <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                          <RefreshCw className="h-4 w-4" />
                      </Button>
                  </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">Total balance</p>
                    <p className="text-5xl font-bold mt-1">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <Card className="bg-muted/50 p-4">
                            <p className="text-xs text-muted-foreground">Cash Available</p>
                            <p className="text-lg font-bold">₹{cashAvailable.toFixed(2)}</p>
                        </Card>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Card className="bg-muted/50 p-4 cursor-pointer hover:bg-muted">
                                    <p className="text-xs text-muted-foreground">Blocked Margin</p>
                                    <p className="text-lg font-bold">₹{blockedMargin.toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">For processing orders</p>
                                </Card>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Blocked Margin Details</DialogTitle>
                                    <DialogDescription>Funds held for orders that are currently being processed.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-2 py-4">
                                    {processingTransactions.length > 0 ? (
                                        processingTransactions.map(t => (
                                            <div key={t.id} className="flex justify-between items-center text-sm p-2 bg-muted rounded-md">
                                                <div>
                                                    <p className="font-semibold">{t.description}</p>
                                                    <p className="text-xs text-muted-foreground">{t.transactionId}</p>
                                                </div>
                                                <p className="font-semibold">₹{Math.abs(t.amount).toFixed(2)}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-center text-sm text-muted-foreground py-4">No funds are currently blocked.</p>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>
                         <Card className="bg-muted/50 p-4 col-span-2">
                            <p className="text-xs text-muted-foreground">Month-to-date spend</p>
                            <p className="text-lg font-bold">₹3,140</p>
                        </Card>
                    </div>
                </div>
                <div className="flex flex-col justify-between">
                   <div>
                       <div className="flex justify-between items-center p-3 bg-muted/50 border rounded-lg">
                           <div className="flex items-center gap-2">
                            <Coins className="h-6 w-6 text-primary" />
                            <div>
                                <p className="text-xs text-muted-foreground">StreamCart Coins</p>
                                <p className="text-lg font-bold">1,250</p>
                            </div>
                           </div>
                       </div>
                        <p className="text-xs text-muted-foreground mt-1">Earn coins on every order.</p>
                        <div className="flex justify-between items-center mt-4">
                            <p className="text-xs text-muted-foreground">Last statement</p>
                            <p className="text-sm font-medium">Aug 31, 2025</p>
                        </div>
                   </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-2 mt-6">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="w-full justify-center">
                                    <Plus className="h-5 w-5" />
                                    <span>Add Funds</span>
                                </Button>
                            </DialogTrigger>
                             <AddFundsDialog />
                        </Dialog>
                         <Button className="w-full justify-center" variant="outline">
                            <BarChart2 className="h-5 w-5"/>
                            <span>View Statements</span>
                        </Button>
                        <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full justify-center" variant="outline">
                                    <Download className="h-5 w-5" />
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
                                    cashAvailable={cashAvailable}
                                    bankAccounts={bankAccounts} 
                                    onWithdraw={handleWithdraw}
                                    onAddAccount={(newAccount) => {
                                        setBankAccounts(prev => [...prev, { ...newAccount, id: Date.now() }]);
                                        toast({ title: "Bank Account Added!", description: "You can now select it for withdrawals." });
                                    }} 
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
             <Card className="bg-card shadow-lg">
                 <CardHeader>
                    <CardTitle className="text-base">Quick Actions</CardTitle>
                    <CardDescription>Do more, faster</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-3">
                     <Button variant="ghost" className="w-full justify-between h-auto p-3 text-left hover:bg-muted">
                         <div className="flex items-center gap-3">
                            <ShoppingBag className="h-6 w-6 text-muted-foreground"/>
                            <div>
                                <p className="font-semibold">Browse Products</p>
                                <p className="text-xs text-muted-foreground">Spend from wallet</p>
                            </div>
                         </div>
                         <ChevronRight className="h-5 w-5 text-muted-foreground"/>
                     </Button>
                     <Button variant="ghost" className="w-full justify-between h-auto p-3 text-left hover:bg-muted" disabled>
                         <div className="flex items-center gap-3">
                            <CreditCard className="h-6 w-6 text-muted-foreground"/>
                            <div>
                                <p className="font-semibold">Withdraw to Bank</p>
                                <p className="text-xs text-muted-foreground">IMPS / NEFT / UPI</p>
                            </div>
                         </div>
                         <ChevronRight className="h-5 w-5 text-muted-foreground"/>
                     </Button>
                 </CardContent>
             </Card>
             <Card className="bg-card shadow-lg">
                 <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle className="text-base">Insights</CardTitle>
                    <CardDescription>This month</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4 text-sm">
                    <div className="flex justify-between items-center">
                        <p className="text-muted-foreground">Spending vs. last month</p>
                        <p className="font-semibold text-destructive">-8%</p>
                    </div>
                     <div className="flex justify-between items-center">
                        <p className="text-muted-foreground">Average transaction</p>
                        <p className="font-semibold">₹1,920</p>
                    </div>
                 </CardContent>
             </Card>
          </div>
        </div>
        
         <Card className="bg-card shadow-lg">
             <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle>🧾 Invoices / Billing history</CardTitle>
                  <CardDescription>A summary of your recent wallet activity</CardDescription>
                </div>
                 <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search transactions..."
                        className="bg-muted border-border pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                {filteredTransactions.map(t => (
                  <div key={t.id} className="flex items-center p-3 rounded-lg hover:bg-muted/50">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={t.avatar} />
                      <AvatarFallback>{t.type.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 flex-grow">
                      <p className="font-semibold">{t.type} <span className="font-mono text-xs text-muted-foreground">{t.transactionId}</span></p>
                      <p className="text-sm text-muted-foreground">{t.description}</p>
                      <p className="text-xs text-muted-foreground">{t.date}, {t.time}</p>
                    </div>
                    <div className="flex items-center gap-4">
                         <Badge variant={t.status === 'Completed' ? 'success' : t.status === 'Processing' ? 'warning' : 'destructive'}>{t.status}</Badge>
                         <div className="text-right w-36 flex items-center justify-end gap-2">
                            <p className={cn("font-semibold text-lg flex items-center gap-1", 
                                t.status === 'Failed' ? 'text-destructive' : 
                                t.amount > 0 ? "text-success" : "text-foreground"
                             )}>
                                {t.status !== 'Failed' && (t.amount > 0 ? <Plus className="inline-block h-4 w-4" /> : <Minus className="inline-block h-4 w-4" />)}
                                <span>₹{Math.abs(t.amount).toFixed(2)}</span>
                            </p>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-muted-foreground hover:text-foreground" 
                                onClick={() => handleGenerateInvoice(t.transactionId)}
                                disabled={t.type !== 'Order' || isGeneratingInvoice === t.transactionId}
                            >
                                {isGeneratingInvoice === t.transactionId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                  </div>
                ))}
                {filteredTransactions.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No transactions found.</p>
                )}
              </CardContent>
            </Card>
      </main>

      <footer className="p-4 sm:p-6 mt-8 border-t text-center text-xs text-muted-foreground">
        <div className="flex justify-center gap-6 mb-2">
            <a href="#" className="hover:text-primary">Privacy</a>
            <a href="#" className="hover:text-primary">Terms</a>
            <a href="#" className="hover:text-primary">Support</a>
        </div>
        <p>© {new Date().getFullYear()} StreamCart. All Rights Reserved.</p>
      </footer>
    </div>
    </Dialog>
  );
}
