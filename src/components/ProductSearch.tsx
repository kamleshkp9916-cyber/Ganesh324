
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { getFirestore, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { getFirestoreDb } from '@/lib/firebase';
import { useDebounce } from '@/hooks/use-debounce';
import { normalize, unique } from '@/lib/generateKeywords';
import { Input } from './ui/input';
import { Popover, PopoverAnchor, PopoverContent } from './ui/popover';
import { Loader2, Search } from 'lucide-react';
import Link from 'next/link';

interface Product {
    id: string;
    name: string;
    keywords: string[];
    [key: string]: any;
}

export default function ProductSearch() {
  const db = getFirestoreDb();
  const [q, setQ] = useState('');
  const debouncedQuery = useDebounce(q, 350);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const tokenize = (text: string): string[] => {
    if (!text || !text.trim()) return [];
    const normalizedText = normalize(text);
    const parts = normalizedText.split(/\s+/).filter(Boolean);
    return unique(parts.concat([normalizedText])).slice(0, 10);
  };
  
  const runSearch = useCallback(async (queryText: string) => {
    if (!queryText || !queryText.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const tokens = tokenize(queryText);

    try {
      const productsRef = collection(db, 'products');
      // Firestore 'array-contains-any' supports up to 10 elements in the array
      const qRef = query(productsRef, where('keywords', 'array-contains-any', tokens.slice(0, 10)), limit(50));
      const snap = await getDocs(qRef);
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));

      // Basic client-side score: prefer docs with more matching tokens
      const scored = docs.map(doc => {
        const k = (doc.keywords || []).map(x => String(x).toLowerCase());
        const score = tokens.reduce((s, t) => s + (k.includes(t) ? 1 : 0), 0);
        return { doc, score };
      }).sort((a, b) => b.score - a.score);

      const sorted = scored.map(x => x.doc);

      setSuggestions(sorted.slice(0, 6));
    } catch (e) {
      console.error('Search error', e);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    runSearch(debouncedQuery);
  }, [debouncedQuery, runSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // This is where you would navigate to a full search results page
      // For now, we'll just log it.
      console.log("Submitting search for:", q);
  };

  return (
    <div className="relative w-full">
      <Popover open={suggestions.length > 0} onOpenChange={(open) => {if(!open) setSuggestions([])}}>
        <PopoverAnchor asChild>
          <form className="relative w-full" onSubmit={handleSearchSubmit}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search products, sizes or colors..."
              aria-label="Search products"
              className="w-full pl-10 pr-10 rounded-full"
            />
            {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-muted-foreground" />}
          </form>
        </PopoverAnchor>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
            {suggestions.map(suggestion => (
                <Link 
                    key={suggestion.id} 
                    href={`/product/${suggestion.id}`} 
                    className="block p-2 hover:bg-accent cursor-pointer text-sm"
                    onClick={() => {
                        setQ('');
                        setSuggestions([]);
                    }}
                >
                    {suggestion.name}
                </Link>
            ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}
