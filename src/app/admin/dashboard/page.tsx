
"use client"

import {
  Activity,
  ArrowUpRight,
  CircleUser,
  CreditCard,
  DollarSign,
  Menu,
  Package,
  Package2,
  Users,
  Search,
  Users2,
  ShieldCheck
} from "lucide-react"
import { useEffect, useState } from "react";

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
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth.tsx"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"
import { useAuthActions } from "@/lib/auth";

const ADMIN_EMAIL = "samael.prajapati@example.com";

const recentSignups = [
    { name: "Ganesh Prajapati", email: "ganesh@example.com", role: "Seller", date: "2 days ago" },
    { name: "Jane Doe", email: "jane.d@example.com", role: "Customer", date: "2 days ago" },
    { name: "Alex Smith", email: "alex.s@example.com", role: "Customer", date: "3 days ago" },
    { name: "Emily Brown", email: "emily.b@example.com", role: "Customer", date: "5 days ago" },
    { name: "Chris Wilson", email: "chris.w@example.com", role: "Seller", date: "1 week ago" },
]

export default function AdminDashboard() {
  const { user, loading, setUser } = useAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // This is a workaround for the mock admin user.
    if (!loading && !user) {
        const potentialAdmin = sessionStorage.getItem('mockAdminUser');
        if (potentialAdmin) {
            setUser(JSON.parse(potentialAdmin));
        }
    }
  }, [loading, user, setUser]);

  if (!isMounted || loading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner />
        </div>
    )
  }

  // Check if the user is logged in AND is the designated admin.
  if (!user || user.email !== ADMIN_EMAIL) {
    return (
         <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
             <h2 className="text-2xl font-semibold mb-4">Access Denied</h2>
             <p className="text-muted-foreground mb-6">You do not have permission to view this page.</p>
             <Button onClick={() => router.push('/')}>Go to Login</Button>
        </div>
    );
  }

  const handleAdminSignOut = () => {
    signOut();
  }

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
            className="text-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/admin/users"
            className="text-muted-foreground transition-colors hover:text-foreground"
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
              <Link href="/admin/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
              <Link
                href="/admin/users"
                className="text-muted-foreground hover:text-foreground"
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
                placeholder="Search..."
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
              <DropdownMenuItem onClick={handleAdminSignOut}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <span className="h-4 w-4 text-muted-foreground">₹</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹1,24,52,31.89</div>
              <p className="text-xs text-muted-foreground">
                +20.1% from last month
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2350</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sellers</CardTitle>
              <Users2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+432</div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12,234</div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8">
           <Card>
            <CardHeader>
              <CardTitle>Recent Signups</CardTitle>
              <CardDescription>
                A list of the most recent users who have joined the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSignups.map((signup, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="font-medium">{signup.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {signup.email}
                        </div>
                      </TableCell>
                      <TableCell>
                         <Badge variant={signup.role === 'Seller' ? 'secondary' : 'outline'}>
                            {signup.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{signup.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
