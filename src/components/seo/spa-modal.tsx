"use client";

import { Button } from "@/components/ui/button";
import { Code2, Search, X, Zap } from "lucide-react";
import { useTranslations } from "next-intl";

interface SpaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTechAudit: () => void;
}

export function SpaModal({ isOpen, onClose, onTechAudit }: SpaModalProps) {
  const t = useTranslations("Dashboard");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-md bg-card border border-border shadow-2xl rounded-3xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
            <Code2 className="w-10 h-10 text-blue-500" />
          </div>

          <h2 className="text-2xl font-bold mb-2 tracking-tight">
            Single Page App Detected
          </h2>
          <p className="text-muted-foreground mb-8 text-sm leading-relaxed">
            This website is built with a JavaScript framework (SPA). Basic SEO scanners cannot read its content correctly.
          </p>

          <div className="w-full space-y-4 mb-8">
            <div className="flex items-start gap-4 text-left group">
              <div className="mt-0.5 bg-muted p-2 rounded-xl border border-transparent shadow-sm">
                <Search className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Why the low score?</h4>
                <p className="text-xs text-muted-foreground leading-tight">Basic HTML scanners (like Googlebot's first pass) only see a blank page without your content.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 text-left group">
              <div className="mt-0.5 bg-muted p-2 rounded-xl border border-transparent shadow-sm">
                <Zap className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Unlock Deep Scanning</h4>
                <p className="text-xs text-muted-foreground leading-tight">Use Tech Audit to deploy our headless browser engine that renders JavaScript exactly like a human.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col w-full gap-3">
            <Button onClick={onTechAudit} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-2xl cursor-pointer">
              Enable Tech Audit & Rescan
            </Button>
            <button 
              onClick={onClose}
              className="text-sm text-muted-foreground hover:text-foreground font-medium py-2 cursor-pointer transition-colors"
            >
              Continue viewing basic results
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
