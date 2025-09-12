
import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg" 
      className={cn("w-auto h-8", props.className)} 
      {...props}
      fill="currentColor"
    >
       <path d="M6.65.25A1.75 1.75 0 0 0 4.9 1.999v20.002a1.75 1.75 0 0 0 3.5 0V1.999a1.75 1.75 0 0 0-1.75-1.749Z M17.35.25a1.75 1.75 0 0 0-1.75 1.749v20.002a1.75 1.75 0 1 0 3.5 0V1.999a1.75 1.75 0 0 0-1.75-1.749Z" />
    </svg>
  );
}
