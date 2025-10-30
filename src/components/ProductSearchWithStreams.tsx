
"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getFirestore, collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase';
import { useDebounce } from '@/hooks/use-debounce';
import { normalize, unique, generateKeywords } from '@/lib/generateKeywords';
import { Input } from './ui/input';
import { Popover, PopoverAnchor, PopoverContent } from './ui/popover';
import { Loader2, Search, Video, ShoppingBag, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { productDetails, mockStreams } from '@/lib/product-data';
import { Separator } from './ui/separator';

export function ProductSearchWithStreams() {
  const [q, setQ] = useState('');
  const debouncedQuery = useDebounce(q, 350);
  const [loading, setLoading] = useState(false);
  
  const [productSuggestions, setProductSuggestions] = useState<any[]>([]);
  const [streamHints, setStreamHints] = useState<any[]>([]);
  
  const [popoverOpen, setPopoverOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const tokenize = (text: string): string[] => {
    if (!text || !text.trim()) return [];
    const normalizedText = normalize(text);
    const parts = normalizedText.split(/\s+/).filter(Boolean);
    return unique(parts).slice(0, 10);
  };
  
  const runSearch = useCallback(async (queryText: string) => {
    if (!queryText || !queryText.trim()) {
      setProductSuggestions([]);
      setStreamHints([]);
      setLoading(false);
      setPopoverOpen(false);
      return;
    }
    setLoading(true);
    const tokens = tokenize(queryText);

    try {
      // For demo, we are filtering local mock data
      const allProducts = Object.values(productDetails).map(p => ({...p, keywords: generateKeywords(p)}));

      // Score and sort products
      const scoredProducts = allProducts.map(doc => {
        const k = (doc.keywords || []).map(x => String(x).toLowerCase());
        const score = tokens.reduce((s, t) => s + (k.includes(t) ? 1 : 0), 0);
        return { doc, score };
      }).filter(item => item.score > 0).sort((a, b) => b.score - a.score);
      const sortedProducts = scoredProducts.map(x => x.doc);

      // Score and sort streams
      const scoredStreams = mockStreams.map(st => {
        const keywords = generateKeywords({name: st.title, category: st.category, subcategory: st.subcategory});
        const score = tokens.reduce((s, t) => s + (keywords.includes(t) ? 1 : 0), 0);
        return { st, score };
      }).filter(item => item.score > 0).sort((a, b) => {
        const aLive = a.st.status === 'live' ? 1 : 0;
        const bLive = b.st.status === 'live' ? 1 : 0;
        if (aLive !== bLive) return bLive - aLive;
        return b.score - a.score;
      });
      const sortedStreams = scoredStreams.map(x => x.st);
      
      setProductSuggestions(sortedProducts);
      setStreamHints(sortedStreams);
      
      setPopoverOpen(sortedProducts.length > 0 || sortedStreams.length > 0);

    } catch (e) {
      console.error('Search error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runSearch(debouncedQuery);
  }, [debouncedQuery, runSearch]);

  const hasResults = productSuggestions.length > 0 || streamHints.length > 0;

  return (
    <div className="w-full">
      <Popover open={popoverOpen && q.length > 0} onOpenChange={setPopoverOpen}>
        <PopoverAnchor asChild>
            <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    type="search"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search products, brands, and streams..."
                    aria-label="Search products and streams"
                    className="w-full h-12 text-base rounded-full shadow-lg pl-12 pr-12"
                />
                {loading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />}
            </div>
        </PopoverAnchor>
        <PopoverContent className="w-[--radix-popover-trigger-width] mt-2 max-h-[70vh] overflow-y-auto p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
            {hasResults ? (
                <div className="space-y-2">
                    {streamHints.length > 0 && (
                        <div className="p-4">
                            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-primary">
                                <Video className="w-4 h-4"/> Live Streams
                            </h3>
                            <div className="space-y-2">
                                {streamHints.slice(0,3).map(s => (
                                    <Link key={s.id} href={`/stream/${s.id}`} className="flex items-center gap-3 w-full hover:bg-secondary/50 p-2 rounded-md -mx-2">
                                        <Image src={s.thumbnailUrl || '/stream-placeholder.png'} alt={s.title} width={80} height={45} className="w-20 h-auto aspect-video object-cover rounded-md bg-muted" />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium truncate">{s.title}</div>
                                            <div className="text-xs text-muted-foreground">{s.name}</div>
                                        </div>
                                        <Badge variant={s.status === 'live' ? 'destructive' : 'outline'}>{s.status}</Badge>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                    {(streamHints.length > 0 && productSuggestions.length > 0) && <Separator />}
                     {productSuggestions.length > 0 && (
                         <div className="p-4">
                             <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <ShoppingBag className="w-4 h-4"/> Products
                            </h3>
                            <div className="space-y-2">
                                {productSuggestions.slice(0,5).map(p => (
                                    <Link key={p.id} href={`/product/${p.key}`} className="flex items-center gap-3 w-full hover:bg-secondary/50 p-2 rounded-md -mx-2">
                                        <Image src={p.images?.[0] || '/placeholder.png'} alt={p.name} width={48} height={48} className="w-12 h-12 object-cover rounded-md bg-muted" />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium truncate">{p.name}</div>
                                            <div className="text-xs font-bold text-foreground">{p.price}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                     )}
                </div>
            ) : !loading && (
                <div className="text-center py-8 text-muted-foreground">No results found for "{q}"</div>
            )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
