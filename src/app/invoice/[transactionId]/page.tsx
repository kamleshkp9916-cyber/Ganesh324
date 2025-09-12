"use client";

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Logo } from '@/components/logo';
import { Printer, Download, ArrowLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Mock data based on your request
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

export default function InvoicePage({ params }: { params: { transactionId: string } }) {
    const router = useRouter();
    const invoiceRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPdf = async () => {
        const input = invoiceRef.current;
        if (input) {
            const canvas = await html2canvas(input, {
                 scale: 2, // Higher scale for better quality
                 backgroundColor: '#111827' // Match dark background
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
        <div className="min-h-screen bg-gray-900 text-gray-300 font-sans flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
             <style>{`
                @media print {
                    body {
                        background-color: #111827 !important;
                        -webkit-print-color-adjust: exact;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .invoice-container {
                        box-shadow: none !important;
                        border: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                }
            `}</style>

            <div className="w-full max-w-4xl mx-auto no-print">
                 <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Wallet
                </Button>
            </div>
            
            <div ref={invoiceRef} className="invoice-container w-full max-w-4xl bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-8">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                        <Logo className="h-8 w-auto text-white" />
                        <div>
                            <h1 className="text-2xl font-bold text-white">StreamCart Wallet</h1>
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
                    <p className="text-sm text-gray-500">If you have any questions about this invoice, contact support@streamcart.app</p>
                </div>
            </div>
            
            <div className="w-full max-w-4xl mx-auto mt-8 flex justify-between items-center no-print">
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
        </div>
    );
}