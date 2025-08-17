
"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // When the path changes, the new page is loaded, so we complete the progress bar.
    if (isVisible) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Reset progress after fade out
        setTimeout(() => setProgress(0), 500);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams, isVisible]);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout | null = null;

    const startLoading = () => {
      setIsVisible(true);
      setProgress(10);
      let currentProgress = 10;
      
      progressInterval = setInterval(() => {
        currentProgress += Math.random() * 10; // More realistic progress
        if (currentProgress > 90) {
          currentProgress = 90; // Stall at 90% until page loads
        }
        setProgress(currentProgress);
      }, 300);
    };

    const handleMouseDown = (event: MouseEvent) => {
        // Start loading on link clicks or button clicks that might navigate
        const target = event.target as HTMLElement;
        if (target.closest('a[href]') || target.closest('button')) {
            startLoading();
        }
    };
    
    window.addEventListener("mousedown", handleMouseDown);

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      window.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);


  return (
    <div
      className={cn(
        "fixed top-0 left-0 w-full z-[9999]",
        "transition-opacity duration-500 ease-out",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      <Progress value={progress} className="h-[3px] rounded-none bg-primary/20" />
    </div>
  );
}
