
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
  DialogFooter,
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


const mockInquiries: (Inquiry & { id: string })[] = [
    {
        id: 'inq_1',
        name: 'Ganesh Prajapati',
        email: 'ganesh@example.com',
        subject: 'Question about order #MOCK5896',
        message: 'Hi there, I was wondering when my vintage camera will be delivered. The tracking seems to be stuck. Thanks!',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isRead: false,
    },
    {
        id: 'inq_2',
        name: 'Jane Doe',
        email: 'jane.d@example.com',
        subject: 'Return Policy Question',
        message: 'Hello, what is the return policy for electronics? I am thinking of buying the wireless headphones.',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        isRead: true,
    },
    {
        id: 'inq_3',
        name: 'Peter Jones',
        email: 'peter.j@example.com',
        subject: 'Bulk order inquiry',
        message: 'I would like to inquire about placing a bulk order for my company. Who should I speak to?',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        isRead: true,
    }
];


export default function AdminInquiriesPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [inquiries, setInquiries] = useState<(Inquiry & { id: string })[]>(mockInquiries);
  const [selectedInquiry, setSelectedInquiry] = useState<(Inquiry & { id: string }) | null>(null);
  const [replyingToInquiry, setReplyingToInquiry] = useState<(Inquiry & { id: string }) | null>(null);
  const [isDataFetched, setIsDataFetched] = useState(false);

  useEffect(() => {
    if (!loading) {
        if (userData?.role !== 'admin') {
            router.replace('/');
            return;
        }
        if (!isDataFetched) {
            const fetchInquiries = async () => {
                const data = await getInquiries();
                // If fetched data is not empty, merge it with mock data
                // In a real app, you'd likely replace mock data entirely
                if (data.length > 0) {
                    const combined = [...data, ...mockInquiries.filter(m => !data.some(d => d.id === m.id))];
                    setInquiries(combined);
                }
                setIsDataFetched(true);
            };
            fetchInquiries();
        }
    }
  }, [loading, user, userData, router, isDataFetched]);

  const handleViewInquiry = (inquiry: Inquiry & { id: string }) => {
    setSelectedInquiry(inquiry);
    if (!inquiry.isRead) {
        markInquiryRead(inquiry.id).then(() => {
            setInquiries(prev => prev.map(i => i.id === inquiry.id ? { ...i, isRead: true } : i));
        });
    }
  };

  const handleStartReply = (inquiry: Inquiry & { id: string }) => {
    setSelectedInquiry(null); // Close the view dialog if open
    setReplyingToInquiry(inquiry);
  };

  const handleReplyViaMessage = (inquiry: Inquiry & { id: string }) => {
    router.push(`/admin/messages?userId=${inquiry.email}&userName=${inquiry.name}`);
    setReplyingToInquiry(null);
  };
  
  const handleReplyViaEmail = (inquiry: Inquiry & { id: string }) => {
    const subject = `Re: ${inquiry.subject}`;
    const body = `\n\n--- On ${format(parseISO(inquiry.createdAt!), "PPP p")}, ${inquiry.name} wrote: ---\n${inquiry.message}`;
    window.location.href = `mailto:${inquiry.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setReplyingToInquiry(null);
  };


  if (loading || userData?.role !== 'admin') {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>
  }

  return (
    <>
      <Dialog open={!!selectedInquiry} onOpenChange={(isOpen) => !isOpen && setSelectedInquiry(null)}>
        <DialogContent className="max-w-2xl" aria-describedby="inquiry-description">
          {selectedInquiry && (
            <>
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
              <DialogFooter className="flex justify-end gap-2">
                   <DialogClose asChild>
                      <Button type="button" variant="secondary">Close</Button>
                  </DialogClose>
                   <Button onClick={() => handleStartReply(selectedInquiry)}>
                      <Mail className="mr-2 h-4 w-4" /> Reply
                  </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!replyingToInquiry} onOpenChange={(isOpen) => !isOpen && setReplyingToInquiry(null)}>
        <DialogContent>
          {replyingToInquiry && (
            <>
              <DialogHeader>
                  <DialogTitle>Reply to {replyingToInquiry.name}</DialogTitle>
                  <DialogDescription>Choose how you would like to respond to this inquiry.</DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                  <Button className="w-full justify-start h-auto p-4" onClick={() => handleReplyViaMessage(replyingToInquiry)}>
                      <MessageSquare className="mr-3 h-5 w-5" />
                      <div>
                          <p className="font-semibold text-left">Reply via Message</p>
                          <p className="font-normal text-sm text-left">Start a real-time chat on the platform.</p>
                      </div>
                  </Button>
                   <Button className="w-full justify-start h-auto p-4" onClick={() => handleReplyViaEmail(replyingToInquiry)}>
                      <Mail className="mr-3 h-5 w-5" />
                      <div>
                          <p className="font-semibold text-left">Reply via Email</p>
                          <p className="font-normal text-sm text-left">Open your default email client to reply.</p>
                      </div>
                  </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
        
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
                                      <TableCell className="flex justify-end gap-2">
                                          <Button variant="outline" size="sm" onClick={() => handleViewInquiry(inquiry)}>
                                              <Eye className="mr-2 h-4 w-4" /> View
                                          </Button>
                                          <Button variant="default" size="sm" onClick={() => handleStartReply(inquiry)}>
                                              <Mail className="mr-2 h-4 w-4" /> Reply
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
    </>
  )
}
