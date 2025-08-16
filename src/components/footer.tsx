
import { Facebook, Twitter, Linkedin, Mail, MapPin, Phone, Instagram } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-black text-gray-300 py-12">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-lg font-bold text-white mb-4">About the company</h3>
          <p className="text-sm mb-4">
            Ut congue augue non tellus bibendum, in varius tellus condimentum. In scelerisque nibh tortor, sed rhoncus
            odio condimentum in. Sed sed est ut sapien ultrices eleifend.
          </p>
          <div className="flex space-x-4">
            <Link href="#" className="text-gray-300 hover:text-white"><Facebook className="h-5 w-5" /></Link>
            <Link href="#" className="text-gray-300 hover:text-white"><Twitter className="h-5 w-5" /></Link>
            <Link href="#" className="text-gray-300 hover:text-white"><Linkedin className="h-5 w-5" /></Link>
            <Link href="#" className="text-gray-300 hover:text-white"><Instagram className="h-5 w-5" /></Link>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Contact Us</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start">
              <MapPin className="h-5 w-5 mr-3 mt-1 text-primary flex-shrink-0" />
              <span>Street name and number<br />City, Country</span>
            </li>
            <li className="flex items-center">
              <Phone className="h-5 w-5 mr-3 text-primary" />
              <span>(+00) 0000 000 000</span>
            </li>
            <li className="flex items-center">
              <Mail className="h-5 w-5 mr-3 text-primary" />
              <a href="mailto:office@company.com" className="hover:text-white">office@company.com</a>
            </li>
          </ul>
        </div>
        <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
                <h2 className="text-2xl font-bold text-white">StreamCart <span className="text-primary">Logo</span></h2>
            </div>
          <nav className="flex justify-center md:justify-start flex-wrap space-x-2 text-sm mb-4">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>|</span>
            <Link href="/about" className="hover:text-white">About</Link>
            <span>|</span>
            <Link href="/services" className="hover:text-white">Services</Link>
            <span>|</span>
            <Link href="/portfolio" className="hover:text-white">Portfolio</Link>
            <span>|</span>
            <Link href="/news" className="hover:text-white">News</Link>
            <span>|</span>
            <Link href="/contact" className="hover:text-white">Contact</Link>
          </nav>
          <p className="text-xs text-gray-500">StreamCart © {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
}
