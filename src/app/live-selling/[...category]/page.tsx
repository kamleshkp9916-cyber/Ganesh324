
"use client";

import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus, Rss, Heart, Users, Search, ChevronDown } from 'lucide-react';
import { mockStreams as liveSellers } from '@/lib/product-data';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React, { useState } from 'react';

export default function SubCategoryStreamPage() {
    const router = useRouter();
    const params = useParams();
    const [sortOption, setSortOption] = useState("viewers-desc");

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
        if (!stream.category) return false;
        const streamCategorySlug = stream.category.toLowerCase().replace(/\s+/g, '-');
        const streamSubCategorySlug = (stream as any).subcategory?.toLowerCase().replace(/\s+/g, '-').replace(/&/g, '%26');
        
        if (subCategorySlug) {
            return streamCategorySlug === categorySlug && streamSubCategorySlug === subCategorySlug;
        }
        return streamCategorySlug === categorySlug;
    });

    const totalViewers = filteredStreams.reduce((acc, stream) => acc + stream.viewers, 0);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
            <header className="p-4 flex items-center justify-between sticky top-0 bg-gray-900/80 backdrop-blur-sm z-30 border-b border-gray-700">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-xl font-bold truncate md:hidden">{pageTitle}</h1>
                <div className="w-10 md:hidden"></div>
            </header>

            <main className="container mx-auto py-6">
                <div className="flex items-start gap-6 mb-6">
                     <Image
                        src="https://placehold.co/150x200.png"
                        alt={pageTitle}
                        width={150}
                        height={200}
                        className="rounded-lg hidden md:block"
                     />
                     <div className="flex-grow pt-2">
                        <h1 className="text-4xl font-bold mb-2">{pageTitle}</h1>
                        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                            <span><strong className="text-white">{(totalViewers / 1000).toFixed(1)}K</strong> watching</span>
                            <span><strong className="text-white">222.5K</strong> followers</span>
                        </div>
                         <div className="flex items-center gap-2 mb-4">
                             <Badge variant="secondary" className="bg-gray-700 text-gray-300 hover:bg-gray-600">IRL</Badge>
                             <Badge variant="secondary" className="bg-gray-700 text-gray-300 hover:bg-gray-600">Casual</Badge>
                         </div>
                        <Button variant="outline" className="bg-gray-700 border-gray-600 hover:bg-gray-600">
                            <Heart className="mr-2 h-4 w-4" />
                            Follow
                        </Button>
                     </div>
                </div>

                <Tabs defaultValue="livestreams" className="w-full">
                    <TabsList className="bg-transparent border-b border-gray-700 rounded-none p-0 h-auto">
                        <TabsTrigger value="livestreams" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Livestreams</TabsTrigger>
                        <TabsTrigger value="clips" className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">Clips</TabsTrigger>
                    </TabsList>
                    <TabsContent value="livestreams" className="mt-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                            <div className="relative w-full md:w-auto md:flex-grow max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <Input placeholder="Search tags" className="bg-gray-800 border-gray-700 pl-10" />
                            </div>
                             <div className="flex items-center gap-4">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="bg-gray-800 border-gray-700 gap-1.5">
                                            Filter by: <span className="font-semibold">Languages</span>
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        <DropdownMenuRadioGroup value={"english"} onValueChange={() => {}}>
                                            <DropdownMenuRadioItem value="english">English</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="hindi">Hindi</DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="bg-gray-800 border-gray-700 gap-1.5">
                                            Sort by: <span className="font-semibold capitalize">{sortOption.replace('-', ' ')}</span>
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-56">
                                        <DropdownMenuRadioGroup value={sortOption} onValueChange={setSortOption}>
                                            <DropdownMenuRadioItem value="viewers-desc">Viewers (High to Low)</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="viewers-asc">Viewers (Low to High)</DropdownMenuRadioItem>
                                            <DropdownMenuRadioItem value="recent">Recently Started</DropdownMenuRadioItem>
                                        </DropdownMenuRadioGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {filteredStreams.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredStreams.map((seller) => (
                                    <Link href={`/stream/${seller.id}`} key={seller.id} className="group">
                                        <Card className="overflow-hidden h-full flex flex-col bg-gray-800 border-gray-700 shadow-lg hover:shadow-primary/20 transition-shadow">
                                            <div className="relative aspect-video bg-gray-700">
                                                <Image src={seller.thumbnailUrl} alt={`Live stream from ${seller.name}`} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover w-full h-full transition-transform group-hover:scale-105" />
                                                <div className="absolute top-2 left-2 z-10"><Badge variant="destructive">LIVE</Badge></div>
                                                <div className="absolute top-2 right-2 z-10"><Badge variant="secondary" className="bg-black/50 text-white"><Users className="w-3 h-3 mr-1"/>{seller.viewers.toLocaleString()}</Badge></div>
                                            </div>
                                            <div className="p-3 flex-grow">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="font-semibold text-sm leading-tight truncate group-hover:text-primary transition-colors">{(seller as any).title || 'Live Stream'}</p>
                                                        <p className="text-xs text-gray-400">{seller.name}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-400">
                                <h3 className="text-xl font-semibold">No Live Streams</h3>
                                <p>There are no active streams in this category right now.</p>
                            </div>
                        )}
                    </TabsContent>
                     <TabsContent value="clips">
                        <div className="text-center py-20 text-gray-400">
                            <h3 className="text-xl font-semibold">No Clips Found</h3>
                            <p>There are no clips available for this category yet.</p>
                        </div>
                     </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}

