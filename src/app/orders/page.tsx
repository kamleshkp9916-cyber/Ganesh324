
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LayoutGrid, Wallet } from 'lucide-react';
import { Footer } from '@/components/footer';
import Link from 'next/link';

export default function OrdersPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="flex flex-1">
        <aside className="hidden md:block w-[10%] border-r p-4">
            <h2 className="text-destructive font-bold text-lg mb-6">StreamCart</h2>
            <nav className="flex flex-col gap-2">
                <Link href="#" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                    <LayoutGrid className="h-5 w-5" />
                    <span>Overview</span>
                </Link>
                <Link href="/wallet" className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                    <Wallet className="h-5 w-5" />
                    <span>Wallet</span>
                </Link>
            </nav>
        </aside>
        <main className="flex-grow p-4">
          <div className="text-center">
            <p>This is the orders page. You can add content here.</p>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
