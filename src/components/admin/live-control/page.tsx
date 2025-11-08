

"use client"

import {
  ShieldCheck,
  Menu,
  Video,
  Users,
  Eye,
  StopCircle,
  MoreVertical,
  Search,
  Gavel,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import React, { useState, useEffect, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuthActions } from "@/lib/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use-debounce";

const mockLiveStreams = [
    { id: 1, seller: { name: 'FashionFinds', avatarUrl: 'https://placehold.co/40x40.png' }, product: { name: 'Vintage Camera', imageUrl: 'https://placehold.co/80x80.png', hint: 'vintage camera' }, viewers: 1200, streamId: 'fashionfinds-uid', hasAuction: true },
    { id: 2, seller: { name: 'GadgetGuru', avatarUrl: 'https://placehold.co/40x40.png' }, product: { name: 'Wireless Headphones', imageUrl: 'https://placehold.co/80x80.png', hint: 'headphones' }, viewers: 2500, streamId: 'gadgetguru-uid', hasAuction: false },
    { id: 3, seller: { name: 'BeautyBox', avatarUrl: 'https://placehold.co/40x40.png' }, product: { name: 'Skincare Set', imageUrl: 'https://placehold.co/80x80.png', hint: 'skincare' }, viewers: 3100, streamId: 'beautybox-uid', hasAuction: true },
];

export default function AdminLiveControlPage() {
  const { user, userData, loading } = useAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [liveStreams, setLiveStreams] = useState(mockLiveStreams);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const filteredStreams = useMemo(() => {
    return liveStreams.filter(stream =>
      stream.seller.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      stream.product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [liveStreams, debouncedSearchTerm]);

  const handleMonitorStream = (streamId: string) => {
    // In a real app, this would join the stream with admin privileges.
    // For this demo, we'll just navigate to the stream page.
    router.push(`/stream/${streamId}`);
    toast({
      title: "Monitoring Stream",
      description: `Joining stream ${streamId} as a hidden admin.`,
    });
  };

  const handleStopStream = (streamId: number, sellerName: string) => {
    setLiveStreams(prev => prev.filter(stream => stream.id !== streamId));
    toast({
      variant: "destructive",
      title: "Stream Stopped",
      description: `The live stream by ${sellerName} has been forcibly stopped.`,
    });
  };
  
  if (loading || userData?.role !== 'admin') {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
        <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-40">
            <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base"><ShieldCheck className="h-6 w-6" /><span className="sr-only">Admin</span></Link>
                <Link href="/admin/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">Dashboard</Link>
                <Link href="/admin/orders" className="text-muted-foreground transition-colors hover:text-foreground">Orders</Link>
                <Link href="/admin/users" className="text-muted-foreground transition-colors hover:text-foreground">Users</Link>
                <Link href="/admin/kyc" className="text-muted-foreground transition-colors hover:text-foreground">KYC</Link>
                <Link href="/admin/inquiries" className="text-muted-foreground transition-colors hover:text-foreground">Inquiries</Link>
                <Link href="/admin/messages" className="text-muted-foreground transition-colors hover:text-foreground">Messages</Link>
                <Link href="/admin/products" className="text-muted-foreground transition-colors hover:text-foreground">Products</Link>
                <Link href="/admin/live-control" className="text-foreground transition-colors hover:text-foreground">Live Control</Link>
                 <Link href="/admin/settings" className="text-muted-foreground transition-colors hover:text-foreground">Settings</Link>
            </nav>
            <Sheet>
                <SheetTrigger asChild><Button variant="outline" size="icon" className="shrink-0 md:hidden"><Menu className="h-5 w-5" /><span className="sr-only">Menu</span></Button></SheetTrigger>
                <SheetContent side="left">
                    <nav className="grid gap-6 text-lg font-medium">
                        <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-semibold"><ShieldCheck className="h-6 w-6" /><span>Admin Panel</span></Link>
                        <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
                        <Link href="/admin/orders" className="text-muted-foreground hover:text-foreground">Orders</Link>
                        <Link href="/admin/users" className="text-muted-foreground hover:text-foreground">Users</Link>
                        <Link href="/admin/kyc" className="text-muted-foreground hover:text-foreground">KYC</Link>
                        <Link href="/admin/inquiries" className="text-muted-foreground hover:text-foreground">Inquiries</Link>
                        <Link href="/admin/messages" className="text-muted-foreground hover:text-foreground">Messages</Link>
                        <Link href="/admin/products" className="text-muted-foreground hover:text-foreground">Products</Link>
                        <Link href="/admin/live-control" className="hover:text-foreground">Live Control</Link>
                         <Link href="/admin/settings" className="text-muted-foreground hover:text-foreground">Settings</Link>
                    </nav>
                </SheetContent>
            </Sheet>
            <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                 <form className="ml-auto flex-1 sm:flex-initial" onSubmit={(e) => e.preventDefault()}>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="search"
                          placeholder="Search streams..."
                          className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </form>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="rounded-full">
                            <Avatar className="h-9 w-9"><AvatarImage src={user?.photoURL || 'https://placehold.co/40x40.png'} /><AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback></Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => router.push('/settings')}>Settings</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={signOut}>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Live Stream Control</CardTitle>
                    <CardDescription>Monitor and manage all ongoing live streams.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Seller</TableHead>
                                <TableHead className="hidden sm:table-cell">Product</TableHead>
                                <TableHead className="text-center">Viewers</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStreams.length > 0 ? filteredStreams.map(stream => (
                                <TableRow key={stream.id}>
                                    <TableCell>
                                        <Link href={`/stream/${stream.streamId}`} className="flex items-center gap-3 group">
                                            <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                                                <Video className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <Avatar>
                                                <AvatarImage src={stream.seller.avatarUrl} />
                                                <AvatarFallback>{stream.seller.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium group-hover:underline">{stream.seller.name}</span>
                                                {stream.hasAuction && (
                                                     <Badge variant="purple" className="w-fit">
                                                        <Gavel className="mr-1 h-3 w-3" />
                                                        Auction
                                                    </Badge>
                                                )}
                                            </div>
                                        </Link>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        <Link href={`/stream/${stream.streamId}`} className="flex items-center gap-3 group">
                                            <Image src={stream.product.imageUrl} alt={stream.product.name} width={40} height={40} className="rounded-md" data-ai-hint={stream.product.hint} />
                                            <span className="group-hover:underline">{stream.product.name}</span>
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary" className="gap-1.5">
                                            <Users className="h-3 w-3"/>
                                            {stream.viewers}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost"><MoreVertical className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => handleMonitorStream(stream.streamId)}>
                                                    <Eye className="mr-2 h-4 w-4" /> Monitor Stream
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                 <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onSelect={(e) => e.preventDefault()}>
                                                            <StopCircle className="mr-2 h-4 w-4" /> Force Stop Stream
                                                        </DropdownMenuItem>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This will immediately terminate the live stream for {stream.seller.name}. This action cannot be undone.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleStopStream(stream.id, stream.seller.name)}>Confirm Stop</AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">No live streams found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                    <div className="text-xs text-muted-foreground">
                        Showing <strong>1-{filteredStreams.length}</strong> of <strong>{filteredStreams.length}</strong> active streams
                    </div>
                </CardFooter>
            </Card>
        </main>
    </div>
  )
}
