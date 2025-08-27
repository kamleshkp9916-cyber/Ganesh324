
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
} from "lucide-react"
import { useEffect, useState } from "react";
import Link from "next/link"
import { useRouter } from "next/navigation"

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

const UserTable = ({ users, onRowClick }: { users: typeof allUsers, onRowClick: (email: string) => void }) => (
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
                            <div className="font-medium">{u.name}</div>
                            <div className="text-sm text-muted-foreground">{u.email}</div>
                        </TableCell>
                         <TableCell className="hidden md:table-cell">{new Date(u.date).toLocaleDateString()}</TableCell>
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

const VerificationRequestsTable = ({ requests, onUpdateRequest }: { requests: any[], onUpdateRequest: (email: string, status: 'verified' | 'rejected') => void }) => (
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
                                    <DropdownMenuItem>View Details</DropdownMenuItem>
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
  const { toast } = useToast();

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
        const storedSellers = localStorage.getItem('pendingSellers');
        if (storedSellers) {
            setPendingSellers(JSON.parse(storedSellers));
        }
    }
  }, []);

  if (!isMounted || loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner />
        </div>
    )
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
         <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
             <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
             <p className="text-muted-foreground mb-6">You do not have permission to view this page.</p>
             <Button onClick={() => router.push('/')}>Go to Login</Button>
        </div>
    );
  }
  
  const handleUserRowClick = (userEmail: string) => {
    const targetUser = allUsers.find(u => u.email === userEmail);
    if (targetUser) {
        if (targetUser.role === 'Seller') {
            // In a real app, you'd use a unique ID. Here we use email as a proxy.
            const sellerId = `seller_${userEmail}`;
            router.push(`/seller/profile?userId=${sellerId}`);
        } else {
            router.push(`/profile?userId=${userEmail}`);
        }
    }
  };

  const handleVerificationUpdate = (email: string, status: 'verified' | 'rejected') => {
      const allSellers = JSON.parse(localStorage.getItem('pendingSellers') || '[]');
      const sellerIndex = allSellers.findIndex((s: any) => s.email === email);

      if (sellerIndex > -1) {
          allSellers[sellerIndex].verificationStatus = status;

          if (status === 'rejected') {
              allSellers[sellerIndex].rejectionReason = "Application did not meet requirements.";
          }
          
          localStorage.setItem('sellerDetails', JSON.stringify(allSellers[sellerIndex]));
          
          // Remove from pending list
          const updatedPending = allSellers.filter((s: any) => s.email !== email);
          setPendingSellers(updatedPending);
          localStorage.setItem('pendingSellers', JSON.stringify(updatedPending));

          toast({
              title: `Seller ${status === 'verified' ? 'Approved' : 'Rejected'}`,
              description: `The application for ${email} has been updated.`,
          });
      }
  };

  const customers = allUsers.filter(u => u.role === 'Customer');
  const sellers = allUsers.filter(u => u.role === 'Seller');
  const pendingRequestCount = pendingSellers.length;

  return (
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
                        <VerificationRequestsTable requests={pendingSellers} onUpdateRequest={handleVerificationUpdate} />
                    </CardContent>
                </Card>
             </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
