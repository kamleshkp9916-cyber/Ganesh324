
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel, { type EmblaCarouselType } from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { PROMOTIONAL_SLIDES_KEY, Slide } from '@/app/admin/settings/page';
import { Skeleton } from './ui/skeleton';

const initialOfferSlides: Slide[] = [
  { id: 1, imageUrl: 'https://placehold.co/1200x400.png', title: 'Flash Sale!', description: 'Up to 50% off on electronics.' },
  { id: 2, imageUrl: 'https://placehold.co/1200x400.png', title: 'New Arrivals', description: 'Check out the latest fashion trends.' },
  { id: 3, imageUrl: 'https://placehold.co/1200x400.png', title: 'Home Decor Deals', description: 'Beautify your space for less.' },
];

interface HeroSliderProps {
    onClose: () => void;
}

export function HeroSlider({ onClose }: HeroSliderProps) {
  const [slides] = useLocalStorage<Slide[]>(PROMOTIONAL_SLIDES_KEY, initialOfferSlides);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000, stopOnInteraction: false })]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const activeSlides = slides.filter(slide => !slide.expiresAt || new Date(slide.expiresAt) >= new Date());
  
  if (!isMounted) {
      return <Skeleton className="w-full aspect-[2/1] md:aspect-[3/1] rounded-lg" />;
  }

  if (activeSlides.length === 0) {
      return null; // Don't render anything if there are no active slides
  }
  
  return (
    <div className="w-full relative group">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {activeSlides.map((slide) => (
            <div className="flex-0_0_100 min-w-0" key={slide.id}>
               <Card className="overflow-hidden bg-card border-none">
                <CardContent className="relative p-0 flex items-center justify-center aspect-[2/1] md:aspect-[3/1]">
                    <Image
                    src={slide.imageUrl}
                    alt={slide.title}
                    fill
                    style={{objectFit: 'cover'}}
                    className="brightness-75"
                    data-ai-hint={slide.title}
                    />
                    <div className="absolute text-center text-primary-foreground p-4">
                    <h2 className="text-2xl md:text-4xl font-extrabold tracking-tighter">{slide.title}</h2>
                    <p className="text-sm md:text-lg">{slide.description}</p>
                    </div>
                </CardContent>
                </Card>
            </div>
          ))}
        </div>
      </div>

       <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-20 h-8 w-8 rounded-full text-white bg-black/30 hover:bg-black/50 hover:text-white"
            onClick={onClose}
        >
            <X className="h-5 w-5" />
        </Button>

      <Button
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        variant="secondary"
        size="icon"
        onClick={scrollPrev}
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <Button
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        variant="secondary"
        size="icon"
        onClick={scrollNext}
      >
        <ArrowRight className="h-4 w-4" />
      </Button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {activeSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={cn(
              "h-2 w-2 rounded-full transition-all duration-300",
              selectedIndex === index ? "w-6 bg-primary" : "bg-muted/50"
            )}
          />
        ))}
      </div>
    </div>
  );
}
