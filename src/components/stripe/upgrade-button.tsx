"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function UpgradeButton({ userEmail = "" }: { userEmail?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpgrade = async () => {
    // Check if the user is using a placeholder/fake email (e.g. Kakao fallback)
    const isFakeEmail = !userEmail || (userEmail.endsWith("@kakao.com") && userEmail.split("@")[0].match(/^\d+$/));
    
    if (isFakeEmail) {
      alert("결제 영수증 수신 및 구독 관리를 위해 먼저 실제 사용하시는 이메일을 등록해 주세요.");
      router.push("/dashboard/profile");
      return;
    }

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
