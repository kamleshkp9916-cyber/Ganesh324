
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsAndConditionsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Terms & Conditions</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8 text-sm text-muted-foreground">
            <div className="text-center space-y-1">
                <h2 className="text-2xl font-bold text-foreground">Terms and Conditions for Nipher</h2>
                <p>Effective Date: [26/08/2025]</p>
            </div>

            <p>These Terms and Conditions (“Terms”) govern your access to and use of the Nipher mobile application, website, and related services (collectively, the “Platform”). By registering an account or otherwise using the Platform, you agree to be bound by these Terms. If you do not agree, you must not use Nipher.</p>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">1. Eligibility</h3>
                <p>Users must be at least 18 years of age, or the age of majority in their jurisdiction, in order to buy, sell, or participate in auctions through the Platform. By creating an account, you represent and warrant that you meet these eligibility requirements and that all information you provide is accurate and truthful.</p>
            </div>
            
            ... (rest of the terms) ...
            
        </div>
      </main>
    </div>
  );
}
