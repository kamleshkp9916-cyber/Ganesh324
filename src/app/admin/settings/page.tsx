
"use client"

import {
  ShieldCheck,
  Menu,
  MessageSquare,
  Mail,
  MoreHorizontal,
  Eye,
  Archive,
  ChevronLeft,
  ChevronRight,
  Annoyed,
  Send,
  Loader2,
  FileText,
  Shield,
  Flag,
  Trash2,
  Edit,
  PlusCircle,
  UploadCloud,
  Image as ImageIcon,
  CalendarIcon,
  Ticket,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import React, { useState, useEffect, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"

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
import { useAuth } from "@/hooks/use-auth.tsx"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuthActions } from "@/lib/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { sendAnnouncement, sendWarning } from "@/ai/flows/notification-flow"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Image from "next/image"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


const FLAGGED_COMMENTS_KEY = 'streamcart_flagged_comments';
const COUPONS_KEY = 'streamcart_coupons';

const announcementSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters."),
    message: z.string().min(10, "Message must be at least 10 characters.")
})

const warningSchema = z.object({
    userId: z.string().min(1, "User ID or Email is required."),
    message: z.string().min(10, "Warning message must be at least 10 characters.")
})

const couponSchema = z.object({
  id: z.number().optional(),
  code: z.string().min(3, "Code must be at least 3 characters.").regex(/^[A-Z0-9]+$/, "Code can only contain uppercase letters and numbers."),
  description: z.string().min(5, "Description is required."),
  discountType: z.enum(['percentage', 'fixed']),
  discountValue: z.number().positive("Discount must be a positive number."),
  expiresAt: z.date().optional(),
});
export type Coupon = z.infer<typeof couponSchema>;


const initialFlaggedContent = [
    { id: 1, type: 'User Profile', content: 'Inappropriate bio for user "SpamBot99"', targetId: 'SpamBot99', reporter: 'AdminBot', status: 'Pending' },
    { id: 2, type: 'Product Image', content: 'Misleading image for "Magic Beans"', targetId: 'prod_1', reporter: 'JaneDoe', status: 'Pending' },
    { id: 3, type: 'Chat Message', content: 'Harassment in chat from "User123"', targetId: 'User123', reporter: 'User456', status: 'Pending' },
    { id: 4, type: 'Live Stream', content: 'Off-topic content in "GadgetGuru" stream', targetId: 'GadgetGuru', reporter: 'CommunityMod', status: 'Reviewed' },
];

const initialCoupons: Coupon[] = [
    { id: 1, code: 'STREAM10', description: '10% off on all orders', discountType: 'percentage', discountValue: 10, expiresAt: new Date(new Date().setDate(new Date().getDate() + 7)) },
    { id: 2, code: 'SAVE100', description: '₹100 off on orders above ₹1000', discountType: 'fixed', discountValue: 100 },
];


const CouponForm = ({ onSave, existingCoupon, closeDialog }: { onSave: (coupon: Coupon) => void, existingCoupon?: Coupon, closeDialog: () => void }) => {
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<z.infer<typeof couponSchema>>({
        resolver: zodResolver(couponSchema),
        defaultValues: existingCoupon || {
            code: "",
            description: "",
            discountType: "percentage",
            discountValue: 0,
        },
    });

    const onSubmit = (values: z.infer<typeof couponSchema>) => {
        setIsLoading(true);
        setTimeout(() => {
            onSave({ ...values, id: existingCoupon?.id || Date.now() });
            setIsLoading(false);
            closeDialog();
        }, 500);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="code" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Coupon Code</FormLabel>
                            <FormControl><Input placeholder="e.g., SALE10" {...field} onChange={(e) => field.onChange(e.target.value.toUpperCase())} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="e.g., 10% off electronics" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                     <FormField control={form.control} name="discountType" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Discount Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="discountValue" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Discount Value</FormLabel>
                            <FormControl><Input type="number" placeholder="e.g., 10 or 100" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
                <FormField
                    control={form.control}
                    name="expiresAt"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                        <FormLabel>Expiration Date (Optional)</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild>
                            <FormControl>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[240px] pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                )}
                                >
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date(new Date().setDate(new Date().getDate()-1)) }
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter className="pt-4">
                    <Button type="button" variant="ghost" onClick={closeDialog}>Cancel</Button>
                    <Button type="submit" disabled={isLoading}>
                         {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Coupon
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
};


export default function AdminSettingsPage() {
  const { user, userData, loading } = useAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const { toast } = useToast()
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false)
  const [isSendingWarning, setIsSendingWarning] = useState(false)
  const [contentList, setContentList] = useState(initialFlaggedContent);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isCouponFormOpen, setIsCouponFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | undefined>(undefined);

  useEffect(() => {
    // Load coupons from local storage
    const storedCoupons = localStorage.getItem(COUPONS_KEY);
    if (storedCoupons) {
        const parsedCoupons = JSON.parse(storedCoupons).map((c: any) => ({...c, expiresAt: c.expiresAt ? new Date(c.expiresAt) : undefined }));
        setCoupons(parsedCoupons);
    } else {
        setCoupons(initialCoupons);
    }
  }, []);

  const saveCoupons = (newCoupons: Coupon[]) => {
      setCoupons(newCoupons);
      localStorage.setItem(COUPONS_KEY, JSON.stringify(newCoupons));
      window.dispatchEvent(new Event('storage')); // Notify other tabs
  };

  const handleSaveCoupon = (coupon: Coupon) => {
    const existingIndex = coupons.findIndex(c => c.id === coupon.id);
    let newCoupons;
    if (existingIndex > -1) {
        newCoupons = [...coupons];
        newCoupons[existingIndex] = coupon;
    } else {
        newCoupons = [{ ...coupon, id: Date.now() }, ...coupons];
    }
    saveCoupons(newCoupons);
    toast({ title: "Coupon Saved!", description: `Coupon ${coupon.code} has been updated.` });
  };

  const handleDeleteCoupon = (couponId: number) => {
      saveCoupons(coupons.filter(s => s.id !== couponId));
      toast({ title: "Coupon Deleted!", description: "The coupon has been removed.", variant: "destructive" });
  };

  const openCouponForm = (coupon?: Coupon) => {
      setEditingCoupon(coupon);
      setIsCouponFormOpen(true);
  };


  useEffect(() => {
    const storedFlaggedComments = JSON.parse(localStorage.getItem(FLAGGED_COMMENTS_KEY) || '[]');
    const newFlaggedItems = storedFlaggedComments.map((comment: any, index: number) => ({
        id: initialFlaggedContent.length + index + 1,
        type: 'Chat Message',
        content: `Reported comment: "${comment.message}"`,
        targetId: comment.streamId, // Use streamId as target for review navigation
        reporter: 'User',
        status: 'Pending',
    }));

    setContentList(prev => {
        const existingIds = new Set(prev.map(item => item.content));
        const uniqueNewItems = newFlaggedItems.filter((item: any) => !existingIds.has(item.content));
        return [...prev, ...uniqueNewItems];
    });
  }, []);

  const announcementForm = useForm<z.infer<typeof announcementSchema>>({
    resolver: zodResolver(announcementSchema),
    defaultValues: { title: "", message: "" }
  })

  const warningForm = useForm<z.infer<typeof warningSchema>>({
    resolver: zodResolver(warningSchema),
    defaultValues: { userId: "", message: "" }
  })
  
  const onSendAnnouncement = async (values: z.infer<typeof announcementSchema>) => {
    setIsSendingAnnouncement(true)
    try {
        await sendAnnouncement(values.title, values.message)
        toast({
            title: "Announcement Sent!",
            description: "Your announcement has been sent to all users.",
        })
        announcementForm.reset()
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error Sending Announcement",
            description: "Could not send the announcement. Please try again.",
        })
    } finally {
        setIsSendingAnnouncement(false)
    }
  }

  const onSendWarning = async (values: z.infer<typeof warningSchema>) => {
    setIsSendingWarning(true)
    try {
        await sendWarning(values.userId, values.message)
        toast({
            title: "Warning Sent!",
            description: `A warning has been sent to ${values.userId}.`,
        })
        warningForm.reset()
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error Sending Warning",
            description: "Could not send the warning. Please check the user ID and try again.",
        })
    } finally {
        setIsSendingWarning(false)
    }
  }

  const handleReviewContent = (item: typeof contentList[0]) => {
    let path = '';
    switch (item.type) {
      case 'User Profile':
        path = `/admin/users/${item.targetId}`;
        break;
      case 'Product Image':
        path = `/product/${item.targetId}`;
        break;
      case 'Chat Message':
        path = `/admin/messages?userId=${item.targetId}`;
        break;
      case 'Live Stream':
        path = `/stream/${item.targetId}`;
        break;
      default:
        toast({
            title: "Cannot Review",
            description: "The content type does not have a review page.",
            variant: "destructive"
        });
        return;
    }
    router.push(path);
  };


  const handleRemoveContent = (id: number) => {
    setContentList(prev => prev.filter(item => item.id !== id));
    toast({
        title: "Content Action Taken",
        description: "The flagged content has been removed.",
        variant: "destructive"
    });
  }


  if (loading || userData?.role !== 'admin') {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>
  }

  return (
        <Dialog open={isCouponFormOpen} onOpenChange={setIsCouponFormOpen}>
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-40">
                <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
                    <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base"><ShieldCheck className="h-6 w-6" /><span className="sr-only">Admin</span></Link>
                    <Link href="/admin/dashboard" className="text-muted-foreground transition-colors hover:text-foreground">Dashboard</Link>
                    <Link href="/admin/orders" className="text-muted-foreground transition-colors hover:text-foreground">Orders</Link>
                    <Link href="/admin/users" className="text-muted-foreground transition-colors hover:text-foreground">Users</Link>
                    <Link href="/admin/inquiries" className="text-muted-foreground transition-colors hover:text-foreground">Inquiries</Link>
                    <Link href="/admin/messages" className="text-muted-foreground transition-colors hover:text-foreground">Messages</Link>
                    <Link href="/admin/products" className="text-muted-foreground transition-colors hover:text-foreground">Products</Link>
                    <Link href="/admin/live-control" className="text-muted-foreground transition-colors hover:text-foreground">Live Control</Link>
                    <Link href="/admin/settings" className="text-foreground transition-colors hover:text-foreground">Settings</Link>
                </nav>
                <Sheet>
                    <SheetTrigger asChild><Button variant="outline" size="icon" className="shrink-0 md:hidden"><Menu className="h-5 w-5" /><span className="sr-only">Menu</span></Button></SheetTrigger>
                    <SheetContent side="left">
                        <nav className="grid gap-6 text-lg font-medium">
                            <Link href="/admin/dashboard" className="flex items-center gap-2 text-lg font-semibold"><ShieldCheck className="h-6 w-6" /><span>Admin Panel</span></Link>
                            <Link href="/admin/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link>
                            <Link href="/admin/orders" className="text-muted-foreground hover:text-foreground">Orders</Link>
                            <Link href="/admin/users" className="text-muted-foreground hover:text-foreground">Users</Link>
                            <Link href="/admin/inquiries" className="text-muted-foreground hover:text-foreground">Inquiries</Link>
                            <Link href="/admin/messages" className="text-muted-foreground hover:text-foreground">Messages</Link>
                            <Link href="/admin/products" className="text-muted-foreground hover:text-foreground">Products</Link>
                            <Link href="/admin/live-control" className="text-muted-foreground hover:text-foreground">Live Control</Link>
                             <Link href="/admin/settings" className="hover:text-foreground">Settings</Link>
                        </nav>
                    </SheetContent>
                </Sheet>
                <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
                    <div className="ml-auto"></div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="rounded-full">
                                <Avatar className="h-9 w-9"><AvatarImage src={user?.photoURL || 'https://placehold.co/40x40.png'} /><AvatarFallback>{user?.displayName?.charAt(0)}</AvatarFallback></Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Admin Account</DropdownMenuLabel><DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => router.push('/profile')}>Profile</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => router.push('/settings')}>Settings</DropdownMenuItem><DropdownMenuSeparator />
                            <DropdownMenuItem onClick={signOut}>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
            <main className="grid flex-1 items-start gap-8 p-4 sm:px-6 md:p-8">
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Coupon Management</CardTitle>
                            <CardDescription>Create and manage discount coupons for your store.</CardDescription>
                        </div>
                        <Button size="sm" onClick={() => openCouponForm()}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add New Coupon
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {coupons.length > 0 ? coupons.map(coupon => (
                             <div key={coupon.id} className={cn("flex items-center justify-between rounded-lg border p-4", coupon.expiresAt && new Date(coupon.expiresAt) < new Date() && "bg-muted/50")}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
                                        <Ticket className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{coupon.code}</h4>
                                        <p className="text-xs text-muted-foreground">{coupon.description}</p>
                                        {coupon.expiresAt ? (
                                            <p className={cn("text-xs mt-1", new Date(coupon.expiresAt) < new Date() ? 'text-destructive font-semibold' : 'text-muted-foreground')}>
                                                Expires on: {format(new Date(coupon.expiresAt), 'PPP')}
                                                {new Date(coupon.expiresAt) < new Date() && <Badge variant="destructive" className="ml-2">Expired</Badge>}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Button variant="ghost" size="icon" onClick={() => openCouponForm(coupon)}><Edit className="h-4 w-4" /></Button>
                                     <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteCoupon(coupon.id!)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-muted-foreground py-4">No coupons have been created yet.</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>App-wide Announcement</CardTitle>
                        <CardDescription>Send a notification to all users of the app. Use for feature updates, policy changes, or important announcements.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Form {...announcementForm}>
                         <form onSubmit={announcementForm.handleSubmit(onSendAnnouncement)} className="space-y-4">
                           <FormField control={announcementForm.control} name="title" render={({ field }) => (
                               <FormItem>
                                   <FormLabel>Title</FormLabel>
                                   <FormControl><Input placeholder="e.g., New Feature Added!" {...field} /></FormControl>
                                   <FormMessage />
                               </FormItem>
                           )}/>
                            <FormField control={announcementForm.control} name="message" render={({ field }) => (
                               <FormItem>
                                   <FormLabel>Message</FormLabel>
                                   <FormControl><Textarea placeholder="Describe the announcement..." {...field} /></FormControl>
                                   <FormMessage />
                               </FormItem>
                           )}/>
                            <Button type="submit" disabled={isSendingAnnouncement}>
                                {isSendingAnnouncement && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Send className="mr-2 h-4 w-4" /> Send to All Users
                            </Button>
                         </form>
                       </Form>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle>Send Warning</CardTitle>
                        <CardDescription>Send a direct warning notification to a specific user (seller or buyer).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...warningForm}>
                            <form onSubmit={warningForm.handleSubmit(onSendWarning)} className="space-y-4">
                                <FormField control={warningForm.control} name="userId" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>User ID or Email</FormLabel>
                                        <FormControl><Input placeholder="Enter the user's unique ID or email address" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={warningForm.control} name="message" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Warning Message</FormLabel>
                                        <FormControl><Textarea placeholder="Clearly state the reason for the warning..." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                 <Button type="submit" variant="destructive" disabled={isSendingWarning}>
                                    {isSendingWarning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    <Annoyed className="mr-2 h-4 w-4" /> Send Warning
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Content & Policy Management</CardTitle>
                        <CardDescription>View and manage important site-wide documents.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="flex items-center gap-3">
                                <FileText className="h-6 w-6 text-muted-foreground" />
                                <div>
                                    <h4 className="font-semibold">Terms & Conditions</h4>
                                    <p className="text-xs text-muted-foreground">Last updated: 26 Aug, 2025</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                 <Button asChild variant="outline" size="sm"><Link href="/terms-and-conditions">View</Link></Button>
                                 <Button asChild size="sm"><Link href="/admin/edit/terms">Edit</Link></Button>
                            </div>
                        </div>
                         <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="flex items-center gap-3">
                                <Shield className="h-6 w-6 text-muted-foreground" />
                                <div>
                                    <h4 className="font-semibold">Privacy Policy</h4>
                                    <p className="text-xs text-muted-foreground">Last updated: 26 Aug, 2025</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button asChild variant="outline" size="sm"><Link href="/privacy-and-security">View</Link></Button>
                                <Button asChild size="sm"><Link href="/admin/edit/privacy">Edit</Link></Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle>Flagged Content for Review</CardTitle>
                        <CardDescription>Review content reported by users or the system for violations.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Content/Reason</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {contentList.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell><Badge variant="outline">{item.type}</Badge></TableCell>
                                        <TableCell>
                                            <p className="font-medium">{item.content}</p>
                                            <p className="text-xs text-muted-foreground">Reported by: {item.reporter}</p>
                                        </TableCell>
                                        <TableCell>
                                             <Badge variant={item.status === 'Pending' ? 'destructive' : 'secondary'}>{item.status}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" className="mr-2" onClick={() => handleReviewContent(item)}>Review</Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleRemoveContent(item.id)}>Remove</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {contentList.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            <Flag className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                            No flagged content to review.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </main>
        </div>
         <DialogContent>
            <DialogHeader>
                <DialogTitle>{editingCoupon ? 'Edit' : 'Add New'} Coupon</DialogTitle>
                <DialogDescription>
                    Fill in the details for the discount coupon.
                </DialogDescription>
            </DialogHeader>
            <CouponForm
                onSave={handleSaveCoupon}
                existingCoupon={editingCoupon}
                closeDialog={() => setIsCouponFormOpen(false)}
            />
        </DialogContent>
        </Dialog>
  )
}
