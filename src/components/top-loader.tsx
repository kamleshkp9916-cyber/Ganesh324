
"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

export function TopLoader() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // This effect simulates a loading progression.
    // It starts at 10% and increments slowly, then faster, to give a realistic feel.
    const timer1 = setTimeout(() => setProgress(10), 50);
    const timer2 = setTimeout(() => setProgress(30), 200);
    const timer3 = setTimeout(() => setProgress(90), 500);
    
    // Cleanup timers on component unmount
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full z-[9999]">
      <Progress value={progress} className="h-[3px] rounded-none bg-primary/50" />
    </div>
  );
}
