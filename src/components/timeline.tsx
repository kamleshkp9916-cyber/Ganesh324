
"use client";

import { cn } from "@/lib/utils";
import type { Order } from "@/lib/order-data";
import { CheckCircle2, Circle, Hourglass, Package, PackageCheck, PackageOpen, Truck, Home, XCircle } from "lucide-react";
import { DialogHeader, DialogTitle, DialogDescription, DialogClose } from "./ui/dialog";
import { Button } from "./ui/button";

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

export function Timeline({ order }: { order: Order | null }) {
    if (!order) {
        return null;
    }
    
    const lastCompletedIndex = order.timeline.slice().reverse().findIndex(item => item.completed);
    const currentStatusIndex = order.timeline.length - 1 - lastCompletedIndex;

    return (
        <>
            <DialogHeader>
                <DialogTitle>Order Timeline for {order.orderId}</DialogTitle>
                <DialogDescription>
                   Review the step-by-step progress of this order from confirmation to delivery.
                </DialogDescription>
            </DialogHeader>
            <div className="p-4">
                 <ul className="space-y-2">
                    {order.timeline.map((item: any, index: number) => (
                        <li key={index} className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                                <div className={cn(
                                    "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mt-1 z-10",
                                    item.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                )}>
                                    {item.completed ? <CheckCircle2 className="h-5 w-5" /> : getStatusIcon(item.status) }
                                </div>
                                {index < order.timeline.length - 1 && (
                                    <div className="w-0.5 h-10 bg-border" />
                                )}
                            </div>
                            <div className="flex-grow pt-1">
                                <p className={cn("font-semibold", !item.completed && "text-muted-foreground")}>
                                    {item.status.split(':')[0]}
                                </p>
                                {index === currentStatusIndex && item.status.includes(':') && (
                                    <p className="text-sm text-muted-foreground">
                                        {item.status.split(':').slice(1).join(':').trim()}
                                    </p>
                                )}
                                {item.completed && item.date && (
                                    <p className="text-sm text-muted-foreground">
                                        {item.date} {item.time && `- ${item.time}`}
                                    </p>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="flex justify-end p-4">
                <DialogClose asChild>
                    <Button type="button" variant="secondary">Close</Button>
                </DialogClose>
            </div>
        </>
    );
}
