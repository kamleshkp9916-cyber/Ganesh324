
import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg 
      viewBox="0 0 200 100" 
      xmlns="http://www.w3.org/2000/svg" 
      className={cn("w-16 h-auto", props.className)} 
      {...props}
      style={{
        width: 'auto',
        height: '64px',
        ...props.style
      }}
    >
      <defs>
        <style>
          {`
            .stream-text { font-family: 'Inter', sans-serif; font-size: 40px; font-weight: 800; fill: hsl(var(--destructive)); }
            .cart-text { font-family: 'Inter', sans-serif; font-size: 40px; font-weight: 800; fill: hsl(var(--destructive)); }
            .brush-stroke { fill: #000; }
            .dark .brush-stroke { fill: #fff; }
            .cart-icon { fill: hsl(var(--destructive)); }
          `}
        </style>
      </defs>
      
      <g>
        {/* Brush Stroke */}
        <path className="brush-stroke" d="M10,45 C20,40 180,40 190,45 C180,50 20,50 10,45 Z" transform="skewY(-2) translate(0 -15)"/>
        
        {/* Stream Text */}
        <text x="10" y="40" className="stream-text">Stream</text>
        
        {/* Cart Text */}
        <text x="10" y="80" className="cart-text">Cart</text>

        {/* Shopping Cart Icon */}
        <g className="cart-icon" transform="translate(130, 55) scale(0.08)">
          <path d="M7,2 L5,2 L5,1 C5,0.4 4.6,0 4,0 C3.4,0 3,0.4 3,1 L3,2 L2,2 C1.4,2 1,2.4 1,3 C1,3.6 1.4,4 2,4 L3,4 L3,5 C3,5.6 3.4,6 4,6 C4.6,6 5,5.6 5,5 L5,4 L7,4 C7.6,4 8,3.6 8,3 C8,2.4 7.6,2 7,2 Z"/>
          <path d="M19.1,6.6 L15,6.6 L15,4 C15,1.8 13.2,0 11,0 L4,0 C1.8,0 0,1.8 0,4 L0,11 C0,13.2 1.8,15 4,15 L5,15 C5,16.7 6.3,18 8,18 C9.7,18 11,16.7 11,15 L14,15 C14,16.7 15.3,18 17,18 C18.7,18 20,16.7 20,15 L20,9 C20,7.7 19.4,6.6 19.1,6.6 Z M11,13 L8,13 C6.9,13 6,12.1 6,11 L6,4 C6,2.9 6.9,2 8,2 L11,2 L11,13 Z M17,16 C16.4,16 16,15.6 16,15 C16,14.4 16.4,14 17,14 C17.6,14 18,14.4 18,15 C18,15.6 17.6,16 17,16 Z M8,16 C7.4,16 7,15.6 7,15 C7,14.4 7.4,14 8,14 C8.6,14 9,14.4 9,15 C9,15.6 8.6,16 8,16 Z M18,13 L17,13 C15.9,13 15,12.1 15,11 L15,8.6 C15.6,8.2 16,7.5 16,6.7 L13,6.7 L13,4 C13,2.9 12.1,2 11,2 L13,2 L13,11 C13,12.1 13.9,13 15,13 L16,13 C16.6,13 17,12.6 17,12 L18,12 C18,12.6 18.4,13 19,13 L18,13 Z"/>
        </g>
      </g>
    </svg>
  );
}
