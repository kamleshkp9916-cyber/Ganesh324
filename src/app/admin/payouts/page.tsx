
"use client";

import {
  Banknote,
  CheckCircle,
  File,
  Loader2,
  MoreHorizontal,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { PAYOUT_REQUESTS_KEY } from "@/components/settings/promotions-settings";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const mockPayouts = [
  { id: 1, sellerId: "fashionfinds-uid", sellerName: "FashionFinds", amount: 52340.5, status: "pending", requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 2, sellerId: "gadgetguru-uid", sellerName: "GadgetGuru", amount: 128900.0, status: "paid", requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), paidAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  { id: 3, sellerId: "homehaven-uid", sellerName: "HomeHaven", amount: 23000.0, status: "pending", requestedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: 4, sellerId: "beautybox-uid", sellerName: "BeautyBox", amount: 78000.0, status: "rejected", requestedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), reason: "Invalid bank details" },
];

const PayoutSummaryDialog = ({ payout, onConfirm, onCancel }: { payout: any, onConfirm: () => void, onCancel: () => void }) => {
    const mockSuperChatBalance = 1250.00;
    
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Confirm Payout for {payout.sellerName}</DialogTitle>
                <DialogDescription>
                    Review the breakdown and confirm the total payout amount.
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-muted/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl font-bold">₹{payout.amount.toFixed(2)}</CardTitle>
                            <CardDescription>From Product Sales</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="bg-muted/30">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl font-bold">₹{mockSuperChatBalance.toFixed(2)}</CardTitle>
                            <CardDescription>From Super Chats</CardDescription>
                        </CardHeader>
                    </Card>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center text-base font-bold">
                        <span>Net Payout Amount</span>
                        <span>₹{(payout.amount + mockSuperChatBalance).toFixed(2)}</span>
                    </div>
                     <p className="text-xs text-muted-foreground">This is the final amount that will be transferred to the seller's bank account.</p>
                </div>
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button onClick={onConfirm}>Confirm & Pay</Button>
            </DialogFooter>
        </DialogContent>
    );
};

export default function PayoutsPage() {
  const [payoutRequests, setPayoutRequests] = useLocalStorage<any[]>(PAYOUT_REQUESTS_KEY, []);
  const [selectedPayout, setSelectedPayout] = useState<any | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined' && payoutRequests.length === 0) {
        setPayoutRequests(mockPayouts);
    }
  }, [payoutRequests, setPayoutRequests]);

  const handlePayoutStatusChange = (requestId: number, newStatus: 'paid' | 'rejected') => {
    const updatedRequests = payoutRequests.map(req => 
        req.id === requestId ? { ...req, status: newStatus, ...(newStatus === 'paid' && { paidAt: new Date() }) } : req
    );
    setPayoutRequests(updatedRequests);
    toast({
        title: `Request ${newStatus === 'paid' ? 'Approved' : 'Rejected'}`,
        description: `The payout request has been updated.`,
    });
    setSelectedPayout(null);
  };
  
  const handleExport = () => {
    const dataToExport = payoutRequests;
    if (dataToExport.length === 0) {
        toast({ title: "No Data", description: "There is no data to export.", variant: "destructive"});
        return;
    }

    const headers = ["id", "sellerName", "amount", "status", "requestedAt", "paidAt", "reason"];
    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(","), ...dataToExport.map(item => headers.map(header => JSON.stringify(item[header])).join(","))].join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "payouts_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pendingPayouts = payoutRequests.filter(p => p.status === 'pending');
  const completedPayouts = payoutRequests.filter(p => p.status !== 'pending');

  return (
    <Dialog open={!!selectedPayout} onOpenChange={(open) => !open && setSelectedPayout(null)}>
        <AdminLayout>
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <Tabs defaultValue="pending">
                    <div className="flex items-center justify-between">
                        <TabsList>
                            <TabsTrigger value="pending">Pending Requests ({pendingPayouts.length})</TabsTrigger>
                            <TabsTrigger value="history">History ({completedPayouts.length})</TabsTrigger>
                        </TabsList>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
                                <File className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
                            </Button>
                        </div>
                    </div>
                    <TabsContent value="pending" className="mt-4">
                        <Card>
                             <CardHeader className="px-7">
                                <CardTitle>Pending Payout Requests</CardTitle>
                                <CardDescription>Approve or deny seller withdrawal requests.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader><TableRow><TableHead>Seller</TableHead><TableHead>Amount</TableHead><TableHead>Date Requested</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {pendingPayouts.length > 0 ? pendingPayouts.map(p => (
                                            <TableRow key={p.id}>
                                                <TableCell>{p.sellerName}</TableCell>
                                                <TableCell>₹{p.amount.toFixed(2)}</TableCell>
                                                <TableCell>{new Date(p.requestedAt).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button variant="default" size="sm" onClick={() => setSelectedPayout(p)}>
                                                            <CheckCircle className="mr-2 h-4 w-4" />Approve
                                                        </Button>
                                                        <Button variant="destructive" size="sm" onClick={() => handlePayoutStatusChange(p.id, 'rejected')}><XCircle className="mr-2 h-4 w-4" />Deny</Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center h-24">
                                                    No pending payout requests.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="history" className="mt-4">
                        <Card>
                             <CardHeader className="px-7">
                                <CardTitle>Payout History</CardTitle>
                                <CardDescription>A log of all completed and rejected payout requests.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader><TableRow><TableHead>Seller</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Date Requested</TableHead><TableHead>Date Paid</TableHead></TableRow></TableHeader>
                                    <TableBody>
                                        {completedPayouts.length > 0 ? completedPayouts.map(p => (
                                            <TableRow key={p.id}>
                                                <TableCell>{p.sellerName}</TableCell>
                                                <TableCell>₹{p.amount.toFixed(2)}</TableCell>
                                                <TableCell><Badge variant={p.status === 'paid' ? 'success' : 'destructive'}>{p.status}</Badge></TableCell>
                                                <TableCell>{new Date(p.requestedAt).toLocaleDateString()}</TableCell>
                                                <TableCell>{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : 'N/A'}</TableCell>
                                            </TableRow>
                                        )) : (
                                             <TableRow>
                                                <TableCell colSpan={5} className="text-center h-24">
                                                    No completed payout requests found.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </AdminLayout>
        {selectedPayout && (
            <PayoutSummaryDialog 
                payout={selectedPayout}
                onConfirm={() => handlePayoutStatusChange(selectedPayout.id, 'paid')}
                onCancel={() => setSelectedPayout(null)}
            />
        )}
    </Dialog>
  );
}
