
"use client";

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminLayout } from "@/components/admin/admin-layout";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import Link from 'next/link';
import { Rocket, Sparkles, Flame, Check, X } from 'lucide-react';
import { productDetails } from '@/lib/product-data';

type PromotionRequest = {
  id: number;
  productId: string;
  sellerName: string;
  tier: 'Category Spotlight' | 'Homepage Banner' | 'Trending Boost';
  requestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
};

const mockRequests: PromotionRequest[] = [
  { id: 1, productId: 'prod_11', sellerName: 'FashionFinds', tier: 'Category Spotlight', requestedAt: new Date(Date.now() - 86400000), status: 'pending' },
  { id: 2, productId: 'prod_2', sellerName: 'GadgetGuru', tier: 'Homepage Banner', requestedAt: new Date(Date.now() - 2 * 86400000), status: 'pending' },
  { id: 3, productId: 'prod_12', sellerName: 'FashionFinds', tier: 'Trending Boost', requestedAt: new Date(Date.now() - 3 * 86400000), status: 'approved' },
  { id: 4, productId: 'prod_14', sellerName: 'Casual Co.', tier: 'Category Spotlight', requestedAt: new Date(Date.now() - 4 * 86400000), status: 'rejected' },
];

export default function AdminPromotionsPage() {
  const [requests, setRequests] = useState<PromotionRequest[]>(mockRequests);
  const { toast } = useToast();

  const handleStatusChange = (id: number, status: 'approved' | 'rejected') => {
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
    toast({
      title: `Request ${status}`,
      description: `The promotion request has been updated.`,
    });
  };

  const RequestsTable = ({ tier }: { tier: PromotionRequest['tier'] }) => {
    const filteredRequests = requests.filter(req => req.tier === tier);
    
    return (
       <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Seller</TableHead>
              <TableHead>Date Requested</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map(req => {
                const product = productDetails[req.productId as keyof typeof productDetails];
                return (
                    <TableRow key={req.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                {product && <Image src={product.images[0]} alt={product.name} width={40} height={40} className="rounded-md" />}
                                <div>
                                    <Link href={`/product/${req.productId}`} className="font-medium hover:underline">{product?.name || 'Unknown Product'}</Link>
                                    <p className="text-xs text-muted-foreground">{req.productId}</p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>{req.sellerName}</TableCell>
                        <TableCell>{req.requestedAt.toLocaleDateString()}</TableCell>
                        <TableCell><Badge variant={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'destructive' : 'warning'}>{req.status}</Badge></TableCell>
                        <TableCell className="text-right">
                            {req.status === 'pending' && (
                                <div className="flex gap-2 justify-end">
                                    <Button size="sm" variant="outline" onClick={() => handleStatusChange(req.id, 'approved')}><Check className="mr-2 h-4 w-4" />Approve</Button>
                                    <Button size="sm" variant="destructive" onClick={() => handleStatusChange(req.id, 'rejected')}><X className="mr-2 h-4 w-4" />Reject</Button>
                                </div>
                            )}
                        </TableCell>
                    </TableRow>
                )
            })}
             {filteredRequests.length === 0 && (
                <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">No requests for this promotion type.</TableCell>
                </TableRow>
             )}
          </TableBody>
        </Table>
    )
  }

  return (
    <AdminLayout>
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Promotional Requests</CardTitle>
            <CardDescription>Approve or reject sponsorship requests from sellers.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="spotlight">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="spotlight"><Sparkles className="mr-2 h-4 w-4" />Category Spotlight</TabsTrigger>
                <TabsTrigger value="homepage"><Rocket className="mr-2 h-4 w-4" />Homepage Banner</TabsTrigger>
                <TabsTrigger value="trending"><Flame className="mr-2 h-4 w-4" />Trending Boost</TabsTrigger>
              </TabsList>
              <TabsContent value="spotlight" className="mt-4">
                <RequestsTable tier="Category Spotlight" />
              </TabsContent>
              <TabsContent value="homepage" className="mt-4">
                <RequestsTable tier="Homepage Banner" />
              </TabsContent>
              <TabsContent value="trending" className="mt-4">
                <RequestsTable tier="Trending Boost" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </AdminLayout>
  );
}
