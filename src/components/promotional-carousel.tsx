
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

const defaultSlides: Slide[] = [
  { id: 1, imageUrl: 'https://placehold.co/1200x400.png?text=Promotion+1', title: 'Flash Sale!', description: 'Up to 50% off on electronics.' },
  { id: 2, imageUrl: 'https://placehold.co/1200x400.png?text=Promotion+2', title: 'New Arrivals', description: 'Check out the latest fashion trends.' },
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
            <Skeleton className="aspect-[3/1] w-full" />
          </div>
      );
  }

  if (activeSlides.length === 0) {
      return null;
  }
  
  return (
    <div className="w-full mb-8">
      <Carousel
        className="w-full"
        plugins={[Autoplay({ delay: 4000, stopOnInteraction: true })]}
        opts={{ loop: true }}
      >
        <CarouselContent>
          {activeSlides.map((slide, index) => (
            <CarouselItem key={index}>
              <Card className="overflow-hidden border-none shadow-lg bg-card">
                <CardContent className="p-0 relative aspect-[2.5/1] flex items-center">
                    <div className="absolute inset-0 md:relative md:w-1/2 h-full">
                        <Image
                            src={slide.imageUrl}
                            alt={slide.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover"
                        />
                         <div className="absolute inset-0 bg-gradient-to-r from-background/0 via-background/20 to-background md:hidden" />
                    </div>
                  <div className="relative z-10 p-8 md:p-12 w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left">
                     <h2 className="text-2xl md:text-4xl font-bold text-foreground">{slide.title}</h2>
                     <p className="text-sm md:text-lg text-muted-foreground mt-2 max-w-lg">{slide.description}</p>
                      <Button asChild className="mt-4 h-9 px-4 text-xs sm:h-10 sm:px-6 sm:text-sm">
                         <Link href="#">Shop Now</Link>
                      </Button>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden lg:flex" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:flex" />
      </Carousel>
    </div>
  );
}
