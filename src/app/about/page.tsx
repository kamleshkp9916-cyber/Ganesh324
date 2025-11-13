
"use client";

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold">About Us</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground">About Nipher</h2>
            <p className="text-muted-foreground mt-2">Welcome to Nipher, a new way to experience online shopping.</p>
          </div>

          <p className="text-muted-foreground">Founded on January 1, 2025 by Ganesh Prajapati, Nipher was born from a vision: to transform traditional e-commerce into something more interactive, engaging, and trustworthy. Shopping online often feels impersonal, with buyers left guessing about the quality of products. We wanted to change that.</p>
          <p className="text-muted-foreground">At Nipher, we combine the power of live streaming with the convenience of e-commerce. Our platform allows sellers to showcase their products in real time while buyers can interact, ask questions, and see products in action before making a purchase. At the same time, customers can explore and buy from our listed product collections, making the entire experience smooth, social, and reliable.</p>

          <div>
            <h3 className="text-2xl font-semibold text-foreground mb-4">Our Mission</h3>
            <p className="text-muted-foreground">To bring human connection back to online shopping, making it more transparent, fun, and community-driven.</p>
          </div>

          <div>
            <h3 className="text-2xl font-semibold text-foreground mb-4">Why Nipher?</h3>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Live product demos – see before you buy.</li>
              <li>Interactive shopping – chat, ask, and connect with sellers.</li>
              <li>Instant purchase – buy directly during the live stream or from listed products anytime.</li>
              <li>Trust & transparency – no filters, no tricks, just real products shown live.</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-2xl font-semibold text-foreground mb-4">Our Vision</h3>
            <p className="text-muted-foreground">We aim to become the go-to platform for live commerce, where buyers and sellers connect in a trusted, engaging marketplace. As technology evolves, so will Nipher — always keeping people at the center of commerce.</p>
          </div>

          <div className="border-t pt-8">
            <h3 className="text-2xl font-semibold text-foreground mb-4">A Note from Our Founder</h3>
            <blockquote className="border-l-4 pl-4 italic text-muted-foreground">
              <p>"I started Nipher with a simple belief: online shopping should feel as real and trustworthy as buying something in person. Too often, people purchase products online only to be disappointed when the item arrives. With live streaming, customers can see the product in action, ask questions directly, and shop with confidence.</p>
              <p className="mt-4">Nipher isn’t just about buying and selling — it’s about building trust, creating connections, and making shopping fun again. My goal is to give both sellers and buyers a platform that feels alive, interactive, and community-driven.</p>
              <p className="mt-4">Thank you for being a part of this journey. We’re just getting started, and the best is yet to come."</p>
              <cite className="block mt-4 not-italic font-semibold">— Ganesh Prajapati, Founder</cite>
            </blockquote>
          </div>
        </div>
      </main>
    </div>
  );
}
