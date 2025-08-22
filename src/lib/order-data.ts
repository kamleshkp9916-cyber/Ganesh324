

export const allOrderData = {
    "#STREAM5896": {
        product: { name: "Vintage Camera", imageUrl: "https://placehold.co/150x150.png", hint: "vintage camera", price: "₹12,500.00" },
        orderDate: "Jul 27, 2024",
        isReturnable: true,
        timeline: [
            { status: "Order Confirmed", date: "Jul 27, 2024", time: "10:31 PM", completed: true },
            { status: "Packed", date: "Jul 28, 2024", time: "09:00 AM", completed: true },
            { status: "Shipped: The package has left the sender's location.", date: "Jul 28, 2024", time: "05:00 PM", completed: true },
            { status: "In Transit: The package is on its way to the recipient.", date: "Jul 29, 2024", time: "Current status", completed: true },
            { status: "Out for Delivery", date: null, time: null, completed: false },
            { status: "Delivered", date: null, time: null, completed: false },
        ]
    },
    "#STREAM5897": {
        product: { name: "Wireless Headphones", imageUrl: "https://placehold.co/150x150.png", hint: "headphones", price: "₹4,999.00" },
        orderDate: "Jul 26, 2024",
        isReturnable: true,
        timeline: [
            { status: "Order Confirmed", date: "Jul 26, 2024", time: "08:16 AM", completed: true },
            { status: "Packed", date: "Jul 26, 2024", time: "11:00 AM", completed: true },
            { status: "Shipped", date: "Jul 26, 2024", time: "06:00 PM", completed: true },
            { status: "Out for Delivery", date: "Jul 27, 2024", time: "09:00 AM", completed: true },
            { status: "Delivered: The package has been successfully delivered to the recipient.", date: "Jul 27, 2024", time: "11:30 AM", completed: true },
        ]
    },
     "#STREAM5898": {
        product: { name: "Leather Backpack", imageUrl: "https://placehold.co/150x150.png", hint: "leather backpack", price: "₹6,200.00" },
        orderDate: "Jul 25, 2024",
        isReturnable: false, // Admin has disabled returns for this item
        timeline: [
            { status: "Order Confirmed", date: "Jul 25, 2024", time: "02:00 PM", completed: true },
            { status: "Delivered: The package has been successfully delivered to the recipient.", date: "Jul 26, 2024", time: "01:00 PM", completed: true },
        ]
    },
    "#STREAM5899": {
        product: { name: "Smart Watch", imageUrl: "https://placehold.co/150x150.png", hint: "smart watch", price: "₹8,750.00" },
        orderDate: "Jul 25, 2024",
        timeline: [
            { status: "Order Confirmed", date: "Jul 25, 2024", time: "11:45 AM", completed: true },
            { status: "Cancelled by user", date: "Jul 25, 2024", time: "12:00 PM", completed: true },
        ]
    },
    "#STREAM5902": {
        product: { name: "Bluetooth Speaker", imageUrl: "https://placehold.co/150x150.png", hint: "bluetooth speaker", price: "₹3,200.00" },
        orderDate: "Jul 22, 2024",
        timeline: [
            { status: "Order Confirmed", date: "Jul 22, 2024", time: "07:00 PM", completed: true },
            { status: "Shipped", date: "Jul 23, 2024", time: "10:00 AM", completed: true },
            { status: "Out for Delivery: The package has reached the local delivery hub and is being delivered by the courier.", date: "Jul 23, 2024", time: "Current status", completed: true },
            { status: "Delivered", date: null, time: null, completed: false },
        ]
    },
    "#STREAM5907": {
        product: { name: "Espresso Machine", imageUrl: "https://placehold.co/150x150.png", hint: "espresso machine", price: "₹18,500.00" },
        orderDate: "Jul 20, 2024",
        isReturnable: true,
        timeline: [
            { status: "Delivered: The package was successfully delivered.", date: "Jul 22, 2024", time: "03:00 PM", completed: true },
            { status: "Return Initiated: Your return request has been submitted.", date: "Jul 23, 2024", time: "10:00 AM", completed: true },
            { status: "Return package picked up: The delivery partner has collected the package.", date: "Jul 24, 2024", time: "01:00 PM", completed: true },
            { status: "Returned: Your item has been returned successfully. A refund will be processed shortly.", date: "Jul 25, 2024", time: "11:00 AM", completed: true },
        ]
    },
    "#STREAM5910": {
        product: { name: "Gaming Keyboard", imageUrl: "https://placehold.co/150x150.png", hint: "gaming keyboard", price: "₹5,500.00" },
        orderDate: "Jul 24, 2024",
        timeline: [
            { status: "Order Confirmed", date: "Jul 24, 2024", time: "10:00 AM", completed: true },
            { status: "Shipped", date: "Jul 24, 2024", time: "04:00 PM", completed: true },
            { status: "Out for Delivery", date: "Jul 25, 2024", time: "09:30 AM", completed: true },
            { status: "Failed Delivery Attempt: The courier attempted delivery but was unsuccessful. Address not found.", date: "Jul 25, 2024", time: "02:00 PM", completed: true },
            { status: "Returned", date: "Jul 26, 2024", time: "11:00 AM", completed: true },
        ]
    },
    "#STREAM5905": {
        product: { name: "Designer Sunglasses", imageUrl: "https://placehold.co/150x150.png", hint: "sunglasses", price: "₹7,800.00" },
        orderDate: "Jul 28, 2024",
        timeline: [
            { status: "Pending", date: "Jul 28, 2024", time: "02:30 PM", completed: true },
            { status: "Order Confirmed", date: null, time: null, completed: false },
            { status: "Shipped", date: null, time: null, completed: false },
            { status: "Delivered", date: null, time: null, completed: false },
        ]
    },
    "#STREAM5906": {
        product: { name: "Mechanical Keyboard", imageUrl: "https://placehold.co/150x150.png", hint: "keyboard", price: "₹9,500.00" },
        orderDate: "Jul 29, 2024",
        timeline: [
            { status: "Pending", date: "Jul 29, 2024", time: "11:00 AM", completed: true },
            { status: "Order Confirmed", date: null, time: null, completed: false },
            { status: "Shipped", date: null, time: null, completed: false },
            { status: "Delivered", date: null, time: null, completed: false },
        ]
    }
};

export type OrderData = typeof allOrderData;
export type OrderId = keyof OrderData;
// Add isReturnable to the Order type definition
export type Order = OrderData[OrderId] & { isReturnable?: boolean };

export function getStatusFromTimeline(timeline: Order['timeline']): string {
    const lastCompletedStep = [...timeline].reverse().find(step => step.completed);
    if (!lastCompletedStep) return "Unknown";
    return lastCompletedStep.status.split(':')[0].trim();
}
