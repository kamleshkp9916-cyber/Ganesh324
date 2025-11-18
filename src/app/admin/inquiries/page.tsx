
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
  Ticket,
  ChevronDown,
  User,
  AlertTriangle,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import React, { useState, useEffect, useMemo } from "react"
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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
import { getInquiries, updateInquiry, Inquiry, convertInquiryToTicket } from "@/ai/flows/contact-flow"
import { cn } from "@/lib/utils"
import { AdminLayout } from "@/components/admin/admin-layout"
import { useToast } from "@/hooks/use-toast"


const mockAdmins = [
    { id: 'admin1', name: 'Admin A' },
    { id: 'admin2', name: 'Admin B' },
]

export default function AdminInquiriesPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [inquiries, setInquiries] = useState<(Inquiry & { id: string })[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<(Inquiry & { id: string }) | null>(null);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const { toast } = useToast();

  const fetchInquiries = async () => {
    const data = await getInquiries();
    setInquiries(data.filter(i => !i.isArchived));
    setIsDataFetched(true);
  };
  
  useEffect(() => {
    if (!loading) {
        if (userData?.role !== 'admin') {
            router.replace('/');
            return;
        }
        if (!isDataFetched) {
            fetchInquiries();
        }
    }
  }, [loading, user, userData, router, isDataFetched]);
  
  const handleUpdate = async (id: string, updates: Partial<Inquiry>) => {
    await updateInquiry(id, updates);
    fetchInquiries(); // Re-fetch to update the UI
    toast({ title: "Inquiry Updated", description: "The inquiry has been updated successfully." });
  };
  
  const handleConvertToTicket = async (id: string) => {
    const ticketId = await convertInquiryToTicket(id);
    fetchInquiries();
    toast({ title: "Converted to Ticket", description: `Inquiry has been converted to ticket ${ticketId}.` });
    router.push('/admin/tickets');
  }

  const handleViewInquiry = (inquiry: Inquiry & { id: string }) => {
    setSelectedInquiry(inquiry);
    if (inquiry.status === "New") {
        handleUpdate(inquiry.id, { status: "Open" });
    }
  };
  
  if (loading || !isDataFetched) {
    return <AdminLayout><div className="flex items-center justify-center h-full"><LoadingSpinner /></div></AdminLayout>
  }

  const getPriorityBadgeVariant = (priority: string) => {
      switch (priority) {
          case 'High': return 'destructive';
          case 'Medium': return 'warning';
          default: return 'outline';
      }
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
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
        
      <AdminLayout>
          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
              <Card>
                  <CardHeader>
                      <CardTitle>Inquiries & Requests</CardTitle>
                      <CardDescription>Use this page for business requests, seller onboarding, collaborations, legal/complaints, and feedback.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <Table>
                          <TableHeader>
                              <TableRow>
                                  <TableHead>From</TableHead>
                                  <TableHead>Subject</TableHead>
                                  <TableHead>Category</TableHead>
                                  <TableHead>Priority</TableHead>
                                  <TableHead>Status</TableHead>
                                  <TableHead>Assigned To</TableHead>
                                  <TableHead><span className="sr-only">Actions</span></TableHead>
                              </TableRow>
                          </TableHeader>
                          <TableBody>
                              {inquiries.map(inquiry => (
                                  <TableRow key={inquiry.id} className={cn(inquiry.status === "New" && "font-bold")}>
                                      <TableCell>{inquiry.name}</TableCell>
                                      <TableCell>{inquiry.subject}</TableCell>
                                      <TableCell>{inquiry.category || 'N/A'}</TableCell>
                                      <TableCell><Badge variant={getPriorityBadgeVariant(inquiry.priority || 'Low')}>{inquiry.priority || 'Low'}</Badge></TableCell>
                                      <TableCell><Badge variant={inquiry.status === 'New' ? 'info' : inquiry.status === 'Closed' ? 'success' : 'outline'}>{inquiry.status || 'New'}</Badge></TableCell>
                                      <TableCell>{inquiry.assigneeId || 'Unassigned'}</TableCell>
                                      <TableCell className="flex justify-end gap-2">
                                          <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="outline" size="sm">Actions <ChevronDown className="ml-2 h-4 w-4"/></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onSelect={() => handleViewInquiry(inquiry)}><Eye className="mr-2 h-4 w-4"/>View</DropdownMenuItem>
                                                 <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger>Set Status</DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuRadioGroup value={inquiry.status} onValueChange={(status) => handleUpdate(inquiry.id, { status: status as any })}>
                                                            <DropdownMenuRadioItem value="New">New</DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="Open">Open</DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="Pending">Pending</DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="Closed">Closed</DropdownMenuRadioItem>
                                                        </DropdownMenuRadioGroup>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>
                                                 <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger>Set Priority</DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuRadioGroup value={inquiry.priority} onValueChange={(priority) => handleUpdate(inquiry.id, { priority: priority as any })}>
                                                            <DropdownMenuRadioItem value="Low">Low</DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="Medium">Medium</DropdownMenuRadioItem>
                                                            <DropdownMenuRadioItem value="High">High</DropdownMenuRadioItem>
                                                        </DropdownMenuRadioGroup>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>
                                                 <DropdownMenuSub>
                                                    <DropdownMenuSubTrigger>Assign To</DropdownMenuSubTrigger>
                                                    <DropdownMenuSubContent>
                                                        <DropdownMenuRadioGroup value={inquiry.assigneeId} onValueChange={(id) => handleUpdate(inquiry.id, { assigneeId: id })}>
                                                            {mockAdmins.map(admin => <DropdownMenuRadioItem key={admin.id} value={admin.name}>{admin.name}</DropdownMenuRadioItem>)}
                                                        </DropdownMenuRadioGroup>
                                                    </DropdownMenuSubContent>
                                                </DropdownMenuSub>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onSelect={() => handleConvertToTicket(inquiry.id)}><Ticket className="mr-2 h-4 w-4"/>Convert to Ticket</DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => handleUpdate(inquiry.id, { isArchived: true })}><Archive className="mr-2 h-4 w-4"/>Archive</DropdownMenuItem>
                                            </DropdownMenuContent>
                                          </DropdownMenu>
                                      </TableCell>
                                  </TableRow>
                              ))}
                              {inquiries.length === 0 && (
                                   <TableRow>
                                      <TableCell colSpan={7} className="h-24 text-center">No inquiries yet.</TableCell>
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
