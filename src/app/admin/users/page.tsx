
"use client"

import {
  CircleUser,
  Menu,
  ShieldCheck,
  Search,
  MoreHorizontal,
  PlusCircle,
  File,
  CheckCircle,
  XCircle,
  Clock,
  Printer,
  Edit,
  Trash2,
  ShoppingBag,
  Eye,
  Wallet,
  Send,
  ShieldAlert,
  LogIn,
  DollarSign,
  Receipt,
  MessageSquare,
} from "lucide-react"
import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { useAuth } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuthActions } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast"
import { getUserData, UserData, updateUserData, getMockSellers } from "@/lib/follow-data";
import { getFirestore, collection, query, where, getDocs,getCountFromServer } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { AdminLayout } from "@/components/admin/admin-layout";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { Separator } from "@/components/ui/separator";
import { PAYOUT_REQUESTS_KEY } from "@/components/settings/promotions-settings";


const mockPayments = [
    { orderId: "#ORD5896", customer: { name: "Ganesh Prajapati" }, amount: 12500.00, status: 'holding' },
    { orderId: "#ORD5897", customer: { name: "Jane Doe" }, amount: 4999.00, status: 'released' },
    { orderId: "#ORD5903", customer: { name: "Jessica Rodriguez" }, amount: 4500.00, status: 'refunded' },
];

const mockPayouts = [
    { id: 1, sellerId: 'fashionfinds-uid', sellerName: 'FashionFinds', amount: 52340.50, status: 'pending', requestedAt: new Date().toISOString() },
    { id: 2, sellerId: 'gadgetguru-uid', sellerName: 'GadgetGuru', amount: 128900.00, status: 'paid', requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
];

const PayoutSummaryDialog = ({ payout, onConfirm, onCancel }: { payout: any, onConfirm: () => void, onCancel: () => void }) => {
    // Mock a separate super chat balance for this seller for calculation demonstration
    const mockSuperChatBalance = 1250.00;
    
    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Confirm Payout for {payout.sellerName}</DialogTitle>
                <DialogDescription>
                    Review the breakdown of available funds and confirm the total payout amount. Fees have already been deducted at the time of each transaction.
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
                <Button onClick={onConfirm}>Confirm &amp; Pay</Button>
            </DialogFooter>
        </DialogContent>
    );
};


const UserTable = ({ users, onViewDetails, onDelete }: { users: any[], onViewDetails: (user: any) => void, onDelete: (user: any) => void }) => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    if (users.length === 0) {
        return (
            <div className="text-center py-20 text-muted-foreground">
                <p>No users found in this category.</p>
            </div>
        );
    }

    return (
        <>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead className="hidden md:table-cell">Signup Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((u, index) => (
                        <TableRow key={index} className={u.role === 'admin' ? 'bg-primary/5' : ''}>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={u.photoURL} alt={u.displayName} />
                                        <AvatarFallback>{u.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{u.name || u.displayName}</div>
                                        <div className="text-sm text-muted-foreground">{u.email}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={u.role === 'admin' ? 'destructive' : u.role === 'seller' ? 'secondary' : 'outline'} className="capitalize">{u.role}</Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">{isMounted && u.createdAt ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <Button variant="outline" size="sm" onClick={() => onViewDetails(u)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem className="text-destructive" onSelect={() => onDelete(u)}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete Account
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <div className="text-xs text-muted-foreground mt-6 px-7">
                Showing <strong>{users.length}</strong> of <strong>{users.length}</strong> users
            </div>
        </>
    );
};

export default function AdminUsersPage() {
  const { user, userData, loading } = useAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [allUsersState, setAllUsersState] = useState<any[]>([]);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [payoutRequests, setPayoutRequests] = useLocalStorage<any[]>(PAYOUT_REQUESTS_KEY, []);
  const [selectedPayout, setSelectedPayout] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && payoutRequests.length === 0) {
        setPayoutRequests(mockPayouts);
    }
  }, [payoutRequests, setPayoutRequests]);

  const fetchUsers = async () => {
    const db = getFirestoreDb();
    const usersRef = collection(db, "users");
    const allUsersQuery = query(usersRef);
    const allUsersSnapshot = await getDocs(allUsersQuery);
    const usersList = allUsersSnapshot.docs.map(doc => ({ ...doc.data(), uid: doc.id }));
    setAllUsersState(usersList as UserData[]);
  };

  useEffect(() => {
    if (!loading && userData?.role === 'admin') {
      fetchUsers();
    }
  }, [user, userData, loading]);

  const filteredUsers = useMemo(() => {
    return allUsersState.filter(u =>
      (u.displayName && u.displayName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
    );
  }, [allUsersState, debouncedSearchTerm]);

  if (loading || !userData || userData.role !== 'admin') {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner />
        </div>
    )
  }
  
  const handleDeleteUserClick = (userToDelete: any) => {
      setUserToDelete(userToDelete);
      setIsDeleteAlertOpen(true);
  };
  
  const confirmDeleteUser = async () => {
      if (!userToDelete) return;
      toast({ title: `Deleting user ${userToDelete.displayName}...` });
      // In a real app, you would call a server function to delete the user
      console.log("Simulating deletion of user:", userToDelete.uid);
      setAllUsersState(prev => prev.filter(u => u.uid !== userToDelete.uid));
      toast({ title: "User Deleted", description: `${userToDelete.displayName} has been removed.` });
      setIsDeleteAlertOpen(false);
      setUserToDelete(null);
  }
  
  const handleViewDetails = (userToShow: any) => {
    router.push(`/admin/users/${userToShow.uid}`);
  };

  const handlePayoutStatusChange = (requestId: number, newStatus: 'paid' | 'rejected') => {
    const updatedRequests = payoutRequests.map(req => 
        req.id === requestId ? { ...req, status: newStatus } : req
    );
    setPayoutRequests(updatedRequests);
    toast({
        title: `Request ${newStatus === 'paid' ? 'Approved' : 'Rejected'}`,
        description: `The payout request has been updated.`,
    });
    setSelectedPayout(null);
  };

  const customers = filteredUsers.filter(u => u.role === 'customer');
  const sellers = filteredUsers.filter(u => u.role === 'seller');
  const admins = filteredUsers.filter(u => u.role === 'admin');

  return (
    <>
    <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the account for 
                    <strong className="px-1">{userToDelete?.displayName}</strong>
                    and all associated data.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDeleteUser} className={cn(buttonVariants({ variant: "destructive" }))}>
                    Delete
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    <Dialog open={!!selectedPayout} onOpenChange={(open) => !open && setSelectedPayout(null)}>
        {selectedPayout && (
            <PayoutSummaryDialog 
                payout={selectedPayout}
                onConfirm={() => handlePayoutStatusChange(selectedPayout.id, 'paid')}
                onCancel={() => setSelectedPayout(null)}
            />
        )}
    </Dialog>
    <AdminLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs defaultValue="customers">
            <div className="flex items-center justify-between">
                <TabsList>
                    <TabsTrigger value="customers">Customers ({customers.length})</TabsTrigger>
                    <TabsTrigger value="sellers">Sellers ({sellers.length})</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                    <TabsTrigger value="payouts">Payouts</TabsTrigger>
                </TabsList>
                 <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 gap-1">
                        <File className="h-3.5 w-3.5" />
                        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
                    </Button>
                </div>
            </div>
             <TabsContent value="customers">
                <Card>
                    <CardHeader className="px-7">
                        <CardTitle>Customers</CardTitle>
                        <CardDescription>Manage all customer accounts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UserTable users={customers} onViewDetails={handleViewDetails} onDelete={handleDeleteUserClick} />
                    </CardContent>
                </Card>
             </TabsContent>
             <TabsContent value="sellers">
                <Card>
                    <CardHeader className="px-7">
                        <CardTitle>Sellers</CardTitle>
                        <CardDescription>Manage all verified seller accounts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UserTable users={sellers} onViewDetails={handleViewDetails} onDelete={handleDeleteUserClick} />
                    </CardContent>
                </Card>
             </TabsContent>
              <TabsContent value="payments">
                <Card>
                    <CardHeader className="px-7">
                        <CardTitle>Order Payments</CardTitle>
                        <CardDescription>View the status of funds from customer orders.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader><TableRow><TableHead>Order ID</TableHead><TableHead>Customer</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {mockPayments.map(p => (
                                    <TableRow key={p.orderId}>
                                        <TableCell>{p.orderId}</TableCell>
                                        <TableCell>{p.customer.name}</TableCell>
                                        <TableCell>₹{p.amount.toFixed(2)}</TableCell>
                                        <TableCell><Badge variant={p.status === 'holding' ? 'warning' : p.status === 'released' ? 'success' : 'destructive'}>{p.status}</Badge></TableCell>
                                        <TableCell>
                                            {p.status === 'holding' && <Button variant="secondary" size="sm" disabled>Release Funds</Button>}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         <p className="text-xs text-muted-foreground mt-4">Funds are automatically released to a seller's withdrawable balance 7 days after an order is successfully delivered.</p>
                    </CardContent>
                </Card>
             </TabsContent>
             <TabsContent value="payouts">
                <Card>
                    <CardHeader className="px-7">
                        <CardTitle>Payouts</CardTitle>
                        <CardDescription>Approve or deny seller withdrawal requests.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Table>
                            <TableHeader><TableRow><TableHead>Seller</TableHead><TableHead>Amount Requested</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead></TableRow></TableHeader>
                            <TableBody>
                                {payoutRequests.map(p => (
                                    <TableRow key={p.id}>
                                        <TableCell>{p.sellerName}</TableCell>
                                        <TableCell>₹{p.amount.toFixed(2)}</TableCell>
                                        <TableCell><Badge variant={p.status === 'pending' ? 'warning' : p.status === 'paid' ? 'success' : 'destructive'}>{p.status}</Badge></TableCell>
                                        <TableCell>
                                            {p.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <Button variant="default" size="sm" onClick={() => setSelectedPayout(p)}>
                                                        <CheckCircle className="mr-2 h-4 w-4" />Approve
                                                    </Button>
                                                    <Button variant="destructive" size="sm" onClick={() => handlePayoutStatusChange(p.id, 'rejected')}><XCircle className="mr-2 h-4 w-4" />Deny</Button>
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
             </TabsContent>
        </Tabs>
      </main>
    </AdminLayout>
    </>
  )
}

    