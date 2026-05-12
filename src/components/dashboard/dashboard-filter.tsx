"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { Filter, Calendar, Globe } from "lucide-react";

export function DashboardFilter({ domains }: { domains: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentDomain = searchParams.get("domain") || "all";
  const currentDate = searchParams.get("date") || "all";
  const currentStart = searchParams.get("start") || "";
  const currentEnd = searchParams.get("end") || "";

  const [isCustom, setIsCustom] = useState(currentDate === "custom");

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    params.set("page", "1"); // Reset page on filter change
    
    if (key === "date") {
      if (value === "custom") {
        setIsCustom(true);
        return; // Wait for user to apply custom dates
      } else {
        setIsCustom(false);
        params.delete("start");
        params.delete("end");
      }
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const applyCustomDate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const start = formData.get("start") as string;
    const end = formData.get("end") as string;
    
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", "custom");
    if (start) params.set("start", start);
    if (end) params.set("end", end);
    params.set("page", "1");
    
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center w-full mb-6 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground font-bold shrink-0">
        <Filter className="w-4 h-4" /> Filters
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        {/* Domain Filter */}
        <div className="flex items-center gap-2 bg-background border border-border/50 rounded-lg px-3 py-1.5 flex-1 min-w-[200px]">
          <Globe className="w-4 h-4 text-emerald-500 shrink-0" />
          <select 
            value={currentDomain} 
            onChange={e => updateFilters("domain", e.target.value)}
            className="bg-transparent border-none w-full outline-none cursor-pointer font-medium"
          >
            <option value="all">All Domains</option>
            {domains.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 bg-background border border-border/50 rounded-lg px-3 py-1.5 flex-1 min-w-[200px]">
          <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
          <select 
            value={currentDate} 
            onChange={e => updateFilters("date", e.target.value)}
            className="bg-transparent border-none w-full outline-none cursor-pointer font-medium"
          >
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
            <option value="custom">Custom Range...</option>
          </select>
        </div>
      </div>

      {isCustom && (
        <form onSubmit={applyCustomDate} className="flex items-center gap-2 w-full md:w-auto bg-background border border-border/50 rounded-lg p-1 shrink-0">
          <input 
            type="date" 
            name="start" 
            defaultValue={currentStart} 
            className="bg-transparent text-xs px-2 py-1 outline-none" 
            required 
          />
          <span className="text-muted-foreground">-</span>
          <input 
            type="date" 
            name="end" 
            defaultValue={currentEnd} 
            className="bg-transparent text-xs px-2 py-1 outline-none" 
            required 
          />
          <button type="submit" className="bg-emerald-500 text-white font-bold px-3 py-1 rounded-md text-xs hover:bg-emerald-600 transition-colors">
            Apply
          </button>
        </form>
      )}
    </div>
  );
}
