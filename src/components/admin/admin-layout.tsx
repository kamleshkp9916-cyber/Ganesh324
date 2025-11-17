
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
  Rss,
  Loader2,
  Banknote,
  Ticket,
} from "lucide-react"
import { useState, useEffect, useMemo, useCallback } from "react";
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
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useAuthActions } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { useDebounce } from "@/hooks/use-debounce";
import { getFirestoreDb } from "@/lib/firebase";
import { collection, query, where, limit, getDocs } from "firebase/firestore";
import { UserData, getUserData } from "@/lib/follow-data";
import { Popover, PopoverAnchor, PopoverContent } from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import { LoadingSpinner } from "../ui/loading-spinner";

const navItems = [
    { href: "/admin/dashboard", icon: Home, label: "Dashboard" },
    { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    { href: "/admin/revenue", icon: LineChart, label: "Revenue" },
    { href: "/admin/transactions", icon: CreditCard, label: "Transactions" },
    { href: "/admin/payouts", icon: Banknote, label: "Payouts" },
    { href: "/admin/users", icon: Users, label: "Users" },
    { href: "/admin/kyc", icon: Shield, label: "KYC" },
    { href: "/admin/products", icon: Package, label: "Products" },
    { href: "/admin/messages", icon: MessageSquare, label: "Messages" },
    { href: "/admin/inquiries", icon: FileText, label: "Inquiries" },
    { href: "/admin/feed", icon: Rss, label: "Feed" },
    { href: "/admin/tickets", icon: Ticket, label: "Tickets" },
];

const featuresItems = [
    { href: "/admin/live-control", icon: RadioTower, label: "Live Control" },
];

const generalItems = [
    { href: "/admin/settings", icon: Settings, label: "Settings" },
];

const mockNotifications = [
    { id: 1, title: 'New payout request', description: 'FashionFinds requested ₹52,340.50', href: '/admin/payouts', read: false },
    { id: 2, title: 'Low Stock Warning', description: 'Vintage Camera has only 15 units left.', href: '/admin/products', read: false },
    { id: 3, title: 'New Seller Application', description: 'Artisan Crafts needs KYC approval.', href: '/admin/kyc', read: true },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, userData, loading } = useAuth();
    const { signOut } = useAuthActions();
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || "");
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [searchResults, setSearchResults] = useState<UserData[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [notifications, setNotifications] = useState(mockNotifications);
    const [blockedPaths, setBlockedPaths] = useState<string[]>([]);
    
    useEffect(() => {
        if(userData?.blockedPaths) {
            setBlockedPaths(userData.blockedPaths);
        }
    }, [userData]);
    
    const visibleNavItems = useMemo(() => navItems.filter(item => !blockedPaths.includes(item.href)), [blockedPaths]);
    const visibleFeaturesItems = useMemo(() => featuresItems.filter(item => !blockedPaths.includes(item.href)), [blockedPaths]);
    const visibleGeneralItems = useMemo(() => generalItems.filter(item => !blockedPaths.includes(item.href)), [blockedPaths]);


    const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

    useEffect(() => {
        const searchUsers = async () => {
            if (debouncedSearchTerm.trim().length < 2) {
                setSearchResults([]);
                setIsPopoverOpen(false);
                return;
            }
            setIsSearching(true);
            const db = getFirestoreDb();
            const usersRef = collection(db, "users");

            const customerQuery = query(
                usersRef,
                where("displayName", ">=", debouncedSearchTerm),
                where("displayName", "<=", debouncedSearchTerm + '\uf8ff'),
                where("role", "==", "customer"),
                limit(5)
            );
            
            const sellerQuery = query(
                usersRef,
                where("displayName", ">=", debouncedSearchTerm),
                where("displayName", "<=", debouncedSearchTerm + '\uf8ff'),
                where("role", "==", "seller"),
                limit(5)
            );

            try {
                const [customerSnapshot, sellerSnapshot] = await Promise.all([
                    getDocs(customerQuery),
                    getDocs(sellerQuery)
                ]);

                const customers = customerSnapshot.docs.map(doc => ({...doc.data(), uid: doc.id} as UserData));
                const sellers = sellerSnapshot.docs.map(doc => ({...doc.data(), uid: doc.id} as UserData));

                const combinedResults = [...customers, ...sellers].slice(0, 5);
                setSearchResults(combinedResults);
                setIsPopoverOpen(combinedResults.length > 0);

            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setIsSearching(false);
            }
        };

        searchUsers();
    }, [debouncedSearchTerm]);
    
    const handleUserSelect = (selectedUser: UserData) => {
        setIsPopoverOpen(false);
        setSearchTerm('');
        router.push(`/admin/users/${selectedUser.uid}`);
    }

    const markAsRead = (id: number) => {
        setNotifications(current => current.map(n => n.id === id ? { ...n, read: true } : n));
    };

    useEffect(() => {
        if (!loading && (!user || !userData || userData.role !== 'admin')) {
            router.replace('/');
        }
    }, [user, userData, loading, router]);


    if (loading || !user || !userData || userData.role !== 'admin') {
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block md:sticky md:top-0 h-screen">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
                            <ShieldCheck className="h-6 w-6 text-primary" />
                            <span className="">Nipher Admin</span>
                        </Link>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" className="ml-auto h-8 w-8 relative">
                                    <Bell className="h-4 w-4" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                                        </span>
                                    )}
                                    <span className="sr-only">Toggle notifications</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-80">
                                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {notifications.length > 0 ? notifications.map(n => (
                                    <DropdownMenuItem key={n.id} onSelect={() => { markAsRead(n.id); router.push(n.href); }} className={cn("flex-col items-start gap-1", !n.read && "bg-primary/5")}>
                                        <div className="flex justify-between w-full">
                                            <p className={cn("font-semibold", !n.read && "text-primary")}>{n.title}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground">{n.description}</p>
                                    </DropdownMenuItem>
                                )) : (
                                    <p className="p-4 text-center text-sm text-muted-foreground">No new notifications.</p>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                            <div className="px-3 py-2">
                                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                                    MAIN MENU
                                </h2>
                                <div className="space-y-1">
                                    {visibleNavItems.map(item => (
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
                                    {visibleFeaturesItems.map(item => (
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
                                    {visibleGeneralItems.map(item => (
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
                                <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-semibold mb-4">
                                    <ShieldCheck className="h-6 w-6 text-primary" />
                                    <span className="">Nipher Admin</span>
                                </Link>
                                <div className="space-y-1">
                                    {visibleNavItems.map(item => (
                                        <Link key={item.href} href={item.href}>
                                            <Button
                                                variant={pathname === item.href ? "secondary" : "ghost"}
                                                className="w-full justify-start text-base"
                                            >
                                                <item.icon className="mr-2 h-5 w-5" />
                                                {item.label}
                                            </Button>
                                        </Link>
                                    ))}
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                    <div className="w-full flex-1">
                        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                            <PopoverAnchor>
                                <form onSubmit={(e) => e.preventDefault()}>
                                    <div className="relative">
                                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            type="search"
                                            placeholder="Search users..."
                                            className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                         {isSearching && <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin" />}
                                    </div>
                                </form>
                            </PopoverAnchor>
                            <PopoverContent className="w-[--radix-popover-trigger-width] mt-2 p-0">
                                <ScrollArea className="max-h-80">
                                     {searchResults.length > 0 ? (
                                        searchResults.map(userResult => (
                                            <button 
                                                key={userResult.uid}
                                                onClick={() => handleUserSelect(userResult)}
                                                className="flex items-center gap-3 w-full text-left p-3 hover:bg-secondary"
                                            >
                                                <Avatar className="h-9 w-9">
                                                    <AvatarImage src={userResult.photoURL} />
                                                    <AvatarFallback>{userResult.displayName.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-sm">{userResult.displayName}</p>
                                                    <p className="text-xs text-muted-foreground">{userResult.email}</p>
                                                </div>
                                            </button>
                                        ))
                                     ) : (
                                        <p className="p-4 text-center text-sm text-muted-foreground">
                                            {debouncedSearchTerm.trim().length > 1 ? 'No users found.' : 'Start typing to search...'}
                                        </p>
                                     )}
                                </ScrollArea>
                            </PopoverContent>
                        </Popover>
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
                            <DropdownMenuItem onClick={() => router.push('/admin/settings')}>Settings</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>
                {children}
            </div>
        </div>
    );
}
