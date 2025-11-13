
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const initialContent = `These Terms and Conditions (“Terms”) govern your access to and use of the StreamCart mobile application, website, and related services (collectively, the “Platform”). By registering an account or otherwise using the Platform, you agree to be bound by these Terms. If you do not agree, you must not use StreamCart.

1. Eligibility
Users must be at least 18 years of age, or the age of majority in their jurisdiction, in order to buy, sell, or participate in auctions through the Platform. By creating an account, you represent and warrant that you meet these eligibility requirements and that all information you provide is accurate and truthful.

... (rest of the terms) ...`;

export default function EditTermsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [content, setContent] = useState(initialContent);

  const handleSave = () => {
    // In a real application, you would save this content to your database.
    console.log("Saving new Terms & Conditions:", content);
    toast({
      title: "Terms & Conditions Saved!",
      description: "The changes have been published successfully.",
    });
    router.push('/admin/settings');
  };

  return (
    <div className="min-h-screen bg-muted/40 text-foreground flex flex-col">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push('/admin/settings')}>
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold">Edit Terms & Conditions</h1>
        </div>
        <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save and Publish
        </Button>
      </header>

      <main className="flex-grow p-4 md:p-8">
        <Card>
            <CardHeader>
                <CardTitle>Content Editor</CardTitle>
                <CardDescription>Modify the content below. The changes will be live once you save.</CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[60vh] font-mono text-sm"
                    placeholder="Enter your terms and conditions here..."
                />
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
