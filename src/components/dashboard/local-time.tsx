"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function LocalTime({ dateStr }: { dateStr: string | Date }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with the same structure to avoid layout shift
    return (
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground/80 leading-none">
        <Clock className="w-3.5 h-3.5" />
        <span>Loading...</span>
      </div>
    );
  }

  const date = new Date(dateStr).toLocaleDateString(undefined, { 
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
  });

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground/80 leading-none">
      <Clock className="w-3.5 h-3.5" />
      <span>{date}</span>
    </div>
  );
}
