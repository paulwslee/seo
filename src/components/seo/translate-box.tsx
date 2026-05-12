"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";

interface TranslateBoxProps {
  originalText: string;
  targetLang?: string;
  className?: string;
}

export function TranslateBox({ originalText, targetLang = "Korean", className = "" }: TranslateBoxProps) {
  const [text, setText] = useState(originalText);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: originalText, targetLang }),
      });
      const data = await res.json();
      if (data.translatedText) {
        setText(data.translatedText);
        setIsTranslated(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTranslating(false);
    }
  };

  if (isTranslated) {
    return <span className={`text-inherit transition-all duration-500 ease-in-out ${className}`}>{text}</span>;
  }

  return (
    <div className={`inline-flex flex-col items-start gap-2 ${className}`}>
      <span className="text-inherit">{text}</span>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleTranslate}
        disabled={isTranslating}
        className="h-7 px-3 text-xs font-bold text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-300 transition-colors cursor-pointer"
      >
        {isTranslating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
        Translate to {targetLang} (Free)
      </Button>
    </div>
  );
}
