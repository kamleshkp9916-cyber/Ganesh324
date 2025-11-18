
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
  AlertTriangle,
  Clock,
  Signal,
  ListFilter,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import React, { useState, useEffect, useMemo } from "react"
import { useToast } from "@/hooks/use-toast"
import { Badge, BadgeProps } from "@/components/ui/badge"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuPortal,
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
import { cn } from "@/lib/utils"
import { defaultCategories } from "@/lib/categories"


const mockLiveStreams = [
    { id: 1, seller: { name: 'FashionFinds', avatarUrl: 'https://placehold.co/40x40.png' }, viewers: 1200, streamId: '1', duration: '00:45:12', bitrateHealth: 'Good', warnings: [], category: "Women", subcategory: "Dresses", streamUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4" },
    { id: 2, seller: { name: 'GadgetGuru', avatarUrl: 'https://placehold.co/40x40.png' }, viewers: 2500, streamId: '2', duration: '01:12:30', bitrateHealth: 'Medium', warnings: ['Stream disconnect warning'], category: "Electronics", subcategory: "Smartphones", streamUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" },
    { id: 3, seller: { name: 'BeautyBox', avatarUrl: 'https://placehold.co/40x40.png' }, viewers: 3100, streamId: '4', duration: '00:15:45', bitrateHealth: 'Poor', warnings: ['Chat flood warning', 'Stream disconnect warning'], category: "Beauty", subcategory: "Skincare", streamUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4" },
    { id: 4, seller: { name: 'HomeDecor', avatarUrl: 'https://placehold.co/40x40.png' }, viewers: 800, streamId: '5', duration: '02:30:00', bitrateHealth: 'Good', warnings: [], category: "Home", subcategory: "Decor", streamUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4" },
];

const getHealthBadgeVariant = (health: string): BadgeProps['variant'] => {
    switch (health) {
        case 'Good': return 'success';
        case 'Medium': return 'warning';
        case 'Poor': return 'destructive';
        default: return 'outline';
    }
};

const MonitorDialog = ({ stream, onClose }: { stream: any, onClose: () => void }) => {
    if (!stream) return null;

    return (
        <DialogContent className="max-w-3xl">
            <DialogHeader>
                <DialogTitle>Monitoring: {stream.seller.name}</DialogTitle>
                <DialogDescription>
                    Live feed from stream ID: {stream.streamId}
                </DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                     <video src={stream.streamUrl} className="w-full h-full object-cover" controls autoPlay loop muted />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                    <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Viewers</p>
                        <p className="font-semibold text-lg">{stream.viewers}</p>
                    </div>
                     <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="font-semibold text-lg">{stream.duration}</p>
                    </div>
                     <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Health</p>
                        <p className="font-semibold text-lg">{stream.bitrateHealth}</p>
                    </div>
                </div>
            </div>
        </DialogContent>
    );
};

export default function AdminLiveControlPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [liveStreams, setLiveStreams] = useState(mockLiveStreams);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>("All");
  const [monitoringStream, setMonitoringStream] = useState<any | null>(null);

  const filteredStreams = useMemo(() => {
    return liveStreams.filter(stream => {
      const searchMatch = stream.seller.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const categoryMatch = categoryFilter === "All" || stream.category === categoryFilter;
      const subcategoryMatch = subcategoryFilter === "All" || stream.subcategory === subcategoryFilter;
      return searchMatch && categoryMatch && subcategoryMatch;
    });
  }, [liveStreams, debouncedSearchTerm, categoryFilter, subcategoryFilter]);
  
  useEffect(() => {
    setSubcategoryFilter("All");
  }, [categoryFilter]);


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
    <Dialog open={!!monitoringStream} onOpenChange={(open) => !open && setMonitoringStream(null)}>
    <AdminLayout>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div>
                            <CardTitle>Realtime Live Stream Monitor</CardTitle>
                            <CardDescription>Monitor and manage all ongoing live sessions.</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                type="search"
                                placeholder="Search by seller name..."
                                className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <ListFilter className="h-4 w-4 mr-2" />
                                        Filter: {categoryFilter === 'All' ? 'All' : `${categoryFilter}${subcategoryFilter !== 'All' ? ` > ${subcategoryFilter}` : ''}`}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuRadioGroup value={categoryFilter} onValueChange={setCategoryFilter}>
                                        <DropdownMenuRadioItem value="All">All Categories</DropdownMenuRadioItem>
                                        <DropdownMenuSeparator />
                                        {defaultCategories.map((cat, index) => (
                                            <DropdownMenuSub key={cat.id}>
                                                <DropdownMenuSubTrigger>{cat.name}</DropdownMenuSubTrigger>
                                                <DropdownMenuPortal>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuRadioGroup value={subcategoryFilter} onValueChange={(value) => {
                                                            setCategoryFilter(cat.name);
                                                            setSubcategoryFilter(value);
                                                        }}>
                                                            <DropdownMenuRadioItem value="All">All {cat.name}</DropdownMenuRadioItem>
                                                            <DropdownMenuSeparator />
                                                            {cat.subcategories.map(subcat => (
                                                                <DropdownMenuRadioItem key={subcat.name} value={subcat.name}>{subcat.name}</DropdownMenuRadioItem>
                                                            ))}
                                                        </DropdownMenuRadioGroup>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuPortal>
                                            </DropdownMenuSub>
                                        ))}
                                    </DropdownMenuRadioGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Seller</TableHead>
                                <TableHead className="text-center">Viewers</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Bitrate Health</TableHead>
                                <TableHead>Active Alerts</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStreams.length > 0 ? filteredStreams.map(stream => (
                                <TableRow key={stream.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3 group">
                                            <Avatar>
                                                <AvatarImage src={stream.seller.avatarUrl} />
                                                <AvatarFallback>{stream.seller.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{stream.seller.name}</span>
                                                <span className="text-xs text-muted-foreground">{stream.category} {stream.subcategory && `> ${stream.subcategory}`}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary" className="gap-1.5">
                                            <Users className="h-3 w-3"/>
                                            {stream.viewers}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            {stream.duration}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={getHealthBadgeVariant(stream.bitrateHealth)}>
                                            <Signal className="mr-1 h-3 w-3" />
                                            {stream.bitrateHealth}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {stream.warnings.map((warning, index) => (
                                                <Badge key={index} variant="destructive" className="gap-1.5 text-xs">
                                                    <AlertTriangle className="h-3 w-3" />
                                                    {warning}
                                                </Badge>
                                            ))}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost"><MoreVertical className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onSelect={() => setMonitoringStream(stream)}>
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
                                    <TableCell colSpan={6} className="h-24 text-center">No active live streams found.</TableCell>
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
        <MonitorDialog stream={monitoringStream} onClose={() => setMonitoringStream(null)} />
    </AdminLayout>
    </Dialog>
  )
}

    