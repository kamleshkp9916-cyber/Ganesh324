
"use client"

import Link from "next/link"
import {
  Bell,
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package,
  Package2,
  Search,
  ShoppingCart,
  Users,
  ShieldCheck,
  PackageCheck,
  MessageSquare,
  Shield,
  Settings,
  RadioTower,
  CreditCard,
  FileText,
  Rss, // Added Rss icon
} from "lucide-react"

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
import { useAuth } from "@/hooks/use-auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { usePathname, useRouter } from "next/navigation"
import { useAuthActions } from "@/lib/auth"
import { cn } from "@/lib/utils"

const navItems = [
    { href: "/admin/dashboard", icon: Home, label: "Dashboard" },
    { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/admin/revenue", icon: LineChart, label: "Revenue" },
    { href: "/admin/transactions", icon: CreditCard, label: "Transactions" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/kyc", icon: Shield, label: "KYC" },
    { href: "/admin/products", icon: Package, label: "Products" },
    { href: "/admin/messages", icon: MessageSquare, label: "Messages" },
    { href: "/admin/inquiries", icon: FileText, label: "Inquiries" },
    { href: "/admin/feed", icon: Rss, label: "Feed" },
];

const featuresItems = [
    { href: "/admin/live-control", icon: RadioTower, label: "Live Control" },
];

const generalItems = [
    { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const { signOut } = useAuthActions();
    const pathname = usePathname();
    const router = useRouter();

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block md:sticky md:top-0 h-screen">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                            <span className="">StreamCart Admin</span>
                        </Link>
                        <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
                            <Bell className="h-4 w-4" />
                            <span className="sr-only">Toggle notifications</span>
                        </Button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                            <div className="px-3 py-2">
                                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                                    MAIN MENU
                                </h2>
                                <div className="space-y-1">
                                    {navItems.map(item => (
                                         <Link key={item.href} href={item.href}>
                                            <Button
                                                variant={pathname === item.href ? "secondary" : "ghost"}
                                                className="w-full justify-start"
                                            >
                                                <item.icon className="mr-2 h-4 w-4" />
                                                {item.label}
                                            </Button>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            <div className="px-3 py-2">
                                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                                    FEATURES
                                </h2>
                                <div className="space-y-1">
                                    {featuresItems.map(item => (
                                         <Link key={item.href} href={item.href}>
                                            <Button
                                                variant={pathname === item.href ? "secondary" : "ghost"}
                                                className="w-full justify-start"
                                            >
                                                <item.icon className="mr-2 h-4 w-4" />
                                                {item.label}
                                            </Button>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                            <div className="px-3 py-2">
                                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                                    GENERAL
                                </h2>
                                <div className="space-y-1">
                                    {generalItems.map(item => (
                                         <Link key={item.href} href={item.href}>
                                            <Button
                                                variant={pathname === item.href ? "secondary" : "ghost"}
                                                className="w-full justify-start"
                                            >
                                                <item.icon className="mr-2 h-4 w-4" />
                                                {item.label}
                                            </Button>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </nav>
                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0 bg-background/95 z-10">
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
                        <SheetContent side="left" className="flex flex-col">
                            <nav className="grid gap-2 text-lg font-medium">
                                 <Link href="/" className="flex items-center gap-2 font-semibold mb-4">
                                    <ShieldCheck className="h-6 w-6 text-primary" />
                                    <span className="">StreamCart Admin</span>
                                </Link>
                                 <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search..."
                                        className="w-full appearance-none bg-background pl-8 shadow-none"
                                    />
                                </div>
                                 <div className="px-3 py-2">
                                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                                        MAIN MENU
                                    </h2>
                                    <div className="space-y-1">
                                        {navItems.map(item => (
                                            <Link key={item.href} href={item.href}>
                                                <Button
                                                    variant={pathname === item.href ? "secondary" : "ghost"}
                                                    className="w-full justify-start"
                                                >
                                                    <item.icon className="mr-2 h-4 w-4" />
                                                    {item.label}
                                                </Button>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                                <div className="px-3 py-2">
                                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                                        FEATURES
                                    </h2>
                                    <div className="space-y-1">
                                        {featuresItems.map(item => (
                                            <Link key={item.href} href={item.href}>
                                                <Button
                                                    variant={pathname === item.href ? "secondary" : "ghost"}
                                                    className="w-full justify-start"
                                                >
                                                    <item.icon className="mr-2 h-4 w-4" />
                                                    {item.label}
                                                </Button>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                                 <div className="px-3 py-2">
                                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                                        GENERAL
                                    </h2>
                                    <div className="space-y-1">
                                        {generalItems.map(item => (
                                            <Link key={item.href} href={item.href}>
                                                <Button
                                                    variant={pathname === item.href ? "secondary" : "ghost"}
                                                    className="w-full justify-start"
                                                >
                                                    <item.icon className="mr-2 h-4 w-4" />
                                                    {item.label}
                                                </Button>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1">
                        <form>
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Search..."
                                    className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                                />
                            </div>
                        </form>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user?.photoURL || undefined} />
                                    <AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push('/profile')}>Profile</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push('/settings')}>Settings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>
                {children}
            </div>
        </div>
    )
}
