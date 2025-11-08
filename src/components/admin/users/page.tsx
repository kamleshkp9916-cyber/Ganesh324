
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
import { getUserData, UserData, updateUserData } from "@/lib/follow-data";
import { getFirestore, collection, query, where, getDocs,getCountFromServer } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { createImpersonationToken } from "@/ai/flows/impersonation-flow";
import { PAYOUT_REQUESTS_KEY } from "@/app/admin/settings/page";
import { useLocalStorage } from "@/hooks/use-local-storage";

const mockPayments = [
    { orderId: "#ORD5896", customer: { name: "Ganesh Prajapati" }, amount: 12500.00, status: 'holding' },
    { orderId: "#ORD5897", customer: { name: "Jane Doe" }, amount: 4999.00, status: 'released' },
    { orderId: "#ORD5903", customer: { name: "Jessica Rodriguez" }, amount: 4500.00, status: 'refunded' },
];

const mockPayouts = [
    { id: 1, sellerId: 'fashionfinds-uid', sellerName: 'FashionFinds', amount: 52340.50, status: 'pending', requestedAt: new Date().toISOString() },
    { id: 2, sellerId: 'gadgetguru-uid', sellerName: 'GadgetGuru', amount: 128900.00, status: 'paid', requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
];

const UserTable = ({ users, onViewDetails, onDelete, onMakeAdmin, onImpersonate }: { users: any[], onViewDetails: (user: any) => void, onDelete: (user: any) => void, onMakeAdmin: (user: any) => void, onImpersonate: (user: any) => void }) => {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    return (
    <>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead className="hidden md:table-cell">Signup Date</TableHead>
                    <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {users.map((u, index) => (
                    <TableRow key={index} className={u.role === 'admin' ? 'bg-primary/5' : ''}>
                        <TableCell>
                            <div className="font-medium">{u.name || u.displayName}</div>
                            <div className="text-sm text-muted-foreground">{u.email}</div>
                             {u.role === 'admin' && <Badge variant="destructive" className="mt-1">Admin</Badge>}
                        </TableCell>
                         <TableCell className="hidden md:table-cell">{isMounted ? new Date(u.date || Date.now()).toLocaleDateString() : '...'}</TableCell>
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
                                         <DropdownMenuItem onSelect={() => onImpersonate(u)}>
                                            <LogIn className="mr-2 h-4 w-4" />
                                            Login as User
                                        </DropdownMenuItem>
                                        {u.role !== 'admin' && (
                                            <DropdownMenuItem onSelect={() => onMakeAdmin(u)}>
                                                <ShieldAlert className="mr-2 h-4 w-4" />
                                                Make Admin
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator />
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
        <CardFooter className="px-0 pt-4">
            <div className="text-xs text-muted-foreground">
                Showing <strong>1-{users.length > 10 ? 10 : users.length}</strong> of <strong>{users.length}</strong> users
            </div>
        </CardFooter>
    </>
)};

export default function AdminUsersPage() {
  const { user, userData, loading } = useAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [allUsersState, setAllUsersState] = useState<any[]>([]);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [userToPromote, setUserToPromote] = useState<any | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isPromoteAlertOpen, setIsPromoteAlertOpen] = useState(false);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [payoutRequests, setPayoutRequests] = useLocalStorage<any[]>(PAYOUT_REQUESTS_KEY, []);

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
  
  const handleMakeAdminClick = (userToPromote: any) => {
      setUserToPromote(userToPromote);
      setIsPromoteAlertOpen(true);
  };

  const handleImpersonateUser = async (userToImpersonate: any) => {
    if (!user || user.uid === userToImpersonate.uid) {
        toast({ variant: 'destructive', title: "Cannot impersonate yourself."});
        return;
    }
    
    try {
        toast({ title: "Generating login token..." });
        const { token } = await createImpersonationToken(userToImpersonate.uid);
        
        localStorage.setItem('impersonationToken', token);
        localStorage.setItem('adminToken', await user.getIdToken()); 

        const newTab = window.open('/', '_blank');
        if (newTab) {
            newTab.focus();
        } else {
             toast({ variant: 'destructive', title: "Popup blocked", description: "Please allow popups for this site."});
        }
    } catch (error) {
        console.error("Impersonation error:", error);
        toast({ variant: 'destructive', title: "Impersonation Failed", description: "Could not log in as the selected user." });
    }
  }

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
  
  const confirmMakeAdmin = async () => {
      if (!userToPromote) return;
      await updateUserData(userToPromote.uid, { role: 'admin' });
      setAllUsersState(prev => prev.map(u => u.uid === userToPromote.uid ? { ...u, role: 'admin'} : u));
      toast({ title: "Success!", description: `${userToPromote.displayName} is now an administrator.` });
      setIsPromoteAlertOpen(false);
      setUserToPromote(null);
  };
  
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
     <AlertDialog open={isPromoteAlertOpen} onOpenChange={setIsPromoteAlertOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Confirm Admin Promotion</AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to grant administrator privileges to <strong className="px-1">{userToPromote?.displayName}</strong>? This action is irreversible.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmMakeAdmin}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-40">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <ShieldCheck className="h-6 w-6" />
            <span className="sr-only">StreamCart Admin</span>
          </Link>
          <Link
            href="/admin/dashboard"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/orders"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Orders
          </Link>
          <Link
            href="/admin/users"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Users
          </Link>
           <Link
            href="/admin/kyc"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            KYC
          </Link>
           <Link
            href="/admin/inquiries"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Inquiries
          </Link>
           <Link
            href="/admin/messages"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Messages
          </Link>
          <Link
            href="/admin/products"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Products
          </Link>
          <Link
            href="/admin/live-control"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Live Control
          </Link>
          <Link
            href="/admin/settings"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Settings
          </Link>
        </nav>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <nav className="grid gap-6 text-lg font-medium">
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <ShieldCheck className="h-6 w-6" />
                <span className="">Admin Panel</span>
              </Link>
              <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
              <Link
                href="/admin/orders"
                className="text-muted-foreground hover:text-foreground"
              >
                Orders
              </Link>
              <Link
                href="/admin/users"
                className="hover:text-foreground"
              >
                Users
              </Link>
               <Link
                href="/admin/kyc"
                className="text-muted-foreground hover:text-foreground"
              >
                KYC
              </Link>
              <Link
                href="/admin/inquiries"
                className="text-muted-foreground hover:text-foreground"
              >
                Inquiries
              </Link>
               <Link
                href="/admin/messages"
                className="text-muted-foreground hover:text-foreground"
              >
                Messages
              </Link>
               <Link
                href="/admin/products"
                className="text-muted-foreground hover:text-foreground"
              >
                Products
              </Link>
              <Link
                href="/admin/live-control"
                className="text-muted-foreground hover:text-foreground"
              >
                Live Control
              </Link>
              <Link
                href="/admin/settings"
                className="text-muted-foreground hover:text-foreground"
              >
                Settings
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <form className="ml-auto flex-1 sm:flex-initial" onSubmit={(e) => e.preventDefault()}>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </form>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                 <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.photoURL || 'https://placehold.co/40x40.png'} alt={user?.displayName || "Admin"} />
                    <AvatarFallback>{user?.displayName ? user.displayName.charAt(0) : 'A'}</AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => router.push('/profile')}>Profile</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push('/settings')}>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs defaultValue="customers">
            <div className="flex items-center justify-between">
                <TabsList>
                    <TabsTrigger value="customers">Customers ({customers.length})</TabsTrigger>
                    <TabsTrigger value="sellers">Sellers ({sellers.length})</TabsTrigger>
                    <TabsTrigger value="admins">Admins ({admins.length})</TabsTrigger>
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
                        <UserTable users={customers} onViewDetails={handleViewDetails} onDelete={handleDeleteUserClick} onMakeAdmin={handleMakeAdminClick} onImpersonate={handleImpersonateUser}/>
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
                        <UserTable users={sellers} onViewDetails={handleViewDetails} onDelete={handleDeleteUserClick} onMakeAdmin={handleMakeAdminClick} onImpersonate={handleImpersonateUser}/>
                    </CardContent>
                </Card>
             </TabsContent>
              <TabsContent value="admins">
                <Card>
                    <CardHeader className="px-7">
                        <CardTitle>Administrators</CardTitle>
                        <CardDescription>Manage all site administrators.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <UserTable users={admins} onViewDetails={handleViewDetails} onDelete={handleDeleteUserClick} onMakeAdmin={handleMakeAdminClick} onImpersonate={handleImpersonateUser}/>
                    </CardContent>
                </Card>
             </TabsContent>
              <TabsContent value="payments">
                <Card>
                    <CardHeader className="px-7">
                        <CardTitle>Payments</CardTitle>
                        <CardDescription>View all "on-hold", "released", and "refunded" payments.</CardDescription>
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
                                            {p.status === 'holding' && <Button variant="secondary" size="sm">Release Payment</Button>}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
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
                                                    <Button variant="default" size="sm" onClick={() => handlePayoutStatusChange(p.id, 'paid')}><CheckCircle className="mr-2 h-4 w-4" />Approve</Button>
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
    </div>
    </>
  )
}
