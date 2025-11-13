
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, CreditCard, Download, Lock, Coins, Loader2, Bell, ChevronRight, Briefcase, ShoppingBag, BarChart2, Plus, ArrowUp, ArrowDown, Search, Printer } from 'lucide-react';
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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const initialTransactions = [
    { id: 1, transactionId: 'TXN-984213', type: 'Order', description: 'Paid via Wallet', date: 'Sep 09, 2025', time: '10:30 PM', amount: -1980.00, avatar: 'https://placehold.co/40x40.png?text=O', status: 'Completed' },
    { id: 2, transactionId: 'TXN-984112', type: 'Order', description: 'Paid via UPI', date: 'Sep 08, 2025', time: '08:15 AM', amount: -7240.00, avatar: 'https://placehold.co/40x40.png?text=O', status: 'Completed' },
    { id: 3, transactionId: 'TXN-983990', type: 'Refund', description: 'Refund + Wallet', date: 'Sep 08, 2025', time: '09:00 AM', amount: 5200.00, avatar: 'https://placehold.co/40x40.png?text=R', status: 'Completed' },
    { id: 4, transactionId: 'TXN-001244', type: 'Deposit', description: 'PhonePe Deposit', date: 'Sep 10, 2025', time: '11:00 AM', amount: 1000.00, avatar: 'https://placehold.co/40x40.png?text=D', status: 'Failed' },
    { id: 5, transactionId: 'AUC-5721', type: 'Bid', description: 'Auction Hold + Wallet', date: 'Sep 07, 2025', time: '07:45 PM', amount: -9900.00, avatar: 'https://placehold.co/40x40.png?text=B', status: 'Processing' },
    { id: 6, transactionId: 'WD-3319', type: 'Withdrawal', description: 'To Bank + IMPS', date: 'Sep 06, 2025', time: '02:00 PM', amount: -20000.00, avatar: 'https://placehold.co/40x40.png?text=W', status: 'Completed' },
];


const mockBankAccounts = [
    { id: 1, bankName: 'HDFC Bank', accountNumber: 'XXXX-XXXX-XX12-3456' },
    { id: 2, bankName: 'ICICI Bank', accountNumber: 'XXXX-XXXX-XX98-7654' },
];

const invoiceData = {
    invoiceNo: 'INV-2025-00981',
    date: 'Sep 09, 2025',
    billedTo: {
        name: 'Alex Morgan',
        address: '42, Palm Street, Indiranagar, Bengaluru, KA 560038'
    },
    paidVia: {
        method: 'Wallet • INR (₹)',
        transactionId: '#TXN-984213'
    },
    items: [
        { id: 1, name: 'Noise Cancelling Headphones', qty: 1, unitPrice: 1980.00, amount: 1980.00 },
        { id: 2, name: 'Express Shipping', qty: 1, unitPrice: 120.00, amount: 120.00 }
    ],
    summary: {
        subtotal: 2100.00,
        discount: -120.00,
        gst: 356.40,
        totalDue: 2336.40,
        amountPaid: 2336.40,
        balance: 0.00
    }
};

const InvoiceDialog = ({ transaction }: { transaction: typeof initialTransactions[0] }) => {
    const invoiceRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPdf = async () => {
        const input = invoiceRef.current;
        if (input) {
            const canvas = await html2canvas(input, {
                 scale: 2,
                 backgroundColor: '#111827'
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`invoice-${invoiceData.invoiceNo}.pdf`);
        }
    };
    
    return (
        <DialogContent className="max-w-4xl p-0">
            <DialogHeader className="sr-only">
                <DialogTitle>Invoice {invoiceData.invoiceNo}</DialogTitle>
                <DialogDescription>A detailed invoice for your transaction.</DialogDescription>
            </DialogHeader>
             <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-order, #printable-order * {
                        visibility: visible;
                    }
                    #printable-order {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background-color: #111827 !important;
                        -webkit-print-color-adjust: exact;
                    }
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
            <div ref={invoiceRef} id="printable-order" className="invoice-container w-full bg-gray-900 text-gray-300 p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                        <Logo className="h-8 w-auto text-white" />
                        <div>
                            <h1 className="text-2xl font-bold text-white">Nipher Wallet</h1>
                            <p className="text-sm text-gray-400">Invoice</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-400">Invoice No.</p>
                        <p className="font-semibold text-white">{invoiceData.invoiceNo}</p>
                        <p className="text-sm text-gray-400 mt-2">Date</p>
                        <p className="font-semibold text-white">{invoiceData.date}</p>
                    </div>
                </div>

                {/* Billing Info */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <Card className="bg-gray-800/50 border-gray-700 p-4">
                        <h2 className="text-sm font-semibold text-gray-400 mb-2">Billed To</h2>
                        <p className="font-bold text-white">{invoiceData.billedTo.name}</p>
                        <p className="text-sm text-gray-400">{invoiceData.billedTo.address}</p>
                    </Card>
                    <Card className="bg-gray-800/50 border-gray-700 p-4">
                        <h2 className="text-sm font-semibold text-gray-400 mb-2">Paid Via</h2>
                        <p className="font-bold text-white">{invoiceData.paidVia.method}</p>
                        <p className="text-sm text-gray-400">Transaction {invoiceData.paidVia.transactionId}</p>
                    </Card>
                </div>

                {/* Items Table */}
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="py-2 pr-4 font-semibold">Item</th>
                                <th className="py-2 px-4 font-semibold text-center">Qty</th>
                                <th className="py-2 px-4 font-semibold text-right">Unit Price</th>
                                <th className="py-2 pl-4 font-semibold text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceData.items.map(item => (
                                <tr key={item.id} className="border-b border-gray-800">
                                    <td className="py-3 pr-4">{item.name}</td>
                                    <td className="py-3 px-4 text-center">{item.qty}</td>
                                    <td className="py-3 px-4 text-right">₹{item.unitPrice.toFixed(2)}</td>
                                    <td className="py-3 pl-4 text-right">₹{item.amount.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary */}
                <div className="flex justify-end mt-8">
                    <div className="w-full max-w-sm space-y-3">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Subtotal</span>
                            <span>₹{invoiceData.summary.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Discount</span>
                            <span>- ₹{Math.abs(invoiceData.summary.discount).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">GST (18%)</span>
                            <span>₹{invoiceData.summary.gst.toFixed(2)}</span>
                        </div>
                        <Separator className="bg-gray-700 my-2" />
                        <div className="flex justify-between items-center font-bold text-lg">
                            <span className="text-white">Total Due (INR)</span>
                            <span className="text-white">₹{invoiceData.summary.totalDue.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Amount Paid</span>
                            <span>₹{invoiceData.summary.amountPaid.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Balance</span>
                            <span>₹{invoiceData.summary.balance.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <Separator className="bg-gray-700 mt-8" />

                {/* Footer */}
                <div className="mt-8">
                    <p className="text-sm text-gray-500">If you have any questions about this invoice, contact support@nipher.in</p>
                </div>
            </div>
             <div className="w-full mx-auto p-6 flex justify-between items-center bg-gray-900 rounded-b-lg no-print">
                 <p className="text-sm text-gray-400">Thank you for your purchase.</p>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                    <Button onClick={handleDownloadPdf} className="bg-yellow-500 text-black hover:bg-yellow-600">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                </div>
            </div>
        </DialogContent>
    );
};


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

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
    return transactions.filter(t => 
        t.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
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
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800">
                <Bell className="h-5 w-5" />
            </Button>
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
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-gray-900/50 border-gray-800 shadow-xl">
                 <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-white">Account Balance</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2">
                      <p className="text-sm text-gray-400">Total balance</p>
                      <p className="text-5xl font-bold text-white mt-1">₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                      <div className="grid grid-cols-2 gap-4 mt-6">
                          <Card className="bg-gray-800/60 border-gray-700 p-4">
                              <p className="text-xs text-gray-400">Cash Available</p>
                              <p className="text-lg font-bold text-white">₹{balance.toLocaleString('en-IN')}</p>
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
                                  <p className="text-xs text-gray-400">Nipher Coins</p>
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
                      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2 mt-6">
                          <Dialog>
                              <DialogTrigger asChild>
                                  <Button className="w-full justify-center bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/30">
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
                                          <Image src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=nipher@mock" alt="UPI QR Code" width={200} height={200} />
                                      </div>
                                      <p className="text-sm text-muted-foreground">or pay to UPI ID:</p>
                                      <p className="font-semibold">nipher@mock</p>
                                  </div>
                              </DialogContent>
                          </Dialog>
                           <Button className="w-full justify-center" variant="outline">
                              <BarChart2 className="h-5 w-5"/>
                              <span>View Statements</span>
                          </Button>
                          <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
                              <DialogTrigger asChild>
                                  <Button className="w-full justify-center bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/30">
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
                       <Button variant="ghost" className="w-full justify-between h-auto p-3 text-left hover:bg-gray-800">
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
                          <Badge variant={t.status === 'Completed' ? 'success' : t.status === 'Processing' ? 'warning' : 'destructive'} className="bg-opacity-20 text-opacity-100">{t.status}</Badge>
                           <div className="text-right w-36 flex items-center justify-end gap-2">
                              <p className={cn("font-semibold text-lg flex items-center gap-1", t.amount > 0 ? 'text-green-400' : 'text-white')}>
                                  {t.amount > 0 ? <Plus className="inline-block h-4 w-4" /> : <Minus className="inline-block h-4 w-4" />}
                                  <span>₹{Math.abs(t.amount).toLocaleString('en-IN',{minimumFractionDigits: 2})}</span>
                              </p>
                               <DialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                                    <Download className="h-4 w-4" />
                                  </Button>
                               </DialogTrigger>
                          </div>
                      </div>
                    </div>
                  ))}
                  {filteredTransactions.length === 0 && (
                      <p className="text-center text-gray-500 py-8">No transactions found.</p>
                  )}
                </CardContent>
              </Card>
        </div>
      </main>

      <footer className="p-4 sm:p-6 mt-8 border-t border-gray-800 text-center text-xs text-gray-500">
        <div className="flex justify-center gap-6 mb-2">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Support</a>
        </div>
        <p>© {new Date().getFullYear()} Nipher. All Rights Reserved.</p>
      </footer>
    </div>
    </Dialog>
  );
}
