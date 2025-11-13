
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

const InvoicePage = ({ transaction }: { transaction: typeof initialTransactions[0] }) => {
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
        <div className="p-4 sm:p-6 lg:p-8">
            <div ref={invoiceRef} id="printable-order" className="invoice-container w-full max-w-4xl mx-auto bg-gray-900 text-gray-300 p-8 rounded-lg shadow-2xl">
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
             <div className="w-full max-w-4xl mx-auto mt-6 flex justify-between items-center no-print">
                 <p className="text-sm text-muted-foreground">Thank you for your purchase.</p>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                    </Button>
                    <Button onClick={handleDownloadPdf} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </Button>
                </div>
            </div>
        </div>
    );
};


export default function InvoiceWrapperPage({ params }: { params: { transactionId: string }}) {
  const router = useRouter();
  const { user, userData, loading } = useAuth();
  const { transactionId } = params;

  const transaction = initialTransactions.find(t => t.transactionId === transactionId);

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-background"><LoadingSpinner /></div>;
  }

  if (!user || !userData) {
    router.push('/');
    return null;
  }
  
  if(!transaction) {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-background">
            <p>Invoice not found.</p>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
       <header className="p-4 sm:p-6 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b no-print">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
           </Button>
          <h1 className="text-xl font-bold text-foreground">Invoice</h1>
        </div>
      </header>
      <InvoicePage transaction={transaction} />
    </div>
  );
}
