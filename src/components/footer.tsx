
import { Facebook, Twitter, Linkedin, Mail, MapPin, Phone, Instagram, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Logo } from './logo';
import { cn } from '@/lib/utils';

export function Footer() {
  return (
    <footer className="bg-card text-card-foreground border-t">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div className="lg:col-span-1">
             <div className="flex items-center gap-2 mb-4">
                <Logo className="h-10 w-10"/>
                <h2 className="text-2xl font-bold text-foreground">StreamCart</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Your one-stop shop for live shopping. Discover, engage, and buy in real-time.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
                <li><Link href="/live-selling" className="text-muted-foreground hover:text-primary">Live Shopping</Link></li>
                <li><Link href="/orders" className="text-muted-foreground hover:text-primary">My Orders</Link></li>
                <li><Link href="/profile" className="text-muted-foreground hover:text-primary">Profile</Link></li>
                <li><Link href="/help" className="text-muted-foreground hover:text-primary">Help & Support</Link></li>
                <li><Link href="/terms-and-conditions" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <MapPin className="h-4 w-4 mr-3 mt-1 text-primary flex-shrink-0" />
                <span className="text-muted-foreground">123 Stream St, Commerce City, IN</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-3 text-primary" />
                <span className="text-muted-foreground">(+91) 98765 43210</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-4 w-4 mr-3 text-primary" />
                <a href="mailto:support@streamcart.com" className="text-muted-foreground hover:text-primary">support@streamcart.com</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Newsletter</h3>
            <p className="text-sm text-muted-foreground mb-2">
                Stay up to date with our latest streams and promotions.
            </p>
            <form className="flex gap-2">
                <input type="email" placeholder="Enter your email" className="bg-input text-sm rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-ring" />
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold hover:bg-primary/90">
                    Subscribe
                </button>
            </form>
          </div>

        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} StreamCart. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
