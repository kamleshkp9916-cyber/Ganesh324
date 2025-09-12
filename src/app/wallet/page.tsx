
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RefreshCw, CreditCard, Download, Lock, Coins, Loader2, Bell, ChevronRight, Briefcase, ShoppingBag, BarChart2, Plus, ArrowUp, ArrowDown, Search, Printer, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth.tsx';
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
import { Logo } from '@/components/logo';
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

const initialTransactions = [
    { id: 1, transactionId: 'TXN-984213', type: 'Order', description: 'Paid via Wallet', date: 'Sep 09, 2025', time: '10:30 PM', amount: -2336.40, avatar: 'https://placehold.co/40x40.png?text=O', status: 'Completed', discount: -120.00, items: [{ key: 'prod_1', name: 'Noise Cancelling Headphones', qty: 1, unitPrice: 1980.00 }, { key: 'prod_1_ship', name: 'Express Shipping', qty: 1, unitPrice: 120.00 }] },
    { id: 2, transactionId: 'TXN-984112', type: 'Order', description: 'Paid via UPI', date: 'Sep 08, 2025', time: '08:15 AM', amount: -7240.00, avatar: 'https://placehold.co/40x40.png?text=O', status: 'Completed', items: [{ key: 'prod_2', name: 'Vintage Camera', qty: 1, unitPrice: 7240.00 }] },
    { id: 3, transactionId: 'TXN-983990', type: 'Refund', description: 'Refund + Wallet', date: 'Sep 08, 2025', time: '09:00 AM', amount: 5200.00, avatar: 'https://placehold.co/40x40.png?text=R', status: 'Completed' },
    { id: 4, transactionId: 'TXN-001244', type: 'Deposit', description: 'PhonePe Deposit', date: 'Sep 10, 2025', time: '11:00 AM', amount: 1000.00, avatar: 'https://placehold.co/40x40.png?text=D', status: 'Failed' },
    { id: 5, transactionId: 'AUC-5721', type: 'Bid', description: 'Auction Hold + Wallet', date: 'Sep 07, 2025', time: '07:45 PM', amount: -9900.00, avatar: 'https://placehold.co/40x40.png?text=B', status: 'Processing' },
    { id: 6, transactionId: 'WD-3319', type: 'Withdrawal', description: 'To Bank + IMPS', date: 'Sep 06, 2025', time: '02:00 PM', amount: -20000.00, avatar: 'https://placehold.co/40x40.png?text=W', status: 'Completed' },
];

const mockNotifications = [
    { id: 1, title: 'Deposit Successful', description: '₹1,000.00 has been added to your wallet.', time: '5m ago', read: false, href: '#' },
    { id: 2, title: 'Order Payment', description: 'You paid ₹2,336.40 for order #TXN-984213.', time: '1h ago', read: false, href: '#' },
    { id: 3, title: 'Withdrawal Processed', description: 'Your withdrawal of ₹20,000.00 is successful.', time: '4h ago', read: true, href: '#' },
];

const mockBankAccounts = [
    { id: 1, bankName: 'HDFC Bank', accountNumber: 'XXXX-XXXX-XX12-3456' },
    { id: 2, bankName: 'ICICI Bank', accountNumber: 'XXXX-XXXX-XX98-7654' },
];


export default function WalletPage() {
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  const { toast } = useToast();
  const [balance, setBalance] = useState(42580.22);
  const [transactions] = useState(initialTransactions);
  const [isMounted, setIsMounted] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [bankAccounts, setBankAccounts] = useState(mockBankAccounts);
  const [searchTerm, setSearchTerm] = useState('');
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);
  
  const markAsRead = (id: number) => {
    setNotifications(current => current.map(n => n.id === id ? { ...n, read: true } : n));
  };


  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
    return transactions.filter(t => 
        (t.transactionId && t.transactionId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.type && t.type.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, transactions]);

  if (loading || !isMounted) {
    return <div className="h-screen w-full flex items-center justify-center bg-black"><LoadingSpinner /></div>;
  }

  if (!user || !userData) {
    router.push('/');
    return null;
  }

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
     toast({
        title: "Withdrawal Initiated!",
        description: `₹${amount} is on its way to ${selectedAccount?.bankName}.`,
    });
     setIsWithdrawOpen(false);
  };
  
  const handleGenerateInvoice = (transactionId: string) => {
    setIsGeneratingInvoice(transactionId);
    toast({
        title: "Generating Invoice...",
        description: "Please wait while we prepare your invoice.",
    });

    // Simulate API call to a third-party invoice generator
    setTimeout(() => {
        setIsGeneratingInvoice(null);
        // In a real app, you would get a URL back from the API
        const invoiceUrl = `/invoice/${transactionId}`; 
        window.open(invoiceUrl, '_blank');
        toast({
            title: "Invoice Ready!",
            description: "Your invoice has been opened in a new tab.",
        });
    }, 2000);
  };


  return (
    <Dialog>
    <div className="min-h-screen bg-black text-gray-300 font-sans">
      <header className="p-4 sm:p-6 flex items-center justify-between sticky top-0 bg-black/80 backdrop-blur-sm z-30 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
           </Button>
          <Logo className="h-8 w-auto hidden sm:block" />
          <h1 className="text-xl font-bold text-white">Wallet</h1>
        </div>
        <div className="flex items-center gap-4">
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                     <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800 relative">
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
                <span className="text-white font-medium hidden sm:inline">{userData.displayName}</span>
            </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-gray-900/50 border-gray-800 shadow-xl">
               <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white">Account Balance</CardTitle>
                  <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                          <RefreshCw className="h-4 w-4" />
                      </Button>
                  </div>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <p className="text-sm text-gray-400">Total balance</p>
                    <p className="text-5xl font-bold text-white mt-1">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <Card className="bg-gray-800/60 border-gray-700 p-4">
                            <p className="text-xs text-gray-400">Cash Available</p>
                            <p className="text-lg font-bold text-white">₹{balance.toFixed(2)}</p>
                        </Card>
                         <Card className="bg-gray-800/60 border-gray-700 p-4">
                            <p className="text-xs text-gray-400">Blocked Margin</p>
                            <p className="text-lg font-bold text-white">₹2,640.00</p>
                             <p className="text-xs text-gray-500">Bought product balance</p>
                        </Card>
                         <Card className="bg-gray-800/60 border-gray-700 p-4 col-span-2">
                            <p className="text-xs text-gray-400">Month-to-date spend</p>
                            <p className="text-lg font-bold text-white">₹3,140</p>
                        </Card>
                    </div>
                </div>
                <div className="flex flex-col justify-between">
                   <div>
                       <div className="flex justify-between items-center p-3 bg-gray-800/60 border border-gray-700 rounded-lg">
                           <div className="flex items-center gap-2">
                            <Coins className="h-6 w-6 text-yellow-400" />
                            <div>
                                <p className="text-xs text-gray-400">StreamCart Coins</p>
                                <p className="text-lg font-bold text-white">1,250</p>
                            </div>
                           </div>
                       </div>
                        <p className="text-xs text-gray-500 mt-1">Earn coins on every order.</p>
                        <div className="flex justify-between items-center mt-4">
                            <p className="text-xs text-gray-400">Last statement</p>
                            <p className="text-sm font-medium text-white">Aug 31, 2025</p>
                        </div>
                   </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-2 mt-6">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button className="w-full justify-center bg-primary text-primary-foreground hover:bg-primary/90">
                                    <Plus className="h-5 w-5" />
                                    <span>Add Funds</span>
                                </Button>
                            </DialogTrigger>
                             <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add Funds via UPI</DialogTitle>
                                    <DialogDescription>Scan the QR code with any UPI app to add funds to your wallet.</DialogDescription>
                                </DialogHeader>
                                <div className="flex flex-col items-center gap-4 py-4">
                                    <div className="bg-white p-4 rounded-lg">
                                        <Image src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=streamcart@mock" alt="UPI QR Code" width={200} height={200} />
                                    </div>
                                    <p className="text-sm text-muted-foreground">or pay to UPI ID:</p>
                                    <p className="font-semibold">streamcart@mock</p>
                                </div>
                            </DialogContent>
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
             <Card className="bg-gray-900/50 border-gray-800 shadow-xl">
                 <CardHeader>
                    <CardTitle className="text-white text-base">Quick Actions</CardTitle>
                    <CardDescription>Do more, faster</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-3">
                     <Button variant="ghost" className="w-full justify-between h-auto p-3 text-left hover:bg-gray-800">
                         <div className="flex items-center gap-3">
                            <ShoppingBag className="h-6 w-6 text-gray-400"/>
                            <div>
                                <p className="font-semibold text-white">Browse Products</p>
                                <p className="text-xs text-gray-500">Spend from wallet</p>
                            </div>
                         </div>
                         <ChevronRight className="h-5 w-5 text-gray-600"/>
                     </Button>
                     <Button variant="ghost" className="w-full justify-between h-auto p-3 text-left hover:bg-gray-800" disabled>
                         <div className="flex items-center gap-3">
                            <CreditCard className="h-6 w-6 text-gray-400"/>
                            <div>
                                <p className="font-semibold text-white">Withdraw to Bank</p>
                                <p className="text-xs text-gray-500">IMPS / NEFT / UPI</p>
                            </div>
                         </div>
                         <ChevronRight className="h-5 w-5 text-gray-600"/>
                     </Button>
                 </CardContent>
             </Card>
             <Card className="bg-gray-900/50 border-gray-800 shadow-xl">
                 <CardHeader className="flex flex-row justify-between items-center">
                    <CardTitle className="text-white text-base">Insights</CardTitle>
                    <CardDescription>This month</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-4 text-sm">
                    <div className="flex justify-between items-center">
                        <p className="text-gray-400">Spending vs. last month</p>
                        <p className="font-semibold text-red-400">-8%</p>
                    </div>
                     <div className="flex justify-between items-center">
                        <p className="text-gray-400">Average transaction</p>
                        <p className="font-semibold text-white">₹1,920</p>
                    </div>
                 </CardContent>
             </Card>
          </div>
        </div>
        
         <Card className="bg-gray-900/50 border-gray-800 shadow-xl">
             <CardHeader className="flex flex-row justify-between items-center">
                <div>
                  <CardTitle className="text-white">🧾 Invoices / Billing history</CardTitle>
                  <CardDescription>A summary of your recent wallet activity</CardDescription>
                </div>
                 <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input 
                        placeholder="Search transactions..."
                        className="bg-gray-800 border-gray-700 pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                {filteredTransactions.map(t => (
                  <div key={t.id} className="flex items-center p-3 rounded-lg hover:bg-gray-800/50">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={t.avatar} />
                      <AvatarFallback>{t.type.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 flex-grow">
                      <p className="font-semibold text-white">{t.type} <span className="font-mono text-xs text-gray-500">{t.transactionId}</span></p>
                      <p className="text-sm text-gray-400">{t.description}</p>
                      <p className="text-xs text-gray-500">{t.date}, {t.time}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge variant={t.status === 'Completed' ? 'success' : t.status === 'Processing' ? 'warning' : 'destructive'}>{t.status}</Badge>
                         <div className="text-right w-36 flex items-center justify-end gap-2">
                             <p className={cn("font-semibold text-lg flex items-center gap-1", 
                                t.status === 'Failed' ? 'text-red-400' : 
                                t.amount > 0 ? "text-green-400" : "text-white"
                             )}>
                                {t.amount > 0 ? <ArrowUp className="inline-block h-4 w-4" /> : <ArrowDown className="inline-block h-4 w-4" />}
                                <span>₹{Math.abs(t.amount).toFixed(2)}</span>
                            </p>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-gray-400 hover:text-white" 
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
                    <p className="text-center text-gray-500 py-8">No transactions found.</p>
                )}
              </CardContent>
            </Card>
      </main>

      <footer className="p-4 sm:p-6 mt-8 border-t border-gray-800 text-center text-xs text-gray-500">
        <div className="flex justify-center gap-6 mb-2">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Support</a>
        </div>
        <p>© {new Date().getFullYear()} StreamCart. All Rights Reserved.</p>
      </footer>
    </div>
    </Dialog>
  );
}
