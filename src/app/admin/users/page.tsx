

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
} from "lucide-react"
import { useEffect, useState, useRef } from "react";
import Link from "next/link"
import { useRouter } from "next/navigation"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
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
import { getUserData, UserData, updateUserData } from "@/lib/follow-data";
import { updateUserDataOnServer } from "@/lib/firebase-server-utils";
import { Separator } from "@/components/ui/separator";
import { getFirestore, collection, query, where, getDocs,getCountFromServer } from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

const UserDetailDialog = ({ user, onClose, orderCount }: { user: any, onClose: () => void, orderCount: number }) => {
    const photoSrc = user.passportPhoto?.preview || user.passportPhoto || user.photoURL;

    return (
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                 <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                         <AvatarImage src={photoSrc} alt={user.displayName} />
                         <AvatarFallback>{user.displayName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <DialogTitle className="text-2xl">{user.displayName}</DialogTitle>
                         <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant={user.role === 'seller' ? 'secondary' : 'outline'}>{user.role}</Badge>
                            {user.role === 'seller' && (
                                <Badge variant="outline">{user.verificationStatus}</Badge>
                            )}
                        </div>
                    </div>
                </div>
            </DialogHeader>
            <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-4">
                <h3 className="font-semibold text-lg border-b pb-2">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong className="text-muted-foreground">Email:</strong><div>{user.email}</div></div>
                    <div><strong className="text-muted-foreground">Phone:</strong><div>{user.phone}</div></div>
                    <div className="col-span-2"><strong className="text-muted-foreground">User ID:</strong><div>{user.userId}</div></div>
                    <div className="col-span-2"><strong className="text-muted-foreground">Bio:</strong><div>{user.bio || 'Not provided'}</div></div>
                </div>

                <Separator />
                <h3 className="font-semibold text-lg border-b pb-2">Activity</h3>
                <div className="flex items-center gap-2 text-sm">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    <strong className="text-muted-foreground">Total Orders:</strong>
                    <div>{orderCount}</div>
                </div>


                {user.role === 'seller' && (
                    <>
                        <Separator />
                        <h3 className="font-semibold text-lg border-b pb-2">Seller Information</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><strong className="text-muted-foreground">Business Name:</strong><p>{user.businessName}</p></div>
                             <div className="col-span-2"><strong className="text-muted-foreground">Bank Account:</strong><p className="font-mono">{user.accountNumber} ({user.ifsc})</p></div>
                              <div className="col-span-2">
                                <strong className="text-muted-foreground text-sm">Signature:</strong>
                                <div className="mt-1 p-2 border rounded-lg bg-muted aspect-video flex items-center justify-center max-w-xs">
                                    {user.signature ? <Image src={user.signature} alt="Signature" width={200} height={100} className="object-contain" /> : <p>No Signature</p>}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onClose}>Close</Button>
            </DialogFooter>
        </DialogContent>
    );
};


const UserTable = ({ users, onViewDetails, onDelete }: { users: any[], onViewDetails: (user: any) => void, onDelete: (user: any) => void }) => (
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
                    <TableRow key={index}>
                        <TableCell>
                            <div className="font-medium">{u.name || u.displayName}</div>
                            <div className="text-sm text-muted-foreground">{u.email}</div>
                        </TableCell>
                         <TableCell className="hidden md:table-cell">{new Date(u.date || Date.now()).toLocaleDateString()}</TableCell>
                        <TableCell>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                        <span className="sr-only">Toggle menu</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                    <DropdownMenuItem onSelect={() => onViewDetails(u)}>View Details</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive" onSelect={() => onDelete(u)}>Delete Account</DropdownMenuItem>
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

export default function AdminUsersPage() {
  const { user, userData, loading } = useAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [allUsersState, setAllUsersState] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedUserOrderCount, setSelectedUserOrderCount] = useState(0);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    const db = getFirestoreDb();
    const usersRef = collection(db, "users");

    // Fetch all users
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
      // from Firebase Auth and Firestore. For now, we'll just remove from state.
      console.log("Simulating deletion of user:", userToDelete.uid);
      setAllUsersState(prev => prev.filter(u => u.uid !== userToDelete.uid));
      toast({ title: "User Deleted", description: `${userToDelete.displayName} has been removed.` });
      setIsDeleteAlertOpen(false);
      setUserToDelete(null);
  }
  
  const handleViewDetails = async (userToShow: any) => {
    const db = getFirestoreDb();
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("userId", "==", userToShow.uid));
    const snapshot = await getCountFromServer(q);
    setSelectedUserOrderCount(snapshot.data().count);
    setSelectedUser(userToShow);
  };

  const customers = allUsersState.filter(u => u.role === 'customer');
  const sellers = allUsersState.filter(u => u.role === 'seller');

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
    <Dialog open={!!selectedUser} onOpenChange={(isOpen) => !isOpen && setSelectedUser(null)}>
        {selectedUser && <UserDetailDialog user={selectedUser} onClose={() => setSelectedUser(null)} orderCount={selectedUserOrderCount} />}
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
                        <UserTable users={customers} onViewDetails={handleViewDetails} onDelete={handleDeleteUserClick}/>
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
                        <UserTable users={sellers} onViewDetails={handleViewDetails} onDelete={handleDeleteUserClick}/>
                    </CardContent>
                </Card>
             </TabsContent>
        </Tabs>
      </main>
    </div>
    </>
  )
}
