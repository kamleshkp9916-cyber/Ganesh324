
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const initialContent = `This Privacy Policy describes how StreamCart ("we," "us," or "our") collects, uses, and discloses your information when you use our mobile application, website, and related services (collectively, the “Platform”).

1. Information We Collect
We collect information you provide directly to us, such as when you create an account, list a product, make a purchase, or communicate with us. This may include your name, email address, phone number, shipping address, and payment information.

... (rest of the policy) ...`;

export default function EditPrivacyPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [content, setContent] = useState(initialContent);

  const handleSave = () => {
    // In a real application, you would save this content to your database.
    console.log("Saving new Privacy Policy:", content);
    toast({
      title: "Privacy Policy Saved!",
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
            <h1 className="text-xl font-bold">Edit Privacy Policy</h1>
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
                    placeholder="Enter your privacy policy here..."
                />
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
