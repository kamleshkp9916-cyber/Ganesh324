
"use client";

export interface Transaction {
    id: number;
    transactionId: string;
    orderId?: string;
    buyerName?: string;
    type: 'Order' | 'Refund' | 'Deposit' | 'Withdrawal' | 'Bid';
    description: string;
    date: string;
    time: string;
    amount: number;
    status: 'Completed' | 'Processing' | 'Failed';
    reasonForFailure?: string;
    paymentMethodDetails?: string; // For Bank/UPI info
    refundId?: string;
}

const TRANSACTIONS_KEY = 'streamcart_transactions';

const defaultTransactions: Transaction[] = [
    { id: 1, transactionId: 'txn_1a2b3c4d5e6f', orderId: '#ORD5896', buyerName: 'Ganesh Prajapati', type: 'Order', description: 'Vintage Camera', date: '2024-07-29T10:00:00.000Z', time: '10:00 AM', amount: 12500.00, status: 'Completed', paymentMethodDetails: 'UPI: ganesh@okhdfc' },
    { id: 2, transactionId: 'txn_7g8h9i0j1k2l', orderId: '#ORD5897', buyerName: 'Jane Doe', type: 'Order', description: 'Wireless Headphones', date: '2024-07-28T12:30:00.000Z', time: '12:30 PM', amount: 4999.00, status: 'Completed', paymentMethodDetails: 'Card: **** 4567' },
    { id: 3, transactionId: 'txn_3m4n5o6p7q8r', orderId: '#ORD5903', buyerName: 'Jessica Rodriguez', type: 'Order', description: 'Coffee Maker', date: '2024-07-19T11:45:00.000Z', time: '11:45 AM', amount: 4500.00, status: 'Completed', refundId: 'ref_jess456', paymentMethodDetails: 'Netbanking' },
    { id: 4, transactionId: 'txn_a1b2c3d4e5f6', orderId: '#ORD5910', buyerName: 'Michael Bui', type: 'Order', description: 'Smart Watch', date: '2024-07-30T09:00:00.000Z', time: '09:00 AM', amount: 899.00, status: 'Failed', reasonForFailure: 'Incorrect CVV', paymentMethodDetails: 'Card: **** 1121' },
    { id: 5, transactionId: 'txn_f6e5d4c3b2a1', orderId: '#ORD5911', buyerName: 'Emily Carter', type: 'Order', description: 'Leather Backpack', date: '2024-07-30T09:05:00.000Z', time: '09:05 AM', amount: 2300.00, status: 'Failed', reasonForFailure: 'Insufficient Funds', paymentMethodDetails: 'UPI: emilyc@okaxis' },
    { id: 6, transactionId: 'txn_p0o9i8u7y6t5', type: 'Refund', description: 'For order #ORD5903', date: '2024-07-20T14:00:00.000Z', time: '02:00 PM', amount: 4500.00, status: 'Completed', refundId: 'ref_jess456' },
];

export const getTransactions = (): Transaction[] => {
    if (typeof window === 'undefined') return [];
    try {
        const items = localStorage.getItem(TRANSACTIONS_KEY);
        const parsedItems = items ? JSON.parse(items) : defaultTransactions;
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
    return newTransaction;
};
