
export function normalize(text: string | undefined | null): string {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function unique(arr: string[]): string[] {
  return Array.from(new Set(arr.filter(Boolean)));
}

interface ProductForKeywords {
  name?: string;
  brand?: string;
  category?: string;
  subcategory?: string;
  availableSizes?: string;
  availableColors?: string;
  variants?: {
    size?: string;
    color?: string;
  }[];
}

/**
 * Generate keyword tokens from product fields.
 * Keep tokens short and meaningful.
 */
export function generateKeywords(product: ProductForKeywords) {
  const tokens: string[] = [];
  const title = normalize(product.name || '');

  // Add full words
  title.split(' ').forEach(t => {
    if (t.length > 1) tokens.push(t);
  });

  // Add partial words (n-grams) from title for "search-as-you-type"
  title.split(' ').forEach(word => {
    if (word.length > 2) {
      for (let i = 3; i <= word.length; i++) {
        tokens.push(word.substring(0, i));
      }
    }
  });

  // Add other fields
  if (product.brand) tokens.push(normalize(product.brand));
  if (product.category) tokens.push(normalize(product.category));
  if (product.subcategory) tokens.push(normalize(product.subcategory));
  
  if (product.availableSizes) {
    product.availableSizes.split(',').forEach(s => tokens.push(normalize(s)));
  }
  if (product.availableColors) {
    product.availableColors.split(',').forEach(c => tokens.push(normalize(c)));
  }

  (product.variants || []).forEach(v => {
    if (v.size) tokens.push(normalize(v.size));
    if (v.color) tokens.push(normalize(v.color));
  });

  return unique(tokens).slice(0, 100);
}
