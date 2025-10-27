
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useInView } from 'react-intersection-observer';

export const SubcategoryCard = ({ sub }: { sub: any }) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: '200px 0px',
    });
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (inView) {
            // Simulate a network delay for loading the image
            const timer = setTimeout(() => setIsLoaded(true), Math.random() * 1000);
            return () => clearTimeout(timer);
        }
    }, [inView]);

    return (
        <Link 
            ref={ref} 
            href={`/live-selling/${sub.categoryName.toLowerCase()}/${sub.name.toLowerCase().replace(/ /g, '-').replace(/&/g, '%26')}`} 
            className="group block space-y-2"
        >
            <Card className="overflow-hidden">
                <div className="aspect-video bg-muted relative">
                    {!isLoaded && <Skeleton className="w-full h-full" />}
                    {isLoaded && (
                        <Image
                            src={sub.imageUrl}
                            alt={sub.name}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                            className="object-cover group-hover:scale-105 transition-transform"
                        />
                    )}
                </div>
            </Card>
            <div>
                <p className="font-semibold text-sm truncate group-hover:text-primary">{sub.name}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {sub.viewers.toLocaleString()} watching
                    </div>
                    <Badge variant="outline">{sub.categoryName}</Badge>
                </div>
            </div>
        </Link>
    );
};
