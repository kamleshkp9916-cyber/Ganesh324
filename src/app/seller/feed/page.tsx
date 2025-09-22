
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SellerFeedPage() {

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
         <Button asChild variant="ghost">
            <Link href="/seller/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
            </Link>
        </Button>
        <h1 className="text-xl font-bold">My Feed</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8 text-center">
            <h2 className="text-2xl font-bold">Seller Feed Coming Soon!</h2>
            <p className="text-muted-foreground">This is where you'll be able to see posts and updates from people you follow, manage your own posts, and interact with the community.</p>
        </div>
      </main>
    </div>
  );
}
