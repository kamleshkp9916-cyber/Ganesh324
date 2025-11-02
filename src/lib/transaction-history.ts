
"use client";

export interface Transaction {
    id: number;
    transactionId: string;
    type: 'Order' | 'Refund' | 'Deposit' | 'Withdrawal' | 'Bid';
    description: string;
    date: string;
    time: string;
    amount: number;
    avatar?: string;
    status: 'Completed' | 'Processing' | 'Failed';
    items?: any[];
    discount?: number;
    paymentMethod?: string;
    gatewayTransactionId?: string;
}

const TRANSACTIONS_KEY = 'streamcart_transactions';

const defaultTransactions: Transaction[] = [
    { id: 1, transactionId: 'TXN-984213', type: 'Order', description: 'Paid via Wallet', date: 'Sep 09, 2025', time: '10:30 PM', amount: -2336.40, avatar: 'https://placehold.co/40x40.png?text=O', status: 'Completed', discount: -120.00, items: [{ key: 'prod_1', name: 'Noise Cancelling Headphones', qty: 1, unitPrice: 1980.00 }, { key: 'prod_1_ship', name: 'Express Shipping', qty: 1, unitPrice: 120.00 }], paymentMethod: 'Wallet', gatewayTransactionId: 'PAY-ABC123XYZ' },
    { id: 2, transactionId: 'TXN-984112', type: 'Order', description: 'Paid via UPI', date: 'Sep 08, 2025', time: '08:15 AM', amount: -7240.00, avatar: 'https://placehold.co/40x40.png?text=O', status: 'Completed', items: [{ key: 'prod_2', name: 'Vintage Camera', qty: 1, unitPrice: 7240.00 }], paymentMethod: 'UPI', gatewayTransactionId: 'PAY-DEF456ABC' },
    { id: 3, transactionId: 'TXN-983990', type: 'Refund', description: 'Refund + Wallet', date: 'Sep 08, 2025', time: '09:00 AM', amount: 5200.00, avatar: 'https://placehold.co/40x40.png?text=R', status: 'Completed', paymentMethod: 'Wallet', gatewayTransactionId: 'REF-GHI789DEF' },
    { id: 4, transactionId: 'TXN-001244', type: 'Deposit', description: 'PhonePe Deposit', date: 'Sep 10, 2025', time: '11:00 AM', amount: 1000.00, avatar: 'https://placehold.co/40x40.png?text=D', status: 'Failed', paymentMethod: 'UPI', gatewayTransactionId: 'PAY-JKL012GHI' },
    { id: 5, transactionId: 'AUC-5721', type: 'Bid', description: 'Auction Hold + Wallet', date: 'Sep 07, 2025', time: '07:45 PM', amount: -9900.00, avatar: 'https://placehold.co/40x40.png?text=B', status: 'Processing', paymentMethod: 'Wallet', gatewayTransactionId: 'PAY-MNO345JKL' },
    { id: 6, transactionId: 'WD-3319', type: 'Withdrawal', description: 'To Bank + IMPS', date: 'Sep 06, 2025', time: '02:00 PM', amount: -20000.00, avatar: 'https://placehold.co/40x40.png?text=W', status: 'Completed', paymentMethod: 'Bank Transfer', gatewayTransactionId: 'PAY-PQR678MNO' },
];

export const getTransactions = (): Transaction[] => {
    if (typeof window === 'undefined') return [];
    try {
        const items = localStorage.getItem(TRANSACTIONS_KEY);
        const parsedItems = items ? JSON.parse(items) : defaultTransactions;
        // Ensure default transactions are present if local storage is empty or invalid
        return Array.isArray(parsedItems) && parsedItems.length > 0 ? parsedItems : defaultTransactions;
    } catch (error) {
        console.warn("Could not read transactions from local storage, falling back to default.", error);
        return defaultTransactions;
    }
};

export const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    if (typeof window === 'undefined') return;
    const items = getTransactions();
    const newTransaction = { ...transaction, id: Date.now() };
    const newItems = [newTransaction, ...items];
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(newItems));
    window.dispatchEvent(new StorageEvent('storage', { key: TRANSACTIONS_KEY }));
};
