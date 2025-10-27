
"use client";

import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus, Rss } from 'lucide-react';
import { liveSellers } from '@/lib/product-data';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Users, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function SubCategoryStreamPage() {
    const router = useRouter();
    const params = useParams();

    let { category: categoryPath } = params;

    if (!categoryPath) {
        return <div>Loading...</div>;
    }
    
    const pathSegments = Array.isArray(categoryPath) ? categoryPath : [categoryPath];
    const categorySlug = pathSegments[0] || '';
    const subCategorySlug = pathSegments[1] || null;
    
    const pageTitle = (subCategorySlug || categorySlug)
        .replace(/-/g, ' ')
        .replace(/%26/g, '&')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
        
    const filteredStreams = liveSellers.filter(stream => {
        const streamCategorySlug = stream.category.toLowerCase().replace(/\s+/g, '-');
        const streamSubCategorySlug = stream.subcategory?.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '%26');
        
        if (subCategorySlug) {
            return streamCategorySlug === categorySlug && streamSubCategorySlug === subCategorySlug;
        }
        return streamCategorySlug === categorySlug;
    });

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <header className="p-4 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-sm z-30 border-b">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold truncate">{pageTitle}</h1>
                <div className="w-10"></div>
            </header>

            <main className="container mx-auto py-6">
                 <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-2xl font-bold">{pageTitle}</h2>
                    </div>
                    <Button variant="outline">
                        <Rss className="mr-2 h-4 w-4" />
                        Follow
                    </Button>
                </div>

                <Separator className="my-4" />

                {filteredStreams.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredStreams.map((seller) => (
                            <Link href={`/stream/${seller.id}`} key={seller.id} className="group">
                                <Card className="overflow-hidden h-full flex flex-col">
                                    <div className="relative aspect-video bg-muted">
                                        <Image src={seller.thumbnailUrl} alt={`Live stream from ${seller.name}`} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover w-full h-full transition-transform group-hover:scale-105" />
                                        <div className="absolute top-2 left-2 z-10"><Badge variant="destructive">LIVE</Badge></div>
                                        <div className="absolute top-2 right-2 z-10"><Badge variant="secondary" className="bg-black/50 text-white"><Users className="w-3 h-3 mr-1"/>{seller.viewers.toLocaleString()}</Badge></div>
                                    </div>
                                    <div className="p-3 flex-grow">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-1 overflow-hidden">
                                                <p className="font-semibold text-sm leading-tight truncate group-hover:underline">{seller.title}</p>
                                                <p className="text-xs text-muted-foreground">{seller.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-muted-foreground">
                        <h3 className="text-xl font-semibold">No Live Streams</h3>
                        <p>There are no active streams in this category right now.</p>
                    </div>
                )}
            </main>
        </div>
    );
}

