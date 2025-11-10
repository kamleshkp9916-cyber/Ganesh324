
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/hooks/use-debounce";
import { AdminLayout } from "@/components/admin/admin-layout"


const mockLiveStreams = [
    { id: 1, seller: { name: 'FashionFinds', avatarUrl: 'https://placehold.co/40x40.png' }, product: { name: 'Vintage Camera', imageUrl: 'https://placehold.co/80x80.png', hint: 'vintage camera' }, viewers: 1200, streamId: '1', hasAuction: true },
    { id: 2, seller: { name: 'GadgetGuru', avatarUrl: 'https://placehold.co/40x40.png' }, product: { name: 'Wireless Headphones', imageUrl: 'https://placehold.co/80x80.png', hint: 'headphones' }, viewers: 2500, streamId: '2', hasAuction: false },
    { id: 3, seller: { name: 'BeautyBox', avatarUrl: 'https://placehold.co/40x40.png' }, product: { name: 'Skincare Set', imageUrl: 'https://placehold.co/80x80.png', hint: 'skincare' }, viewers: 3100, streamId: '4', hasAuction: true },
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
    <AdminLayout>
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
    </AdminLayout>
  )
}
