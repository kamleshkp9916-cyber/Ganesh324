
"use client";

import { Facebook, Twitter, Linkedin, Mail, MapPin, Phone, Instagram } from 'lucide-react';
import Link from 'next/link';
import { Logo } from './logo';
import { useAuth } from '@/hooks/use-auth';
import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { FOOTER_CONTENT_KEY } from '@/components/settings/keys';
import type { FooterContent } from '@/components/settings/keys';


const defaultFooterContent: FooterContent = {
  description: "Your one-stop shop for live shopping. Discover, engage, and buy in real-time.",
  address: "123 Stream St, Commerce City, IN",
  phone: "(+91) 98765 43210",
  email: "support@nipher.in",
  facebook: "https://facebook.com",
  twitter: "https://twitter.com",
  linkedin: "https://linkedin.com",
  instagram: "https://instagram.com",
};

export function Footer() {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [footerContent] = useLocalStorage<FooterContent>(FOOTER_CONTENT_KEY, defaultFooterContent);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
      // You can return a skeleton loader here if you want.
      return null;
  }

  return (
    <footer className="bg-card text-card-foreground border-t">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="lg:col-span-1">
             <div className="flex items-center gap-2 mb-4">
                <Logo />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {footerContent.description}
            </p>
            <div className="flex space-x-4">
              {footerContent.facebook && <Link href={footerContent.facebook} className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>}
              {footerContent.twitter && <Link href={footerContent.twitter} className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>}
              {footerContent.linkedin && <Link href={footerContent.linkedin} className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></Link>}
              {footerContent.instagram && <Link href={footerContent.instagram} className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
                <li><Link href="/live-selling" className="text-muted-foreground hover:text-primary">Live Shopping</Link></li>
                {user && (
                    <>
                        <li><Link href="/orders" className="text-muted-foreground hover:text-primary">My Orders</Link></li>
                        <li><Link href="/profile" className="text-muted-foreground hover:text-primary">Profile</Link></li>
                    </>
                )}
                <li><Link href="/help" className="text-muted-foreground hover:text-primary">Help & Support</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Information</h3>
            <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
                <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
                <li><Link href="/privacy-and-security" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms-and-conditions" className="text-muted-foreground hover:text-primary">Terms & Conditions</Link></li>
                <li><Link href="/faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <MapPin className="h-4 w-4 mr-3 mt-1 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">{footerContent.address}</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-3 text-primary" />
                <span className="text-muted-foreground">{footerContent.phone}</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-3 text-primary" />
                <a href={`mailto:${footerContent.email}`} className="text-muted-foreground hover:text-primary">{footerContent.email}</a>
              </li>
            </ul>
          </div>

        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Nipher. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
