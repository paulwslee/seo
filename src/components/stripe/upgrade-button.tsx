"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

export function UpgradeButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      }
    } catch (error) {
      console.error("Upgrade failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button 
      onClick={handleUpgrade}
      disabled={isLoading}
      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm flex items-center gap-2 cursor-pointer"
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      Upgrade to Premium
    </button>
  );
}
