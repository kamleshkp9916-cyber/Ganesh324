
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
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import React, { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"

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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
} from "@/components/ui/pagination"
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
import { getInquiries, markInquiryRead, Inquiry } from "@/ai/flows/contact-flow"
import { cn } from "@/lib/utils"
import { AdminLayout } from "@/components/admin/admin-layout"


export default function AdminInquiriesPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [inquiries, setInquiries] = useState<(Inquiry & { id: string })[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<(Inquiry & { id: string }) | null>(null);

  useEffect(() => {
    if (!loading) {
        if (userData?.role !== 'admin') {
            router.replace('/');
            return;
        }
        const fetchInquiries = async () => {
            const data = await getInquiries();
            setInquiries(data);
        };
        fetchInquiries();
    }
  }, [loading, user, userData, router]);

  const handleViewInquiry = (inquiry: Inquiry & { id: string }) => {
    setSelectedInquiry(inquiry);
    if (!inquiry.isRead) {
        markInquiryRead(inquiry.id).then(() => {
            setInquiries(prev => prev.map(i => i.id === inquiry.id ? { ...i, isRead: true } : i));
        });
    }
  };

  const handleReplyToInquiry = (inquiry: Inquiry & {id: string}) => {
    router.push(`/admin/messages?userId=${inquiry.email}&userName=${inquiry.name}`);
  }

  if (loading || userData?.role !== 'admin') {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>
  }

  return (
    <Dialog open={!!selectedInquiry} onOpenChange={(isOpen) => !isOpen && setSelectedInquiry(null)}>
        <AdminLayout>
            <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Inquiries</CardTitle>
                        <CardDescription>Messages sent from the contact us form.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>From</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead><span className="sr-only">Actions</span></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {inquiries.map(inquiry => (
                                    <TableRow key={inquiry.id} className={cn(!inquiry.isRead && "font-bold")}>
                                        <TableCell>{inquiry.name}</TableCell>
                                        <TableCell>{inquiry.subject}</TableCell>
                                        <TableCell>{format(parseISO(inquiry.createdAt!), "dd MMM, yyyy")}</TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" onClick={() => handleViewInquiry(inquiry)}>
                                                <Eye className="mr-2 h-4 w-4" /> View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {inquiries.length === 0 && (
                                     <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">No inquiries yet.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                        <div className="text-xs text-muted-foreground">
                            Showing <strong>1-{inquiries.length}</strong> of <strong>{inquiries.length}</strong> inquiries
                        </div>
                    </CardFooter>
                </Card>
            </main>
        </AdminLayout>
        {selectedInquiry && (
            <DialogContent className="max-w-2xl" aria-describedby="inquiry-description">
                <DialogHeader>
                    <DialogTitle>{selectedInquiry.subject}</DialogTitle>
                    <DialogDescription id="inquiry-description">
                        From: {selectedInquiry.name} ({selectedInquiry.email})
                        <br/>
                        Received on: {format(parseISO(selectedInquiry.createdAt!), "PPP p")}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 whitespace-pre-wrap text-sm">
                    {selectedInquiry.message}
                </div>
                <div className="flex justify-end gap-2">
                     <DialogClose asChild>
                        <Button type="button" variant="secondary">Close</Button>
                    </DialogClose>
                     <Button onClick={() => handleReplyToInquiry(selectedInquiry)}>
                        <Mail className="mr-2 h-4 w-4" /> Reply
                    </Button>
                </div>
            </DialogContent>
        )}
    </Dialog>
  )
}
