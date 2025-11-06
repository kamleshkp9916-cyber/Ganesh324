
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
  Contact,
  Info,
  Link2,
  Truck,
  GanttChart,
  Check,
  X,
  Clock,
  LayoutGrid,
  Wallet,
  Banknote,
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import React, { useState, useEffect, useRef, useMemo } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/use-auth"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useAuthActions } from "@/lib/auth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { CATEGORIES_KEY, defaultCategories, Category, Subcategory } from "@/lib/categories";
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { AddBankForm, WithdrawForm } from "@/components/settings-forms"
import { SellerHeader } from "@/components/seller/seller-header"
import { UserData } from "@/lib/follow-data"

export const COUPONS_KEY = 'streamcart_coupons';
export const PROMOTIONAL_SLIDES_KEY = 'streamcart_promotional_slides';
export const CATEGORY_BANNERS_KEY = 'streamcart_category_banners';
export const FOOTER_CONTENT_KEY = 'streamcart_footer_content';
export const HUB_BANNER_KEY = 'streamcart_hub_banner';
export const HUB_FEATURED_PRODUCTS_KEY = 'streamcart_hub_featured_products';
export const SHIPPING_SETTINGS_KEY = 'streamcart_shipping_settings';
export const PAYOUT_REQUESTS_KEY = 'streamcart_payout_requests';

export default function SellerSettingsPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast()
  
  const [isMounted, setIsMounted] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [payoutRequests, setPayoutRequests] = useLocalStorage<any[]>(PAYOUT_REQUESTS_KEY, []);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleWithdraw = (amount: number, bankAccountId: string) => {
    if (!user || !userData) return;
    
    // KYC Check
    if (userData.kycStatus !== 'verified' || !userData.bank) {
        toast({
            variant: "destructive",
            title: "KYC Not Verified",
            description: "Please complete and verify your KYC bank details before requesting a payout.",
        });
        router.push('/seller/settings/kyc'); 
        return;
    }

     const newRequest = {
       id: Date.now(),
       sellerId: user.uid,
       sellerName: userData.displayName,
       amount: amount,
       status: 'pending',
       requestedAt: new Date().toISOString(),
     };

     setPayoutRequests(prev => [newRequest, ...prev]);

    toast({
       title: "Withdrawal Request Submitted",
       description: `Your request for ₹${amount} has been sent for admin approval.`,
   });
    setIsWithdrawOpen(false);
 };
  
  if (!isMounted || loading || !userData) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>
  }

  const isSeller = userData?.role === 'seller';

  if (!isSeller) {
      router.replace('/live-selling');
      return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>
  }

  return (
        <div className="flex min-h-screen w-full flex-col bg-muted/40">
            <SellerHeader />
            <main className="grid flex-1 items-start gap-8 p-4 sm:px-6 md:p-8">
                 {isSeller && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Banknote /> Payout & KYC Settings</CardTitle>
                            <CardDescription>Manage your payout bank accounts and complete your KYC.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           <p className="text-sm text-muted-foreground">
                                Your KYC status is: <Badge variant={userData.kycStatus === 'verified' ? 'success' : 'warning'}>{userData.kycStatus || 'Not Submitted'}</Badge>.
                                You must have verified KYC details to withdraw funds.
                           </p>
                        </CardContent>
                         <CardFooter className="border-t pt-6">
                            <Button asChild>
                                <Link href="/seller/settings/kyc">Manage KYC & Bank Details</Link>
                            </Button>
                        </CardFooter>
                    </Card>
                 )}
                 <Card>
                      <CardHeader>
                          <CardTitle>Payout History</CardTitle>
                          <CardDescription>Review your past and pending withdrawal requests.</CardDescription>
                      </CardHeader>
                      <CardContent>
                          <Table>
                              <TableHeader>
                                  <TableRow>
                                      <TableHead>Date</TableHead>
                                      <TableHead>Amount</TableHead>
                                      <TableHead>Status</TableHead>
                                  </TableRow>
                              </TableHeader>
                              <TableBody>
                                  {payoutRequests.filter(p => p.sellerId === user?.uid).map(request => (
                                      <TableRow key={request.id}>
                                          <TableCell>{format(new Date(request.requestedAt), "dd MMM, yyyy")}</TableCell>
                                          <TableCell>₹{request.amount.toFixed(2)}</TableCell>
                                          <TableCell>
                                            <div className="flex flex-col">
                                              <Badge variant={
                                                  request.status === 'paid' ? 'success' :
                                                  request.status === 'pending' ? 'warning' : 'destructive'
                                              }>
                                                  {request.status}
                                              </Badge>
                                               {request.status === 'paid' && request.payoutDate && (
                                                    <span className="text-xs text-muted-foreground mt-1">
                                                        {format(new Date(request.payoutDate), "dd MMM, yyyy, p")}
                                                    </span>
                                                )}
                                            </div>
                                          </TableCell>
                                      </TableRow>
                                  ))}
                                   {payoutRequests.filter(p => p.sellerId === user?.uid).length === 0 && (
                                    <TableRow>
                                        <TableCell>{format(new Date(), "dd MMM, yyyy")}</TableCell>
                                        <TableCell>₹5000.00</TableCell>
                                        <TableCell>
                                            <Badge variant="warning">pending</Badge>
                                        </TableCell>
                                    </TableRow>
                                  )}
                              </TableBody>
                          </Table>
                      </CardContent>
                  </Card>
            </main>
        </div>
  )
}
