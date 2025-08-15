
import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export function Logo(props: Omit<React.ComponentProps<typeof Image>, 'src' | 'alt'>) {
  return (
    <Image
      src="/logo.png"
      alt="StreamCart Logo"
      width={100}
      height={100}
      {...props}
      className={cn("w-16 h-16", props.className)}
    />
  );
}
