
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, LifeBuoy, MessageSquare, Mail, Wallet, Package, Ban, Truck } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
      { q: "What happens if my payment fails?", a: "If your payment fails, your order will not be processed. You will not be charged, and any amount deducted from your bank will be automatically refunded within 5-7 business days. You can try the payment again with the same or a different payment method." },
      { q: "What payment methods do you accept?", a: "We accept all major credit/debit cards, UPI (including Google Pay, PhonePe, etc.), Net Banking, and our own Nipher Wallet." },
      { q: "How do I get a refund?", a: "Once a return is successfully processed and the item is received by the seller, the refund amount will be credited to your original payment method or your Nipher Wallet within 5-7 business days." },
      { q: "How do I add money to my wallet?", a: "You can add money to your wallet from the 'Wallet' section in your profile. We support various top-up methods including UPI and credit/debit cards." },
    ]
  },
    {
      category: "Live Streams & Auctions",
      questions: [
          { q: "What is a Live Stream?", a: "A live stream is a real-time video broadcast hosted by a seller to showcase their products. You can watch product demonstrations, ask questions in the live chat, and interact with the seller and other viewers." },
          { q: "How can I buy a product from a stream?", a: "Products featured in the stream are displayed in the 'Product Shelf' section. You can click on a product to view its details, add it to your cart, or buy it directly using the 'Buy Now' button." },
          { q: "What is an Auction?", a: "Auctions are a 'coming soon' feature! They will allow you to bid on special products during a live stream. The highest bidder at the end of the timer will win the item. You will need to have sufficient funds in your wallet to place a bid." },
          { q: "Can I chat with the seller during a stream?", a: "Yes! The live chat is the primary way to interact. You can ask questions, leave comments, and react with emojis. Please be respectful and follow our community guidelines." },
      ]
  },
  {
    category: "Feed & Community",
    questions: [
        { q: "What is the Feed page?", a: "The Feed is your central hub for community content. Here you can see posts from sellers you follow, discover new creators, and interact with other users. It is divided into three main tabs: Feed, Saves, and Messages." },
        { q: "How do I create a post?", a: "At the bottom of the 'Feed' tab, you'll find a 'Share something...' box. You can write your post, tag products, attach images or videos, and share it with the community." },
        { q: "What is the difference between the 'For You' and 'Following' feeds?", a: "The 'For You' feed shows you a mix of popular posts and content from creators we think you'll like. The 'Following' feed shows you posts exclusively from the sellers and users you follow." },
        { q: "How do I save a post?", a: "Click the 'Save' icon on any post. You can find all your saved posts later in the 'Saves' tab for easy access." },
        { q: "How do I send a private message?", a: "You can start a conversation by visiting a seller's profile and clicking the 'Message' button. All your private conversations can be found in the 'Messages' tab on the Feed page." },
    ]
  },
  {
    category: "Seller Profiles",
    questions: [
      { q: "What is a seller profile page?", a: "A seller's profile page is their dedicated space on Nipher. Here you can learn more about them, see their follower count, and view all their activity, including listed products, posts, and live streams." },
      { q: "How do I follow a seller?", a: "On a seller's profile page, you can click the 'Follow' button to subscribe to their updates. Their posts and live streams will then appear in your 'Following' feed." },
      { q: "How can I find a seller's social media links?", a: "If a seller has added their social media accounts, you will find them displayed with icons (like Instagram, Twitter, etc.) in the 'About' section of their profile. You can click these links to visit their pages." },
      { q: "What are the different tabs on a seller's profile?", a: "The tabs allow you to explore different aspects of a seller's activity. 'Listed Products' shows all items they have for sale. 'Posts' displays their feed updates. 'Sessions' shows their live and past streams." },
    ]
  },
    {
      category: "Platform Policies",
      questions: [
          { q: "What is the 7-Day Return Policy?", a: "Most items on Nipher are eligible for return within 7 days of delivery. The item must be in its original condition, with all tags and packaging intact. To initiate a return, go to your 'My Orders' page, select the delivered order, and click the 'Return Product' button. Some items, like personal care products or perishables, may not be returnable." },
          { q: "How does 'Pay on Delivery' work?", a: "Pay on Delivery (POD) is a payment method where you can pay for your order in cash at the time of delivery. This option is available for select locations and orders. If your order is eligible, you will see the POD option at checkout. Please have the exact amount ready to avoid inconvenience." },
          { q: "What does '100% Genuine' mean?", a: "We guarantee that all products sold on Nipher are authentic and sourced directly from verified sellers or trusted brand partners. Our seller verification process (KYC) ensures that only legitimate businesses sell on our platform. If you ever receive a product that you believe is not genuine, please contact our support team immediately through the Help Center for a full investigation and refund." },
          { q: "Is it safe to share my contact information in the chat?", a: "No. For your safety and privacy, you are strictly prohibited from sharing personal contact information (such as phone numbers, email addresses, or social media profiles) in public chats, including live stream chats. All communication and transactions should be kept within the Nipher platform." },
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

const quickTopics = [
    { label: "Funds not credited", icon: <Wallet className="w-4 h-4 mr-2" /> },
    { label: "When is my delivery?", icon: <Truck className="w-4 h-4 mr-2" /> },
    { label: "Unable to cancel order", icon: <Ban className="w-4 h-4 mr-2" /> },
    { label: "Product not received", icon: <Package className="w-4 h-4 mr-2" /> },
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
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
                <LifeBuoy className="h-16 w-16 mx-auto text-primary mb-4" />
                <h2 className="text-3xl font-bold">How can we help you?</h2>
                <p className="text-muted-foreground mt-2">Find answers to your questions below or raise a ticket for support.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Accordion type="single" collapsible className="w-full">
                        {faqData.map(category => (
                        <div key={category.category}>
                            <h3 className="text-xl font-semibold mt-6 mb-2 border-b pb-2">{category.category}</h3>
                            {category.questions.map((item, index) => (
                            <AccordionItem key={index} value={`${''}${category.category}-${index}`}>
                                <AccordionTrigger>{item.q}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                {item.a}
                                </AccordionContent>
                            </AccordionItem>
                            ))}
                        </div>
                        ))}
                    </Accordion>
                </div>

                <div className="lg:col-span-1">
                    <div className="sticky top-24">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Support Topics</CardTitle>
                                <CardDescription>Get help with common issues faster.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {quickTopics.map(topic => (
                                    <Button key={topic.label} asChild variant="outline" className="w-full justify-start">
                                        <Link href={`/contact?subject=${encodeURIComponent(topic.label)}`}>
                                            {topic.icon}
                                            {topic.label}
                                        </Link>
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>
                         <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Still need help?</CardTitle>
                                <CardDescription>If you couldn't find an answer, raise a support ticket.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button asChild className="w-full">
                                <Link href="/contact">
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Raise a Ticket
                                </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
