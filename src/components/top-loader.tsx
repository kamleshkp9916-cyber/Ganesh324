
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
    setProgress(0);
    setIsVisible(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    const startLoading = () => {
      setIsVisible(true);
      setProgress(10); 
      let currentProgress = 10;
      
      progressInterval = setInterval(() => {
        currentProgress += 5;
        if (currentProgress > 90) {
          // Stay at 90% until navigation completes
        } else {
          setProgress(currentProgress);
        }
      }, 200);
    };

    const stopLoading = () => {
      clearInterval(progressInterval);
      setProgress(100);
      timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setProgress(0), 500);
      }, 500);
    };

    // This is a simplified simulation. For a real app, you would
    // hook into Next.js router events if a library for that becomes available
    // in the app router, or use a more robust solution.
    
    // For now, we simulate loading on any click.
    const handleMouseDown = () => {
      startLoading();
    };

    const handleMouseUp = () => {
      // Small delay to allow navigation to be captured
      setTimeout(() => {
        stopLoading();
      }, 700);
    };
    
    // We are binding to window to capture all clicks.
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [pathname, searchParams]);


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
