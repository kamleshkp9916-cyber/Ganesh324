
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyAndSecurityPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Privacy & Security</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8 text-sm text-muted-foreground">
            <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-foreground">Privacy Policy for Nipher</h2>
                <p>Effective Date: [26/08/2025]</p>
            </div>

            <p>This Privacy Policy describes how Nipher ("we," "us," or "our") collects, uses, and discloses your information when you use our mobile application, website, and related services (collectively, the “Platform”).</p>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">1. Information We Collect</h3>
                <p>We collect information you provide directly to us, such as when you create an account, list a product, make a purchase, or communicate with us. This may include your name, email address, phone number, shipping address, and payment information.</p>
            </div>
            
            ... (rest of the policy) ...

        </div>
      </main>
    </div>
  );
}
