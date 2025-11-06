
"use client"

import {
  Activity,
  ArrowUpRight,
  CircleUser,
  CreditCard,
  DollarSign,
  Menu,
  Package2,
  Search,
  Users,
  Sparkles,
  ShieldCheck,
  RadioTower,
  Ticket,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
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
import Link from "next/link"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts"
import { useAuth } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"
import { useAuthActions } from "@/lib/auth";
import { GoLiveDialog } from "@/components/go-live-dialog";


const salesData = [
  { name: "Jan", sales: 4000 },
  { name: "Feb", sales: 3000 },
  { name: "Mar", sales: 5000 },
  { name: "Apr", sales: 4500 },
  { name: "May", sales: 6000 },
  { name: "Jun", sales: 5500 },
]

const recentSales = [
  {
    name: "Olivia Martin",
    email: "olivia.martin@email.com",
    amount: "+$1,999.00",
    avatar: "https://placehold.co/40x40.png"
  },
  {
    name: "Jackson Lee",
    email: "jackson.lee@email.com",
    amount: "+$39.00",
    avatar: "https://placehold.co/40x40.png"
  },
  {
    name: "Isabella Nguyen",
    email: "isabella.nguyen@email.com",
    amount: "+$299.00",
    avatar: "https://placehold.co/40x40.png"
  },
  {
    name: "William Kim",
    email: "will@email.com",
    amount: "+$99.00",
    avatar: "https://placehold.co/40x40.png"
  },
  {
    name: "Sofia Davis",
    email: "sofia.davis@email.com",
    amount: "+$39.00",
    avatar: "https://placehold.co/40x40.png"
  },
]

const SELLER_WELCOME_KEY = 'streamcart_seller_welcome_shown';

export default function SellerDashboard() {
  const { user, userData, loading } = useAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // This effect runs once when the component mounts and the user data is available.
    // It checks if the welcome dialog should be shown to a new seller.
    if (isMounted && !loading && userData?.role === 'seller') {
        const welcomeShown = localStorage.getItem(SELLER_WELCOME_KEY);
        if (!welcomeShown) {
            setShowWelcomeDialog(true);
            localStorage.setItem(SELLER_WELCOME_KEY, 'true');
        }
    }
  }, [userData, loading, isMounted]);


  if (!isMounted || loading || !user || !userData) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner />
        </div>
    )
  }

  // The AuthRedirector component handles redirection for non-sellers.
  // We can safely assume if this component renders, the user is a seller.

  return (
    <>
      <Dialog open={showWelcomeDialog} onOpenChange={setShowWelcomeDialog}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    <Sparkles className="text-primary h-6 w-6" />
                    Welcome to Your Seller Dashboard!
                </DialogTitle>
                <DialogDescription className="pt-2">
                    Congratulations on becoming a StreamCart seller! Here are a few tips to get you started on the right foot.
                </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm">
                <p><strong>1. List Your Products:</strong> Head over to the "Products" tab to start adding your inventory. Clear photos and detailed descriptions are key!</p>
                <p><strong>2. Go Live:</strong> Use live streams to showcase your products in real-time. Engage with your audience, answer their questions, and drive sales.</p>
                <p><strong>3. Fulfill Orders Promptly:</strong> Keep an eye on the "Orders" tab. Fast shipping and good communication lead to happy customers and great reviews.</p>
                <p><strong>4. Be Professional:</strong> Always be respectful and honest in your interactions. Your reputation is your most valuable asset.</p>
                <p>We're excited to have you here. Happy selling!</p>
            </div>
            <DialogFooter>
                <Button onClick={() => setShowWelcomeDialog(false)}>Let's Get Started</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          <Link
            href="#"
            className="flex items-center gap-2 text-lg font-semibold md:text-base"
          >
            <Package2 className="h-6 w-6" />
            <span className="sr-only">StreamCart Seller</span>
          </Link>
          <Link
            href="/seller/dashboard"
            className="text-foreground transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <Link
            href="/seller/revenue"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Revenue
          </Link>
          <Link
            href="/seller/orders"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Orders
          </Link>
          <Link
            href="/seller/products"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Products
          </Link>
           <Link
            href="/seller/promotions"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Promotions
          </Link>
          <Link
            href="/seller/feed"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Feed
          </Link>
          <Link
            href="#"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            Analytics
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
                href="#"
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Package2 className="h-6 w-6" />
                <span className="sr-only">StreamCart</span>
              </Link>
              <Link href="/seller/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
              <Link
                href="/seller/revenue"
                className="text-muted-foreground hover:text-foreground"
              >
                Revenue
              </Link>
              <Link
                href="/seller/orders"
                className="text-muted-foreground hover:text-foreground"
              >
                Orders
              </Link>
              <Link
                href="/seller/products"
                className="text-muted-foreground hover:text-foreground"
              >
                Products
              </Link>
              <Link
                href="/seller/promotions"
                className="text-muted-foreground hover:text-foreground"
              >
                Promotions
              </Link>
               <Link
                href="/seller/feed"
                className="text-muted-foreground hover:text-foreground"
              >
                Feed
              </Link>
              <Link
                href="#"
                className="text-muted-foreground hover:text-foreground"
              >
                Analytics
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
            <Dialog>
                <DialogTrigger asChild>
                    <Button className="ml-auto">
                        <RadioTower className="mr-2 h-4 w-4" /> Go Live
                    </Button>
                </DialogTrigger>
                <GoLiveDialog />
            </Dialog>

          {userData?.verificationStatus === 'verified' && (
            <Badge variant="success" className="items-center gap-1">
              <ShieldCheck className="h-4 w-4" />
              KYC Verified
            </Badge>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut(true)}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Link href="/seller/revenue">
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$45,231.89</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
          </Link>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sales
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12,234</div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>
           <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Streams</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  +2 this month
                </p>
              </CardContent>
            </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                New Followers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+2350</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>
                An overview of your sales performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Sales</CardTitle>
              <CardDescription>
                You made 265 sales this month.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8">
               {recentSales.map((sale, index) => (
                <div key={index} className="flex items-center gap-4">
                    <Avatar className="hidden h-9 w-9 sm:flex">
                    <AvatarImage src={sale.avatar} alt="Avatar" />
                    <AvatarFallback>{sale.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">{sale.name}</p>
                    <p className="text-sm text-muted-foreground">
                        {sale.email}
                    </p>
                    </div>
                    <div className="ml-auto font-medium">{sale.amount}</div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
    </>
  )
}
