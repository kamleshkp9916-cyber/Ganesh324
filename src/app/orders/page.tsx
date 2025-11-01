
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Single-file React component (default export)
// Requirements: Tailwind CSS + framer-motion installed
// How to use: paste into your React app (e.g. src/components/OrdersPage.jsx)
// Tailwind classes are used for styling. Replace mock fetch with your delivery API when backend is ready.

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
  },
];

const ALL_STAGES = [
  { key: "ordered", label: "Order placed" },
  { key: "packed", label: "Packed" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

// Mock delivery API call — replace this function with real fetch to the delivery API when backend is ready
function fetchDeliveryStatusMock(orderId: string) {
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
  if (orderId.endsWith("2")) completedCount = 4; // out_for_delivery

  const stages = ALL_STAGES.map((s, idx) => ({
    key: s.key,
    label: s.label,
    completed: idx <= completedCount - 1,
    timestamp: idx <= completedCount - 1 ? timestamps[idx] : null,
  }));

  // Simulate network delay
  return new Promise((res) => setTimeout(() => res({ orderId, stages }), 500));
}

export default function OrdersPage() {
  const [orders] = useState(MOCK_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [statusData, setStatusData] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

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

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold">Your Orders</h1>
          <p className="text-sm text-slate-600">Click an order to view its delivery status.</p>
        </header>

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
                      <div className="text-sm font-medium">{o.product.name}</div>
                      <div className="text-xs text-slate-500">{o.id} • {new Date(o.placedAt).toLocaleString()}</div>
                    </div>
                    <div className="text-sm text-slate-700">{o.status.replace(/_/g, ' ')}</div>
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
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderDetail({ order, statusData, loading, onBack }: { order: any, statusData: any, loading: boolean, onBack: () => void }) {
  const stages = statusData?.stages ?? ALL_STAGES.map((s) => ({ key: s.key, label: s.label, completed: false, timestamp: null }));

  const completedCount = stages.filter((s: any) => s.completed).length;
  const percent = Math.round((completedCount / ALL_STAGES.length) * 100);

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <img src={order.product.image} className="w-20 h-20 rounded-lg object-cover" alt="product" />
          <div>
            <div className="text-lg font-semibold">{order.product.name}</div>
            <div className="text-xs text-slate-500">{order.id} • {order.product.sku}</div>
            <div className="text-sm text-slate-700 mt-1">₹{order.product.price.toFixed(2)}</div>
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
        <div>
          <button onClick={onBack} className="text-sm text-indigo-600 hover:underline">Back to orders</button>
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

function TimelineStep({ step, index, total }: { step: any, index: number, total: number }) {
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
