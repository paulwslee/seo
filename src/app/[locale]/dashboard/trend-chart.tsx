"use client";

import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { TrendingUp, Globe } from "lucide-react";

export function TrendChart({ scans, selectedDomain }: { scans: any[], selectedDomain: string }) {
  const chartData = useMemo(() => {
    if (selectedDomain === "all" || !selectedDomain) return [];
    
    // Filter by selected URL, sort by ascending date for chart
    const filtered = scans.filter(s => s.url.includes(selectedDomain));
    let sorted = [...filtered].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    // If only 1 point exists, duplicate it (1 hour ago) to draw a flat line
    if (sorted.length === 1) {
      const single = sorted[0];
      const past = new Date(new Date(single.createdAt).getTime() - 60 * 60 * 1000);
      sorted = [{ ...single, createdAt: past.toISOString() }, single];
    }
    
    return sorted.map(s => {
      const d = new Date(s.createdAt);
      return {
        date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        time: d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        score: s.score || 0,
        fullDate: d.toLocaleString()
      };
    });
  }, [scans, selectedDomain]);

  if (scans.length === 0) return null;

  if (selectedDomain === "all") {
    return (
      <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col gap-4 text-center items-center justify-center min-h-[300px]">
        <TrendingUp className="w-12 h-12 text-muted-foreground/30 mb-2" />
        <h2 className="text-xl font-bold">Performance Trend</h2>
        <p className="text-muted-foreground">Select a specific domain from the Global Filters above to view its historical trend.</p>
      </div>
    );
  }

  return (
    <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" /> Performance Trend: <span className="text-foreground">{selectedDomain}</span>
        </h2>
      </div>

      <div className="w-full h-[250px] mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" opacity={0.1} />
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickMargin={10}
                opacity={0.7}
              />
              <YAxis 
                domain={[0, 100]} 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                opacity={0.7}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-popover text-popover-foreground border border-border shadow-xl rounded-lg p-3">
                        <p className="font-bold text-sm mb-1">{payload[0].payload.fullDate}</p>
                        <p className="text-emerald-500 font-black text-lg">Score: {payload[0].value}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorScore)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: "#10b981" }}
              />
            </AreaChart>
          </ResponsiveContainer>
      </div>
    </div>
  );
}
