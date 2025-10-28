
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useLocalStorage } from '@/hooks/use-local-storage';
import { PROMOTIONAL_SLIDES_KEY, Slide } from '@/app/admin/settings/page';
import { Skeleton } from './ui/skeleton';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { Zap } from 'lucide-react';

const defaultSlides: Slide[] = [
  { id: 1, imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&h=800&fit=crop', title: "Discover products you'll love", description: "Curated picks, timeless design, and everyday prices. Start exploring our latest arrivals and best sellers." },
  { id: 2, imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=800&fit=crop', title: 'New Arrivals Are Here', description: 'Check out the latest fashion trends and must-have styles for the new season.' },
  { id: 3, imageUrl: 'https://images.unsplash.com/photo-1525945367383-a90940981977?w=800&h=800&fit=crop', title: "Women's Fashion", description: 'Explore our curated collection of women\'s clothing and accessories.' },
];

export function PromotionalCarousel() {
  const [slides, setSlides] = useLocalStorage<Slide[]>(PROMOTIONAL_SLIDES_KEY, defaultSlides);
  const [isMounted, setIsMounted] = useState(false);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!api) {
      return;
    }
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const activeSlides = isMounted ? slides.filter(slide => !slide.expiresAt || new Date(slide.expiresAt) >= new Date()) : [];

  if (!isMounted) {
      return (
          <div className="w-full mb-8">
            <Skeleton className="aspect-[2.5/1] w-full rounded-2xl" />
          </div>
      );
  }

  if (activeSlides.length === 0) {
      return null;
  }
  
  return (
    <Card className="overflow-hidden border-none shadow-lg bg-black text-white rounded-2xl">
      <CardContent className="p-0 grid grid-cols-1 md:grid-cols-2 items-center">
        <div className="relative p-6 md:p-8 order-2 md:order-1">
            <p className="text-sm font-medium text-gray-400 mb-2">New season essentials</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Discover products you'll love</h2>
            <p className="text-base text-gray-300 mt-4 max-w-md">Curated picks, timeless design, and everyday prices. Start exploring our latest arrivals and best sellers.</p>
            <div className="flex flex-wrap gap-4 mt-8">
                <Button asChild className="h-11 px-6 text-base bg-white text-black hover:bg-gray-200">
                    <Link href="/live-selling/trending/new-arrivals">Shop New Arrivals</Link>
                </Button>
                <Button asChild variant="outline" className="h-11 px-6 text-base bg-transparent text-white border-white hover:bg-white hover:text-black">
                    <Link href="/listed-products">Browse Categories</Link>
                </Button>
            </div>
            <div className="flex items-center gap-2 mt-8 text-sm text-gray-400">
                <Zap className="h-4 w-4"/>
                <span>Free shipping over $50 and 30-day returns</span>
            </div>
        </div>
        <div className="relative aspect-[1/1] md:aspect-auto md:h-full order-1 md:order-2">
            <Carousel
                setApi={setApi}
                className="w-full h-full"
                plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
                opts={{ loop: true }}
            >
                <CarouselContent className="h-full">
                    {activeSlides.map((slide, index) => (
                        <CarouselItem key={index}>
                            <div className="relative h-full w-full">
                                <Image
                                    src={slide.imageUrl}
                                    alt={slide.title}
                                    fill
                                    sizes="50vw"
                                    className="object-cover"
                                    data-ai-hint="fashion model"
                                />
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
             <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2 z-10">
                {activeSlides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => api?.scrollTo(i)}
                        className={cn(
                            "h-2 w-2 rounded-full bg-white/50 transition-all",
                            i === current ? "w-6 bg-white" : "hover:bg-white/75"
                        )}
                    />
                ))}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
