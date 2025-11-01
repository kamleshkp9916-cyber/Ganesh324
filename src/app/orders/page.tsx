
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Circle, Home, Hourglass, Package, PackageCheck, PackageOpen, Truck, Wallet, RefreshCw, BadgeEuro, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/footer";
import { Timeline } from "@/components/timeline";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getTransactions, Transaction } from "@/lib/transaction-history";

const MOCK_ORDERS = [
  {
    id: "ORD-1001",
    product: {
      id: "P-001",
      name: "Mock Camera Pro",
      sku: "MC-PRO-01",
      price: 499.99,
      image:
        "https://images.unsplash.com/photo-1519183071298-a2962be54a73?w=800&q=60",
    },
    placedAt: "2025-10-28T09:15:00.000Z",
    status: "shipped",
    timeline: [
        { key: "ordered", label: "Order placed", completed: true, timestamp: "2025-10-28T09:15:00.000Z" },
        { key: "packed", label: "Packed", completed: true, timestamp: "2025-10-28T17:00:00.000Z" },
        { key: "shipped", label: "Shipped", completed: true, timestamp: "2025-10-29T10:00:00.000Z" },
        { key: "out_for_delivery", label: "Out for delivery", completed: false, timestamp: null },
        { key: "delivered", label: "Delivered", completed: false, timestamp: null },
    ]
  },
  {
    id: "ORD-1002",
    product: {
      id: "P-002",
      name: "Mock Headphones X",
      sku: "MH-X-02",
      price: 129.99,
      image:
        "https://images.unsplash.com/photo-1518444026728-1b3eb0f1b5a0?w=800&q=60",
    },
    placedAt: "2025-10-30T13:45:00.000Z",
    status: "out_for_delivery",
     timeline: [
        { key: "ordered", label: "Order placed", completed: true, timestamp: "2025-10-30T13:45:00.000Z" },
        { key: "packed", label: "Packed", completed: true, timestamp: "2025-10-30T21:00:00.000Z" },
        { key: "shipped", label: "Shipped", completed: true, timestamp: "2025-10-31T11:00:00.000Z" },
        { key: "out_for_delivery", label: "Out for delivery", completed: true, timestamp: "2025-11-01T08:00:00.000Z" },
        { key: "delivered", label: "Delivered", completed: false, timestamp: null },
    ]
  },
];

const ALL_STAGES = [
  { key: "ordered", label: "Order placed" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

function OrderDetail({ order, statusData, loading, onBack }: { order: any, statusData: any, loading: boolean, onBack: () => void }) {
  const stages = statusData?.stages ?? order.timeline ?? ALL_STAGES.map((s: any) => ({ ...s, completed: false, timestamp: null }));

  const completedCount = stages.filter((s: any) => s.completed).length;
  const percent = Math.round((completedCount / ALL_STAGES.length) * 100);

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <img src={order.product.image} className="w-20 h-20 rounded-lg object-cover" alt="product" />
          <div>
            <div className="text-lg font-semibold text-foreground">{order.product.name}</div>
            <div className="text-xs text-muted-foreground">{order.id} • {order.product.sku}</div>
            <div className="text-sm text-foreground mt-1">₹{order.product.price.toFixed(2)}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Progress</div>
          <div className="text-lg font-semibold text-foreground">{percent}%</div>
          <div className="mt-2 text-xs text-muted-foreground">Placed on {new Date(order.placedAt).toLocaleDateString()}</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="w-full bg-muted rounded-full overflow-hidden h-2">
          <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium text-foreground">Delivery Timeline</div>
        <div>
          <button onClick={onBack} className="text-sm text-primary hover:underline">Back to orders</button>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading status…</div>
      ) : (
        <Dialog>
            <DialogTrigger asChild>
                <div className="space-y-4 cursor-pointer">
                    {stages.map((s: any, idx: number) => (
                        <TimelineStep key={s.key} step={s} index={idx} total={ALL_STAGES.length} />
                    ))}
                </div>
            </DialogTrigger>
            <DialogContent>
                <Timeline order={order} />
            </DialogContent>
        </Dialog>
      )}

      <div className="mt-6 text-xs text-muted-foreground">This timeline pulls data from the delivery API in production. Each stage shows its timestamp when completed.</div>
    </div>
  );
}

function TimelineStep({ step, index, total }: { step: any, index: number, total: number }) {
  const variants = {
    hidden: { opacity: 0, y: -6 },
    enter: { opacity: 1, y: 0 },
  };

   const getStatusIcon = (status: string) => {
    if (status.toLowerCase().includes("pending")) return <Hourglass className="h-5 w-5" />;
    if (status.toLowerCase().includes("confirmed")) return <PackageOpen className="h-5 w-5" />;
    if (status.toLowerCase().includes("packed")) return <Package className="h-5 w-5" />;
    if (status.toLowerCase().includes("dispatch")) return <PackageCheck className="h-5 w-5" />;
    if (status.toLowerCase().includes("shipped")) return <Truck className="h-5 w-5" />;
    if (status.toLowerCase().includes("in transit")) return <Truck className="h-5 w-5" />;
    if (status.toLowerCase().includes("out for delivery")) return <Truck className="h-5 w-5" />;
    if (status.toLowerCase().includes("delivered")) return <Home className="h-5 w-5" />;
    if (status.toLowerCase().includes('cancelled') || status.toLowerCase().includes('undelivered') || status.toLowerCase().includes('failed delivery attempt') || status.toLowerCase().includes('return')) return <XCircle className="h-5 w-5" />;
    return <Circle className="h-5 w-5" />;
};

  return (
    <motion.div initial="hidden" animate="enter" variants={variants} className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step.completed ? 'bg-primary text-primary-foreground border-transparent' : 'bg-card text-muted-foreground border-border'}`}>
          {step.completed ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            getStatusIcon(step.key)
          )}
        </div>
        {index < total - 1 && <div className={`w-px flex-1 bg-border mt-2`} style={{ minHeight: 32 }} />}
      </div>

      <div className="flex-1 pt-0.5">
        <div className="flex items-center justify-between">
          <div className="font-medium text-sm text-foreground">{step.label}</div>
          <div className="text-xs text-muted-foreground">{step.timestamp ? new Date(step.timestamp).toLocaleString() : 'Pending'}</div>
        </div>
        <div className="text-xs text-muted-foreground mt-1">{step.completed ? 'Completed' : 'Waiting'}</div>
      </div>
    </motion.div>
  );
}

const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
        case 'Order': return <ShoppingBag className="w-5 h-5 text-blue-500" />;
        case 'Refund': return <RefreshCw className="w-5 h-5 text-green-500" />;
        case 'Deposit': return <Wallet className="w-5 h-5 text-indigo-500" />;
        case 'Withdrawal': return <BadgeEuro className="w-5 h-5 text-red-500" />;
        case 'Bid': return <gavel className="w-5 h-5 text-purple-500" />;
        default: return <Wallet className="w-5 h-5 text-gray-500" />;
    }
}

export default function OrdersPage() {
  const [orders] = useState(MOCK_ORDERS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusData, setStatusData] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setTransactions(getTransactions());
  }, []);

  useEffect(() => {
    if (!selectedOrder) return;

    setLoadingStatus(true);
    setStatusData(null);
    
    setTimeout(() => {
        setStatusData({ orderId: selectedOrder.id, stages: selectedOrder.timeline });
        setLoadingStatus(false);
    }, 500);

  }, [selectedOrder]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
       <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Your Orders</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow p-6">
        <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
                <Tabs defaultValue="orders" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="orders">Orders</TabsTrigger>
                        <TabsTrigger value="transactions">Transactions</TabsTrigger>
                    </TabsList>
                    <TabsContent value="orders">
                        <div className="bg-card p-4 rounded-b-2xl shadow-sm border border-t-0">
                            <div className="space-y-3">
                                {orders.map((o) => (
                                <button
                                    key={o.id}
                                    onClick={() => setSelectedOrder(o)}
                                    className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 hover:shadow transition ${
                                    selectedOrder?.id === o.id ? "border-primary bg-primary/10" : "border-transparent"
                                    }`}
                                >
                                    <img src={o.product.image} alt={o.product.name} className="w-14 h-14 rounded-md object-cover" />
                                    <div className="flex-1">
                                    <div className="text-sm font-medium text-foreground">{o.product.name}</div>
                                    <div className="text-xs text-muted-foreground">{o.id} • {new Date(o.placedAt).toLocaleString()}</div>
                                    </div>
                                    <div className="text-sm text-foreground capitalize">{o.status.replace(/_/g, ' ')}</div>
                                </button>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="transactions">
                        <div className="bg-card p-4 rounded-b-2xl shadow-sm border border-t-0">
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                                {transactions.map((t) => (
                                <div key={t.id} className="w-full text-left p-3 rounded-xl border border-transparent flex items-center gap-3">
                                    <div className="w-14 h-14 rounded-md bg-muted flex items-center justify-center">
                                        {getTransactionIcon(t.type)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-foreground">{t.type}</div>
                                        <div className="text-xs text-muted-foreground">{t.description}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-sm font-semibold ${t.amount > 0 ? 'text-green-500' : 'text-foreground'}`}>
                                            {t.amount > 0 ? '+' : ''}₹{Math.abs(t.amount).toFixed(2)}
                                        </div>
                                        <div className="text-xs text-muted-foreground">{t.date}</div>
                                    </div>
                                </div>
                                ))}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
                <div className="mt-4 text-xs text-muted-foreground">
                    <div>Note: This frontend uses mock data. When you connect the backend, replace the mock fetch in the code with a real API call to your delivery service.</div>
                </div>
            </div>

            <div className="md:col-span-2">
                <div className="bg-card p-6 rounded-2xl shadow-sm border min-h-[300px]">
                {!selectedOrder ? (
                    <div className="flex flex-col items-center justify-center h-64">
                    <div className="text-muted-foreground">No order selected</div>
                    <div className="text-sm mt-2 text-muted-foreground/80">Click an order on the left to see its tracking steps.</div>
                    </div>
                ) : (
                    <OrderDetail
                    order={selectedOrder}
                    statusData={statusData}
                    loading={loadingStatus}
                    onBack={() => setSelectedOrder(null)}
                    />
                )}
                </div>
            </div>
            </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

