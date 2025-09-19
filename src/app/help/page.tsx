

"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LifeBuoy, MessageSquare, Mail } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';

const faqData = [
  {
    category: "Orders & Shipping",
    questions: [
      { q: "How can I track my order?", a: "You can track your order directly from the 'My Orders' page in your profile. Click on the order you wish to track to see its real-time status and location." },
      { q: "Can I cancel my order?", a: "Yes, you can cancel an order before it has been shipped. Go to 'My Orders', select the order, and if the 'Cancel Order' option is available, you can proceed with the cancellation." },
    ]
  },
  {
    category: "Payments & Wallet",
    questions: [
      { q: "What payment methods do you accept?", a: "We accept all major credit/debit cards, UPI (including Google Pay, PhonePe, etc.), Net Banking, and our own StreamCart Wallet." },
      { q: "How do I get a refund?", a: "Once a return is successfully processed and the item is received by the seller, the refund amount will be credited to your original payment method or your StreamCart Wallet within 5-7 business days." },
      { q: "How do I add money to my wallet?", a: "You can add money to your wallet from the 'Wallet' section in your profile. We support various top-up methods including UPI and credit/debit cards." },
    ]
  },
    {
      category: "Platform Policies",
      questions: [
          { q: "What is the 7-Day Return Policy?", a: "Most items on StreamCart are eligible for return within 7 days of delivery. The item must be in its original condition, with all tags and packaging intact. To initiate a return, go to your 'My Orders' page, select the delivered order, and click the 'Return Product' button. Some items, like personal care products or perishables, may not be returnable." },
          { q: "How does 'Pay on Delivery' work?", a: "Pay on Delivery (POD) is a payment method where you can pay for your order in cash at the time of delivery. This option is available for select locations and orders. If your order is eligible, you will see the POD option at checkout. Please have the exact amount ready to avoid inconvenience." },
          { q: "What does '100% Genuine' mean?", a: "We guarantee that all products sold on StreamCart are authentic and sourced directly from verified sellers or trusted brand partners. Our seller verification process (KYC) ensures that only legitimate businesses sell on our platform. If you ever receive a product that you believe is not genuine, please contact our support team immediately through the Help Center for a full investigation and refund." },
      ]
  },
  {
      category: "Account & Profile",
      questions: [
          { q: "How do I reset my password?", a: "If you've forgotten your password, click on the 'Forgot Password' link on the login page. You'll receive an email with instructions to reset it." },
          { q: "How do I become a seller?", a: "We're thrilled you want to join us! You can start the registration process by navigating to the 'Become a Seller' page from the main menu. You'll need to complete a simple KYC process." },
      ]
  },
];

export default function HelpPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">Help Center</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <LifeBuoy className="h-16 w-16 mx-auto text-primary mb-4" />
            <h2 className="text-3xl font-bold">How can we help you?</h2>
            <p className="text-muted-foreground mt-2">Find answers to your questions below.</p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqData.map(category => (
              <div key={category.category}>
                <h3 className="text-xl font-semibold mt-6 mb-2 border-b pb-2">{category.category}</h3>
                {category.questions.map((item, index) => (
                  <AccordionItem key={index} value={`${category.category}-${index}`}>
                    <AccordionTrigger>{item.q}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </div>
            ))}
          </Accordion>

          <div className="mt-12 text-center p-6 border rounded-lg bg-card">
              <h3 className="text-xl font-semibold mb-2">Still need help?</h3>
              <p className="text-muted-foreground mb-6">If you couldn't find the answer you were looking for, here are a few ways to get in touch with us.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button asChild variant="outline" className="w-full sm:w-auto">
                      <Link href="/contact">
                          <Mail className="mr-2 h-4 w-4" />
                          Send us an Email
                      </Link>
                  </Button>
                   <Button asChild className="w-full sm:w-auto">
                      <Link href="/message">
                          <MessageSquare className="mr-2 h-4 w-4" />
                         Chat with Support
                      </Link>
                  </Button>
              </div>
          </div>
        </div>
      </main>
    </div>
  );
}
