
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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
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


const FLAGGED_COMMENTS_KEY = 'streamcart_flagged_comments';
const PROMOTIONAL_SLIDES_KEY = 'streamcart_promotional_slides';

const announcementSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters."),
    message: z.string().min(10, "Message must be at least 10 characters.")
})

const warningSchema = z.object({
    userId: z.string().min(1, "User ID or Email is required."),
    message: z.string().min(10, "Warning message must be at least 10 characters.")
})

const slideSchema = z.object({
    id: z.number().optional(),
    title: z.string().min(3, "Title is required."),
    description: z.string().min(5, "Description is required."),
    imageUrl: z.string().url("A valid image URL is required."),
    hint: z.string().optional(),
    expiresAt: z.date().optional(),
});
export type Slide = z.infer<typeof slideSchema>;

const initialFlaggedContent = [
    { id: 1, type: 'User Profile', content: 'Inappropriate bio for user "SpamBot99"', targetId: 'SpamBot99', reporter: 'AdminBot', status: 'Pending' },
    { id: 2, type: 'Product Image', content: 'Misleading image for "Magic Beans"', targetId: 'prod_1', reporter: 'JaneDoe', status: 'Pending' },
    { id: 3, type: 'Chat Message', content: 'Harassment in chat from "User123"', targetId: 'User123', reporter: 'User456', status: 'Pending' },
    { id: 4, type: 'Live Stream', content: 'Off-topic content in "GadgetGuru" stream', targetId: 'GadgetGuru', reporter: 'CommunityMod', status: 'Reviewed' },
];

const initialOfferSlides: Slide[] = [
  {
    id: 1,
    imageUrl: 'https://placehold.co/1200x400.png',
    title: 'Flash Sale!',
    description: 'Up to 50% off on electronics.',
    hint: 'electronics sale',
    expiresAt: new Date(new Date().setDate(new Date().getDate() + 7)), // Expires in 7 days
  },
  {
    id: 2,
    imageUrl: 'https://placehold.co/1200x400.png',
    title: 'New Arrivals',
    description: 'Check out the latest fashion trends.',
    hint: 'fashion clothing runway',
  },
  {
    id: 3,
    imageUrl: 'https://placehold.co/1200x400.png',
    title: 'Home Decor Deals',
    description: 'Beautify your space for less.',
    hint: 'modern living room',
  },
];


const SlideForm = ({ onSave, existingSlide, closeDialog }: { onSave: (slide: Slide) => void, existingSlide?: Slide, closeDialog: () => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<z.infer<typeof slideSchema>>({
        resolver: zodResolver(slideSchema),
        defaultValues: existingSlide ? { ...existingSlide, expiresAt: existingSlide.expiresAt ? new Date(existingSlide.expiresAt) : undefined } : {
            title: "",
            description: "",
            imageUrl: "",
            hint: "",
        },
    });

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                form.setValue('imageUrl', event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const onSubmit = (values: z.infer<typeof slideSchema>) => {
        setIsLoading(true);
        // Simulate network delay
        setTimeout(() => {
            onSave({ ...values, id: existingSlide?.id || Date.now() });
            setIsLoading(false);
            closeDialog();
        }, 500);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Flash Sale!" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Description</FormLabel><FormControl><Input placeholder="e.g., Up to 50% off..." {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
                 <FormField control={form.control} name="imageUrl" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Image</FormLabel>
                        <div className="flex items-center gap-4">
                            <FormControl>
                                <Input type="text" placeholder="Or paste image URL" {...field} />
                            </FormControl>
                             <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                                <UploadCloud className="mr-2 h-4 w-4" /> Upload
                            </Button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </div>
                        {field.value && (
                            <div className="mt-2 relative w-full aspect-video rounded-md overflow-hidden">
                                <Image src={field.value} alt="Slide preview" layout="fill" objectFit="cover" />
                            </div>
                        )}
                        <FormMessage />
                    </FormItem>
                )}/>
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
                                {field.value ? (
                                    format(field.value, "PPP")
                                ) : (
                                    <span>Pick a date</span>
                                )}
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
                        <FormDescription>
                            The promotion will be automatically hidden after this date.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter className="pt-4">
                    <Button type="button" variant="ghost" onClick={closeDialog}>Cancel</Button>
                    <Button type="submit" disabled={isLoading}>
                         {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Slide
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
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isSlideFormOpen, setIsSlideFormOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | undefined>(undefined);

  useEffect(() => {
    // Load slides from local storage
    const storedSlides = localStorage.getItem(PROMOTIONAL_SLIDES_KEY);
    if (storedSlides) {
        // Need to parse date strings back into Date objects
        const parsedSlides = JSON.parse(storedSlides).map((s: any) => ({...s, expiresAt: s.expiresAt ? new Date(s.expiresAt) : undefined }));
        setSlides(parsedSlides);
    } else {
        setSlides(initialOfferSlides);
    }
  }, []);

  const saveSlides = (newSlides: Slide[]) => {
      setSlides(newSlides);
      localStorage.setItem(PROMOTIONAL_SLIDES_KEY, JSON.stringify(newSlides));
      window.dispatchEvent(new Event('storage')); // Notify other tabs
  };

  const handleSaveSlide = (slide: Slide) => {
    const existingIndex = slides.findIndex(s => s.id === slide.id);
    let newSlides;
    if (existingIndex > -1) {
        newSlides = [...slides];
        newSlides[existingIndex] = slide;
    } else {
        newSlides = [{ ...slide, id: Date.now() }, ...slides];
    }
    saveSlides(newSlides);
    toast({ title: "Promotion Saved!", description: "The promotional slide has been updated." });
  };

  const handleDeleteSlide = (slideId: number) => {
      saveSlides(slides.filter(s => s.id !== slideId));
      toast({ title: "Promotion Deleted!", description: "The promotional slide has been removed.", variant: "destructive" });
  };

  const openSlideForm = (slide?: Slide) => {
      setEditingSlide(slide);
      setIsSlideFormOpen(true);
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
        <Dialog open={isSlideFormOpen} onOpenChange={setIsSlideFormOpen}>
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
                            <CardTitle>Promotion & Offer Management</CardTitle>
                            <CardDescription>Manage the promotional slides on the live selling page carousel.</CardDescription>
                        </div>
                        <Button size="sm" onClick={() => openSlideForm()}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add New Slide
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {slides.length > 0 ? slides.map(slide => (
                             <div key={slide.id} className={cn("flex items-center justify-between rounded-lg border p-4", slide.expiresAt && new Date(slide.expiresAt) < new Date() && "bg-muted/50")}>
                                <div className="flex items-center gap-4">
                                    <div className="w-24 h-12 bg-muted rounded-md overflow-hidden relative">
                                         <Image src={slide.imageUrl} alt={slide.title} layout="fill" objectFit="cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{slide.title}</h4>
                                        <p className="text-xs text-muted-foreground">{slide.description}</p>
                                        {slide.expiresAt ? (
                                            <p className={cn("text-xs mt-1", new Date(slide.expiresAt) < new Date() ? 'text-destructive font-semibold' : 'text-muted-foreground')}>
                                                Expires on: {format(new Date(slide.expiresAt), 'PPP')}
                                                {new Date(slide.expiresAt) < new Date() && <Badge variant="destructive" className="ml-2">Expired</Badge>}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                     <Button variant="ghost" size="icon" onClick={() => openSlideForm(slide)}><Edit className="h-4 w-4" /></Button>
                                     <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteSlide(slide.id!)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-muted-foreground py-4">No promotional slides have been added yet.</p>
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
                <DialogTitle>{editingSlide ? 'Edit' : 'Add New'} Promotional Slide</DialogTitle>
                <DialogDescription>
                    Fill in the details for the promotional slide. It will appear on the live selling page.
                </DialogDescription>
            </DialogHeader>
            <SlideForm 
                onSave={handleSaveSlide} 
                existingSlide={editingSlide}
                closeDialog={() => setIsSlideFormOpen(false)}
            />
        </DialogContent>
        </Dialog>
  )
}
