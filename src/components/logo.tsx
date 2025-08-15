
import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';
import { ShoppingCart } from 'lucide-react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className={cn("flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground", props.className)}>
        <ShoppingCart className="w-8 h-8" />
    </div>
  );
}
