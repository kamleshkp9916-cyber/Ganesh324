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
import { format, parseISO, isWithinInterval } from 'date-fns';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Link from 'next/link';
import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext } from '@/components/ui/pagination';
import { Logo } from '@/components/logo';
import { Separator } from '@/components/ui/separator';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
    return (
        <DialogContent className="max-w-4xl p-0" id="printable-order">
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
            <div ref={ref} className="bg-background text-foreground p-8 rounded-lg">
                 <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                        <Logo className="h-8 w-auto" />
                        <div>
                            <h1 className="text-2xl font-bold">Nipher</h1>
                            <p className="text-sm text-muted-foreground">Invoice</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground">Invoice No.</p>
                        <p className="font-semibold">{transaction.transactionId}</p>
                        <p className="text-sm text-muted-foreground mt-2">Date</p>
                        <p className="font-semibold">{format(parseISO(transaction.date), "dd MMM, yyyy")}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                    <Card className="p-4"><h2 className="text-sm font-semibold text-muted-foreground mb-2">Billed To</h2><p className="font-bold">{transaction.buyerName || 'N/A'}</p></Card>
                    <Card className="p-4"><h2 className="text-sm font-semibold text-muted-foreground mb-2">Paid Via</h2><p className="font-bold">{transaction.paymentMethodDetails || 'N/A'}</p><p className="text-sm text-muted-foreground">Transaction {transaction.transactionId}</p></Card>
                </div>
                
                 <Table>
                    <TableHeader><TableRow><TableHead>Description</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                    <TableBody><TableRow><TableCell>{transaction.description}</TableCell><TableCell className="text-right">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(transaction.amount)}</TableCell></TableRow></TableBody>
                </Table>
                
                 <div className="flex justify-end mt-8">
                    <div className="w-full max-w-sm space-y-3">
                        <div className="flex justify-between items-center font-bold text-lg"><span>Total Paid</span><span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(transaction.amount)}</span></div>
                    </div>
                </div>
                 <Separator className="my-8" />
                 <p className="text-sm text-muted-foreground">If you have any questions about this invoice, contact support@nipher.in</p>
            </div>
            <div className="flex justify-end p-6 pt-0 gap-2 no-print">
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