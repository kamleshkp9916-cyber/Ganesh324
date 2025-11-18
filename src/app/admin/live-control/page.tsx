
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
  Package,
  DollarSign,
  Star,
  Play,
  Pause,
  Volume2,
  VolumeX,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import React, { useState, useEffect, useMemo, useRef } from "react"
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
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"


const mockLiveStreams = [
    { 
        id: 1, 
        seller: { name: 'FashionFinds', avatarUrl: 'https://placehold.co/40x40.png' }, 
        viewers: 1200, 
        streamId: '1', 
        duration: '00:45:12', 
        bitrateHealth: 'Good', 
        warnings: [], 
        category: "Women", 
        subcategory: "Dresses", 
        streamUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        products: [
            { id: 'prod_11', name: 'Denim Jacket', price: 3200.00, image: 'https://picsum.photos/seed/denim-jacket/200/200' },
            { id: 'prod_12', name: 'Floral Maxi Dress', price: 2800.00, image: 'https://picsum.photos/seed/floral-dress/200/200' },
        ],
        revenue: { productSales: 18500, superChats: 1250 }
    },
    { 
        id: 2, 
        seller: { name: 'GadgetGuru', avatarUrl: 'https://placehold.co/40x40.png' }, 
        viewers: 2500, 
        streamId: '2', 
        duration: '01:12:30', 
        bitrateHealth: 'Medium', 
        warnings: ['Stream disconnect warning'], 
        category: "Electronics", 
        subcategory: "Smartphones", 
        streamUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        products: [
            { id: 'prod_2', name: 'Wireless Headphones', price: 4999.00, image: 'https://picsum.photos/seed/headphones/200/200' },
            { id: 'prod_4', name: 'Smart Watch', price: 8750.00, image: 'https://picsum.photos/seed/smart-watch/200/200' },
        ],
        revenue: { productSales: 45200, superChats: 3400 }
    },
    { 
        id: 3, 
        seller: { name: 'BeautyBox', avatarUrl: 'https://placehold.co/40x40.png' }, 
        viewers: 3100, 
        streamId: '4', 
        duration: '00:15:45', 
        bitrateHealth: 'Poor', 
        warnings: ['Chat flood warning', 'Stream disconnect warning'], 
        category: "Beauty", 
        subcategory: "Skincare", 
        streamUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        products: [
            { id: 'prod_15', name: 'Vitamin C Serum', price: 2500.00, image: 'https://placehold.co/200x200.png?text=Serum' },
            { id: 'prod_18', name: 'Hydrating Face Mask', price: 800.00, image: 'https://placehold.co/200x200.png?text=Mask' },
        ],
        revenue: { productSales: 9800, superChats: 800 }
    },
    { 
        id: 4, 
        seller: { name: 'HomeDecor', avatarUrl: 'https://placehold.co/40x40.png' }, 
        viewers: 800, 
        streamId: '5', 
        duration: '02:30:00', 
        bitrateHealth: 'Good', 
        warnings: [], 
        category: "Home", 
        subcategory: "Decor", 
        streamUrl: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        products: [
            { id: 'prod_3', name: 'Handcrafted Vase', price: 2100.00, image: 'https://placehold.co/200x200.png?text=Vase' },
        ],
        revenue: { productSales: 4200, superChats: 350 }
    },
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
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPaused, setIsPaused] = useState(true);
    const [isMuted, setIsMuted] = useState(true);

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            video.muted = true; // Start muted
            const onPlay = () => setIsPaused(false);
            const onPause = () => setIsPaused(true);
            video.addEventListener('play', onPlay);
            video.addEventListener('pause', onPause);
            
            video.play().catch(console.error);

            return () => {
                video.removeEventListener('play', onPlay);
                video.removeEventListener('pause', onPause);
            };
        }
    }, [stream]);

    const handlePlayPause = () => {
        const video = videoRef.current;
        if (video) {
            video.paused ? video.play() : video.pause();
        }
    };

    if (!stream) return null;

    const totalRevenue = (stream.revenue?.productSales || 0) + (stream.revenue?.superChats || 0);

    return (
        <DialogContent className="max-w-4xl">
            <DialogHeader>
                <DialogTitle>Monitoring: {stream.seller.name}</DialogTitle>
                <DialogDescription>
                    Live feed from stream ID: {stream.streamId}
                </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[80vh]">
                <div className="p-1 space-y-4">
                     <div className="aspect-video bg-black rounded-lg overflow-hidden relative group">
                        <video ref={videoRef} src={stream.streamUrl} className="w-full h-full object-cover" loop />
                        <div className="absolute top-2 left-2 z-10 flex items-center gap-2">
                            <Badge variant="destructive" className="live-pulse-beam">LIVE</Badge>
                            <Badge variant="secondary" className="bg-black/50 text-white"><Users className="w-3 h-3 mr-1"/>{stream.viewers.toLocaleString()}</Badge>
                        </div>
                         <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <Button variant="ghost" size="icon" className="text-white h-16 w-16" onClick={handlePlayPause}>
                                {isPaused ? <Play className="h-8 w-8 fill-white" /> : <Pause className="h-8 w-8 fill-white" />}
                            </Button>
                        </div>
                        <div className="absolute bottom-2 right-2 z-10">
                            <Button variant="ghost" size="icon" className="text-white h-8 w-8 bg-black/40 hover:bg-black/60" onClick={() => setIsMuted(prev => !prev)}>
                                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
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
                    <Separator />
                    <div>
                        <h4 className="font-semibold mb-2">Live Revenue</h4>
                         <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
                                <p className="text-xs text-green-800 dark:text-green-300">Product Sales</p>
                                <p className="font-semibold text-lg">₹{stream.revenue.productSales.toLocaleString()}</p>
                            </div>
                            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg">
                                <p className="text-xs text-yellow-800 dark:text-yellow-300">Super Chats</p>
                                <p className="font-semibold text-lg">₹{stream.revenue.superChats.toLocaleString()}</p>
                            </div>
                             <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
                                <p className="text-xs text-blue-800 dark:text-blue-300">Total Revenue</p>
                                <p className="font-semibold text-lg">₹{totalRevenue.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                     <div>
                        <h4 className="font-semibold mb-2">Featured Products ({stream.products.length})</h4>
                        <div className="space-y-2">
                            {stream.products.map((product: any) => (
                                <Link key={product.id} href={`/product/${product.id}`} target="_blank">
                                    <Card className="hover:bg-muted/50 transition-colors">
                                        <CardContent className="p-2 flex items-center gap-3">
                                            <Image src={product.image} alt={product.name} width={56} height={56} className="w-14 h-14 rounded-md" />
                                            <div className="flex-grow">
                                                <p className="font-medium text-sm">{product.name}</p>
                                                <p className="text-xs text-muted-foreground">₹{product.price.toLocaleString()}</p>
                                            </div>
                                             <Button variant="outline" size="sm">View Product</Button>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </ScrollArea>
             <DialogFooter className="p-4 border-t">
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Close</Button>
                </DialogClose>
            </DialogFooter>
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
        {monitoringStream && <MonitorDialog stream={monitoringStream} onClose={() => setMonitoringStream(null)} />}
    </AdminLayout>
    </Dialog>
  )
}
