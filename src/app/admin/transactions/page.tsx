
"use client"

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { File, ListFilter, Search, Calendar as CalendarIcon, MoreVertical, Link as LinkIcon, Undo2, Printer, Download, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { getTransactions, Transaction } from '@/lib/transaction-history';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isWithinInterval, addDays, type DateRange } from 'date-fns';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import Link from 'next/link';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import { Logo } from '@/components/logo';
import { Separator } from '@/components/ui/separator';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { ScrollArea } from '@/components/ui/scroll-area';

const RefundDialog = ({ transaction, onApprove, onReject }: { transaction: Transaction, onApprove: (id: string) => void, onReject: (id: string) => void }) => {
    const [reason, setReason] = useState("");

    return (
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Manage Refund for {transaction.transactionId}</AlertDialogTitle>
                <AlertDialogDescription>
                    Review the details and approve or reject this refund request.
                </AlertDialogDescription>
            </AlertDialogHeader>
             <div className="py-4 space-y-2">
                <p className="text-sm"><strong>Amount:</strong> {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(transaction.amount)}</p>
                <p className="text-sm"><strong>Reason:</strong> {transaction.description}</p>
                <p className="text-sm"><strong>Date:</strong> {format(parseISO(transaction.date), 'dd MMM, yyyy, p')}</p>
                 <Input 
                    placeholder="Optional: Reason for rejection..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
            </div>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onReject(transaction.transactionId)} className={cn("bg-destructive text-destructive-foreground hover:bg-destructive/90")} disabled={!reason}>Reject</AlertDialogAction>
                <AlertDialogAction onClick={() => onApprove(transaction.transactionId)}>Approve</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    )
}

const InvoiceComponent = React.forwardRef<HTMLDivElement, { transaction: Transaction, onPrint: () => void, onDownload: () => void }>(({ transaction, onPrint, onDownload }, ref) => {
    
    const getStatusInfo = () => {
        switch(transaction.status) {
            case 'Completed':
                return { text: transaction.type === 'Refund' ? 'Refunded' : 'Paid', color: 'text-green-600 bg-green-500/10' };
            case 'Processing':
                return { text: 'Processing', color: 'text-amber-600 bg-amber-500/10' };
            case 'Failed':
                return { text: 'Failed', color: 'text-red-600 bg-red-500/10' };
            default:
                 return { text: 'Unknown', color: 'text-gray-600 bg-gray-500/10' };
        }
    }
    const statusInfo = getStatusInfo();

    const isOrder = transaction.type === 'Order';
    const shippingFee = isOrder ? 50.00 : 0;
    const subtotal = isOrder ? Math.abs(transaction.amount) - shippingFee : Math.abs(transaction.amount);
    const tax = isOrder ? subtotal * 0.05 : 0;
    const total = subtotal + shippingFee + tax;


    return (
        <DialogContent className="max-w-3xl p-0" id="printable-order">
             <style>
                {`
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
                    }
                    .no-print {
                        display: none !important;
                    }
                }
                `}
            </style>
             <ScrollArea className="max-h-[85vh]">
                <div ref={ref} className="bg-background text-foreground p-8 rounded-lg">
                     <div className="flex justify-between items-start mb-8">
                        <div>
                            <h1 className="text-3xl font-bold">INVOICE</h1>
                            <p className="text-muted-foreground">{transaction.transactionId}</p>
                            <div className={cn("mt-2 font-semibold text-lg inline-flex items-center px-4 py-1 rounded-full", statusInfo.color)}>
                                {statusInfo.text}
                            </div>
                        </div>
                        <Logo className="h-10 w-auto" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-8 mb-8 text-sm">
                        <div>
                            <h2 className="font-semibold text-muted-foreground mb-1">Issued</h2>
                            <p>{format(parseISO(transaction.date), "dd MMM, yyyy")}</p>
                        </div>
                        <div>
                            <h2 className="font-semibold text-muted-foreground mb-1">Due</h2>
                            <p>{format(addDays(parseISO(transaction.date), 15), "dd MMM, yyyy")}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-8 mb-8 text-sm">
                        <div className="space-y-1">
                            <h2 className="font-semibold text-muted-foreground mb-1">Billed to</h2>
                            <p className="font-bold">{transaction.buyerName || 'N/A'}</p>
                            <p>123 Customer Lane</p>
                            <p>City, Country - 00000</p>
                            <p>+0 (000) 123-4567</p>
                        </div>
                        <div className="space-y-1">
                            <h2 className="font-semibold text-muted-foreground mb-1">From</h2>
                            <p className="font-bold">Nipher Inc.</p>
                            <p>456 Business Road</p>
                            <p>City, State, IN - 000 000</p>
                            <p>TAX ID: D0XXXXXX1234XDXX</p>
                        </div>
                    </div>
                    
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service</TableHead>
                                <TableHead className="text-center">Qty</TableHead>
                                <TableHead className="text-right">Rate</TableHead>
                                <TableHead className="text-right">Line Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>
                                    <p className="font-medium">{transaction.description}</p>
                                    {transaction.orderId && <p className="text-xs text-muted-foreground">Order ID: {transaction.orderId}</p>}
                                </TableCell>
                                <TableCell className="text-center">1</TableCell>
                                <TableCell className="text-right">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(subtotal)}</TableCell>
                                <TableCell className="text-right">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(subtotal)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    
                    <div className="flex justify-end mt-8">
                        <div className="w-full max-w-sm space-y-3">
                            <div className="flex justify-between items-center"><span className="text-muted-foreground">Subtotal</span><span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(subtotal)}</span></div>
                            {isOrder && <div className="flex justify-between items-center"><span className="text-muted-foreground">Shipping</span><span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(shippingFee)}</span></div>}
                            {isOrder && <div className="flex justify-between items-center"><span className="text-muted-foreground">Tax (5%)</span><span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(tax)}</span></div>}
                            <Separator />
                            <div className="flex justify-between items-center font-bold text-lg">
                                <span>{transaction.type === 'Refund' ? 'Amount Refunded' : 'Total'}</span>
                                <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(isOrder ? total : Math.abs(transaction.amount))}</span>
                            </div>
                            {transaction.status === 'Failed' && (
                                 <div className="flex justify-between items-center text-destructive font-bold text-lg p-2 bg-destructive/10 rounded-md"><span>Payment Failed</span></div>
                            )}
                        </div>
                    </div>

                    <div className="mt-12 text-sm text-muted-foreground">
                        {transaction.status === 'Completed' ? (
                            <>
                                <p className="font-semibold">Payment Successful</p>
                                <p>Thank you for your business!</p>
                            </>
                        ) : transaction.status === 'Failed' ? (
                            <>
                                <p className="font-semibold text-destructive">Payment Attempt Failed</p>
                                <p>No funds were debited from your account.</p>
                            </>
                        ) : transaction.type === 'Refund' && transaction.status === 'Completed' ? (
                            <>
                                <p className="font-semibold">Refund Processed</p>
                                <p>The amount has been returned to the original payment method.</p>
                            </>
                        ) : (
                             <p>Please pay within 15 days of receiving this invoice.</p>
                        )}
                    </div>

                    <Separator className="my-8" />
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Digital Product Designer, IN</span>
                        <div className="flex gap-4">
                            <span>+91 00000 00000</span>
                            <span>hello@email.com</span>
                        </div>
                    </div>
                </div>
             </ScrollArea>
            <div className="flex justify-end p-6 pt-0 gap-2 no-print border-t">
                <Button variant="outline" onClick={onPrint}><Printer className="mr-2 h-4 w-4"/> Print</Button>
                <Button onClick={onDownload}><Download className="mr-2 h-4 w-4"/> Download PDF</Button>
            </div>
        </DialogContent>
    );
});
InvoiceComponent.displayName = 'InvoiceComponent';


export default function AdminTransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [statusFilter, setStatusFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const { toast } = useToast();
    const [date, setDate] = React.useState<DateRange | undefined>(undefined);
    const [managingRefund, setManagingRefund] = useState<Transaction | null>(null);
    const [viewingInvoice, setViewingInvoice] = useState<Transaction | null>(null);
    const invoiceRef = useRef<HTMLDivElement>(null);


    const [currentPage, setCurrentPage] = useState(1);
    const TRANSACTIONS_PER_PAGE = 20;

    useEffect(() => {
        setIsClient(true);
        const storedTransactions = getTransactions();
        
        if (!storedTransactions.some(t => t.type === 'Refund' && t.status === 'Processing')) {
             const mockRefund = {
                id: Date.now(),
                transactionId: 'REF-MOCK123',
                type: 'Refund' as const,
                description: 'Customer request - wrong item',
                date: new Date().toISOString(),
                time: new Date().toLocaleTimeString(),
                amount: 1500.00,
                status: 'Processing' as const,
            };
            storedTransactions.unshift(mockRefund);
        }
        setTransactions(storedTransactions);
    }, []);
    
    const handleDownload = async () => {
        const input = invoiceRef.current;
        if (input) {
            html2canvas(input, { scale: 2, backgroundColor: null }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`invoice-${viewingInvoice?.transactionId}.pdf`);
            });
        }
    };
    
    const handlePrint = () => {
        window.print();
    }


    const handleApproveRefund = (id: string) => {
        setTransactions(prev => prev.map(t => t.transactionId === id ? { ...t, status: 'Completed' } : t));
        toast({ title: "Refund Approved", description: `Transaction ${id} has been marked as completed.`});
        setManagingRefund(null);
    };

    const handleRejectRefund = (id: string) => {
        setTransactions(prev => prev.map(t => t.transactionId === id ? { ...t, status: 'Failed' } : t));
        toast({ title: "Refund Rejected", description: `Transaction ${id} has been marked as failed.`, variant: "destructive"});
        setManagingRefund(null);
    };

    const filteredTransactions = useMemo(() => {
        let tempTransactions = transactions;
        
        if (statusFilter !== "All") {
            tempTransactions = tempTransactions.filter(t => t.status === statusFilter);
        }
        if (typeFilter !== "All") {
            tempTransactions = tempTransactions.filter(t => t.type === typeFilter);
        }

        if (date?.from) {
             const toDate = date.to ? date.to : date.from; // If only one date is selected, treat it as a single-day range
             tempTransactions = tempTransactions.filter(t => {
                const transactionDate = parseISO(t.date);
                return isWithinInterval(transactionDate, { start: date.from!, end: toDate });
            });
        }

        if (debouncedSearchTerm) {
            const lowercasedQuery = debouncedSearchTerm.toLowerCase();
            tempTransactions = tempTransactions.filter(t =>
                t.transactionId.toLowerCase().includes(lowercasedQuery) ||
                t.description.toLowerCase().includes(lowercasedQuery) ||
                t.orderId?.toLowerCase().includes(lowercasedQuery) ||
                t.buyerName?.toLowerCase().includes(lowercasedQuery)
            );
        }
        
        return tempTransactions;
    }, [transactions, statusFilter, typeFilter, debouncedSearchTerm, date]);
    
    const totalPages = Math.ceil(filteredTransactions.length / TRANSACTIONS_PER_PAGE);

    const paginatedTransactions = useMemo(() => {
        const startIndex = (currentPage - 1) * TRANSACTIONS_PER_PAGE;
        const endIndex = startIndex + TRANSACTIONS_PER_PAGE;
        return filteredTransactions.slice(startIndex, endIndex);
    }, [filteredTransactions, currentPage]);

    const handlePageChange = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };


    const handleExportCSV = () => {
        if (filteredTransactions.length === 0) {
            toast({ title: "No data to export", variant: "destructive" });
            return;
        }

        const headers = ["ID", "Transaction ID", "Order ID", "Buyer", "Type", "Description", "Date", "Time", "Amount", "Status", "Reason", "Payment Info", "Refund ID"];
        const rows = filteredTransactions.map(t => [
            t.id,
            t.transactionId,
            t.orderId || 'N/A',
            t.buyerName || 'N/A',
            t.type,
            `"${t.description.replace(/"/g, '""')}"`,
            t.date,
            t.time,
            t.amount,
            t.status,
            t.reasonForFailure || 'N/A',
            t.paymentMethodDetails || 'N/A',
            t.refundId || 'N/A',
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `transactions_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AlertDialog>
        <Dialog open={!!viewingInvoice} onOpenChange={(open) => !open && setViewingInvoice(null)}>
        <AdminLayout>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <CardTitle>Transactions</CardTitle>
                                <CardDescription>A complete log of all financial transactions across the platform.</CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                 <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        id="date"
                                        variant={"outline"}
                                        size="sm"
                                        className={cn(
                                          "h-8 gap-1 w-[240px] justify-start text-left font-normal",
                                          !date && "text-muted-foreground"
                                        )}
                                      >
                                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                                        {date?.from ? (
                                          date.to ? (
                                            <>
                                              {format(date.from, "LLL dd, y")} -{" "}
                                              {format(date.to, "LLL dd, y")}
                                            </>
                                          ) : (
                                            format(date.from, "LLL dd, y")
                                          )
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="end">
                                        <div className="p-2 border-b">
                                            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setDate(undefined)}>Clear</Button>
                                        </div>
                                      <Calendar
                                        initialFocus
                                        mode="range"
                                        defaultMonth={date?.from}
                                        selected={date}
                                        onSelect={setDate}
                                        numberOfMonths={2}
                                      />
                                    </PopoverContent>
                                  </Popover>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="h-8 gap-1">
                                            <ListFilter className="h-3.5 w-3.5" />
                                            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Filter</span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                                            <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="Completed">Completed</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="Processing">Processing</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="Failed">Failed</DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                         <DropdownMenuRadioGroup value={typeFilter} onValueChange={setTypeFilter}>
                                            <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="Order">Order</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="Refund">Refund</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="Deposit">Deposit</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="Withdrawal">Withdrawal</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="Bid">Bid</DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExportCSV}>
                                    <File className="h-3.5 w-3.5" />
                                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
                                </Button>
                            </div>
                        </div>
                        <div className="relative mt-4">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="search"
                              placeholder="Search by ID, buyer, or description..."
                              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-full"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Transaction ID</TableHead>
                                    <TableHead>Buyer</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Reason</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isClient && paginatedTransactions.length > 0 ? (
                                    paginatedTransactions.map(t => (
                                        <TableRow key={t.id}>
                                            <TableCell>
                                                <p className="font-mono text-xs">{t.transactionId}</p>
                                                {t.orderId && <p className="text-xs text-muted-foreground">Order: <Link href={`/admin/orders?search=${t.orderId}`} className="hover:underline">{t.orderId}</Link></p>}
                                            </TableCell>
                                            <TableCell>{t.buyerName || 'N/A'}</TableCell>
                                            <TableCell className={cn("font-medium", t.amount > 0 ? 'text-green-600' : 'text-foreground')}>
                                                {t.amount > 0 ? '+' : ''}{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(t.amount)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={t.status === 'Completed' ? 'success' : t.status === 'Processing' ? 'warning' : 'destructive'}>{t.status}</Badge>
                                            </TableCell>
                                             <TableCell className="text-xs">{t.reasonForFailure || '-'}</TableCell>
                                            <TableCell>{format(parseISO(t.date), 'dd MMM, yyyy, p')}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button size="icon" variant="ghost">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuLabel>Details</DropdownMenuLabel>
                                                        <DropdownMenuItem disabled>{t.paymentMethodDetails || 'No details'}</DropdownMenuItem>
                                                        {t.refundId && <DropdownMenuItem disabled>Refund ID: {t.refundId}</DropdownMenuItem>}
                                                        <DropdownMenuSeparator />
                                                         {t.type === 'Refund' && t.status === 'Processing' && (
                                                            <AlertDialogTrigger asChild>
                                                                <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setManagingRefund(t); }}>
                                                                    <Undo2 className="mr-2 h-4 w-4"/>
                                                                    Manage Refund
                                                                </DropdownMenuItem>
                                                            </AlertDialogTrigger>
                                                        )}
                                                         <DialogTrigger asChild>
                                                            <DropdownMenuItem onSelect={() => setViewingInvoice(t)}>
                                                                <LinkIcon className="mr-2 h-4 w-4" /> View Invoice
                                                            </DropdownMenuItem>
                                                         </DialogTrigger>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center">
                                            {isClient ? 'No transactions found.' : 'Loading transactions...'}
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                         <div className="text-xs text-muted-foreground">
                            Showing <strong>{paginatedTransactions.length}</strong> of <strong>{filteredTransactions.length}</strong> transactions
                        </div>
                        {totalPages > 1 && (
                            <Pagination className="ml-auto mr-0 w-auto">
                                <PaginationContent>
                                    <PaginationItem>
                                        <Button variant="outline" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>Previous</Button>
                                    </PaginationItem>
                                     <PaginationItem>
                                        <span className="p-2 text-sm font-medium">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                    </PaginationItem>
                                    <PaginationItem>
                                        <Button variant="outline" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>Next</Button>
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </CardFooter>
                </Card>
            </main>
            {managingRefund && <RefundDialog transaction={managingRefund} onApprove={handleApproveRefund} onReject={handleRejectRefund} />}
            {viewingInvoice && <InvoiceComponent ref={invoiceRef} transaction={viewingInvoice} onPrint={handlePrint} onDownload={handleDownload} />}
        </AdminLayout>
        </Dialog>
        </AlertDialog>
    );
}
