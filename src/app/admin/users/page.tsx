
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
import { getUserData, UserData, updateUserData } from "@/lib/follow-data";
import { getFirestore, collection, query, where, getDocs,getCountFromServer } from "firebase/firestore";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Separator } from "@/components/ui/separator";

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
                        <TableHead className="hidden md:table-cell">Public ID</TableHead>
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
                                        <div className="font-medium">{u.displayName}</div>
                                        <div className="text-sm text-muted-foreground">{u.email}</div>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant={u.role === 'admin' ? 'destructive' : u.role === 'seller' ? 'secondary' : 'outline'} className="capitalize">{u.role}</Badge>
                            </TableCell>
                            <TableCell className="hidden md:table-cell font-mono text-xs">{u.publicId || 'N/A'}</TableCell>
                            <TableCell className="hidden md:table-cell">{isMounted && u.createdAt?.seconds ? new Date(u.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
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
  const [activeTab, setActiveTab] = useState("customers");

  const fetchUsers = async () => {
    const db = getFirestore();
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
      (u.email && u.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
      (u.publicId && u.publicId.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
    );
  }, [allUsersState, debouncedSearchTerm]);
  
  const handleExport = () => {
      let dataToExport: any[] = [];
      let filename = "users.csv";
      let headers = ["uid", "publicId", "displayName", "email", "role"];

      switch(activeTab) {
          case 'customers':
              dataToExport = customers;
              filename = "customers_export.csv";
              break;
          case 'sellers':
              dataToExport = sellers;
              filename = "sellers_export.csv";
              break;
          case 'admins':
              dataToExport = admins;
              filename = "admins_export.csv";
              break;
          default:
              toast({ title: "Export Failed", description: "No data to export for this tab.", variant: "destructive"});
              return;
      }

      if (dataToExport.length === 0) {
          toast({ title: "No Data", description: "There is no data to export in this view.", variant: "destructive"});
          return;
      }

      const csvContent = "data:text/csv;charset=utf-8," 
          + [headers.join(","), ...dataToExport.map(item => headers.map(header => JSON.stringify(item[header])).join(","))].join("\\n");

      const link = document.createElement("a");
      link.setAttribute("href", encodeURI(csvContent));
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

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
    <AdminLayout>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs defaultValue="customers" value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between">
                <TabsList>
                    <TabsTrigger value="customers">Customers ({customers.length})</TabsTrigger>
                    <TabsTrigger value="sellers">Sellers ({sellers.length})</TabsTrigger>
                    <TabsTrigger value="admins">Admins ({admins.length})</TabsTrigger>
                </TabsList>
                 <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 gap-1" onClick={handleExport}>
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
                        <UserTable users={customers} onViewDetails={handleViewDetails} onDelete={handleDeleteUserClick} onMakeAdmin={() => {}} onImpersonate={() => {}}/>
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
                        <UserTable users={sellers} onViewDetails={handleViewDetails} onDelete={handleDeleteUserClick} onMakeAdmin={() => {}} onImpersonate={() => {}}/>
                    </CardContent>
                </Card>
             </TabsContent>
             <TabsContent value="admins">
                <Card>
                    <CardHeader className="px-7 flex flex-row items-center justify-between">
                         <div>
                            <CardTitle>Administrators</CardTitle>
                            <CardDescription>Manage all site administrators.</CardDescription>
                        </div>
                        <Button asChild size="sm">
                            <Link href="/admin/create-account">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Create New Admin
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <UserTable users={admins} onViewDetails={handleViewDetails} onDelete={handleDeleteUserClick} onMakeAdmin={() => {}} onImpersonate={() => {}}/>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
      </main>
    </AdminLayout>
    </>
  )
}

    