
"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/footer';

// Single-file React component (default export)
// Requirements: Tailwind CSS + framer-motion installed
// How to use: paste into your React app (e.g. src/components/OrdersPage.jsx)
// This version includes: more mock orders, return/cancel flow with reasons, attach photos,
// pickup vs drop-off choice, mock refund lifecycle (refund initiated after pickup),
// a help bot UI with quick actions, and a Transactions tab showing payments/refunds/failed payments.

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
    returnRequest: null,
    shippingAddress: {
      name: "Rahul Sharma",
      phone: "+91 9876543210",
      line1: "Flat 12A, Sunrise Apartments",
      line2: "MG Road",
      city: "Ahmedabad",
      state: "Gujarat",
      postalCode: "380015",
      country: "India",
    },
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
    status: "delivered",
    returnRequest: null,
    shippingAddress: {
      name: "Anita Patel",
      phone: "+91 9123456780",
      line1: "House 8, Rose Villa",
      line2: "Sector 14",
      city: "Surat",
      state: "Gujarat",
      postalCode: "395007",
      country: "India",
    },
  },
  {
    id: "ORD-1003",
    product: {
      id: "P-003",
      name: "Mock Tripod Lite",
      sku: "MT-LT-03",
      price: 39.99,
      image:
        "https://images.unsplash.com/photo-1516035050018-7e8a6f12b9b9?w=800&q=60",
    },
    placedAt: "2025-10-31T10:05:00.000Z",
    status: "packed",
    returnRequest: null,
    shippingAddress: {
      name: "Ganesh Prajapati",
      phone: "+91 9988776655",
      line1: "Plot 23, Village Road",
      line2: "Near Primary School",
      city: "Rajkot",
      state: "Gujarat",
      postalCode: "360001",
      country: "India",
    },
  },
  {
    id: "ORD-1004",
    product: {
      id: "P-004",
      name: "Mock SD Card 128GB",
      sku: "MSD-128",
      price: 19.99,
      image:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=60",
    },
    placedAt: "2025-10-25T08:20:00.000Z",
    status: "out_for_delivery",
    returnRequest: null,
    shippingAddress: {
      name: "Vikram Singh",
      phone: "+91 9090909090",
      line1: "Shop 5, Central Market",
      line2: "Station Road",
      city: "Vadodara",
      state: "Gujarat",
      postalCode: "390001",
      country: "India",
    },
  },
];

const ALL_STAGES = [
  { key: "ordered", label: "Order placed" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

// Mock transactions (payments/refunds/failed)
let MOCK_TRANSACTIONS = [
  { id: "TX-9001", orderId: "ORD-1001", type: "payment", amount: 499.99, status: "successful", at: "2025-10-28T09:16:00.000Z" },
  { id: "TX-9002", orderId: "ORD-1002", type: "payment", amount: 129.99, status: "successful", at: "2025-10-30T13:46:00.000Z" },
  { id: "TX-9003", orderId: "ORD-1004", type: "payment", amount: 19.99, status: "failed", at: "2025-10-25T08:21:00.000Z" },
];

function pushTransaction(tx: any) {
  const newTx = { id: `TX-${Math.floor(10000 + Math.random() * 90000)}`, ...tx };
  MOCK_TRANSACTIONS = [newTx, ...MOCK_TRANSACTIONS];
  return newTx;
}

// Mock delivery API call — replace this function with real fetch to the delivery API
function fetchDeliveryStatusMock(orderId: any) {
  // Simulate varied timestamps and stage completions per orderId
  const now = new Date();
  const base = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2); // two days ago

  // Create timestamps for each stage (some completed, some pending)
  const timestamps = ALL_STAGES.map((s, i) => {
    const t = new Date(base.getTime() + i * 1000 * 60 * 60 * 8); // 8 hours apart
    return t.toISOString();
  });

  // Determine completed stages based on orderId (just for variety)
  let completedCount = 2; // default
  if (orderId.endsWith("1")) completedCount = 3; // shipped
  if (orderId.endsWith("2")) completedCount = 5; // delivered
  if (orderId.endsWith("3")) completedCount = 2; // packed
  if (orderId.endsWith("4")) completedCount = 4; // out_for_delivery

  const stages = ALL_STAGES.map((s, idx) => ({
    key: s.key,
    label: s.label,
    completed: idx <= completedCount - 1,
    timestamp: idx <= completedCount - 1 ? timestamps[idx] : null,
  }));

  // Simulate network delay
  return new Promise((res) => setTimeout(() => res({ orderId, stages }), 400));
}

// Mock submit return request API function
function submitReturnRequestMock({ orderId, type, reason, contactPhone, pickup, photos }: any) {
  return new Promise((res) =>
    setTimeout(() => {
      const resp: any = {
        orderId,
        status: "requested",
        type, // 'cancel' or 'return'
        reason,
        pickup: pickup || "dropoff",
        contactPhone: contactPhone || null,
        photos: photos?.map((p: any, i: number) => ({ id: `IMG-${Date.now()}-${i}`, name: p.name })) || [],
        requestedAt: new Date().toISOString(),
      };
      // create a pending refund transaction (refund will be completed after pickup in mock)
      const refundTx = pushTransaction({ orderId, type: "refund", amount: 0, status: "pending", at: new Date().toISOString() });
      resp.refundTx = refundTx;
      res(resp);
    }, 900)
  );
}

// Mock: simulate pickup completed by delivery partner — this will mark refund as completed
function simulatePickupComplete(orderId: any) {
  // find the pending refund tx and mark as successful and add amount
  const txIndex = MOCK_TRANSACTIONS.findIndex((t) => t.orderId === orderId && t.type === "refund" && t.status === "pending");
  if (txIndex !== -1) {
    MOCK_TRANSACTIONS[txIndex] = { ...MOCK_TRANSACTIONS[txIndex], status: "successful", amount:  Math.round((Math.random()*100 + 20) * 100)/100 };
    return MOCK_TRANSACTIONS[txIndex];
  }
  return null;
}

function OrderDetail({ order, statusData, loading, onBack, onRequestReturn, onSimulatePickup }: any) {
  const stages = statusData?.stages ?? ALL_STAGES.map((s: any) => ({ key: s.key, label: s.label, completed: false, timestamp: null }));

  const completedCount = stages.filter((s: any) => s.completed).length;
  const percent = Math.round((completedCount / ALL_STAGES.length) * 100);

  // Determine current stage key
  const currentStage = stages.slice().reverse().find((s: any) => s.completed)?.key ?? 'ordered';

  // Return / cancel rules:
  // - If order is packed but not yet shipped -> allow 'Cancel order' (type: 'cancel')
  // - If order is delivered -> allow 'Request return' (type: 'return')
  // Updated rule: user can cancel any time BEFORE 'out_for_delivery' stage.
  const outForDeliveryCompleted = stages.find((s: any) => s.key === 'out_for_delivery')?.completed;
  const isDelivered = stages.find((s: any) => s.key === 'delivered')?.completed;

  const allowCancel = !outForDeliveryCompleted && !isDelivered; // cancel allowed before out_for_delivery
  const allowReturn = isDelivered;

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <img src={order.product.image} className="w-20 h-20 rounded-lg object-cover" alt="product" />
          <div>
            <div className="text-lg font-semibold">{order.product.name}</div>
            <div className="text-xs text-slate-500">{order.id} • {order.product.sku}</div>
            <div className="text-sm text-slate-700 mt-1">₹{order.product.price.toFixed(2)}</div>
            {order.shippingAddress && (
              <div className="mt-2 text-xs text-slate-400">To: {order.shippingAddress.name} • {order.shippingAddress.city} • {order.shippingAddress.postalCode}</div>
            )}
            {order.returnRequest && (
              <div className="mt-2 text-xs text-amber-700">Return requested: {order.returnRequest.type} • {order.returnRequest.status}</div>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500">Progress</div>
          <div className="text-lg font-semibold">{percent}%</div>
          <div className="mt-2 text-xs text-slate-400">Placed on {new Date(order.placedAt).toLocaleDateString()}</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="w-full bg-slate-100 rounded-full overflow-hidden h-2">
          <div className="h-2 rounded-full bg-indigo-500 transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-medium">Delivery Timeline</div>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-sm text-indigo-600 hover:underline">Back to orders</button>
          {/* Return / Cancel buttons shown based on rules */}
          {allowCancel && !order.returnRequest && (
            <button onClick={() => onRequestReturn('cancel')} className="text-sm px-3 py-1 rounded-md border bg-amber-50 text-amber-700">Cancel order</button>
          )}

          {allowReturn && !order.returnRequest && (
            <button onClick={() => onRequestReturn('return')} className="text-sm px-3 py-1 rounded-md border bg-red-50 text-red-700">Request return</button>
          )}

          {order.returnRequest && (
            <div className="text-xs text-amber-600">Request: {order.returnRequest.type} • {order.returnRequest.status}</div>
          )}

          {/* Small dev/testing helper: simulate pickup to complete refund in mock */}
          {order.returnRequest && order.returnRequest.status !== 'completed' && (
            <button onClick={onSimulatePickup} className="text-sm px-3 py-1 rounded-md border bg-green-50 text-green-700">Simulate pickup (dev)</button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-slate-500">Loading status…</div>
      ) : (
        <div className="space-y-4">
          {stages.map((s: any, idx: number) => (
            <TimelineStep key={s.key} step={s} index={idx} total={ALL_STAGES.length} />
          ))}
        </div>
      )}

      <div className="mt-6 text-xs text-slate-500">This timeline pulls data from the delivery API in production. Each stage shows its timestamp when completed.</div>
    </div>
  );
}

function TimelineStep({ step, index, total }: any) {
  const variants = {
    hidden: { opacity: 0, y: -6 },
    enter: { opacity: 1, y: 0 },
  };

  return (
    <motion.div initial="hidden" animate="enter" variants={variants} className="flex items-start gap-4">
      <div className="flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step.completed ? 'bg-indigo-500 text-white border-transparent' : 'bg-white text-slate-400 border-slate-200'}`}>
          {step.completed ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M9 16.2l-3.5-3.5L4 14.2 9 19.2 20 8.2 17.5 5.7z"/></svg>
          ) : (
            <div className="text-xs font-medium">{index + 1}</div>
          )}
        </div>
        {index < total - 1 && <div className={`w-px flex-1 bg-slate-200 mt-2`} style={{ minHeight: 32 }} />}
      </div>

      <div className="flex-1 pt-0.5">
        <div className="flex items-center justify-between">
          <div className="font-medium text-sm">{step.label}</div>
          <div className="text-xs text-slate-400">{step.timestamp ? new Date(step.timestamp).toLocaleString() : 'Pending'}</div>
        </div>
        <div className="text-xs text-slate-500 mt-1">{step.completed ? 'Completed' : 'Waiting'}</div>
      </div>
    </motion.div>
  );
}

function HelpBot({ orders, selectedOrder, onOpenReturn, onCancelOrder, onShowAddress }: any) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi — I can help with returns, refunds and order status. Use buttons or ask a question.' },
  ]);
  const [input, setInput] = useState("");

  function pushBot(text: any) {
    setMessages((m) => [...m, { from: 'bot', text }]);
  }

  function pushUser(text: any) {
    setMessages((m) => [...m, { from: 'user', text }]);
  }

  async function handleCancel() {
    if (!selectedOrder) { pushBot('Please select an order first (click one on the left).'); return; }
    pushUser('Cancel order');
    pushBot('Checking order status...');
    // call cancel handler
    await onCancelOrder(selectedOrder.id);
    pushBot('Cancel request submitted. Check Transactions tab for refund status.');
  }

  function handleRequestReturn() {
    if (!selectedOrder) { pushBot('Please select an order first (click one on the left).'); return; }
    pushUser('Request return');
    onOpenReturn('return');
    pushBot('Return modal opened. Pick reason, pickup/dropoff and submit.');
  }

  function handleRefundStatus() {
    if (!selectedOrder) { pushBot('Please select an order first (click one on the left).'); return; }
    pushUser('Refund status');
    const tx = orders.find((o: any) => o.id === selectedOrder.id)?.returnRequest?.refundTx;
    if (!tx) pushBot('No refund transaction found for this order yet.');
    else pushBot(`Refund transaction ${tx.id} is currently ${tx.status}.`);
  }

  function handleShowAddress() {
    if (!selectedOrder) { pushBot('Please select an order first (click one on the left).'); return; }
    pushUser('Show address');
    onShowAddress(selectedOrder);
    pushBot('Displayed address for the selected order.');
  }

  function send() {
    if (!input.trim()) return;
    const text = input.trim();
    pushUser(text);
    const msgLower = text.toLowerCase();

    if (msgLower.includes('cancel')) {
      handleCancel();
    } else if (msgLower.includes('return')) {
      handleRequestReturn();
    } else if (msgLower.includes('refund')) {
      handleRefundStatus();
    } else if (msgLower.includes('address')) {
      handleShowAddress();
    } else {
      pushBot("I can help: [Cancel order], [Request return], [Refund status], [Show address]. Or click the buttons below.");
    }

    setInput("");
  }

  return (
    <div className="fixed right-6 bottom-6 z-50">
      {open && (
        <div className="w-96 bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-3 border-b flex items-center justify-between">
            <div className="font-medium">Help</div>
            <button onClick={() => setOpen(false)} className="text-xs text-slate-500">Close</button>
          </div>
          <div className="p-3 h-64 overflow-y-auto text-sm" id="help-chat">
            {messages.map((m, i) => (
              <div key={i} className={`mb-2 ${m.from==='bot' ? 'text-slate-700' : 'text-right'}`}>
                <div className={`${m.from==='bot' ? 'inline-block bg-slate-100 p-2 rounded-md' : 'inline-block bg-indigo-50 p-2 rounded-md'}`}>{m.text}</div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key==='Enter' && send()} className="flex-1 p-2 border rounded-md text-sm" placeholder="Ask: cancel, return, refund, address..." />
            <button onClick={send} className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm">Send</button>
          </div>
          <div className="p-3 border-t flex gap-2">{/* quick action buttons */}
            <button onClick={handleCancel} className="px-2 py-1 rounded-md text-xs bg-amber-50 text-amber-700">Cancel order</button>
            <button onClick={handleRequestReturn} className="px-2 py-1 rounded-md text-xs bg-red-50 text-red-700">Request return</button>
            <button onClick={handleRefundStatus} className="px-2 py-1 rounded-md text-xs border">Refund status</button>
            <button onClick={handleShowAddress} className="px-2 py-1 rounded-md text-xs border">Show address</button>
          </div>
        </div>
      )}

      <button onClick={() => setOpen((o) => !o)} className="w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center">?
      </button>
    </div>
  );
}


export default function OrdersPage() {
    const [orders, setOrders] = useState(MOCK_ORDERS);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [statusData, setStatusData] = useState<any>(null);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [returning, setReturning] = useState(false);
    const [returnReason, setReturnReason] = useState("");
    const [showReturnConfirm, setShowReturnConfirm] = useState(false);
    const [returnType, setReturnType] = useState<any>(null);
    const [returnPickupOption, setReturnPickupOption] = useState("pickup");
    const [contactPhone, setContactPhone] = useState("");
    const [attachedPhotos, setAttachedPhotos] = useState<any[]>([]);
    const [tab, setTab] = useState("orders"); // 'orders' or 'transactions'
    const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS.slice());
    const fileInputRef = useRef<any>(null);
    const router = useRouter();


    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!selectedOrder) return;

        setLoadingStatus(true);
        setStatusData(null);

        // --- Replace below with real API call when backend is ready ---
        // fetch(`/api/delivery/${selectedOrder.id}`)
        //   .then(r => r.json())
        //   .then(data => { setStatusData(data); setLoadingStatus(false); })
        //   .catch(err => { console.error(err); setLoadingStatus(false); });
        // ------------------------------------------------------------

        fetchDeliveryStatusMock(selectedOrder.id)
        .then((data) => {
            setStatusData(data);
        })
        .catch((e) => console.error(e))
        .finally(() => setLoadingStatus(false));
    }, [selectedOrder]);

    // Helper: update order in orders state
    function updateOrder(orderId: any, patch: any) {
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...patch } : o)));
        // also update selectedOrder if it's the same
        if (selectedOrder?.id === orderId) setSelectedOrder((s) => ({ ...s, ...patch }));
    }

    // Called when user confirms a cancel/return
    async function handleSubmitReturn() {
        if (!selectedOrder || !returnType) return;
        setReturning(true);
        try {
        const resp: any = await submitReturnRequestMock({
            orderId: selectedOrder.id,
            type: returnType,
            reason: returnReason,
            contactPhone,
            pickup: returnPickupOption,
            photos: attachedPhotos,
        });
        // update UI — store return request info on order
        updateOrder(selectedOrder.id, { returnRequest: resp, status: returnType === 'cancel' ? 'cancel_requested' : (selectedOrder.status) });
        // add refund tx to local list
        setTransactions((t) => [resp.refundTx, ...t]);

        // close confirm
        setShowReturnConfirm(false);
        setReturnReason("");
        setReturnType(null);
        setReturnPickupOption("pickup");
        setContactPhone("");
        setAttachedPhotos([]);
        if (fileInputRef.current) fileInputRef.current.value = null;
        } catch (e) {
        console.error(e);
        // show error to user (not implemented)
        } finally {
        setReturning(false);
        }
    }

    function handlePhotoAttach(e: any) {
        const files = Array.from(e.target.files || []);
        setAttachedPhotos(files);
    }

    // Simulate pickup button (for testing) — in real life pickup will be processed by backend
    function handleSimulatePickup() {
        if (!selectedOrder) return;
        const tx = simulatePickupComplete(selectedOrder.id);
        if (tx) {
        // update transactions state
        setTransactions((t) => [tx, ...t.filter((x) => x.id !== tx.id)]);
        // update order returnRequest status
        const updatedReturn = { ...(selectedOrder.returnRequest || {}), refundTx: tx, status: "pickup_completed", refundedAt: new Date().toISOString() };
        updateOrder(selectedOrder.id, { returnRequest: updatedReturn });
        alert(`Pickup simulated — refund ${tx.status} for ${tx.id}`);
        } else {
        alert("No pending pickup/refund found for this order (mock). Try creating a return request first).");
        }
    }

    // New: cancel action that can be called by UI or bot. Allows cancel any time before 'out_for_delivery' stage.
    async function handleCancelFromBot(orderId: any) {
        const order = orders.find((o) => o.id === orderId);
        if (!order) return;
        // fetch latest stages (mock)
        const status: any = await fetchDeliveryStatusMock(orderId);
        const outForDeliveryCompleted = status.stages.find((s: any) => s.key === 'out_for_delivery')?.completed;
        if (outForDeliveryCompleted) {
        alert('This order is already out for delivery and cannot be cancelled.');
        return;
        }

        // proceed with cancel request
        const resp: any = await submitReturnRequestMock({ orderId, type: 'cancel', reason: 'Cancelled via help', contactPhone: null, pickup: 'dropoff', photos: [] });
        updateOrder(orderId, { returnRequest: resp, status: 'cancel_requested' });
        setTransactions((t) => [resp.refundTx, ...t]);
        alert('Cancel request submitted via Help Bot.');
    }

    function formatAddress(addr: any) {
        if (!addr) return '';
        return `${addr.name}, ${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}, ${addr.city}, ${addr.state} - ${addr.postalCode}, ${addr.country} • ${addr.phone}`;
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
            <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold">My Orders</h1>
                <div className="w-10"></div>
            </header>
            <main className="flex-grow p-6">
                 <div className="max-w-6xl mx-auto">
                    <header className="mb-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-600">View orders, request returns, and see transactions.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setTab("orders")} className={`px-3 py-1 rounded-md ${tab==='orders' ? 'bg-indigo-600 text-white' : 'border'}`}>Orders</button>
                        <button onClick={() => setTab("transactions")} className={`px-3 py-1 rounded-md ${tab==='transactions' ? 'bg-indigo-600 text-white' : 'border'}`}>Transactions</button>
                    </div>
                    </header>

                    {tab === 'orders' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <div className="bg-white p-4 rounded-2xl shadow-sm">
                        <h2 className="font-medium mb-3">Orders</h2>
                        <div className="space-y-3">
                            {orders.map((o) => (
                            <button
                                key={o.id}
                                onClick={() => setSelectedOrder(o)}
                                className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 hover:shadow transition ${
                                selectedOrder?.id === o.id ? "border-indigo-400 bg-indigo-50" : "border-transparent"
                                }`}
                            >
                                <img src={o.product.image} alt={o.product.name} className="w-14 h-14 rounded-md object-cover" />
                                <div className="flex-1">
                                <div className="text-sm font-medium text-foreground">{o.product.name}</div>
                                <div className="text-xs text-muted-foreground">{o.id} • {isClient ? new Date(o.placedAt).toLocaleString() : ''}</div>
                                <div className="text-xs text-slate-400 mt-1">{formatAddress(o.shippingAddress)}</div>
                                {o.returnRequest && (
                                    <div className="text-xs text-amber-600 mt-1">Return: {o.returnRequest.type} • {o.returnRequest.status}</div>
                                )}
                                </div>
                                <div className="text-sm text-foreground capitalize">{o.status.replace(/_/g, ' ')}</div>
                            </button>
                            ))}
                        </div>
                        </div>

                        <div className="mt-4 text-xs text-slate-500">
                        <div>Note: This frontend uses mock data. When you connect the backend, replace the mock fetch in the code with a real API call to your delivery service.</div>
                        </div>
                    </div>

                    <div className="md:col-span-2">
                        <div className="bg-white p-6 rounded-2xl shadow-sm min-h-[300px]">
                        {!selectedOrder ? (
                            <div className="flex flex-col items-center justify-center h-64">
                            <div className="text-slate-500">No order selected</div>
                            <div className="text-sm mt-2 text-slate-400">Click an order on the left to see its tracking steps.</div>
                            </div>
                        ) : (
                            <OrderDetail
                            order={selectedOrder}
                            statusData={statusData}
                            loading={loadingStatus}
                            onBack={() => setSelectedOrder(null)}
                            onRequestReturn={(type: any) => {
                                setReturnType(type); // 'cancel' or 'return'
                                setShowReturnConfirm(true);
                            }}
                            onSimulatePickup={handleSimulatePickup}
                            />
                        )}
                        </div>
                    </div>
                    </div>
                    )}

                    {tab === 'transactions' && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm">
                        <h2 className="text-lg font-medium mb-4">Transactions</h2>
                        <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="text-xs text-slate-500 text-left">
                            <tr>
                                <th className="py-2">Txn ID</th>
                                <th>Order</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Time</th>
                            </tr>
                            </thead>
                            <tbody>
                            {transactions.map((t) => (
                                <tr key={t.id} className="border-t">
                                <td className="py-2">{t.id}</td>
                                <td>{t.orderId}</td>
                                <td className="capitalize">{t.type}</td>
                                <td>₹{(t.amount ?? 0).toFixed(2)}</td>
                                <td>{t.status}</td>
                                <td className="text-xs text-slate-500">{new Date(t.at).toLocaleString()}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                    )}

                    {/* Return confirmation modal (enhanced) */}
                    {showReturnConfirm && selectedOrder && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-lg">
                        <h3 className="text-lg font-semibold">{returnType === 'cancel' ? 'Cancel order' : 'Request return'}</h3>
                        <p className="text-sm text-slate-600 mt-2">Order <span className="font-medium">{selectedOrder.id}</span> • {selectedOrder.product.name}</p>

                        <label className="block text-xs text-slate-500 mt-4">Reason</label>
                        <select value={returnReason} onChange={(e) => setReturnReason(e.target.value)} className="w-full mt-2 p-2 border rounded-md text-sm">
                            <option value="">-- Select reason --</option>
                            <option value="wrong_item">Wrong item delivered</option>
                            <option value="defective">Item defective / damaged</option>
                            <option value="no_longer_needed">No longer needed</option>
                            <option value="other">Other</option>
                        </select>

                        <label className="block text-xs text-slate-500 mt-3">Pickup vs Drop-off</label>
                        <div className="flex items-center gap-3 mt-2">
                            <label className="flex items-center gap-2"><input type="radio" checked={returnPickupOption==='pickup'} onChange={() => setReturnPickupOption('pickup')} /> Pickup</label>
                            <label className="flex items-center gap-2"><input type="radio" checked={returnPickupOption==='dropoff'} onChange={() => setReturnPickupOption('dropoff')} /> Drop-off</label>
                        </div>

                        <label className="block text-xs text-slate-500 mt-3">Contact phone for pickup (optional)</label>
                        <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full mt-2 p-2 border rounded-md text-sm" placeholder="+91 98XXXXXXXX" />

                        <label className="block text-xs text-slate-500 mt-3">Attach photos (optional)</label>
                        <input ref={fileInputRef} onChange={handlePhotoAttach} type="file" multiple accept="image/*" className="w-full mt-2 text-sm" />

                        <div className="flex items-center gap-3 mt-4 justify-end">
                            <button onClick={() => { setShowReturnConfirm(false); setReturnType(null); }} className="px-3 py-2 rounded-md text-sm border">Cancel</button>
                            <button onClick={handleSubmitReturn} disabled={returning} className="px-3 py-2 rounded-md text-sm bg-indigo-600 text-white disabled:opacity-60">
                            {returning ? 'Submitting...' : returnType === 'cancel' ? 'Confirm Cancel' : 'Submit Return'}
                            </button>
                        </div>

                        <div className="mt-3 text-xs text-slate-500">Note: In this mock, refunds are created as pending and will be marked successful after a simulated pickup. In production your backend will process pickup and refund flows.</div>
                        </div>
                    </div>
                    )}

                    {/* Help bot (improved) */}
                    <HelpBot
                        orders={orders}
                        selectedOrder={selectedOrder}
                        onOpenReturn={(t: any) => { setReturnType(t); setShowReturnConfirm(true); }}
                        onCancelOrder={(id: any) => handleCancelFromBot(id)}
                        onShowAddress={(order: any) => alert(formatAddress(order?.shippingAddress))}
                    />
                </div>
            </main>
            <Footer />
        </div>
    );
}