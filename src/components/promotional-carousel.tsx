
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useLocalStorage } from '@/hooks/use-local-storage';
import { PROMOTIONAL_SLIDES_KEY, Slide } from '@/app/admin/settings/page';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

const defaultSlides: Slide[] = [
  { id: 1, imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&h=1200&fit=crop', title: "Discover products you'll love", description: "Curated picks, timeless design, and everyday prices. Start exploring our latest arrivals and best sellers." },
  { id: 2, imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=1200&fit=crop', title: 'New Arrivals Are Here', description: 'Check out the latest fashion trends and must-have styles for the new season.' },
];

export function PromotionalCarousel() {
  const [slides, setSlides] = useLocalStorage<Slide[]>(PROMOTIONAL_SLIDES_KEY, defaultSlides);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeSlides = isMounted ? slides.filter(slide => !slide.expiresAt || new Date(slide.expiresAt) >= new Date()) : [];

  if (!isMounted) {
      return (
          <div className="w-full mb-8">
            <Skeleton className="aspect-[1.5/1] md:aspect-[2.5/1] w-full rounded-xl" />
          </div>
      );
  }

  if (activeSlides.length === 0) {
      return null;
  }
  
  return (
    <div className="w-full">
      <Carousel
        className="w-full"
        plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
        opts={{ loop: true }}
      >
        <CarouselContent>
          {activeSlides.map((slide, index) => (
            <CarouselItem key={index}>
              <Card className="overflow-hidden border-none shadow-lg bg-gray-900 text-white rounded-2xl">
                <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 items-center">
                  <div className="relative aspect-square">
                      <Image
                          src={slide.imageUrl}
                          alt={slide.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                          data-ai-hint="fashion model"
                      />
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                     <p className="text-sm font-medium text-gray-400 mb-2">New season essentials</p>
                     <h2 className="text-3xl md:text-4xl font-bold text-white">{slide.title}</h2>
                     <p className="text-base text-gray-300 mt-4 max-w-md">{slide.description}</p>
                      <div className="flex flex-wrap gap-4 mt-8">
                         <Button asChild className="h-11 px-6 text-base bg-primary hover:bg-primary/90">
                            <Link href="/live-selling/trending/new-arrivals">Shop New Arrivals</Link>
                         </Button>
                         <Button asChild variant="secondary" className="h-11 px-6 text-base bg-white/10 text-white hover:bg-white/20">
                            <Link href="/listed-products">Browse Categories</Link>
                         </Button>
                     </div>
                     <div className="flex items-center gap-2 mt-8 text-sm text-gray-400">
                        <Zap className="h-4 w-4"/>
                        <span>Free shipping over $50 and 30-day returns</span>
                     </div>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        {activeSlides.length > 1 && (
            <>
                <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden lg:flex" />
                <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:flex" />
            </>
        )}
      </Carousel>
    </div>
  );
}

