"use client"

import React, { useState, useMemo, useEffect } from 'react';
import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { File, ListFilter, Search, Calendar as CalendarIcon, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { getTransactions, Transaction } from '@/lib/transaction-history';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isWithinInterval, addDays } from 'date-fns';
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
} from "@/components/ui/alert-dialog"

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

    useEffect(() => {
        setIsClient(true);
        const storedTransactions = getTransactions();
        // Add a mock refund if none exists
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

        if (date?.from && date?.to) {
            tempTransactions = tempTransactions.filter(t => {
                const transactionDate = parseISO(t.date);
                return isWithinInterval(transactionDate, { start: date.from!, end: date.to! });
            });
        }

        if (debouncedSearchTerm) {
            const lowercasedQuery = debouncedSearchTerm.toLowerCase();
            tempTransactions = tempTransactions.filter(t =>
                t.transactionId.toLowerCase().includes(lowercasedQuery) ||
                t.description.toLowerCase().includes(lowercasedQuery)
            );
        }
        
        return tempTransactions;
    }, [transactions, statusFilter, typeFilter, debouncedSearchTerm, date]);
    
    const handleExportCSV = () => {
        if (filteredTransactions.length === 0) {
            toast({ title: "No data to export", variant: "destructive" });
            return;
        }

        const headers = ["ID", "Transaction ID", "Type", "Description", "Date", "Time", "Amount", "Status"];
        const rows = filteredTransactions.map(t => [
            t.id,
            t.transactionId,
            t.type,
            `"${t.description.replace(/"/g, '""')}"`,
            t.date,
            t.time,
            t.amount,
            t.status
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
                              placeholder="Search by ID or description..."
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
                                    <TableHead>Type</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isClient && filteredTransactions.length > 0 ? (
                                    filteredTransactions.map(t => (
                                        <TableRow key={t.id}>
                                            <TableCell className="font-mono text-xs">{t.transactionId}</TableCell>
                                            <TableCell><Badge variant="outline">{t.type}</Badge></TableCell>
                                            <TableCell>{t.description}</TableCell>
                                            <TableCell>{format(parseISO(t.date), 'dd MMM, yyyy, p')}</TableCell>
                                            <TableCell>
                                                <Badge variant={t.status === 'Completed' ? 'success' : t.status === 'Processing' ? 'warning' : 'destructive'}>{t.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                <span className={t.amount > 0 ? 'text-green-600' : 'text-foreground'}>
                                                    {t.amount > 0 ? '+' : ''}{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(t.amount)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {t.type === 'Refund' && t.status === 'Processing' && (
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="secondary" size="sm" onClick={() => setManagingRefund(t)}>Manage</Button>
                                                    </AlertDialogTrigger>
                                                )}
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
                            Showing <strong>{filteredTransactions.length}</strong> transactions
                        </div>
                    </CardFooter>
                </Card>
            </main>
            {managingRefund && <RefundDialog transaction={managingRefund} onApprove={handleApproveRefund} onReject={handleRejectRefund} />}
        </AdminLayout>
        </AlertDialog>
    );
}