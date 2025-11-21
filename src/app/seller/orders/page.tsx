
"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Bell,
  Search,
  Filter,
  Calendar,
  MoreVertical,
  Mail,
  Phone,
  CreditCard,
  Truck,
  MapPin,
  Package,
  Copy,
  Printer,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Box,
  XCircle,
  Check,
  X,
  Sparkles,
  Loader2,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  History,
  List,
  RotateCcw,
  RefreshCcw,
  DollarSign,
  FileText, // For Invoice
  Download,
  ImageIcon // For return images placeholder
} from 'lucide-react';
import { SellerHeader } from '@/components/seller/seller-header';

// --- Gemini API Helper ---

const callGemini = async (prompt: any) => {
  const apiKey = ""; // Auto-injected by environment
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  let delay = 1000;
  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    } catch (error) {
      if (i === 4) return "Error: Unable to reach Gemini API after multiple attempts. Please try again.";
      await new Promise(r => setTimeout(r, delay));
      delay *= 2;
    }
  }
};

// --- Mock Data ---

const INITIAL_ORDERS = [
  {
    id: "ORD-2024-001",
    status: "Ready to Ship",
    date: "Nov 20, 2025",
    customer: {
      name: "Alex Robinson",
      email: "alex.rob@example.com",
      phone: "+1 (555) 019-2834",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
      paymentMethod: "Visa **** 4242"
    },
    shipping: {
      address: ["4521 Elm Street, Apt 4B", "Springfield, IL 62704", "USA"],
      carrier: "FedEx",
      trackingId: "1Z-999-AA1-01-2345",
      isLabelGenerated: true
    },
    items: [
      { id: 1, name: "Sony WH-1000XM5", qty: 1, price: 349.00, img: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=150&q=80" },
      { id: 2, name: "Samsung Galaxy S24 Ultra", qty: 1, price: 900.00, img: "https://images.unsplash.com/photo-1610945265078-3858e0b5528b?w=150&q=80" }
    ],
    totals: { subtotal: 1249.00, shipping: 0.00, total: 1249.00 }
  },
  {
    id: "ORD-2024-RET-001",
    status: "Return Requested",
    date: "Nov 21, 2025",
    customer: {
      name: "David Kim",
      email: "d.kim@example.com",
      phone: "+1 (555) 987-6543",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e290260245",
      paymentMethod: "Mastercard **** 5555"
    },
    shipping: {
      address: ["777 Sunset Blvd", "Los Angeles, CA 90028", "USA"],
      carrier: "FedEx",
      trackingId: "1Z-RET-001-999",
      isLabelGenerated: true
    },
    returnDetails: {
        reason: "Item defective / Screen flicker",
        requestDate: "Nov 21, 2025",
        customerComment: "I opened the box and the screen flickers constantly.",
        images: [
            "https://images.unsplash.com/photo-1616256179029-726050db249d?w=150&q=80",
            "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=150&q=80"
        ]
    },
    items: [
      { id: 7, name: "Gaming Monitor 27\"", qty: 1, price: 320.00, img: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=150&q=80" }
    ],
    totals: { subtotal: 320.00, shipping: 0.00, total: 320.00 }
  },
  {
    id: "ORD-2024-002",
    status: "Pending",
    date: "Nov 19, 2025",
    customer: {
      name: "Sarah Jenkins",
      email: "s.jenkins@design.co",
      phone: "+1 (555) 999-1122",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
      paymentMethod: "PayPal"
    },
    shipping: {
      address: ["882 Ocean Drive", "Miami, FL 33101", "USA"],
      carrier: "FedEx",
      trackingId: null,
      isLabelGenerated: false
    },
    items: [
      { id: 3, name: "Mechanical Keycaps Set", qty: 1, price: 89.50, img: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=150&q=80" }
    ],
    totals: { subtotal: 89.50, shipping: 0.00, total: 89.50 }
  },
  {
    id: "ORD-2024-CNCL-099",
    status: "Cancelled",
    date: "Nov 10, 2025",
    customer: {
      name: "James Wilson",
      email: "j.wilson@example.com",
      phone: "+1 (555) 123-9999",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e290260123",
      paymentMethod: "Visa **** 1234"
    },
    shipping: {
      address: ["123 Pine St", "Seattle, WA 98101", "USA"],
      carrier: "FedEx",
      trackingId: null,
      isLabelGenerated: false
    },
    cancellationDetails: {
        by: "Customer",
        reason: "Found a better price elsewhere",
        date: "Nov 10, 2025"
    },
    items: [
      { id: 6, name: "Bluetooth Speaker", qty: 1, price: 120.00, img: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=150&q=80" }
    ],
    totals: { subtotal: 120.00, shipping: 0.00, total: 120.00 }
  },
  {
    id: "ORD-2024-CNCL-100",
    status: "Cancelled",
    date: "Nov 08, 2025",
    customer: {
      name: "Linda Martinez",
      email: "linda.m@example.com",
      phone: "+1 (555) 444-5555",
      avatar: "https://i.pravatar.cc/150?u=a042581f4e290260111",
      paymentMethod: "Mastercard **** 9999"
    },
    shipping: {
      address: ["456 Oak Ave", "Austin, TX 78701", "USA"],
      carrier: "FedEx",
      trackingId: null,
      isLabelGenerated: false
    },
    cancellationDetails: {
        by: "Seller",
        reason: "Item out of stock / Inventory error",
        date: "Nov 09, 2025"
    },
    items: [
      { id: 8, name: "Vintage Lamp", qty: 1, price: 85.00, img: "https://images.unsplash.com/photo-1507473888900-52a11b6f8d93?w=150&q=80" }
    ],
    totals: { subtotal: 85.00, shipping: 15.00, total: 100.00 }
  }
];

// --- Components ---

const InvoiceModal = ({ isOpen, onClose, order }: {isOpen: boolean, onClose: () => void, order: any}) => {
    if (!isOpen || !order) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 print:p-0 print:bg-white print:absolute print:inset-0">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 max-h-[90vh] overflow-y-auto">
                {/* Header Controls */}
                <div className="flex justify-between items-center p-4 border-b bg-slate-50 print:hidden">
                    <h2 className="font-bold text-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Invoice Preview
                    </h2>
                    <div className="flex gap-2">
                        <button onClick={() => window.print()} className="text-slate-600 hover:bg-white hover:text-blue-600 px-3 py-1.5 rounded border border-transparent hover:border-slate-200 text-sm font-medium flex items-center gap-2 transition-all">
                            <Printer className="w-4 h-4" /> Print
                        </button>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Invoice Content */}
                <div className="p-8 bg-white text-slate-800 font-mono text-sm" id="invoice-content">
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start mb-8 pb-8 border-b-2 border-slate-800">
                        <div>
                            <div className="w-10 h-10 bg-blue-600 text-white font-bold flex items-center justify-center rounded mb-2 text-xl">S</div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SellerHub Inc.</h1>
                            <p className="text-slate-500 mt-1">123 Commerce Blvd, Suite 100</p>
                            <p className="text-slate-500">San Francisco, CA 94107</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-3xl font-bold text-slate-200 uppercase tracking-widest mb-2">Invoice</h2>
                            <p className="font-bold text-slate-800">#INV-{order.id.replace('ORD-', '')}</p>
                            <p className="text-slate-500">Date: {order.date}</p>
                        </div>
                    </div>

                    {/* Bill To / Ship To */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-2">Bill To</h3>
                            <p className="font-bold text-slate-900">{order.customer.name}</p>
                            <p className="text-slate-600">{order.customer.email}</p>
                            <p className="text-slate-600">{order.customer.phone}</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-2">Ship To</h3>
                            {order.shipping.address.map((line: string, i: number) => (
                                <p key={i} className="text-slate-600">{line}</p>
                            ))}
                        </div>
                    </div>

                    {/* Items Table */}
                    <table className="w-full mb-8">
                        <thead>
                            <tr className="border-b-2 border-slate-100 text-left">
                                <th className="py-3 font-bold text-slate-800">Item Description</th>
                                <th className="py-3 font-bold text-slate-800 text-center">Qty</th>
                                <th className="py-3 font-bold text-slate-800 text-right">Unit Price</th>
                                <th className="py-3 font-bold text-slate-800 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item: any) => (
                                <tr key={item.id} className="border-b border-slate-50">
                                    <td className="py-4 text-slate-700">{item.name}</td>
                                    <td className="py-4 text-center text-slate-600">{item.qty}</td>
                                    <td className="py-4 text-right text-slate-600">${item.price.toFixed(2)}</td>
                                    <td className="py-4 text-right font-bold text-slate-800">${(item.price * item.qty).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-12">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>${order.totals.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Shipping (FedEx)</span>
                                <span>${order.totals.shipping.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-slate-900 text-lg pt-2 border-t border-slate-200">
                                <span>Total</span>
                                <span>${order.totals.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center border-t border-slate-100 pt-8">
                        <p className="font-bold text-slate-900 mb-1">Thank you for your business!</p>
                        <p className="text-slate-500 text-xs">Please contact support@sellerhub.com for any questions regarding this invoice.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GeminiModal = ({ isOpen, onClose, title, content, isLoading }: {isOpen: boolean, onClose: () => void, title: string, content: string, isLoading: boolean}) => {
  if (!isOpen) return null;
  
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 border border-slate-200">
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
            <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" fill="currentColor" />
                {title}
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>
        <div className="p-6 min-h-[200px] max-h-[60vh] overflow-y-auto custom-scrollbar">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500 gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                    <p className="text-sm font-medium animate-pulse">Consulting AI Expert...</p>
                </div>
            ) : (
                <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {content}
                </div>
            )}
        </div>
        {!isLoading && content && (
            <div className="bg-gray-50 px-6 py-3 border-t flex justify-end gap-2">
                <button onClick={handleCopy} className="text-xs font-medium text-gray-600 hover:text-indigo-600 px-3 py-2 rounded hover:bg-indigo-50 transition-colors flex items-center gap-2">
                    <Copy className="w-3 h-3" /> Copy Text
                </button>
                <button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-4 py-2 rounded transition-colors shadow-sm">
                    Done
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: {status: string}) => {
  const styles: {[key: string]: string} = {
    "Ready to Ship": "bg-blue-100 text-blue-800 border-blue-200",
    "Processing": "bg-indigo-100 text-indigo-800 border-indigo-200",
    "Pending": "bg-yellow-100 text-yellow-800 border-yellow-200",
    "Shipped": "bg-green-100 text-green-800 border-green-200",
    "Delivered": "bg-gray-100 text-gray-800 border-gray-200",
    "Cancelled": "bg-red-50 text-red-600 border-red-200",
    "Return Requested": "bg-orange-100 text-orange-800 border-orange-200",
    "Returned": "bg-purple-100 text-purple-800 border-purple-200"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles["Pending"]}`}>
      {status}
    </span>
  );
};

const OrderCard = ({ order, onGenerateLabel, onAccept, onDecline, onOpenAI, isExpanded, toggleExpanded, onRefund, onViewInvoice }: {order: any, onGenerateLabel: any, onAccept: any, onDecline: any, onOpenAI: any, isExpanded: any, toggleExpanded: any, onRefund: any, onViewInvoice: any}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateClick = (e: any) => {
    e.stopPropagation();
    setIsGenerating(true);
    setTimeout(() => {
      onGenerateLabel(order.id);
      setIsGenerating(false);
    }, 1500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getLogisticsStyles = () => {
    if (order.status === 'Cancelled') return 'bg-red-50/40 border-red-100';
    if (order.status === 'Return Requested') return 'bg-orange-50 border-orange-100';
    if (order.status === 'Returned') return 'bg-purple-50 border-purple-100';
    if (order.shipping.isLabelGenerated) return 'bg-blue-50/40 border-blue-100';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <div className={`bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${order.status === 'Cancelled' ? 'opacity-90 grayscale-[0.1]' : ''}`}>
      {/* Card Header */}
      <div 
        onClick={() => toggleExpanded(order.id)}
        className="bg-gray-50/50 px-6 py-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors select-none"
      >
        <div className="flex items-center gap-4 flex-1">
          <span className="text-lg font-bold text-slate-900">#{order.id}</span>
          <StatusBadge status={order.status} />
          <span className="hidden sm:flex items-center gap-1 text-sm text-slate-500">
            <Calendar className="w-3 h-3" /> {order.date}
          </span>
          {!isExpanded && (
             <span className="text-sm text-slate-500 font-medium ml-4 border-l pl-4">
               {order.customer.name} • ${order.totals.total.toFixed(2)}
             </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
            <div className={`text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-5 h-5" />
            </div>
            
            <div className="flex items-center gap-3 border-l pl-3 ml-1" onClick={(e) => e.stopPropagation()}>
                <button 
                    onClick={() => onViewInvoice(order)}
                    className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
                >
                    View Invoice
                </button>
                <button className="p-1 hover:bg-gray-200 rounded text-slate-400 hover:text-slate-600">
                    <MoreVertical className="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-top-2 duration-200">
            
            {/* Column 1: Customer Info */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer Details</h3>
                    {order.status !== 'Cancelled' && order.status !== 'Returned' && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onOpenAI('email', order); }}
                            className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded flex items-center gap-1 hover:bg-indigo-100 transition-colors"
                        >
                            <Sparkles className="w-3 h-3" /> Draft Email
                        </button>
                    )}
                </div>
                <div className="flex items-start gap-3">
                  <img 
                    src={order.customer.avatar} 
                    alt="Customer" 
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                  <div>
                    <p className="font-semibold text-slate-900">{order.customer.name}</p>
                    <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                      <Mail className="w-3 h-3" /> {order.customer.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                      <Phone className="w-3 h-3" /> {order.customer.phone}
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-dashed border-slate-200">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Payment</h3>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <CreditCard className="w-4 h-4" /> {order.customer.paymentMethod}
                  </div>
                  <span className="text-lg font-bold text-slate-900">${order.totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Column 2: Logistics, Returns, & Cancellations */}
            <div className={`rounded-lg p-5 border flex flex-col h-full relative transition-colors duration-300 ${getLogisticsStyles()}`}>
              
              {/* --- CANCELLED VIEW --- */}
              {order.status === 'Cancelled' ? (
                  <div className="h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="bg-red-100 p-2 rounded-lg text-red-600">
                                <XCircle className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-800">Cancellation Details</h3>
                        </div>
                        
                        <div className="bg-white/60 rounded-lg p-4 border border-red-100 space-y-3">
                            <div>
                                <span className="text-xs font-bold text-slate-500 uppercase">Cancelled By</span>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="font-medium text-slate-900 bg-white px-2 py-1 rounded border border-slate-200 text-sm">
                                        {order.cancellationDetails?.by || "System"}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-500 uppercase">Reason</span>
                                <p className="text-sm text-slate-700 mt-1 font-medium">
                                    "{order.cancellationDetails?.reason || "No reason provided"}"
                                </p>
                            </div>
                            <div>
                                <span className="text-xs font-bold text-slate-500 uppercase">Date</span>
                                <p className="text-sm text-slate-700 mt-1">
                                    {order.cancellationDetails?.date || order.date}
                                </p>
                            </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-center gap-2 text-red-600 py-2 text-sm font-medium bg-white/50 rounded border border-red-100">
                         Order is closed
                      </div>
                  </div>
              ) : (order.status === 'Return Requested' || order.status === 'Returned') ? (
                  /* --- RETURNS VIEW --- */
                  <>
                     <div className="flex items-center gap-2 mb-4">
                        <div className={`p-2 rounded-lg ${order.status === 'Returned' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                          <RotateCcw className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800">Return Request</h3>
                      </div>

                      <div className="space-y-3 flex-1">
                        <div className="bg-white/60 rounded p-3 border border-slate-100">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Reason</p>
                            <p className="text-sm font-medium text-slate-800">{order.returnDetails?.reason || "No reason provided"}</p>
                        </div>
                        {order.returnDetails?.customerComment && (
                             <div className="bg-white/60 rounded p-3 border border-slate-100">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Comment</p>
                                <p className="text-sm text-slate-600 italic">"{order.returnDetails.customerComment}"</p>
                            </div>
                        )}
                        
                        {/* --- RETURN IMAGES --- */}
                        {order.returnDetails?.images && order.returnDetails.images.length > 0 && (
                            <div className="mt-2">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                                    <ImageIcon className="w-3 h-3" /> Customer Photos
                                </p>
                                <div className="flex gap-2 overflow-x-auto pb-2">
                                    {order.returnDetails.images.map((img: string, idx: number) => (
                                        <div key={idx} className="w-16 h-16 rounded-md overflow-hidden border border-slate-300 shrink-0 relative group cursor-pointer">
                                            <img src={img} alt="Return evidence" className="w-full h-full object-cover hover:scale-110 transition-transform" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-orange-200">
                        {order.status === 'Return Requested' ? (
                             <div className="flex gap-3">
                                <button 
                                onClick={(e) => { e.stopPropagation(); /* Reject Logic */ }}
                                className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium rounded flex items-center justify-center gap-2 transition-colors"
                                >
                                Reject
                                </button>
                                <button 
                                onClick={(e) => { e.stopPropagation(); onRefund(order.id); }}
                                className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded flex items-center justify-center gap-2 shadow-sm transition-colors"
                                >
                                <RefreshCcw className="w-4 h-4" /> Approve Return
                                </button>
                            </div>
                        ) : (
                             <div className="flex items-center justify-center gap-2 text-purple-700 py-2 font-medium bg-purple-50 rounded border border-purple-100">
                                <CheckCircle2 className="w-4 h-4" /> Refund Processed
                             </div>
                        )}
                       
                      </div>
                  </>
              ) : (
                  /* --- STANDARD SHIPPING VIEW --- */
                  <>
                    {order.shipping.isLabelGenerated && (
                        <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
                        LOGISTICS READY
                        </div>
                    )}
                    
                    <div className="flex items-center gap-2 mb-4">
                        <div className={`p-2 rounded-lg ${order.shipping.isLabelGenerated ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                        <Truck className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800">Shipment Details</h3>
                    </div>

                    <div className="space-y-3 flex-1">
                        <div className="flex gap-3 items-start">
                        <MapPin className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                        <div className="text-sm text-slate-700 leading-relaxed">
                            <p className="font-medium text-slate-900">Shipping To:</p>
                            {order.shipping.address.map((line: string, i: number) => (
                            <p key={i}>{line}</p>
                            ))}
                        </div>
                        </div>
                        <div className={`flex gap-3 items-center mt-2 pt-2 border-t ${order.shipping.isLabelGenerated ? 'border-blue-100' : 'border-gray-200'}`}>
                        <Package className="w-4 h-4 text-gray-400 shrink-0" />
                        <div className="text-sm">
                            <span className="text-gray-500">Carrier: </span>
                            <span className="font-medium text-slate-900">{order.shipping.carrier}</span>
                        </div>
                        </div>
                    </div>
                    
                    <div className={`mt-6 pt-4 border-t ${order.shipping.isLabelGenerated ? 'border-blue-200' : 'border-gray-200'}`}>
                        {order.status === 'Pending' ? (
                        <div className="flex gap-3">
                            <button 
                            onClick={(e) => { e.stopPropagation(); onDecline(order.id); }}
                            className="flex-1 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium rounded flex items-center justify-center gap-2 transition-colors"
                            >
                            <X className="w-4 h-4" /> Decline
                            </button>
                            <button 
                            onClick={(e) => { e.stopPropagation(); onAccept(order.id); }}
                            className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded flex items-center justify-center gap-2 shadow-sm transition-colors"
                            >
                            <Check className="w-4 h-4" /> Accept
                            </button>
                        </div>
                        ) : order.shipping.isLabelGenerated ? (
                        <div className="bg-white p-3 rounded border border-gray-200 shadow-sm animate-in fade-in duration-500">
                            <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-gray-400">TRACKING ID</span>
                            <button 
                                onClick={(e) => { e.stopPropagation(); copyToClipboard(order.shipping.trackingId); }}
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                            >
                                <Copy className="w-3 h-3" />
                            </button>
                            </div>
                            <p className="font-mono font-bold text-lg tracking-wide text-slate-800 mb-3">{order.shipping.trackingId}</p>
                            <button className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded flex items-center justify-center gap-2 transition-colors">
                            <Printer className="w-4 h-4" /> Print Label
                            </button>
                        </div>
                        ) : (
                        <button 
                            onClick={handleGenerateClick}
                            disabled={isGenerating}
                            className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
                        >
                            {isGenerating ? (
                            <>Generating...</>
                            ) : (
                            <>
                                <Box className="w-4 h-4" /> Generate Shipping Label
                            </>
                            )}
                        </button>
                        )}
                    </div>
                  </>
              )}
            </div>

            {/* Column 3: Items */}
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Items ({order.items.length})</h3>
                {order.status !== 'Cancelled' && order.status !== 'Returned' && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onOpenAI('packaging', order); }}
                        className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded flex items-center gap-1 hover:bg-indigo-100 transition-colors"
                    >
                        <Sparkles className="w-3 h-3" /> Packaging Tips
                    </button>
                )}
              </div>
              
              <div className="space-y-4 overflow-y-auto pr-2 scrollbar-thin flex-1 min-h-[120px]">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex gap-3 items-center p-2 hover:bg-gray-50 rounded-lg transition-colors group">
                    <div className="w-12 h-12 bg-gray-100 rounded-md overflow-hidden border border-gray-200 shrink-0">
                      <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                      <p className="text-xs text-slate-500">Qty: {item.qty}</p>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">${item.price.toFixed(2)}</div>
                  </div>
                ))}
              </div>
              
              <div className="mt-auto pt-4 border-t border-slate-200 space-y-2">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Subtotal</span><span>${order.totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Shipping</span><span>${order.totals.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2">
                  <span>Total</span><span>${order.totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

          </div>
      )}
    </div>
  );
};

export default function App() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [expandedOrderIds, setExpandedOrderIds] = useState(new Set([INITIAL_ORDERS[1].id, INITIAL_ORDERS[3].id])); 
  const [activeTab, setActiveTab] = useState('active');
  
  // Modal States
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [geminiState, setGeminiState] = useState({
    isOpen: false,
    type: null,
    content: "",
    isLoading: false,
    title: ""
  });

  // Filter Logic
  useEffect(() => {
    const lowerTerm = searchTerm.toLowerCase();
    
    const filtered = orders.filter(order => {
      // 1. Status Filter (Tab logic)
      let matchesTab = false;
      if (activeTab === 'active') {
        matchesTab = ['Pending', 'Processing', 'Ready to Ship'].includes(order.status);
      } else if (activeTab === 'returns') {
        matchesTab = ['Return Requested', 'Returned'].includes(order.status);
      } else if (activeTab === 'history') {
        matchesTab = ['Shipped', 'Delivered', 'Cancelled'].includes(order.status);
      }

      // 2. Search Filter
      const matchesSearch = 
        order.id.toLowerCase().includes(lowerTerm) || 
        order.customer.name.toLowerCase().includes(lowerTerm) ||
        order.status.toLowerCase().includes(lowerTerm);
        
      return matchesTab && matchesSearch;
    });
    
    setFilteredOrders(filtered);
  }, [searchTerm, orders, activeTab]);

  // Toggle Collapse/Expand
  const toggleExpanded = (id: any) => {
    const newSet = new Set(expandedOrderIds);
    if (newSet.has(id)) {
        newSet.delete(id);
    } else {
        newSet.add(id);
    }
    setExpandedOrderIds(newSet);
  };

  // Actions
  const handleAccept = (orderId: any) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: "Processing" } : order
    ));
  };

  const handleDecline = (orderId: any) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { 
        ...order, 
        status: "Cancelled", 
        cancellationDetails: { by: "Seller", reason: "Order declined", date: new Date().toLocaleDateString() } 
      } : order
    ));
  };
  
  const handleRefund = (orderId: any) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: "Returned" } : order
    ));
  };

  const handleGenerateLabel = (orderId: any) => {
    setOrders(prevOrders => prevOrders.map(order => {
      if (order.id === orderId) {
        const mockTracking = `1Z-${Math.floor(Math.random() * 900) + 100}-X${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000) + 1000}`;
        return {
          ...order,
          status: "Ready to Ship",
          shipping: {
            ...order.shipping,
            trackingId: mockTracking,
            isLabelGenerated: true
          }
        };
      }
      return order;
    }));
  };

  // --- Gemini Logic ---
  const handleOpenAI = async (type: any, order: any) => {
    setGeminiState({
      isOpen: true,
      type,
      content: "",
      isLoading: true,
      title: type === 'email' ? `Draft Email for ${order.customer.name}` : `Packaging Tips for Order #${order.id}`
    });

    let prompt = "";
    if (type === 'email') {
        const itemsList = order.items.map((i: any) => i.name).join(', ');
        prompt = `Write a concise, friendly, and professional customer service email to ${order.customer.name} regarding their order #${order.id}. 
        The order contains: ${itemsList}. 
        The current order status is: ${order.status}. 
        If the status is 'Processing', say we are preparing it. If 'Ready to Ship', say it's about to leave. If 'Pending', thank them for the order.
        Keep it under 100 words. Sign off as 'SellerHub Support'.`;
    } else if (type === 'packaging') {
        const itemsList = order.items.map((i: any) => i.name).join(', ');
        prompt = `You are a logistics expert. Provide concise, bulleted packaging instructions for shipping these items safely via FedEx: ${itemsList}. 
        Mention if bubble wrap, anti-static bags, or rigid boxes are needed based on the item type (electronics, fragile, etc). 
        Keep it under 80 words.`;
    }

    const result = await callGemini(prompt);
    
    setGeminiState(prev => ({
        ...prev,
        isLoading: false,
        content: result || ""
    }));
  };

  const closeGeminiModal = () => {
    setGeminiState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-800 font-sans">
      
      <GeminiModal 
        isOpen={geminiState.isOpen}
        onClose={closeGeminiModal}
        title={geminiState.title}
        content={geminiState.content}
        isLoading={geminiState.isLoading}
      />

      <InvoiceModal 
        isOpen={!!invoiceOrder}
        onClose={() => setInvoiceOrder(null)}
        order={invoiceOrder}
      />
      <div className="w-full">
        <SellerHeader />
        <main className="max-w-7xl mx-auto p-6">
          <div className="mb-8 animate-in slide-in-from-top-4 duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                      <h2 className="text-2xl font-bold text-slate-900">Order Management</h2>
                      <p className="text-slate-500 text-sm mt-1">Manage orders, generate labels, and track shipments.</p>
                  </div>
                  
                  {/* Tabs */}
                  <div className="flex bg-white p-1 rounded-lg border shadow-sm overflow-x-auto">
                      <button 
                          onClick={() => setActiveTab('active')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                              activeTab === 'active' 
                              ? 'bg-slate-900 text-white shadow-md' 
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                          <List className="w-4 h-4" /> Active Orders
                      </button>
                      <button 
                          onClick={() => setActiveTab('returns')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                              activeTab === 'returns' 
                              ? 'bg-slate-900 text-white shadow-md' 
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                          <RotateCcw className="w-4 h-4" /> Returns <span className="ml-1 bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded-full text-[10px]">1</span>
                      </button>
                      <button 
                           onClick={() => setActiveTab('history')}
                           className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                              activeTab === 'history' 
                              ? 'bg-slate-900 text-white shadow-md' 
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                      >
                          <History className="w-4 h-4" /> Order History
                      </button>
                  </div>
              </div>

              {/* Filters */}
              <div className="flex gap-3 w-full">
                  <div className="relative flex-1 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                      type="text" 
                      placeholder={`Search ${activeTab} orders...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm transition-shadow shadow-sm bg-white"
                  />
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 bg-white rounded-lg hover:bg-slate-50 text-sm font-medium shadow-sm text-slate-700 transition-colors">
                  <Filter className="w-4 h-4" /> Filter
                  </button>
              </div>
          </div>

          {/* Order List */}
          <div className="space-y-4">
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onGenerateLabel={handleGenerateLabel}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                  onRefund={handleRefund}
                  onOpenAI={handleOpenAI}
                  onViewInvoice={setInvoiceOrder}
                  isExpanded={expandedOrderIds.has(order.id)}
                  toggleExpanded={toggleExpanded}
                />
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300 animate-in fade-in">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 capitalize">No {activeTab} orders found</h3>
                <p className="text-slate-500 text-sm mt-2">Try adjusting your search terms.</p>
                {searchTerm && (
                    <button 
                      onClick={() => setSearchTerm("")}
                      className="mt-4 text-blue-600 text-sm font-medium hover:underline"
                    >
                      Clear search
                    </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
