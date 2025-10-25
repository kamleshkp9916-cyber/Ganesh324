
"use client";

import React from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { X, Video, ShoppingBag, Star, Users, Package } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from 'next/image';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Skeleton } from './ui/skeleton';

interface SimilarProductsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  similarProducts: any[];
  relatedStreams: any[];
  isLoading: boolean;
}

const ProductCardSkeleton = () => (
    <Card className="w-full">
        <Skeleton className="aspect-square w-full rounded-t-lg" />
        <div className="p-2 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-1/2" />
        </div>
    </Card>
);

export function SimilarProductsOverlay({
  isOpen,
  onClose,
  similarProducts,
  relatedStreams,
  isLoading,
}: SimilarProductsOverlayProps) {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-t rounded-t-lg shadow-2xl animate-in fade-in-0 slide-in-from-bottom-5 duration-300"
        onClick={(e) => e.stopPropagation()}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="flex justify-between items-center mb-1">
            <h2 className="text-xl font-bold">You Might Also Like</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
            </Button>
        </div>
        <Tabs defaultValue="products">
          <TabsList className="mb-2">
            <TabsTrigger value="products">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Products ({similarProducts.length})
            </TabsTrigger>
            <TabsTrigger value="streams">
                <Video className="mr-2 h-4 w-4" />
                Streams ({relatedStreams.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="mt-0">
            <Carousel opts={{ align: "start", loop: false }} className="w-full">
              <CarouselContent className="-ml-2">
                {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                        <CarouselItem key={index} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-2">
                           <ProductCardSkeleton />
                        </CarouselItem>
                    ))
                ) : (
                    similarProducts.map((p) => (
                    <CarouselItem key={p.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6 pl-2">
                        <Link href={`/product/${p.key}`} className="group block">
                        <Card className="w-full group overflow-hidden h-full flex flex-col">
                            <div className="relative aspect-square bg-muted">
                            <Image
                                src={p.images[0]}
                                alt={p.name}
                                fill
                                sizes="20vw"
                                className="object-cover transition-transform group-hover:scale-105"
                            />
                            </div>
                            <div className="p-2 flex-grow flex flex-col">
                            <h4 className="font-semibold truncate text-xs flex-grow">{p.name}</h4>
                            <p className="font-bold text-sm mt-1">{p.price}</p>
                            <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
                                <Star className="w-3 h-3 fill-current" />
                                <span className="font-semibold text-foreground">4.8</span>
                                <span className="text-muted-foreground">({p.reviews || '1.2k'})</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <div className="flex items-center gap-1"><Package className="w-3 h-3" /> {p.stock} left</div>
                                <div className="flex items-center gap-1"><Users className="w-3 h-3" /> {p.sold} sold</div>
                            </div>
                            </div>
                        </Card>
                        </Link>
                    </CarouselItem>
                    ))
                )}
              </CarouselContent>
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 hidden md:flex" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex" />
            </Carousel>
          </TabsContent>
          <TabsContent value="streams" className="mt-0">
            <Carousel opts={{ align: "start", loop: false }} className="w-full">
              <CarouselContent className="-ml-2">
                {relatedStreams.map((s) => (
                  <CarouselItem key={s.id} className="basis-3/4 sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 pl-2">
                     <Link href={`/stream/${s.id}`} key={s.id} className="group block">
                        <div className="relative rounded-lg overflow-hidden aspect-video bg-muted w-full flex-shrink-0">
                            <div className="absolute top-2 left-2 z-10"><Badge variant="destructive">LIVE</Badge></div>
                            <div className="absolute top-2 right-2 z-10"><Badge variant="secondary" className="bg-black/50 text-white"><Users className="w-3 h-3 mr-1"/>{s.viewers.toLocaleString()}</Badge></div>
                             <Image src={s.thumbnailUrl} alt={`Live stream from ${s.name}`} fill sizes="33vw" className="object-cover transition-transform group-hover:scale-105" />
                        </div>
                        <div className="flex items-start gap-2 mt-2">
                            <Avatar className="w-8 h-8">
                                <AvatarImage src={s.avatarUrl} alt={s.name} />
                                <AvatarFallback>{s.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <p className="font-semibold text-sm leading-tight group-hover:underline truncate">{s.title || s.name}</p>
                                <p className="text-xs text-muted-foreground">{s.name}</p>
                                <p className="text-xs text-primary font-semibold mt-0.5">{s.category}</p>
                            </div>
                        </div>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 hidden md:flex" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex" />
            </Carousel>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
