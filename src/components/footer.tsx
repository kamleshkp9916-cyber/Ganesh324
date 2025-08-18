
import { Facebook, Twitter, Linkedin, Mail, MapPin, Phone, Instagram, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Logo } from './logo';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

function AppleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 384 512" fill="currentColor" height="1em" width="1em" {...props}>
            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C39.3 142.1 0 184.8 0 249.4c0 37.3 18.6 92.8 64.1 148.6 30.2 36.7 59.7 57.4 95.5 57.4 30.2 0 47.3-18.1 78.8-18.1 31.4 0 48.7 18.1 79 18.1 35.2 0 63.3-20.1 92.7-56.5-1.7-1.7-34-31.5-34-88.8zM256 64c0 16.6-13.4 30-30 30s-30-13.4-30-30 13.4-30 30-30 30 13.4 30 30z" />
        </svg>
    );
}

function GooglePlayIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 512 512" fill="currentColor" height="1em" width="1em" {...props}>
            <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0L110.6 60.1 110.6 60.1 47 416.9 47 0zM104.6 499l280.8-161.2-60.1-60.1L104.6 499zM464.9 212.3L172.3 13l-60.1 60.1L464.9 212.3z" />
        </svg>
    );
}

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
            <h3 className="text-lg font-semibold text-foreground mb-4">Get Our App</h3>
            <p className="text-sm text-muted-foreground mb-4">
                Download our mobile app for the best live shopping experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="w-full sm:w-auto justify-center">
                    <AppleIcon className="mr-2 h-5 w-5" />
                    <div>
                        <div className="text-xs">Download on the</div>
                        <div className="text-sm font-semibold">App Store</div>
                    </div>
                </Button>
                <Button variant="outline" className="w-full sm:w-auto justify-center">
                    <GooglePlayIcon className="mr-2 h-5 w-5" />
                     <div>
                        <div className="text-xs">GET IT ON</div>
                        <div className="text-sm font-semibold">Google Play</div>
                    </div>
                </Button>
            </div>
          </div>

        </div>
        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} StreamCart. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
