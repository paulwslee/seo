"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({ hasNextPage, currentPage }: { hasNextPage: boolean, currentPage: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (currentPage <= 1 && !hasNextPage) return null;

  const navigateTo = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center justify-between bg-card/40 backdrop-blur-md border border-border/50 rounded-xl p-4 shadow-sm mt-6">
      <span className="text-sm text-muted-foreground font-medium">
        Page {currentPage}
      </span>
      <div className="flex gap-2">
        <button 
          onClick={() => navigateTo(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center gap-1 bg-background border border-border hover:bg-muted text-foreground px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>
        <button 
          onClick={() => navigateTo(currentPage + 1)}
          disabled={!hasNextPage}
          className="flex items-center gap-1 bg-background border border-border hover:bg-muted text-foreground px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
