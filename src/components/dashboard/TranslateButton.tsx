"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Languages } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TranslateButton({ scanId, targetLang }: { scanId: string, targetLang: string }) {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleTranslate = async () => {
    setIsTranslating(true);
    setError("");
    try {
      const res = await fetch("/api/translate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId, targetLang })
      });
      
      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (e: any) {
        throw new Error(`Server returned invalid JSON: ${rawText.substring(0, 50)}`);
      }
      
      if (!res.ok) throw new Error(data.error || "Translation failed");
      
      // Reload to show the new language
      router.refresh();
    } catch(err: any) {
      setError(err.message);
      setIsTranslating(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-blue-600 text-white p-3 z-50 flex items-center justify-center gap-4 print:hidden shadow-md">
      <div className="flex items-center gap-2">
        <Languages className="w-5 h-5" />
        <span className="font-semibold text-sm">
          This report's AI Analysis is currently in English. Would you like to translate it to {targetLang.toUpperCase()}?
        </span>
      </div>
      <Button 
        onClick={handleTranslate} 
        disabled={isTranslating}
        variant="secondary"
        size="sm"
        className="font-bold shadow-sm"
      >
        {isTranslating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Translating...</> : `Translate to ${targetLang.toUpperCase()}`}
      </Button>
      {error && <span className="text-red-200 text-xs font-bold">{error}</span>}
    </div>
  );
}
