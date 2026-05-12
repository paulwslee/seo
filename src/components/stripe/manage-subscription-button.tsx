"use client";

import { useState } from "react";
import { Loader2, Settings } from "lucide-react";

export function ManageSubscriptionButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleManage = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Billing Portal
      }
    } catch (error) {
      console.error("Portal failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleManage}
      disabled={isLoading}
      className="bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border font-semibold py-2.5 px-5 rounded-xl transition-all hover:shadow-md active:scale-95 text-sm flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
      Manage Subscription
    </button>
  );
}
