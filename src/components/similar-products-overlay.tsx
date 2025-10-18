
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

interface SimilarProductsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  similarProducts: any[];
  relatedStreams: any[];
}

export function SimilarProductsOverlay({
  isOpen,
  onClose,
  similarProducts,
  relatedStreams,
}: SimilarProductsOverlayProps) {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-lg border-t rounded-t-lg shadow-2xl animate-in fade-in-0 slide-in-from-bottom-5 duration-300"
        onClick={(e) => e.stopPropagation()}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">You Might Also Like</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-5 w-5" />
            </Button>
        </div>
        <Tabs defaultValue="products">
          <TabsList>
            <TabsTrigger value="products">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Products ({similarProducts.length})
            </TabsTrigger>
            <TabsTrigger value="streams">
                <Video className="mr-2 h-4 w-4" />
                Streams ({relatedStreams.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="mt-4">
            <Carousel opts={{ align: "start", loop: false }} className="w-full">
              <CarouselContent className="-ml-2">
                {similarProducts.map((p) => (
                  <CarouselItem key={p.id} className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/4 xl:basis-1/5 pl-2">
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
                        <div className="p-2">
                          <h4 className="font-semibold truncate text-xs">{p.name}</h4>
                          <p className="font-bold text-sm">{p.price}</p>
                           <div className="flex items-center gap-1 text-xs text-amber-400 mt-1">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="font-semibold text-foreground">4.8</span>
                            <span className="text-muted-foreground">({p.reviews || '1.2k'})</span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 hidden md:flex" />
              <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex" />
            </Carousel>
          </TabsContent>
          <TabsContent value="streams" className="mt-4">
            <Carousel opts={{ align: "start", loop: false }} className="w-full">
              <CarouselContent className="-ml-2">
                {relatedStreams.map((s) => (
                  <CarouselItem key={s.id} className="basis-3/4 sm:basis-1/2 md:basis-1/2 lg:basis-1/3 xl:basis-1/4 pl-2">
                     <Link href={`/stream/${s.id}`} className="group block">
                        <div className="relative rounded-lg overflow-hidden aspect-video bg-muted">
                            <div className="absolute top-2 left-2 z-10"><Badge variant="destructive">LIVE</Badge></div>
                            <div className="absolute top-2 right-2 z-10">
                                <Badge variant="secondary" className="bg-black/50 text-white gap-1.5">
                                    <Users className="h-3 w-3"/>
                                    {s.viewers}
                                </Badge>
                            </div>
                             <Image
                                src={s.thumbnailUrl}
                                alt={`Live stream from ${s.name}`}
                                fill
                                sizes="33vw"
                                className="object-cover w-full h-full group-hover:scale-105 transition-transform"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-2">
                                <div className="flex items-start gap-2 text-white">
                                    <Avatar className="w-8 h-8 border-2 border-background">
                                        <AvatarImage src={s.avatarUrl} />
                                        <AvatarFallback>{s.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-semibold text-xs group-hover:underline truncate">{s.name}</p>
                                        <p className="text-xs opacity-80">{s.category}</p>
                                    </div>
                                </div>
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
