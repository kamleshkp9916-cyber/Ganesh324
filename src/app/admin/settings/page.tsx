
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
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import React, { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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


const announcementSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters."),
    message: z.string().min(10, "Message must be at least 10 characters.")
})

const warningSchema = z.object({
    userId: z.string().min(1, "User ID or Email is required."),
    message: z.string().min(10, "Warning message must be at least 10 characters.")
})


export default function AdminSettingsPage() {
  const { user, userData, loading } = useAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const { toast } = useToast()
  const [isSendingAnnouncement, setIsSendingAnnouncement] = useState(false)
  const [isSendingWarning, setIsSendingWarning] = useState(false)

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
                            <DropdownMenuItem onSelect={() => router.push('/settings')}>Settings</DropdownMenuItem><DropdownMenuSeparator />
                            <DropdownMenuItem onClick={signOut}>Logout</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
            <main className="grid flex-1 items-start gap-8 p-4 sm:px-6 md:p-8">
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
            </main>
        </div>
  )
}
