
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
} from "lucide-react"
import { useEffect, useState } from "react";
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
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
import { useAuth } from "@/hooks/use-auth.tsx"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuthActions } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast"
import { getUserData, updateUserData } from "@/lib/follow-data";
import { Separator } from "@/components/ui/separator";

const ADMIN_EMAIL = "samael.prajapati@example.com";

const allUsers = [
    { name: "Ganesh Prajapati", email: "ganesh@example.com", role: "Seller", date: "2023-07-15", verificationStatus: 'verified' },
    { name: "Jane Doe", email: "jane.d@example.com", role: "Customer", date: "2023-07-15", verificationStatus: 'verified' },
    { name: "Alex Smith", email: "alex.s@example.com", role: "Customer", date: "2023-07-14", verificationStatus: 'verified' },
    { name: "Emily Brown", email: "emily.b@example.com", role: "Customer", date: "2023-07-12", verificationStatus: 'verified' },
    { name: "Chris Wilson", email: "chris.w@example.com", role: "Seller", date: "2023-07-10", verificationStatus: 'verified' },
    { name: "Sarah Miller", email: "sarah.m@example.com", role: "Customer", date: "2023-07-09", verificationStatus: 'verified' },
    { name: "David Garcia", email: "david.g@example.com", role: "Customer", date: "2023-07-09", verificationStatus: 'verified' },
    { name: "Laura Williams", email: "laura.w@example.com", role: "Seller", date: "2023-07-08", verificationStatus: 'verified' },
    { name: "Peter Jones", email: "peter.j@example.com", role: "Customer", date: "2023-07-07", verificationStatus: 'verified' },
    { name: "Michael Chen", email: "michael.c@example.com", role: "Customer", date: "2023-07-05", verificationStatus: 'verified' },
];

const SellerDetailDialog = ({ seller, onClose }: { seller: any, onClose: () => void }) => {
    const handlePrint = () => {
        window.print();
    };
    
    const photoSrc = seller.passportPhoto?.preview || seller.passportPhoto;

    return (
        <DialogContent className="max-w-3xl p-0" id="printable-area">
             <style>
                {`
                @media print {
                    body * { visibility: hidden; }
                    #printable-area, #printable-area * { visibility: visible; }
                    #printable-area { position: absolute; left: 0; top: 0; width: 100%; }
                    .no-print { display: none; }
                }
                `}
            </style>
            <DialogHeader className="p-6 pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <DialogTitle className="text-2xl">Seller Application Details</DialogTitle>
                        <DialogDescription>Review the information submitted by the applicant.</DialogDescription>
                    </div>
                     <Button onClick={handlePrint} variant="outline" size="sm" className="no-print">
                        <Printer className="h-4 w-4 mr-2" />
                        Print
                    </Button>
                </div>
            </DialogHeader>
            <div className="px-6 py-4 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <h3 className="font-semibold text-lg mb-2 border-b pb-2">Applicant Photo</h3>
                         <div className="mt-2 relative w-32 h-32 rounded-lg border bg-muted">
                           {photoSrc && typeof photoSrc === 'string' ? <Image src={photoSrc} alt="Applicant Photo" layout="fill" className="object-cover rounded-lg" /> : <div className="flex items-center justify-center h-full text-muted-foreground">No Photo</div>}
                        </div>
                    </div>
                     <div className="md:col-span-2">
                        <h3 className="font-semibold text-lg mb-2 border-b pb-2">Personal & Business Details</h3>
                         <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm mt-2">
                            <div><strong className="text-muted-foreground">First Name:</strong><p>{seller.firstName}</p></div>
                            <div><strong className="text-muted-foreground">Last Name:</strong><p>{seller.lastName}</p></div>
                            <div><strong className="text-muted-foreground">Email:</strong><p>{seller.email}</p></div>
                            <div><strong className="text-muted-foreground">Phone:</strong><p>{seller.phone}</p></div>
                            <div className="col-span-2"><strong className="text-muted-foreground">Business Name:</strong><p>{seller.businessName}</p></div>
                         </div>
                    </div>
                </div>
                 <Separator />
                 <h3 className="font-semibold text-lg border-b pb-2">Identification Details</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                         <div><strong className="text-muted-foreground">Aadhar No:</strong><p className="font-mono">{seller.aadhar}</p></div>
                         <div><strong className="text-muted-foreground">PAN Card:</strong><p className="font-mono">{seller.pan}</p></div>
                    </div>
                    <div className="md:col-span-1">
                         <strong className="text-muted-foreground text-sm">Signature:</strong>
                         <div className="mt-1 p-2 border rounded-lg bg-muted aspect-video flex items-center justify-center">
                            {seller.signature ? <Image src={seller.signature} alt="Signature" width={200} height={100} className="object-contain" /> : <p>No Signature</p>}
                         </div>
                    </div>
                 </div>
                 <Separator />
                 <h3 className="font-semibold text-lg border-b pb-2">Bank Account Details</h3>
                 <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                     <div><strong className="text-muted-foreground">Account Number:</strong><p className="font-mono">{seller.accountNumber}</p></div>
                     <div><strong className="text-muted-foreground">IFSC Code:</strong><p className="font-mono">{seller.ifsc}</p></div>
                </div>
            </div>
        </DialogContent>
    );
}


const UserTable = ({ users, onRowClick }: { users: any[], onRowClick: (email: string) => void }) => (
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
                    <TableRow key={index} onClick={() => onRowClick(u.email)} className="cursor-pointer">
                        <TableCell>
                            <div className="font-medium">{u.name || u.displayName}</div>
                            <div className="text-sm text-muted-foreground">{u.email}</div>
                        </TableCell>
                         <TableCell className="hidden md:table-cell">{new Date(u.date || Date.now()).toLocaleDateString()}</TableCell>
                        <TableCell>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost" onClick={(e) => e.stopPropagation()}>
                                        <MoreHorizontal className="h-4 w-4 rotate-90" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onSelect={() => onRowClick(u.email)}>View Profile</DropdownMenuItem>
                                    <DropdownMenuItem>Hold Account</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive">Delete Account</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
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
);

const VerificationRequestsTable = ({ requests, onUpdateRequest, onViewDetails }: { requests: any[], onUpdateRequest: (email: string, status: 'verified' | 'rejected') => void, onViewDetails: (seller: any) => void }) => (
     <>
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Seller Applicant</TableHead>
                    <TableHead className="hidden md:table-cell">Business Name</TableHead>
                    <TableHead className="hidden md:table-cell">PAN</TableHead>
                    <TableHead>Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {requests.length > 0 ? requests.map((req, index) => (
                    <TableRow key={index}>
                        <TableCell>
                            <div className="font-medium">{req.firstName} {req.lastName}</div>
                            <div className="text-sm text-muted-foreground">{req.email}</div>
                        </TableCell>
                         <TableCell className="hidden md:table-cell">{req.businessName}</TableCell>
                         <TableCell className="hidden md:table-cell font-mono">{req.pan}</TableCell>
                        <TableCell className="flex gap-2">
                             <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => onUpdateRequest(req.email, 'verified')}>
                                <CheckCircle className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only">Approve</span>
                            </Button>
                            <Button size="sm" variant="destructive" className="h-8 gap-1" onClick={() => onUpdateRequest(req.email, 'rejected')}>
                                <XCircle className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only">Reject</span>
                            </Button>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onSelect={() => onViewDetails(req)}>View Details</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                )) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">No pending requests.</TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
        <CardFooter className="px-0 pt-4">
            <div className="text-xs text-muted-foreground">
                Showing <strong>1-{requests.length > 10 ? 10 : requests.length}</strong> of <strong>{requests.length}</strong> requests
            </div>
        </CardFooter>
    </>
);


export default function AdminUsersPage() {
  const { user, loading } = useAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [pendingSellers, setPendingSellers] = useState<any[]>([]);
  const [allUsersState, setAllUsersState] = useState<any[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<any | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    if (!loading) {
      if (user?.email !== ADMIN_EMAIL) {
        router.replace('/');
      } else {
          const storedSellers = localStorage.getItem('pendingSellers');
          if (storedSellers) {
              setPendingSellers(JSON.parse(storedSellers));
          }

          const globalUserData = JSON.parse(localStorage.getItem('globalUserData') || '{}');
          const usersArray = Object.values(globalUserData);
          setAllUsersState(usersArray);
      }
    }
  }, [user, loading, router]);


  if (!isMounted || loading || !user || user.email !== ADMIN_EMAIL) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner />
        </div>
    )
  }
  
  const handleUserRowClick = (userEmail: string) => {
    const targetUser: any = allUsersState.find(u => u.email === userEmail);
    if (targetUser) {
        if (targetUser.role === 'Seller') {
            router.push(`/seller/profile?userId=${targetUser.uid}`);
        } else {
            router.push(`/profile?userId=${targetUser.uid}`);
        }
    }
  };

  const handleVerificationUpdate = (email: string, status: 'verified' | 'rejected') => {
      const allPendingSellers = JSON.parse(localStorage.getItem('pendingSellers') || '[]');
      const sellerToUpdate = allPendingSellers.find((s: any) => s.email === email);

      if (sellerToUpdate) {
          updateUserData(sellerToUpdate.uid, {
              verificationStatus: status,
              rejectionReason: status === 'rejected' ? "Application did not meet requirements." : undefined,
          });

          // Remove from pending list
          const updatedPending = allPendingSellers.filter((s: any) => s.email !== email);
          setPendingSellers(updatedPending);
          localStorage.setItem('pendingSellers', JSON.stringify(updatedPending));

          // Also update the local state for the main user list to reflect verification
          setAllUsersState(prev => prev.map(u => u.email === email ? { ...u, verificationStatus: status } : u));
          
          // Also update sellerDetails for the user themselves
          const sellerDetails = JSON.parse(localStorage.getItem('sellerDetails') || '{}');
          if (sellerDetails.email === email) {
            localStorage.setItem('sellerDetails', JSON.stringify({ ...sellerDetails, verificationStatus: status }));
          }

          toast({
              title: `Seller ${status === 'verified' ? 'Approved' : 'Rejected'}`,
              description: `The application for ${email} has been updated.`,
          });
      }
  };
  
  const handleViewDetails = (seller: any) => {
    setSelectedSeller(seller);
  };

  const customers = allUsersState.filter(u => u.role === 'customer');
  const sellers = allUsersState.filter(u => u.role === 'seller' && u.verificationStatus === 'verified');
  const pendingRequestCount = pendingSellers.length;

  return (
    <>
    <Dialog open={!!selectedSeller} onOpenChange={(isOpen) => !isOpen && setSelectedSeller(null)}>
        {selectedSeller && <SellerDetailDialog seller={selectedSeller} onClose={() => setSelectedSeller(null)} />}
    </Dialog>
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
            href="#"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Sellers
          </Link>
          <Link
            href="#"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Products
          </Link>
          <Link
            href="#"
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
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Sellers
              </Link>
               <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Products
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Settings
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <form className="ml-auto flex-1 sm:flex-initial">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              />
            </div>
          </form>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                 <Avatar className="h-9 w-9">
                    <AvatarImage src={user.photoURL || 'https://placehold.co/40x40.png'} alt={user.displayName || "Admin"} />
                    <AvatarFallback>{user.displayName ? user.displayName.charAt(0) : 'A'}</AvatarFallback>
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
                    <TabsTrigger value="customers">Customers</TabsTrigger>
                    <TabsTrigger value="sellers">Sellers</TabsTrigger>
                     <TabsTrigger value="verification">
                        Verification Requests 
                        {pendingRequestCount > 0 && <Badge className="ml-2">{pendingRequestCount}</Badge>}
                    </TabsTrigger>
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
                        <UserTable users={customers} onRowClick={handleUserRowClick} />
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
                        <UserTable users={sellers} onRowClick={handleUserRowClick}/>
                    </CardContent>
                </Card>
             </TabsContent>
            <TabsContent value="verification">
                <Card>
                    <CardHeader className="px-7">
                        <CardTitle>Seller Verification Requests</CardTitle>
                        <CardDescription>Approve or reject new seller applications.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <VerificationRequestsTable requests={pendingSellers} onUpdateRequest={handleVerificationUpdate} onViewDetails={handleViewDetails} />
                    </CardContent>
                </Card>
             </TabsContent>
        </Tabs>
      </main>
    </div>
    </>
  )
}
